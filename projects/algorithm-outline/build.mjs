import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','topics.js']) copyFileSync(file,`dist/${file}`);
console.log('Built algorithm outline');
