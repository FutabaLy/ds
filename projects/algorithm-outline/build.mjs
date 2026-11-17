import {createHash} from 'node:crypto';
import {mkdirSync,copyFileSync,writeFileSync,readFileSync} from 'node:fs';
import {questions} from './questions.js';
import {commonDeclarations, standardAnswer} from './standard-answer.js';
mkdirSync('dist/answers',{recursive:true});
for(const file of ['style.css','app.js','topics.js','questions.js','question-view.js','standard-answer.js']) copyFileSync(file,`dist/${file}`);
writeFileSync('dist/index.html',readFileSync('index.html','utf8').replace('{{QUESTION_COUNT}}',String(questions.length)));
writeFileSync('dist/solutions.h','#ifndef DS_SOLUTIONS_H\n#define DS_SOLUTIONS_H\n'+commonDeclarations+'\n'+questions.map(q=>`\n// ${q.id}\n` + [q.declarations,q.brute.code,q.optimized.code].filter(Boolean).join('\n\n')+'\n').join('')+'\n#endif\n');
for(const q of questions) writeFileSync(`dist/answers/${q.id}.c`,standardAnswer(q).code);
const assets=['index.html','style.css','app.js','topics.js','questions.js','question-view.js','standard-answer.js'];
const version=createHash('sha256').update(assets.map(file=>readFileSync(file,'utf8')).join('')).digest('hex').slice(0,12);
for(const file of assets.filter(file=>file.endsWith('.js'))) {
 const text=readFileSync(`dist/${file}`,'utf8').replace(/from '(\.\/[^']+\.js)'/g,(_,path)=>`from '${path}?v=${version}'`);
 writeFileSync(`dist/${file}`,text);
}
writeFileSync('dist/index.html',readFileSync('dist/index.html','utf8').replace('src="app.js"',`src="app.js?v=${version}"`).replace('href="style.css"',`href="style.css?v=${version}"`));
console.log(`Built algorithm outline and ${questions.length} question references`);
