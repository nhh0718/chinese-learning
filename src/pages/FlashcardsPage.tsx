import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Zap, FileText } from 'lucide-react';
import { useReviewStore } from '../stores/reviewStore';
import { useAuthStore } from '../stores/authStore';
import type { FlashcardMode } from '../stores/flashcardStore';
import './FlashcardsPage.css';

const MODES: { mode: FlashcardMode; icon: typeof BookOpen; title: string; titleVi: string; desc: string; color: string }[] = [
  { mode: 'learn', icon: BookOpen, title: 'Learn New', titleVi: 'Học mới', desc: 'Study new vocabulary cards', color: 'var(--color-accent-jade)' },
  { mode: 'review', icon: Clock, title: 'Daily Review', titleVi: 'Ôn tập', desc: 'Review due SRS cards', color: 'var(--color-accent-gold)' },
  { mode: 'quick', icon: Zap, title: 'Quick Review', titleVi: 'Ôn nhanh', desc: '15 random cards, fast practice', color: '#3b82f6' },
  { mode: 'cram', icon: FileText, title: 'Exam Cram', titleVi: 'Luyện thi', desc: 'Intensive review for exams', color: '#8b5cf6' },
];

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { stats, fetchStats } = useReviewStore();

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const handleStart = (mode: FlashcardMode) => {
    navigate(`/flashcards/session?mode=${mode}`);
  };

  if (!token) {
    return (
      <div className="page flashcards-page">
        <div className="container container--narrow">
          <div className="flashcards-empty">
            <h2>Đăng nhập để học</h2>
            <p>Please log in to start flashcard practice.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page flashcards-page">
      <div className="container container--narrow">
        <div className="flashcards-page__header">
          <h1 className="flashcards-page__title">
            Flashcards
            <span className="flashcards-page__title-cn chinese-text">識字卡</span>
          </h1>
          <p className="flashcards-page__desc">Choose a study mode to begin.</p>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="flashcards-stats">
            <div className="flashcards-stats__item">
              <span className="flashcards-stats__value">{stats.due}</span>
              <span className="flashcards-stats__label">Due</span>
            </div>
            <div className="flashcards-stats__item">
              <span className="flashcards-stats__value">{stats.total}</span>
              <span className="flashcards-stats__label">Total</span>
            </div>
            <div className="flashcards-stats__item">
              <span className="flashcards-stats__value">{stats.reviewedToday}</span>
              <span className="flashcards-stats__label">Today</span>
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div className="flashcards-modes">
          {MODES.map(({ mode, icon: Icon, title, titleVi, desc, color }, i) => (
            <motion.button
              key={mode}
              className="mode-card"
              onClick={() => handleStart(mode)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mode-card__icon" style={{ color }}>
                <Icon size={28} />
              </div>
              <div className="mode-card__text">
                <h3 className="mode-card__title">{title}</h3>
                <span className="mode-card__vi">{titleVi}</span>
                <p className="mode-card__desc">{desc}</p>
              </div>
              {mode === 'review' && stats && stats.due > 0 && (
                <span className="mode-card__badge">{stats.due}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Navigation links */}
        <div className="flashcards-links">
          <button className="flashcards-link" onClick={() => navigate('/word-list')}>
            My Word List
          </button>
          <button className="flashcards-link" onClick={() => navigate('/analytics')}>
            Review Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
