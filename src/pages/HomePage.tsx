import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Trophy, TrendingUp } from 'lucide-react';
import TopicCard from '../components/common/TopicCard';
import TTSButton from '../components/common/TTSButton';
import { useTopicStore } from '../stores/topicStore';
import { useProgressStore } from '../stores/progressStore';
import { mockDailyWord } from '../mock/data';
import './HomePage.css';

export default function HomePage() {
    const { topics, fetchTopics } = useTopicStore();
    const { streak, totalWordsLearned, progress } = useProgressStore();

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const featuredTopics = topics.slice(0, 3);
    const completedLessons = progress.filter((p) => p.completed).length;

    return (
        <div className="page home-page">
            {/* Hero Section */}
            <section className="hero" id="hero-section">
                <div className="container">
                    <div className="hero__bg-chars">
                        <span>學</span><span>中</span><span>文</span>
                    </div>
                    <motion.div
                        className="hero__content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="hero__badge">
                            <Sparkles size={14} />
                            <span>Traditional Chinese · 繁體中文</span>
                        </div>
                        <h1 className="hero__title">
                            Learn <span className="hero__title-accent">Chinese</span>
                            <br />
                            <span className="hero__title-chinese chinese-text">學中文的旅程</span>
                        </h1>
                        <p className="hero__subtitle">
                            Master Traditional Chinese with interactive lessons, beautiful flashcards,
                            and engaging exercises designed for Taiwan's writing system.
                        </p>
                        <div className="hero__actions">
                            <Link to="/topics" className="hero__cta-primary" id="start-learning-btn">
                                Start Learning
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/review" className="hero__cta-secondary" id="review-btn">
                                Review Cards
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="stats-bar">
                <div className="container">
                    <motion.div
                        className="stats-bar__grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="stat-item">
                            <BookOpen size={20} className="stat-item__icon" />
                            <div className="stat-item__value">{completedLessons}</div>
                            <div className="stat-item__label">Lessons Done</div>
                        </div>
                        <div className="stat-item">
                            <Trophy size={20} className="stat-item__icon stat-item__icon--gold" />
                            <div className="stat-item__value">{totalWordsLearned}</div>
                            <div className="stat-item__label">Words Learned</div>
                        </div>
                        <div className="stat-item">
                            <TrendingUp size={20} className="stat-item__icon stat-item__icon--coral" />
                            <div className="stat-item__value">{streak}</div>
                            <div className="stat-item__label">Day Streak 🔥</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Daily Word */}
            <section className="daily-word-section">
                <div className="container">
                    <motion.div
                        className="daily-word"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        id="daily-word"
                    >
                        <div className="daily-word__header">
                            <span className="daily-word__badge">✨ Word of the Day</span>
                        </div>
                        <div className="daily-word__content">
                            <div className="daily-word__character chinese-text">
                                {mockDailyWord.character}
                            </div>
                            <div className="daily-word__annotations">
                                <span className="annotation annotation--pinyin">{mockDailyWord.pinyin}</span>
                                <span className="annotation annotation--zhuyin">{mockDailyWord.zhuyin}</span>
                            </div>
                            <div className="daily-word__meaning">{mockDailyWord.meaning}</div>
                            <TTSButton text={mockDailyWord.character} size="lg" />
                        </div>
                        <div className="daily-word__example">
                            <span className="daily-word__example-cn chinese-text">
                                {mockDailyWord.exampleSentence}
                            </span>
                            <span className="daily-word__example-en">
                                {mockDailyWord.exampleTranslation}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Topics */}
            <section className="featured-topics">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-header__title">Featured Topics</h2>
                        <Link to="/topics" className="section-header__link">
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="featured-topics__grid">
                        {featuredTopics.map((topic, i) => (
                            <TopicCard key={topic.id} topic={topic} index={i} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
