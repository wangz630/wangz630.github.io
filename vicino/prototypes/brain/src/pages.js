/* The product pages beside Brain, and the sidebar that moves between them.

   Brain is one tab of a product; the Brain touchpoints are the places where a
   field that nobody has confirmed surfaces in the rest of it. Three of those
   places are real captured pages (`pages-data.js`): Home, Signal and the
   campaign a post is published from. They mount as the shell's `<main>` in place
   of `#brain-main`, so the sidebar, the chat dock and the tokens are the same
   ones Brain already renders inside.

   The destinations that were not captured (Analytics, Calendar, Approvals,
   Connections) say so instead of silently doing nothing, as the sidebar always
   has. The route lives in the URL (`?app=`) and in localStorage beside the rest
   of the prototype's state. */
(function () {
  'use strict';

  const B = window.Brain;
  const PAGES = window.BRAIN_PAGES || {};
  const ROUTES = ['brain'].concat(Object.keys(PAGES));
  const STORE_KEY = 'brain-prototype:app';
  // the sidebar's other destinations, named so the toast can say which one
  const AWAY = {
    analytics: 'Analytics',
    calendar: 'Calendar',
    approvals: 'Approvals',
    connections: 'Connections',
  };

  /* the captured nodes while a page is mounted, so leaving it takes them out */
  let mounted = [];
  let route = read();

  function read() {
    const q = new URLSearchParams(location.search).get('app');
    if (ROUTES.includes(q)) return q;
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (ROUTES.includes(saved)) return saved;
    } catch (e) {
      /* private windows have no storage; the URL still carries it */
    }
    return 'brain';
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, route);
    } catch (e) {
      /* see read() */
    }
    const q = new URLSearchParams(location.search);
    if (route === 'brain') q.delete('app');
    else q.set('app', route);
    const search = q.toString();
    history.replaceState(
      null,
      '',
      `${location.pathname}${search ? `?${search}` : ''}${location.hash}`
    );
  }

  /* ----------------------------------------------------------------- sidebar */

  function paintSidebar() {
    const card = document.querySelector('.sidebar-brain-card');
    if (card) {
      card.classList.toggle('active', route === 'brain');
      if (route === 'brain') card.setAttribute('aria-current', 'page');
      else card.removeAttribute('aria-current');
    }
    document.querySelectorAll('.app-sidebar .nav-item').forEach((item) => {
      const on = item.dataset.appRoute === route;
      item.classList.toggle('active', on);
      if (on) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  /* -------------------------------------------------------------- the pages */

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canMove = () => !!window.gsap && !reduce();

  /* Moving between pages is a push, not a dissolve: the page arriving comes in
     from the side, whole and opaque, and takes the screen over - the one it
     replaces slides out under it rather than fading through it. The route
     itself changes at once, so everything downstream reads it straight away;
     only the drawing of it is deferred.

     The shell is `overflow: hidden`, so the page waiting off to the right is
     clipped by it. The page leaving is not - it has to come out of the layout
     to get out of the way of the one arriving - so it is given a cage of its
     own to be clipped by, or it would slide out over the sidebar. */
  const OUT = 0.42;

  function caged(r) {
    const cage = document.createElement('div');
    cage.className = 'bx-pageout';
    cage.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;overflow:hidden;z-index:1;pointer-events:none`;
    (document.querySelector('.app-shell') || document.body).appendChild(cage);
    return cage;
  }

  /* A tween that never runs - a tab in the background, a ticker nobody is
     serving - would leave the old page pinned over the new one, so the cage is
     promised on a clock as well. Removing twice is free. */
  function pushOut(targets, cage) {
    const drop = () => cage.remove();
    gsap.to(targets, {
      xPercent: -22,
      opacity: 0.5,
      duration: OUT,
      ease: 'power3.inOut',
      onComplete: drop,
    });
    setTimeout(drop, OUT * 1000 + 400);
  }

  function pushIn(el) {
    if (!el || !canMove()) return;
    // it has to be opaque, or the page it is covering reads through it
    const bg = getComputedStyle(el).backgroundColor;
    if (!bg || bg === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(bg))
      el.style.background = getComputedStyle(document.body).backgroundColor;
    el.style.position = 'relative';
    el.style.zIndex = '2';
    /* The page starts off the side of the screen, so a tween that never runs
       would leave it there - invisible, with nothing on the page at all. The
       landing is promised on a clock as well, the same as the one leaving. */
    const land = () => {
      el.style.transform = '';
      el.style.position = '';
      el.style.zIndex = '';
      el.style.background = '';
    };
    gsap.fromTo(
      el,
      { xPercent: 100 },
      {
        xPercent: 0,
        duration: OUT,
        ease: 'power3.inOut',
        clearProps: 'transform,position,zIndex,background',
        onComplete: land,
      }
    );
    setTimeout(land, OUT * 1000 + 400);
  }

  function unmount(animate) {
    const old = mounted;
    mounted = [];
    if (!old.length) return;
    if (!animate || !canMove()) {
      old.forEach((node) => node.remove());
      return;
    }
    const cage = caged(old[0].getBoundingClientRect());
    old.forEach((node) => {
      node.style.cssText += ';position:absolute;inset:0;margin:0;width:auto;height:auto';
      cage.appendChild(node);
    });
    pushOut(old, cage);
  }

  function mount(key) {
    const shell = document.querySelector('.app-shell');
    const dock = document.querySelector('.chat-dock');
    const frag = document.createElement('div');
    frag.innerHTML = PAGES[key].html;
    mounted = Array.from(frag.children);
    mounted.forEach((node) => shell.insertBefore(node, dock));
    const main = mounted.find((n) => n.tagName === 'MAIN');
    if (main) main.scrollTop = 0;
    return main;
  }

  /* Brain's own page, its version switcher and the Ask Brain pill belong to the
     Brain tab; away from it the dock is the product's plain message bar. */
  function paintShell() {
    const brain = route === 'brain';
    const main = document.getElementById('brain-main');
    if (main) main.hidden = !brain;
    /* The prototype panel stays on every page: one of its rows is a design on
       Signal, and a control you cannot reach while looking at the thing it
       draws is no control. */
    const ask = document.querySelector('.bx-askw');
    if (ask) ask.hidden = !brain;
    const launcher = document.querySelector('.chat-dock__launcher-input');
    if (launcher) {
      const copy = brain
        ? 'Ask Brain about this brand, or message Vicino…'
        : 'Message Vicino — starts a new chat…';
      launcher.placeholder = copy;
      launcher.setAttribute('aria-label', brain ? 'Ask Brain about this brand' : 'Message Vicino');
    }
    document.body.dataset.appRoute = route;
  }

  function go(next, opts = {}) {
    if (AWAY[next]) {
      B.toast(`${AWAY[next]} is not part of this prototype`);
      return;
    }
    if (!ROUTES.includes(next)) return;
    if (next === route && !opts.force) return;
    const was = route;
    route = next;
    const moving = was !== next && !opts.instant;
    /* Brain's own page is hidden rather than removed, so it leaves the same way
       the captured ones do: pinned, slid out, then hidden once it is gone. */
    const brainMain = document.getElementById('brain-main');
    const leavingBrain = moving && was === 'brain' && brainMain && !brainMain.hidden;
    if (leavingBrain && canMove()) {
      // Brain's page is hidden rather than removed, so it leaves as a copy
      const r = brainMain.getBoundingClientRect();
      const ghost = brainMain.cloneNode(true);
      ghost.id = '';
      ghost.hidden = false;
      ghost.style.cssText =
        'position:absolute;inset:0;margin:0;width:auto;height:auto;overflow:hidden';
      ghost.scrollTop = brainMain.scrollTop;
      const cage = caged(r);
      cage.appendChild(ghost);
      pushOut([ghost], cage);
    }
    unmount(moving);
    paintShell();
    if (route !== 'brain') pushIn(mount(route));
    else if (moving) pushIn(brainMain);
    syncDrawer();
    paintSidebar();
    save();
    document.dispatchEvent(new CustomEvent('app:route', { detail: { route } }));
  }

  /* the message bar and the post drawer's footer want the same strip of screen */
  function syncDrawer() {
    const panel = document.querySelector('.post-drawer');
    document.body.classList.toggle('app-drawer-open', !!panel && !panel.hidden);
  }

  /* ------------------------------------------------------- clicks and links */

  /* Inside a captured page every control is a still of the product. The ones the
     prototype answers for are the Brain touchpoints and the links that lead to a
     page it holds; the rest say they are not part of it rather than looking broken. */
  function bindPage() {
    document.addEventListener('click', (e) => {
      /* a link or a button, never just anything carrying the attribute: the page
         being read is written on the body as `data-app-route` too, so a bare
         `[data-app-route]` is every click on the page - and every click would
         lose its default, which is how the profile's own in-page links died */
      const link = e.target.closest('a[data-app-route], button[data-app-route]');
      if (link && !link.closest('.app-sidebar')) {
        e.preventDefault();
        go(link.dataset.appRoute);
        return;
      }
      const drawer = e.target.closest('.post-drawer');
      if (drawer) {
        if (
          e.target.closest('[aria-label="Close post detail"]') ||
          e.target.closest('.post-drawer__scrim')
        ) {
          drawer.hidden = true;
          syncDrawer();
        }
        return;
      }
      const row = e.target.closest('.campaign-content-table__open');
      if (row) {
        const panel = document.querySelector('.post-drawer');
        // only this post's detail was captured; the others say so
        if (row.closest('[data-testid="post-card-3"]') && panel) {
          panel.hidden = false;
          syncDrawer();
        } else B.toast('Only "Find Your Catalog Starting Point" opens in this prototype');
        return;
      }
      const dead = e.target.closest('.v4-section a[href="#"], .post-drawer a[href="#"]');
      if (dead) e.preventDefault();
    });
  }

  function bindSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    sidebar.addEventListener('click', (e) => {
      const card = e.target.closest('.sidebar-brain-card');
      if (card) {
        e.preventDefault();
        go('brain');
        return;
      }
      const nav = e.target.closest('.nav-item');
      if (nav) {
        e.preventDefault();
        go(nav.dataset.appRoute || '');
        return;
      }
      const other = e.target.closest(
        '.sidebar-recent-chat__item, .context-switcher-button, .credit-chip, .notifications-bell__trigger, .sidebar-user, .sidebar-recent-chat__action-btn'
      );
      if (other && !other.classList.contains('active'))
        B.toast('Only Brain and the pages beside it are part of this prototype');
    });
  }

  window.AppPages = {
    go,
    get route() {
      return route;
    },
    /* the mounted page's root, for the touchpoints that hang off it */
    get main() {
      return mounted.find((n) => n.tagName === 'MAIN') || null;
    },
    start() {
      bindSidebar();
      bindPage();
      go(route, { force: true });
    },
  };
})();
