import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { useMockTestStore } from '../stores/mockTestStore';
import { useAuthStore } from '../stores/authStore';
import './MockTestHistoryPage.css';

export default function MockTestHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { history, isLoading, fetchHistory } = useMockTestStore();

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="page mock-history-page">
      <div className="container container--narrow">
        <button className="mock-history__back" onClick={() => navigate('/mock-tests')}>
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="mock-history__title">Test History</h1>

        {isLoading && (
          <div className="mock-history-loading"><Loader2 size={24} className="mock-history-spinner" /></div>
        )}

        {!isLoading && history.length === 0 && (
          <p className="mock-history-empty">No test history yet. Take your first mock test!</p>
        )}

        <div className="mock-history-list">
          {history.map((result) => {
            const testInfo = result.test_id as any;
            const date = new Date(result.submitted_at).toLocaleDateString();
            const mins = Math.floor(result.time_spent_seconds / 60);
            const passed = result.percentage >= 60;

            return (
              <div key={result._id} className="mock-history-item">
                <div className="mock-history-item__info">
                  <h3>{testInfo?.title || 'Mock Test'}</h3>
                  <div className="mock-history-item__meta">
                    <span>{date}</span>
                    <span><Clock size={12} /> {mins}m</span>
                    <span>{result.total_score}/{result.total_possible}</span>
                  </div>
                </div>
                <span className={`mock-history-item__score ${passed ? 'mock-history-item__score--pass' : 'mock-history-item__score--fail'}`}>
                  {result.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
