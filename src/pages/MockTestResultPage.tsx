import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { MockTestResult, MockTest } from '../types';
import './MockTestResultPage.css';

export default function MockTestResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as MockTestResult | undefined;
  const test = location.state?.test as MockTest | undefined;

  if (!result) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <p className="mock-result-empty">No result data. Go back to tests.</p>
          <button onClick={() => navigate('/mock-tests')}>Back to Tests</button>
        </div>
      </div>
    );
  }

  const passed = result.percentage >= 60;
  const minutes = Math.floor(result.time_spent_seconds / 60);

  return (
    <div className="page mock-result-page">
      <div className="container container--narrow">
        <button className="mock-result__back" onClick={() => navigate('/mock-tests')}>
          <ArrowLeft size={20} /> Back to Tests
        </button>

        <motion.div
          className="mock-result__header"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className={`mock-result__score ${passed ? 'mock-result__score--pass' : 'mock-result__score--fail'}`}>
            {result.percentage}%
          </h2>
          <p className="mock-result__verdict">{passed ? 'Passed!' : 'Keep Practicing'}</p>
          <p className="mock-result__meta">
            {result.total_score}/{result.total_possible} correct · {minutes}m spent
          </p>
        </motion.div>

        {/* Section breakdown */}
        <div className="mock-result__sections">
          {result.sections.map((section, sIdx) => (
            <div key={sIdx} className="mock-result-section">
              <div className="mock-result-section__header">
                <h3>{section.type}</h3>
                <span className="mock-result-section__score">
                  {section.score}/{section.total} ({Math.round((section.score / section.total) * 100)}%)
                </span>
              </div>

              {/* Wrong answers */}
              {section.answers.filter(a => !a.correct).length > 0 && (
                <div className="mock-result-section__wrong">
                  <h4>Wrong Answers:</h4>
                  {section.answers.filter(a => !a.correct).map((a) => {
                    const q = test?.sections[sIdx]?.questions[a.questionIndex];
                    return (
                      <div key={a.questionIndex} className="mock-wrong-item">
                        <div className="mock-wrong-item__q">
                          <XCircle size={14} className="mock-wrong-icon" />
                          <span>{q?.question || `Q${a.questionIndex + 1}`}</span>
                        </div>
                        <div className="mock-wrong-item__answers">
                          <span className="mock-wrong-item__yours">Your answer: {a.answer || '(skipped)'}</span>
                          <span className="mock-wrong-item__correct">
                            <CheckCircle size={12} /> {q?.correctAnswer}
                          </span>
                        </div>
                        {q?.explanation && (
                          <p className="mock-wrong-item__explanation">{q.explanation}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mock-result__actions">
          <button className="mock-result__btn" onClick={() => navigate('/mock-tests')}>
            Try Another Test
          </button>
        </div>
      </div>
    </div>
  );
}
