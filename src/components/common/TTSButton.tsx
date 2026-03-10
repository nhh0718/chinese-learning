import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import './TTSButton.css';

interface TTSButtonProps {
    text: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function TTSButton({ text, size = 'md', className = '' }: TTSButtonProps) {
    const { speak } = useTTS();
    const [isPlaying, setIsPlaying] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(true);
        speak(text);
        setTimeout(() => setIsPlaying(false), 1500);
    };

    const sizeMap = { sm: 14, md: 18, lg: 22 };

    return (
        <button
            className={`tts-btn tts-btn--${size} ${isPlaying ? 'tts-btn--playing' : ''} ${className}`}
            onClick={handleClick}
            aria-label={`Listen to pronunciation: ${text}`}
            title="Listen"
        >
            <Volume2 size={sizeMap[size]} />
            {isPlaying && (
                <span className="tts-btn__waves">
                    <span /><span /><span />
                </span>
            )}
        </button>
    );
}
