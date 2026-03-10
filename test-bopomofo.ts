import pinyin from 'pinyin';

function check() {
    console.log('哥哥 (bopomofo):', pinyin('哥哥', { style: 'bopomofo' }));
    console.log('妈妈 (bopomofo):', pinyin('妈妈', { style: 'bopomofo' }));
}
check();
