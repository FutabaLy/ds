import {mkdirSync,copyFileSync,writeFileSync,readFileSync} from 'node:fs';
import {questions} from './questions.js';
mkdirSync('dist',{recursive:true});
for(const file of ['style.css','app.js','topics.js','questions.js','question-view.js']) copyFileSync(file,`dist/${file}`);
writeFileSync('dist/index.html',readFileSync('index.html','utf8').replace('{{QUESTION_COUNT}}',String(questions.length)));
const header='#pragma once\n#include <iostream>\n#include <climits>\n#include <algorithm>\n#include <stdexcept>\n#include <vector>\n#include <cstdlib>\nstruct Node { int data; Node* link; };\n';
writeFileSync('dist/solutions.hpp',header+questions.map(q=>`\n// ${q.id}\n${q.brute.code}\n${q.optimized.code}\n`).join(''));
console.log(`Built algorithm outline and ${questions.length} question references`);
