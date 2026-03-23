import { useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useGamificationStore } from '../stores/gamificationStore';
import { useAuthStore } from '../stores/authStore';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const { token } = useAuthStore();
  const { leaderboard, isLoading, fetchLeaderboard } = useGamificationStore();

  useEffect(() => {
    if (token) fetchLeaderboard();
  }, [token]);

  return (
    <div className="page leaderboard-page">
      <div className="container container--narrow">
        <div className="leaderboard-page__header">
          <h1><Trophy size={24} /> Weekly Leaderboard <span className="chinese-text" style={{ fontWeight: 300, color: 'var(--color-text-tertiary)' }}>排行榜</span></h1>
          <p className="leaderboard-page__subtitle">Top learners this week</p>
        </div>

        {isLoading && <div className="lb-loading"><Loader2 size={24} className="lb-spinner" /></div>}

        {!isLoading && leaderboard.length === 0 && (
          <p className="lb-empty">No activity this week yet. Start learning to join the leaderboard!</p>
        )}

        <div className="lb-list">
          {leaderboard.map((entry) => (
            <div key={entry.rank} className={`lb-item ${entry.rank <= 3 ? 'lb-item--top' : ''}`}>
              <span className={`lb-item__rank lb-rank--${entry.rank}`}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <div className="lb-item__info">
                <span className="lb-item__name">{entry.name}</span>
                <span className="lb-item__level">Lv.{entry.level} {entry.levelTitle}</span>
              </div>
              <span className="lb-item__xp">{entry.weeklyXp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
