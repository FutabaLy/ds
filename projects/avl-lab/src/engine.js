export const clone=t=>t?{v:t.v,l:clone(t.l),r:clone(t.r)}:null;
export const height=t=>t?1+Math.max(height(t.l),height(t.r)):0;
export const balance=t=>t?height(t.l)-height(t.r):0;
export function bst(t,v){if(!t)return {v,l:null,r:null};if(v<t.v)t.l=bst(t.l,v);else if(v>t.v)t.r=bst(t.r,v);return t;}
export function locate(t,v){while(t&&t.v!==v)t=v<t.v?t.l:t.r;return t;}
function attach(t,v,replacement){if(t.v===v)return replacement;if(v<t.v)t.l=attach(t.l,v,replacement);else t.r=attach(t.r,v,replacement);return t;}
function rotate(t,v,dir){const p=locate(t,v),q=dir==='right'?p.l:p.r;if(dir==='right'){p.l=q.r;q.r=p;}else{p.r=q.l;q.l=p;}return attach(t,v,q);}
export const cases={
 LL:{label:'左左型',sub:'一次右旋',base:[50,30,70,20,40],value:10,desc:'插入 10，让 50 的左孩子的左子树长高。'},
 RR:{label:'右右型',sub:'一次左旋',base:[30,10,50,40,70],value:90,desc:'插入 90，让 30 的右孩子的右子树长高。'},
 LR:{label:'左右型',sub:'先左旋，再右旋',base:[50,20,70,10,30],value:40,desc:'插入 40，观察中间结点如何升到子树根。'},
 RL:{label:'右左型',sub:'先右旋，再左旋',base:[24,13,53,37,90],value:48,desc:'你的例题：插入 48，37 的左右孩子会是谁？'}
};
export function traceInsert(original,value){let root=clone(original);const frames=[];const snap=(title,text,focus=[],kind='step',type=null)=>frames.push({tree:clone(root),title,text,focus,kind,type,value});
 const path=[];let p=root;while(p){path.push(p.v);if(value===p.v){snap('已有这个关键字','本演示不重复插入相同关键字。',[p.v]);return {root,frames};}p=value<p.v?p.l:p.r;}
 root=bst(root,value);snap(`插入 ${value}`,`按大小找到位置：${[...path,value].join(' → ')}。随后从新结点向根检查平衡因子。`,[value],'insert');
 const bad=[...path].reverse().find(v=>Math.abs(balance(locate(root,v)))>1);
 if(bad===undefined){snap('检查完成 · 无需旋转','每个结点的左右子树高度差都不超过 1。',[value],'done');return {root,frames};}
 const z=locate(root,bad),left=balance(z)>1,child=left?z.l:z.r,type=left?(value<child.v?'LL':'LR'):(value>child.v?'RR':'RL');
 snap(`发现 ${type} 型失衡`,`从下往上，第一个失衡结点是 ${bad}，BF = ${balance(z)}。方向从 ${bad} 出发判断，不是只看插入路径的最后两步。`,[bad,child.v],'diagnose',type);
 function turn(v,dir){const a=locate(root,v),b=dir==='right'?a.l:a.r,beta=dir==='right'?b.r:b.l;const text=`${b.v} 上升，${v} 下移；${beta?`以 ${beta.v} 为根的子树接到 ${v} 的${dir==='right'?'左':'右'}侧`:'中间转接子树为空'}。旋转保持中序顺序不变。`;root=rotate(root,v,dir);snap(`对 ${v} ${dir==='right'?'右旋':'左旋'}`,text,[v,b.v,...(beta?[beta.v]:[])],'rotate',type);}
 if(type==='LL')turn(bad,'right');if(type==='RR')turn(bad,'left');if(type==='LR'){turn(child.v,'left');turn(bad,'right');}if(type==='RL'){turn(child.v,'right');turn(bad,'left');}
 snap('恢复平衡',`所有结点 |BF| ≤ 1。${type==='RL'&&bad===24?'37 的左孩子是 24，右孩子是 53；48 接到 53 的左侧。':'检查旋转前后的中序序列：关键字顺序始终相同。'}`,[],'done',type);return {root,frames};}
export function preset(key){const c=cases[key];let t=null;for(const v of c.base)t=bst(t,v);return [{tree:clone(t),title:'旋转前 · 先观察',text:c.desc,focus:[],kind:'initial',value:c.value},...traceInsert(t,c.value).frames];}
export function custom(values){let root=null;const frames=[{tree:null,title:'空树开始',text:'按输入顺序逐个插入，每次插入后自动检查并恢复平衡。',focus:[],kind:'initial'}];for(const v of values){const r=traceInsert(root,v);root=r.root;frames.push(...r.frames);}return frames;}
export function inorder(t){return t?[...inorder(t.l),t.v,...inorder(t.r)]:[];}
