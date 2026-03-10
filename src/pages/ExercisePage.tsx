import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { useLessonStore } from '../stores/lessonStore';
import { useProgressStore } from '../stores/progressStore';
import type { Exercise } from '../types';
import './ExercisePage.css';

export default function ExercisePage() {
    const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const { currentLesson, fetchLesson } = useLessonStore();
    const { updateProgress } = useProgressStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [fillAnswer, setFillAnswer] = useState('');
    const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
    const [matchSelection, setMatchSelection] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [scores, setScores] = useState<boolean[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (topicId && lessonId) {
            fetchLesson(topicId, lessonId);
        }
    }, [topicId, lessonId, fetchLesson]);

    const exercises = currentLesson?.exercises || [];
    const currentExercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0;

    const checkAnswer = useCallback((exercise: Exercise, answer: string) => {
        const correct = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        setIsCorrect(correct);
        setScores((prev) => [...prev, correct]);
    }, []);

    const handleMultipleChoice = (option: string) => {
        if (isCorrect !== null) return;
        setSelectedAnswer(option);
        checkAnswer(currentExercise, option);
    };

    const handleFillBlank = () => {
        if (isCorrect !== null || !fillAnswer.trim()) return;
        checkAnswer(currentExercise, fillAnswer);
    };

    const handleMatchSelect = (item: string, type: 'chinese' | 'meaning') => {
        if (!currentExercise.pairs) return;

        if (type === 'chinese') {
            setMatchSelection(item);
        } else if (matchSelection) {
            const pair = currentExercise.pairs.find((p) => p.chinese === matchSelection);
            if (pair && pair.meaning === item) {
                const newMatched = { ...matchedPairs, [matchSelection]: item };
                setMatchedPairs(newMatched);
                setMatchSelection(null);

                if (Object.keys(newMatched).length === currentExercise.pairs.length) {
                    setIsCorrect(true);
                    setScores((prev) => [...prev, true]);
                }
            } else {
                setMatchSelection(null);
            }
        }
    };

    const nextExercise = () => {
        if (currentIndex + 1 >= exercises.length) {
            const correctCount = scores.length > 0 ? scores.filter(Boolean).length : 0;
            const finalScore = Math.round((correctCount / exercises.length) * 100);
            if (topicId && lessonId) {
                updateProgress(lessonId, topicId, finalScore);
            }
            setShowResults(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setFillAnswer('');
            setMatchedPairs({});
            setMatchSelection(null);
            setIsCorrect(null);
        }
    };

    const retryExercises = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setFillAnswer('');
        setMatchedPairs({});
        setMatchSelection(null);
        setIsCorrect(null);
        setScores([]);
        setShowResults(false);
    };

    if (!currentLesson || exercises.length === 0) {
        return (
            <div className="page exercise-page">
                <div className="container container--narrow">
                    <p>No exercises available.</p>
                </div>
            </div>
        );
    }

    // Results Screen
    if (showResults) {
        const correctCount = scores.filter(Boolean).length;
        const finalScore = Math.round((correctCount / exercises.length) * 100);
        return (
            <div className="page exercise-page">
                <div className="container container--narrow">
                    <motion.div
                        className="exercise-results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="exercise-results__trophy">
                            <Trophy size={48} />
                        </div>
                        <h2 className="exercise-results__title">
                            {finalScore >= 80 ? '🎉 Excellent!' : finalScore >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
                        </h2>
                        <div className="exercise-results__score">
                            <span className="exercise-results__score-value">{finalScore}%</span>
                            <span className="exercise-results__score-label">
                                {correctCount} / {exercises.length} correct
                            </span>
                        </div>
                        <div className="exercise-results__actions">
                            <button className="exercise-results__retry" onClick={retryExercises}>
                                <RotateCcw size={18} />
                                <span>Try Again</span>
                            </button>
                            <button
                                className="exercise-results__continue"
                                onClick={() => navigate(`/topics/${topicId}/lessons/${lessonId}`)}
                            >
                                <span>Back to Lesson</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="page exercise-page">
            <div className="container container--narrow">
                {/* Header */}
                <div className="exercise-page__header">
                    <button
                        className="exercise-page__back"
                        onClick={() => navigate(`/topics/${topicId}/lessons/${lessonId}`)}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="exercise-page__progress-bar">
                        <motion.div
                            className="exercise-page__progress-fill"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <span className="exercise-page__counter">
                        {currentIndex + 1}/{exercises.length}
                    </span>
                </div>

                {/* Exercise Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className="exercise-content"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="exercise-content__question">{currentExercise.question}</h2>
                        {currentExercise.questionChinese && (
                            <div className="exercise-content__question-cn chinese-text">
                                {currentExercise.questionChinese}
                            </div>
                        )}

                        {/* Multiple Choice */}
                        {currentExercise.type === 'multiple_choice' && currentExercise.options && (
                            <div className="exercise-options">
                                {currentExercise.options.map((option) => {
                                    let className = 'exercise-option';
                                    if (isCorrect !== null) {
                                        if (option === currentExercise.correctAnswer) className += ' exercise-option--correct';
                                        else if (option === selectedAnswer) className += ' exercise-option--incorrect';
                                    } else if (option === selectedAnswer) {
                                        className += ' exercise-option--selected';
                                    }
                                    return (
                                        <button
                                            key={option}
                                            className={className}
                                            onClick={() => handleMultipleChoice(option)}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Fill in the Blank */}
                        {currentExercise.type === 'fill_blank' && (
                            <div className="exercise-fill">
                                <input
                                    type="text"
                                    className={`exercise-fill__input ${isCorrect === true ? 'exercise-fill__input--correct' : isCorrect === false ? 'exercise-fill__input--incorrect' : ''}`}
                                    value={fillAnswer}
                                    onChange={(e) => setFillAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFillBlank()}
                                    placeholder="Type your answer..."
                                    disabled={isCorrect !== null}
                                    autoFocus
                                />
                                {isCorrect === null && (
                                    <button className="exercise-fill__submit" onClick={handleFillBlank}>
                                        Check
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Matching */}
                        {currentExercise.type === 'matching' && currentExercise.pairs && (
                            <div className="exercise-matching">
                                <div className="exercise-matching__column">
                                    <span className="exercise-matching__label">Chinese</span>
                                    {currentExercise.pairs.map((pair) => (
                                        <button
                                            key={pair.chinese}
                                            className={`exercise-matching__item ${matchSelection === pair.chinese ? 'exercise-matching__item--selected' : ''} ${matchedPairs[pair.chinese] ? 'exercise-matching__item--matched' : ''}`}
                                            onClick={() => handleMatchSelect(pair.chinese, 'chinese')}
                                            disabled={!!matchedPairs[pair.chinese]}
                                        >
                                            <span className="chinese-text">{pair.chinese}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="exercise-matching__column">
                                    <span className="exercise-matching__label">Meaning</span>
                                    {currentExercise.pairs
                                        .slice()
                                        .sort(() => 0.5 - Math.random())
                                        .map((pair) => {
                                            const isMatched = Object.values(matchedPairs).includes(pair.meaning);
                                            return (
                                                <button
                                                    key={pair.meaning}
                                                    className={`exercise-matching__item ${isMatched ? 'exercise-matching__item--matched' : ''}`}
                                                    onClick={() => handleMatchSelect(pair.meaning, 'meaning')}
                                                    disabled={isMatched}
                                                >
                                                    {pair.meaning}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Feedback */}
                        {isCorrect !== null && (
                            <motion.div
                                className={`exercise-feedback ${isCorrect ? 'exercise-feedback--correct' : 'exercise-feedback--incorrect'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="exercise-feedback__icon">
                                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                </div>
                                <div>
                                    <div className="exercise-feedback__title">
                                        {isCorrect ? 'Correct!' : 'Not quite...'}
                                    </div>
                                    {currentExercise.explanation && (
                                        <div className="exercise-feedback__explanation">
                                            {currentExercise.explanation}
                                        </div>
                                    )}
                                    {!isCorrect && (
                                        <div className="exercise-feedback__answer">
                                            Correct answer: <strong>{currentExercise.correctAnswer}</strong>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Next Button */}
                        {isCorrect !== null && (
                            <motion.div
                                className="exercise-next"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <button className="exercise-next__btn" onClick={nextExercise}>
                                    <span>{currentIndex + 1 >= exercises.length ? 'See Results' : 'Next'}</span>
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
