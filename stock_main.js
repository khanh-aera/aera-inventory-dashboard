/* Renders the stock page using STOCK.buildable() from stock_calc.js. */
(async function () {
  let META = {}, items = [];
  try {
    META = await (await fetch('./inventory.json?t=' + Date.now())).json();
    items = META.items || [];
  } catch (e) { console.error('inventory load failed', e); return; }

  const K = window.STOCK;
  const stock = {};
  items.forEach(d => { stock[d.name] = d.stock; });
  const short = K.short;

  // BOM as a plain list of parts per product (assembly only)
  const bomList = {};
  Object.keys(BOM.bom).forEach(p => { bomList[p] = Object.keys(BOM.bom[p]); });

  const FAMILIES = [
    { name: 'FLORIA', items: Object.keys(bomList).filter(p => p.indexOf('floria') === 0) },
    { name: 'STRATA', items: Object.keys(bomList).filter(p => p.indexOf('strata') === 0) }
  ];

  /* ---- A. hero cards ---- */
  const grid = document.getElementById('capgrid');
  const info = {};
  FAMILIES.forEach(function (fam) {
    if (!fam.items.length) return;
    const r = K.buildable(bomList, fam.items, stock);
    // A material is a real bottleneck only if it is REQUIRED by something and
    // is fully consumed. The shared shell is what caps the whole family.
    const dead = Object.keys(r.left).filter(m => r.left[m] <= 0 && stock[m] > 0);
    // prefer naming the most-shared exhausted part: that is what caps
    // every remaining product at once.
    dead.sort(function (a, b) { return r.use[b].length - r.use[a].length; });
    info[fam.name] = { r: r, fam: fam, dead: dead };
    const b = dead[0];
    const blockers = dead.filter(function (m) { return r.use[m].length === Math.max.apply(null, dead.map(function (x) { return r.use[x].length; })); });
    let line;
    if (!dead.length) {
      line = 'đủ linh kiện cho tất cả';
    } else if (blockers.length > 1) {
      line = 'hết <b>' + blockers.slice(0, 2).map(short).join('</b> + <b>') + '</b>';
    } else {
      line = 'hết <b>' + short(b) + '</b>';
    }
    grid.insertAdjacentHTML('beforeend',
      '<div class="capcard' + (r.total <= 0 ? ' blocked' : '') + '">' +
      '<div class="fname">' + fam.name + '</div>' +
      '<div class="big">' + r.total + '</div>' +
      '<div class="unit">đèn dựng được</div>' +
      '<div class="limit">' + line + '</div></div>');
  });

  /* ---- constraint ladder ---- */
  const seen = {}, ladder = [];
  Object.keys(info).forEach(nm => {
    const f = info[nm].fam;
    const use = K.bomUse(bomList, f.items);
    Object.keys(use).forEach(m => {
      if (seen[m]) return;
      seen[m] = 1;
      ladder.push({ m: m, used: use[m].length, stock: stock[m] });
    });
  });
  ladder.sort((a, b) => {
    const ra = a.stock ? a.stock / Math.max(a.used, 1) : 0;
    const rb = b.stock ? b.stock / Math.max(b.used, 1) : 0;
    return ra - rb;
  });
  const maxRatio = Math.max.apply(null, ladder.map(l =>
    l.stock ? l.stock / Math.max(l.used, 1) : 0).concat([1]));
  const blockNames = {};
  Object.keys(info).forEach(nm => info[nm].dead.forEach(m => { blockNames[m] = 1; }));

  document.getElementById('ladder').innerHTML = ladder.map(l => {
    const ratio = l.stock / Math.max(l.used, 1);
    const w = Math.max(4, Math.min(100, (ratio / maxRatio) * 100));
    return '<div class="lrow' + (blockNames[l.m] ? ' isblock' : '') + '">' +
      '<span class="n" title="' + l.m + ' × ' + l.used + ' sản phẩm">' + short(l.m) + '</span>' +
      '<span class="v">' + l.stock + (l.used > 1 ? ' <em style="font-style:normal;opacity:.6">/×' + l.used + '</em>' : '') + '</span>' +
      '<span class="bar"><i style="width:' + w + '%"></i></span></div>';
  }).join('');
  document.getElementById('laddersub').textContent =
    ladder.length + ' linh kiện · ÷ số sản phẩm dùng · vàng = đã cạn';

  /* ---- B. bullet list ---- */
  function state(d) {
    if (!d.alert) return 'ok';
    if (d.stock <= d.alert * 0.5) return 'out';
    if (d.stock <= d.alert) return 'low';
    if (d.stock <= d.alert * 2) return 'near';
    return 'ok';
  }
  const LBL = { out: 'Hết', low: 'Thấp', near: 'Sắp hết', ok: 'Đủ' };

  const list = items.slice().sort((a, b) =>
    ((a.alert ? a.stock / a.alert : 99) - (b.alert ? b.stock / b.alert : 99)) ||
    a.name.localeCompare(b.name));

  document.getElementById('bul').innerHTML = list.map(function (d, i) {
    const s = state(d), a = d.alert || 0;
    const ref = a > 0 ? Math.max(a * 3, d.stock) : Math.max(d.stock, 1);
    const pct = Math.min(d.stock / ref, 1) * 100;
    const critPct = a > 0 ? (a * 0.5 / ref) * 100 : 0;
    const lowPct = a > 0 ? (a / ref) * 100 : 0;
    const tick = a > 0 ? Math.min((a / ref) * 100, 100) : -1;
    let sub = '';
    if (d.cat === 'Filament') {
      sub = 'còn in được <b>' + Math.floor(d.stock / BOM.rate) + '</b> linh kiện nữa · 0.124 kg/cai';
    } else if (blockNames[d.name]) {
      sub = 'đang <b>hết</b> — chặn số đèn dựng được';
    } else if (a > 0) {
      sub = 'ngưỡng mua lại <b>' + a + '</b> ' + d.unit;
    }
    return '<div class="bul st-' + s + '" style="animation-delay:' + Math.min(i * 20, 460) + 'ms">' +
      '<div class="top">' +
      '<span class="nm">' + short(d.name) + '</span>' +
      '<span class="qty">' + d.stock + '<u>' + d.unit + '</u></span>' +
      '<span class="pill ' + s + '">' + LBL[s] + '</span>' +
      '</div>' +
      '<div class="bullet" style="--crit:' + critPct + '%;--low:' + lowPct + '%">' +
      '<i style="width:' + pct + '%"></i>' +
      (tick >= 0 ? '<em style="left:' + tick + '%"></em>' : '') +
      '</div>' +
      (sub ? '<div class="sub">' + sub + '</div>' : '') +
      '</div>';
  }).join('');
  document.getElementById('bulsub').textContent = items.length + ' vật tư · chạm để xem chi tiết';

  document.getElementById('bul').addEventListener('click', function (e) {
    const b = e.target.closest('.bul');
    if (b) b.classList.toggle('open');
  });

  const rb = document.getElementById('reloadBtn');
  rb.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:34px;' +
    'height:34px;margin-top:12px;border-radius:50%;border:1px solid rgba(238,238,238,.25);' +
    'background:rgba(238,238,238,.06);color:var(--plat);font-size:15px;cursor:pointer';
  rb.addEventListener('click', function () {
    rb.style.transition = 'transform .4s';
    rb.style.transform = 'rotate(360deg)';
    setTimeout(function () { location.reload(); }, 400);
  });
})();
