import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {questions} from './questions.js';
import {topics} from './topics.js';
assert.equal(questions.length,4);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
for(const q of questions){
 assert(q.topics.every(id=>topics.some(t=>t.id===id)));
 assert(q.source.includes(String(q.year)));
 for(const s of [q.brute,q.optimized]){assert(s.idea&&s.time&&s.space&&s.condition);assert(!/[^\x00-\x7f]/.test(s.code));}
 assert(q.steps.length>=3&&q.cases.length>=3&&q.proof&&q.takeaway);
}
await import('./build.mjs');
const html=readFileSync('dist/index.html','utf8');assert(html.includes('id="question-count">4'));
mkdirSync('.check',{recursive:true});
const exe=process.platform==='win32'?'.check/algorithms.exe':'.check/algorithms';
try{
 execFileSync('g++',['-std=c++17','-Wall','-Wextra','-Werror','tests.cpp','-o',exe],{stdio:'inherit'});
 execFileSync(exe,[],{stdio:'inherit'});
}finally{rmSync(exe,{force:true});}
console.log('Metadata, English code and C++ differential tests passed.');
