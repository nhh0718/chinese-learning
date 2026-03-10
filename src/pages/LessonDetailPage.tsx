import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Lightbulb, Play } from 'lucide-react';
import VocabularyCard from '../components/lesson/VocabularyCard';
import SentenceDisplay from '../components/lesson/SentenceDisplay';
import { useLessonStore } from '../stores/lessonStore';
import { useTopicStore } from '../stores/topicStore';
import './LessonDetailPage.css';

export default function LessonDetailPage() {
    const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const { currentLesson, fetchLesson, isLoading } = useLessonStore();
    const { selectedTopic, selectTopic, fetchLessons, topicLessons } = useTopicStore();

    useEffect(() => {
        if (topicId && lessonId) {
            fetchLesson(topicId, lessonId);
            selectTopic(topicId);
            fetchLessons(topicId);
        }
    }, [topicId, lessonId, fetchLesson, selectTopic, fetchLessons]);

    if (isLoading) {
        return (
            <div className="page lesson-page">
                <div className="container">
                    <div className="lesson-page__loading">
                        <div className="skeleton-card animate-shimmer" style={{ height: 200 }} />
                        <div className="skeleton-card animate-shimmer" style={{ height: 120 }} />
                        <div className="skeleton-card animate-shimmer" style={{ height: 120 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="page lesson-page">
                <div className="container">
                    <div className="lesson-page__not-found">
                        <p>Lesson not found</p>
                        <Link to="/topics">Back to Topics</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page lesson-page">
            <div className="container container--narrow">
                {/* Header */}
                <motion.div
                    className="lesson-page__header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button className="lesson-page__back" onClick={() => navigate(`/topics/${topicId}`)}>
                        <ArrowLeft size={18} />
                        <span>{selectedTopic?.title || 'Back'}</span>
                    </button>
                    <div className="lesson-page__title-wrap">
                        <h1 className="lesson-page__title chinese-text">{currentLesson.title}</h1>
                        <p className="lesson-page__desc">{currentLesson.description}</p>
                    </div>
                    {selectedTopic && (
                        <span className="lesson-page__badge" style={{ background: `color-mix(in srgb, ${selectedTopic.color} 15%, transparent)`, color: selectedTopic.color }}>
                            {selectedTopic.icon} {selectedTopic.subtitle}
                        </span>
                    )}
                </motion.div>

                {/* Vocabulary Section */}
                <section className="lesson-section" id="vocabulary-section">
                    <div className="lesson-section__header">
                        <BookOpen size={20} className="lesson-section__icon" />
                        <h2 className="lesson-section__title">Vocabulary</h2>
                        <span className="lesson-section__count">{currentLesson.vocabulary.length} words</span>
                    </div>
                    <div className="lesson-page__vocab-grid">
                        {currentLesson.vocabulary.map((vocab, i) => (
                            <VocabularyCard key={vocab.id} vocab={vocab} index={i} />
                        ))}
                    </div>
                </section>

                {/* Sentences Section */}
                <section className="lesson-section" id="sentences-section">
                    <div className="lesson-section__header">
                        <BookOpen size={20} className="lesson-section__icon" />
                        <h2 className="lesson-section__title">Sentences</h2>
                    </div>
                    <div className="lesson-page__sentences">
                        {currentLesson.sentences.map((sentence) => (
                            <SentenceDisplay key={sentence.id} sentence={sentence} />
                        ))}
                    </div>
                </section>

                {/* Cultural Note */}
                {currentLesson.culturalNote && (
                    <motion.section
                        className="lesson-section lesson-section--cultural"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        id="cultural-note"
                    >
                        <div className="lesson-section__header">
                            <Lightbulb size={20} className="lesson-section__icon lesson-section__icon--gold" />
                            <h2 className="lesson-section__title">Cultural Note</h2>
                        </div>
                        <div className="lesson-page__cultural-note">
                            {currentLesson.culturalNote}
                        </div>
                    </motion.section>
                )}

                {/* Exercise CTA */}
                {currentLesson.exercises.length > 0 && (
                    <motion.div
                        className="lesson-page__exercise-cta"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link
                            to={`/topics/${topicId}/lessons/${lessonId}/exercises`}
                            className="lesson-page__exercise-btn"
                            id="start-exercises-btn"
                        >
                            <Play size={20} />
                            <span>Start Exercises ({currentLesson.exercises.length} questions)</span>
                        </Link>
                    </motion.div>
                )}

                {/* Other Lessons */}
                {topicLessons.length > 1 && (
                    <section className="lesson-section">
                        <div className="lesson-section__header">
                            <h2 className="lesson-section__title">Other Lessons</h2>
                        </div>
                        <div className="lesson-page__other-lessons">
                            {topicLessons
                                .filter((l) => l.id !== lessonId)
                                .map((lesson) => (
                                    <Link
                                        key={lesson.id}
                                        to={`/topics/${topicId}/lessons/${lesson.id}`}
                                        className="lesson-page__other-lesson"
                                    >
                                        <span className="chinese-text">{lesson.title}</span>
                                        <span className="lesson-page__other-lesson-desc">{lesson.description}</span>
                                    </Link>
                                ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
