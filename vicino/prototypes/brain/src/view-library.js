/* Library - the brand's assets, now a tab inside Brain (it used to be its own
   page in the sidebar). The shape is the captured page's: filter tabs, the two
   add buttons, a search, the connected sources strip, then the asset grid. */
(function () {
  'use strict';
  const B = window.Brain;
  const X = window.BX;
  const { esc, icon, ui } = B;
  const L = window.BRAIN_LIBRARY;

  const lib = (ui.lib = ui.lib || { tab: 'all', q: '', open: null, rights: {} });
  lib.rights = lib.rights || {};

  /* Touchpoint 7 of 9. A picture is asked about on the way in - whose is it - and
     the answer is one record per picture on `visual.asset_rights`. Nothing is
     blocked here: a picture with no record stops later, at publishing, which is
     where touchpoint 6 names it. The notice itself lives in notice.js; this is
     only where the library keeps what it was told. */
  window.BXN_RIGHTS = (name, word) => {
    if (name) lib.rights[name] = word;
    const el = document.querySelector('.bx-drawer--asset .bx-lb__rights');
    if (el && lib.open !== null) {
      const a = L.assets[lib.open];
      if (a) el.outerHTML = rightsHtml(a);
    }
  };

  /* what the library knows about one picture's rights, and the way to say it */
  function rightsHtml(a) {
    const word = lib.rights[a.name];
    return `
      <div class="bx-lb__rights ${word ? 'is-set' : ''}">
        <span class="bxn__dot" aria-hidden="true"></span>
        <span class="bx-lb__rtext">
          <b>${word ? esc(word) : 'No rights record'}</b>
          <span>${word ? 'Recorded on visual.asset_rights' : 'Cannot be used outside Vicino until someone says whose it is'}</span>
        </span>
        <button type="button" class="bx-btn ${word ? 'bx-btn--ghost' : 'bx-btn--secondary'} bx-btn--xs" data-bxn="libraryUpload" data-bxn-asset="${esc(a.name)}" aria-haspopup="dialog">${word ? 'Change' : 'Record rights'}</button>
      </div>`;
  }
  const TABS = [
    ['all', 'All'],
    ['image', 'Images'],
    ['video', 'Videos'],
    ['catalog', 'Catalog'],
  ];

  const listFor = () => {
    const q = lib.q.trim().toLowerCase();
    return L.assets.filter((a) => {
      if (lib.tab === 'image' && a.type !== 'image') return false;
      if (lib.tab === 'video' && a.type !== 'video') return false;
      if (lib.tab === 'catalog') return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  };

  const count = (key) =>
    key === 'all'
      ? L.assets.length
      : key === 'catalog'
        ? 0
        : L.assets.filter((a) => a.type === key).length;

  function cardHtml(a, i) {
    return `
      <button type="button" class="bx-lb__card" data-lb-open="${i}" title="${esc(a.name)}">
        <span class="bx-lb__thumb">
          <img src="${esc(a.src)}" alt="" loading="lazy" width="320" height="220">
          <span class="bx-lb__badge" title="Uploaded">${icon('upload', 11)}</span>
          ${a.type === 'video' ? `<span class="bx-lb__play" aria-hidden="true">${icon('play', 14)}</span>` : ''}
        </span>
        <span class="bx-lb__name">${esc(a.name)}</span>
        <span class="bx-lb__meta">${esc(B.cap(a.type))}</span>
      </button>`;
  }

  function gridHtml() {
    const rows = listFor();
    if (!rows.length)
      return `<div class="bx-empty">${icon('search-x', 22)}<p>${lib.tab === 'catalog' ? 'No catalog items yet - product feeds land here.' : 'No assets match that description.'}</p></div>`;
    return `<div class="bx-lb__grid">${rows.map((a) => cardHtml(a, L.assets.indexOf(a))).join('')}</div>`;
  }

  // one asset opens in the shared drawer, with what the brief would see
  function sheetHtml(a) {
    return `
      <div class="bx-drawer__scrim" data-lb-close></div>
      <aside class="bx-drawer__sheet bx-drawer__sheet--asset bx-view" role="dialog" aria-modal="true" aria-label="${esc(a.name)}">
        <header class="bx-drawer__head">
          <p class="bx-label">Library asset</p>
          <div class="bx-drawer__nav">
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-lb-close aria-label="Close">${icon('x', 15)}</button>
          </div>
        </header>
        <div class="bx-drawer__body">
          <div class="bx-lb__preview"><img src="${esc(a.src)}" alt=""></div>
          <h3 class="bx-lb__title">${esc(a.name)}</h3>
          <dl class="bx-drawer__kv">
            <div><dt>Type</dt><dd>${esc(B.cap(a.type))}</dd></div>
            <div><dt>Source</dt><dd>Uploaded</dd></div>
            <div><dt>Used by</dt><dd>Not matched to a brief yet</dd></div>
          </dl>
          ${rightsHtml(a)}
        </div>
      </aside>`;
  }

  B.register('library', null, {
    render() {
      return `
        <div class="bx-view bx-lb">
          <div class="bx-lb__top">
            <div class="bx-seg bx-lb__seg" role="tablist" aria-label="Library sections">
              ${TABS.map(
                ([k, label]) =>
                  `<button type="button" role="tab" class="bx-seg__item" aria-selected="${lib.tab === k}" data-lb-tab="${k}">${label}<span class="bx-seg__count bx-num">${count(k)}</span></button>`
              ).join('')}
            </div>
            <div class="bx-lb__actions">
              <button type="button" class="bx-btn bx-btn--secondary" data-lb-act="drive">${icon('database', 14)}Import from Google Drive</button>
              <button
                type="button"
                class="bx-btn bx-btn--primary"
                data-bxn="libraryUpload"
                data-bxn-count="3"
                aria-haspopup="dialog"
              >${icon('upload', 14)}Upload</button>
            </div>
          </div>
          <p class="bx-lb__disclosure">${esc(L.disclosure)}</p>
          <label class="bx-search bx-lb__search">
            ${icon('search', 15)}
            <input type="search" data-lb-q placeholder="${esc(L.searchHint)}" value="${esc(lib.q)}" aria-label="Search assets">
            <button type="button" class="bx-search__clear" data-lb-qclear aria-label="Clear search" ${lib.q ? '' : 'hidden'}>${icon('x', 14)}</button>
          </label>
          <section class="bx-card bx-lb__sources" aria-label="Connected sources">
            <p class="bx-lb__sourceshead">Connected sources</p>
            <ul>
              ${L.connected
                .map(
                  (c) => `
                <li>
                  <span class="bx-lb__src">${icon('database', 12)}${esc(c.name)}</span>
                  <span class="bx-lb__srcmeta">${esc(c.account)}</span>
                  <span class="bx-pill bx-pill--done bx-pill--compact">${esc(c.status)}</span>
                  <span class="bx-lb__srcmeta bx-num">${esc(c.count)}</span>
                </li>`
                )
                .join('')}
            </ul>
          </section>
          <div class="bx-lb__body" data-lb-grid>${gridHtml()}</div>
        </div>`;
    },

    mount(slot) {
      const redraw = () => {
        B.$('[data-lb-grid]', slot).innerHTML = gridHtml();
        B.$$('[data-lb-tab]', slot).forEach((b) =>
          b.setAttribute('aria-selected', String(b.dataset.lbTab === lib.tab))
        );
        const clear = B.$('[data-lb-qclear]', slot);
        if (clear) clear.hidden = !lib.q;
      };
      const closeSheet = () => {
        const el = document.querySelector('.bx-drawer--asset');
        if (el) el.remove();
        lib.open = null;
      };
      const openSheet = (i) => {
        const a = L.assets[i];
        if (!a) return;
        closeSheet();
        lib.open = i;
        const wrap = document.createElement('div');
        wrap.className = 'bx-drawer bx-drawer--asset';
        wrap.innerHTML = sheetHtml(a);
        (document.querySelector('.app-shell') || document.body).appendChild(wrap);
        if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.fromTo(
            wrap.querySelector('.bx-drawer__scrim'),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.2 }
          );
          gsap.fromTo(
            wrap.querySelector('.bx-drawer__sheet'),
            { x: 32, autoAlpha: 0 },
            {
              x: 0,
              autoAlpha: 1,
              duration: 0.3,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
            }
          );
        }
        const close = wrap.querySelector('[data-lb-close].bx-btn');
        if (close) close.focus();
        wrap.addEventListener('click', (e) => {
          if (e.target.closest('[data-lb-close]')) closeSheet();
        });
        const onKey = (e) => {
          if (!wrap.isConnected) {
            document.removeEventListener('keydown', onKey);
            return;
          }
          if (e.key === 'Escape') closeSheet();
        };
        document.addEventListener('keydown', onKey);
      };

      slot.addEventListener('input', (e) => {
        if (e.target.matches('[data-lb-q]')) {
          lib.q = e.target.value;
          redraw();
        }
      });
      slot.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-lb-tab]');
        if (tab) {
          lib.tab = tab.dataset.lbTab;
          redraw();
          return;
        }
        if (e.target.closest('[data-lb-qclear]')) {
          lib.q = '';
          B.$('[data-lb-q]', slot).value = '';
          redraw();
          return;
        }
        const act = e.target.closest('[data-lb-act]');
        if (act) {
          B.toast('Connects Google Drive in the product');
          return;
        }
        const card = e.target.closest('[data-lb-open]');
        if (card) openSheet(Number(card.dataset.lbOpen));
      });
    },
  });
})();
