import {topics} from './topics.js';
const $=s=>document.querySelector(s);
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=topics[0].id, tab='knowledge';
const validTabs=['knowledge','method','questions','summary'];
function readHash(){const [id,section]=location.hash.slice(1).split('/'); selected=topics.some(t=>t.id===id)?id:topics[0].id; tab=validTabs.includes(section)?section:'knowledge'; render();}
function navigate(){location.hash=`${selected}/${tab}`; render();}
function renderList(){const q=$('#search').value.trim().toLowerCase(); const list=topics.filter(t=>[t.title,t.description,...t.tags].join(' ').toLowerCase().includes(q)); $('#topic-list').innerHTML=list.length?list.map(t=>`<button class="topic-button" data-topic="${t.id}" aria-pressed="${t.id===selected}"><span>${String(topics.indexOf(t)+1).padStart(2,'0')}</span>${escape(t.title)}</button>`).join(''):'<p class="hint">没有匹配专题，试试“链表”或“遍历”。</p>';}
function render(){renderList(); const t=topics.find(t=>t.id===selected); $('#topic-head').innerHTML=`<span class="pill">学习大纲 · ${String(topics.indexOf(t)+1).padStart(2,'0')} / 08</span><h2>${escape(t.title)}</h2><p>${escape(t.description)}</p>`; document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
let html='';
if(tab==='knowledge') html=`<h3>先掌握这些</h3><div class="tags">${t.tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div><ul>${t.knowledge.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><div class="callout">学习目标：能够解释操作为什么正确，并指出算法成立的前提。</div>`;
if(tab==='method') html=`<h3>落笔前的解题路线</h3><ol>${t.method.map(x=>`<li>${escape(x)}</li>`).join('')}</ol><div class="callout">本页先提供推导框架；与具体题目对应的代码逐步执行和状态动画待后续补充。</div>${t.resource?`<a class="resource" href="${t.resource[0]}">${escape(t.resource[1])}</a>`:''}`;
if(tab==='questions') html=`<div class="empty"><span class="pill">待补充 · 当前 0 题</span><h3 style="margin-top:16px">先核对题目，再收录解析。</h3><p>计划核对 2009 年以来的 408 数据结构算法设计题，按专题归档。同一道题只保留一份正文，用标签关联多个知识点。</p><p>目前没有填入未经核对的年份、题号或考频，也不把自编示例标为真题。</p></div><details class="template"><summary>查看每道题的统一内容结构</summary><ol><li>年份、题号、分值、公开来源与核对状态</li><li>题意整理、输入输出与约束</li><li>知识点与核心突破口</li><li>分步推导、状态变化与算法代码</li><li>时间 / 空间复杂度与成立条件</li><li>边界用例、常见错误与自查清单</li><li>可复用结论与变式练习（单独标注）</li></ol></details>`;
if(tab==='summary') html=`<h3>先记结论，也记条件</h3><dl>${t.summary.map(([a,b])=>`<dt>${escape(a)}</dt><dd>${escape(b)}</dd>`).join('')}</dl><div class="callout">速查用来检查推导；答题时仍需结合题目说明算法思想和复杂度依据。</div>`;
$('#panel').innerHTML=html; }
$('#search').addEventListener('input',renderList);
$('#topic-list').addEventListener('click',e=>{const b=e.target.closest('[data-topic]'); if(!b)return; selected=b.dataset.topic; navigate(); if(matchMedia('(max-width:800px)').matches) $('#detail').scrollIntoView({block:'start'});});
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]'); if(!b)return; tab=b.dataset.tab; navigate();});
window.addEventListener('hashchange',readHash);readHash();
