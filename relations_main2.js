RELREADY.then(()=>{
const sim=d3.forceSimulation(nodes)
.force('link',d3.forceLink(links).id(d=>d.id).distance(l=>l.fil?95:120).strength(.35))
.force('charge',d3.forceManyBody().strength(-320))
.force('center',d3.forceCenter(0,0))
.force('collide',d3.forceCollide().radius(d=>d.r+22));
const linkSel=g.selectAll('line').data(links).join('line')
.attr('stroke',l=>l.fil?'#00B8A9':'rgba(126,166,255,.5)')
.attr('stroke-width',l=>l.fil?1.5:2)
.attr('stroke-dasharray',l=>l.fil?'5 4':'none');
const nodeSel=g.selectAll('g.node').data(nodes).join('g').attr('class','node').style('cursor','pointer');
window.nodeSel=nodeSel;window.linkSel=linkSel;
nodeSel.append('circle').attr('r',d=>d.orphan?10:d.r)
.attr('fill',d=>d.isLamp?'rgba(0,56,188,.4)':CATC[d.cat]+'26')
.attr('stroke',d=>{if(d.isLamp)return '#7EA6FF';const s=stOf(d.d);if(d.orphan&&s===OK)return 'rgba(200,206,216,.55)';return s===OK?CATC[d.cat]:STC[s];})
.attr('stroke-width',d=>d.isLamp?3:2.5);
nodeSel.append('text').attr('text-anchor','middle').attr('dy',5)
.style('fill','#EEEEEE').style('font-weight',800).style('font-size',d=>d.isLamp?13:11)
.style('pointer-events','none')
.text(d=>d.isLamp?'':d.d.unit==='kg'?d.d.stock.toFixed(2).replace(/\.?0+$/,''):Math.round(d.d.stock));
nodeSel.append('text').attr('text-anchor','middle').attr('y',d=>d.r+14)
.style('fill','#C9CDD4').style('font-size',9.5).style('font-weight',600).style('pointer-events','none')
.text(d=>d.isLamp?d.label:SHORT(d.id));
nodeSel.call(d3.drag().on('start',(e,d)=>{if(!e.active)sim.alphaTarget(.25).restart();d.fx=d.x;d.fy=d.y;})
.on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y;})
.on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));
nodeSel.on('mouseenter',(e,d)=>{
const s=stOf(d.d);
const cap=d.isLamp?Math.min(...d.parts.map(p=>(byName[p]||{stock:0}).stock)):null;
tooltip.innerHTML=`<div class="tname">${d.isLamp?d.label:d.id}</div>`+
(d.isLamp?'':`<div class="trow">Tồn: <b>${d.d.stock} ${d.d.unit}</b> · alert ${d.d.alert}</div>`)+
(d.isLamp?'':`<div class="trow">Trạng thái: <b style="color:${STC[s]}">${s===OK?'ĐỦ':s===LOW?'SẮP HẾT':'NGUY CẤP'}</b></div>`)+
(cap!==null?`<div class="trow">Đủ linh kiện cho <b>≈${cap}</b> đèn</div>`:'')+
(FIL[d.id]?`<div class="trow">In từ: <b>${FIL[d.id]}</b></div>`:'');
tooltip.style.display='block';moveTip(e);
const idOf=window.idOf;
nodeSel.attr('opacity',n=>n===d||links.some(l=>(idOf(l.source)===d.id||idOf(l.target)===d.id))?1:.12);
linkSel.attr('opacity',l=>idOf(l.source)===d.id||idOf(l.target)===d.id?.95:.05);})
.on('mousemove',moveTip)
.on('mouseleave',()=>{tooltip.style.display='none';applyFocus();});
function moveTip(e){const r=box.getBoundingClientRect();
let x=e.clientX-r.left+14,y=e.clientY-r.top+10;
if(x>r.width-270)x-=290;if(y>r.height-130)y-=140;
tooltip.style.left=x+'px';tooltip.style.top=y+'px';}
sim.on('tick',()=>{
linkSel.attr('x1',l=>l.source.x).attr('y1',l=>l.source.y).attr('x2',l=>l.target.x).attr('y2',l=>l.target.y);
nodeSel.attr('transform',d=>`translate(${d.x},${d.y})`);});
applyFocus();
});