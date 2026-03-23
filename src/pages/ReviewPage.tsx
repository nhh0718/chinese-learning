import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Loader2 } from 'lucide-react';
import TTSButton from '../components/common/TTSButton';
import { useReviewStore, syncOfflineGrades } from '../stores/reviewStore';
import { useAuthStore } from '../stores/authStore';
import type { FSRSGrade } from '../types';
import './ReviewPage.css';

// FSRS grade buttons config
const GRADE_BUTTONS: { grade: FSRSGrade; label: string; labelVi: string; className: string }[] = [
  { grade: 1, label: 'Again', labelVi: 'Lại', className: 'review-grade--again' },
  { grade: 2, label: 'Hard', labelVi: 'Khó', className: 'review-grade--hard' },
  { grade: 3, label: 'Good', labelVi: 'Tốt', className: 'review-grade--good' },
  { grade: 4, label: 'Easy', labelVi: 'Dễ', className: 'review-grade--easy' },
];

export default function ReviewPage() {
  const { dueCards, currentIndex, stats, isLoading, isGrading, error, fetchDueCards, initCards, gradeCard, fetchStats, reset } = useReviewStore();
  const { token } = useAuthStore();
  const [isFlipped, setIsFlipped] = useState(false);

  // Fetch due cards on mount
  useEffect(() => {
    if (!token) return;
    syncOfflineGrades();
    initCards().then(() => {
      fetchDueCards();
      fetchStats();
    });
    return () => reset();
  }, [token]);

  const currentCard = dueCards[currentIndex];
  const remaining = dueCards.length - currentIndex;
  const reviewed = currentIndex;
  const isDone = currentIndex >= dueCards.length && dueCards.length > 0;
  const isEmpty = !isLoading && dueCards.length === 0;

  const handleGrade = async (grade: FSRSGrade) => {
    if (!currentCard || isGrading) return;
    setIsFlipped(false);
    // Small delay for flip animation before advancing
    setTimeout(() => {
      gradeCard(currentCard.vocabularyId, grade);
    }, 150);
  };

  const handleRestart = () => {
    reset();
    fetchDueCards();
    fetchStats();
  };

  // Not authenticated
  if (!token) {
    return (
      <div className="page review-page">
        <div className="container container--narrow">
          <div className="review-empty">
            <h2>Đăng nhập để ôn tập</h2>
            <p>Please log in to start reviewing vocabulary.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page review-page">
      <div className="container container--narrow">
        <div className="review-page__header">
          <h1 className="review-page__title">
            Flashcard Review
            <span className="review-page__title-cn chinese-text">複習</span>
          </h1>
          <p className="review-page__desc">
            Grade each card to schedule optimal review intervals.
          </p>
        </div>

        {/* Stats */}
        <div className="review-stats">
          <div className="review-stats__item review-stats__item--remaining">
            <span className="review-stats__value">{remaining}</span>
            <span className="review-stats__label">Due</span>
          </div>
          <div className="review-stats__item review-stats__item--known">
            <span className="review-stats__value">{reviewed}</span>
            <span className="review-stats__label">Reviewed</span>
          </div>
          <div className="review-stats__item review-stats__item--unknown">
            <span className="review-stats__value">{stats?.reviewedToday ?? 0}</span>
            <span className="review-stats__label">Today</span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="review-loading">
            <Loader2 className="review-loading__spinner" size={32} />
            <p>Loading review cards...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="review-error">
            <p>Error: {error}</p>
            <button onClick={handleRestart}>Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !error && (
          <motion.div
            className="review-done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>All caught up! 🎉</h2>
            <p>No cards due for review right now.</p>
            {stats && (
              <p className="review-done__stats">
                {stats.total} cards total · {stats.reviewedToday} reviewed today
              </p>
            )}
          </motion.div>
        )}

        {/* Done state */}
        {isDone && (
          <motion.div
            className="review-done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>Review Complete! 🎉</h2>
            <p>You reviewed {reviewed} cards this session.</p>
            <button className="review-done__restart" onClick={handleRestart}>
              <RotateCcw size={18} />
              <span>Check for More</span>
            </button>
          </motion.div>
        )}

        {/* Active card */}
        {!isLoading && !isDone && !isEmpty && currentCard && (
          <>
            {/* Progress bar */}
            <div className="review-progress">
              <div
                className="review-progress__bar"
                style={{ width: `${dueCards.length > 0 ? (reviewed / dueCards.length) * 100 : 0}%` }}
              />
            </div>

            {/* Flashcard */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className={`review-card ${isFlipped ? 'review-card--flipped' : ''}`}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: 1200 }}
              >
                <div className="review-card__inner">
                  {/* Front */}
                  <div className="review-card__face review-card__front">
                    <div className="review-card__state-badge">{currentCard.state}</div>
                    <div className="review-card__character chinese-text">
                      {currentCard.character}
                    </div>
                    <div className="review-card__annotations">
                      <span className="annotation annotation--pinyin">{currentCard.pinyin}</span>
                      {currentCard.zhuyin && (
                        <span className="annotation annotation--zhuyin">{currentCard.zhuyin}</span>
                      )}
                    </div>
                    <TTSButton text={currentCard.character} size="lg" />
                    <span className="review-card__hint">Tap to reveal meaning</span>
                  </div>

                  {/* Back */}
                  <div className="review-card__face review-card__back">
                    <div className="review-card__meaning">{currentCard.meaning}</div>
                    <div className="review-card__character-small chinese-text">
                      {currentCard.character}
                    </div>
                    {currentCard.hanViet && (
                      <div className="review-card__han-viet">
                        Hán Việt: {currentCard.hanViet}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* FSRS Grade Buttons */}
            <div className="review-grades">
              {GRADE_BUTTONS.map(({ grade, label, labelVi, className }) => (
                <button
                  key={grade}
                  className={`review-grades__btn ${className}`}
                  onClick={() => handleGrade(grade)}
                  disabled={isGrading}
                >
                  <span className="review-grades__label">{label}</span>
                  <span className="review-grades__label-vi">{labelVi}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
