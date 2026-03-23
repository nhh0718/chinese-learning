import { Clock } from 'lucide-react';
import './Timer.css';

interface Props {
  seconds: number;
}

export default function Timer({ seconds }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 300; // Less than 5 minutes

  return (
    <div className={`exam-timer ${isLow ? 'exam-timer--low' : ''}`}>
      <Clock size={16} />
      <span className="exam-timer__time">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
