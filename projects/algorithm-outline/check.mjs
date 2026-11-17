import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {questions} from './questions.js';
import {topics} from './topics.js';
import {standardAnswer} from './standard-answer.js';
assert.deepEqual(questions.map(q=>q.id),["2009-42","2010-42","2011-42","2012-41","2012-42","2013-41","2014-41","2015-41","2016-43","2017-41","2018-41","2019-41","2019-42","2020-41","2020-42","2021-41","2021-42","2022-41","2022-42","2023-41","2024-41","2025-41","2026-41"]);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
for(const q of questions){
 assert(q.topics.every(id=>topics.some(t=>t.id===id)));
 assert(q.source.includes(String(q.year)));
 for(const s of [q.brute,q.optimized]){assert(s.idea&&s.time&&s.space&&s.condition);assert(!/[^\x00-\x7f]/.test(s.code));}
 assert(q.steps.length>=3&&q.cases.length>=3&&q.proof&&q.takeaway);
}
await import('./build.mjs');
const html=readFileSync('dist/index.html','utf8');assert(html.includes(`id="question-count">${questions.length}`));
mkdirSync('.check',{recursive:true});
const exe=process.platform==='win32'?'.check/algorithms.exe':'.check/algorithms';
try{
 const cFlags=['-std=c11','-pedantic-errors','-Wall','-Wextra','-Werror'];
 writeFileSync('.check/all.c','#include "../dist/solutions.h"\n');
 execFileSync('cc',[...cFlags,'-fsyntax-only','.check/all.c'],{stdio:'inherit'});
 for(const q of questions){
  execFileSync('cc',[...cFlags,'dist/answers/'+q.id+'.c','-o',exe],{stdio:'inherit'});
  assert.equal(execFileSync(exe,{encoding:'utf8'}).trim(),standardAnswer(q).expected,q.id);
 }
 execFileSync('g++',['-std=c++17','-Wall','-Wextra','-Werror','tests.cpp','-o',exe],{stdio:'inherit'});
 execFileSync(exe,[],{stdio:'inherit'});
}finally{rmSync(exe,{force:true});}
console.log('Metadata, strict C11 builds, all runnable examples and differential tests passed.');
