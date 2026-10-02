window.RELREADY=(async()=>{
let items=[],META={};
try{const _j=await(await fetch('./inventory.json?t='+Date.now())).json();items=_j.items||[];META=_j;}catch(e){
console.error('inventory.json load failed');return;}
if(META.generated){const lb=document.querySelector('.livebadge span:last-child');if(lb)lb.textContent='Live · '+META.generated;}
const byName={};items.forEach(d=>byName[d.name]=d);
const CRIT='crit',LOW='low',OK='ok';
const stOf=d=>d.alert===0?OK:d.stock<=d.alert*.5?CRIT:d.stock<=d.alert?LOW:OK;
const STC={ok:'#30A46C',low:'#E5484D',crit:'#FFB224'};
const nodes=[],links=[],seen={},lseen={};
function addNode(n,cat){if(seen[n])return seen[n];const d=byName[n]||{name:n,stock:0,unit:'pcs',alert:2,cat};
const o={id:n,cat,d,r:cat==='product'?24:d.cat==='PrintedComponent'?15:d.cat==='Filament'?14:12};nodes.push(o);seen[n]=o;return o;}
LAMPS.forEach(L=>{const ln=addNode(L.id,'product');ln.label=L.label;ln.isLamp=true;ln.parts=L.parts;
L.parts.forEach(p=>{const pn=addNode(p,(byName[p]||{}).cat||'PrintedComponent');links.push({source:L.id,target:p,lamp:L.id});
if(FIL[p]){addNode(FIL[p],'Filament');links.push({source:p,target:FIL[p],fil:true,lamp:L.id});}});});
const NBY={};nodes.forEach(n=>NBY[n.id]=n);
items.forEach(d=>{if(!seen[d.name]){const o=addNode(d.name,d.cat);o.orphan=true;}});
const chipsEl=document.getElementById('chips');
const CHIPS=[['ALL','Tất cả'],['F','FLORIA thường'],['FP','FLORIA PRO'],['S','STRATA']];
chipsEl.innerHTML=CHIPS.map(([k,l],i)=>`<button class="chip ${i===0?'active':''}" data-k="${k}">${l}</button>`).join('');
let focus='ALL';
chipsEl.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;focus=b.dataset.k;
chipsEl.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active',x.dataset.k===focus));applyFocus();});
const lampId=l=>typeof l.source==='string'?l.source:l.source.id;
const idOf=x=>typeof x==='string'?x:x.id;
function inFocus(n){
if(focus==='ALL')return true;
if(n.isLamp)return n.id===focus;
return links.some(l=>lampId(l)===focus&&(idOf(l.source)===n.id||idOf(l.target)===n.id));
}
function applyFocus(){
window.nodeSel.attr('opacity',n=>inFocus(n)?1:.12);
window.linkSel.attr('opacity',l=>{const a=NBY[typeof l.source==='string'?l.source:l.source.id],b=NBY[typeof l.target==='string'?l.target:l.target.id];return inFocus(a)&&inFocus(b)?(l.fil?.5:.85):.05;});
}
const tooltip=document.getElementById('tooltip');
const svg=d3.select('#graph'),box=document.getElementById('graphbox');
const W=box.clientWidth,H=box.clientHeight;
svg.attr('viewBox',[-W/2,-H/2,W,H]);
nodes.forEach((n,i)=>{if(n.orphan){const a=(i*2.39996)%(Math.PI*2),R=Math.min(W,H)*.52;n.x=R*Math.cos(a);n.y=R*Math.sin(a);}});
const g=svg.append('g');
window.g=g;
svg.call(d3.zoom().scaleExtent([.4,3]).on('zoom',e=>g.attr('transform',e.transform)));
window.nodes=nodes;window.links=links;window.byName=byName;window.box=box;window.tooltip=tooltip;window.applyFocus=applyFocus;window.stOf=stOf;window.CRIT=CRIT;window.LOW=LOW;window.OK=OK;window.STC=STC;window.W=W;window.H=H;window.svg=svg;window.lampId=lampId;window.inFocus=inFocus;window.idOf=idOf;window.chipsEl=chipsEl;window.focus=focus;window.seen=seen;window.NBY=NBY;window.items=items;window.META=META;window.addNode=addNode;
})();