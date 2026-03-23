import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { API_URLS } from '../config/api';
import './ReviewAnalyticsPage.css';

interface AnalyticsData {
  mastery: { name: string; value: number; color: string }[];
  dailyReviews: { date: string; count: number }[];
  totalReviewed: number;
  reviewedToday: number;
  accuracy: number;
}

const STATE_COLORS: Record<string, string> = {
  New: '#9ca3af',
  Learning: '#f59e0b',
  Review: '#3b82f6',
  Relearning: '#ef4444'
};

export default function ReviewAnalyticsPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URLS.review}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const raw = await res.json();
        setData({
          mastery: [
            { name: 'New', value: raw.new, color: STATE_COLORS.New },
            { name: 'Learning', value: raw.learning, color: STATE_COLORS.Learning },
            { name: 'Review', value: raw.review, color: STATE_COLORS.Review },
            { name: 'Relearning', value: raw.relearning, color: STATE_COLORS.Relearning },
          ],
          dailyReviews: raw.dailyReviews || [],
          totalReviewed: raw.total,
          reviewedToday: raw.reviewedToday,
          accuracy: raw.accuracy || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics');
    }
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="page analytics-page">
        <div className="container container--narrow">
          <p className="analytics-empty">Please log in to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page analytics-page">
      <div className="container container--narrow">
        <div className="analytics-page__header">
          <h1 className="analytics-page__title">
            <BarChart3 size={24} />
            Review Analytics
            <span className="analytics-page__title-cn chinese-text">統計</span>
          </h1>
        </div>

        {isLoading && (
          <div className="analytics-loading">
            <Loader2 className="analytics-loading__spinner" size={24} />
          </div>
        )}

        {!isLoading && data && (
          <>
            {/* Summary cards */}
            <div className="analytics-summary">
              <div className="analytics-card">
                <span className="analytics-card__value">{data.totalReviewed}</span>
                <span className="analytics-card__label">Total Cards</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card__value">{data.reviewedToday}</span>
                <span className="analytics-card__label">Today</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card__value">{Math.round(data.accuracy)}%</span>
                <span className="analytics-card__label">Accuracy</span>
              </div>
            </div>

            {/* Mastery distribution */}
            <div className="analytics-section">
              <h3 className="analytics-section__title">Mastery Distribution</h3>
              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.mastery.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.mastery.filter(d => d.value > 0).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="analytics-legend">
                  {data.mastery.map((item) => (
                    <div key={item.name} className="analytics-legend__item">
                      <span className="analytics-legend__dot" style={{ background: item.color }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily reviews chart */}
            {data.dailyReviews.length > 0 && (
              <div className="analytics-section">
                <h3 className="analytics-section__title">Daily Reviews (Last 30 Days)</h3>
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.dailyReviews}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--color-accent-jade)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
