import assert from 'node:assert/strict';
import {preset,custom,inorder,balance} from './src/engine.js';
function valid(t,min=-Infinity,max=Infinity){if(!t)return;assert(t.v>min&&t.v<max);assert(Math.abs(balance(t))<=1);valid(t.l,min,t.v);valid(t.r,t.v,max)}
for(const key of ['LL','RR','LR','RL']){const f=preset(key);valid(f.at(-1).tree);assert(f.some(s=>s.type===key));for(const s of f.slice(1))assert.deepEqual(inorder(s.tree),inorder(f.at(-1).tree));}
const exam=preset('RL').at(-1).tree;assert.equal(exam.v,37);assert.equal(exam.l.v,24);assert.equal(exam.r.v,53);assert.equal(exam.r.l.v,48);
let seed=347;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<200;i++){const a=Array.from({length:12},(_,j)=>j-6);for(let k=a.length-1;k>0;k--){let q=Math.floor(rand()*(k+1));[a[k],a[q]]=[a[q],a[k]];}const f=custom(a);for(const s of f.filter(s=>s.kind==='done'))valid(s.tree);assert.deepEqual(inorder(f.at(-1).tree),[...a].sort((x,y)=>x-y));}
console.log('PASS: four rotations, exam structure, order preservation, 200 insertion permutations.');

