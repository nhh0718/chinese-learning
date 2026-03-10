import express from 'express';
import Lesson from '../models/Lesson';
import Vocabulary from '../models/Vocabulary';
import Sentence from '../models/Sentence';
import Exercise from '../models/Exercise';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/v1/lessons/:id - Get lesson details with vocabulary
router.get('/:id', async (req, res) => {
    try {
        // Populate vocabulary_refs to return full dictionary objects
        const lesson: any = await Lesson.findById(req.params.id).populate('vocabulary_refs');
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const sentences = await Sentence.find({ lesson_id: lesson._id });
        const exercises = await Exercise.find({ lesson_id: lesson._id });
        
        res.json({
            ...lesson.toObject(),
            sentences,
            exercises
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
