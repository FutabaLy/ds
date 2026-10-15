import {questions} from './questions.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function questionView(topic,id) {
 const list=questions.filter(q=>q.topics.includes(topic));
 if(!list.length)return '<div class="empty"><span class="pill">本专题尚未收录</span><h3>继续分批补充</h3><p>当前共收录 4 道线性表相关题目。这里的空状态不表示历年没有本专题真题。</p><a href="#linear/questions">查看已收录的数组题 →</a></div>';
 const q=list.find(x=>x.id===id)||list[0];
 const code=s=>`<pre><code>${esc(s)}</code></pre>`;
 const solution=(s,title)=>`<h3>${title}</h3><p>${esc(s.idea)}</p><div class="tags"><span>时间 ${esc(s.time)}</span><span>额外空间 ${esc(s.space)}</span></div><p class="hint">${esc(s.condition)}</p>${code(s.code)}`;
 return `<nav class="question-picker" aria-label="已收录题目">${list.map(x=>`<a class="${x.id===q.id?'active':''}" href="#${topic}/questions/${x.id}" ${x.id===q.id?'aria-current="page"':''}>${x.year} · ${x.number} ${esc(x.title)}</a>`).join('')}</nav><article class="exam"><span class="pill">${q.year} · 第 ${q.number} 题</span><h2>${esc(q.title)}</h2><p class="source"><a href="${q.source}" target="_blank" rel="noopener">查看公开试卷与题号 ↗</a> · 核对 ${q.checked}</p><p class="hint">题意为本站概述，以下解析与代码为独立整理的参考解，不是官方标准答案。</p><div class="stem">${esc(q.stem)}</div><ul>${q.constraints.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="code-note">代码统一为 C++17，英文标识符与注释。共用声明见下方；可下载整合源码，在本地编译。</p><details><summary>共用声明与下载</summary>${code(`#include <iostream>
#include <climits>
#include <algorithm>
#include <stdexcept>

struct Node { int data; Node* link; };`)}<a href="solutions.hpp" download>下载全部参考函数（solutions.hpp）</a><p class="hint">函数库不含 main；2009 年函数输出数据并返回状态，2013 年函数返回值需由调用方输出。仅含参考函数，不含在线判分。</p></details><details class="answer" open><summary>暴力解法 / 基础解</summary>${solution(q.brute,'① 先得到正确结果')}</details><div class="callout"><strong>② 瓶颈在哪里</strong><p>${esc(q.bottleneck)}</p></div><details class="answer" open><summary>优化解法</summary>${solution(q.optimized,'③ 从瓶颈到优化')}<h3>为什么正确</h3><p>${esc(q.proof)}</p></details><section class="walkthrough"><h3>④ 分步推导 · 自编示例</h3><p id="walk-step" aria-live="polite">${esc(q.steps[0])}</p><div class="walk-controls"><button data-walk="prev" disabled>← 上一步</button><span id="walk-count">1 / ${q.steps.length}</span><button data-walk="next">下一步 →</button></div></section><h3>⑤ 两解对照</h3><div class="table-scroll"><table><thead><tr><th>方案</th><th>时间</th><th>额外空间</th></tr></thead><tbody><tr><td>暴力 / 基础</td><td>${esc(q.brute.time)}</td><td>${esc(q.brute.space)}</td></tr><tr><td>优化</td><td>${esc(q.optimized.time)}</td><td>${esc(q.optimized.space)}</td></tr></tbody></table></div><h3>⑥ 边界与自查</h3><div class="table-scroll"><table><thead><tr><th>用例</th><th>期望结果</th></tr></thead><tbody>${q.cases.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div><ul>${q.pitfalls.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="callout"><strong>速记结论</strong><p>${esc(q.takeaway)}</p></div></article>`;
}
export function bindWalk(topic,id){
 const list=questions.filter(q=>q.topics.includes(topic)),q=list.find(x=>x.id===id)||list[0];if(!q)return;
 let step=0;const prev=document.querySelector('[data-walk="prev"]'),next=document.querySelector('[data-walk="next"]');
 const update=()=>{document.querySelector('#walk-step').textContent=q.steps[step];document.querySelector('#walk-count').textContent=`${step+1} / ${q.steps.length}`;prev.disabled=step===0;next.disabled=step===q.steps.length-1;};
 prev.addEventListener('click',()=>{step=Math.max(0,step-1);update();});next.addEventListener('click',()=>{step=Math.min(q.steps.length-1,step+1);update();});
}
