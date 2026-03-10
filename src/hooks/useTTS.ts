import { useCallback, useRef } from 'react';

export function useTTS() {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isSpeakingRef = useRef(false);

    const speak = useCallback((text: string, lang: string = 'zh-TW') => {
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a zh-TW voice
        const voices = window.speechSynthesis.getVoices();
        const twVoice = voices.find(
            (v) => v.lang === 'zh-TW' || v.lang.startsWith('zh-TW')
        );
        const zhVoice = voices.find(
            (v) => v.lang.startsWith('zh')
        );
        if (twVoice) {
            utterance.voice = twVoice;
        } else if (zhVoice) {
            utterance.voice = zhVoice;
        }

        utterance.onstart = () => {
            isSpeakingRef.current = true;
        };
        utterance.onend = () => {
            isSpeakingRef.current = false;
        };
        utterance.onerror = () => {
            isSpeakingRef.current = false;
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
    }, []);

    return { speak, stop };
}
