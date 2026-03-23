import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { useGamificationStore } from '../stores/gamificationStore';
import { useAuthStore } from '../stores/authStore';
import './AchievementsPage.css';

export default function AchievementsPage() {
  const { token } = useAuthStore();
  const { achievements, profile, isLoading, fetchAchievements, fetchProfile, seedAchievements } = useGamificationStore();

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchAchievements();
  }, [token]);

  const earned = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);

  if (!token) {
    return (
      <div className="page"><div className="container container--narrow">
        <p className="achievements-empty">Please log in to view achievements.</p>
      </div></div>
    );
  }

  return (
    <div className="page achievements-page">
      <div className="container container--narrow">
        <div className="achievements-page__header">
          <h1><Award size={24} /> Achievements <span className="chinese-text" style={{ fontWeight: 300, color: 'var(--color-text-tertiary)' }}>成就</span></h1>
          {profile && (
            <p className="achievements-page__subtitle">
              Level {profile.level} {profile.levelTitle} · {earned.length}/{achievements.length} earned
            </p>
          )}
        </div>

        {/* XP Bar */}
        {profile && (
          <div className="xp-bar-section">
            <div className="xp-bar">
              <div className="xp-bar__fill" style={{ width: `${profile.xpForNext > 0 ? (profile.xpProgress / profile.xpForNext) * 100 : 100}%` }} />
            </div>
            <div className="xp-bar__info">
              <span>Level {profile.level}</span>
              <span>{profile.xpProgress} / {profile.xpForNext} XP</span>
              <span>Level {profile.level + 1}</span>
            </div>
          </div>
        )}

        {isLoading && <div className="achievements-loading"><Loader2 size={24} className="achievements-spinner" /></div>}

        {!isLoading && achievements.length === 0 && (
          <div className="achievements-empty">
            <p>No achievements found.</p>
            <button className="achievements-seed" onClick={seedAchievements}>Initialize Achievements</button>
          </div>
        )}

        {/* Earned */}
        {earned.length > 0 && (
          <div className="achievements-section">
            <h3>Earned ({earned.length})</h3>
            <div className="achievements-grid">
              {earned.map((a, i) => (
                <motion.div
                  key={a.key}
                  className="achievement-badge achievement-badge--earned"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="achievement-badge__icon">{a.icon}</span>
                  <span className="achievement-badge__title">{a.title}</span>
                  <span className="achievement-badge__vi">{a.title_vi}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Unearned */}
        {unearned.length > 0 && (
          <div className="achievements-section">
            <h3>Locked ({unearned.length})</h3>
            <div className="achievements-grid">
              {unearned.map((a) => (
                <div key={a.key} className="achievement-badge achievement-badge--locked">
                  <span className="achievement-badge__icon">{a.icon}</span>
                  <span className="achievement-badge__title">{a.title}</span>
                  <span className="achievement-badge__desc">{a.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
