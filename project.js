/* Behaviour for project / case-study pages (loaded after home.js):
   scroll progress · reveal · before/after sliders · step viewers · lightbox for images and video. */
(function () {
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  PF.chrome({ home: PF.me.home });
  /* screens in a flow appear one by one: each gets its own reveal, staggered across its row */
  $$('.shots, .pflow, .tiles, .w2h, .grid2, .grid3, .grid4, .stats, .gal').forEach(function (g) {
    var cols = (getComputedStyle(g).gridTemplateColumns || '').split(' ').filter(Boolean).length || 1;
    [].slice.call(g.children).forEach(function (c, i) { c.classList.add('rv', 'pop'); c.style.setProperty('--d', (i % cols) * 140 + 'ms'); });
  });
  /* before / after labels sit above the comparison, not on top of it */
  $$('.ba').forEach(function (ba) {
    var w = document.createElement('div'); w.className = 'ba-wrap'; ba.parentNode.insertBefore(w, ba);
    var lab = document.createElement('div'); lab.className = 'ba-lab';
    $$('.l', ba).forEach(function (l) { lab.appendChild(l); });
    w.appendChild(lab); w.appendChild(ba);
  });
  PF.reveal('.rv', { threshold: 0.08 });

  /* back button, top-left (replaces the logo on project pages) */
  var nav = document.getElementById('nav'), brand = nav && nav.querySelector('.brand');
  if (brand) {
    var back = document.createElement('a'); back.className = 'back'; back.setAttribute('aria-label', 'Back to home'); back.title = 'Back to home';
    back.href = PF.me.home + (document.body.getAttribute('data-back') || '');
    back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
    nav.replaceChild(back, brand);
  }

  /* reading progress */
  var bar = document.querySelector('.progress');
  if (bar) {
    var prog = function () { var h = document.documentElement; bar.style.setProperty('--sp', (h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)).toFixed(4)); };
    addEventListener('scroll', prog, { passive: true }); prog();
  }

  /* run fn once when el is on screen, and tell it when it leaves / returns */
  function watch(el, onChange, threshold) {
    if (!('IntersectionObserver' in window)) { onChange(true); return; }
    new IntersectionObserver(function (en) { onChange(en[0].isIntersecting); }, { threshold: threshold || 0.35 }).observe(el);
  }

  /* ---- before / after slider: drag anywhere; glides once on first view as a hint ---- */
  $$('.ba').forEach(function (ba) {
    var hinted = false, dragging = false;
    function set(x) { ba.style.setProperty('--x', Math.max(2, Math.min(98, x)).toFixed(2) + '%'); }
    function at(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener('pointerdown', function (e) { dragging = true; hinted = true; ba.setPointerCapture(e.pointerId); at(e); });
    ba.addEventListener('pointermove', function (e) { if (dragging) at(e); });
    ['pointerup', 'pointercancel'].forEach(function (n) { ba.addEventListener(n, function () { dragging = false; }); });
    ba.tabIndex = 0; ba.setAttribute('role', 'slider'); ba.setAttribute('aria-label', 'Before and after comparison');
    ba.addEventListener('keydown', function (e) {
      var cur = parseFloat(getComputedStyle(ba).getPropertyValue('--x')) || 50;
      if (e.key === 'ArrowLeft') set(cur - 4); else if (e.key === 'ArrowRight') set(cur + 4);
    });
    ba.hint = function () {
      if (hinted || PF.reduced) return; hinted = true;
      var t0 = performance.now(), D = 2200;
      (function step(now) {
        if (dragging) return;
        var p = Math.min(1, (now - t0) / D); set(50 + Math.sin(p * Math.PI * 2) * 26 * (1 - p * 0.25));
        if (p < 1) requestAnimationFrame(step); else set(50);
      })(t0);
    };
    watch(ba, function (v) { if (v && ba.offsetParent) ba.hint(); }, 0.5);
  });
  /* tabs that switch which comparison is shown */
  $$('.ba-set').forEach(function (set) {
    var tabs = $$('.seg button', set), panes = $$('.ba', set);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, k) { x.classList.toggle('on', k === i); });
        panes.forEach(function (x, k) { x.classList.toggle('on', k === i); });
        if (panes[i].hint) panes[i].hint();
      });
    });
  });

  /* ---- step viewer: auto-advances while on screen, pauses on hover, click to jump ---- */
  $$('.viewer').forEach(function (v) {
    var tabs = $$('.steps button', v), imgs = $$('.screen img', v), cur = 0, timer = null, visible = false, hover = false, DUR = 4500;
    v.style.setProperty('--dur', DUR + 'ms');
    function show(i) {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === cur); });
      imgs.forEach(function (m, k) { m.classList.toggle('on', k === cur); });
    }
    function run() {
      clearInterval(timer); v.classList.remove('play');
      if (!visible || hover || PF.reduced) return;
      void v.offsetWidth; v.classList.add('play');
      timer = setInterval(function () { v.classList.remove('play'); show(cur + 1); void v.offsetWidth; v.classList.add('play'); }, DUR);
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); run(); }); });
    v.addEventListener('mouseenter', function () { hover = true; run(); });
    v.addEventListener('mouseleave', function () { hover = false; run(); });
    watch(v, function (on) { visible = on; run(); }, 0.4);
    show(0);
  });

  /* ---- drill-down: the after layers all stay on stage (click one, or a step, to bring it forward);
          the before panel waits behind and swaps places with the after panel when chosen ---- */
  $$('.drill').forEach(function (d) {
    var tabs = $$('.drill-foot button:not(.cap)', d), cap = d.querySelector('.drill-foot .cap'), lys = $$('.ly', d),
        bp = d.querySelector('.drill-b'), st = d.querySelector('.drill-stage'), bimg = bp && bp.querySelector('img'), cur = 0;
    /* a screen opens full size only when it is already in front, on the click after the one that chose it */
    function arm(el, src, ok) { setTimeout(function () { if (ok()) el.setAttribute('data-zoom', src); }, 0); }
    function side(b) {
      d.classList.toggle('b-on', b); if (cap) cap.classList.toggle('on', b);
      if (bimg) { bimg.removeAttribute('data-zoom'); if (b) arm(bimg, bimg.getAttribute('src'), function () { return d.classList.contains('b-on'); }); }
      if (b) tabs.forEach(function (t) { t.classList.remove('on'); });
    }
    function show(n) {
      cur = n; side(false);
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === n); });
      lys.forEach(function (l, k) {
        l.classList.toggle('on', k === n); l.style.zIndex = 10 * (lys.length - Math.abs(k - n)) + k;
        l.removeAttribute('data-zoom');
      });
      var f = lys[n], full = f && f.getAttribute('data-full');
      if (full) arm(f, full, function () { return cur === n && !d.classList.contains('b-on'); });
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    lys.forEach(function (l, i) { l.addEventListener('click', function () { if (cur !== i) show(i); }); });
    if (cap) cap.addEventListener('click', function () { side(true); });
    if (bp) bp.addEventListener('click', function () { if (!d.classList.contains('b-on')) side(true); });
    if (st) st.addEventListener('click', function (e) { if (d.classList.contains('b-on')) { e.stopPropagation(); show(cur); } }, true);
    show(+d.getAttribute('data-s') || 0);
  });
  /* ---- annotated before / after: a note and its pin light up together ---- */
  $$('.case').forEach(function (c) {
    $$('[data-p]', c).forEach(function (el) {
      var mates = $$('[data-p="' + el.getAttribute('data-p') + '"]', c);
      el.addEventListener('mouseenter', function () { mates.forEach(function (m) { m.classList.add('hl'); }); });
      el.addEventListener('mouseleave', function () { mates.forEach(function (m) { m.classList.remove('hl'); }); });
    });
  });

  /* ---- lightbox: any [data-zoom] image at full size, any [data-vimeo] button as a player ---- */
  var lb = document.createElement('div');
  lb.className = 'lb'; lb.innerHTML = '<button class="x" aria-label="Close">×</button><div class="in"></div>';
  document.body.appendChild(lb);
  var inner = lb.querySelector('.in');
  function close() { lb.classList.remove('on'); setTimeout(function () { if (!lb.classList.contains('on')) inner.innerHTML = ''; }, 300); }
  lb.addEventListener('click', function (e) { if (!e.target.closest('.vid')) close(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]'), w = e.target.closest('[data-vimeo],[data-youtube]');
    if (z) {
      inner.innerHTML = '<img src="' + (z.getAttribute('data-zoom') || z.currentSrc || z.src) + '" alt="">'; inner.style.display = 'contents'; lb.classList.add('on');
      /* show the whole image, as large as the window allows (small sources may grow up to 2x) */
      var big = inner.firstChild, fit = function () {
        if (!big.naturalWidth) return;
        var pad = Math.max(14, Math.min(44, innerWidth * .03)) * 2, k = Math.min((innerWidth - pad) / big.naturalWidth, (innerHeight - pad) / big.naturalHeight, 2);
        big.style.width = Math.floor(big.naturalWidth * k) + 'px'; big.style.height = 'auto';
      };
      big.addEventListener('load', fit); fit();
    }
    else if (w) {
      inner.style.display = 'contents';
      inner.innerHTML = '<div class="vid" style="aspect-ratio:' + (w.getAttribute('data-ratio') || '16/10') + '"><iframe allow="autoplay; fullscreen; picture-in-picture" allowfullscreen src="' +
        (w.getAttribute('data-youtube') ? 'https://www.youtube.com/embed/' + w.getAttribute('data-youtube') + '?autoplay=1' : 'https://player.vimeo.com/video/' + w.getAttribute('data-vimeo') + '?autoplay=1&badge=0&autopause=0') + '"></iframe></div>';
      lb.classList.add('on');
    }
  });
})();
