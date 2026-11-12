/* Coverflow-style carousel for the older project pages.
   Reads portfolio.json ({portfolio:[{image,title}]}) and builds itself inside #container:
   the neighbouring slides peek in from both sides, it advances slowly on its own,
   pauses on hover, and can be moved with the arrows, the dots, a click on a side slide, arrow keys or a swipe. */
document.addEventListener('DOMContentLoaded', function () {
  var box = document.querySelector('#container');
  var css = document.createElement('style');
  css.textContent =
    '#container{position:relative!important;left:auto!important;top:auto!important;transform:none!important;width:100%!important;max-width:none!important;height:auto!important;margin:8vh 0 6vh!important;padding:0!important;overflow:hidden}' +
    '.cf{position:relative;width:100%;height:calc(var(--sw)*2/3 + 20px);--sw:min(64vw,1100px)}' +
    '.cf figure{position:absolute;left:50%;top:0;width:var(--sw);margin:0 0 0 calc(var(--sw)/-2);aspect-ratio:3/2;border-radius:14px;overflow:hidden;background:#111;cursor:pointer;' +
    'transform:translateX(calc(var(--d)*(100% + 2.4vw))) scale(var(--s));opacity:var(--o);transition:transform 1.1s cubic-bezier(.2,.8,.2,1),opacity .9s ease,filter .9s ease;filter:saturate(var(--sat));box-shadow:0 30px 70px -30px rgba(0,0,0,.7)}' +
    '.cf figure.on{cursor:zoom-in}' +
    '.cf-lb{position:fixed;inset:0;z-index:9999;background:rgba(8,8,10,.92);display:grid;place-items:center;padding:3vw;opacity:0;pointer-events:none;transition:opacity .3s;cursor:zoom-out}' +
    '.cf-lb.on{opacity:1;pointer-events:auto}.cf-lb img{max-width:100%;max-height:100%;border-radius:8px;position:static!important;transform:none!important;width:auto!important;padding:0!important}' +
    '.cf-lb span{position:absolute;left:0;right:0;bottom:16px;text-align:center;color:#fff;opacity:.75;font:500 14px/1.3 -apple-system,BlinkMacSystemFont,sans-serif}' +
    '.cf img{width:100%;height:100%;object-fit:contain;display:block;position:static!important;transform:none!important;max-width:none!important}' +
    '.cf-b{position:absolute;top:calc(var(--sw)/3);z-index:5;width:52px;height:52px;margin-top:-26px;border-radius:50%;border:0;cursor:pointer;background:rgba(255,255,255,.9);color:#111;display:grid;place-items:center;box-shadow:0 10px 30px -8px rgba(0,0,0,.5);transition:transform .3s,background .3s}' +
    '.cf-b:hover{transform:scale(1.08);background:#fff}.cf-b svg{width:20px;height:20px}' +
    '.cf-p{left:calc(50% - var(--sw)/2 - 26px)}.cf-n{right:calc(50% - var(--sw)/2 - 26px)}' +
    '.cf-meta{display:flex;justify-content:space-between;align-items:center;gap:20px;width:min(64vw,1100px);margin:18px auto 0;font:500 15px/1.3 -apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif;color:inherit}' +
    '.cf-meta .t{opacity:.9}.cf-meta .c{opacity:.6;font-variant-numeric:tabular-nums}' +
    '.cf-wrap{position:relative;z-index:2;padding-bottom:30px}.cf-dots{display:flex;gap:6px;justify-content:center;margin-top:16px}' +
    '.cf-dots i{position:relative;width:8px;height:8px;border-radius:999px;background:currentColor;opacity:.3;cursor:pointer;transition:width .5s cubic-bezier(.2,.8,.2,1),opacity .3s;overflow:hidden}' +
    '.cf-dots i.on{width:44px;opacity:1;background:rgba(128,128,128,.45)}' +
    '.cf-dots i.on::after{content:"";position:absolute;inset:0;background:currentColor;transform-origin:0 50%;transform:scaleX(0)}' +
    '.cf.play .cf-dots i.on::after,.cf-wrap.play .cf-dots i.on::after{animation:cfFill var(--dur) linear forwards}' +
    '@keyframes cfFill{to{transform:scaleX(1)}}' +
    '@media (max-width:700px){.cf{--sw:84vw}.cf-meta{width:84vw}.cf-b{width:40px;height:40px;margin-top:-20px}.cf-p{left:6px}.cf-n{right:6px}}';
  document.head.appendChild(css);

  /* the old pages hide a "scroll" hint after scrolling */
  var arrow = document.getElementById('arrow'), hint = document.getElementById('scroll');
  if (arrow || hint) addEventListener('scroll', function () {
    var far = (document.documentElement.scrollTop || document.body.scrollTop) > 500;
    if (arrow) arrow.style.display = far ? 'none' : 'block'; if (hint) hint.style.display = far ? 'none' : 'block';
  });
  if (!box) return;

  fetch('portfolio.json').then(function (r) { return r.json(); }).then(function (data) {
    var items = data.portfolio, n = items.length, cur = 0, timer = null, hover = false, visible = true, DUR = 6000;
    var chev = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>'; };
    box.innerHTML = '<div class="cf-wrap" style="--dur:' + DUR + 'ms"><div class="cf">' +
      items.map(function (w) { return '<figure><img src="' + w.image + '" alt="' + (w.title || '').replace(/"/g, '&quot;') + '"></figure>'; }).join('') +
      '<button class="cf-b cf-p" aria-label="Previous">' + chev('M15 5l-7 7 7 7') + '</button><button class="cf-b cf-n" aria-label="Next">' + chev('M9 5l7 7-7 7') + '</button></div>' +
      '<div class="cf-meta"><span class="t"></span><span class="c"></span></div><div class="cf-dots">' + items.map(function () { return '<i></i>'; }).join('') + '</div></div>';
    var bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g) || [255, 255, 255];
    box.firstChild.style.color = (+bg[0] * 0.299 + +bg[1] * 0.587 + +bg[2] * 0.114) < 128 ? '#fff' : '#111';
    var wrap = box.firstChild, figs = [].slice.call(box.querySelectorAll('figure')), dots = [].slice.call(box.querySelectorAll('.cf-dots i')),
        title = box.querySelector('.cf-meta .t'), count = box.querySelector('.cf-meta .c');

    /* full-size view: click the current slide; arrow keys still move between slides, Esc or a click closes */
    var lb = document.createElement('div'); lb.className = 'cf-lb'; lb.innerHTML = '<img alt=""><span></span>'; document.body.appendChild(lb);
    function showBig() { lb.firstChild.src = items[cur].image; lb.lastChild.textContent = (items[cur].title || '') + '  ·  ' + (cur + 1) + ' / ' + n; }
    function openBig() { showBig(); lb.classList.add('on'); run(); }
    function closeBig() { lb.classList.remove('on'); run(); }
    lb.addEventListener('click', closeBig);
    function lay() {
      figs.forEach(function (f, i) {
        var d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        if (n === 2 && d === -1) d = 1;
        var a = Math.abs(d);
        f.style.setProperty('--d', d); f.style.setProperty('--s', a ? 0.86 : 1); f.style.setProperty('--o', a === 0 ? 1 : a === 1 ? 0.38 : 0);
        f.style.setProperty('--sat', a ? 0.5 : 1); f.style.zIndex = 3 - Math.min(a, 2); f.style.pointerEvents = a > 1 ? 'none' : 'auto';
        f.classList.toggle('on', a === 0);
      });
      dots.forEach(function (x, i) { x.classList.toggle('on', i === cur); });
      title.textContent = items[cur].title || ''; count.textContent = (cur + 1) + ' / ' + n;
      if (lb.classList.contains('on')) showBig();
    }
    function run() {
      clearInterval(timer); wrap.classList.remove('play');
      if (hover || lb.classList.contains('on') || !visible || n < 2) return;
      void wrap.offsetWidth; wrap.classList.add('play');
      timer = setInterval(function () { go(cur + 1, true); }, DUR);
    }
    function go(i, auto) { cur = (i + n) % n; lay(); if (!auto) run(); else { wrap.classList.remove('play'); void wrap.offsetWidth; wrap.classList.add('play'); } }

    box.querySelector('.cf-p').addEventListener('click', function () { go(cur - 1); });
    box.querySelector('.cf-n').addEventListener('click', function () { go(cur + 1); });
    figs.forEach(function (f, i) { f.addEventListener('click', function () { if (i !== cur) go(i); else openBig(); }); });
    dots.forEach(function (x, i) { x.addEventListener('click', function () { go(i); }); });
    wrap.addEventListener('mouseenter', function () { hover = true; run(); });
    wrap.addEventListener('mouseleave', function () { hover = false; run(); });
    addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); else if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'Escape') closeBig(); });
    var x0 = null;
    wrap.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }, { threshold: 0.3 }).observe(wrap);
    lay(); run();
  }).catch(console.error);
});
