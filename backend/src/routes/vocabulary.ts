import express from 'express';
import Vocabulary from '../models/Vocabulary';

const router = express.Router();

// GET /api/v1/vocabulary/search - Search dictionary by Character, Pinyin, or Meaning
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.json([]);

        // Create a flexible search query
        // This looks for matches in traditional characters, simplified characters, pinyin, or vietnamese meaning
        const searchRegex = new RegExp(query, 'i');
        const results = await Vocabulary.find({
            $or: [
                { traditional: searchRegex },
                { simplified: searchRegex },
                { pinyin: searchRegex },
                { meaning_vi: searchRegex },
                { han_viet: searchRegex }
            ]
        }).limit(50); // Limit results for performance

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/v1/vocabulary/:id - Get detailed dictionary entry
router.get('/:id', async (req, res) => {
    try {
        const vocabularyItem = await Vocabulary.findById(req.params.id);
        if (!vocabularyItem) return res.status(404).json({ message: 'Vocabulary not found' });
        res.json(vocabularyItem);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
