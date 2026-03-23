import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import FlashcardSwipeable from '../components/flashcard/FlashcardSwipeable';
import GradeButtons from '../components/flashcard/GradeButtons';
import SessionProgress from '../components/flashcard/SessionProgress';
import { useFlashcardStore, type FlashcardMode } from '../stores/flashcardStore';
import './FlashcardSessionPage.css';

const MODE_LABELS: Record<FlashcardMode, string> = {
  learn: 'Learn New Words',
  review: 'Daily Review',
  quick: 'Quick Review',
  cram: 'Exam Cram'
};

export default function FlashcardSessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get('mode') || 'review') as FlashcardMode;

  const {
    cards, currentIndex, isFlipped, sessionStats,
    isLoading, isSessionActive, error,
    startSession, gradeCard, flipCard, endSession
  } = useFlashcardStore();

  useEffect(() => {
    startSession(mode);
    return () => endSession();
  }, [mode]);

  const currentCard = cards[currentIndex];
  const isDone = currentIndex >= cards.length && cards.length > 0;
  const isEmpty = !isLoading && cards.length === 0 && isSessionActive;
  const elapsed = sessionStats.startedAt ? Math.round((Date.now() - sessionStats.startedAt) / 1000) : 0;
  const minutes = Math.floor(elapsed / 60);

  const handleBack = () => {
    endSession();
    navigate('/flashcards');
  };

  return (
    <div className="page session-page">
      <div className="container container--narrow">
        {/* Header */}
        <div className="session-page__header">
          <button className="session-page__back" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="session-page__title">{MODE_LABELS[mode]}</h2>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="session-loading">
            <Loader2 className="session-loading__spinner" size={32} />
            <p>Loading cards...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="session-error">
            <p>Error: {error}</p>
            <button onClick={() => startSession(mode)}>Retry</button>
          </div>
        )}

        {/* Empty */}
        {isEmpty && !error && (
          <div className="session-done">
            <h2>No cards available</h2>
            <p>Try a different mode or add more vocabulary.</p>
            <button className="session-done__btn" onClick={handleBack}>
              Back to Flashcards
            </button>
          </div>
        )}

        {/* Session complete */}
        {isDone && (
          <motion.div
            className="session-done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>Session Complete! 🎉</h2>
            <div className="session-done__stats">
              <div className="session-done__stat">
                <span className="session-done__stat-value">{sessionStats.total}</span>
                <span className="session-done__stat-label">Cards</span>
              </div>
              <div className="session-done__stat session-done__stat--correct">
                <span className="session-done__stat-value">{sessionStats.correct}</span>
                <span className="session-done__stat-label">Correct</span>
              </div>
              <div className="session-done__stat session-done__stat--wrong">
                <span className="session-done__stat-value">{sessionStats.incorrect}</span>
                <span className="session-done__stat-label">Wrong</span>
              </div>
              <div className="session-done__stat">
                <span className="session-done__stat-value">{minutes}m</span>
                <span className="session-done__stat-label">Time</span>
              </div>
            </div>
            <div className="session-done__actions">
              <button className="session-done__btn" onClick={() => startSession(mode)}>
                <RotateCcw size={16} /> Again
              </button>
              <button className="session-done__btn session-done__btn--secondary" onClick={handleBack}>
                Done
              </button>
            </div>
          </motion.div>
        )}

        {/* Active session */}
        {!isLoading && !isDone && !isEmpty && currentCard && (
          <>
            <SessionProgress
              current={currentIndex}
              total={cards.length}
              correct={sessionStats.correct}
              incorrect={sessionStats.incorrect}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <FlashcardSwipeable
                  card={currentCard}
                  isFlipped={isFlipped}
                  onFlip={flipCard}
                  onGrade={gradeCard}
                />
              </motion.div>
            </AnimatePresence>

            <GradeButtons onGrade={gradeCard} />
          </>
        )}
      </div>
    </div>
  );
}
