import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import TTSButton from '../common/TTSButton';
import type { Vocabulary } from '../../types';
import { formatPinyin } from '../../utils/pinyin-utils';
import './VocabularyCard.css';

interface VocabularyCardProps {
    vocab: Vocabulary;
    index?: number;
}

export default function VocabularyCard({ vocab, index = 0 }: VocabularyCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleOpen = () => {
        setIsModalOpen(true);
        setIsFlipped(false);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };

    const toggleFlip = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    return (
        <>
            {/* Small Grid Card */}
            <motion.div
                className="vocab-card-grid-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                onClick={handleOpen}
                role="button"
                tabIndex={0}
                aria-label={`Vocabulary card: ${vocab.character}`}
                onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
            >
                <div className="vocab-card__face vocab-card__front vocab-card--small">
                    <div className="vocab-card__character chinese-text">{vocab.character}</div>
                    <div className="vocab-card__annotations">
                        <span className="vocab-card__pinyin annotation annotation--pinyin">
                            {formatPinyin(vocab.pinyin)}
                        </span>
                        <span className="vocab-card__zhuyin annotation annotation--zhuyin">
                            {vocab.zhuyin}
                        </span>
                    </div>
                    <TTSButton text={vocab.character} size="sm" className="vocab-card__tts" />
                    <span className="vocab-card__hint">tap to open</span>
                </div>
            </motion.div>

            {/* Large Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="vocab-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    >
                        <motion.div
                            className="vocab-modal-content"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={toggleFlip}
                        >
                            <button className="vocab-modal-close" onClick={handleClose} aria-label="Close modal">
                                <X size={24} />
                            </button>
                            
                            <div className={`vocab-card vocab-card--modal ${isFlipped ? 'vocab-card--flipped' : ''}`}>
                                {/* Front */}
                                <div className="vocab-card__face vocab-card__front">
                                    <div className="vocab-card__character chinese-text">{vocab.character}</div>
                                    <div className="vocab-card__annotations">
                                        <span className="vocab-card__pinyin annotation annotation--pinyin">
                                            {formatPinyin(vocab.pinyin)}
                                        </span>
                                        <span className="vocab-card__zhuyin annotation annotation--zhuyin">
                                            {vocab.zhuyin}
                                        </span>
                                    </div>
                                    <TTSButton text={vocab.character} size="lg" className="vocab-card__tts" />
                                    <span className="vocab-card__hint">tap to flip</span>
                                </div>

                                {/* Back */}
                                <div className="vocab-card__face vocab-card__back">
                                    <div className="vocab-card__meaning-vi-modal">
                                        {vocab.meaningVi || vocab.meaning}
                                    </div>
                                    {vocab.meaning.includes('[') && (
                                        <div className="vocab-card__hanviet">
                                            {vocab.meaning.substring(vocab.meaning.indexOf('['))}
                                        </div>
                                    )}
                                    {vocab.exampleSentences.length > 0 && (
                                        <div className="vocab-card__example-modal">
                                            <span className="vocab-card__example-label">Example:</span>
                                            <span className="vocab-card__example-text-modal chinese-text">
                                                {vocab.exampleSentences[0]}
                                            </span>
                                        </div>
                                    )}
                                    <span className="vocab-card__hint">tap to flip back</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
