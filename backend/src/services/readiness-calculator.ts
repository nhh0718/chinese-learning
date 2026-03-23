import VocabularyProgress from '../models/VocabularyProgress';
import Vocabulary from '../models/Vocabulary';
import MockTestResult from '../models/MockTestResult';
import mongoose from 'mongoose';

/**
 * Calculate readiness percentage for a given HSK level.
 * Formula: readiness = (vocabMastery * 0.6) + (avgTestScore * 0.4)
 */
export async function calculateReadiness(
  userId: mongoose.Types.ObjectId,
  level: number
): Promise<{ readiness: number; vocabMastery: number; avgTestScore: number; totalVocab: number; masteredVocab: number }> {
  // Get vocabulary IDs for this HSK level
  const levelVocab = await Vocabulary.find({ hsk_level: level }).select('_id').lean();
  const totalVocab = levelVocab.length;

  if (totalVocab === 0) {
    return { readiness: 0, vocabMastery: 0, avgTestScore: 0, totalVocab: 0, masteredVocab: 0 };
  }

  const vocabIds = levelVocab.map(v => v._id);

  // Count mastered vocab (state = 'Review' means successfully learned)
  const masteredCount = await VocabularyProgress.countDocuments({
    user_id: userId,
    vocabulary_id: { $in: vocabIds },
    state: { $in: ['Review'] }
  });

  const vocabMastery = (masteredCount / totalVocab) * 100;

  // Get average test score for this level
  const testResults = await MockTestResult.find({
    user_id: userId
  })
    .populate({ path: 'test_id', select: 'level', match: { level } })
    .lean();

  const levelResults = testResults.filter((r: any) => r.test_id !== null);
  const avgTestScore = levelResults.length > 0
    ? levelResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / levelResults.length
    : 0;

  const readiness = Math.round((vocabMastery * 0.6) + (avgTestScore * 0.4));

  return {
    readiness: Math.min(100, readiness),
    vocabMastery: Math.round(vocabMastery),
    avgTestScore: Math.round(avgTestScore),
    totalVocab,
    masteredVocab: masteredCount
  };
}
