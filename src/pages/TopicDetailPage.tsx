import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Hand, Hash, UtensilsCrossed, Sun, Plane, ShoppingBag } from 'lucide-react';
import { useTopicStore } from '../stores/topicStore';
import { useProgressStore } from '../stores/progressStore';
import './TopicDetailPage.css';

const TOPIC_ICONS: Record<string, React.ReactNode> = {
    greetings: <Hand size={32} />,
    numbers: <Hash size={32} />,
    food: <UtensilsCrossed size={32} />,
    'daily-life': <Sun size={32} />,
    travel: <Plane size={32} />,
    shopping: <ShoppingBag size={32} />,
};

export default function TopicDetailPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const { selectedTopic, selectTopic, topicLessons, fetchLessons, isLoading } = useTopicStore();
    const { getLessonProgress } = useProgressStore();

    useEffect(() => {
        if (topicId) {
            selectTopic(topicId);
            fetchLessons(topicId);
        }
    }, [topicId, selectTopic, fetchLessons]);

    if (!selectedTopic) {
        return (
            <div className="page">
                <div className="container">
                    <p>Topic not found.</p>
                    <Link to="/topics">Back to Topics</Link>
                </div>
            </div>
        );
    }

    const icon = TOPIC_ICONS[selectedTopic.id];

    return (
        <div className="page topic-detail-page">
            <div className="container container--narrow">
                <Link to="/topics" className="topic-detail-page__back">
                    <ArrowLeft size={18} />
                    <span>All Topics</span>
                </Link>

                <motion.div
                    className="topic-detail-page__header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ '--topic-color': selectedTopic.color } as React.CSSProperties}
                >
                    <div className="topic-detail-page__icon-wrap">
                        {icon || <Hash size={32} />}
                    </div>
                    <div>
                        <h1 className="topic-detail-page__title chinese-text--serif">{selectedTopic.title}</h1>
                        <p className="topic-detail-page__subtitle">{selectedTopic.subtitle}</p>
                        <p className="topic-detail-page__desc">{selectedTopic.description}</p>
                    </div>
                </motion.div>

                <div className="topic-detail-page__lessons-header">
                    <BookOpen size={20} />
                    <h2>Lessons</h2>
                    <span className="topic-detail-page__lessons-count">{topicLessons.length} lessons</span>
                </div>

                {isLoading ? (
                    <div className="topic-detail-page__loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-card animate-shimmer" style={{ height: 80 }} />
                        ))}
                    </div>
                ) : (
                    <div className="topic-detail-page__lessons">
                        {topicLessons.map((lesson, i) => {
                            const progress = getLessonProgress(lesson.id);
                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        to={`/topics/${topicId}/lessons/${lesson.id}`}
                                        className="lesson-list-item"
                                        id={`lesson-${lesson.id}`}
                                    >
                                        <div className="lesson-list-item__number">{lesson.order}</div>
                                        <div className="lesson-list-item__body">
                                            <h3 className="lesson-list-item__title chinese-text--serif">{lesson.title}</h3>
                                            <p className="lesson-list-item__desc">{lesson.description}</p>
                                            <div className="lesson-list-item__meta">
                                                <span>{lesson.vocabulary.length} words</span>
                                                <span>·</span>
                                                <span>{lesson.exercises.length} exercises</span>
                                            </div>
                                        </div>
                                        {progress?.completed && (
                                            <CheckCircle size={20} className="lesson-list-item__check" />
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && topicLessons.length === 0 && (
                    <div className="topic-detail-page__empty">
                        <BookOpen size={48} className="topic-detail-page__empty-icon" />
                        <p>Lessons coming soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
