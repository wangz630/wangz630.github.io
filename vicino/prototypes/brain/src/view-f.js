/* Version F - "Schema". The brain browsed like a database client.

   Page:      one compact header card - title, the index stats as a key / value
              strip, and the view tabs along its bottom edge - so the view below
              gets the room.
   Report:    a browser. The left list holds the plan and the seven fields (a dot
              for confidence, a count for gaps); the right card shows one object
              at a time with Answer / Sources / Not in the index tabs - the answer
              folds after six lines, with Show more. The
              Roadmap object shows the four records a strategy approval writes,
              each under its key, with its supporting sources in a second tab.
   Knowledge: Coverage (Knowledge C, revised). The source × kind matrix keeps to
              the top five sources and folds the rest into one "more sources"
              row, with a source finder, so it stays the same height whether the
              brand has 8 sources or 80. Under it, a compact one-line list. */
(function () {
  'use strict';
  const B = window.Brain;
  const X = window.BX;
  const BXP = window.BXP;
  const { esc, icon, ui, dates, fields, facts, sources } = B;
  const S = B.D.summary;

  /* =================================================================== PAGE */

  /* the "!" badge beside the title opens this: what Brain is, in the product's own
     terms - a fact store for the marketing work, not a pile of pages */
  function whatHtml() {
    const st = B.reportStats;
    return `
      <div class="bx-what__pop" data-what-pop hidden role="dialog" aria-label="What is Brain?">
        <div class="bx-what__head">
          <p class="bx-label">What is Brain?</p>
          <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-what-close aria-label="Close">${icon('x', 14)}</button>
        </div>
        <p class="bx-what__lede">Brain is this brand's fact store: everything Vicino has read about ${esc(B.D.brand.name)}, kept as separate facts with the evidence behind them - not as a pile of pages.</p>
        <ul class="bx-what__list">
          <li>${icon('database', 13)}<span><b>The index</b> reads the brand's sources and keeps what it learned as ${S.facts} facts, each with its source and a confidence.</span></li>
          <li>${icon('book', 13)}<span><b>The report</b> answers ${st.total} standing questions from those facts, and the brand profile sets them in context. Every claim is marked back to the passage it rests on.</span></li>
          <li>${icon('route', 13)}<span><b>The roadmap</b> holds what an approved strategy wrote down: the marketing goal, the KPI and the phases.</span></li>
          <li>${icon('image', 13)}<span><b>The library</b> keeps the brand's own images and video, so briefs can draw on them.</span></li>
        </ul>
        <p class="bx-what__rule">${icon('info', 13)}<span>Campaigns, posts, signal and analytics ask Brain for the fields they need. Facts carry evidence and a version, anything unconfirmed says so, and a new source never quietly overwrites a value a person has confirmed.</span></p>
      </div>`;
  }

  B.register('page', 'f', {
    render({ state }) {
      return `
        <div class="bx-page bx-pf">
          <header class="bx-card bx-pf__head" data-scroll-anchor>
            <div class="bx-pf__top">
              <div class="bx-pf__titles">
                <h1 class="bx-pf__title">Brain<button type="button" class="bx-what" data-what aria-expanded="false" aria-label="What is Brain?"><span aria-hidden="true">!</span></button></h1>
                <p class="bx-pf__lede">Everything this brand has been told, and what it can answer from it.</p>
                <p class="bx-pf__fresh bx-pf__fresh--top">${icon('clock', 13)}Indexed ${dates.fmtLong(S.lastIndexed)}<span class="bx-sep">·</span>${esc(S.model)}</p>
                ${whatHtml()}
              </div>
              <div class="bx-pf__acts">${askHtml()}</div>
            </div>
            <div class="bx-pf__bottom">
              <nav class="bx-pf__tabs" role="tablist" aria-label="Brain views">
                ${B.TABS.map(
                  (t) =>
                    `<button type="button" role="tab" class="bx-pf__tab" aria-selected="${state.tab === t}" aria-controls="bx-pf-panel" data-tab="${t}">${icon(B.TAB_META[t].icon, 14)}${esc(B.TAB_META[t].label)}</button>`
                ).join('')}
              </nav>
              <p class="bx-pf__fresh">${icon('clock', 13)}Indexed ${dates.fmtLong(S.lastIndexed)}<span class="bx-sep">·</span>${esc(S.model)}</p>
            </div>
          </header>
          <div class="bx-panel bx-pf__panel" id="bx-pf-panel" role="tabpanel" data-slot="panel"></div>
        </div>`;
    },
    mount(root) {
      // render() replaces root's children but keeps root, so bind the page once
      if (root.dataset.whatBound) return;
      root.dataset.whatBound = '1';
      const pop = () => root.querySelector('[data-what-pop]');
      const btn = () => root.querySelector('[data-what]');
      const setOpen = (open) => {
        const p = pop();
        if (!p) return;
        p.hidden = !open;
        btn().setAttribute('aria-expanded', String(open));
        if (open) B.motion.rise(p, { y: 6, duration: 0.2 });
      };
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-ask-open]')) {
          document.dispatchEvent(new CustomEvent('brain:ask'));
          return;
        }
        if (e.target.closest('[data-what]')) {
          setOpen(pop().hidden);
          return;
        }
        if (
          e.target.closest('[data-what-close]') ||
          (pop() && !pop().hidden && !e.target.closest('[data-what-pop]'))
        )
          setOpen(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pop() && !pop().hidden) setOpen(false);
      });
    },
    syncTabs(root, { state }) {
      B.$$('.bx-pf__tabs [data-tab]', root).forEach((b) =>
        b.setAttribute('aria-selected', String(b.dataset.tab === state.tab))
      );
    },
    sync() {
      markBpEntries();
    },
  });

  /* ================================================================= REPORT */

  ui.rp.fSel = ui.rp.fSel || 'overview';
  ui.rp.fTab = ui.rp.fTab || {};

  const clockShort = (rm) =>
    rm.before ? 'Not started' : rm.after ? 'Ended' : `Day ${rm.day}/${rm.horizon}`;

  /* The brand profile is its own document, not one of the report's fields, so it
     gets one entry of its own, first in the report browser, in one of two sizes
     (Versions → Profile size):
       Large     the card, in three styles (Profile card): 1 Light (white, a cyan
                 wash), 2 Ink (a cyan glow), 3 Mosaic (the brand's imagery)
       Compact   one slim row on the Light card's cyan wash - the logo, Brand
                 profile, an arrow; hovering it previews the report and says a
                 click opens it */
  const bpMeta = () => {
    const P = BXP.P;
    const PP = window.BRAIN_PROFILE_PAGE;
    return {
      P,
      toc: PP
        ? PP.toc
        : P.sections.map((x, i) => ({ n: String(i + 1).padStart(2, '0'), title: x.title })),
      updated: P.updated.replace(/,\s*\d{4}$/, ''),
    };
  };

  // the compact entry: the logo, the name, an arrow - on the Light card's cyan wash
  function bpMini(opts = {}) {
    const { P } = bpMeta();
    return `
      <button type="button" class="bx-bpm bx-bpm--v1 ${opts.cls || ''}" data-f-item="bp" data-bp-entry data-bp-mini aria-label="Brand profile - open the full report">
        <span class="bx-bpm__logo"><img src="${esc(P.visual.logo.src)}" alt="" loading="lazy"></span>
        <span class="bx-bpm__name">Brand profile</span>
        <span class="bx-bpm__go" aria-hidden="true">${icon('arrow-right', 14)}</span>
      </button>`;
  }

  // the entry, settled on the compact row
  const bpEntry = () => bpMini({ cls: 'bx-bpm--nav' });

  const profileOpen = () => B.state.tab === 'report' && ui.rp.fSel === 'bp';

  // every entry says when the profile is the one open
  function markBpEntries() {
    const on = profileOpen();
    document.querySelectorAll('[data-bp-entry]').forEach((el) => {
      el.classList.toggle('is-on', on);
      if (on) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
  }

  /* Hovering the compact entry previews the report: the brand's imagery, its
     sections, and that a click opens it. It hangs beside the entry in the browser
     in the shell so no card clips it; it takes no pointer. */
  let bpvEl = null;
  function bpPreviewHtml() {
    const { P, toc, updated } = bpMeta();
    const tiles = P.visual.imagery.slice(0, 3);
    return `
      <div class="bx-bpv__art" aria-hidden="true">${tiles.map((t) => `<img src="${esc(t.src)}" alt="" loading="lazy">`).join('')}</div>
      <div class="bx-bpv__body">
        <div class="bx-bpv__id">
          <span class="bx-bpv__logo"><img src="${esc(P.visual.logo.src)}" alt=""></span>
          <p><b>${esc(P.brand)}</b><small>Brand profile<span class="bx-sep">·</span>${toc.length} sections<span class="bx-sep">·</span>${esc(updated)}</small></p>
        </div>
        <ol class="bx-bpv__secs">
          ${toc
            .slice(0, 4)
            .map((t) => `<li><span class="bx-num">${esc(t.n)}</span>${esc(t.title)}</li>`)
            .join('')}
          ${toc.length > 4 ? `<li class="is-more">+ ${toc.length - 4} more</li>` : ''}
        </ol>
      </div>
      <p class="bx-bpv__cta">${icon('pointer', 14)}<span>Click to open the full report</span>${icon('arrow-right', 13)}</p>`;
  }
  function showPreview(btn) {
    if (!bpvEl) {
      bpvEl = document.createElement('div');
      bpvEl.className = 'bx-bpv';
      bpvEl.setAttribute('role', 'tooltip');
      bpvEl.id = 'bx-bpv';
      // inside the shell: the tokens are scoped to it
      (document.querySelector('.app-shell') || document.body).appendChild(bpvEl);
    }
    if (bpvEl.dataset.for === 'on' && !bpvEl.hidden && bpvEl._btn === btn) return;
    bpvEl.innerHTML = bpPreviewHtml();
    bpvEl.hidden = false;
    bpvEl._btn = btn;
    bpvEl.dataset.for = 'on';
    btn.setAttribute('aria-describedby', 'bx-bpv');
    const r = btn.getBoundingClientRect();
    const w = bpvEl.offsetWidth;
    const h = bpvEl.offsetHeight;
    const side = btn.classList.contains('bx-bpm--nav') && r.right + 12 + w < window.innerWidth - 8;
    let left = side ? r.right + 12 : r.left;
    let top = side ? r.top - 6 : r.bottom + 10;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    if (top + h > window.innerHeight - 8)
      top = Math.max(8, side ? window.innerHeight - h - 8 : r.top - h - 10);
    bpvEl.style.left = `${Math.round(left)}px`;
    bpvEl.style.top = `${Math.round(top)}px`;
    bpvEl.dataset.side = side ? 'right' : 'below';
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(bpvEl);
      gsap.fromTo(
        bpvEl,
        { autoAlpha: 0, x: side ? -6 : 0, y: side ? 0 : -4, scale: 0.98 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        bpvEl.querySelectorAll('.bx-bpv__art img'),
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.05, ease: 'power2.out', delay: 0.04 }
      );
    }
  }
  function hidePreview() {
    if (!bpvEl || bpvEl.hidden) return;
    if (bpvEl._btn) bpvEl._btn.removeAttribute('aria-describedby');
    bpvEl.dataset.for = '';
    bpvEl._btn = null;
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(bpvEl);
      gsap.to(bpvEl, {
        autoAlpha: 0,
        duration: 0.12,
        onComplete: () => {
          if (!bpvEl.dataset.for) bpvEl.hidden = true;
        },
      });
    } else bpvEl.hidden = true;
  }
  if (!window.__bxBpvBound) {
    window.__bxBpvBound = true;
    document.addEventListener('mouseover', (e) => {
      const btn = e.target.closest && e.target.closest('[data-bp-mini]');
      if (btn) showPreview(btn);
    });
    document.addEventListener('mouseout', (e) => {
      const btn = e.target.closest && e.target.closest('[data-bp-mini]');
      if (btn && !(e.relatedTarget && btn.contains(e.relatedTarget))) hidePreview();
    });
    document.addEventListener('focusin', (e) => {
      const btn = e.target.closest && e.target.closest('[data-bp-mini]');
      if (btn && btn.matches(':focus-visible')) showPreview(btn);
    });
    document.addEventListener('focusout', (e) => {
      if (e.target.closest && e.target.closest('[data-bp-mini]')) hidePreview();
    });
    document.addEventListener('click', hidePreview, true);
    document.addEventListener('brain:scroll', hidePreview);
    document.addEventListener('brain:render', hidePreview);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hidePreview();
    });
  }

  /* The report browser is one thin bar across the top of the report, so the object
     below it has the whole width: the brand profile first, then the plan, then the
     seven report fields, and Regenerate all at the right end. It scrolls sideways
     if it has to, and it sticks to the top while the object scrolls under it.
     While the brand profile is open the same bar carries the way back and the
     product's own "On this page". */
  const exportSvg = () => {
    const PP = window.BRAIN_PROFILE_PAGE;
    const m = PP && PP.exportBtn.match(/<svg[\s\S]*?<\/svg>/);
    return m ? m[0] : icon('upload', 14);
  };

  function profileNavHtml() {
    const PP = window.BRAIN_PROFILE_PAGE;
    const back = ui.rp.fBack && ui.rp.fBack !== 'bp' ? ui.rp.fBack : fields[0].id;
    return `
      <button type="button" class="bx-rft__back" data-f-item="${esc(back)}">${icon('chevron-left', 15)}Back to the report</button>
      <div class="bx-rft__scroll">
        <span class="bx-rft__label">On this page</span>
        ${PP.toc
          .map(
            (t, i) =>
              `<a href="#${esc(t.id)}" class="bx-rft__item bx-rft__toc ${i === 0 ? 'is-active' : ''}" data-bp-jump="${esc(t.id)}"><b class="bx-num">${esc(t.n)}</b><span>${esc(t.title)}</span></a>`
          )
          .join('')}
      </div>
      <div class="bx-rft__end">
        <button type="button" class="bx-rft__icon" data-bp-act="regen" aria-label="Regenerate report" data-tip="Regenerate report">${icon('refresh', 15)}</button>
        <button type="button" class="bx-rft__icon" data-bp-act="export" aria-label="Export" data-tip="Export">${exportSvg()}</button>
      </div>`;
  }

  // the bar names an object as shortly as it can; the full name is in its bubble
  const SHORT = { community: 'Community', visual_identity: 'Visual identity' };

  function navHtml(rm) {
    if (ui.rp.fSel === 'bp' && window.BRAIN_PROFILE_PAGE) return profileNavHtml();
    const P = BXP.P;
    const st = B.reportStats;
    const item = (id, inner, label, tip, cls = '') =>
      `<button type="button" class="bx-rft__item ${cls} ${ui.rp.fSel === id ? 'is-on' : ''}" data-f-item="${id}" aria-current="${ui.rp.fSel === id ? 'true' : 'false'}" aria-label="${esc(label)}"${tip ? ` data-tip="${esc(tip)}"` : ''}>${inner}</button>`;
    return `
      ${item('overview', `${icon('chevron-left', 15)}<span>All sections</span>`, 'Back to all sections', 'Back · to all sections, and what Brain holds in each', 'is-back')}
      <div class="bx-rft__tools">
        <span data-rf-all>${X.regenAllControl({ iconOnly: true })}</span>
        <span class="bx-rft__find ${ui.rp.navFind == null ? '' : 'is-open'}" data-rf-findbar>
          <button type="button" class="bx-rft__findbtn" data-rf-find aria-label="Find a section" aria-expanded="${ui.rp.navFind != null}" data-tip="Find a section · by name">${icon('search', 15)}</button>
          <input type="text" class="bx-rft__findin" data-rf-findq value="${esc(ui.rp.navFind || '')}" placeholder="Find a section" aria-label="Find a section by name" autocomplete="off" spellcheck="false" ${ui.rp.navFind == null ? 'tabindex="-1"' : ''}>
          <button type="button" class="bx-rft__findx" data-rf-findoff aria-label="Close find" data-tip="Close · Esc" ${ui.rp.navFind == null ? 'tabindex="-1"' : ''}>${icon('x', 13)}</button>
        </span>
      </div>
      <div class="bx-rft__scroll">
        <button type="button" class="bx-rft__bp" data-f-item="bp" data-bp-entry aria-label="Brand profile - open the full report" data-tip="Brand profile · the brand's own report, ${st.total} fields deep">
          <img src="${esc(P.visual.logo.src)}" alt="" loading="lazy">Profile
        </button>
        <i class="bx-rft__sep" aria-hidden="true"></i>
        ${
          B.roadmapView()
            ? item(
                'roadmap',
                `<span class="bx-tile is-roadmap is-sm">${icon('gauge', 13)}</span>Roadmap`,
                'Roadmap',
                `Roadmap · ${clockShort(rm)}`
              )
            : ''
        }
        ${fields
          .filter((f) => !(ui.rp.gone || []).includes(f.id))
          .map((f) => {
            const c = window.BXF && BXF.has(f.id) ? BXF.counts(f.id) : null;
            const miss = c ? c.missing : 0;
            // the bar is the way in, not a scoreboard: what is missing is said in
            // its bubble and on the overview, so every name fits on one row
            return item(
              f.id,
              `<span class="bx-tile is-${f.id} is-sm">${icon(X.FIELD_ICON[f.id] || 'book', 13)}</span>${esc(SHORT[f.id] || f.title)}`,
              f.title,
              `${f.title}${c ? ` · ${B.plural(c.total, 'field')}` : ''}${miss ? ` · ${miss} missing` : ''}`
            );
          })
          .join('')}
        ${(ui.rp.newSecs || [])
          .filter((sec) => !(ui.rp.gone || []).includes(sec.id))
          .map((sec) =>
            item(
              sec.id,
              `<span class="bx-tile is-new is-sm">${icon('plus', 13)}</span>${esc(sec.title)}`,
              sec.title,
              `${sec.title} · added by you`
            )
          )
          .join('')}
      </div>`;
  }

  /* one field - read as its written answer; under Versions → Field content: Fields a
     bar over the answer turns it into the Brain fields it is made of, and back */
  const fieldsMode = (f) => !!window.BXF && BXF.has(f.id);

  const answerBody = (f) => `
      ${X.runningStrip(f)}
      <div class="bx-rf__answer">${X.answerFor(f, 'f')}</div>`;

  const fieldBody = (f) => (fieldsMode(f) ? BXF.viewHtml(f, { head: false }) : answerBody(f));

  /* taking a section out of the report is not something to do by accident, so the
     control asks first, in place */
  const secTitle = (id) =>
    (B.fieldById[id] || (ui.rp.newSecs || []).find((x) => x.id === id) || {}).title ||
    'this section';

  const delHtml = (id) =>
    `<button type="button" class="bx-rf__del" data-sec-ask="${esc(id)}" aria-label="Remove this section" data-tip="Remove this section · it asks first">${icon('trash', 15)}</button>`;

  // the way back lives in the bar, which never scrolls away from it
  const backHtml = () => '';

  /* How long the plan runs is a figure the brand set, not a row of buttons to pick
     from: it reads as the number, with a small pencil beside it that opens a box
     to type another - the usual lengths are there to save the typing. */
  function horizonHtml(rm) {
    const open = ui.rp.hzOpen;
    const draft = ui.rp.hzDraft == null ? rm.horizon : ui.rp.hzDraft;
    return `
      <span class="bx-rmh2">
        <span class="bx-rmh2__read">${icon('calendar', 13)}Plan runs<b class="bx-num">${rm.horizon}</b>days</span>
        <button type="button" class="bx-rmh2__edit ${open ? 'is-on' : ''}" data-rm-hz-open aria-expanded="${!!open}" aria-label="Change how long the plan runs">${icon('pencil', 12)}</button>
        ${
          open
            ? `<span class="bx-rmh2__pop" role="dialog" aria-label="How long the plan runs">
          <span class="bx-rmh2__ph">How long does this plan run?</span>
          <span class="bx-rmh2__row">
            <input class="bx-rmh2__in bx-num" type="number" min="7" max="365" step="1" value="${draft}" data-rm-hz-in aria-label="Days">
            <span class="bx-rmh2__unit">days</span>
          </span>
          <span class="bx-rmh2__quick">${B.HORIZONS.map(
            (h) =>
              `<button type="button" class="bx-rmh2__q ${Number(draft) === h ? 'is-on' : ''}" data-rm-hz-quick="${h}"><b class="bx-num">${h}</b></button>`
          ).join('')}</span>
          <span class="bx-rmh2__acts">
            <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-rm-hz-save>Change it</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-rm-hz-close>Cancel</button>
          </span>
        </span>`
            : ''
        }
      </span>`;
  }

  /* Asking is the one thing on this page that is not about what Brain already
     holds, so it does not wear a report button's clothes. Versions -> Ask Brain:
     1 it reads as a box you type into, 2 the app's own ink primary, 3 no fill at
     all - just the spark and the words. */
  /* Asking is not the same kind of thing as the buttons in a report, so it does not
     look like one: a light pill with one thin run of colour around its edge. */
  const ASK_NOTE = 'Looking for something the report does not say?';
  const askHtml = () => `
      <p class="bx-pf__asknote">${ASK_NOTE}</p>
      <button type="button" class="bx-ask4" data-ask-open><span class="bx-ask4__in">${icon('sparkles', 13)}<span>Ask Brain</span></span></button>`;

  /* The assets a brand's marks are kept in, under its Visual identity fields: the
     logos (an image whose alt text or path names someone else is held out of
     generation until the owner says it is theirs), the palette with its contrast
     checks, the typefaces and the imagery - then the design rules read from the
     brand's own pages, which only reach a brief once they are confirmed. */
  ui.rp.va = ui.rp.va || { mine: {}, rules: {}, text: {}, edit: null };
  if (ui.rp.navFind === undefined) ui.rp.navFind = null;
  const ruleState = (r) => ui.rp.va.rules[r.id] || r.state;
  const isMine = (h) => !!ui.rp.va.mine[h.id];

  function heldHtml() {
    const V = window.BRAIN_VISUAL || { held: [] };
    const imgOf = (id) =>
      (BXP.P.visual.imagery || []).find((x) => /img-\d+/.test(x.src) && x.src.includes(id));
    return `
      <section class="bx-va__block">
        <h4 class="bx-va__h">${icon('image', 14)}Logos and images<span class="bx-va__hn">${B.plural(BXP.P.visual.imagery.length + 1, 'image')} from homecourt.ai</span></h4>
        <ul class="bx-va__grid">
          <li class="bx-va__item is-primary">
            <span class="bx-va__shot"><img src="${esc(BXP.P.visual.logo.src)}" alt="" loading="lazy"></span>
            <p class="bx-va__name">Primary mark</p>
            <p class="bx-va__note">${esc(BXP.P.visual.logo.note)}</p>
            <span class="bx-va__tag is-yours">${icon('check', 11)}Yours</span>
          </li>
          ${V.held
            .map((h) => {
              const img = imgOf(h.id);
              const mine = isMine(h);
              return `
            <li class="bx-va__item ${mine ? 'is-mine' : 'is-held'}" data-va-held="${esc(h.id)}">
              <span class="bx-va__shot">${img ? `<img src="${esc(img.src)}" alt="" loading="lazy">` : ''}</span>
              <p class="bx-va__name">${esc(h.name)}</p>
              <p class="bx-va__note">${mine ? `You said this one is yours<span class="bx-sep">·</span>${esc(h.where)}` : esc(h.why)}</p>
              ${
                mine
                  ? `<span class="bx-va__tag is-yours">${icon('check', 11)}Yours</span>`
                  : `<span class="bx-va__tag is-held" data-tip="Held images never reach creative generation">${icon('alert', 11)}Held back</span>
                     <button type="button" class="bx-va__act" data-va-act="mine" data-va-id="${esc(h.id)}">${icon('check', 12)}Yes, this one is ours</button>`
              }
            </li>`;
            })
            .join('')}
        </ul>
        <p class="bx-va__foot">${icon('info', 12)}<span>An image whose alt text or path names someone else is held until you say it is yours. <b>Held images never reach creative generation.</b></span></p>
      </section>`;
  }

  const RULE_KIND = {
    prohibited: 'Prohibited',
    layout: 'Layout',
    typography: 'Typography',
    imagery: 'Imagery',
  };

  function rulesHtml() {
    const V = window.BRAIN_VISUAL || { rules: [] };
    const conf = V.rules.filter((r) => ruleState(r) === 'confirmed').length;
    const prop = V.rules.filter((r) => ruleState(r) === 'proposed').length;
    return `
      <section class="bx-va__block">
        <h4 class="bx-va__h">${icon('sliders', 14)}Design rules<span class="bx-va__hn"><b class="bx-num">${conf}</b> confirmed${prop ? `<span class="bx-sep">·</span><b class="bx-num">${prop}</b> proposed` : ''}</span></h4>
        <ul class="bx-va__rules">
          ${V.rules
            .map((r) => {
              const st = ruleState(r);
              const text = ui.rp.va.text[r.id] == null ? r.text : ui.rp.va.text[r.id];
              const editing = ui.rp.va.edit === r.id;
              return `
            <li class="bx-va__rule is-${st}" data-va-rule="${esc(r.id)}">
              <span class="bx-va__kind is-${esc(r.kind)}">${esc(RULE_KIND[r.kind] || r.kind)}</span>
              <div class="bx-va__body">
                ${
                  editing
                    ? `<textarea class="bx-va__edit" data-va-text="${esc(r.id)}" rows="2" aria-label="The rule, in your words">${esc(text)}</textarea>
                       <span class="bx-va__editacts"><button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-va-act="rule-save" data-va-id="${esc(r.id)}">Save</button><button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-va-act="rule-cancel" data-va-id="${esc(r.id)}">Cancel</button></span>`
                    : `<p class="bx-va__text">${esc(text)}</p>
                       <p class="bx-va__cite">${icon('quote', 11)}<span>${r.quote ? `“${esc(r.quote)}” <span class="bx-sep">·</span>` : ''}${esc(r.cite)}</span></p>
                       <p class="bx-va__formats">${r.formats.map((x) => `<span>${esc(x)}</span>`).join('')}</p>`
                }
              </div>
              <div class="bx-va__moves">
                ${
                  st === 'confirmed'
                    ? `<span class="bx-va__tag is-yours">${icon('check', 11)}Confirmed</span>`
                    : st === 'dropped'
                      ? `<span class="bx-va__tag">${icon('x', 11)}Not a rule</span>`
                      : `<button type="button" class="bx-bf__mv is-words is-act-confirm is-m2" data-va-act="rule-yes" data-va-id="${esc(r.id)}">${icon('check', 12)}Confirm</button>
                         <button type="button" class="bx-bf__mv is-words is-act-none is-m2" data-va-act="rule-no" data-va-id="${esc(r.id)}">${icon('none', 12)}Not a rule</button>`
                }
                <button type="button" class="bx-bf__mv is-words is-act-edit is-m2" data-va-act="rule-edit" data-va-id="${esc(r.id)}">${icon('pencil', 12)}Edit</button>
              </div>
            </li>`;
            })
            .join('')}
        </ul>
        <p class="bx-va__foot">${icon('info', 12)}<span>Only a confirmed rule reaches a brief, and a rule that names a colour is dropped at the door - the palette is stamped into every render on its own.</span></p>
      </section>`;
  }

  const assetsHtml = () => `
    <section class="bx-va">
      ${heldHtml()}
      ${BXP.visualHtml({ cls: 'bx-bp__visual--kept', skipLogo: true })}
      ${rulesHtml()}
    </section>`;

  /* one field, in one of two layouts (Versions → Field layout):
       1 Tabs   Answer / Sources / Not in the index as tabs under the head
       2 Folds  the answer alone; Sources and Not in the index fold at the foot */
  ui.rp.fFold = ui.rp.fFold || {};
  const foldOpen = (f, key) => !!ui.rp.fFold[`${f.id}:${key}`];

  function foldHtml(f, key, label, n, body, hint) {
    const open = foldOpen(f, key);
    return `
      <section class="bx-rf__fold ${open ? 'is-open' : ''}" data-rf-fold="${f.id}:${key}">
        <button type="button" class="bx-rf__foldhead" data-f-fold="${f.id}:${key}" aria-expanded="${open}">
          ${icon('chevron-right', 14, 'bx-rf__foldchev')}
          <span class="bx-rf__foldname">${label}</span>
          ${n !== '' ? `<span class="bx-rf__tcount bx-num">${n}</span>` : ''}
          <span class="bx-rf__foldhint">${hint}</span>
        </button>
        <div class="bx-disclose ${open ? 'is-open' : ''}"><div><div class="bx-rf__foldbody">${body}</div></div></div>
      </section>`;
  }

  /* A section opens on the fields it is made of - there is no paragraph over them.
     Each Brain field is its own question of the index, with its own answer, its own
     sources, how sure Brain is of it and when it was last written. Visual identity
     carries the assets on file under its fields. */
  function fieldDetail(f) {
    const prev = fields[f.index - 1];
    const next = fields[f.index + 1];
    const running = ui.rp.running[f.id] != null;
    const c = window.BXF && BXF.has(f.id) ? BXF.counts(f.id) : null;
    return `
      <div class="bx-rf__obj is-folds ${running ? 'is-running' : ''}" data-field="${f.id}" data-running="${f.id}">
        <header class="bx-card bx-rf__dhead">
          ${backHtml()}
          <span class="bx-tile is-${f.id}">${icon(X.FIELD_ICON[f.id] || 'book', 19)}</span>
          <div class="bx-rf__trow"><h3 class="bx-rf__title">${esc(f.title)}</h3></div>
          <p class="bx-rf__q">${esc(f.question)}<span class="bx-rf__qn">Section ${f.index + 1} of ${fields.length}${c ? `<span class="bx-sep">·</span>${B.plural(c.total, 'Brain field')}` : ''}</span></p>
          <div class="bx-rf__dactions">${delHtml(f.id)}${X.regenButton(f, { secondary: true, iconOnly: true })}${c && c.check ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bf-act="confirm-all" data-bf-fid="${f.id}">${icon('check', 13)}Confirm section</button>` : ''}</div>
          ${c ? BXF.head(f) : ''}
        </header>
        <div class="bx-rf__tabbody" role="region" data-f-body>${fieldBody(f)}</div>
        ${
          f.id === 'visual_identity'
            ? `<section class="bx-rf__assetsec">
          <div class="bx-ov__bh">
            <h4>Visual assets on file</h4>
            <span>what the brand's own pages carry, kept apart from what the index read about them</span>
          </div>
          <div class="bx-card bx-rf__assets">${assetsHtml()}</div>
        </section>`
            : ''
        }
        <footer class="bx-rf__steps">
          ${
            prev || B.roadmapView()
              ? `<button type="button" class="bx-link bx-link--quiet" data-f-item="${prev ? prev.id : 'roadmap'}">${icon('chevron-left', 14)}${esc(prev ? prev.title : 'Roadmap')}</button>`
              : '<span></span>'
          }
          ${
            next
              ? `<button type="button" class="bx-link bx-link--quiet" data-f-item="${next.id}">${esc(next.title)}${icon('chevron-right', 14)}</button>`
              : `<button type="button" class="bx-link bx-link--quiet" data-f-item="bp">Brand profile${icon('chevron-right', 14)}</button>`
          }
        </footer>
      </div>`;
  }

  /* the roadmap design on its own - in Report F's pane, or as a card above another
     report; the designs themselves live in `roadmap-views.js`. Its sources open
     from its own top (and from each phase) in a sheet. */

  /* Brain holds a run of plans, not one: the ones that have run, the one the report
     is on, and the one drafted ahead. They are picked from a menu rather than a bar
     across the page - there can be any number of them behind. */
  const CY_TAG = { done: 'Ended', running: 'Running now', draft: 'Draft' };
  /* A cycle carries no version number - versions live inside one - but it does
     carry an order: which ninety days of the brand's this is, counting from the
     first plan Brain ever drew. It is a mark on something that already has a name,
     so N takes it off with the section bar's glyphs. */
  const ord = (n) => {
    const v = n % 100;
    return `${n}${['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th'}`;
  };
  const cyNum = (n, cls = '') =>
    n
      ? `<b class="bx-rmord ${cls}" title="${esc(`The brand's ${ord(n)} ninety-day cycle`)}">${ord(n)}</b>`
      : '';
  const cyAt = (key) => (B.rmCycles().find((x) => x.key === key) || {}).n || 0;
  /* a draft somebody has approved is not a draft any more - it is the plan that
     takes over the morning the running one ends */
  const cyState = (c) => (c.state === 'draft' && c.approvedBy ? 'next' : c.state);
  const cyTag = (c) => (cyState(c) === 'next' ? 'Starts next' : CY_TAG[c.state]);
  // the calendar has a column, not a sentence, so it says the state in one word
  const CY_SHORT = { done: 'Ended', running: 'Now', draft: 'Draft', next: 'Next' };
  const cyShort = (c) => CY_SHORT[cyState(c)];
  /* the same reading for a plan being drawn, which carries its strategy whole */
  const rmTag = (rm) => {
    const st = rm.state || 'running';
    const next = st === 'draft' && (rm.strategy || {}).approvedBy;
    return { state: next ? 'next' : st, label: next ? 'Starts next' : CY_TAG[st] };
  };

  /* One row a plan - what it is called, how it went or what state it is in, and
     when it ran. No version number: the picker moves between CYCLES, and versions
     live inside one.

     There is only ever one cycle running and one drafted ahead, so those two are
     pinned at the top and never scroll away. What grows is the run behind, so it
     scrolls under them, newest first, broken by year, with a find box once there
     are more than a handful. A plan that has ended carries what it came to, which
     is the one thing worth scanning a long run of them for. */
  const planRow = (
    c,
    here,
    q
  ) => `<button type="button" role="menuitemradio" aria-checked="${c.key === here}" class="bx-rmpl__it is-${cyState(c)} ${c.key === here ? 'is-on' : ''} ${q && c.state !== 'done' && B.rmMatches(c, q) ? 'is-found' : ''}" data-rm-cycle="${esc(c.key)}" ${c.state === 'done' && q && !B.rmMatches(c, q) ? 'hidden' : ''}>
      ${cyNum(c.n)}
      <span class="bx-rmpl__name">${esc(c.label)}</span>
      ${
        c.state === 'done'
          ? `<span class="bx-rmpl__res ${c.met ? 'is-met' : 'is-under'}">${icon(c.met ? 'check' : 'arrow-down', 11)}<b class="bx-num">${c.pct}%</b><i>of its goal</i></span>`
          : `<span class="bx-rmpl__tag">${cyTag(c)}</span>`
      }
      <span class="bx-rmpl__m bx-num">${esc(dates.fmtShort(c.start))} – ${esc(dates.fmtShort(c.end))}</span>
    </button>`;

  function pastPlansHtml(past, here, q) {
    let year = null;
    const out = [];
    past.forEach((c) => {
      const y = c.start.slice(0, 4);
      if (y !== year) {
        if (year) out.push('</div>');
        out.push(
          `<div class="bx-rmpl__yg" data-plan-year="${esc(y)}"><span class="bx-rmpl__yr bx-num">${esc(y)}</span>`
        );
        year = y;
      }
      out.push(planRow(c, here, q));
    });
    if (year) out.push('</div>');
    return out.join('');
  }

  /* ------------------------------------------------- the run, on a calendar

     A list answers "which plans are there". It does not answer "what was running
     last February", and that is the question somebody actually arrives with - a
     brand remembers when, not what Brain called a ninety-day stretch two years
     ago. So the same run is also drawn against time. Three drawings of it,
     switched from The run on a calendar in the panel; all three name their months
     in words rather than in initials (J, M and A each stand for two months, so an
     initial says nothing on its own), carry each plan's dates with it, and are
     picked from exactly the way a row in the list is picked. */
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_MS = 86400000;
  const pad2 = (n) => String(n).padStart(2, '0');

  function calYears(cs) {
    const out = [];
    for (
      let y = Number(cs[0].start.slice(0, 4));
      y <= Number(cs[cs.length - 1].end.slice(0, 4));
      y += 1
    )
      out.push(y);
    return out;
  }

  // where a date sits across a year, as a percentage of it
  function atYear(iso, year) {
    const from = Date.UTC(year, 0, 1);
    const days = (Date.UTC(year + 1, 0, 1) - from) / DAY_MS;
    return ((dates.toDate(iso).getTime() - from) / DAY_MS / days) * 100;
  }

  const calSpan = (c) => `${dates.fmtShort(c.start)} – ${dates.fmtShort(c.end)}`;
  /* the report's own bubble, not the browser's: the name in bold, then when it
     ran, what state it is in, and - for one that has ended - what it came to */
  const calTip = (c) =>
    `${c.label} · ${calSpan(c)} · ${cyTag(c)}${
      c.state === 'done' && c.pct != null
        ? ` · ${c.pct}% of its goal, ${c.met ? 'met' : 'missed'}`
        : ''
    }`;
  /* A plan that has ended is not simply grey: one that met its goal keeps a
     little of the colour a finished phase wears everywhere else in the plan, and
     one that fell short goes neutral. Over a run of a dozen cycles that is the
     difference between a wall of grey and a record read at a glance. */
  /* The calendar is read by picking a date, not by typing one: a month chosen
     from the picker beside the year leaves only the plan that was running then
     lit. The find box stays where typing belongs - the list. */
  const calLit = (c, q) => {
    const j = ui.rp.rmJump;
    if (j) {
      const a = j.length === 7 ? c.start.slice(0, 7) : c.start;
      const b = j.length === 7 ? c.end.slice(0, 7) : c.end;
      if (!(a <= j && b >= j)) return false;
    }
    return B.rmMatches(c, q);
  };

  const calCls = (c, here, q) =>
    `is-${cyState(c)}${c.state === 'done' ? (c.met ? ' is-met' : ' is-missed') : ''}${c.key === here ? ' is-on' : ''}${calLit(c, q) ? '' : ' is-dim'}`;

  /* A plan wears one mark rather than a word: a clock for the one running, a
     flag for the one drafted ahead, a check for one that is settled, and the
     turn of history for one that has ended. */
  const CAL_ICON = { done: 'history', running: 'gauge', draft: 'milestone', next: 'check' };

  /* how far through itself the plan that is running has got. Drawn into its own
     block as a deeper band, so the one plan on the calendar that is still moving
     looks like it is moving. */
  function calRun(c, from, to) {
    if (c.state !== 'running') return '';
    const today = B.state.today;
    const span = dates.diffDays(from, to) + 1;
    const p = ((dates.diffDays(from, today) + 1) / span) * 100;
    if (p <= 0 || p >= 100) return '';
    return `;--p:${Math.max(0, Math.min(100, p)).toFixed(2)}%`;
  }

  /* The three parts a plan on the lane is made of: the mark that says what state
     it is in, its name over its dates, and how it went. A narrow ribbon gives
     them up in that order, from the back. */
  const calMark = (c) =>
    `<span class="bx-rmcal__ic">${icon(CAL_ICON[cyState(c)] || 'history', 13)}</span>`;

  const calWords = (c) =>
    `<span class="bx-rmcal__t"><b>${esc(c.label)}</b><i class="bx-num">${esc(calSpan(c))}</i></span>`;

  const calEnd = (c) =>
    c.state === 'done' && c.pct != null
      ? `<span class="bx-rmcal__mk ${c.met ? 'is-met' : ''}"><em aria-hidden="true"></em><b class="bx-num">${c.pct}%</b></span>`
      : `<span class="bx-rmcal__mk is-state"><em aria-hidden="true"></em><b>${cyShort(c)}</b></span>`;

  /* ---- 1 - ribbon: a year a page --------------------------------------------

     A lane a year stacked down the menu runs out of room the moment a brand has
     a few years behind it, and reading three years at once was never the point -
     the question is what a given year held. So the ribbon is paged: one year
     filling the width, the year itself as the heading with its record beside it,
     and the arrows a planner puts there. It opens on the year the running plan
     is in, and the find box moves it to the first year that answers. */
  const calYearOf = (cs) => {
    const all = calYears(cs);
    const now = cs.find((c) => c.state === 'running');
    const fallback = now ? Number(now.start.slice(0, 4)) : all[all.length - 1];
    const want = ui.rp.rmYear == null ? fallback : ui.rp.rmYear;
    return Math.min(all[all.length - 1], Math.max(all[0], want));
  };

  /* A year on one line is a strip. A year on three lines of four months is a
     calendar - and it gives every month four times the width, which is what lets
     a plan carry its dates as well as its name. A plan that runs over the end of
     a row is cut there and picked up on the next, the same way one that runs over
     New Year is cut at the year. */
  const RIB_ROWS = [
    [0, 3],
    [4, 7],
    [8, 11],
  ];
  // the width of one row of the lane, for deciding what a segment has room for
  const RIB_W = 480;

  const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  /* Picking a date rather than typing one. A month was not enough - a plan
     changes hands mid-month, so "which plan was running on the 14th" is a real
     question - so the picker goes down to the day: the years Brain holds, a
     month stepper whose name picks the whole month, and the month itself as a
     calendar.

     Which days a plan covers, and what state it was in, is said by a MARK under
     the day rather than by colouring the cell: a block big enough to read is a
     block big enough to drown the numeral it is meant to describe. Three marks,
     switched from The date picker in the panel - all of them one markup, with
     the day it opened and the day it closed called out. */
  const MONTH_FULL = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const jumpMonth = () => {
    const j = ui.rp.rmJump;
    if (ui.rp.rmJumpMon) return ui.rp.rmJumpMon;
    if (j) return j.slice(0, 7);
    const today = B.state.today;
    return today.slice(0, 7);
  };

  // a plan covers a day when the day falls inside it; months compare the same way
  const planOn = (cs, iso) =>
    cs.find((c) =>
      iso.length === 7
        ? c.start.slice(0, 7) <= iso && c.end.slice(0, 7) >= iso
        : c.start <= iso && c.end >= iso
    );

  function jumpMenu(cs) {
    const years = calYears(cs);
    const mon = jumpMonth();
    const y = Number(mon.slice(0, 4));
    const m = Number(mon.slice(5)) - 1;
    const jumped = ui.rp.rmJump;
    const today = B.state.today;
    const first = Date.UTC(y, m, 1);
    // weeks run Monday first, the way a plan's phases are counted
    const lead = (new Date(first).getUTCDay() + 6) % 7;
    const days = daysIn(y, m);
    const cells = [];
    for (let i = 0; i < lead; i += 1) cells.push('<span class="bx-rmcal__jpad"></span>');
    for (let d = 1; d <= days; d += 1) {
      const iso = `${mon}-${pad2(d)}`;
      const plan = planOn(cs, iso);
      const cls = [
        plan ? `is-${cyState(plan)}` : 'is-none',
        // how it went, not only that it ended - the same split the calendar makes
        plan && plan.state === 'done' ? (plan.met ? 'is-met' : 'is-missed') : '',
        plan && plan.start === iso ? 'is-first' : '',
        plan && plan.end === iso ? 'is-last' : '',
        iso === today ? 'is-today' : '',
        jumped === iso ? 'is-on' : '',
      ]
        .filter(Boolean)
        .join(' ');
      cells.push(
        `<button type="button" class="bx-rmcal__jday ${cls}" data-rm-jump-to="${iso}" ${plan ? '' : 'disabled'} ${plan ? `data-tip="${esc(`${MON[m]} ${d} · ${plan.label}`)}"` : ''}><b class="bx-num">${d}</b><u aria-hidden="true"></u></button>`
      );
    }
    const stepMon = (delta) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
    };
    const monPlan = planOn(cs, mon);
    const said = jumped ? planOn(cs, jumped) : null;
    return `<span class="bx-rmcal__jump" role="dialog" aria-label="Go to a date">
      <span class="bx-rmcal__jyears">
        ${years
          .map(
            (yy) =>
              `<button type="button" class="bx-rmcal__jyear ${yy === y ? 'is-on' : ''}" data-rm-jump-mon="${yy}-${pad2(m + 1)}">${yy}</button>`
          )
          .join('')}
      </span>
      <span class="bx-rmcal__jmhead">
        <button type="button" class="bx-rmcal__jstep" data-rm-jump-mon="${stepMon(-1)}" aria-label="The month before">${icon('chevron-left', 14)}</button>
        <button type="button" class="bx-rmcal__jmname ${jumped === mon ? 'is-on' : ''}" data-rm-jump-to="${mon}" ${monPlan ? '' : 'disabled'}>${MONTH_FULL[m]}<span class="bx-num">${y}</span></button>
        <button type="button" class="bx-rmcal__jstep" data-rm-jump-mon="${stepMon(1)}" aria-label="The month after">${icon('chevron-right', 14)}</button>
      </span>
      <span class="bx-rmcal__jdows" aria-hidden="true">${DOW.map((d) => `<i>${d}</i>`).join('')}</span>
      <span class="bx-rmcal__jdays">${cells.join('')}</span>
      <span class="bx-rmcal__jfoot">
        <i>${said ? `${esc(said.label)}<span class="bx-sep">·</span>${esc(cyTag(said))}` : 'Pick a day to find the plan that was running'}</i>
        ${jumped ? '<button type="button" class="bx-rmcal__jclear" data-rm-jump-clear>Clear</button>' : ''}
      </span>
    </span>`;
  }

  function calRibbon(cs, here, q) {
    const all = calYears(cs);
    const year = calYearOf(cs);
    const at = all.indexOf(year);
    const today = B.state.today;
    const yFrom = `${year}-01-01`;
    const yTo = `${year}-12-31`;

    const wins = RIB_ROWS.map(([m0, m1]) => {
      const from = `${year}-${pad2(m0 + 1)}-01`;
      const to = dates.addDays(m1 === 11 ? `${year + 1}-01-01` : `${year}-${pad2(m1 + 2)}-01`, -1);
      return { m0, m1, from, to, days: dates.diffDays(from, to) + 1 };
    });

    /* A calendar's columns are EQUAL - that is what makes it a grid. Months are
       not: Jan-Apr is 120 days and Sep-Dec is 122, so measuring a row by its days
       put the first boundary at 25.8% on one row and 24.6% on another, and the
       three rows no longer lined up under one another. So each month takes a
       quarter of its row whatever its length, and a date is placed inside its own
       month: column + how far through that month it is. */
    const where = (iso, w) => {
      const m = Number(iso.slice(5, 7)) - 1;
      const d = Number(iso.slice(8, 10));
      return (((m - w.m0 + (d - 1) / daysIn(year, m)) / 4) * 100).toFixed(3) * 1;
    };
    const aDay = (iso) => (1 / daysIn(year, Number(iso.slice(5, 7)) - 1) / 4) * 100;

    /* every piece of a plan this page draws, so the piece that holds most of it
       can be the one that carries its name */
    const cut = [];
    wins.forEach((w) => {
      cs.forEach((c) => {
        if (c.start > w.to || c.end < w.from) return;
        const st = c.start < w.from ? w.from : c.start;
        const en = c.end > w.to ? w.to : c.end;
        cut.push({ c, w, st, en, days: dates.diffDays(st, en) + 1 });
      });
    });
    const biggest = {};
    cut.forEach((p) => {
      if (!biggest[p.c.key] || p.days > biggest[p.c.key].days) biggest[p.c.key] = p;
    });

    const rows = wins
      .map((w) => {
        const months = [];
        for (let i = w.m0; i <= w.m1; i += 1) {
          const key = `${year}-${pad2(i + 1)}`;
          const mine = today.slice(0, 7) === key;
          months.push(
            `<i class="${mine ? 'is-now' : ''} ${(ui.rp.rmJump || '').slice(0, 7) === key ? 'is-picked' : ''}">${MON[i]}</i>`
          );
        }
        const segs = cut
          .filter((p) => p.w === w)
          .map((p) => {
            const { c, st, en } = p;
            const l = where(st, w);
            const width = Math.min(100 - l, where(en, w) - l + aDay(en));
            const named = biggest[c.key] === p;
            const room = Math.round((width / 100) * RIB_W);
            const fit = room < 86 ? ' is-bare' : room < 150 ? ' is-tight' : '';
            return `<button type="button" class="bx-rmcal__rib ${calCls(c, here, q)}${c.start < w.from ? ' is-cutl' : ''}${c.end > w.to ? ' is-cutr' : ''}${named ? fit : ' is-tail'}" data-rm-cycle="${esc(c.key)}" data-cal-seg="${esc(c.key)}" style="--l:${l.toFixed(3)}%;--w:${width.toFixed(3)}%${calRun(c, st, en)}" data-tip="${esc(calTip(c))}">
              ${named ? `${calMark(c)}${calWords(c)}${calEnd(c)}` : ''}
            </button>`;
          })
          .join('');
        const now =
          today >= w.from && today <= w.to
            ? `<i class="bx-rmcal__now" style="--l:${where(today, w).toFixed(3)}%" data-tip="${esc(`Today \u00b7 ${dates.fmtLong(today)}`)}"></i>`
            : '';
        return `<div class="bx-rmcal__qr">
          <span class="bx-rmcal__mons" aria-hidden="true">${months.join('')}</span>
          <div class="bx-rmcal__lane">${segs}${now}</div>
        </div>`;
      })
      .join('');

    const mine = cs.filter((c) => c.start <= yTo && c.end >= yFrom);
    const met = mine.filter((c) => c.state === 'done' && c.met).length;
    const ended = mine.filter((c) => c.state === 'done').length;
    const step = (d, label) => {
      const to2 = all[at + d];
      return `<button type="button" class="bx-rmcal__step" data-rm-year="${to2 == null ? '' : to2}" ${to2 == null ? 'disabled' : ''} aria-label="${esc(label)}">${icon(d < 0 ? 'chevron-left' : 'chevron-right', 15)}</button>`;
    };
    /* three columns of lines drawn once over the whole year, not once a row: the
       grid is one grid, and nothing about a row can move them */
    const lines = [25, 50, 75].map((l) => `<u style="--l:${l}%"></u>`).join('');
    return `<div class="bx-rmcal__page">
      <div class="bx-rmcal__phead">
        <span class="bx-rmcal__pick">
          <button type="button" class="bx-rmcal__ybtn ${ui.rp.rmJumpOpen ? 'is-on' : ''}" data-rm-jump aria-haspopup="true" aria-expanded="${!!ui.rp.rmJumpOpen}" aria-label="Go to a month">
            <b class="bx-num">${year}</b>${ui.rp.rmJump ? `<i class="bx-num">${MON[Number(ui.rp.rmJump.slice(5, 7)) - 1]}${ui.rp.rmJump.length > 7 ? ` ${Number(ui.rp.rmJump.slice(8))}` : ''}</i>` : ''}${icon('chevron-down', 13)}
          </button>
          ${ui.rp.rmJumpOpen ? jumpMenu(cs) : ''}
        </span>
        <span class="bx-rmcal__pnote">${B.plural(mine.length, 'plan')}${ended ? `<span class="bx-sep">\u00b7</span>${met} of ${ended} met` : ''}</span>
        <span class="bx-rmcal__steps">${step(-1, `The year before ${year}`)}${step(1, `The year after ${year}`)}</span>
      </div>
      <div class="bx-rmcal__grid">${rows}<span class="bx-rmcal__gridl" aria-hidden="true">${lines}</span></div>
    </div>`;
  }

  const calHtml = (cs, here, q) =>
    `<div class="bx-rmcal" data-rm-cal>
      ${calRibbon(cs, here, q)}
      <p class="bx-rmpl__none" data-rm-findnone hidden>No plan Brain holds runs then.</p>
    </div>`;

  function plansMenu() {
    const here = B.rmCycle();
    const cs = B.rmCycles();
    // time order out of rmCycles: the run behind reads better newest first
    const live = cs.filter((c) => c.state !== 'done');
    const past = cs.filter((c) => c.state === 'done').reverse();
    const q = (ui.rp.rmFind || '').trim();
    const cal = ui.rp.rmView === 'cal';
    const shown = past.filter((c) => B.rmMatches(c, q));
    return `
      <span class="bx-rmpl__pop ${cal ? 'is-cal' : ''}" role="menu" aria-label="The plans Brain holds">
        <span class="bx-rmpl__h">
          <span>The plans Brain holds<em class="bx-num">${cs.length}</em></span>
          <span class="bx-rmpl__views" role="radiogroup" aria-label="How the run of plans is read">
            ${[
              ['list', 'rows', 'As a list'],
              ['cal', 'calendar', 'On a calendar'],
            ]
              .map(
                ([v, ic, label]) =>
                  `<button type="button" role="radio" aria-checked="${(ui.rp.rmView || 'list') === v}" class="bx-rmpl__view ${(ui.rp.rmView || 'list') === v ? 'is-on' : ''}" data-rm-view="${v}" aria-label="${esc(label)}" title="${esc(label)}">${icon(ic, 13)}</button>`
              )
              .join('')}
          </span>
        </span>
        ${
          cal
            ? ''
            : `<label class="bx-rmpl__find">${icon('search', 12)}<input type="text" data-rm-findq placeholder="Find a plan, or a date it ran" value="${esc(q)}" aria-label="Find a plan by name, or by a month, a year or a day it ran" spellcheck="false"></label>`
        }
        ${
          cal
            ? calHtml(cs, here, q)
            : `<div class="bx-rmpl__pin">${live.map((c) => planRow(c, here, q)).join('')}</div>
        <div class="bx-rmpl__gh">
          <span>Before this<em class="bx-num" data-rm-findn>${shown.length}</em></span>
        </div>
        <div class="bx-rmpl__past" data-rm-pastlist>
          ${pastPlansHtml(past, here, q)}
          <p class="bx-rmpl__none" data-rm-findnone ${shown.length ? 'hidden' : ''}>No plan Brain holds is called that, or runs then.</p>
        </div>`
        }
      </span>`;
  }

  /* the find box filters in place rather than redrawing the menu, so the caret
     stays where it is; a year whose plans have all gone goes with them, and on the
     calendar a plan that is out dims rather than leaving a hole in the year */
  function filterPlans(root) {
    const pop = root && root.querySelector('.bx-rmpl__pop');
    if (!pop) return;
    const q = (ui.rp.rmFind || '').trim();
    const hit = {};
    B.rmCycles().forEach((c) => {
      hit[c.key] = B.rmMatches(c, q);
    });
    let n = 0;
    pop.querySelectorAll('.bx-rmpl__pin [data-rm-cycle]').forEach((r) => {
      r.classList.toggle('is-found', !!q && hit[r.dataset.rmCycle]);
    });
    pop.querySelectorAll('.bx-rmpl__yg').forEach((g) => {
      let seen = 0;
      g.querySelectorAll('[data-rm-cycle]').forEach((r) => {
        const on = hit[r.dataset.rmCycle];
        r.hidden = !on;
        if (on) seen += 1;
      });
      g.hidden = seen === 0;
      n += seen;
    });
    let calSeen = 0;
    pop.querySelectorAll('[data-cal-seg]').forEach((segEl) => {
      const on = hit[segEl.dataset.calSeg];
      segEl.classList.toggle('is-dim', !on);
      if (on) calSeen += 1;
    });
    const count = pop.querySelector('[data-rm-findn]');
    if (count) count.textContent = String(n);
    const none = pop.querySelector('[data-rm-findnone]');
    if (none) none.hidden = pop.querySelector('[data-rm-cal]') ? calSeen > 0 : n > 0;
  }

  /* a plan that is not the one running says so on the card itself, loudly enough
     that nobody reads it as the plan in force */
  function cycleFlag(rm) {
    if (rm.live) return '';
    const o = rm.outcome || {};
    const st = rm.strategy || {};
    const done = rm.state === 'done';
    const pctOf = done && o.of ? Math.round((Number(o.figure) / Number(o.of)) * 100) : 0;
    return `
      <div class="bx-rmflag is-${esc(rmTag(rm).state)}">
        <div class="bx-rmflag__head">
          <span class="bx-rmflag__tag">${icon(done ? 'history' : 'milestone', 12)}${rmTag(rm).label}</span>
          <h4 class="bx-rmflag__name">${esc(rm.label)}</h4>
          <p class="bx-rmflag__m">${(() => {
            const n = cyAt(B.rmCycle());
            return n
              ? `${cyNum(n, 'is-said')}<span>cycle</span><span class="bx-sep">\u00b7</span>`
              : '';
          })()}<span class="bx-num">${esc(dates.fmtShort(rm.start))} \u2013 ${esc(dates.fmtShort(rm.end))}</span><span class="bx-sep">\u00b7</span><span class="bx-num">${rm.horizon}</span> days</p>
          <button type="button" class="bx-rmback" data-rm-cycle="now">
            <span class="bx-tile is-roadmap">${icon('gauge', 15)}</span>
            <span class="bx-rmback__t"><b>The plan running now</b><small>${(() => {
              const now = B.rmCycles().find((x) => x.key === 'now') || {};
              return `${esc(now.label || '')}<span class="bx-sep">\u00b7</span><span class="bx-num">${esc(dates.fmtShort(now.start))} \u2013 ${esc(dates.fmtShort(now.end))}</span>`;
            })()}</small></span>
            ${icon('arrow-right', 13)}
          </button>
        </div>
        ${sumHtml(rm, done, pctOf)}
      </div>`;
  }

  /* What a plan that is not the running one came to: the verdict and its note at the
     left, the figure standing at the right behind a short rule - told apart by that
     rather than by a fill of its own, which would make the card taller than the two
     lines of words beside it. */
  function sumHtml(rm, done, pctOf) {
    const o = rm.outcome || {};
    const met = pctOf >= 100;
    const ok = done ? null : B.rmApproval(B.rmCycle());
    const said = done
      ? met
        ? 'It met its goal'
        : 'It missed its goal'
      : ok
        ? 'Approved, and waiting its turn'
        : 'Waiting on your approval';
    const note = done
      ? esc(o.note || '')
      : ok
        ? `Brain drafted it from what the plan before it ended on, and ${esc(ok.by === 'You' ? 'you' : ok.by)} approved its strategy. It takes over the morning the running plan ends.`
        : `Brain drafted it from what the plan before it ended on. Approving its strategy is what writes the plan - until then nothing in it is settled, and nothing runs from it.`;
    return `<div class="bx-rmout ${done ? (met ? 'is-met' : 'is-under') : ok ? 'is-next' : 'is-draft'}">
      <span class="bx-rmout__badge">${icon(done ? (met ? 'check' : 'alert') : ok ? 'check' : 'clock', 17)}</span>
      <span class="bx-rmout__body">
        <b class="bx-rmout__said">${said}</b>
        <p class="bx-rmout__note">${note}</p>
      </span>
      <span class="bx-rmout__stat">
        <b class="bx-num">${done ? `${esc(o.figure)}<i>/${esc(o.of)}</i>` : esc(dates.fmtShort(rm.start))}</b>
        <small>${done ? `${pctOf}% of the goal` : `${rm.horizon} days, ${rm.phases.length} phases`}</small>
      </span>
    </div>`;
  }

  /* who last said this plan is right. Approving the strategy wrote the plan;
     confirming it is a second act, and changing the plan takes it away again. */
  /* who last said this plan is right - a quiet mark in the row the Confirm plan
     button stands in, so the head keeps one shape whichever state it is in */
  function signHtml() {
    const sg = B.rmSigned();
    if (!sg) return '';
    const face =
      sg.by === 'You' ? 'assets/avatars/you.png' : window.BRAIN_ROADMAP.strategy.approverAvatar;
    return `<span class="bx-rmsign" title="${esc(`Confirmed by ${sg.by} on ${dates.fmtLong(sg.at)}`)}">
      <img class="bx-rmsign__av" src="${esc(face)}" width="20" height="20" alt="" loading="lazy" decoding="async">
      ${icon('check', 12)}
      <span>Confirmed by <b>${esc(sg.by === 'You' ? 'you' : sg.by)}</b><span class="bx-sep">\u00b7</span><b class="bx-num">${esc(dates.fmtShort(sg.at))}</b></span>
    </span>`;
  }

  /* The plan drafted ahead is approved from here. Approving its strategy is what
     writes it - the goal, the KPI and the phases stop being suggestions - and it
     becomes the plan the report runs on the morning the running one ends. Once it
     is approved the button gives way to the same quiet mark the running plan's
     confirmation wears. A plan that has ended is read only, and offers neither. */
  function approveHtml(rm) {
    if (rm.state !== 'draft') return '';
    const ok = B.rmApproval(B.rmCycle());
    if (!ok)
      return `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-rm-approve>${icon('check', 13)}Approve this strategy</button>`;
    const you = ok.by === 'You';
    return `<span class="bx-rmsign" title="${esc(`Approved by ${ok.by} on ${dates.fmtLong(ok.at)}`)}">
      <img class="bx-rmsign__av" src="${esc(ok.avatar || window.BRAIN_ROADMAP.strategy.approverAvatar)}" width="20" height="20" alt="" loading="lazy" decoding="async">
      ${icon('check', 12)}
      <span>Approved by <b>${esc(you ? 'you' : ok.by)}</b><span class="bx-sep">\u00b7</span><b class="bx-num">${esc(dates.fmtShort(ok.at))}</b></span>
    </span>`;
  }

  /* A phase names the KPI it leads with, and the mapping is by key, not by
     position - the spring plan's first phase leads with its second KPI. The two
     lists read as unrelated columns unless the record says so, which is what
     these three layouts are for. Switched in the prototype bar. */
  /* roadmapAt() already resolves `phase.lead` from a KPI key into the KPI
     itself, so take it as it comes and only fall back to a key lookup. */
  function kpiOf(rm, ph) {
    if (ph.lead && typeof ph.lead === 'object') return ph.lead;
    return (rm.kpis || []).find((k) => k.key === ph.lead) || null;
  }

  const leadKey = (ph) => (ph.lead && ph.lead.key ? ph.lead.key : ph.lead);

  function kpiSays(k) {
    return `${/less|under|below/.test(k.note) ? 'should come in at' : 'should reach'} <b class="bx-num">${esc(k.target)}</b> ${esc(k.note)}`;
  }

  function phWindow(ph) {
    return `${esc(dates.fmtShort(ph.start))} \u2013 ${esc(dates.fmtShort(ph.end))}`;
  }

  /* The phases and the KPI tree are one record read together: a row a phase, and
     the KPI that phase leads with standing beside it. Read apart they are two lists
     a reader has to join up by hand. */
  function recordPairs(rm) {
    const phases = rm.phases || [];
    return `<div class="bx-rmpair"><dt class="is-phases">${icon('milestone', 12)}Phases &amp; KPI</dt><dd>
      <ol class="bx-rmpair__rows">
        ${phases
          .map((ph) => {
            const k = kpiOf(rm, ph);
            return `<li data-pair="${esc(ph.key)}">
              <em class="bx-num">${ph.index + 1}</em>
              <span class="bx-rmpair__ph"><b>${esc(ph.name)}</b><i class="bx-num">${phWindow(ph)}</i></span>
              <span class="bx-rmpair__arrow" aria-hidden="true">${icon('arrow-right', 12)}</span>
              <span class="bx-rmpair__kpi">${
                k ? `<b>${esc(k.label)}</b><i>${kpiSays(k)}</i>` : '<i>no KPI leads this phase</i>'
              }</span>
              <span class="bx-rmpair__end">ends on <b>${esc(ph.milestoneLabel)}</b></span>
            </li>`;
          })
          .join('')}
      </ol>
    </dd></div>`;
  }

  function cycleRecord(rm) {
    const st = rm.strategy || {};
    return `
      <section class="bx-rmrec">
        <div class="bx-ov__bh"><h4>What this plan ${rm.state === 'draft' ? 'holds' : 'held'}</h4><span>the three records the strategy ${rm.state === 'draft' ? 'drafted' : 'wrote'}<span class="bx-sep">\u00b7</span>read-only</span></div>
        <div class="bx-card bx-rmrec__card">
          <dl class="bx-rmrec__list">
            <div><dt class="is-marketing">${icon('flag', 12)}Marketing goal</dt><dd>${esc(rm.marketing.goal)}.</dd></div>
            ${recordPairs(rm)}
            <div><dt class="is-strategy">${icon('located', 12)}${rm.state === 'draft' ? 'Drafted from' : 'Approved strategy'}</dt><dd>
              <span class="bx-rmrec__answer">${esc(st.answer || '')}.</span>
              ${
                st.approvedBy
                  ? `<span class="bx-rmrec__by"><span class="bx-rmrec__who"><img src="${esc(st.approverAvatar || window.BRAIN_ROADMAP.strategy.approverAvatar)}" width="22" height="22" alt="" loading="lazy" decoding="async">${icon('check', 10)}</span><span>Approved by <b>${esc(st.approvedBy === 'You' ? 'you' : st.approvedBy)}</b><span class="bx-sep">\u00b7</span><b class="bx-num">${esc(dates.fmtShort(st.approvedAt))}</b></span></span>`
                  : `<span class="bx-rmrec__by is-none">${icon('clock', 12)}<span>Nobody has approved it yet</span></span>`
              }
            </dd></div>
          </dl>
        </div>
      </section>`;
  }

  /* The plan runs out. Ninety days before it does nobody minds; inside the last
     phase it is the most time-sensitive thing on the page, because the next ninety
     have to be approved before these end or the plan lapses with nothing behind it.
     It is said here, on the plan, and again on the overview under Needs your
     review - the two places somebody would be looking. */
  function dueHtml(rm) {
    if (!rm.live) return '';
    const d = B.rmDue(B.state.today);
    if (!d) return '';
    const n = d.next;
    return `
      <div class="bx-card bx-rmnext ${n ? '' : 'is-none'}" data-rm-due>
        <span class="bx-tile is-roadmap">${icon('clock', 18)}</span>
        <p class="bx-rmnext__t">
          <b>${esc(d.label)} ends in <span class="bx-num">${d.days}</span> ${d.days === 1 ? 'day' : 'days'}<span class="bx-sep">·</span><span class="bx-num">${esc(dates.fmtShort(d.end))}</span></b>
          <span>${
            n
              ? `<b>${esc(n.label)}</b> is drafted for the ninety days after it, but nobody has approved its strategy yet - so there is no plan to run from on the first morning.`
              : 'Nothing is drafted for the ninety days after it. Brain writes the next plan from what this one ends on, once a strategy for it is approved.'
          }</span>
        </p>
        ${
          n
            ? `<button type="button" class="bx-rmnext__go" data-rm-cycle="${esc(n.key)}">Read the draft${icon('arrow-right', 13)}</button>`
            : `<button type="button" class="bx-rmnext__go" data-go-tab="strategy">Go to Strategy${icon('arrow-right', 13)}</button>`
        }
      </div>`;
  }

  function roadmapDetail(rm, ctx) {
    const c = window.BXF && BXF.has('roadmap') ? BXF.counts('roadmap') : null;
    const live = rm.live;
    const signed = B.rmSigned();
    return `
      <div class="bx-rf__obj bx-rf__obj--rm ${live ? '' : 'is-past'}" data-rf-roadmap>
        <header class="bx-card bx-rf__dhead is-rm">
          ${backHtml()}
          <span class="bx-tile is-roadmap">${icon('gauge', 19)}</span>
          <div class="bx-rf__trow"><h3 class="bx-rf__title">Roadmap</h3><span class="bx-pill bx-rmst is-${esc(rmTag(rm).state)}">${rmTag(rm).label}</span></div>
          <p class="bx-rf__q">What is the plan, and where is it up to?<span class="bx-rf__qn">${
            live
              ? `${c ? `${B.plural(c.total, 'Brain field')}<span class="bx-sep">\u00b7</span>` : ''}you wrote them when you approved the plan`
              : rm.state === 'done'
                ? `a plan Brain has kept<span class="bx-sep">\u00b7</span>the report runs on the one after it`
                : rmTag(rm).state === 'next'
                  ? `approved, and waiting its turn<span class="bx-sep">\u00b7</span>it takes over the morning the running plan ends`
                  : `a plan Brain has drafted<span class="bx-sep">\u00b7</span>the report runs on the one before it`
          }</span></p>
          <div class="bx-rf__dactions">
            ${live ? horizonHtml(rm) : ''}
            <span class="bx-rmpl">
              <button type="button" class="bx-rmpl__btn ${ui.rp.rmPlansOpen ? 'is-on' : ''}" data-rm-plans aria-haspopup="menu" aria-expanded="${!!ui.rp.rmPlansOpen}" aria-label="The plans Brain holds - reading ${esc(rm.label || '')}" title="The plans Brain holds">${icon('layers', 14)}${cyNum(cyAt(B.rmCycle()))}<span>${esc(rm.label || '')}</span>${icon('chevron-down', 12)}</button>
              ${ui.rp.rmPlansOpen ? plansMenu() : ''}
            </span>
            ${
              live && (!signed || (c && c.check))
                ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-rm-sign data-bf-fid="roadmap">${icon('check', 13)}Confirm plan</button>`
                : live
                  ? signHtml()
                  : approveHtml(rm)
            }
          </div>
          ${live && c ? BXF.head({ id: 'roadmap', title: 'Roadmap' }) : ''}
        </header>
        ${dueHtml(rm)}
        <div class="bx-card bx-rf__rmpane ${live ? '' : 'is-past'}">${cycleFlag(rm)}${X.roadmapPane(ctx)}</div>
        ${
          live
            ? `<section class="bx-rf__rmfields">
          ${BXF.viewHtml(
            {
              id: 'roadmap',
              title: 'The plan',
              question: 'What is the plan, and where is it up to?',
            },
            { head: false }
          )}
        </section>`
            : cycleRecord(rm)
        }
      </div>`;
  }

  /* the profile as the product renders it: Regenerate report and Export above,
     then the captured report article - hero card, then one card per section */
  function profileDoc() {
    const PP = window.BRAIN_PROFILE_PAGE;
    if (!PP) return '';
    return `
      <div class="bx-bpp" data-bp="all">${PP.article}</div>`;
  }

  /* ------------------------------------------------------------ the overview

     The Report opens on one page that says what Brain holds: how far every section
     is, what needs the brand, the plan and the brand profile. A section is opened
     from here (or from the bar), and opens on its own fields. */

  /* the sections the report is read in: the roadmap first, because it is the one
     with a clock on it, then the captured report's own seven */
  const secCounts = (id) => (window.BXF && BXF.has(id) ? BXF.counts(id) : null);
  const SEC_LABEL = {
    confirmed: 'confirmed',
    direct: 'direct',
    inferred: 'inferred',
    missing: 'missing',
  };
  const secLabels = (c) =>
    ['confirmed', 'direct', 'inferred', 'missing']
      .filter((k) => c[k])
      .map(
        (k) =>
          `<span class="bx-ov__lab is-${k}"><b class="bx-num">${c[k]}</b>${SEC_LABEL[k]}</span>`
      )
      .join('');

  /* ------------------------------------------------------- the plan's own card

     The plan is a section like any other, so it carries its count at the top right
     and its fields' states at the foot. What is different is that it runs: the
     phases are arrowheads pointing into each other - the one running in ink, the
     one behind it light, the ones ahead hollow - and under them a dated line of
     their own with room around it, so nothing is read on top of anything else.
     Three designs (Versions -> Roadmap card). */

  const PH_STATE = { done: 'Done', current: 'Running now', upcoming: 'Ahead' };

  const phSpan = (p) => Math.max(1, p.days[1] - p.days[0] + 1);

  // the arrowheads: which phase, what it is called, and what state it is in
  function phArrows(rm, opts = {}) {
    const total = rm.phases.reduce((n, p) => n + phSpan(p), 0);
    return `
      <span class="bx-rmp__arrows ${opts.cls || ''}">
        ${rm.phases
          .map(
            (p, i) => `
        <span class="bx-rmp__ph is-${p.state}" style="flex:${((phSpan(p) / total) * 100).toFixed(2)}" data-tip="${esc(`${p.name} · ${dates.fmtShort(p.start)} – ${dates.fmtShort(p.end)} · ${PH_STATE[p.state]}`)}">
          <b class="bx-rmp__phn">Phase ${i + 1}</b>
          <em class="bx-rmp__phname">${esc(p.name)}${p.state === 'done' ? icon('check', 10) : ''}</em>
        </span>`
          )
          .join('')}
      </span>`;
  }

  // the line the plan runs along: a dot a boundary, the two ends dated on the page
  function phAxis(rm, opts = {}) {
    const at = (d) => Math.max(0, Math.min(100, (d / rm.horizon) * 100));
    const ticks = [
      {
        d: 0,
        label: dates.fmtShort(rm.start),
        tip: `${dates.fmtShort(rm.start)} · the plan starts`,
      },
      ...rm.phases.map((p) => ({
        d: p.days[1],
        label: dates.fmtShort(p.end),
        tip: `${dates.fmtShort(p.end)} · ${p.name} ends`,
      })),
    ];
    const live = !rm.before && !rm.after;
    return `
      <span class="bx-rmp__axis ${opts.cls || ''}">
        <span class="bx-rmp__rail" aria-hidden="true"></span>
        ${ticks
          .map(
            (t, i) =>
              `<i class="bx-rmp__tick ${i === 0 ? 'is-first' : ''} ${i === ticks.length - 1 ? 'is-last' : ''}" style="left:${at(t.d).toFixed(2)}%" data-tip="${esc(t.tip)}"><em>${esc(t.label)}</em></i>`
          )
          .join('')}
        ${
          live
            ? `<i class="bx-rmp__today" style="left:${at(rm.dayRaw - 0.5).toFixed(2)}%" data-tip="${esc(`Today · ${dates.fmtShort(rm.today)} · day ${rm.day} of ${rm.horizon}`)}"><b class="bx-num">${esc(dates.fmtShort(rm.today))}</b></i>`
            : ''
        }
      </span>`;
  }

  const rmCount = (c) =>
    c
      ? `<span class="bx-ov__count"><b class="bx-num">${c.confirmed + c.direct + c.inferred}</b><span class="bx-num">/${c.total}</span></span>`
      : '';

  const rmClock = (rm) => {
    const left = Math.max(0, rm.horizon - rm.day);
    return `<span class="bx-rmp__clock"><i>Day</i><b class="bx-num">${rm.day}</b><span class="bx-num">of ${rm.horizon}</span>${
      rm.before || rm.after ? '' : `<em class="bx-num">${B.plural(left, 'day')} left</em>`
    }</span>`;
  };

  const rmNow = (focus) =>
    focus
      ? `<span class="bx-rmp__now"><b>${esc(PH_STATE[focus.state] || 'Now')}</b><span>${esc(focus.name)}</span><em>${esc(focus.milestoneLabel)} by <span class="bx-num">${esc(dates.fmtShort(focus.end))}</span></em></span>`
      : '<span></span>';

  /* The plan on the overview is the same plan you get when you open it: what is
     running now stands at the left in full, the phases run at the right as
     arrowheads in the roadmap's own colours - teal behind, violet running, that
     violet hatched ahead - and under them the dated line. */
  function planCard(rm) {
    const c = secCounts('roadmap');
    const focus = rm.current || rm.next || rm.phases[rm.phases.length - 1];
    return `
      <li class="bx-ov__sec is-plan">
        <button type="button" class="bx-ov__open bx-rmp" data-f-item="roadmap">
          <span class="bx-ov__ctop">
            <span class="bx-tile is-roadmap">${icon('gauge', 17)}</span>
            <span class="bx-ov__name">Roadmap</span>
            <span class="bx-ov__labels is-top">${B.rmSigned() ? '' : `<span class="bx-ov__lab is-wait">${icon('clock', 12)}<b>Confirm the plan</b></span>`}${c ? secLabels(c) : ''}</span>
            ${rmCount(c)}
          </span>
          <span class="bx-ov__goal">${esc(rm.marketing.goal)}</span>
          <span class="bx-rmp__split">
            <span class="bx-rmp__side">
              ${
                focus
                  ? `<b class="bx-rmp__sstate is-${focus.state}">${esc(PH_STATE[focus.state] || 'Now')}</b>
              <span class="bx-rmp__sname">${esc(focus.name)}</span>
              <span class="bx-rmp__smile">Target: ${esc(focus.milestoneLabel)} by <b class="bx-num">${esc(dates.fmtShort(focus.end))}</b></span>`
                  : ''
              }
              <span class="bx-rmp__sday">${rmClock(rm)}</span>
            </span>
            <span class="bx-rmp__plan is-rail">
              ${phArrows(rm)}
              ${phAxis(rm, { cls: 'is-rail' })}
            </span>
          </span>
        </button>
      </li>`;
  }

  function sectionCard(f) {
    const c = secCounts(f.id);
    const done = c ? c.confirmed + c.direct + c.inferred : 0;
    return `
      <li class="bx-ov__sec">
        <button type="button" class="bx-ov__open" data-f-item="${f.id}">
          <span class="bx-ov__ctop">
            <span class="bx-tile is-${esc(f.id)}">${icon(X.FIELD_ICON[f.id] || 'book', 17)}</span>
            <span class="bx-ov__name">${esc(f.title)}</span>
            ${c ? `<span class="bx-ov__count"><b class="bx-num">${done}</b><span class="bx-num">/${c.total}</span></span>` : ''}
          </span>
          <span class="bx-ov__cap">${esc(f.question)}</span>
          ${
            c
              ? `<span class="bx-ov__meter" aria-hidden="true">${[
                  'confirmed',
                  'direct',
                  'inferred',
                  'missing',
                ]
                  .map((k) => (c[k] ? `<i class="is-${k}" style="flex:${c[k]}"></i>` : ''))
                  .join('')}</span>
          <span class="bx-ov__labels">${secLabels(c)}</span>`
              : ''
          }
        </button>
      </li>`;
  }

  // a section the brand adds itself: it has no fields until Brain runs again
  function newSectionCard(sec) {
    return `
      <li class="bx-ov__sec is-new">
        <button type="button" class="bx-ov__open" data-f-item="${esc(sec.id)}">
          <span class="bx-ov__ctop">
            <span class="bx-tile is-new">${icon('plus', 17)}</span>
            <span class="bx-ov__name">${esc(sec.title)}</span>
            <span class="bx-ov__count"><b class="bx-num">0</b><span class="bx-num">/0</span></span>
          </span>
          <span class="bx-ov__cap">${esc(sec.question)}</span>
          <span class="bx-ov__labels"><span class="bx-ov__lab is-missing">just added</span></span>
        </button>
      </li>`;
  }

  /* what the tab is for, said once at the top - and the way into the three views
     that are not the report, standing at the right where they can be reached. */
  function heroHtml(all) {
    const st = B.reportStats;
    const S = B.D.summary;
    // the same order the tabs are in: what a brand reaches for most, first
    const ctas = [
      ['library', 'image', 'pink', 'The library', `${S.assets} images and video for creative`],
      [
        'knowledge',
        'database',
        'cyan',
        'The fact table',
        `all ${B.facts.length} facts and their sources`,
      ],
      [
        'map',
        'map',
        'indigo',
        'The index map',
        `a chart of all ${st.sources} sources, close ones together`,
      ],
    ];
    return `
      <section class="bx-card bx-ovh">
        <div class="bx-ovh__main">
          <div class="bx-ovh__text">
            <p class="bx-ovh__kicker">${icon('spark', 13)}Brain</p>
            <h3 class="bx-ovh__title">Everything Vicino has read about ${esc(B.D.brand.name)}, kept as facts you can check</h3>
            <p class="bx-ovh__lede">This report answers ${B.plural(all.total, 'standing question')} from them. Confirm what reads right, fill what is missing - and every campaign, post and brief downstream reads the version you left.</p>
          </div>
          <p class="bx-ovh__figs">
            <span><b class="bx-num">${all.confirmed + all.direct + all.inferred}</b> of <span class="bx-num">${all.total}</span> answered</span>
            <span><b class="bx-num">${all.missing}</b> missing</span>
            <span><b class="bx-num">${st.sources}</b> sources read</span>
            <span class="is-date">indexed <b class="bx-num">${esc(B.dates.fmtShort(S.lastIndexed))}</b></span>
          </p>
        </div>
        <div class="bx-ovh__ctas">
          ${ctas
            .map(
              ([tab, ic, hue, name, note]) =>
                `<button type="button" class="bx-ovh__cta" data-go-tab="${tab}"><span class="bx-tile is-${hue}">${icon(ic, 16)}</span><span class="bx-ovh__ctat"><b>${esc(name)}</b><small>${esc(note)}</small></span>${icon('arrow-right', 14)}</button>`
            )
            .join('')}
        </div>
      </section>`;
  }

  /* What still wants the brand, gathered from the fields themselves. Each one says
     what it is asking for in its own words - the fields by name, what reviewing
     them means, and how much rests on them - so the list can be read at a glance
     rather than counted. */
  const andMore = (names, n = 2) =>
    names.length <= n
      ? names.join(names.length === 2 ? ' and ' : ', ')
      : `${names.slice(0, n).join(', ')} and ${names.length - n} more`;
  function reviewItems() {
    const out = [];
    const names = (list) => andMore(list.map((x) => x.label));
    fields.forEach((f) => {
      if (!window.BXF || !BXF.has(f.id)) return;
      const g = BXF.groups(f.id);
      if (g.you.length)
        out.push({
          status: 'For you',
          tip: 'For you · only the brand can answer this one - Brain will not guess it',
          tone: 'you',
          n: g.you.length,
          where: f.title,
          title: names(g.you),
          what: `Brain cannot read ${g.you.length > 1 ? 'these' : 'this'} off the site. Set ${g.you.length > 1 ? 'them' : 'it'} in the brand's own words, or record that there is none.`,
          act: g.you.length > 1 ? 'Set them' : 'Set it',
          id: f.id,
          key: g.you[0].key,
        });
      if (g.gap.length)
        out.push({
          status: 'No source',
          tip: 'No source · nothing Brain has read answers it - add a page, or write it yourself',
          tone: 'gap',
          n: g.gap.length,
          where: f.title,
          title: names(g.gap),
          what: `No page Brain has read answers ${g.gap.length > 1 ? 'these' : 'this'}. Write ${g.gap.length > 1 ? 'them' : 'it'} yourself, or point Brain at a source that does.`,
          act: g.gap.length > 1 ? 'Write them' : 'Write it',
          id: f.id,
          key: g.gap[0].key,
        });
    });
    const V = window.BRAIN_VISUAL || { held: [], rules: [] };
    const held = V.held.filter((h) => !ui.rp.va.mine[h.id]);
    if (held.length)
      out.push({
        status: 'Not yours yet',
        tip: 'Not yours yet · the alt text or the path names someone else',
        tone: 'held',
        n: held.length,
        where: 'Visual identity',
        unit: 'image',
        title: andMore(held.map((h) => h.name)),
        what: `The alt text or the path names someone else, so ${held.length > 1 ? 'they are' : 'it is'} held out of creative until you say ${held.length > 1 ? 'they are' : 'it is'} the brand's.`,
        act: 'Review images',
        id: 'visual_identity',
        at: '.bx-va__item.is-held',
      });
    const prop = V.rules.filter((r) => (ui.rp.va.rules[r.id] || r.state) === 'proposed');
    if (prop.length)
      out.push({
        status: 'Unconfirmed',
        tip: 'Unconfirmed · read off the site and waiting for you to say it is right',
        tone: 'draft',
        n: prop.length,
        where: 'Visual identity',
        unit: 'design rule',
        title: andMore(prop.map((r) => r.text.replace(/\.$/, ''))),
        what: 'Each one quotes the page it was read from. Only a rule you confirm ever reaches a brief.',
        act: 'Review rules',
        id: 'visual_identity',
        at: '.bx-va__rule.is-proposed',
      });
    /* the plan running out leads the list: everything else waits as long as it has
       to, this one has a date on it */
    const d = B.rmDue(B.state.today);
    if (d)
      out.unshift({
        status: d.next ? 'Not approved' : 'Not drafted',
        tip: d.next
          ? 'Not approved \u00b7 the next ninety days are drafted but nobody has signed the strategy off'
          : 'Not drafted \u00b7 nothing is written for the ninety days after this plan',
        tone: 'due',
        meta: `ends ${dates.fmtShort(d.end)}`,
        count: d.days,
        where: 'Roadmap',
        title: d.next
          ? `${d.next.label}, the plan after this one`
          : 'The ninety days after this plan',
        what: d.next
          ? `${d.next.label} is drafted, but nobody has approved its strategy - so when ${d.label} ends there is no plan to run from.`
          : `${d.label} ends on ${dates.fmtShort(d.end)} and nothing is drafted for after it. Brain writes the next plan from what this one ends on.`,
        act: d.next ? 'Read the draft' : 'Open the plan',
        id: 'roadmap',
        cycle: d.next ? d.next.key : null,
      });
    return out;
  }

  /* One card a thing waiting: the state it is in as a small label, where it lives
     at the right, then the fields themselves, what reviewing them means, and the
     one move. Nothing here is graded - the move says what to do. */
  /* The one card in this column with a date on it. Standing a block of figures
     beside the words crowded them - the column is narrow, and anything in a second
     column takes the sentence's room - so the days run across the top instead,
     carrying the date with them. Everything under that bar shares one left edge,
     and the move keeps the column's own right edge like every other move in it. */
  const dueStripe = (i) =>
    `<span class="bx-ovr__strip">${icon('clock', 13)}<b class="bx-num">${i.count}</b><span>${i.count === 1 ? 'day' : 'days'} left</span><span class="bx-sep">\u00b7</span><span>${esc(i.meta || '')}</span></span>`;

  const reviewCard = (i) => {
    const due = i.count != null;
    return `
      <li class="bx-ovr__row is-${i.tone}">
        ${due ? dueStripe(i) : ''}
        <p class="bx-ovr__kind"><b class="bx-ovr__title">${esc(i.title)}</b></p>
        <p class="bx-ovr__where">${esc(i.where)}${due ? '' : `<span class="bx-sep">\u00b7</span>${esc(B.plural(i.n, i.unit || 'field'))}`}</p>
        <p class="bx-ovr__what">${esc(i.what)}</p>
        <div class="bx-ovr__foot">
          <span class="bx-ovr__state is-${i.tone}" data-tip="${esc(i.tip || i.status)}">${esc(i.status)}</span>
          <button type="button" class="bx-ovr__act" data-f-item="${esc(i.id)}" ${i.key ? `data-f-focus="${esc(i.key)}"` : ''} ${i.at ? `data-f-at="${esc(i.at)}"` : ''} ${i.cycle ? `data-f-cycle="${esc(i.cycle)}"` : ''}>${esc(i.act)}${icon('arrow-right', 12)}</button>
        </div>
      </li>`;
  };

  /* ------------------------------------------------ before Brain has written

     Onboarding is done. Brain has read the sources but has not written its report,
     so the profile onboarding produced is the page - the first take everything
     downstream reads from until Brain takes over. The plan is on its first day, the
     sections say what is coming rather than pretending to hold it, and nothing is
     waiting on the brand yet, so there is no Needs your review. */
  /* What stands beside the plan is one card, not a run of them. It does not move
     except for the bar in it: the point it has to make is how many sections are
     still being written, and a card that slides past says that less well than a
     number does. Three readings of the same card, switched in the panel. */
  /* What stands beside the plan is one card, and it does not move: the line that
     says what is happening, the count under it on a rule that doubles as the
     quietest meter there is, and the sections rolling past down the right. Nothing
     in it is drawn per section, so it reads the same at eight sections or eighty. */
  const writingPanel = (secs) => {
    const left = secs.length;
    const total = left + 1;
    const names = esc(`Brain is writing ${secs.map((f) => f.title).join(', ')}`);
    return `<div class="bx-ovft__panel is-aurora">
      <p class="bx-ovft__pkick">${icon('refresh', 12, 'bx-ovft__spin')}Brain is writing</p>
      <span class="bx-ovft__atext">
        <span class="bx-ovft__alead">
          <span>Brain is writing<br />your report<span class="bx-ovft__ell" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></span>
        </span>
        <small class="bx-ovft__afoot" style="--done-w:${((1 / total) * 104).toFixed(1)}px"><b class="bx-num">1</b> of <b class="bx-num">${total}</b> written<span class="bx-sep">\u00b7</span><b class="bx-num">${left}</b> still to come</small>
      </span>
      <span class="bx-ovft__aroll" role="img" aria-label="${names}">
        ${secs
          .map(
            (f, i) =>
              /* five slots of lead, so every slot is filled the moment the card is
                 drawn rather than filling up over twenty seconds */
              `<i style="animation-delay:${((i - 5) * 3.4).toFixed(1)}s" aria-hidden="true"><span class="bx-tile is-${esc(f.id)}">${icon(X.FIELD_ICON[f.id] || 'book', 15)}</span><b>${esc(f.title)}</b></i>`
          )
          .join('')}
      </span>
    </div>`;
  };

  function firstTakeHtml(rm) {
    const P = BXP.P;
    const st = B.reportStats;
    const S = B.D.summary;
    const PP = window.BRAIN_PROFILE_PAGE;
    const secs = fields.filter((f) => !(ui.rp.gone || []).includes(f.id));
    return `
      <div class="bx-ovw is-first" data-rf-overview data-rf-first>
        <section class="bx-card bx-ovh is-first">
          <div class="bx-ovh__main">
            <div class="bx-ovh__text">
              <p class="bx-ovh__kicker">${icon('spark', 13)}Brain<span class="bx-ovft__pill">${icon('refresh', 11)}Reading</span></p>
              <h3 class="bx-ovh__title">Brain has read everything ${esc(B.D.brand.name)} gave it, and is writing its report</h3>
              <p class="bx-ovh__lede">Until it is written, the profile below is the report - the first take every brief, campaign and post reads from. Brain will take it over section by section, and keep what you have changed.</p>
            </div>
            <p class="bx-ovh__figs">
              <span><b class="bx-num">${st.sources}</b> sources read</span>
              <span><b class="bx-num">${B.facts.length}</b> facts</span>
              <span><b class="bx-num">${secs.length}</b> sections to write</span>
              <span class="is-date">read <b class="bx-num">${esc(B.dates.fmtShort(S.lastIndexed))}</b></span>
            </p>
          </div>
          <div class="bx-ovh__ctas">
            <button type="button" class="bx-ovh__cta" data-go-tab="library"><span class="bx-tile is-pink">${icon('image', 16)}</span><span class="bx-ovh__ctat"><b>The library</b><small>${S.assets} images and video for creative</small></span>${icon('arrow-right', 14)}</button>
            <button type="button" class="bx-ovh__cta" data-go-tab="knowledge"><span class="bx-tile is-cyan">${icon('database', 16)}</span><span class="bx-ovh__ctat"><b>The fact table</b><small>all ${B.facts.length} facts and their sources</small></span>${icon('arrow-right', 14)}</button>
            <button type="button" class="bx-ovh__cta" data-go-tab="map"><span class="bx-tile is-indigo">${icon('map', 16)}</span><span class="bx-ovh__ctat"><b>The index map</b><small>a chart of all ${st.sources} sources, close ones together</small></span>${icon('arrow-right', 14)}</button>
          </div>
        </section>

        <section class="bx-ovft__block">
          <div class="bx-ov__bh">
            <h4>Sections</h4><span>the plan is written<span class="bx-sep">\u00b7</span>${icon('refresh', 12, 'bx-ovft__spin is-inline')}Brain is still writing the other <b class="bx-num">${secs.length}</b></span>
          </div>
          <div class="bx-ovft__row">
            <ul class="bx-ov__grid is-planrow">${planCard(rm)}</ul>
            ${writingPanel(secs)}
          </div>
        </section>

        <section class="bx-ovft__block">
          <div class="bx-ov__bh">
            <h4>Brand profile</h4><span>the first take, written in onboarding from what ${esc(B.D.brand.name)} gave us<span class="bx-sep">\u00b7</span><b class="bx-num">${(PP ? PP.toc : P.sections).length}</b> sections</span>
          </div>
          <div class="bx-ovft__doclayout">
            <div class="bx-ovft__doc is-profile">${profileDoc()}</div>
            <aside class="bx-ovft__tocrail" aria-label="On this page">
              <nav class="bx-ovft__toc">
                <p class="bx-ovft__toch">On this page</p>
                ${(PP ? PP.toc : [])
                  .map(
                    (t, i) =>
                      `<a href="#${esc(t.id)}" class="bx-ovft__toci ${i === 0 ? 'is-active' : ''}" data-bp-jump="${esc(t.id)}"><b class="bx-num">${esc(t.n)}</b><span>${esc(t.title)}</span></a>`
                  )
                  .join('')}
              </nav>
            </aside>
          </div>
        </section>

        ${readsHtml()}
      </div>`;
  }

  function overviewHtml(rm) {
    if (B.firstTake()) return firstTakeHtml(rm);
    const P = BXP.P;
    const SEC_IDS = ['roadmap', ...fields.map((f) => f.id)];
    const all = SEC_IDS.reduce(
      (n, id) => {
        const c = secCounts(id);
        if (!c) return n;
        ['total', 'confirmed', 'direct', 'inferred', 'missing'].forEach((k) => (n[k] += c[k]));
        return n;
      },
      { total: 0, confirmed: 0, direct: 0, inferred: 0, missing: 0 }
    );
    const items = reviewItems();
    const PP = window.BRAIN_PROFILE_PAGE;
    const shots = (P.visual.imagery || []).slice(0, 4);
    return `
      <div class="bx-ovw" data-rf-overview>
        ${heroHtml(all)}

        <div class="bx-ov__cols">
          <section class="bx-ov__col">
            <div class="bx-ov__bh">
              <h4>Sections</h4><span>each one is its own set of Brain fields</span>
              <button type="button" class="bx-ov__addsec is-find ${ui.rp.ovFind == null ? '' : 'is-on'}" data-ov-find aria-label="Find a section" aria-pressed="${ui.rp.ovFind != null}" data-tip="Find a section · by name, or by what it answers">${icon('search', 14)}</button>
              <button type="button" class="bx-ov__addsec" data-ov-add aria-label="Add a section" data-tip="Add a section · name it, and Brain answers it on its next run">${icon('plus', 14)}</button>
            </div>
            ${ui.rp.ovAdd ? newSectionFormHtml() : ''}
            ${sectionsHtml(rm)}
          </section>

          <section class="bx-ov__col is-side">
            <div class="bx-ov__bh">
              <h4>Needs your review</h4><span class="bx-num">${items.length}</span>
            </div>
            <div class="bx-ovr__wrap ${items.length > 4 ? 'is-capped' : ''}">
              <div class="bx-card bx-ovr">
                <ul class="bx-ovr__list">
                  ${
                    items.length
                      ? items.map(reviewCard).join('')
                      : `<li class="bx-ov__empty">${icon('check', 18)}<p>Nothing is waiting on you.</p></li>`
                  }
                </ul>
              </div>
            </div>
          </section>
        </div>

        <span class="bx-ovw__rule" aria-hidden="true"></span>
        <button type="button" class="bx-card bx-ovp is-legacy" data-f-item="bp" data-bp-entry>
          <span class="bx-ovp__logo"><img src="${esc(P.visual.logo.src)}" alt="" loading="lazy"></span>
          <span class="bx-ovp__kicker">First take<span class="bx-ovp__tag">Legacy</span></span>
          <span class="bx-ovp__title">The profile onboarding wrote, before Brain</span>
          <span class="bx-ovp__sub">Brain has taken its answers over - this is kept to read, not to work from<span class="bx-sep">·</span><b class="bx-num">${(PP ? PP.toc : P.sections).length}</b> sections</span>
          <span class="bx-ovp__go">Open${icon('arrow-right', 13)}</span>
          <span class="bx-ovp__shots" aria-hidden="true">${shots
            .map((im) => `<i><img src="${esc(im.src)}" alt="" loading="lazy"></i>`)
            .join('')}</span>
        </button>

        ${readsHtml()}
      </div>`;
  }

  /* What reads this version, as a footer: not a way in, not a headline - a note at
     the foot of the page saying what has been built on it in the last week, with a
     meter that keeps moving to say the work is still running. The window shifts
     with the date, so it is dated as well as named. */
  const READERS = [
    ['Signal', 'gauge', 'indigo', 14, 'reports'],
    ['Strategy', 'route', 'cyan', 1, 'plan'],
    ['Campaigns', 'calendar', 'pink', 2, 'active'],
    ['Creative', 'image', 'draft', 31, 'assets'],
  ];

  function readsHtml() {
    if (!B.showReads()) return '';
    const today = B.state.today;
    const from = dates.addDays(today, -6);
    return `
      <section class="bx-rdw" aria-label="What reads this version">
        <div class="bx-ov__bh">
          <h4>Reading this version</h4>
          <span>what the rest of Pulse has built on these answers, and how much of it</span>
        </div>
        <div class="bx-rds">
        <ul class="bx-rds__list">
          ${READERS.map(
            ([name, ic, hue, n, unit]) => `
            <li>
              <span class="bx-rds__name">${icon(ic, 13)}${esc(name)}</span>
              <span class="bx-rds__meter is-${hue}" aria-hidden="true"><i></i></span>
              <span class="bx-rds__n"><b class="bx-num">${n}</b>${esc(unit)}</span>
            </li>`
          ).join('')}
        </ul>
        <p class="bx-rds__note">${icon('info', 12)}<span>Every run records the version it read, so a change here can name what it affects.</span>
          <em class="bx-rdw__when">Last 7 days<span class="bx-num">${esc(dates.fmtShort(from))} \u2013 ${esc(dates.fmtShort(today))}</span></em>
        </p>
        </div>
      </section>`;
  }

  /* Sections keep coming: past eight they turn like slides, so the block stays the
     same height however many a brand ends up with. The plan is not one of them - it
     stands still above the pages, because it is the one with a clock running on it. */
  const SEC_PER_PAGE = 8;

  // every section the report lists, the plan aside, in the order they are read
  function secList() {
    const out = (id) => (ui.rp.gone || []).includes(id);
    return [
      ...fields
        .filter((f) => !out(f.id))
        .map((f) => ({ title: f.title, q: f.question, html: () => sectionCard(f) })),
      ...(ui.rp.newSecs || [])
        .filter((s) => !out(s.id))
        .map((s) => ({ title: s.title, q: s.question, html: () => newSectionCard(s) })),
    ];
  }

  const secQ = () => (typeof ui.rp.ovFind === 'string' ? ui.rp.ovFind.trim().toLowerCase() : '');
  // the plan is a section too, so a name being looked for is held against it as well
  const planEntry = () =>
    B.roadmapView() ? [{ title: 'Roadmap', q: B.roadmapAt(B.state.today).marketing.goal }] : [];
  const planGone = () => !!secQ() && !secHits(planEntry()).length;
  const secHits = (all) => {
    const q = secQ();
    return q ? all.filter((x) => `${x.title} ${x.q || ''}`.toLowerCase().includes(q)) : all;
  };

  /* Finding one by name. With a dozen sections eight to a page, the one you want is
     usually on the page you are not on, so typing takes the pages away and puts
     every match on screen at once; emptying the field puts the pages back. */
  function findHtml() {
    const all = secList().concat(planEntry());
    const n = secHits(all).length;
    return `
      <div class="bx-ov__find" data-ov-findbar>
        <span class="bx-ov__findi" aria-hidden="true">${icon('search', 14)}</span>
        <input type="text" class="bx-ov__findin" data-ov-findq value="${esc(typeof ui.rp.ovFind === 'string' ? ui.rp.ovFind : '')}" placeholder="Find a section by name, or by what it answers" aria-label="Find a section by name, or by what it answers" autocomplete="off" spellcheck="false">
        <span class="bx-ov__findn" data-ov-findn>${findCount(n, all.length)}</span>
        <button type="button" class="bx-ov__findx" data-ov-findoff aria-label="Close find" data-tip="Close \u00b7 Esc">${icon('x', 14)}</button>
      </div>`;
  }

  const findCount = (n, all) =>
    secQ()
      ? `<b class="bx-num">${n}</b> of <b class="bx-num">${all}</b>`
      : `<b class="bx-num">${all}</b> sections`;

  // the sections themselves: the matches while a name is being typed, the pages otherwise
  function secListHtml() {
    const all = secList();
    const hits = secHits(all);
    if (secQ())
      return hits.length
        ? `<ul class="bx-ov__grid">${hits.map((x) => x.html()).join('')}</ul>`
        : `<p class="bx-ov__findempty">${icon('search-x', 16)}<span>No section is called that yet.</span><button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-ov-add>${icon('plus', 12)}Add one</button></p>`;
    const cards = hits.map((x) => x.html());
    if (cards.length <= SEC_PER_PAGE) return `<ul class="bx-ov__grid">${cards.join('')}</ul>`;
    const pages = [];
    for (let i = 0; i < cards.length; i += SEC_PER_PAGE)
      pages.push(cards.slice(i, i + SEC_PER_PAGE));
    const at = Math.min(ui.rp.secPage || 0, pages.length - 1);
    const from = at * SEC_PER_PAGE;
    return `
      <div class="bx-bfp__track bx-ov__track" data-sec-track tabindex="0" aria-label="The sections, ${SEC_PER_PAGE} at a time">
        ${pages
          .map(
            (pg, i) =>
              `<section class="bx-bfp__slide" data-sec-slide="${i}" aria-hidden="${i === at ? 'false' : 'true'}"><ul class="bx-ov__grid">${pg.join('')}</ul></section>`
          )
          .join('')}
      </div>
      <div class="bx-bfp__bar">
        <button type="button" class="bx-bfp__arrow" data-sec-page="${at - 1}" aria-label="The sections before these" ${at === 0 ? 'disabled' : ''}>${icon('chevron-left', 15)}</button>
        <p class="bx-bfp__count"><b class="bx-num">${from + 1}\u2013${from + pages[at].length}</b> of <b class="bx-num">${cards.length}</b> sections</p>
        <span class="bx-bfp__dots">${pages
          .map(
            (pg, i) =>
              `<button type="button" class="bx-bfp__dot ${i === at ? 'is-on' : ''}" data-sec-page="${i}" aria-label="Page ${i + 1} of ${pages.length}" aria-current="${i === at}"></button>`
          )
          .join('')}</span>
        <button type="button" class="bx-bfp__arrow" data-sec-page="${at + 1}" aria-label="The sections after these" ${at === pages.length - 1 ? 'disabled' : ''}>${icon('chevron-right', 15)}</button>
      </div>`;
  }

  function sectionsHtml(rm) {
    const plan = B.roadmapView()
      ? `<ul class="bx-ov__grid is-planrow" data-sec-planrow ${planGone() ? 'hidden' : ''}>${planCard(rm)}</ul>`
      : '';
    return `${ui.rp.ovFind == null ? '' : findHtml()}${plan}<div class="bx-ov__list" data-sec-list>${secListHtml()}</div>`;
  }

  // what kind of thing is waiting, as one icon
  const REV_ICON = {
    you: 'user',
    gap: 'gap',
    draft: 'sparkles',
  };

  // naming a section of your own - it is empty until Brain runs again
  const newSectionFormHtml = () => `
    <div class="bx-ov__newsec" data-ov-form>
      <p class="bx-ov__newh">${icon('plus', 13)}A section of your own<span>Brain answers it on its next run, or you write its fields yourself</span></p>
      <div class="bx-ov__newrow">
        <label class="bx-bf__newl">Name<input type="text" class="bx-bf__newi" data-ov-name placeholder="Partnerships"></label>
        <label class="bx-bf__newl is-wide">What should this section answer?<input type="text" class="bx-bf__newi" data-ov-q placeholder="Who does the brand work with, and on what terms?"></label>
      </div>
      <div class="bx-bf__newacts">
        <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-ov-save>Add section</button>
        <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-ov-cancel>Cancel</button>
      </div>
    </div>`;

  function detailHtml(rm, ctx) {
    if (ui.rp.fSel === 'overview') return overviewHtml(rm);
    if (ui.rp.fSel === 'bp') return profileDoc();
    const f = B.fieldById[ui.rp.fSel];
    if (f) return fieldDetail(f);
    const sec = (ui.rp.newSecs || []).find((x) => x.id === ui.rp.fSel);
    if (sec) return newSectionDetail(sec);
    return roadmapDetail(rm, ctx);
  }

  /* a section the brand added: the same page as any other, with nothing in it yet */
  function newSectionDetail(sec) {
    return `
      <div class="bx-rf__obj is-folds" data-field="${esc(sec.id)}">
        <header class="bx-card bx-rf__dhead">
          ${backHtml()}
          <span class="bx-tile is-new">${icon('plus', 19)}</span>
          <div class="bx-rf__trow"><h3 class="bx-rf__title">${esc(sec.title)}</h3><span class="bx-pill bx-pill--quiet">Yours</span></div>
          <p class="bx-rf__q">${esc(sec.question)}<span class="bx-rf__qn">Added by you<span class="bx-sep">·</span>Brain answers it on its next run</span></p>
          <div class="bx-rf__dactions">${delHtml(sec.id)}</div>
        </header>
        <div class="bx-rf__tabbody" role="region" data-f-body>${BXF.viewHtml(sec)}</div>
        <footer class="bx-rf__steps">
          <button type="button" class="bx-link bx-link--quiet" data-f-item="overview">${icon('chevron-left', 14)}The report</button>
          <span></span>
        </footer>
      </div>`;
  }

  B.register('report', 'f', {
    render(ctx) {
      const { state } = ctx;
      // no roadmap design (Current) leaves nothing to select under Plan
      const selOk =
        ui.rp.fSel === 'bp' || ui.rp.fSel === 'overview'
          ? true
          : ui.rp.fSel === 'roadmap'
            ? !!B.roadmapView()
            : !!B.fieldById[ui.rp.fSel];
      if (!selOk) ui.rp.fSel = 'overview';
      const rm = B.roadmapAt(state.today);
      return `
        <div class="bx-view bx-rf ${ui.rp.fSel === 'overview' ? 'is-overview' : ''}">
          <nav class="bx-card bx-rft" aria-label="Report objects" data-rf-nav ${ui.rp.fSel === 'overview' ? 'hidden' : ''}>${navHtml(rm)}</nav>
          <section class="${ui.rp.fSel === 'bp' ? 'bx-card' : ''} bx-rf__detail ${ui.rp.fSel === 'bp' ? 'is-profile' : ''} ${ui.rp.fSel === 'roadmap' ? 'is-roadmap' : ''} ${ui.rp.fSel === 'overview' ? 'is-overview' : ''}" data-rf-detail aria-live="polite">${detailHtml(rm, ctx)}</section>
        </div>`;
    },
    mount(slot, ctx) {
      requestAnimationFrame(() => {
        const t = slot.querySelector('[data-sec-track]');
        if (t) {
          const at = Math.min(ui.rp.secPage || 0, t.children.length - 1);
          const sl = t.children[at];
          if (sl) t.style.height = `${Math.ceil(sl.scrollHeight)}px`;
        }
      });

      const { state } = ctx;
      const detail = () => slot.querySelector('[data-rf-detail]');
      /* a page with eight on it is taller than a page with two, so the track is only
         ever as tall as the page being read */
      const fitSecTrack = (scope) => {
        const track = (scope || detail()).querySelector('[data-sec-track]');
        if (!track) return;
        const at = Math.min(ui.rp.secPage || 0, track.children.length - 1);
        const slide = track.children[at];
        if (slide) track.style.height = `${Math.ceil(slide.scrollHeight)}px`;
      };
      /* The track is a few pixels wider than a slide, so scrolling by its own width
         left a sliver of the page before showing down the left edge - the long line.
         The slide says where it starts; nothing else does. */
      const goSecPage = (scope, at) => {
        const track = (scope || detail()).querySelector('[data-sec-track]');
        const slide = track && track.children[at];
        if (slide) track.scrollLeft = slide.offsetLeft - track.children[0].offsetLeft;
      };
      /* The bar answers the field at its head: the chips that do not carry the name
         are taken out of the row, so what is left reads as the whole bar. Drawing the
         bar again would take the field's focus with it, so nothing is re-rendered. */
      const filterNav = () => {
        const bar = slot.querySelector('[data-rf-nav]');
        if (!bar) return;
        const q = (ui.rp.navFind || '').trim().toLowerCase();
        bar.querySelectorAll('.bx-rft__item:not(.is-back), .bx-rft__bp').forEach((c) => {
          const name = `${c.textContent} ${c.getAttribute('aria-label') || ''}`.toLowerCase();
          c.hidden = !!q && !name.includes(q);
        });
        bar.querySelectorAll('.bx-rft__sep').forEach((sep, i) => {
          sep.hidden = !!q && i > 0;
        });
        const none = bar.querySelector('[data-rf-findnone]');
        const left = [...bar.querySelectorAll('.bx-rft__item:not(.is-back), .bx-rft__bp')].filter(
          (c) => !c.hidden
        ).length;
        if (none) none.hidden = !q || left > 0;
      };
      /* the magnifier does not hand over to a field beside it - it stretches into
         one and back, so there is only ever the one of them. Nothing is redrawn, or
         the shape would jump instead of growing. */
      const showNavFind = (on) => {
        ui.rp.navFind = on ? '' : null;
        const box = slot.querySelector('[data-rf-findbar]');
        if (!box) return;
        box.classList.toggle('is-open', on);
        const inp = box.querySelector('[data-rf-findq]');
        const x = box.querySelector('[data-rf-findx], [data-rf-findoff]');
        if (inp) {
          inp.value = '';
          inp.tabIndex = on ? 0 : -1;
          if (on) inp.focus();
        }
        if (x) x.tabIndex = on ? 0 : -1;
        filterNav();
        if (!on) {
          const btn = box.querySelector('[data-rf-find]');
          if (btn) btn.focus();
        }
      };

      /* the head's Confirm section follows what is left to check, and is redrawn
         whole - so the way out of the section comes back with it */
      const syncHead = () => {
        const f = B.fieldById[ui.rp.fSel];
        const acts = f && detail().querySelector('.bx-rf__dactions');
        if (!acts || !window.BXF || !BXF.has(f.id)) return;
        const c = BXF.counts(f.id);
        acts.innerHTML = `${delHtml(f.id)}${X.regenButton(f, { secondary: true, iconOnly: true })}${c.check ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bf-act="confirm-all" data-bf-fid="${f.id}">${icon('check', 13)}Confirm section</button>` : ''}`;
      };
      document.addEventListener('brain:fields', () => {
        if (B.state.tab === 'report' && slot.isConnected) syncHead();
      });
      /* Take the page to one row and mark it for a beat. The section has just been
         painted, so the row is measured on the next frame; the mark comes off by
         itself, and the class is taken off first so a second visit replays it. */
      const focusInSection = (key, sel) => {
        requestAnimationFrame(() => {
          const row = key
            ? detail().querySelector(`[data-bf-row="${CSS.escape(key)}"]`)
            : detail().querySelector(sel);
          if (!row) return;
          /* a long section turns its fields like slides, and the row may well be on a
             page that is not the one showing - so the pager goes there first, or the
             mark would be put on something off to the side. The track's own scroll
             tells the pager to follow. */
          const slide = row.closest('[data-bf-slide]');
          const track = slide && slide.closest('[data-bf-track]');
          if (track && track.children[0]) {
            track.scrollLeft = slide.offsetLeft - track.children[0].offsetLeft;
          }
          const main = document.getElementById('brain-main');
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (main) {
            const to =
              main.scrollTop +
              row.getBoundingClientRect().top -
              main.getBoundingClientRect().top -
              120;
            main.scrollTo({ top: Math.max(0, to), behavior: reduce ? 'auto' : 'smooth' });
          }
          row.classList.remove('is-found');
          void row.offsetWidth;
          row.classList.add('is-found');
          setTimeout(() => row.classList.remove('is-found'), 2200);
        });
      };
      const paint = () => {
        detail().innerHTML = detailHtml(B.roadmapAt(state.today), ctx);
        X.fitMore(detail());
        X.mountRoadmap(detail(), ctx);
        fitSecTrack();
      };

      /* A year arrives from the side it came from - forward from the right, back
         from the left - so turning the page reads as turning rather than as the
         calendar being replaced. One helper for both the arrows and the swipe,
         so they cannot drift apart. */
      const turnYear = (to) => {
        const from = calYearOf(B.rmCycles());
        if (to === from) return;
        ui.rp.rmYear = to;
        paint();
        B.motion.slideIn(detail().querySelector('.bx-rmcal__page'), {
          x: to > from ? 26 : -26,
          duration: 0.3,
        });
      };

      const select = (id, opts = {}) => {
        const was = ui.rp.fSel;
        // the plan's other cycles are read where the plan is read, and nowhere else
        if (id !== 'roadmap') {
          ui.rp.rmCycle = 'now';
          ui.rp.rmPlansOpen = false;
        }
        if (window.BXF && ui.rp.bfOpen) BXF.closeDrawer();
        if (id === 'bp' && was !== 'bp') ui.rp.fBack = was;
        ui.rp.fSel = id;
        // the profile swaps the browser's list for its own sections, and back
        if ((id === 'bp') !== (was === 'bp')) {
          slot.querySelector('[data-rf-nav]').innerHTML = navHtml(B.roadmapAt(state.today));
          B.motion.fadeIn(slot.querySelector('[data-rf-nav]'), { duration: 0.18 });
        }
        filterNav();
        detail().classList.toggle('is-profile', id === 'bp');
        detail().classList.toggle('is-roadmap', id === 'roadmap');
        detail().classList.toggle('is-overview', id === 'overview');
        // every page but the profile is a set of cards, not one card
        detail().classList.toggle('bx-card', id === 'bp');
        const grid = slot.querySelector('.bx-rf');
        const bar = slot.querySelector('[data-rf-nav]');
        if (grid) grid.classList.toggle('is-overview', id === 'overview');
        if (bar) bar.hidden = id === 'overview';
        B.$$('.bx-rft__item[data-f-item]', slot).forEach((b) => {
          if (b.hasAttribute('data-bp-entry')) return;
          const on = b.dataset.fItem === id;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-current', on ? 'true' : 'false');
        });
        const chip = slot.querySelector(`.bx-rft__item[data-f-item="${id}"]`);
        /* the bar is its own sideways scroller: bringing a chip into it by
           scrollIntoView moved the page as well, which is half of why a section
           opened somewhere other than its top */
        const rail = chip && chip.closest('.bx-rft__scroll');
        if (rail) {
          const c = chip.getBoundingClientRect();
          const r = rail.getBoundingClientRect();
          if (c.left < r.left + 8) rail.scrollLeft += c.left - r.left - 40;
          else if (c.right > r.right - 8) rail.scrollLeft += c.right - r.right + 40;
        }
        paint();
        markBpEntries();
        if (id === 'bp') trackToc();
        if (opts.fade !== false) {
          const into = id === 'bp' && was !== 'bp';
          const back = was === 'bp' && id !== 'bp';
          if (into || back)
            B.motion.slideIn(detail().firstElementChild, {
              x: into ? 34 : -26,
              duration: 0.38,
            });
          else B.motion.fadeIn(detail().firstElementChild, { duration: 0.18 });
        }
        /* A section opens at its top - the bar over the page, then the head card
           under it - wherever the overview was left. Without this the page kept the
           scroll it had, so a section reached from far down the overview opened with
           its head already tucked under the sticky bar. A move from Needs your
           review overrides this a frame later, because that one is about a row. */
        const main = document.getElementById('brain-main');
        const rf = slot.querySelector('.bx-rf');
        if (main) {
          const to =
            id === 'overview' || !rf
              ? 0
              : main.scrollTop +
                rf.getBoundingClientRect().top -
                main.getBoundingClientRect().top -
                8;
          main.scrollTo({
            top: Math.max(0, to),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          });
        }
      };
      // a swipe through the sections moves the pager with it
      slot.addEventListener(
        'scroll',
        (e) => {
          const t = e.target;
          if (!t || !t.dataset || t.dataset.secTrack === undefined) return;
          const at = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
          if (at === ui.rp.secPage) return;
          ui.rp.secPage = at;
          const bar = t.nextElementSibling;
          if (!bar) return;
          const pages = t.querySelectorAll('[data-sec-slide]').length;
          bar.querySelectorAll('.bx-bfp__dot').forEach((d, i) => {
            d.classList.toggle('is-on', i === at);
            d.setAttribute('aria-current', String(i === at));
          });
          const arrows = bar.querySelectorAll('.bx-bfp__arrow');
          arrows[0].disabled = at === 0;
          arrows[0].dataset.secPage = String(at - 1);
          arrows[1].disabled = at === pages - 1;
          arrows[1].dataset.secPage = String(at + 1);
        },
        true
      );

      const rerender = (id) => {
        if (ui.rp.fSel === id) paint();
      };
      const markToc = (id) =>
        B.$$('[data-bp-jump]', slot).forEach((a) =>
          a.classList.toggle('is-active', a.dataset.bpJump === id)
        );
      // the section whose card has reached the top third of the scroller is the one
      // being read
      const main = document.getElementById('brain-main');
      const onScroll = () => {
        if (!slot.isConnected) {
          document.removeEventListener('brain:scroll', onScroll);
          return;
        }
        if (ui.rp.fSel !== 'bp' && !B.firstTake()) return;
        const secs = B.$$('.bp-prototype-report .rep-sec', slot);
        const line = main.getBoundingClientRect().top + main.clientHeight * 0.3;
        let cur = secs[0];
        secs.forEach((sec) => {
          if (sec.getBoundingClientRect().top <= line) cur = sec;
        });
        if (cur) markToc(cur.id);
      };
      function trackToc() {
        onScroll();
      }
      if (!main.dataset.bpTrack) {
        main.dataset.bpTrack = '1';
        main.addEventListener(
          'scroll',
          () => document.dispatchEvent(new CustomEvent('brain:scroll')),
          { passive: true }
        );
      }
      document.addEventListener('brain:scroll', onScroll);
      // the bar is a card at rest; it only lifts once the page moves under it
      const stick = () => {
        const bar = slot.querySelector('[data-rf-nav]');
        if (bar) bar.classList.toggle('is-stuck', main.scrollTop > 6);
      };
      document.addEventListener('brain:scroll', stick);
      stick();
      const setFold = (id, key, open) => {
        ui.rp.fFold[`${id}:${key}`] = open;
        const box = detail().querySelector(`[data-rf-fold="${id}:${key}"]`);
        if (box) X.setDisclose(box, open, { trigger: box.querySelector('[data-f-fold]') });
        if (box && open) {
          X.fitMore(box);
        }
      };
      X.fitMore(slot);
      X.mountRoadmap(slot, ctx);
      markBpEntries();
      X.bindCites(slot, (f, src, n) => {
        setFold(f.id, 'sources', true);
        setTimeout(() => X.revealExcerpt(detail(), f, src, n), 200);
      });
      X.bindProgress(slot);

      slot.addEventListener('click', (e) => {
        // Regenerate all asks first
        if (e.target.closest('[data-rf-regen]')) {
          ui.rp.allConfirm = true;
          const all = slot.querySelector('[data-rf-all]');
          if (all) all.innerHTML = X.regenAllControl({ iconOnly: true });
          return;
        }
        if (e.target.closest('a[href]') || X.inRoadmap(e)) return;
        // the ways out of the report: the other three views of the same index
        const go = e.target.closest('[data-go-tab]');
        if (go) {
          B.go(go.dataset.goTab);
          return;
        }
        /* the run of plans: the one behind, the one running, the one drafted ahead.
           Reading one of the others puts the section in read-only - and the plan
           it draws is the one picked, because everything goes through roadmapAt */
        const cyc = e.target.closest('[data-rm-cycle]');
        if (cyc) {
          ui.rp.rmCycle = cyc.dataset.rmCycle;
          ui.rp.rmPick = undefined;
          ui.rp.hzOpen = false;
          ui.rp.rmPlansOpen = false;
          ui.rp.rmFind = null;
          ui.rp.rmJump = null;
          ui.rp.rmJumpMon = null;
          ui.rp.rmJumpOpen = false;
          paint();
          /* the panel carries a row for the summary over a plan that is not the
             running one, so it is redrawn when that changes */
          if (state.switcherOpen) B.renderSwitcher();
          return;
        }
        /* the same run, read two ways: as a list of plans, or laid on the years
           it ran through. The find box and the pick are shared - only the drawing
           changes - so switching keeps whatever is typed. */
        /* the ribbon is turned a year at a time, and a year of the spine folds
           and unfolds. Both only redraw the menu, so the find box keeps what is
           typed in it. */
        /* picking a date rather than typing one: the year opens a picker, a
           month in it turns to that year and leaves the plan that was running
           then as the only one lit */
        if (e.target.closest('[data-rm-jump]')) {
          ui.rp.rmJumpOpen = !ui.rp.rmJumpOpen;
          paint();
          return;
        }
        // the year chips and the month arrows only move the picker, not the page
        const jm2 = e.target.closest('[data-rm-jump-mon]');
        if (jm2) {
          ui.rp.rmJumpMon = jm2.dataset.rmJumpMon;
          paint();
          return;
        }
        const jm = e.target.closest('[data-rm-jump-to]');
        if (jm) {
          const to = jm.dataset.rmJumpTo;
          ui.rp.rmJump = to;
          ui.rp.rmJumpMon = to.slice(0, 7);
          ui.rp.rmJumpOpen = false;
          const want = Number(to.slice(0, 4));
          if (want === calYearOf(B.rmCycles())) paint();
          else turnYear(want);
          return;
        }
        if (e.target.closest('[data-rm-jump-clear]')) {
          ui.rp.rmJump = null;
          paint();
          return;
        }
        if (e.target.closest('[data-rm-jump-day]')) return;
        if (ui.rp.rmJumpOpen && !e.target.closest('.bx-rmcal__pick')) {
          ui.rp.rmJumpOpen = false;
          paint();
        }
        const yr = e.target.closest('[data-rm-year]');
        if (yr && yr.dataset.rmYear) {
          turnYear(Number(yr.dataset.rmYear));
          return;
        }
        const vw = e.target.closest('[data-rm-view]');
        if (vw) {
          ui.rp.rmView = vw.dataset.rmView;
          paint();
          const box = detail().querySelector('[data-rm-findq]');
          if (box) {
            box.focus();
            box.setSelectionRange(box.value.length, box.value.length);
          }
          return;
        }
        if (e.target.closest('[data-rm-plans]')) {
          ui.rp.rmPlansOpen = !ui.rp.rmPlansOpen;
          ui.rp.rmFind = null;
          paint();
          return;
        }
        if (ui.rp.rmPlansOpen && !e.target.closest('.bx-rmpl')) {
          ui.rp.rmPlansOpen = false;
          ui.rp.rmFind = null;
          paint();
        }
        /* the plan drafted ahead. Approving its strategy is what writes it: the
           goal, the KPI and the phases stop being Brain's suggestions, and it
           becomes the plan the report runs on the morning this one ends. */
        if (e.target.closest('[data-rm-approve]')) {
          const key = B.rmCycle();
          const rm = B.roadmapAt(state.today);
          const now = B.rmCycles().find((x) => x.key === 'now');
          B.ask({
            icon: 'check',
            title: 'Approve this strategy?',
            panel: `<div class="bx-askplan">
              <span class="bx-askplan__goal"><small>The strategy</small><b>${esc(rm.strategy.answer)}</b></span>
              <span class="bx-askplan__row">
                <span><small>Takes over</small><b class="bx-num">${esc(dates.fmtShort(rm.start))}</b></span>
                <span><small>Runs</small><b class="bx-num">${rm.horizon} days</b></span>
                <span><small>Phases</small><b class="bx-num">${rm.phases.length}</b></span>
                <span><small>KPI</small><b class="bx-num">${(rm.kpis || []).length}</b></span>
              </span>
            </div>`,
            body: `Approving writes the plan: the marketing goal, the KPI tree and the phases stop being Brain's suggestions and become ${esc(rm.label)}'s own records, in your name and dated today. It takes over from ${esc((now && now.label) || 'the running plan')} on ${esc(dates.fmtLong(rm.start))}; nothing changes before then.`,
            go: 'Approve the strategy',
            onGo: () => {
              B.rmApprove(key, 'You');
              B.rmLogAdd({
                cycle: key,
                kind: 'approved',
                what: `Approved the strategy behind ${rm.label}. Brain's marketing goal, KPI tree and phases became its four records.`,
              });
              paint();
              B.toast('Strategy approved');
            },
          });
          return;
        }
        /* the plan's own confirmation. The approval that wrote it is the first
           signature; changing it afterwards takes that away, and this puts it
           back in your name. */
        if (e.target.closest('[data-rm-sign]')) {
          const rm = B.roadmapAt(state.today);
          const left = window.BXF ? BXF.counts('roadmap').check : 0;
          B.ask({
            icon: 'check',
            title: 'Confirm this plan?',
            panel: `<div class="bx-askplan">
              <span class="bx-askplan__goal"><small>The goal</small><b>${esc(rm.marketing.goal)}</b></span>
              <span class="bx-askplan__row">
                <span><small>Runs</small><b class="bx-num">${rm.horizon} days</b></span>
                <span><small>From</small><b class="bx-num">${esc(dates.fmtShort(rm.start))} \u2013 ${esc(dates.fmtShort(rm.end))}</b></span>
                <span><small>Phases</small><b class="bx-num">${rm.phases.length}</b></span>
                ${left ? `<span><small>Fields to check</small><b class="bx-num">${left}</b></span>` : ''}
              </span>
            </div>`,
            body: `Confirming says it reads right as it stands. It is recorded in your name, dated today, and the rest of Pulse builds on it.${left ? ` The ${B.plural(left, 'field')} still waiting to be checked ${left === 1 ? 'is' : 'are'} confirmed with it.` : ''} Change it later and it will ask again.`,
            go: 'Confirm the plan',
            onGo: () => {
              const n = window.BXF ? BXF.confirmAll('roadmap') : 0;
              B.rmSignOff('You');
              B.rmLogAdd({
                kind: 'confirmed',
                what: n
                  ? `Confirmed the plan as it stands, and the ${B.plural(n, 'field')} that were waiting to be checked with it.`
                  : 'Confirmed the plan as it stands.',
              });
              paint();
              B.toast('Plan confirmed');
            },
          });
          return;
        }
        // how long the plan runs - typed or picked, and only applied once confirmed
        if (e.target.closest('[data-rm-hz-open]')) {
          ui.rp.hzOpen = !ui.rp.hzOpen;
          ui.rp.hzDraft = null;
          paint();
          const box = document.querySelector('[data-rm-hz-in]');
          if (box) box.select();
          return;
        }
        if (e.target.closest('[data-rm-hz-close]')) {
          ui.rp.hzOpen = false;
          ui.rp.hzDraft = null;
          paint();
          return;
        }
        const quick = e.target.closest('[data-rm-hz-quick]');
        if (quick) {
          ui.rp.hzDraft = Number(quick.dataset.rmHzQuick);
          paint();
          return;
        }
        if (e.target.closest('[data-rm-hz-save]')) {
          const box = document.querySelector('[data-rm-hz-in]');
          const n = Math.max(7, Math.min(365, Number(box ? box.value : ui.rp.hzDraft) || 90));
          const was = ui.rp.horizon || B.roadmapAt(state.today).horizon;
          ui.rp.horizon = n;
          ui.rp.hzOpen = false;
          ui.rp.hzDraft = null;
          // the plan is not the one that was confirmed any more
          if (n !== was) B.rmUnsign(`Changed how long the plan runs, from ${was} days to ${n}.`);
          paint();
          B.toast(`The plan now runs ${n} days - its phases stretch with it`);
          return;
        }
        if (ui.rp.hzOpen && !e.target.closest('.bx-rmh2')) {
          ui.rp.hzOpen = false;
          ui.rp.hzDraft = null;
          paint();
        }
        // taking a section out of the report, once it has been asked about
        const ask = e.target.closest('[data-sec-ask]');
        if (ask) {
          const id = ask.dataset.secAsk;
          const title = secTitle(id);
          const c = secCounts(id);
          B.ask({
            icon: 'trash',
            tone: 'danger',
            title: `Take ${title} out of the report?`,
            body: `Brain stops answering it, and the ${c ? B.plural(c.total, 'field') : 'fields'} under it go with it. Nothing already written elsewhere changes.`,
            go: 'Remove it',
            no: 'Keep it',
            onGo: () => {
              ui.rp.gone = (ui.rp.gone || []).concat(id);
              select('overview');
              // the bar lists the sections too, so it is redrawn with them
              const nav = slot.querySelector('[data-rf-nav]');
              if (nav) nav.innerHTML = navHtml(B.roadmapAt(state.today));
              B.toast(`${title} is out of the report - Brain stops answering it`);
            },
          });
          return;
        }
        // the sections, turned like slides
        const sp = e.target.closest('[data-sec-page]');
        if (sp) {
          ui.rp.secPage = Number(sp.dataset.secPage);
          paint();
          goSecPage(null, ui.rp.secPage);
          fitSecTrack();
          /* a new page is read from its top, wherever the page was left - measured on
             the next frame, once the track has taken the new page's height */
          requestAnimationFrame(() => {
            const head = detail().querySelector('.bx-ov__col .bx-ov__bh');
            const main = document.getElementById('brain-main');
            if (!head || !main) return;
            const to =
              main.scrollTop +
              head.getBoundingClientRect().top -
              main.getBoundingClientRect().top -
              16;
            main.scrollTo({
              top: Math.max(0, to),
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            });
          });
          return;
        }
        // finding a section by name - the field takes the pages away while it is used
        if (e.target.closest('[data-ov-find]') || e.target.closest('[data-ov-findoff]')) {
          const off = ui.rp.ovFind != null;
          ui.rp.ovFind = off ? null : '';
          ui.rp.secPage = 0;
          paint();
          const inp = detail().querySelector('[data-ov-findq]');
          if (inp) inp.focus();
          else {
            const btn = detail().querySelector('[data-ov-find]');
            if (btn) btn.focus();
          }
          return;
        }
        // a section of the brand's own
        if (e.target.closest('[data-ov-add]') || e.target.closest('[data-ov-cancel]')) {
          const add = !!e.target.closest('[data-ov-add]');
          // a name that found nothing is the name being added, so it carries over
          const named = add && secQ() ? ui.rp.ovFind.trim() : '';
          if (add) ui.rp.ovFind = null;
          ui.rp.ovAdd = add;
          paint();
          const inp = detail().querySelector('[data-ov-name]');
          if (inp) {
            if (named) inp.value = named;
            inp.focus();
          }
          return;
        }
        if (e.target.closest('[data-ov-save]')) {
          const form = detail().querySelector('[data-ov-form]');
          const title = form.querySelector('[data-ov-name]').value.trim();
          if (!title) {
            form.querySelector('[data-ov-name]').focus();
            return;
          }
          const q = form.querySelector('[data-ov-q]').value.trim();
          const id = `new-${(ui.rp.newSecs || []).length + 1}`;
          const sec = {
            id,
            title,
            question: q || `What should Brain know about ${title.toLowerCase()}?`,
          };
          ui.rp.newSecs = (ui.rp.newSecs || []).concat(sec);
          if (window.BXF) BXF.addSection(id, title, sec.question);
          ui.rp.ovAdd = false;
          paint();
          B.toast(`${title} added - open it to write its first field`);
          return;
        }
        // a Brain field's own buttons - confirm, edit, set, generate...
        if (window.BXF && BXF.handle(e)) {
          syncHead();
          return;
        }
        if (e.target.closest('[data-rf-find]') || e.target.closest('[data-rf-findoff]')) {
          showNavFind(ui.rp.navFind == null);
          return;
        }
        const it = e.target.closest('[data-f-item]');
        if (it) {
          // a move that opens the plan at one of its other cycles, not at the
          // running one - set before select, which only resets it elsewhere
          if (it.dataset.fCycle) ui.rp.rmCycle = it.dataset.fCycle;
          select(it.dataset.fItem);
          /* a move from Needs your review is about one field, not a section: the page
             it opens scrolls to that row and the row says so for a moment. */
          const want = it.dataset.fFocus || it.dataset.fAt;
          if (want) focusInSection(it.dataset.fFocus, it.dataset.fAt);
          return;
        }
        const act = e.target.closest('[data-bp-act]');
        if (act) {
          B.toast(
            act.dataset.bpAct === 'export'
              ? 'Exports the profile as a PDF in the product'
              : 'Regenerates the whole profile in the product'
          );
          return;
        }
        const jump = e.target.closest('[data-bp-jump]');
        if (jump) {
          e.preventDefault();
          const sec = slot.querySelector(`#${jump.dataset.bpJump}`);
          markToc(jump.dataset.bpJump);
          if (sec)
            sec.scrollIntoView({
              block: 'start',
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            });
          return;
        }
        const more = e.target.closest('[data-more]');
        if (more) {
          X.toggleMore(more, slot);
          return;
        }
        const va = e.target.closest('[data-va-act]');
        if (va) {
          const id = va.dataset.vaId;
          const act = va.dataset.vaAct;
          if (act === 'mine') {
            ui.rp.va.mine[id] = true;
            B.toast('Recorded as yours - it can reach creative from now on');
          } else if (act === 'rule-yes') {
            ui.rp.va.rules[id] = 'confirmed';
            B.toast('Rule confirmed - briefs may use it');
          } else if (act === 'rule-no') {
            ui.rp.va.rules[id] = 'dropped';
            B.toast('Recorded as not a rule - it never reaches a brief');
          } else if (act === 'rule-edit') {
            ui.rp.va.edit = id;
          } else if (act === 'rule-cancel') {
            ui.rp.va.edit = null;
          } else if (act === 'rule-save') {
            const box = detail().querySelector(`[data-va-text="${CSS.escape(id)}"]`);
            const said = box ? box.value.trim() : '';
            if (said) ui.rp.va.text[id] = said;
            ui.rp.va.edit = null;
            B.toast('Rule written in your words');
          }
          const box = detail().querySelector('.bx-rf__assets');
          if (box) {
            box.innerHTML = assetsHtml();
            B.motion.fadeIn(box, { duration: 0.18 });
            const typing = box.querySelector('[data-va-text]');
            if (typing) typing.focus();
          }
          return;
        }
        const fold = e.target.closest('[data-f-fold]');
        if (fold) {
          const [id, key] = fold.dataset.fFold.split(':');
          setFold(id, key, !ui.rp.fFold[`${id}:${key}`]);
          return;
        }
        if (
          X.handleRegenAll(e, (act) => {
            const all = slot.querySelector('[data-rf-all]');
            if (all) all.innerHTML = X.regenAllControl({ iconOnly: true });
            if (act === 'all-yes') rerender(ui.rp.fSel);
          })
        )
          return;
        X.handleReportAction(e, slot, rerender);
      });
      /* The arrows are not the only way through the years: a two-finger swipe
         across the calendar turns the page, which is what anyone does to a
         calendar first. One swipe is one year however long the gesture runs on
         for, hence the lock. */
      let swipeUntil = 0;
      slot.addEventListener(
        'wheel',
        (e) => {
          if (!e.target || !e.target.closest) return;
          if (!e.target.closest('.bx-rmcal')) return;
          if (Math.abs(e.deltaX) < 10 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.2) return;
          e.preventDefault();
          const now = Date.now();
          if (now < swipeUntil) return;
          const cs = B.rmCycles();
          const all = calYears(cs);
          const to = all.indexOf(calYearOf(cs)) + (e.deltaX > 0 ? 1 : -1);
          if (to < 0 || to >= all.length) return;
          swipeUntil = now + 420;
          turnYear(all[to]);
        },
        { passive: false }
      );
      /* A plan is cut wherever a row or a year ends, so pointing at one piece of
         it lights every piece: what is being pointed at is the ninety days, not
         the fortnight of them that happens to fall on this row. */
      slot.addEventListener('mouseover', (e) => {
        if (!e.target || !e.target.closest) return;
        const seg = e.target.closest('[data-cal-seg]');
        const cal = e.target.closest('.bx-rmcal');
        const key = cal && seg ? seg.dataset.calSeg : null;
        slot.querySelectorAll('[data-cal-seg].is-hot').forEach((x) => {
          if (x.dataset.calSeg !== key) x.classList.remove('is-hot');
        });
        if (!key) return;
        cal
          .querySelectorAll(`[data-cal-seg="${CSS.escape(key)}"]`)
          .forEach((x) => x.classList.add('is-hot'));
      });
      slot.addEventListener('input', (e) => {
        if (e.target.matches('[data-rm-findq]')) {
          ui.rp.rmFind = e.target.value;
          /* the ribbon shows one year, so a date that answers in another year has
             to turn the page to it - otherwise the find box looks broken */
          const q = e.target.value.trim();
          if (q && ui.rp.rmView === 'cal') {
            const hit = B.rmCycles().find((c) => B.rmMatches(c, q));
            const y = hit ? Number(hit.start.slice(0, 4)) : null;
            const on = [...slot.querySelectorAll('.bx-rmcal__rib')].some((r) =>
              B.rmMatches(B.rmCycles().find((c) => c.key === r.dataset.rmCycle) || {}, q)
            );
            if (y && !on) {
              turnYear(y);
              const box = detail().querySelector('[data-rm-findq]');
              if (box) {
                box.focus();
                box.setSelectionRange(box.value.length, box.value.length);
              }
              return;
            }
          }
          filterPlans(slot);
          return;
        }
        if (e.target.matches('[data-rf-findq]')) {
          ui.rp.navFind = e.target.value;
          filterNav();
          return;
        }
        if (!e.target.matches('[data-ov-findq]')) return;
        ui.rp.ovFind = e.target.value;
        ui.rp.secPage = 0;
        const list = detail().querySelector('[data-sec-list]');
        if (list) list.innerHTML = secListHtml();
        const n = detail().querySelector('[data-ov-findn]');
        const all = secList().concat(planEntry());
        if (n) n.innerHTML = findCount(secHits(all).length, all.length);
        const row = detail().querySelector('[data-sec-planrow]');
        if (row) row.hidden = planGone();
        X.fitMore(detail());
        fitSecTrack();
      });
      slot.addEventListener('keydown', (e) => {
        if (e.target.matches('[data-rm-findq]')) {
          if (e.key === 'Escape') {
            e.preventDefault();
            ui.rp.rmFind = null;
            ui.rp.rmPlansOpen = false;
            paint();
            const btn = detail().querySelector('[data-rm-plans]');
            if (btn) btn.focus();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const first = detail().querySelector('.bx-rmpl__past [data-rm-cycle]:not([hidden])');
            if (first) first.click();
          }
          return;
        }
        if (e.target.matches('[data-rf-findq]')) {
          if (e.key === 'Escape') {
            e.preventDefault();
            showNavFind(false);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const first = slot.querySelector(
              '[data-rf-nav] .bx-rft__item:not(.is-back):not([hidden])'
            );
            if (first) first.click();
          }
          return;
        }
        if (!e.target.matches('[data-ov-findq]')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          ui.rp.ovFind = null;
          paint();
          const btn = detail().querySelector('[data-ov-find]');
          if (btn) btn.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const first = detail().querySelector('[data-sec-list] [data-f-item]');
          if (first) first.click();
        }
      });
      if (window.BXF) slot.addEventListener('keydown', BXF.keys);
      slot.addEventListener('keydown', (e) => {
        const it = e.target.closest(
          '.bx-rf__item, .bx-rf__ritem[data-f-item]:not([data-bp-entry])'
        );
        if (!it || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
        e.preventDefault();
        const items = B.$$('.bx-rf__item, .bx-rf__ritem[data-f-item]:not([data-bp-entry])', slot);
        const i = items.indexOf(it) + (e.key === 'ArrowDown' ? 1 : -1);
        const next = items[Math.max(0, Math.min(items.length - 1, i))];
        next.focus();
        select(next.dataset.fItem, { fade: false });
      });
    },
    onDate(slot, { state }) {
      const rm = B.roadmapAt(state.today);
      // the bar names the plan; the day it stands on is in its bubble
      const chip = slot.querySelector('[data-f-item="roadmap"]');
      if (chip) chip.dataset.tip = `Roadmap · ${clockShort(rm)}`;
      /* the card on the overview draws the same plan, so the day it is on, the phase
         running and the arrowheads all follow the date with it */
      const row = slot.querySelector('[data-sec-planrow]');
      if (row && B.roadmapView()) row.innerHTML = planCard(rm);
    },
  });

  /* ============================================================== KNOWLEDGE */

  const kn = ui.kn;
  kn.cSort = kn.cSort || 'conf-desc';
  kn.fMsort = kn.fMsort || 'facts';
  kn.fSrcQ = kn.fSrcQ || '';
  kn.fAll = !!kn.fAll;
  kn.fPage = kn.fPage || 1;
  const TOP = 5;
  const PER = 25;

  // a cell's depth in its kind's hue: four steps, pale-dominant, the deepest kept for
  // the top quarter
  const step = (n, max) => Math.min(4, Math.max(1, Math.ceil((n / max) * 4)));

  function matrixRows() {
    const base = B.filterFacts({ ...kn, source: '', kinds: [], bands: [], evidence: [] });
    const counts = {};
    base.forEach((f) => {
      counts[f.source] = counts[f.source] || {};
      counts[f.source][f.kind] = (counts[f.source][f.kind] || 0) + 1;
    });
    let rows = sources.map((s) => {
      const mine = base.filter((f) => f.source === s.id);
      return {
        s,
        c: counts[s.id] || {},
        total: mine.length,
        unloc: mine.filter((f) => f.unlocated).length,
      };
    });
    const q = kn.fSrcQ.trim().toLowerCase();
    if (q) rows = rows.filter((r) => `${r.s.short} ${r.s.path}`.toLowerCase().includes(q));
    rows.sort((a, b) => {
      if (kn.fMsort === 'name') return a.s.short.localeCompare(b.s.short);
      if (kn.fMsort === 'unloc') return b.unloc - a.unloc || b.total - a.total;
      return b.total - a.total;
    });
    return { base, rows, q };
  }

  /* Coverage is the source × kind matrix, folded. Folded (the default) it is one
     flat row - the facts by kind as a thin strip, the top kinds named - so the list
     starts high; Show coverage opens the matrix itself. Every part filters the
     list, as the matrix cells do. */
  kn.fCov = kn.fCov === 'full' ? 'full' : 'flat';
  function flatHtml() {
    const byKind = B.countBy(facts, (f) => f.kind);
    const kinds = B.KINDS.filter((k) => byKind[k]);
    const named = kinds
      .slice()
      .sort((a, b) => byKind[b] - byKind[a])
      .slice(0, 3);
    const selKind = kn.kinds.length === 1 ? kn.kinds[0] : null;
    return `
      <div class="bx-kfl">
        <div class="bx-kfl__strip" role="group" aria-label="Facts by kind">
          ${kinds
            .map(
              (k) =>
                `<button type="button" class="bx-kfl__seg bx-kav--${k} ${selKind === k ? 'is-on' : ''}" style="flex:${byKind[k]}" data-f-col="${k}" title="${esc(X.kindLabel(k))} · ${byKind[k]}" aria-label="${esc(X.kindLabel(k))}, ${byKind[k]} facts"></button>`
            )
            .join('')}
        </div>
        <div class="bx-kfl__keys">
          ${named
            .map(
              (k) =>
                `<button type="button" class="bx-kfl__key bx-kav--${k} ${selKind === k ? 'is-on' : ''}" data-f-col="${k}"><i></i>${esc(X.kindLabel(k))}<b class="bx-num">${byKind[k]}</b></button>`
            )
            .join('')}
          ${kinds.length > named.length ? `<span class="bx-kfl__more bx-num">+${kinds.length - named.length}</span>` : ''}
        </div>
      </div>`;
  }
  const covHtml = () => (kn.fCov === 'full' ? matrixHtml() : flatHtml());

  // the card's head and body for the height it is at
  function covInner() {
    const many = sources.length > TOP + 1;
    const count = `<h3 class="bx-kf__h3" id="bx-kf-cov">Coverage<span class="bx-kf__covn bx-num">${facts.length} facts · ${sources.length} sources</span></h3>`;
    if (kn.fCov === 'flat')
      return `
        <header class="bx-kf__covhead bx-kf__covhead--flat">
          ${count}
          <div class="bx-kf__covflat" data-f-matrix>${flatHtml()}</div>
          <div class="bx-kf__covtools">
            <button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-f-cov="full" aria-expanded="false">${icon('chevron-down', 13)}Show coverage</button>
          </div>
        </header>`;
    return `
      <header class="bx-kf__covhead">
        <div>
          ${count}
          <p class="bx-kf__sub">Pick a kind, a source or a cell to narrow the list.</p>
        </div>
        <div class="bx-kf__covtools">
          ${
            many
              ? `<label class="bx-search bx-kf__find">${icon('search', 14)}<input type="search" data-f-srcq placeholder="Find a source" value="${esc(kn.fSrcQ)}" aria-label="Find a source"></label>`
              : ''
          }
          <select class="bx-select" data-f-msort aria-label="Order sources">
            <option value="facts" ${kn.fMsort === 'facts' ? 'selected' : ''}>Most facts</option>
            <option value="unloc" ${kn.fMsort === 'unloc' ? 'selected' : ''}>Most wording not found</option>
            <option value="name" ${kn.fMsort === 'name' ? 'selected' : ''}>A – Z</option>
          </select>
          <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-f-cov="flat" aria-expanded="true">${icon('chevron-up', 13)}Hide</button>
        </div>
      </header>
      <div data-f-matrix>${matrixHtml()}</div>`;
  }

  function matrixHtml() {
    const { base, rows, q } = matrixRows();
    const kinds = B.KINDS;
    const collapsible = !q && rows.length > TOP + 1;
    let shown = rows;
    let rest = [];
    if (collapsible && !kn.fAll) {
      shown = rows.slice(0, TOP);
      rest = rows.slice(TOP);
      const pinned = rest.find((r) => r.s.id === kn.source);
      if (pinned) {
        shown = [...shown, pinned];
        rest = rest.filter((r) => r !== pinned);
      }
    }
    const max = Math.max(1, ...shown.flatMap((r) => kinds.map((k) => r.c[k] || 0)));
    const selKind = kn.kinds.length === 1 ? kn.kinds[0] : null;
    const selSrc = kn.source || null;
    const colTotal = (k) => base.filter((f) => f.kind === k).length;
    const restSum = (k) => rest.reduce((n, r) => n + (r.c[k] || 0), 0);
    return `
      <div class="bx-kf__matrix" role="grid" aria-label="Facts by source and kind" style="--kinds:${kinds.length}">
        <div class="bx-kf__mrow bx-kf__mhead" role="row">
          <span class="bx-th" role="columnheader">Source</span>
          ${kinds
            .map(
              (k) =>
                `<button type="button" role="columnheader" class="bx-kf__colh bx-kav--${k} ${selKind === k && !selSrc ? 'is-on' : ''}" data-f-col="${k}" title="Only ${esc(k)} facts" aria-label="${esc(X.kindLabel(k))}"><span class="bx-klabel">${icon(X.KIND_ICON[k] || 'fact', 12)}<span class="bx-kf__cfull">${esc(X.kindLabel(k))}</span></span></button>`
            )
            .join('')}
          <span class="bx-th bx-th--end" role="columnheader">Total</span>
        </div>
        ${shown
          .map(
            (r) => `
          <div class="bx-kf__mrow" role="row">
            <button type="button" role="rowheader" class="bx-kf__rowh ${selSrc === r.s.id && !selKind ? 'is-on' : ''}" data-f-row="${r.s.id}" title="Only ${esc(r.s.short)}">
              <span class="bx-sc bx-sc--pill">${X.siteIcon()}<span class="bx-sc__name">${esc(r.s.short)}</span></span>
            </button>
            ${kinds
              .map((k) => {
                const n = r.c[k] || 0;
                const on = selSrc === r.s.id && selKind === k;
                const dim = (selSrc && selSrc !== r.s.id) || (selKind && selKind !== k);
                return n
                  ? `<button type="button" role="gridcell" class="bx-kf__cell bx-kav--${k} is-s${step(n, max)} ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}" data-f-cell="${r.s.id}|${k}" aria-label="${n} ${esc(k)} facts from ${esc(r.s.short)}"><span class="bx-num">${n}</span></button>`
                  : `<span role="gridcell" class="bx-kf__cell bx-kf__cell--zero ${dim ? 'is-dim' : ''}" aria-label="none"></span>`;
              })
              .join('')}
            <span role="gridcell" class="bx-kf__total bx-num">${r.total}</span>
          </div>`
          )
          .join('')}
        ${
          rest.length
            ? `<div class="bx-kf__mrow bx-kf__mrest" role="row">
                <button type="button" role="rowheader" class="bx-kf__rowh bx-kf__rowh--rest" data-f-more aria-expanded="false">${icon('chevron-down', 13)}<span>${rest.length} more sources</span></button>
                ${kinds.map((k) => `<span role="gridcell" class="bx-kf__restn bx-num">${restSum(k) || ''}</span>`).join('')}
                <span role="gridcell" class="bx-kf__total bx-num">${rest.reduce((n, r) => n + r.total, 0)}</span>
              </div>`
            : collapsible
              ? `<div class="bx-kf__mrow bx-kf__mrest" role="row"><button type="button" role="rowheader" class="bx-kf__rowh bx-kf__rowh--rest" data-f-more aria-expanded="true">${icon('chevron-up', 13)}<span>Top ${TOP} only</span></button></div>`
              : ''
        }
        ${shown.length ? '' : `<p class="bx-kf__none">No source matches “${esc(kn.fSrcQ)}”.</p>`}
        <div class="bx-kf__mrow bx-kf__mfoot" role="row">
          <span class="bx-kf__rowh bx-kf__rowh--static" role="rowheader">All ${B.plural(sources.length, 'source')}</span>
          ${kinds.map((k) => `<span role="gridcell" class="bx-kf__foot bx-num">${colTotal(k)}</span>`).join('')}
          <span role="gridcell" class="bx-kf__total bx-kf__total--all bx-num">${base.length}</span>
        </div>
      </div>`;
  }

  const SORTS = [
    ['conf-desc', 'Highest confidence'],
    ['conf-asc', 'Lowest confidence'],
    ['unverified', 'Needs checking first'],
    ['learned', 'Most recently learned'],
  ];

  function listFor() {
    const list = B.filterFacts();
    const sorters = {
      'conf-desc': (a, b) => b.confidence - a.confidence,
      'conf-asc': (a, b) => a.confidence - b.confidence,
      unverified: (a, b) =>
        Number(b.unlocated || b.replaced) - Number(a.unlocated || a.replaced) ||
        a.confidence - b.confidence,
      learned: (a, b) => (a.learnedAt < b.learnedAt ? 1 : a.learnedAt > b.learnedAt ? -1 : 0),
    };
    return list.slice().sort((a, b) => sorters[kn.cSort](a, b) || a.n - b.n);
  }

  function appliedHtml() {
    const chips = [];
    kn.kinds.forEach((k) => chips.push([X.kindLabel(k), `kinds:${k}`]));
    if (kn.source) chips.push([B.sourceById[kn.source].short, 'source']);
    kn.bands.forEach((b) => chips.push([B.BANDS.find((x) => x.key === b).label, `bands:${b}`]));
    kn.evidence
      .filter((ev) => ev !== 'unlocated')
      .forEach((ev) => chips.push([B.EVIDENCE.find((x) => x.key === ev).label, `evidence:${ev}`]));
    if (!chips.length) return '';
    return `${chips
      .map(
        ([label, key]) =>
          `<span class="bx-applied">${esc(label)}<button type="button" data-f-remove="${esc(key)}" aria-label="Remove ${esc(label)}">${icon('x', 12)}</button></span>`
      )
      .join('')}<button type="button" class="bx-link bx-link--quiet" data-f-clear>Clear</button>`;
  }

  /* the list is a database grid: typed column headers, a row number that turns
     into an open icon, gridlines, and each value in its column's own form */
  const GRID_COLS = [
    ['type', 'Statement'],
    ['tag', 'Kind'],
    ['globe', 'Source'],
    ['hash', 'Conf.'],
    ['clock', 'Learned'],
  ];

  const wordingDot = (f) =>
    f.replaced
      ? '<span class="bx-wdot is-replaced"><i></i>Replaced</span>'
      : f.unlocated
        ? '<span class="bx-wdot is-missing"><i></i>Not found</span>'
        : '<span class="bx-wdot"><i></i>Located</span>';

  function rowHtml(f, num) {
    const on = kn.open === f.id;
    return `
      <div class="bx-kf__row ${on ? 'is-selected' : ''} ${f.band === 'low' ? 'is-low' : ''}" data-fact="${f.id}" role="rowgroup">
        <div class="bx-kf__tr" role="row" tabindex="0" data-f-fact="${f.id}" aria-haspopup="dialog">
          <span class="bx-kf__num" role="cell"><b class="bx-num">${num}</b>${icon('expand', 13)}</span>
          <span class="bx-kf__stmt" role="cell"><span>${X.markedStatement(f)}</span></span>
          <span class="bx-kf__kind" role="cell">${X.kindCell(f)}</span>
          <span class="bx-kf__src" role="cell">${X.srcCell(f)}</span>
          <span class="bx-kf__conf" role="cell">${X.confCell(f)}</span>
          <span class="bx-kf__learn bx-num" role="cell">${esc(dates.fmtShort(f.learnedAt))}</span>
        </div>
      </div>`;
  }

  /* a fact opens as a side sheet over the page: the statement, then its record in
     the picked design (Versions → Fact record) - the same record Knowledge D opens
     in its row */
  function drawerHtml(f, list) {
    const i = list.findIndex((x) => x.id === f.id);
    const uses = B.factUses[f.id] || [];
    return `
      <div class="bx-drawer__scrim" data-d-close></div>
      <aside class="bx-drawer__sheet bx-drawer__sheet--fact bx-view" role="dialog" aria-modal="true" aria-labelledby="bx-dr-title">
        <header class="bx-drawer__head">
          <p class="bx-label">Fact ${f.n}<span class="bx-drawer__pos bx-num">${i + 1} of ${list.length}</span></p>
          <div class="bx-drawer__nav">
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-d-step="-1" ${i <= 0 ? 'disabled' : ''} aria-label="Previous fact">${icon('chevron-up', 15)}</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-d-step="1" ${i >= list.length - 1 ? 'disabled' : ''} aria-label="Next fact">${icon('chevron-down', 15)}</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-d-close aria-label="Close">${icon('x', 15)}</button>
          </div>
        </header>
        <div class="bx-drawer__body">
          <h3 class="bx-drawer__stmt" id="bx-dr-title">${X.markedStatement(f)}</h3>
          ${X.recordBody(f, { drawer: true })}
        </div>
        <footer class="bx-drawer__foot">
          <a class="bx-btn bx-btn--secondary bx-btn--xs" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener">Open page${icon('external', 12)}</a>
          ${uses.length ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-go-field="${uses[0].field.id}">View in report${icon('arrow-right', 13)}</button>` : ''}
        </footer>
      </aside>`;
  }

  function barHtml() {
    const list = B.filterFacts();
    const unloc = B.filterFacts({ ...kn, evidence: [] }).filter((f) => f.unlocated).length;
    return `
      <div class="bx-kf__listbar">
        <div class="bx-kf__scope">
          <p class="bx-kf__count"><b class="bx-num">${list.length}</b> ${list.length === 1 ? 'fact' : 'facts'}</p>
          <div class="bx-kf__applied">${appliedHtml()}</div>
        </div>
        <div class="bx-kf__tools">
          ${X.entKey()}
          <button type="button" class="bx-chip bx-chip--sm bx-chip--warn" aria-pressed="${kn.evidence.includes('unlocated')}" data-f-unloc data-tip="Wording not found \u00b7 the passage a fact was read from is no longer on the page">${icon('search-x', 13)}Wording not found<span class="bx-chip__count bx-num">${unloc}</span></button>
          <select class="bx-select bx-kf__sort" data-f-sort aria-label="Sort facts">
            ${SORTS.map(([v, l]) => `<option value="${v}" ${kn.cSort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>`;
  }

  function listHtml() {
    const list = listFor();
    const pages = Math.max(1, Math.ceil(list.length / PER));
    kn.fPage = Math.min(Math.max(1, kn.fPage), pages);
    const start = (kn.fPage - 1) * PER;
    return `
      <div class="bx-card bx-kf__table" role="table" aria-label="Facts">
        <div class="bx-kf__thead" role="row">
          <span class="bx-kf__th bx-kf__th--num" role="columnheader" aria-label="Row"></span>
          ${GRID_COLS.map(([ic, label]) => `<span class="bx-kf__th" role="columnheader">${icon(ic, 13)}${label}</span>`).join('')}
        </div>
        ${
          list.length
            ? list
                .slice(start, start + PER)
                .map((f, i) => rowHtml(f, start + i + 1))
                .join('')
            : `<div class="bx-empty">${icon('search-x', 22)}<p>No facts in this slice.</p><button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-f-clear>Clear</button></div>`
        }
        ${X.pagerHtml({ total: list.length, page: kn.fPage, per: PER, attr: 'data-f-page' })}
      </div>`;
  }

  let drawerOnMount = false;
  function applyJump() {
    drawerOnMount = false;
    if (kn.jump) {
      kn.open = kn.jump;
      const i = listFor().findIndex((f) => f.id === kn.jump);
      kn.fPage = Math.floor(Math.max(0, i) / PER) + 1;
      drawerOnMount = true;
    } else {
      kn.open = null;
      if (kn.intent) kn.fPage = 1;
    }
    kn.jump = null;
    kn.intent = null;
  }

  B.register('knowledge', 'f', {
    render() {
      applyJump();
      return `
        <div class="bx-view bx-kf">
          <section class="bx-card bx-kf__cov ${kn.fCov === 'flat' ? 'is-flat' : ''}" aria-labelledby="bx-kf-cov" data-f-covcard>${covInner()}</section>
          <section class="bx-kf__list" aria-label="Facts">
            <div class="bx-kf__listtop">
              <label class="bx-search bx-kf__search">
                ${icon('search', 15)}
                <input type="search" data-q placeholder="Search facts" value="${esc(kn.q)}" aria-label="Search facts">
                <button type="button" class="bx-search__clear" data-q-clear aria-label="Clear search" ${kn.q ? '' : 'hidden'}>${icon('x', 14)}</button>
              </label>
              <div data-f-bar>${barHtml()}</div>
            </div>
            <div data-f-list>${listHtml()}</div>
          </section>
        </div>`;
    },
    mount(slot) {
      const refresh = (opts = {}) => {
        if (!opts.keepPage) kn.fPage = 1;
        if (opts.matrix !== false) B.$('[data-f-matrix]', slot).innerHTML = covHtml();
        B.$('[data-f-bar]', slot).innerHTML = barHtml();
        B.$('[data-f-list]', slot).innerHTML = listHtml();
        const clear = B.$('[data-q-clear]', slot);
        if (clear) clear.hidden = !kn.q;
        if (opts.fade) B.motion.fadeIn(B.$('.bx-kf__table', slot), { duration: 0.18 });
      };
      const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const markRow = () =>
        B.$$('.bx-kf__row', slot).forEach((r) =>
          r.classList.toggle('is-selected', r.dataset.fact === kn.open)
        );
      const closeDrawer = (opts = {}) => {
        const el = document.querySelector('.bx-drawer:not(.is-closing)');
        const was = kn.open;
        kn.open = null;
        markRow();
        if (el) {
          el.classList.add('is-closing');
          if (window.gsap && !reduce()) {
            gsap.to(el.querySelector('.bx-drawer__sheet'), {
              x: 24,
              autoAlpha: 0,
              duration: 0.18,
              ease: 'power1.in',
            });
            gsap.to(el.querySelector('.bx-drawer__scrim'), { autoAlpha: 0, duration: 0.18 });
          }
          // removal does not wait on the tween: a hidden tab never ticks it
          setTimeout(() => el.remove(), window.gsap && !reduce() ? 200 : 0);
        }
        if (opts.focus !== false && was) {
          const row = slot.querySelector(`[data-f-fact="${was}"]`);
          if (row) row.focus({ preventScroll: true });
        }
      };
      const openDrawer = (id) => {
        const f = B.factById[id];
        if (!f) return;
        const list = listFor();
        const existing = document.querySelector('.bx-drawer:not(.is-closing)');
        kn.open = id;
        markRow();
        if (existing) {
          existing.innerHTML = drawerHtml(f, list);
          existing.querySelector('.bx-drawer__scrim').style.opacity = '1';
          const body = existing.querySelector('.bx-drawer__body');
          B.motion.fadeIn(body, { duration: 0.16 });
          const close = existing.querySelector('[data-d-close].bx-btn');
          if (close) close.focus();
          return;
        }
        const wrap = document.createElement('div');
        wrap.className = 'bx-drawer';
        wrap.innerHTML = drawerHtml(f, list);
        (document.querySelector('.app-shell') || document.body).appendChild(wrap);
        if (window.gsap && !reduce()) {
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
        const close = wrap.querySelector('[data-d-close].bx-btn');
        if (close) close.focus();
        wrap.addEventListener('click', (e) => {
          if (e.target.closest('a[href]')) return;
          if (e.target.closest('[data-d-close]')) {
            closeDrawer();
            return;
          }
          const stepBtn = e.target.closest('[data-d-step]');
          if (stepBtn) {
            step(Number(stepBtn.dataset.dStep));
            return;
          }
          const go = e.target.closest('[data-go-field]');
          if (go) {
            closeDrawer({ focus: false });
            B.goField(go.dataset.goField);
          }
        });
        wrap.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeDrawer();
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            step(e.key === 'ArrowDown' ? 1 : -1);
          }
        });
      };
      const step = (dir) => {
        const list = listFor();
        const i = list.findIndex((f) => f.id === kn.open);
        const next = list[i + dir];
        if (!next) return;
        const page = Math.floor(list.indexOf(next) / PER) + 1;
        if (page !== kn.fPage) {
          kn.fPage = page;
          B.$('[data-f-list]', slot).innerHTML = listHtml();
        }
        openDrawer(next.id);
        const row = slot.querySelector(`[data-fact="${next.id}"]`);
        if (row) row.scrollIntoView({ block: 'nearest' });
      };
      if (kn.open) {
        const id = kn.open;
        setTimeout(() => {
          const row = slot.querySelector(`[data-fact="${id}"]`);
          if (row) row.scrollIntoView({ block: 'center' });
          if (drawerOnMount) openDrawer(id);
        }, 60);
      }

      slot.addEventListener('input', (e) => {
        if (e.target.matches('[data-q]')) {
          kn.q = e.target.value;
          refresh();
        } else if (e.target.matches('[data-f-srcq]')) {
          kn.fSrcQ = e.target.value;
          B.$('[data-f-matrix]', slot).innerHTML = covHtml();
        }
      });
      slot.addEventListener('change', (e) => {
        if (e.target.matches('[data-f-sort]')) {
          kn.cSort = e.target.value;
          refresh({ matrix: false, fade: true });
        } else if (e.target.matches('[data-f-msort]')) {
          kn.fMsort = e.target.value;
          B.$('[data-f-matrix]', slot).innerHTML = covHtml();
        }
      });
      // a fact row is a row, not a button: Enter or Space opens it
      slot.addEventListener('keydown', (e) => {
        const row = e.target.closest('.bx-kf__tr');
        if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          row.click();
        }
      });
      slot.addEventListener('click', (e) => {
        const cov = e.target.closest('[data-f-cov]');
        if (cov) {
          const card = slot.querySelector('[data-f-covcard]');
          const from = card.offsetHeight;
          kn.fCov = cov.dataset.fCov;
          card.classList.toggle('is-flat', kn.fCov === 'flat');
          card.innerHTML = covInner();
          const to = card.offsetHeight;
          const again = card.querySelector('[data-f-cov]');
          if (again && e.detail === 0) again.focus();
          if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.fromTo(
              card,
              { height: from, overflow: 'hidden' },
              { height: to, duration: 0.3, ease: 'power2.out', clearProps: 'height,overflow' }
            );
            gsap.fromTo(
              card.querySelector('[data-f-matrix]'),
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.24, delay: 0.06, clearProps: 'opacity,visibility' }
            );
          }
          return;
        }
        if (e.target.closest('a[href]')) return;
        const cell = e.target.closest('[data-f-cell]');
        if (cell) {
          const [source, kind] = cell.dataset.fCell.split('|');
          const same = kn.source === source && kn.kinds.length === 1 && kn.kinds[0] === kind;
          kn.source = same ? '' : source;
          kn.kinds = same ? [] : [kind];
          refresh({ fade: true });
          return;
        }
        const col = e.target.closest('[data-f-col]');
        if (col) {
          const same = kn.kinds.length === 1 && kn.kinds[0] === col.dataset.fCol && !kn.source;
          kn.source = '';
          kn.kinds = same ? [] : [col.dataset.fCol];
          refresh({ fade: true });
          return;
        }
        const row = e.target.closest('[data-f-row]');
        if (row) {
          const same = kn.source === row.dataset.fRow && !kn.kinds.length;
          kn.kinds = [];
          kn.source = same ? '' : row.dataset.fRow;
          refresh({ fade: true });
          return;
        }
        if (e.target.closest('[data-f-more]')) {
          kn.fAll = !kn.fAll;
          B.$('[data-f-matrix]', slot).innerHTML = covHtml();
          return;
        }
        const rm = e.target.closest('[data-f-remove]');
        if (rm) {
          const [key, value] = rm.dataset.fRemove.split(':');
          if (key === 'source') kn.source = '';
          else kn[key] = kn[key].filter((v) => v !== value);
          refresh({ fade: true });
          return;
        }
        if (e.target.closest('[data-f-clear]')) {
          B.clearFilters();
          B.$('[data-q]', slot).value = '';
          refresh({ fade: true });
          return;
        }
        if (e.target.closest('[data-q-clear]')) {
          kn.q = '';
          B.$('[data-q]', slot).value = '';
          refresh();
          return;
        }
        if (e.target.closest('[data-f-unloc]')) {
          kn.evidence = kn.evidence.includes('unlocated') ? [] : ['unlocated'];
          refresh({ matrix: false, fade: true });
          return;
        }
        const pg = e.target.closest('[data-f-page]');
        if (pg && !pg.disabled) {
          kn.fPage = Number(pg.dataset.fPage) || 1;
          refresh({ keepPage: true, matrix: false });
          const bar = B.$('.bx-kf__listtop', slot);
          if (bar && bar.getBoundingClientRect().top < 0)
            bar.scrollIntoView({ block: 'start', behavior: 'smooth' });
          return;
        }
        const fr = e.target.closest('[data-f-fact]');
        if (fr) openDrawer(fr.dataset.fFact);
      });
    },
  });
})();
