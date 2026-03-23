import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Timer from '../components/exam/Timer';
import QuestionRenderer from '../components/exam/QuestionRenderer';
import { useMockTestStore } from '../stores/mockTestStore';
import './MockTestSessionPage.css';

export default function MockTestSessionPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const {
    currentTest, currentResult, answers,
    currentSectionIndex, currentQuestionIndex,
    timeRemaining, isLoading, isSubmitting, startedAt,
    loadTest, startTest, answerQuestion, navigateTo, submitTest, reset
  } = useMockTestStore();

  useEffect(() => {
    if (testId) loadTest(testId);
    return () => reset();
  }, [testId]);

  // Redirect to result when submitted
  useEffect(() => {
    if (currentResult) {
      navigate(`/mock-tests/${testId}/result`, { state: { result: currentResult, test: currentTest } });
    }
  }, [currentResult]);

  if (isLoading) {
    return (
      <div className="page session-page">
        <div className="container container--narrow">
          <div className="mock-session-loading"><Loader2 size={32} className="mock-session-spinner" /></div>
        </div>
      </div>
    );
  }

  if (!currentTest) return null;

  // Pre-start screen
  if (!startedAt) {
    return (
      <div className="page session-page">
        <div className="container container--narrow">
          <div className="mock-prestart">
            <h2>{currentTest.title}</h2>
            <div className="mock-prestart__info">
              <p>{currentTest.total_questions} questions · {currentTest.duration_minutes} minutes</p>
              <p>{currentTest.sections.map(s => `${s.type}: ${s.questions.length}Q`).join(' · ')}</p>
            </div>
            <button className="mock-prestart__btn" onClick={startTest}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const section = currentTest.sections[currentSectionIndex];
  const question = section?.questions[currentQuestionIndex];
  const userAnswer = answers.find(
    a => a.sectionIndex === currentSectionIndex && a.questionIndex === currentQuestionIndex
  )?.answer;

  // Flat question number
  let qNum = 0;
  for (let s = 0; s < currentSectionIndex; s++) {
    qNum += currentTest.sections[s].questions.length;
  }
  qNum += currentQuestionIndex + 1;

  const isLast = currentSectionIndex === currentTest.sections.length - 1
    && currentQuestionIndex === section.questions.length - 1;

  const goNext = () => {
    if (currentQuestionIndex < section.questions.length - 1) {
      navigateTo(currentSectionIndex, currentQuestionIndex + 1);
    } else if (currentSectionIndex < currentTest.sections.length - 1) {
      navigateTo(currentSectionIndex + 1, 0);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      navigateTo(currentSectionIndex, currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = currentTest.sections[currentSectionIndex - 1];
      navigateTo(currentSectionIndex - 1, prevSection.questions.length - 1);
    }
  };

  return (
    <div className="page session-page">
      <div className="container container--narrow">
        {/* Top bar */}
        <div className="mock-session__topbar">
          <div className="mock-session__section-tabs">
            {currentTest.sections.map((s, i) => (
              <button
                key={i}
                className={`mock-section-tab ${i === currentSectionIndex ? 'mock-section-tab--active' : ''}`}
                onClick={() => navigateTo(i, 0)}
              >
                {s.type}
              </button>
            ))}
          </div>
          <Timer seconds={timeRemaining} />
        </div>

        {/* Question */}
        {question && (
          <QuestionRenderer
            question={question}
            selectedAnswer={userAnswer}
            onAnswer={(answer) => answerQuestion(currentSectionIndex, currentQuestionIndex, answer)}
            questionNumber={qNum}
          />
        )}

        {/* Navigation */}
        <div className="mock-session__nav">
          <button className="mock-nav-btn" onClick={goPrev} disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}>
            Previous
          </button>

          {isLast ? (
            <button className="mock-nav-btn mock-nav-btn--submit" onClick={submitTest} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button className="mock-nav-btn mock-nav-btn--next" onClick={goNext}>
              Next
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="mock-session__dots">
          {section?.questions.map((_, i) => {
            const answered = answers.some(a => a.sectionIndex === currentSectionIndex && a.questionIndex === i);
            return (
              <button
                key={i}
                className={`mock-dot ${i === currentQuestionIndex ? 'mock-dot--current' : ''} ${answered ? 'mock-dot--answered' : ''}`}
                onClick={() => navigateTo(currentSectionIndex, i)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
