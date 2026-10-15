import {createHash} from 'node:crypto';
import {mkdirSync,copyFileSync,writeFileSync,readFileSync} from 'node:fs';
import {questions} from './questions.js';
mkdirSync('dist',{recursive:true});
for(const file of ['style.css','app.js','topics.js','questions.js','question-view.js']) copyFileSync(file,`dist/${file}`);
writeFileSync('dist/index.html',readFileSync('index.html','utf8').replace('{{QUESTION_COUNT}}',String(questions.length)));
const header='#pragma once\n#include <iostream>\n#include <climits>\n#include <algorithm>\n#include <stdexcept>\n#include <vector>\n#include <cstdlib>\nstruct Node { int data; Node* link; };\n';
writeFileSync('dist/solutions.hpp',header+questions.map(q=>`\n// ${q.id}\n${q.brute.code}\n${q.optimized.code}\n`).join(''));
const assets=['index.html','style.css','app.js','topics.js','questions.js','question-view.js'];
const version=createHash('sha256').update(assets.map(file=>readFileSync(file,'utf8')).join('')).digest('hex').slice(0,12);
for(const file of assets.filter(file=>file.endsWith('.js'))) {
 const text=readFileSync(`dist/${file}`,'utf8').replace(/from '(\.\/[^']+\.js)'/g,(_,path)=>`from '${path}?v=${version}'`);
 writeFileSync(`dist/${file}`,text);
}
writeFileSync('dist/index.html',readFileSync('dist/index.html','utf8').replace('src="app.js"',`src="app.js?v=${version}"`).replace('href="style.css"',`href="style.css?v=${version}"`));
console.log(`Built algorithm outline and ${questions.length} question references`);
