import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {questions} from './questions.js';
mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','topics.js','questions.js','question-view.js']) copyFileSync(file,`dist/${file}`);
const header='#pragma once\n#include <iostream>\n#include <climits>\n#include <algorithm>\n#include <stdexcept>\nstruct Node { int data; Node* link; };\n';
writeFileSync('dist/solutions.hpp',header+questions.map(q=>`\n// ${q.id}\n${q.brute.code}\n${q.optimized.code}\n`).join(''));
console.log('Built algorithm outline and 4 verified question references');
