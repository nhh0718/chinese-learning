import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import topicRoutes from './routes/topics';
import lessonRoutes from './routes/lessons';
import vocabularyRoutes from './routes/vocabulary';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import telegramRoutes from './routes/telegram';

app.use('/api/v1/topics', topicRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/vocabulary', vocabularyRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/telegram', telegramRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Learn Chinese API is running...');
});

const PORT = process.env.PORT || 5000;

// Initialize Telegram Bot (only if token is provided)
if (process.env.TELEGRAM_BOT_TOKEN) {
    import('./telegram/index').then(({ initializeTelegramBot }) => {
        initializeTelegramBot();
        console.log('[App] Telegram bot initialized');
    }).catch(err => {
        console.error('[App] Failed to initialize Telegram bot:', err);
    });
} else {
    console.log('[App] TELEGRAM_BOT_TOKEN not found, skipping bot initialization');
}

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
