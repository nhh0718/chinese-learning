import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import TopicCatalogPage from '../pages/TopicCatalogPage';
import TopicDetailPage from '../pages/TopicDetailPage';
import LessonDetailPage from '../pages/LessonDetailPage';
import ExercisePage from '../pages/ExercisePage';
import ReviewPage from '../pages/ReviewPage';
import ProgressPage from '../pages/ProgressPage';
import TelegramPage from '../pages/TelegramPage';
import DailyQuizPage from '../pages/DailyQuizPage';
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
            { path: 'progress', element: <ProgressPage /> },
            { path: 'telegram', element: <TelegramPage /> },
            { path: 'quiz', element: <DailyQuizPage /> },
            { path: 'quiz/:date', element: <DailyQuizPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
]);
