import './ReadinessGauge.css';

interface Props {
  level: number;
  readiness: number;
  vocabMastery: number;
  avgTestScore: number;
}

export default function ReadinessGauge({ level, readiness, vocabMastery, avgTestScore }: Props) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (readiness / 100) * circumference;
  const color = readiness >= 70 ? 'var(--color-success)' : readiness >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="readiness-gauge">
      <div className="readiness-gauge__circle">
        <svg viewBox="0 0 100 100" className="readiness-gauge__svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="readiness-gauge__value">
          <span className="readiness-gauge__pct">{readiness}%</span>
          <span className="readiness-gauge__label">HSK {level}</span>
        </div>
      </div>
      <div className="readiness-gauge__details">
        <div className="readiness-gauge__detail">
          <span>Vocab Mastery</span>
          <strong>{vocabMastery}%</strong>
        </div>
        <div className="readiness-gauge__detail">
          <span>Avg Test Score</span>
          <strong>{avgTestScore}%</strong>
        </div>
      </div>
    </div>
  );
}
