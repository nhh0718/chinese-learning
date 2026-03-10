import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { useTelegramStore } from '../stores/telegramStore';
import { useAuthStore } from '../stores/authStore';
import type { DailyQuizQuestion } from '../types';
import './DailyQuizPage.css';

export default function DailyQuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    dailyQuiz,
    isQuizLoading,
    quizError,
    fetchDailyQuiz,
    submitQuizResult
  } = useTelegramStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scores, setScores] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);

  const date = searchParams.get('date') || undefined;

  useEffect(() => {
    if (date) {
      useTelegramStore.getState().fetchQuizByDate(date).then(quiz => {
        if (quiz) {
          useTelegramStore.setState({ dailyQuiz: quiz });
        }
      });
    } else {
      fetchDailyQuiz();
    }
  }, [date, fetchDailyQuiz]);

  const questions = dailyQuiz?.questions || [];
  const currentQuestion: DailyQuizQuestion | undefined = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  const handleSelectAnswer = (optionIndex: number) => {
    if (isCorrect !== null || !currentQuestion) return;

    setSelectedAnswer(optionIndex);
    const correct = currentQuestion.options[optionIndex] === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setScores(prev => [...prev, correct]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      // Quiz completed
      // Submit result if user is logged in
      if (user) {
        const answers = questions.map((q, idx) => {
          let userAnswer: number;
          if (idx === currentIndex) {
            userAnswer = selectedAnswer ?? -1;
          } else if (scores[idx]) {
            userAnswer = questions[idx].options.findIndex(o => o === q.correctAnswer);
          } else {
            userAnswer = -1;
          }
          return { questionIndex: idx, answerIndex: userAnswer };
        });
        submitQuizResult(user.id, answers);
      }

      setShowResults(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  if (isQuizLoading) {
    return (
      <div className="page daily-quiz-page">
        <div className="container container--narrow">
          <div className="loading">Đang tải bài kiểm tra...</div>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="page daily-quiz-page">
        <div className="container container--narrow">
          <div className="error">{quizError}</div>
          <button onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  if (!dailyQuiz || questions.length === 0) {
    return (
      <div className="page daily-quiz-page">
        <div className="container container--narrow">
          <div className="empty">Chưa có bài kiểm tra hôm nay.</div>
          <button onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const correctCount = scores.filter(Boolean).length + (isCorrect ? 1 : 0);
    const finalScore = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="page daily-quiz-page">
        <div className="container container--narrow">
          <motion.div
            className="quiz-results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="quiz-results__trophy">
              <Trophy size={48} />
            </div>
            <h2 className="quiz-results__title">
              {finalScore >= 80 ? '🎉 Xuất sắc!' : finalScore >= 60 ? '👍 Làm tốt!' : '💪 Cố gắng thêm!'}
            </h2>
            <div className="quiz-results__score">
              <span className="quiz-results__score-value">{finalScore}%</span>
              <span className="quiz-results__score-label">
                {correctCount} / {questions.length} câu đúng
              </span>
            </div>
            <div className="quiz-results__topic">
              Chủ đề: {dailyQuiz.topicName}
            </div>
            <div className="quiz-results__actions">
              <button
                className="quiz-results__home"
                onClick={() => navigate('/')}
              >
                <span>Về trang chủ</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page daily-quiz-page">
      <div className="container container--narrow">
        {/* Header */}
        <div className="quiz-header">
          <button className="quiz-header__back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div className="quiz-header__info">
            <span className="quiz-header__topic">{dailyQuiz.topicName}</span>
            <span className="quiz-header__date">
              {date ? new Date(date).toLocaleDateString('vi-VN') : 'Hôm nay'}
            </span>
          </div>
          <span className="quiz-header__counter">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress">
          <motion.div
            className="quiz-progress__fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="quiz-question"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="quiz-question__text">{currentQuestion?.question}</h2>
            {currentQuestion?.questionChinese && (
              <div className="quiz-question__chinese">{currentQuestion.questionChinese}</div>
            )}

            {/* Options */}
            <div className="quiz-options">
              {currentQuestion?.options.map((option, idx) => {
                let className = 'quiz-option';
                if (isCorrect !== null) {
                  if (option === currentQuestion.correctAnswer) className += ' quiz-option--correct';
                  else if (idx === selectedAnswer) className += ' quiz-option--incorrect';
                } else if (idx === selectedAnswer) {
                  className += ' quiz-option--selected';
                }
                return (
                  <button
                    key={idx}
                    className={className}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={isCorrect !== null}
                  >
                    <span className="quiz-option__letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="quiz-option__text">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
              <motion.div
                className={`quiz-feedback ${isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="quiz-feedback__icon">
                  {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <div className="quiz-feedback__title">
                    {isCorrect ? 'Đúng!' : 'Chưa đúng!'}
                  </div>
                  {!isCorrect && (
                    <div className="quiz-feedback__answer">
                      Đáp án đúng: <strong>{currentQuestion?.correctAnswer}</strong>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Next Button */}
            {isCorrect !== null && (
              <motion.div
                className="quiz-next"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button className="quiz-next__btn" onClick={nextQuestion}>
                  <span>{currentIndex + 1 >= questions.length ? 'Xem kết quả' : 'Tiếp theo'}</span>
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
