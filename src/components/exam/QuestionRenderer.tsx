import { Volume2 } from 'lucide-react';
import type { MockQuestion } from '../../types';
import './QuestionRenderer.css';

interface Props {
  question: MockQuestion;
  selectedAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  questionNumber: number;
}

export default function QuestionRenderer({ question, selectedAnswer, onAnswer, questionNumber }: Props) {
  const isListening = question.type.startsWith('listening');

  const handleTTS = () => {
    if (question.audioText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="question-renderer">
      <div className="question-renderer__header">
        <span className="question-renderer__number">Q{questionNumber}</span>
        <span className="question-renderer__type">{question.type.replace('_', ' ')}</span>
      </div>

      {/* Listening: audio button */}
      {isListening && (
        <button className="question-renderer__audio" onClick={handleTTS} type="button">
          <Volume2 size={24} />
          <span>Play Audio</span>
        </button>
      )}

      {/* Reading: passage */}
      {question.passage && (
        <div className="question-renderer__passage chinese-text">
          {question.passage}
        </div>
      )}

      {/* Question text */}
      <p className="question-renderer__text">{question.question}</p>
      {question.questionChinese && (
        <p className="question-renderer__chinese chinese-text">{question.questionChinese}</p>
      )}

      {/* Options */}
      <div className="question-renderer__options">
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`question-option ${selectedAnswer === option ? 'question-option--selected' : ''}`}
            onClick={() => onAnswer(option)}
          >
            <span className="question-option__letter">{String.fromCharCode(65 + i)}</span>
            <span className="question-option__text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
