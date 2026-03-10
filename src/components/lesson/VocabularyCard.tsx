import { useState } from 'react';
import { motion } from 'framer-motion';
import TTSButton from '../common/TTSButton';
import type { Vocabulary } from '../../types';
import './VocabularyCard.css';

interface VocabularyCardProps {
    vocab: Vocabulary;
    index?: number;
}

export default function VocabularyCard({ vocab, index = 0 }: VocabularyCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div
            className="vocab-card-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
        >
            <div
                className={`vocab-card ${isFlipped ? 'vocab-card--flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                aria-label={`Vocabulary card: ${vocab.character}`}
                onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
            >
                {/* Front */}
                <div className="vocab-card__face vocab-card__front">
                    <div className="vocab-card__character chinese-text">{vocab.character}</div>
                    <div className="vocab-card__annotations">
                        <span className="vocab-card__pinyin annotation annotation--pinyin">
                            {vocab.pinyin}
                        </span>
                        <span className="vocab-card__zhuyin annotation annotation--zhuyin">
                            {vocab.zhuyin}
                        </span>
                    </div>
                    <TTSButton text={vocab.character} size="md" className="vocab-card__tts" />
                    <span className="vocab-card__hint">tap to flip</span>
                </div>

                {/* Back */}
                <div className="vocab-card__face vocab-card__back">
                    <div className="vocab-card__meaning">{vocab.meaning}</div>
                    {vocab.meaningVi && (
                        <div className="vocab-card__meaning-vi">🇻🇳 {vocab.meaningVi}</div>
                    )}
                    {vocab.exampleSentences.length > 0 && (
                        <div className="vocab-card__example">
                            <span className="vocab-card__example-label">Example:</span>
                            <span className="vocab-card__example-text chinese-text">
                                {vocab.exampleSentences[0]}
                            </span>
                        </div>
                    )}
                    <span className="vocab-card__hint">tap to flip back</span>
                </div>
            </div>
        </motion.div>
    );
}
