import './SessionProgress.css';

interface Props {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
}

export default function SessionProgress({ current, total, correct, incorrect }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="session-progress">
      <div className="session-progress__bar-track">
        <div className="session-progress__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="session-progress__info">
        <span className="session-progress__count">{current} / {total}</span>
        <div className="session-progress__stats">
          <span className="session-progress__correct">{correct} correct</span>
          <span className="session-progress__sep">·</span>
          <span className="session-progress__incorrect">{incorrect} wrong</span>
        </div>
      </div>
    </div>
  );
}
