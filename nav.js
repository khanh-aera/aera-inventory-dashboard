/* Shared header + burger drawer behaviour for the AERA inventory dashboard.
   Every page calls AERA_NAV.mount('index'|'parts'|'filaments'|'relations'|'log').
   Nav links are defined HERE only — pages no longer carry their own <nav>. */
(function () {
  var TABS = [
    { href: './',            label: 'Tổng quan',        key: 'index' },
    { href: './parts.html',   label: 'Linh kiện in 🧩', key: 'parts' },
    { href: './relations.html', label: 'Quan hệ 🔗',     key: 'relations' },
    { href: './filaments.html', label: 'Filament 🧵',    key: 'filaments' },
    { href: './log.html',     label: 'Nhật ký 📋',       key: 'log' }
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function mount(activeKey) {
    var body = document.body;
    var old = document.querySelector('.a-hdr');
    if (old) old.parentNode.removeChild(old);
    var oldD = document.querySelector('.a-drawer');
    if (oldD) oldD.parentNode.removeChild(oldD);

    // ---- header ----
    var hdr = el('header', 'a-hdr');
    var brand = el('a', 'a-brand', '<i></i>AERA');
    brand.setAttribute('href', './');
    hdr.appendChild(brand);

    var burger = el('button', 'a-burger',
      '<span></span><span></span><span></span>');
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    hdr.appendChild(burger);
    body.insertBefore(hdr, body.firstChild);

    // ---- drawer ----
    var drawer = el('div', 'a-drawer');
    var close = el('button', 'a-close', '&times;');
    close.setAttribute('aria-label', 'Đóng');
    drawer.appendChild(close);
    var ul = el('ul');
    TABS.forEach(function (t) {
      var li = document.createElement('li');
      var a = el('a', t.key === activeKey ? 'on' : '', esc(t.label));
      a.setAttribute('href', t.href);
      if (t.key === activeKey) a.setAttribute('aria-current', 'page');
      li.appendChild(a);
      ul.appendChild(li);
    });
    drawer.appendChild(ul);
    body.appendChild(drawer);

    function setOpen(on) {
      if (on) body.classList.add('a-open');
      else body.classList.remove('a-open');
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    burger.addEventListener('click', function () {
      setOpen(!body.classList.contains('a-open'));
    });
    close.addEventListener('click', function () { setOpen(false); });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  window.AERA_NAV = { mount: mount, tabs: TABS };
})();
