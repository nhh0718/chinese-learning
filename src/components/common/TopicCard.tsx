import { Link } from 'react-router-dom';
import { ChevronRight, Hand, Hash, UtensilsCrossed, Sun, Plane, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Topic } from '../../types';
import './TopicCard.css';

const TOPIC_ICONS: Record<string, React.ReactNode> = {
    greetings: <Hand size={26} />,
    numbers: <Hash size={26} />,
    food: <UtensilsCrossed size={26} />,
    'daily-life': <Sun size={26} />,
    travel: <Plane size={26} />,
    shopping: <ShoppingBag size={26} />,
};

interface TopicCardProps {
    topic: Topic;
    progress?: number;
    index?: number;
}

export default function TopicCard({ topic, progress = 0, index = 0 }: TopicCardProps) {
    const icon = TOPIC_ICONS[topic.id];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
        >
            <Link
                to={`/topics/${topic.id}`}
                className="topic-card"
                id={`topic-${topic.id}`}
                style={{ '--topic-color': topic.color || 'var(--color-accent-jade)' } as React.CSSProperties}
            >
                <div className="topic-card__icon-wrap">
                    {icon || <Hash size={26} />}
                </div>
                <div className="topic-card__body">
                    <h3 className="topic-card__title chinese-text--serif">{topic.title}</h3>
                    <p className="topic-card__subtitle">{topic.subtitle}</p>
                    <p className="topic-card__desc">{topic.description}</p>
                    <div className="topic-card__meta">
                        <span className="topic-card__lesson-count">{topic.lessonCount} lessons</span>
                        {progress > 0 && (
                            <div className="topic-card__progress">
                                <div className="topic-card__progress-bar">
                                    <div
                                        className="topic-card__progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="topic-card__progress-text">{progress}%</span>
                            </div>
                        )}
                    </div>
                </div>
                <ChevronRight className="topic-card__arrow" size={20} />
            </Link>
        </motion.div>
    );
}
