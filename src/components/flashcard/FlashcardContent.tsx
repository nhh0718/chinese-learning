import TTSButton from '../common/TTSButton';
import type { ReviewCard } from '../../types';
import './FlashcardContent.css';

interface Props {
  card: ReviewCard;
  isFlipped: boolean;
}

export default function FlashcardContent({ card, isFlipped }: Props) {
  return (
    <div className={`fc-card ${isFlipped ? 'fc-card--flipped' : ''}`}>
      <div className="fc-card__inner">
        {/* Front face */}
        <div className="fc-card__face fc-card__front">
          <div className="fc-card__state">{card.state}</div>
          <div className="fc-card__character chinese-text">{card.character}</div>
          <div className="fc-card__annotations">
            <span className="annotation annotation--pinyin">{card.pinyin}</span>
            {card.zhuyin && <span className="annotation annotation--zhuyin">{card.zhuyin}</span>}
          </div>
          <TTSButton text={card.character} size="lg" />
          <span className="fc-card__hint">Tap to reveal · Swipe to grade</span>
        </div>

        {/* Back face */}
        <div className="fc-card__face fc-card__back">
          <div className="fc-card__meaning">{card.meaning}</div>
          <div className="fc-card__character-sm chinese-text">{card.character}</div>
          {card.hanViet && (
            <div className="fc-card__han-viet">Hán Việt: {card.hanViet}</div>
          )}
        </div>
      </div>
    </div>
  );
}
