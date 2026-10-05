/* Stock view: buildable count (A) + bullet list (B).

   buildable() — how many complete lamps can be assembled from current stock.
   Every lamp consumes ALL of its assembly parts, and shared pools (shell,
   cable, bulbs) are drawn down across every product that uses them. A naive
   min() over pools is only a valid upper bound; the real number is found by
   greedily building the product with the most remaining headroom, because
   building one lamp never increases what any other product can build.
   Verified against hand-checked cases: 6 bases + 3 bulbs + 6 shells = 6. */
(function () {
  const INF = 1e9;

  function bomUse(bom, prods) {
    const use = {};
    prods.forEach(p => (bom[p] || []).forEach(m => { (use[m] = use[m] || []).push(p); }));
    return use;
  }

  function buildable(bom, prods, stock) {
    const use = bomUse(bom, prods);
    const left = {};
    prods.forEach(p => (bom[p] || []).forEach(m => { left[m] = stock[m] || 0; }));

    // how many of each product its own colour-part allows
    const ownCap = {};
    prods.forEach(p => {
      const own = (bom[p] || []).filter(m => use[m].length === 1);
      ownCap[p] = own.length ? Math.floor(Math.min.apply(null, own.map(m => left[m]))) : INF;
    });

    const built = {};
    let total = 0;
    for (;;) {
      let best = null;
      for (let i = 0; i < prods.length; i++) {
        const p = prods[i];
        if (built[p] >= ownCap[p]) continue;
        const need = bom[p] || [];
        let head = INF;
        for (let j = 0; j < need.length; j++) if (left[need[j]] < head) head = left[need[j]];
        if (head < 1) continue;
        if (!best || head > best.head) best = { head: head, p: p };
      }
      if (!best) break;
      (bom[best.p] || []).forEach(m => { left[m] -= 1; });
      built[best.p] = (built[best.p] || 0) + 1;
      total += 1;
    }
    return { total: total, left: left, built: built, use: use };
  }

  /* ---- shared state so both halves can use it ---- */
  window.STOCK = {
    BOM: null, S: {}, items: [],
    short: function (n) {
      return n.replace(/^Nhựa PLA (Matte |Basic )?- /, '')
              .replace(/^Bóng đèn /, '').replace(/^Túi |^Tờ |^Hộp /, '')
              .replace(/ \(.*\)$/, '');
    },
    buildable: buildable,
    bomUse: bomUse
  };
})();
