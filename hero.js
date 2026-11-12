/* Entrance animation for the full-screen project hero (#title over a cover image or video).
   The design is unchanged: the title rises in letter by letter, the tags and scroll hint fade in,
   and the cover opens up from a slightly inset, blurred state. */
(function () {
  if (window.__heroAnim) return; window.__heroAnim = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var css = document.createElement('style');
  css.textContent =
    '#title .gl{display:inline-block;white-space:pre;opacity:0;transform:translateY(.5em);animation:glUp .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i)*38ms + 150ms)}' +
    '@keyframes glUp{to{opacity:1;transform:none}}' +
    '.cs-hero-tags{animation:glFade 1s ease .9s backwards}#arrow,#scroll{animation:glFade 1s ease 1.5s backwards}' +
    '@keyframes glFade{from{opacity:0}}' +
    '#cover,#myVideo,.video-container{animation:glCover 1.8s cubic-bezier(.2,.8,.2,1) backwards}' +
    '@keyframes glCover{from{opacity:0;clip-path:inset(12% 12% 12% 12% round 24px);filter:blur(6px)}to{clip-path:inset(0 0 0 0 round 0px);filter:blur(0)}}';
  document.head.appendChild(css);
  function init() {
    var title = document.getElementById('title');
    if (!title || title.querySelector('.gl')) return;
    var t = title.textContent; title.setAttribute('aria-label', t);
    title.innerHTML = t.split('').map(function (ch, i) {
      return '<span class="gl" aria-hidden="true" style="--i:' + i + '">' + (ch === ' ' ? ' ' : ch.replace(/&/g, '&amp;').replace(/</g, '&lt;')) + '</span>';
    }).join('');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
