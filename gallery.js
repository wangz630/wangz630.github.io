/* For the image-led project pages (sun·a·wear, From Print To Digital, Marine Life).
   · the first screen keeps its design but animates in (title letters, tags, cover)
   · the images listed in #slides are laid out as a justified gallery — one wide image, then pairs —
     and rise into place one by one as they scroll into view; click opens an image full size. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = document.createElement('style');
  css.textContent =
    '#container{width:min(1280px,92vw)!important;max-width:none!important;margin:40px auto 90px!important}' +
    '#slides{padding:0!important;max-width:none!important;margin:0!important}' +
    '.gl-row{display:flex;gap:clamp(10px,1.4vw,22px);margin-bottom:clamp(10px,1.4vw,22px)}' +
    '.gl-it{position:relative;flex:1 1 0;min-width:0;margin:0;border-radius:14px;overflow:hidden;cursor:zoom-in;background:rgba(128,128,128,.12);' +
    'opacity:0;transform:translateY(60px) scale(.96);transition:opacity 1s ease var(--d,0ms),transform 1.2s cubic-bezier(.2,.8,.2,1) var(--d,0ms)}' +
    '.gl-it.in{opacity:1;transform:none}' +
    '.gl-it img{display:block;width:100%!important;height:100%;object-fit:cover;position:static!important;left:auto!important;transform:none;padding:0!important;margin:0!important;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}' +
    '.gl-it:hover img{transform:scale(1.035)}' +
    '#slides > .caption1{margin:90px 0 34px!important}' +
    '.gl-lb{position:fixed;inset:0;z-index:999;background:rgba(10,10,12,.9);display:grid;place-items:center;padding:3vw;opacity:0;pointer-events:none;transition:opacity .3s;cursor:zoom-out}' +
    '.gl-lb.on{opacity:1;pointer-events:auto}.gl-lb img{max-width:100%;max-height:100%;border-radius:8px}' +
    '@media (max-width:700px){.gl-row{flex-direction:column}}' +
    (reduce ? '.gl-it{opacity:1;transform:none}' : '');
  document.head.appendChild(css);

  function init() {
    var arrow = document.getElementById('arrow'), hint = document.getElementById('scroll');
    addEventListener('scroll', function () {
      var far = (document.documentElement.scrollTop || document.body.scrollTop) > 500;
      if (arrow) arrow.style.display = far ? 'none' : 'block'; if (hint) hint.style.display = far ? 'none' : 'block';
    });

    /* gallery */
    var list = document.getElementById('slides'); if (!list) return;
    var kids = [].slice.call(list.children), group = [], figs = [];
    function flush(before) {
      if (!group.length) return;
      var rows = [], g = group.slice(), full = true;
      while (g.length) {                                    /* one wide image, then a pair, alternating; never leave a lone last image narrow */
        var n = full || g.length === 1 ? 1 : 2; if (n === 2 && g.length === 3 && !full) n = 2;
        rows.push(g.splice(0, n)); full = !full;
      }
      rows.forEach(function (r) {
        var row = document.createElement('div'); row.className = 'gl-row';
        r.forEach(function (img, k) {
          var f = document.createElement('figure'); f.className = 'gl-it'; f.style.setProperty('--d', k * 160 + 'ms');
          /* some exports carry a transparent margin (a soft shadow); measure it and crop it away so the rounded frame is filled */
          function ratio() {
            var W = img.naturalWidth, H = img.naturalHeight; if (!W) return;
            var l = 0, t = 0, r = 0, b = 0;
            try {
              var k2 = Math.min(1, 400 / W), c = document.createElement('canvas'); c.width = Math.round(W * k2); c.height = Math.round(H * k2);
              var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
              var d = x.getImageData(0, 0, c.width, c.height).data, w = c.width, h = c.height, my = h >> 1, mx = w >> 1;
              var al = function (X, Y) { return d[(Y * w + X) * 4 + 3]; };
              while (l < mx && al(l, my) < 250) l++; while (r < mx && al(w - 1 - r, my) < 250) r++;
              while (t < my && al(mx, t) < 250) t++; while (b < my && al(mx, h - 1 - b) < 250) b++;
              if (l || r || t || b) { l = (l + 1) / k2; r = (r + 1) / k2; t = (t + 1) / k2; b = (b + 1) / k2; }
            } catch (e) { l = t = r = b = 0; }
            var cw = W - l - r, ch = H - t - b;
            f.style.flexGrow = (cw / ch).toFixed(4); f.style.aspectRatio = cw + ' / ' + ch;
            img.style.cssText = 'position:absolute!important;max-width:none;width:' + (W / cw * 100) + '%!important;height:' + (H / ch * 100) + '%;left:' + (-l / cw * 100) + '%!important;top:' + (-t / ch * 100) + '%;object-fit:fill';
          }
          img.removeAttribute('class'); f.appendChild(img); row.appendChild(f); figs.push(f);
          if (img.complete) ratio(); else img.addEventListener('load', ratio);
        });
        list.insertBefore(row, before || null);
      });
      group = [];
    }
    kids.forEach(function (el) { if (el.tagName === 'IMG') group.push(el); else flush(el); });
    flush(null);

    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      figs.forEach(function (f) { io.observe(f); });
    } else figs.forEach(function (f) { f.classList.add('in'); });

    var lb = document.createElement('div'); lb.className = 'gl-lb'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
    list.addEventListener('click', function (e) { var f = e.target.closest('.gl-it'); if (f) { lb.firstChild.src = f.querySelector('img').src; lb.classList.add('on'); } });
    lb.addEventListener('click', function () { lb.classList.remove('on'); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
