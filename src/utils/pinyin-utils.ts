// Simple pinyin tone converter - handles all common cases

const toneMap: Record<string, string[]> = {
  a: ['', 'ā', 'á', 'ǎ', 'à'],
  o: ['', 'ō', 'ó', 'ǒ', 'ò'],
  e: ['', 'ē', 'é', 'ě', 'è'],
  i: ['', 'ī', 'í', 'ǐ', 'ì'],
  u: ['', 'ū', 'ú', 'ǔ', 'ù'],
  v: ['', 'ǖ', 'ǘ', 'ǚ', 'ǜ'], // ü
  n: ['', 'ń', 'ň', 'ǹ', ''],
  ng: ['', 'ńg', 'ňg', 'ǹg', '']
};

export function formatPinyin(pinyin: string): string {
  if (!pinyin) return '';

  // Handle compound vowels first (shuangpin style: ia -> a, ie -> e, etc)
  let s = pinyin.toLowerCase();
  s = s.replace(/ia/g, 'a').replace(/ie/g, 'e');
  s = s.replace(/iao/g, 'ao').replace(/iu/g, 'ou');
  s = s.replace(/ian/g, 'an').replace(/iang/g, 'ang').replace(/iong/g, 'ong');
  s = s.replace(/ua/g, 'wa').replace(/uo/g, 'wo');
  s = s.replace(/uai/g, 'wai').replace(/ui/g, 'wei');
  s = s.replace(/uan/g, 'wan').replace(/uang/g, 'wang').replace(/ueng/g, 'weng');
  s = s.replace(/üe/g, 've').replace(/üan/g, 'van').replace(/ün/g, 'ven');

  // Replace v with ü
  s = s.replace(/v/g, 'ü');

  // Convert tone numbers to marks
  const words = s.split(/(\s+)/);

  return words.map(word => {
    if (!/\d/.test(word)) return word;

    const match = word.match(/^([a-zü]+)(\d)(.*)$/);
    if (!match) return word;

    const [, consonants, toneNum, rest] = match;
    const tone = parseInt(toneNum) - 1;

    // Find vowel in consonants
    const vowels = 'aoeiü'.split('');
    for (const v of vowels) {
      const idx = consonants.indexOf(v);
      if (idx !== -1) {
        const marks = toneMap[v];
        if (marks && marks[tone]) {
          return marks[tone] + consonants.slice(idx + 1) + rest;
        }
      }
    }

    // No vowel found, just append tone mark to end
    if (toneMap[consonants] && toneMap[consonants][tone]) {
      return toneMap[consonants][tone] + rest;
    }

    return word;
  }).join('');
}
