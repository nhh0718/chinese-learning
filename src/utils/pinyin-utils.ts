const toneMap: Record<string, string[]> = {
    a: ['a', 'ā', 'á', 'ǎ', 'à'],
    o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
    e: ['e', 'ē', 'é', 'ě', 'è'],
    i: ['i', 'ī', 'í', 'ǐ', 'ì'],
    u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
    v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
    ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
    n: ['n', 'ń', 'ň', 'ǹ', 'n'], // n neutral is just n
    ng: ['ng', 'ńg', 'ňg', 'ǹg', 'ng']
};

export function formatPinyin(pinyin: string): string {
    if (!pinyin) return '';

    // If it already has tone marks (non-ASCII letters), split and process partially,
    // or just return as is if no digits are present.
    if (!/\d/.test(pinyin)) {
        return pinyin;
    }

    const words = pinyin.split(/(\s+)/);

    return words.map(word => {
        if (!/\d/.test(word)) return word;

        const match = word.match(/^([a-zA-ZüÜ]+)(\d+)(.*)$/);
        if (!match) return word;

        const [, letters, toneNumStr, rest] = match;
        const toneNum = parseInt(toneNumStr, 10);
        
        // Neutral tone is typically 5 or 0. If it's not 1-4, we just return the letters without marks
        if (toneNum < 1 || toneNum > 4) {
             let baseStr = letters.toLowerCase();
             baseStr = baseStr.replace(/v/g, 'ü');
             return baseStr + rest;
        }

        let s = letters.toLowerCase();
        s = s.replace(/v/g, 'ü');

        // Pinyin tone placement rules:
        // 1. If there's an 'a', put it on 'a'
        // 2. If no 'a' but there's an 'o' or 'e', put it on that
        // 3. If 'iu', put it on 'u'. If 'ui', put it on 'i'. (Put on the final vowel)
        // 4. Otherwise, put it on the first vowel found
        let targetVowelIdx = -1;
        let targetVowel = '';

        if (s.includes('a')) { targetVowel = 'a'; targetVowelIdx = s.indexOf('a'); }
        else if (s.includes('e')) { targetVowel = 'e'; targetVowelIdx = s.indexOf('e'); }
        else if (s.includes('ou')) { targetVowel = 'o'; targetVowelIdx = s.indexOf('o'); }
        else if (s.includes('o')) { targetVowel = 'o'; targetVowelIdx = s.indexOf('o'); }
        else if (s.includes('iu')) { targetVowel = 'u'; targetVowelIdx = s.indexOf('u'); }
        else if (s.includes('ui')) { targetVowel = 'i'; targetVowelIdx = s.indexOf('i'); }
        else if (s.includes('i')) { targetVowel = 'i'; targetVowelIdx = s.indexOf('i'); }
        else if (s.includes('u')) { targetVowel = 'u'; targetVowelIdx = s.indexOf('u'); }
        else if (s.includes('ü')) { targetVowel = 'ü'; targetVowelIdx = s.indexOf('ü'); }

        if (targetVowelIdx !== -1) {
            const marks = toneMap[targetVowel];
            if (marks && marks[toneNum]) {
                return s.slice(0, targetVowelIdx) + marks[toneNum] + s.slice(targetVowelIdx + 1) + rest;
            }
        }

        return s + rest;
    }).join('');
}

/**
 * Scans a full text string (e.g., definitions, sentences) for embedded raw pinyin.
 * Embedded raw pinyin usually looks like "chi1" inside "biến thể của 吃[chi1] [chi1] [khiết]".
 * Replaces any matches with formatted pinyin.
 */
export function formatEmbeddedPinyin(text: string): string {
    if (!text) return '';
    // Look for words that are letters ending in 1-5. \b ensures we match word boundaries.
    return text.replace(/\b([a-zA-ZüÜ]+[1-5])\b/g, (match) => {
        return formatPinyin(match);
    });
}
