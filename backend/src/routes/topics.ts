import express from 'express';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';

const router = express.Router();

// GET /api/v1/topics - List all topics
router.get('/', async (req, res) => {
    try {
        const query: any = {};
        if (req.query.standard) {
            query.standard = req.query.standard;
        }
        
        const topics = await Topic.find(query).sort({ level: 1, createdAt: 1 });

        // Calculate lesson counts for each topic
        const topicsWithCounts = await Promise.all(topics.map(async (topic) => {
            const lessonCount = await Lesson.countDocuments({ topic_id: topic._id });
            return {
                ...topic.toObject(),
                lessonCount
            };
        }));

        res.json(topicsWithCounts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/topics/:id - Get topic details
router.get('/:id', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/topics/:id/lessons - List lessons for a topic
router.get('/:id/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find({ topic_id: req.params.id }).sort({ order: 1 });
        res.json(lessons);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
