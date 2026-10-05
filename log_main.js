/* Log tab — renders window.LOGDATA (log_data.js) as a filterable timeline.
   Data is bundled, not fetched: the log is historical and changes only when
   a new inventory command is recorded. */
(function () {
  var D = window.LOGDATA || { entries: [] };
  var entries = D.entries || [];

  var KIND = {
    sale:    { label: 'Bán',     cls: 't-sale' },
    produce: { label: 'Sản xuất', cls: 't-produce' },
    recount: { label: 'Đếm lại', cls: 't-recount' },
    restock: { label: 'Nhập kho', cls: 't-restock' }
  };

  /* newest first — the log is read most often from the bottom up */
  var order = entries.slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  function fmt(v) {
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    var s = Math.abs(n % 1) < 1e-9 ? String(Math.round(n)) : n.toFixed(3);
    return s;
  }

  function deltaBadge(ch) {
    var d = Number(ch.a) - Number(ch.b);
    var cls = d < 0 ? 'd-neg' : d > 0 ? 'd-pos' : 'd-zero';
    var sign = d > 0 ? '+' : (d < 0 ? '' : '±');
    return '<div class="dlt ' + cls + '">' + sign + fmt(d) + '</div>';
  }

  function rowWithDelta(ch) {
    return '<div class="row">' +
      '<div class="rname" title="' + ch.m + '">' + ch.m + '</div>' +
      '<div class="num">' + fmt(ch.b) + '</div>' +
      '<div class="arw">→</div>' +
      '<div class="num now">' + fmt(ch.a) + '</div>' +
      deltaBadge(ch) +
      '</div>';
  }

  function entryHtml(e) {
    var k = KIND[e.kind] || { label: e.kind, cls: 't-recount' };
    var d = e.date.split('-').reverse().join('/');
    return '<div class="entry k-' + e.kind + '">' +
      '<div class="ehead">' +
        '<span class="tag ' + k.cls + '">' + k.label + '</span>' +
        '<span class="edate">' + d + '</span>' +
        '<span class="enote">' + e.note + '</span>' +
        (e.commit ? '<span class="ecommit">' + e.commit + '</span>' : '') +
      '</div>' +
      '<div class="rows">' + e.changes.map(rowWithDelta).join('') + '</div>' +
      '</div>';
  }

  var counts = {};
  entries.forEach(function (e) { counts[e.kind] = (counts[e.kind] || 0) + 1; });

  var bar = document.getElementById('bar');
  var active = 'all';

  function chips() {
    var html = '<button class="chip' + (active === 'all' ? ' on' : '') +
      '" data-k="all">Tất cả <b>' + entries.length + '</b></button>';
    ['sale', 'produce', 'recount', 'restock'].forEach(function (k) {
      if (!counts[k]) return;
      html += '<button class="chip' + (active === k ? ' on' : '') +
        '" data-k="' + k + '">' + (KIND[k] ? KIND[k].label : k) +
        ' <b>' + counts[k] + '</b></button>';
    });
    bar.innerHTML = html;
    Array.prototype.forEach.call(bar.querySelectorAll('.chip'), function (b) {
      b.addEventListener('click', function () {
        active = b.getAttribute('data-k');
        render();
      });
    });
  }

  function render() {
    chips();
    var tl = document.getElementById('tl');
    var list = active === 'all' ? order : order.filter(function (e) {
      return e.kind === active;
    });
    if (!list.length) {
      tl.innerHTML = '<div class="empty">Không có bản ghi nào.</div>';
      return;
    }
    tl.innerHTML = list.map(entryHtml).join('');
  }

  render();
})();
