import type { FSRSGrade } from '../../types';
import './GradeButtons.css';

interface Props {
  onGrade: (grade: FSRSGrade) => void;
  disabled?: boolean;
}

const GRADES: { grade: FSRSGrade; label: string; labelVi: string; className: string }[] = [
  { grade: 1, label: 'Again', labelVi: 'Lại', className: 'grade-btn--again' },
  { grade: 2, label: 'Hard', labelVi: 'Khó', className: 'grade-btn--hard' },
  { grade: 3, label: 'Good', labelVi: 'Tốt', className: 'grade-btn--good' },
  { grade: 4, label: 'Easy', labelVi: 'Dễ', className: 'grade-btn--easy' },
];

export default function GradeButtons({ onGrade, disabled }: Props) {
  return (
    <div className="grade-buttons">
      {GRADES.map(({ grade, label, labelVi, className }) => (
        <button
          key={grade}
          className={`grade-btn ${className}`}
          onClick={() => onGrade(grade)}
          disabled={disabled}
        >
          <span className="grade-btn__label">{label}</span>
          <span className="grade-btn__vi">{labelVi}</span>
        </button>
      ))}
    </div>
  );
}
