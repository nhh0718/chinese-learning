import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { ReviewCard, FSRSGrade } from '../../types';
import FlashcardContent from './FlashcardContent';
import './FlashcardSwipeable.css';

interface Props {
  card: ReviewCard;
  isFlipped: boolean;
  onFlip: () => void;
  onGrade: (grade: FSRSGrade) => void;
}

const SWIPE_THRESHOLD = 100;

export default function FlashcardSwipeable({ card, isFlipped, onFlip, onGrade }: Props) {
  const x = useMotionValue(0);
  // Color overlay based on drag direction
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [0.3, 0]);
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.3]);
  const rotation = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onGrade(1); // Again
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      onGrade(3); // Good
    }
  };

  return (
    <div className="swipeable-wrapper">
      {/* Swipe indicators */}
      <motion.div className="swipe-indicator swipe-indicator--left" style={{ opacity: leftOpacity }}>
        Again
      </motion.div>
      <motion.div className="swipe-indicator swipe-indicator--right" style={{ opacity: rightOpacity }}>
        Good
      </motion.div>

      <motion.div
        className="swipeable-card"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate: rotation }}
        onClick={onFlip}
        whileTap={{ scale: 0.98 }}
      >
        <FlashcardContent card={card} isFlipped={isFlipped} />
      </motion.div>
    </div>
  );
}
