import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import TTSButton from '../components/common/TTSButton';
import { mockLessons } from '../mock/data';
import type { Vocabulary } from '../types';
import './ReviewPage.css';

export default function ReviewPage() {
    const allVocab = useMemo(() => {
        const vocab: Vocabulary[] = [];
        Object.values(mockLessons).forEach((lessons) => {
            lessons.forEach((lesson) => {
                vocab.push(...lesson.vocabulary);
            });
        });
        return vocab.sort(() => Math.random() - 0.5);
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [known, setKnown] = useState<string[]>([]);
    const [unknown, setUnknown] = useState<string[]>([]);

    const currentCard = allVocab[currentIndex];
    const remaining = allVocab.length - currentIndex;
    const isDone = currentIndex >= allVocab.length;

    const handleKnown = () => {
        setKnown((prev) => [...prev, currentCard.id]);
        nextCard();
    };

    const handleUnknown = () => {
        setUnknown((prev) => [...prev, currentCard.id]);
        nextCard();
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 200);
    };

    const restart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnown([]);
        setUnknown([]);
    };

    return (
        <div className="page review-page">
            <div className="container container--narrow">
                <div className="review-page__header">
                    <h1 className="review-page__title">
                        Flashcard Review
                        <span className="review-page__title-cn chinese-text">複習</span>
                    </h1>
                    <p className="review-page__desc">
                        Tap cards to reveal meaning. Mark as known or study again.
                    </p>
                </div>

                {/* Stats */}
                <div className="review-stats">
                    <div className="review-stats__item review-stats__item--remaining">
                        <span className="review-stats__value">{remaining}</span>
                        <span className="review-stats__label">Remaining</span>
                    </div>
                    <div className="review-stats__item review-stats__item--known">
                        <span className="review-stats__value">{known.length}</span>
                        <span className="review-stats__label">Known</span>
                    </div>
                    <div className="review-stats__item review-stats__item--unknown">
                        <span className="review-stats__value">{unknown.length}</span>
                        <span className="review-stats__label">Study Again</span>
                    </div>
                </div>

                {isDone ? (
                    <motion.div
                        className="review-done"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2>🎉 Review Complete!</h2>
                        <p>You reviewed {allVocab.length} cards</p>
                        <p>{known.length} known · {unknown.length} need practice</p>
                        <button className="review-done__restart" onClick={restart}>
                            <RotateCcw size={18} />
                            <span>Review Again</span>
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Flashcard */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                className={`review-card ${isFlipped ? 'review-card--flipped' : ''}`}
                                initial={{ opacity: 0, rotateY: -90 }}
                                animate={{ opacity: 1, rotateY: 0 }}
                                exit={{ opacity: 0, rotateY: 90 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                                style={{ perspective: 1200 }}
                            >
                                <div className="review-card__inner">
                                    {/* Front */}
                                    <div className="review-card__face review-card__front">
                                        <div className="review-card__character chinese-text">
                                            {currentCard.character}
                                        </div>
                                        <div className="review-card__annotations">
                                            <span className="annotation annotation--pinyin">{currentCard.pinyin}</span>
                                            <span className="annotation annotation--zhuyin">{currentCard.zhuyin}</span>
                                        </div>
                                        <TTSButton text={currentCard.character} size="lg" />
                                        <span className="review-card__hint">Tap to reveal meaning</span>
                                    </div>

                                    {/* Back */}
                                    <div className="review-card__face review-card__back">
                                        <div className="review-card__meaning">{currentCard.meaning}</div>
                                        <div className="review-card__character-small chinese-text">
                                            {currentCard.character}
                                        </div>
                                        {currentCard.exampleSentences[0] && (
                                            <div className="review-card__example chinese-text">
                                                {currentCard.exampleSentences[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="review-actions">
                            <button className="review-actions__btn review-actions__btn--unknown" onClick={handleUnknown}>
                                <ThumbsDown size={20} />
                                <span>Study Again</span>
                            </button>
                            <button className="review-actions__btn review-actions__btn--known" onClick={handleKnown}>
                                <ThumbsUp size={20} />
                                <span>I Know This</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
