/**
 * Converts pinyin with tone numbers to pinyin with tone marks
 * Example: xie4 xie5 -> xiè xiè
 */

const vowelMap: Record<string, string[]> = {
  'a': ['ā', 'á', 'ǎ', 'à'],
  'o': ['ō', 'ó', 'ǒ', 'ò'],
  'e': ['ē', 'é', 'ě', 'è'],
  'i': ['ī', 'í', 'ǐ', 'ì'],
  'u': ['ū', 'ú', 'ǔ', 'ù'],
  'v': ['ü', 'ǚ', 'ǜ', 'ǘ', 'ǖ'],  // ü with tones
  'n': ['ń', 'ň', 'ǹ'],  // n with tones (rare)
};

const compoundVowels: Record<string, { vowel: string; position: number }[]> = {
  'ai': [{ vowel: 'ai', position: 0 }, { vowel: 'i', position: 1 }],
  'ei': [{ vowel: 'ei', position: 0 }, { vowel: 'i', position: 1 }],
  'ui': [{ vowel: 'ui', position: 0 }, { vowel: 'i', position: 1 }],
  'ao': [{ vowel: 'ao', position: 0 }, { vowel: 'o', position: 1 }],
  'ou': [{ vowel: 'ou', position: 0 }, { vowel: 'u', position: 1 }],
  'iu': [{ vowel: 'iu', position: 0 }, { vowel: 'u', position: 1 }],
  'ie': [{ vowel: 'ie', position: 0 }, { vowel: 'e', position: 1 }],
  'üe': [{ vowel: 'üe', position: 0 }, { vowel: 'e', position: 1 }],
  'er': [{ vowel: 'er', position: 0 }, { vowel: 'r', position: 1 }],
  'an': [{ vowel: 'an', position: 0 }, { vowel: 'n', position: 1 }],
  'en': [{ vowel: 'en', position: 0 }, { vowel: 'n', position: 1 }],
  'in': [{ vowel: 'in', position: 0 }, { vowel: 'n', position: 1 }],
  'un': [{ vowel: 'un', position: 0 }, { vowel: 'n', position: 1 }],
  'ün': [{ vowel: 'ün', position: 0 }, { vowel: 'n', position: 1 }],
  'ang': [{ vowel: 'ang', position: 0 }, { vowel: 'ng', position: 1 }],
  'eng': [{ vowel: 'eng', position: 0 }, { vowel: 'ng', position: 1 }],
  'ing': [{ vowel: 'ing', position: 0 }, { vowel: 'ng', position: 1 }],
  'ong': [{ vowel: 'ong', position: 0 }, { vowel: 'ng', position: 1 }],
};

function getToneDigit(char: string): number | null {
  const match = char.match(/[1-5]/);
  return match ? parseInt(match[0]) : null;
}

function applyTone(vowel: string, tone: number): string {
  if (tone === 5 || tone === 0) {
    // Neutral tone or 0 - no change needed
    return vowel;
  }

  const toneIndex = tone - 1;
  const vowelsWithTone = vowelMap[vowel.toLowerCase()];

  if (vowelsWithTone && vowelsWithTone[toneIndex]) {
    // Preserve case
    if (vowel === vowel.toUpperCase()) {
      return vowelsWithTone[toneIndex].toUpperCase();
    }
    return vowelsWithTone[toneIndex];
  }

  return vowel;
}

function convertWord(word: string): string {
  if (!word || word.length === 0) return word;

  // Check if word has tone number
  const toneMatch = word.match(/[1-5]/);
  if (!toneMatch) return word;

  const tone = parseInt(toneMatch[0]);
  if (tone === 5) {
    // Neutral tone - just remove the number
    return word.replace(/[1-5]/g, '');
  }

  let result = '';
  let i = 0;

  while (i < word.length) {
    // Check for compound vowels first
    let found = false;
    const remaining = word.slice(i);

    for (const [compound, positions] of Object.entries(compoundVowels)) {
      if (remaining.toLowerCase().startsWith(compound)) {
        const mainVowel = positions[0].vowel;
        const hasToneNumber = /\d/.test(remaining.slice(compound.length, compound.length + 1));

        if (hasToneNumber && positions[0].position === 0) {
          // Tone on the main vowel
          const toneDigit = remaining[compound.length];
          const convertedVowel = applyTone(mainVowel, parseInt(toneDigit));
          result += convertedVowel;
          i += compound.length + 1; // Skip compound + tone number
        } else {
          result += word[i];
          i++;
        }
        found = true;
        break;
      }
    }

    if (found) continue;

    // Single character processing
    const char = word[i];
    const toneDigit = word[i + 1];

    if (toneDigit && /[1-5]/.test(toneDigit)) {
      const tone = parseInt(toneDigit);
      const converted = applyTone(char, tone);
      result += converted;
      i += 2; // Skip char + tone number
    } else {
      result += char;
      i++;
    }
  }

  return result;
}

export function formatPinyin(pinyin: string): string {
  if (!pinyin) return '';

  // Handle special case: v -> ü conversion
  let processed = pinyin.replace(/v/g, 'ü');

  // Split by spaces and convert each word
  const words = processed.split(/\s+/);
  const converted = words.map(word => convertWord(word));

  return converted.join(' ');
}
