import fs from 'fs';
import path from 'path';
import readline from 'readline';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pinyinToZhuyin from 'pinyin-to-zhuyin';

import Vocabulary from '../models/Vocabulary';
import connectDB from '../config/db';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const CVDICT_PATH = path.join(__dirname, '../../data/CVDICT.u8');
const HANVIET_PATH = path.join(__dirname, '../../data/hanviet.csv');

interface HanVietData {
    char: string;
    hanviet: string;
    pinyin: string;
}

const hanvietMap = new Map<string, string>();

// Regex to parse CC-CEDICT format: Trad Simp [pinyin] /meaning 1/meaning 2/
const DICT_REGEX = /^(.+?) (.+?) \[(.+?)\] \/(.+)\//;

const normalizeHanVietArray = (str: string) => {
    // str looks like "['thượng']" or "['cơ', 'kì']"
    try {
        const arr = str.replace(/'/g, '"');
        return JSON.parse(arr).join(', ');
    } catch (e) {
        return str.replace(/\[|\]|'/g, ''); // fallback basic string clean
    }
};

const ingestData = async () => {
    await connectDB();
    console.log('Clearing existing vocabulary...');
    await Vocabulary.deleteMany({});

    console.log('Loading Han Viet mapping...');
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(HANVIET_PATH)
            .pipe(csv())
            .on('data', (data: HanVietData) => {
                // Create a key from char + pinyin
                const key = `${data.char}-${data.pinyin}`;
                hanvietMap.set(key, normalizeHanVietArray(data.hanviet));
            })
            .on('end', () => {
                console.log(`Loaded ${hanvietMap.size} Han Viet mappings.`);
                resolve();
            })
            .on('error', reject);
    });

    console.log('Processing CVDICT...');
    const fileStream = fs.createReadStream(CVDICT_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let batch: any[] = [];
    const BATCH_SIZE = 1000;
    let lineCount = 0;
    let insertedCount = 0;

    for await (const line of rl) {
        if (line.startsWith('#')) continue; // skip comments
        lineCount++;

        const match = line.match(DICT_REGEX);
        if (!match) continue;

        const [, trad, simp, pinyinStr, meaningStr] = match;

        // CC-CEDICT pinyin is space-separated with numbers: ni3 hao3. 
        // CVDICT sometimes adds tones.
        let zhuyinStr = '';
        try {
            zhuyinStr = pinyinToZhuyin(pinyinStr);
        } catch (e) {
            zhuyinStr = ''; // fallback if conversion fails
        }

        // Try to find han viet reading. For multi-character words, we might not have a full mapping in the CSV, 
        // but we can try mapping the first character or using a fallback logic.
        // For simplicity, we just check if the whole traditional word with its first pinyin syllable matches.
        const firstPinyin = pinyinStr.split(' ')[0] || '';
        const hanviet = hanvietMap.get(`${trad}-${firstPinyin}`) || hanvietMap.get(`${trad}-`) || '';

        batch.push({
            traditional: trad,
            simplified: simp,
            pinyin: pinyinStr,
            zhuyin: zhuyinStr,
            meaning_vi: meaningStr.split('/').join('; '),
            han_viet: hanviet
        });

        if (batch.length >= BATCH_SIZE) {
            await Vocabulary.insertMany(batch);
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount} words...`);
            batch = [];

            // For testing, let's stop after 10000 records so we don't wait forever
            if (insertedCount >= 10000) break;
        }
    }

    if (batch.length > 0) {
        await Vocabulary.insertMany(batch);
        insertedCount += batch.length;
    }

    console.log(`Ingestion Complete! Processed ${lineCount} lines, Inserted ${insertedCount} vocabulary words.`);
    process.exit(0);
};

ingestData().catch(err => {
    console.error(err);
    process.exit(1);
});
