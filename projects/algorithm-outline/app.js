import {questionView,bindWalk} from './question-view.js';
import {questions} from './questions.js';
import {topics} from './topics.js';
const $=s=>document.querySelector(s);
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=topics[0].id, tab='knowledge',questionId='';
const validTabs=['knowledge','method','questions','summary'];
function readHash(){const [id,section,qid]=location.hash.slice(1).split('/'); selected=topics.some(t=>t.id===id)?id:topics[0].id; tab=validTabs.includes(section)?section:'knowledge'; questionId=qid||''; render();}
function navigate(){location.hash=`${selected}/${tab}${tab==='questions'&&questionId?'/'+questionId:''}`; render();}
function renderList(){const q=$('#search').value.trim().toLowerCase(); const list=topics.filter(t=>[t.title,t.description,...t.tags].join(' ').toLowerCase().includes(q)); $('#topic-list').innerHTML=list.length?list.map(t=>`<button class="topic-button" data-topic="${t.id}" aria-pressed="${t.id===selected}"><span>${String(topics.indexOf(t)+1).padStart(2,'0')}</span>${escape(t.title)}</button>`).join(''):'<p class="hint">没有匹配专题，试试“链表”或“遍历”。</p>';}
function render(){renderList(); const t=topics.find(t=>t.id===selected); $('#topic-head').innerHTML=`<span class="pill">学习大纲 · ${String(topics.indexOf(t)+1).padStart(2,'0')} / 08</span><h2>${escape(t.title)}</h2><p>${escape(t.description)}</p>`; document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
let html='';
if(tab==='knowledge') html=`<h3>先掌握这些</h3><div class="tags">${t.tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div><ul>${t.knowledge.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><div class="callout">学习目标：能够解释操作为什么正确，并指出算法成立的前提。</div>`;
if(tab==='method') html=`<h3>落笔前的解题路线</h3><ol>${t.method.map(x=>`<li>${escape(x)}</li>`).join('')}</ol><h3>从暴力解到优化解</h3><ol><li><strong>暴力解法：</strong>先给出直观、正确的基础方案，说明思路、代码及时间 / 空间复杂度。</li><li><strong>瓶颈分析：</strong>找出重复计算、重复遍历或不必要的存储。</li><li><strong>优化解法：</strong>解释如何消除瓶颈，再给出分步推导与代码。</li><li><strong>两解对照：</strong>比较复杂度、适用条件与是否满足题目约束；基础解已最优时明确说明。</li></ol><div class="callout">本栏提供通用推导框架；已收录题目的分步示例与两种解法位于“历年真题”。</div>${questions.some(q=>q.topics.includes(selected))?`<p><a class="resource" href="#${selected}/questions">查看本专题真题与分步推导 →</a></p>`:''}${t.resource?`<a class="resource" href="${t.resource[0]}">${escape(t.resource[1])}</a>`:''}`;
if(tab==='questions') html=questionView(selected,questionId);
if(tab==='summary') html=`<h3>先记结论，也记条件</h3><dl>${t.summary.map(([a,b])=>`<dt>${escape(a)}</dt><dd>${escape(b)}</dd>`).join('')}</dl><div class="callout">速查用来检查推导；答题时仍需结合题目说明算法思想和复杂度依据。</div>`;
$('#panel').innerHTML=html; if(tab==='questions') bindWalk(selected,questionId); }
$('#search').addEventListener('input',renderList);
$('#topic-list').addEventListener('click',e=>{const b=e.target.closest('[data-topic]'); if(!b)return; selected=b.dataset.topic; navigate(); if(matchMedia('(max-width:800px)').matches) $('#detail').scrollIntoView({block:'start'});});
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]'); if(!b)return; tab=b.dataset.tab; navigate();});
window.addEventListener('hashchange',readHash);readHash();
