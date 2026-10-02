.id(d=>d.id).distance(l=>l.fil?95:120).strength(.35))
.force('charge',d3.forceManyBody().strength(-320))
.force('center',d3.forceCenter(0,0))
.force('collide',d3.forceCollide().radius(d=>d.r+22));
const linkSel=g.selectAll('line').data(links).join('line')
.attr('stroke',l=>l.fil?'#00B8A9':'rgba(126,166,255,.5)')
.attr('stroke-width',l=>l.fil?1.5:2)
.attr('stroke-dasharray',l=>l.fil?'5 4':'none');
const nodeSel=g.selectAll('g.node').data(nodes).join('g').attr('class','node').style('cursor','pointer');
nodeSel.append('circle').attr('r',d=>d.orphan?10:d.r)
.attr('fill',d=>d.isLamp?'rgba(0,56,188,.4)':CATC[d.cat]+'26')
.attr('stroke',d=>{if(d.isLamp)return '#7EA6FF';const s=stOf(d.d);if(d.orphan&&s===OK)return 'rgba(200,206,216,.55)';return s===OK?CATC[d.cat]:STC[s];})
.attr('stroke-width',d=>d.isLamp?3:2.5);
nodeSel.append('text').attr('text-anchor','middle').attr('dy',5)
.style('fill','#EEEEEE').style('font-weight',800).style('font-size',d=>d.isLamp?13:11)
.style('pointer-events','none')
.text(d=>d.isLamp?'':d.d.unit==='kg'?d.d.stock.toFixed(2).replace(/\.?0+$/,''):Math.round(d.d.stock));
