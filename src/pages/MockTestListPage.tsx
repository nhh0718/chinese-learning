import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, FileText, Loader2 } from 'lucide-react';
import { useMockTestStore } from '../stores/mockTestStore';
import { useAuthStore } from '../stores/authStore';
import ReadinessGauge from '../components/exam/ReadinessGauge';
import type { ReadinessData } from '../types';
import { API_URLS } from '../config/api';
import './MockTestListPage.css';

export default function MockTestListPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { tests, isLoading, fetchTests, seedTests } = useMockTestStore();
  const [readiness, setReadiness] = useState<Record<number, ReadinessData>>({});
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    if (!token) return;
    fetchTests();
    // Fetch readiness for levels 1-6
    [1, 2, 3, 4, 5, 6].forEach(async (level) => {
      try {
        const res = await fetch(`${API_URLS.mockTests}/readiness/${level}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReadiness(prev => ({ ...prev, [level]: data }));
        }
      } catch { /* ignore */ }
    });
  }, [token]);

  const handleSeed = async () => {
    await seedTests();
  };

  const filteredTests = tests.filter(t => t.level === selectedLevel);

  if (!token) {
    return (
      <div className="page mock-list-page">
        <div className="container container--narrow">
          <p className="mock-list-empty">Please log in to take mock tests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page mock-list-page">
      <div className="container container--narrow">
        <div className="mock-list-page__header">
          <h1 className="mock-list-page__title">
            <FileText size={24} />
            Exam Prep
            <span className="mock-list-page__title-cn chinese-text">模擬考</span>
          </h1>
          <p className="mock-list-page__desc">Take mock HSK tests to prepare for your exam.</p>
        </div>

        {/* HSK Level selector */}
        <div className="mock-level-tabs">
          {[1, 2, 3, 4, 5, 6].map(level => (
            <button
              key={level}
              className={`mock-level-tab ${selectedLevel === level ? 'mock-level-tab--active' : ''}`}
              onClick={() => setSelectedLevel(level)}
            >
              HSK {level}
            </button>
          ))}
        </div>

        {/* Readiness gauge for selected level */}
        {readiness[selectedLevel] && (
          <div className="mock-readiness">
            <ReadinessGauge
              level={selectedLevel}
              readiness={readiness[selectedLevel].readiness}
              vocabMastery={readiness[selectedLevel].vocabMastery}
              avgTestScore={readiness[selectedLevel].avgTestScore}
            />
          </div>
        )}

        {/* Test list */}
        {isLoading && (
          <div className="mock-list-loading">
            <Loader2 className="mock-list-loading__spinner" size={24} />
          </div>
        )}

        {!isLoading && filteredTests.length === 0 && (
          <div className="mock-list-empty">
            <p>No mock tests available for HSK {selectedLevel}.</p>
            <button className="mock-list-seed" onClick={handleSeed}>
              Generate Mock Tests
            </button>
          </div>
        )}

        <div className="mock-list">
          {filteredTests.map((test, i) => (
            <motion.button
              key={test._id}
              className="mock-test-card"
              onClick={() => navigate(`/mock-tests/${test._id}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="mock-test-card__info">
                <h3>{test.title}</h3>
                <div className="mock-test-card__meta">
                  <span><Clock size={14} /> {test.duration_minutes} min</span>
                  <span>{test.total_questions} questions</span>
                </div>
              </div>
              <span className="mock-test-card__arrow">&rarr;</span>
            </motion.button>
          ))}
        </div>

        {/* Links */}
        <div className="mock-list-links">
          <button className="mock-list-link" onClick={() => navigate('/mock-tests/history')}>
            View Test History
          </button>
        </div>
      </div>
    </div>
  );
}
