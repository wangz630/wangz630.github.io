/* =====================================================================
   Shared case-study behavior: scroll-reveal for content blocks.
   Auto-tags common content elements so no per-page markup is required,
   then fades them up as they enter the viewport (like vicino.ai/landing).
   ===================================================================== */
(function () {
  function init() {
    var selectors = [
      // vicino / route-app / artisk  (content lives directly under #text)
      '#text > .caption1', '#text > .proposal', '#text > .video-wrap',
      '#text > .image-container', '#text > .tag-row', '#text > .status-note',
      '#text > .gif-row', '#text > .carousel', '#text > .scroll-frame', '#text > .img-pair',
      '#text > .shot-caption', '#text > .video-caption', '#text > .carousel-hint',
      '#text > .frame-hint', '#text > .image', '#text > iframe',
      '#text > h2', '#text > h4', '#text > .cs-split', '#text > .cs-callout',
      '#text > .cs-stats', '#text > .cs-process', '#text > .cs-eyebrow',
      '#text > .cs-overview', '#text > .cs-overview-hint', '#text > .cs-video',
      '#text > .cs-result',
      // empower  (content lives inside #slides ul)
      '#slides > .caption1', '#slides > h2', '#slides > .text-large',
      '#slides > .image-container', '#slides > .image', '#slides > .text',
      '#slides > form', '#slides > .cs-split', '#slides > .cs-callout',
      '#slides > .cs-stats'
    ];

    var nodes = document.querySelectorAll(selectors.join(','));
    if (!nodes.length) return;

    nodes.forEach(function (el) { el.classList.add('reveal'); });

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach(function (el) { io.observe(el); });

    initCarousels();
    initSlideshows();
  }

  /* one-image-at-a-time slideshow: auto-advances, with arrows, dots, and swipe */
  function initSlideshows() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.cs-slideshow').forEach(function (ss) {
      var track = ss.querySelector('.cs-slides');
      var slides = ss.querySelectorAll('.cs-slide');
      var n = slides.length;
      if (!track || n <= 1) return;
      var idx = 0, timer = null, dragging = false, startX = 0, curX = 0;

      var dotsWrap = ss.querySelector('.cs-slide-dots');
      var dots = [];
      if (dotsWrap) {
        for (var i = 0; i < n; i++) {
          (function (i) {
            var b = document.createElement('button');
            if (i === 0) b.className = 'active';
            b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            b.addEventListener('click', function () { go(i); restart(); });
            dotsWrap.appendChild(b); dots.push(b);
          })(i);
        }
      }
      function render() {
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      }
      function go(i) { idx = (i + n) % n; render(); }
      function next() { go(idx + 1); }
      function prev() { go(idx - 1); }
      function start() { if (!reduce) timer = setInterval(next, 4200); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function restart() { stop(); start(); }

      var nb = ss.querySelector('.cs-slide-next'), pb = ss.querySelector('.cs-slide-prev');
      if (nb) nb.addEventListener('click', function () { next(); restart(); });
      if (pb) pb.addEventListener('click', function () { prev(); restart(); });
      ss.addEventListener('mouseenter', stop);
      ss.addEventListener('mouseleave', start);

      track.addEventListener('pointerdown', function (e) {
        dragging = true; startX = curX = e.clientX;
        track.classList.add('dragging'); stop();
        try { track.setPointerCapture(e.pointerId); } catch (_) {}
      });
      track.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        curX = e.clientX;
        var dx = curX - startX;
        track.style.transform = 'translateX(calc(' + (-idx * 100) + '% + ' + dx + 'px))';
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false; track.classList.remove('dragging');
        var dx = curX - startX;
        if (Math.abs(dx) > ss.clientWidth * 0.15) { dx < 0 ? next() : prev(); }
        else render();
        start();
      }
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.querySelectorAll('img').forEach(function (img) { img.draggable = false; });

      render(); start();
    });
  }

  /* media carousels: gentle continuous auto-scroll that the user can
     also drag / swipe / wheel through; loops seamlessly (content duplicated) */
  function initCarousels() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var carousels = document.querySelectorAll('.cs-carousel');
    carousels.forEach(function (el) {
      var paused = false, dragging = false, startX = 0, startScroll = 0, moved = false, acc = 0;
      var half = function () { return el.scrollWidth / 2; };
      var last = null;

      function frame(t) {
        if (last == null) last = t;
        var dt = t - last; last = t;
        if (!paused && !dragging && !reduce) {
          acc += dt * 0.04; // ~40px per second
          if (acc >= 1) { var whole = Math.floor(acc); el.scrollLeft += whole; acc -= whole; }
        }
        var h = half();
        if (h > 0) {
          if (el.scrollLeft >= h) el.scrollLeft -= h;
          else if (el.scrollLeft < 0) el.scrollLeft += h;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      el.addEventListener('mouseenter', function () { paused = true; });
      el.addEventListener('mouseleave', function () { if (!dragging) paused = false; });

      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') { paused = true; return; } // touch/pen use native scroll
        dragging = true; moved = false;
        startX = e.clientX; startScroll = el.scrollLeft;
        el.classList.add('dragging');
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
      });
      el.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 3) moved = true;
        el.scrollLeft = startScroll - dx;
      });
      function endDrag() { dragging = false; el.classList.remove('dragging'); paused = false; }
      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);
      // swallow the click that follows a drag so images don't trigger navigation
      el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

      el.addEventListener('touchstart', function () { paused = true; }, { passive: true });
      el.addEventListener('touchend', function () { paused = false; });

      el.querySelectorAll('img').forEach(function (img) { img.draggable = false; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
