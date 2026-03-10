import { motion } from 'framer-motion';
import { BookOpen, Trophy, TrendingUp, Calendar, Star } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useTopicStore } from '../stores/topicStore';
import { useEffect } from 'react';
import './ProgressPage.css';

export default function ProgressPage() {
    const { progress, streak, totalWordsLearned } = useProgressStore();
    const { topics, fetchTopics } = useTopicStore();

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const completedLessons = progress.filter((p) => p.completed).length;
    const averageScore =
        progress.length > 0
            ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
            : 0;

    return (
        <div className="page progress-page">
            <div className="container container--narrow">
                <div className="progress-page__header">
                    <h1 className="progress-page__title">
                        Your Progress
                        <span className="progress-page__title-cn chinese-text">學習進度</span>
                    </h1>
                </div>

                {/* Stats Grid */}
                <motion.div
                    className="progress-stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="progress-stat-card">
                        <TrendingUp size={24} className="progress-stat-card__icon" style={{ color: 'var(--color-accent-coral)' }} />
                        <div className="progress-stat-card__value">{streak}</div>
                        <div className="progress-stat-card__label">Day Streak 🔥</div>
                    </div>
                    <div className="progress-stat-card">
                        <BookOpen size={24} className="progress-stat-card__icon" style={{ color: 'var(--color-accent-jade)' }} />
                        <div className="progress-stat-card__value">{completedLessons}</div>
                        <div className="progress-stat-card__label">Lessons Done</div>
                    </div>
                    <div className="progress-stat-card">
                        <Trophy size={24} className="progress-stat-card__icon" style={{ color: 'var(--color-accent-gold)' }} />
                        <div className="progress-stat-card__value">{totalWordsLearned}</div>
                        <div className="progress-stat-card__label">Words Learned</div>
                    </div>
                    <div className="progress-stat-card">
                        <Star size={24} className="progress-stat-card__icon" style={{ color: 'var(--color-info)' }} />
                        <div className="progress-stat-card__value">{averageScore}%</div>
                        <div className="progress-stat-card__label">Avg. Score</div>
                    </div>
                </motion.div>

                {/* Topic Progress */}
                <section className="topic-progress-section">
                    <h2 className="topic-progress-section__title">
                        <Calendar size={20} />
                        Topic Progress
                    </h2>
                    {topics.length === 0 ? (
                        <p className="topic-progress-section__empty">
                            Start learning to see your progress!
                        </p>
                    ) : (
                        <div className="topic-progress-list">
                            {topics.map((topic, i) => {
                                const topicProgress = progress.filter((p) => p.topicId === topic.id);
                                const completed = topicProgress.filter((p) => p.completed).length;
                                const percent = topic.lessonCount > 0 ? Math.round((completed / topic.lessonCount) * 100) : 0;

                                return (
                                    <motion.div
                                        key={topic.id}
                                        className="topic-progress-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="topic-progress-item__icon">{topic.icon}</div>
                                        <div className="topic-progress-item__body">
                                            <div className="topic-progress-item__header">
                                                <span className="topic-progress-item__name chinese-text">{topic.title}</span>
                                                <span className="topic-progress-item__subtitle">{topic.subtitle}</span>
                                            </div>
                                            <div className="topic-progress-item__bar">
                                                <div
                                                    className="topic-progress-item__fill"
                                                    style={{
                                                        width: `${percent}%`,
                                                        background: topic.color || 'var(--color-accent-jade)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="topic-progress-item__percent">{percent}%</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Recent Activity */}
                {progress.length > 0 && (
                    <section className="recent-activity-section">
                        <h2 className="recent-activity-section__title">Recent Activity</h2>
                        <div className="recent-activity-list">
                            {progress
                                .slice()
                                .sort((a, b) => new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime())
                                .slice(0, 5)
                                .map((item) => (
                                    <div key={item.lessonId} className="recent-activity-item">
                                        <div className={`recent-activity-item__status ${item.completed ? 'recent-activity-item__status--complete' : ''}`} />
                                        <div className="recent-activity-item__body">
                                            <span className="recent-activity-item__lesson">{item.lessonId}</span>
                                            <span className="recent-activity-item__score">Score: {item.score}%</span>
                                        </div>
                                        <span className="recent-activity-item__date">
                                            {new Date(item.lastStudied).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
