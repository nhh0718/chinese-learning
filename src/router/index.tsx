import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import TopicCatalogPage from '../pages/TopicCatalogPage';
import TopicDetailPage from '../pages/TopicDetailPage';
import LessonDetailPage from '../pages/LessonDetailPage';
import ExercisePage from '../pages/ExercisePage';
import ReviewPage from '../pages/ReviewPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import FlashcardSessionPage from '../pages/FlashcardSessionPage';
import WordListPage from '../pages/WordListPage';
import ReviewAnalyticsPage from '../pages/ReviewAnalyticsPage';
import ProgressPage from '../pages/ProgressPage';
import TelegramPage from '../pages/TelegramPage';
import DailyQuizPage from '../pages/DailyQuizPage';
import MockTestListPage from '../pages/MockTestListPage';
import MockTestSessionPage from '../pages/MockTestSessionPage';
import MockTestResultPage from '../pages/MockTestResultPage';
import MockTestHistoryPage from '../pages/MockTestHistoryPage';
import AchievementsPage from '../pages/AchievementsPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'topics', element: <TopicCatalogPage /> },
            { path: 'topics/:topicId', element: <TopicDetailPage /> },
            { path: 'topics/:topicId/lessons/:lessonId', element: <LessonDetailPage /> },
            { path: 'topics/:topicId/lessons/:lessonId/exercises', element: <ExercisePage /> },
            { path: 'review', element: <ReviewPage /> },
            { path: 'flashcards', element: <FlashcardsPage /> },
            { path: 'flashcards/session', element: <FlashcardSessionPage /> },
            { path: 'word-list', element: <WordListPage /> },
            { path: 'analytics', element: <ReviewAnalyticsPage /> },
            { path: 'mock-tests', element: <MockTestListPage /> },
            { path: 'mock-tests/history', element: <MockTestHistoryPage /> },
            { path: 'mock-tests/:testId', element: <MockTestSessionPage /> },
            { path: 'mock-tests/:testId/result', element: <MockTestResultPage /> },
            { path: 'achievements', element: <AchievementsPage /> },
            { path: 'leaderboard', element: <LeaderboardPage /> },
            { path: 'progress', element: <ProgressPage /> },
            { path: 'telegram', element: <TelegramPage /> },
            { path: 'quiz', element: <DailyQuizPage /> },
            { path: 'quiz/:date', element: <DailyQuizPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
]);
