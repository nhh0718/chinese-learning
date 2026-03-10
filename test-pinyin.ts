import { formatPinyin } from './src/utils/pinyin-utils';

console.log('Test 1: ge1 ge ->', formatPinyin('ge1 ge'));
console.log('Test 2: ge1 ge5 ->', formatPinyin('ge1 ge5'));
console.log('Test 3: bà ba ->', formatPinyin('bà ba'));
console.log('Test 4: gē ge ->', formatPinyin('gē ge'));
console.log('Test 5: ma1 ma5 ->', formatPinyin('ma1 ma5'));
console.log('Test 6: ge1 ge1 ->', formatPinyin('ge1 ge1'));
