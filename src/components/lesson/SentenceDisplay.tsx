import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TTSButton from '../common/TTSButton';
import type { Sentence } from '../../types';
import './SentenceDisplay.css';

interface SentenceDisplayProps {
    sentence: Sentence;
}

export default function SentenceDisplay({ sentence }: SentenceDisplayProps) {
    const [showTranslation, setShowTranslation] = useState(false);
    const [showAnnotation, setShowAnnotation] = useState<'pinyin' | 'zhuyin' | null>('pinyin');

    return (
        <div className="sentence-display">
            <div className="sentence-display__main">
                <div className="sentence-display__chinese-wrap">
                    {showAnnotation && (
                        <div className="sentence-display__annotation">
                            {showAnnotation === 'pinyin' ? sentence.pinyin : sentence.zhuyin}
                        </div>
                    )}
                    <div className="sentence-display__chinese chinese-text">
                        {sentence.chinese}
                    </div>
                </div>
                <TTSButton text={sentence.chinese} size="sm" />
            </div>

            <div className="sentence-display__controls">
                <div className="sentence-display__annotation-toggle">
                    <button
                        className={`sentence-display__toggle-btn ${showAnnotation === 'pinyin' ? 'sentence-display__toggle-btn--active' : ''}`}
                        onClick={() => setShowAnnotation(showAnnotation === 'pinyin' ? null : 'pinyin')}
                    >
                        Pinyin
                    </button>
                    <button
                        className={`sentence-display__toggle-btn ${showAnnotation === 'zhuyin' ? 'sentence-display__toggle-btn--active' : ''}`}
                        onClick={() => setShowAnnotation(showAnnotation === 'zhuyin' ? null : 'zhuyin')}
                    >
                        注音
                    </button>
                </div>

                <button
                    className="sentence-display__reveal-btn"
                    onClick={() => setShowTranslation(!showTranslation)}
                >
                    {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showTranslation ? 'Hide' : 'Show'} translation</span>
                </button>
            </div>

            {showTranslation && (
                <div className="sentence-display__translation">
                    {sentence.translation}
                </div>
            )}
        </div>
    );
}
