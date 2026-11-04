/* Shared renderers for the proposed versions (D / E / F).

   The versions differ in layout and reading model; the pieces they are built
   from - an answer with citations, a confidence label, a source's excerpts, the
   gap list and its note, a fact's evidence, a roadmap phase's four fields, a
   sortable header and a pager - are the same pieces, rendered once here so the
   three proposals cannot drift apart on the details. */
(function () {
  'use strict';
  const B = window.Brain;
  const { esc, icon, ui, dates } = B;

  // open source rows (`fieldId:index`), and which fold of a field is open
  ui.rp.srcOpen = ui.rp.srcOpen || {};
  ui.rp.fold = ui.rp.fold || {};
  ui.rp.more = ui.rp.more || {};

  /* ------------------------------------------------------------------ names */

  function srcName(src) {
    const t = src.title;
    if (src.family === 'Captions') {
      if (t === 'HomeCourt') return 'HomeCourt logo';
      const m = t.match(/^(.*?)(\.[a-z0-9]+)$/i);
      if (m && m[1].length > 22) return `${m[1].slice(0, 8)}…${m[2]}`;
      return t.replace(/\+/g, ' ');
    }
    if (t === 'HomeCourt') return 'Home page';
    return t.replace(/ — HomeCourt$/, '');
  }

  const knowledgeSourceFor = (src) =>
    B.sources.find((s) => s.title === src.title && src.family !== 'Captions');

  const GLYPH_ICON = { image: 'image', page: 'page', decision: 'located', answer: 'ask' };
  const glyph = (kind, size = '') =>
    `<span class="bx-glyph bx-glyph--${kind} ${size}">${icon(GLYPH_ICON[kind] || 'page', size ? 13 : 15)}</span>`;

  // one icon per report field, so a long report scans by shape as well as by name
  const FIELD_ICON = {
    snapshot: 'camera',
    brand_identity: 'id-card',
    conviction: 'flag',
    community: 'users',
    expression: 'message',
    insight: 'lightbulb',
    visual_identity: 'image',
  };
  // a field's icon wears the colour of its source type - the colour of its label
  const fieldIcon = (f, size = 16) =>
    `<span class="bx-ficon bx-ficon--${B.CONFIDENCE[f.confidence].tone}" aria-hidden="true">${icon(FIELD_ICON[f.id] || 'book', size)}</span>`;

  // labels always carry the full name - "Direct from source", never "Direct"
  const confPill = (f) => {
    const c = B.CONFIDENCE[f.confidence];
    return `<span class="bx-pill bx-pill--${c.tone}">${esc(c.label)}</span>`;
  };

  /* a section's own icon, in its own hue. A section is a folder, not a state:
     Confirmed, Direct, Inferred and Missing belong to the fields inside it, so its
     icon says which section it is and nothing else. */
  const secIcon = (f, size = 16) =>
    `<span class="bx-sicon is-${f.id}" aria-hidden="true">${icon(FIELD_ICON[f.id] || 'book', size)}</span>`;

  // a field's own icon, in the colour of its source type - the dot's colour
  const confIcon = (f, size = 15) => {
    const c = B.CONFIDENCE[f.confidence];
    return `<span class="bx-cicon bx-cicon--${c.tone}" aria-hidden="true">${icon(FIELD_ICON[f.id] || 'book', size)}</span>`;
  };

  /* a small bubble that names whatever carries data-tip - the report browser's rail
     uses it: "Snapshot · Direct from source" - the first part in bold */
  let tipEl = null;
  function showTip(el) {
    const text = el.dataset.tip;
    if (!text) return;
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'bx-tip';
      tipEl.setAttribute('role', 'tooltip');
      (document.querySelector('.app-shell') || document.body).appendChild(tipEl);
    }
    const [head, ...rest] = text.split(' · ');
    tipEl.innerHTML = `<b>${esc(head)}</b>${rest.length ? `<small>${esc(rest.join(' · '))}</small>` : ''}`;
    tipEl.hidden = false;
    // it stands beside what it names, and flips to the other side rather than
    // squeeze itself against the edge of the window
    tipEl.classList.remove('is-left');
    const r = el.getBoundingClientRect();
    const h = tipEl.offsetHeight;
    const w = tipEl.offsetWidth;
    const room = window.innerWidth - r.right - 18;
    const left = room < w ? r.left - 10 - w : r.right + 10;
    if (room < w) tipEl.classList.add('is-left');
    tipEl.style.left = `${Math.round(Math.max(8, left))}px`;
    tipEl.style.top = `${Math.round(Math.max(8, Math.min(window.innerHeight - h - 8, r.top + r.height / 2 - h / 2)))}px`;
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(tipEl);
      gsap.fromTo(
        tipEl,
        { autoAlpha: 0, x: -4 },
        { autoAlpha: 1, x: 0, duration: 0.14, ease: 'power2.out' }
      );
    }
  }
  function hideTip() {
    if (tipEl) tipEl.hidden = true;
  }
  if (!window.__bxTipBound) {
    window.__bxTipBound = true;
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest && e.target.closest('[data-tip]');
      if (el) showTip(el);
    });
    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest && e.target.closest('[data-tip]');
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideTip();
    });
    document.addEventListener('focusin', (e) => {
      const el = e.target.closest && e.target.closest('[data-tip]');
      if (el && el.matches(':focus-visible')) showTip(el);
    });
    document.addEventListener('focusout', (e) => {
      if (e.target.closest && e.target.closest('[data-tip]')) hideTip();
    });
    document.addEventListener('click', hideTip, true);
    document.addEventListener('brain:scroll', hideTip);
    document.addEventListener('brain:render', hideTip);
  }

  /* the same idea for a citation chip, but over the paragraph rather than beside it:
     a white bubble with what that fact says and where it was read. The payload is
     "statement||source · when · confidence". */
  let qpEl = null;
  function showQuote(el) {
    const raw = el.dataset.quote;
    if (!raw) return;
    if (!qpEl) {
      qpEl = document.createElement('div');
      qpEl.className = 'bx-quotepop';
      qpEl.setAttribute('role', 'tooltip');
      (document.querySelector('.app-shell') || document.body).appendChild(qpEl);
    }
    const [stmt, meta] = raw.split('||');
    qpEl.innerHTML = `<b>${esc(stmt)}</b>${meta ? `<small>${esc(meta)}</small>` : ''}`;
    qpEl.hidden = false;
    qpEl.classList.remove('is-under');
    const r = el.getBoundingClientRect();
    const w = qpEl.offsetWidth;
    const h = qpEl.offsetHeight;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(10, Math.min(window.innerWidth - w - 10, left));
    const under = r.top - h - 12 < 8;
    qpEl.classList.toggle('is-under', under);
    qpEl.style.left = `${Math.round(left)}px`;
    qpEl.style.top = `${Math.round(under ? r.bottom + 10 : r.top - h - 10)}px`;
    qpEl.style.setProperty(
      '--ax',
      `${Math.round(Math.max(10, Math.min(w - 20, r.left + r.width / 2 - left - 5)))}px`
    );
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(qpEl);
      gsap.fromTo(
        qpEl,
        { autoAlpha: 0, y: under ? -4 : 4 },
        { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }
      );
    }
  }
  function hideQuote() {
    if (qpEl) qpEl.hidden = true;
  }
  if (!window.__bxQuoteBound) {
    window.__bxQuoteBound = true;
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest && e.target.closest('[data-quote]');
      if (el) showQuote(el);
    });
    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest && e.target.closest('[data-quote]');
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideQuote();
    });
    document.addEventListener('focusin', (e) => {
      const el = e.target.closest && e.target.closest('[data-quote]');
      if (el && el.matches(':focus-visible')) showQuote(el);
    });
    document.addEventListener('focusout', (e) => {
      if (e.target.closest && e.target.closest('[data-quote]')) hideQuote();
    });
    document.addEventListener('click', hideQuote, true);
    document.addEventListener('brain:scroll', hideQuote);
    document.addEventListener('brain:render', hideQuote);
  }

  const confDot = (f) => {
    const c = B.CONFIDENCE[f.confidence];
    return `<span class="bx-dot bx-dot--${c.tone}" title="${esc(c.label)}" aria-label="${esc(c.label)}"></span>`;
  };

  const kindLabel = (k) => B.cap(k);

  /* ------------------------------------------------------ knowledge tables */

  // one icon per fact kind, so a list of facts scans by shape
  const KIND_ICON = {
    product: 'package',
    claim: 'quote',
    pricing: 'tag',
    identity: 'id-card',
    audience: 'users',
    contact: 'mail',
  };
  const kindAvatar = (f, size = 15) =>
    `<span class="bx-kav bx-kav--${f.kind}" title="${esc(kindLabel(f.kind))}" aria-label="${esc(kindLabel(f.kind))}">${icon(KIND_ICON[f.kind] || 'fact', size)}</span>`;

  // the wording check as a status label; most wording is found, so "Located" stays
  // quiet and only the exceptions take a colour
  const wordingPill = (f) =>
    f.replaced
      ? '<span class="bx-pill bx-pill--plain bx-pill--compact">Replaced</span>'
      : f.unlocated
        ? '<span class="bx-pill bx-pill--attention bx-pill--compact">Not found</span>'
        : '<span class="bx-pill bx-pill--quiet bx-pill--compact">Located</span>';

  // a small ring for a share (0-1); low confidence draws in amber
  const ring = (value, opts = {}) => {
    const pct = Math.max(0, Math.min(100, value * 100));
    return `<span class="bx-ring ${opts.low ? 'is-low' : ''}" aria-hidden="true"><svg viewBox="0 0 20 20" width="${opts.size || 20}" height="${opts.size || 20}"><circle class="bx-ring__track" cx="10" cy="10" r="8"/><circle class="bx-ring__arc" cx="10" cy="10" r="8" pathLength="100" stroke-dasharray="${pct.toFixed(1)} 100" transform="rotate(-90 10 10)"/></svg></span>`;
  };

  // confidence as a short bar and its figure
  const confMeter = (f) =>
    `<span class="bx-meter ${f.band === 'low' ? 'is-low' : ''}" title="${f.band === 'low' ? 'Below 0.85 - shown dimmed' : 'Confidence'}"><span class="bx-meter__track" aria-hidden="true"><i style="width:${Math.round(f.confidence * 100)}%"></i></span><b class="bx-num">${f.confidence.toFixed(2)}</b></span>`;

  /* ----------------------------------------------------------------- answer */

  // citations print exactly as the shipped report prints them - grey [n] chips in
  // the line - and stay live: hover shows the excerpt, click opens the source
  function tokensHtml(tokens, fieldId) {
    return tokens
      .map(([t, v]) => {
        if (t === 'c')
          return `<button type="button" class="brain-prose__cite bx-cite" data-cite="${esc(v)}" data-cite-field="${fieldId}" aria-label="Source ${esc(v)}">[${esc(v)}]</button>`;
        if (t === 'q') return `<q class="bx-q">${esc(v)}</q>`;
        return esc(v);
      })
      .join('');
  }

  // the answer as the product writes it: its own paragraphs, one reading size
  function answerHtml(f) {
    return f.paragraphs.map((p) => `<p>${tokensHtml(p, f.id).trim()}</p>`).join('');
  }

  /* The answer, read in two levels: its first sentence leads at reading size, the
     rest follows smaller and folded. Nothing is rewritten - only sized. */
  function splitLede(f) {
    const ps = f.paragraphs.map((p) => p.slice());
    const first = ps[0] || [];
    const lede = [];
    const tail = (rest) => ({ lede, rest: [rest, ...ps.slice(1)].filter((p) => p.length) });
    for (let i = 0; i < first.length; i++) {
      const [t, v] = first[i];
      if (t !== 't') {
        lede.push(first[i]);
        continue;
      }
      const m = v.match(/^(.*?[.!?])\s+(\S.*)$/s);
      if (m) {
        lede.push(['t', m[1]]);
        return tail([['t', m[2]], ...first.slice(i + 1)]);
      }
      lede.push(first[i]);
      if (/[.!?]["”']?$/.test(v.trim())) {
        let j = i + 1;
        while (j < first.length && first[j][0] === 'c') lede.push(first[j++]);
        return tail(first.slice(j));
      }
    }
    return { lede, rest: ps.slice(1) };
  }

  // the brand's own words inside an answer, for a quick strip under it
  const quotesOf = (f) => {
    const out = [];
    f.paragraphs.forEach((p) =>
      p.forEach(([t, v]) => {
        if (t === 'q' && !out.includes(v)) out.push(v);
      })
    );
    return out;
  };

  /* Long answers fold to a few lines with "Show more", as the shipped report does.
     `scope` keeps each version's open state apart; `fitMore` hides the button when
     the text already fits. */
  function answerClamp(f, scope, lines = 3) {
    const key = `${scope}:${f.id}`;
    const open = !!ui.rp.more[key];
    return `
      <div class="bx-answer bx-clamp ${open ? '' : 'is-clamped'}" style="--lines:${lines}" data-clamp="${key}">${answerHtml(f)}</div>
      <button type="button" class="brain-field__more bx-more" data-more="${key}" aria-expanded="${open}" hidden>${open ? 'Show less' : 'Show more'}</button>`;
  }

  /* the layered answer: lede, then the rest folded, then the quoted phrases */
  function answerLayered(f, scope, lines = 4) {
    const { lede, rest } = splitLede(f);
    const key = `${scope}:${f.id}`;
    const open = !!ui.rp.more[key];
    const quotes = quotesOf(f).slice(0, 4);
    return `
      <div class="bx-alead">${tokensHtml(lede, f.id).trim()}</div>
      ${
        rest.length
          ? `<div class="bx-arest bx-clamp ${open ? '' : 'is-clamped'}" style="--lines:${lines}" data-clamp="${key}">${rest
              .map((p) => `<p>${tokensHtml(p, f.id).trim()}</p>`)
              .join('')}</div>
             <button type="button" class="brain-field__more bx-more" data-more="${key}" aria-expanded="${open}" hidden>${open ? 'Show less' : 'Show more'}</button>`
          : ''
      }
      ${
        quotes.length
          ? `<div class="bx-aquotes"><span class="bx-label">In the brand's words</span>${quotes
              .map((q) => `<q class="bx-aquote">${esc(q)}</q>`)
              .join('')}</div>`
          : ''
      }`;
  }

  function fitMore(root) {
    B.$$('[data-clamp]', root).forEach((box) => {
      const btn = root.querySelector(`[data-more="${box.dataset.clamp}"]`);
      if (!btn) return;
      if (!box.classList.contains('is-clamped')) {
        btn.hidden = false;
        return;
      }
      btn.hidden = box.scrollHeight <= box.clientHeight + 2;
    });
  }

  function toggleMore(btn, root) {
    const key = btn.dataset.more;
    const open = !ui.rp.more[key];
    ui.rp.more[key] = open;
    const box = root.querySelector(`[data-clamp="${key}"]`);
    if (box) box.classList.toggle('is-clamped', !open);
    btn.textContent = open ? 'Show less' : 'Show more';
    btn.setAttribute('aria-expanded', String(open));
    return open;
  }

  /* evidence at a glance: a square per source, a ring per gap */
  const sourceSquares = (f) =>
    `<span class="bx-squares" aria-hidden="true">${f.sources
      .map(
        (s) =>
          `<i class="${s.kind === 'image' ? 'is-image' : s.family === 'Facts' ? 'is-fact' : ''} ${B.isExcluded(s) ? 'is-off' : ''}"></i>`
      )
      .join('')}</span>`;
  const gapDots = (f) =>
    f.gaps.length
      ? `<span class="bx-rings" aria-hidden="true">${f.gaps.map(() => '<i></i>').join('')}</span>`
      : '';

  /* ----------------------------------------------------------- cite popover */

  let pop;
  function popEl() {
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'bx-pop';
      pop.setAttribute('role', 'tooltip');
      (document.querySelector('.app-shell') || document.body).appendChild(pop);
    }
    return pop;
  }

  function showCite(btn) {
    const f = B.fieldById[btn.dataset.citeField];
    if (!f) return;
    const src = f.cites[btn.dataset.cite];
    if (!src) return;
    const ex = src.excerpts.find((e) => e.n === btn.dataset.cite);
    const wording = ex && ex.evidence ? B.locatedWording(ex.evidence) : null;
    const text = wording ? `“${wording}”` : ex ? ex.snippet : '';
    const el = popEl();
    el.innerHTML = `
      <div class="bx-pop__head">${glyph(src.kind, 'bx-glyph--sm')}<span>${esc(srcName(src))}</span><span>${esc(src.familyLabel)} · ${esc(btn.dataset.cite)}</span></div>
      <p>${esc(text.length > 220 ? text.slice(0, 218) + '…' : text)}</p>
      ${B.isExcluded(src) ? '<p class="bx-pop__hint">Excluded from this answer</p>' : '<p class="bx-pop__hint">Click to open it in Sources</p>'}`;
    const r = btn.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 32);
    const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), window.innerWidth - w - 16);
    el.style.left = `${left}px`;
    el.style.top = '0px';
    el.classList.add('is-on');
    const h = el.offsetHeight;
    const top = r.top - h - 10 > 12 ? r.top - h - 10 : r.bottom + 10;
    el.style.top = `${top}px`;
  }

  function hideCite() {
    if (pop) pop.classList.remove('is-on');
  }

  function bindCites(slot, onOpen) {
    slot.addEventListener('pointerover', (e) => {
      const btn = e.target.closest('.bx-cite');
      if (btn) showCite(btn);
    });
    slot.addEventListener('pointerout', (e) => {
      if (e.target.closest('.bx-cite')) hideCite();
    });
    slot.addEventListener('focusin', (e) => {
      const btn = e.target.closest('.bx-cite');
      if (btn) showCite(btn);
    });
    slot.addEventListener('focusout', (e) => {
      if (e.target.closest('.bx-cite')) hideCite();
    });
    slot.addEventListener('click', (e) => {
      const btn = e.target.closest('.bx-cite');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      hideCite();
      const f = B.fieldById[btn.dataset.citeField];
      const src = f && f.cites[btn.dataset.cite];
      if (src) onOpen(f, src, btn.dataset.cite);
    });
    if (!bindCites.scrollBound) {
      B.main.addEventListener('scroll', hideCite, { passive: true });
      bindCites.scrollBound = true;
    }
  }

  /* ------------------------------------------------------------ disclosure */

  // toggle a `.bx-disclose` on the live element so both directions animate
  function setDisclose(item, open, opts = {}) {
    if (!item) return;
    const d = opts.disclose || item.querySelector(':scope > .bx-disclose');
    if (open && d) void d.offsetHeight;
    item.classList.toggle('is-open', open);
    const trigger = opts.trigger || item.querySelector('[aria-expanded]');
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
    if (d) d.classList.toggle('is-open', open);
  }

  function flash(el) {
    if (!el) return;
    el.classList.remove('is-flash');
    void el.offsetWidth;
    el.classList.add('is-flash');
    setTimeout(() => el.classList.remove('is-flash'), 1600);
  }

  /* --------------------------------------------------------------- sources */

  function excerptsHtml(f, src) {
    return `<ol class="bx-excerpts">${src.excerpts
      .map((e) => {
        const fact = e.fact && B.factById[e.fact];
        return `
          <li class="bx-excerpt" data-excerpt="${f.id}:${esc(e.n)}">
            <span class="bx-excerpt__n bx-num">${esc(e.n)}</span>
            <div class="bx-excerpt__body">
              ${e.tag ? `<p class="bx-excerpt__tag">${e.tag}</p>` : ''}
              <p class="bx-excerpt__snip">${esc(e.snippet)}</p>
              ${e.evidence ? `<blockquote class="bx-quote">${B.evidenceHtml(e.evidence)}</blockquote>` : ''}
              ${fact ? `<button type="button" class="bx-link bx-link--quiet bx-excerpt__fact" data-open-fact="${fact.id}">${icon('database', 13)}Fact ${String(fact.n).padStart(3, '0')} in Knowledge${icon('arrow-right', 13)}</button>` : ''}
            </div>
          </li>`;
      })
      .join('')}</ol>`;
  }

  function excludeControls(f, src) {
    const rp = ui.rp;
    if (B.isExcluded(src)) {
      return `<div class="bx-excluded">${icon('eye-off', 14)}<span>Excluded from ${esc(f.title)}. The answer no longer cites it.</span><button type="button" class="bx-link" data-act="include" data-src="${src.key}">Undo</button></div>`;
    }
    if (rp.confirm === src.key) {
      return `
        <div class="bx-confirm" role="alertdialog" aria-label="Exclude this source">
          <p><b>Exclude ${esc(srcName(src))} from ${esc(f.title)}?</b> The answer is regenerated without it. The source stays in the index for every other field.</p>
          <div class="bx-confirm__actions">
            <button type="button" class="bx-btn bx-btn--warning bx-btn--xs" data-act="exclude-yes" data-src="${src.key}">Exclude and regenerate</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-act="exclude-no" data-src="${src.key}">Cancel</button>
          </div>
        </div>`;
    }
    return `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-act="exclude" data-src="${src.key}">${icon('eye-off', 13)}Exclude from this answer</button>`;
  }

  function openLink(src, label = 'Open page') {
    const ks = knowledgeSourceFor(src);
    if (!ks) return '';
    return `<a class="bx-btn bx-btn--ghost bx-btn--xs" href="${esc(ks.href)}" target="_blank" rel="noreferrer noopener">${esc(label)}${icon('external', 12)}</a>`;
  }

  // "homecourt.ai/teams" -> "/teams"; the home page keeps its domain
  const shortPath = (path) => String(path || '').replace(/^[^/]+/, '') || String(path || '');

  const srcPath = (src) => {
    const ks = knowledgeSourceFor(src);
    return ks ? shortPath(ks.path) : src.kind === 'image' ? 'image' : '';
  };

  /* Sources as a quiet table: one row per source, its excerpts open in the row.
     `opts.head` shows the column header. */
  function sourcesTable(f, opts = {}) {
    return `
      <div class="bx-srcs" role="table" aria-label="Sources for ${esc(f.title)}">
        ${
          opts.head === false
            ? ''
            : `<div class="bx-srcs__head" role="row">
                <span role="columnheader">Source</span>
                <span role="columnheader">Type</span>
                <span role="columnheader">Cited as</span>
                <span aria-hidden="true"></span>
              </div>`
        }
        ${f.sources.map((s) => sourceRow(f, s, opts)).join('')}
      </div>`;
  }

  function sourceRow(f, s, opts = {}) {
    const open = !!ui.rp.srcOpen[s.key] || ui.rp.confirm === s.key;
    const excluded = B.isExcluded(s);
    const path = srcPath(s);
    return `
      <div class="bx-srcs__item ${open ? 'is-open' : ''} ${excluded ? 'is-excluded' : ''}" data-src-item="${s.key}" role="rowgroup">
        <button type="button" class="bx-srcs__row" role="row" data-act="src-row" data-src="${s.key}" aria-expanded="${open}">
          <span class="bx-srcs__name" role="cell">${glyph(s.kind, 'bx-glyph--sm')}<b>${esc(srcName(s))}</b>${path && path !== 'image' ? `<small>${esc(path)}</small>` : ''}</span>
          <span class="bx-srcs__type" role="cell">${esc(s.familyLabel)}${excluded ? '<span class="bx-pill bx-pill--plain">Excluded</span>' : ''}</span>
          <span class="bx-srcs__cites bx-num" role="cell">${s.excerpts.map((e) => esc(e.n)).join(', ')}</span>
          <span class="bx-srcs__chev" role="cell">${icon('chevron-down', 15)}</span>
        </button>
        <div class="bx-disclose ${open ? 'is-open' : ''}">
          <div>
            <div class="bx-srcs__detail">
              ${s.kind === 'image' ? `<p class="bx-srcs__note">${icon('image', 13)}The image was not part of the capture - the caption below is what the brain read.</p>` : ''}
              ${excerptsHtml(f, s)}
              <div class="bx-srcs__actions">${opts.exclude === false ? '' : excludeControls(f, s)}${excluded || ui.rp.confirm === s.key ? '' : openLink(s)}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // a cite click: open the source's row and flash the excerpt it points at
  function revealExcerpt(scope, f, src, n) {
    ui.rp.srcOpen[src.key] = true;
    const item = scope.querySelector(`[data-src-item="${src.key}"]`);
    if (!item) return;
    setDisclose(item, true, { trigger: item.querySelector('.bx-srcs__row') });
    setTimeout(() => {
      const ex = item.querySelector(`[data-excerpt="${f.id}:${n}"]`) || item;
      ex.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(ex);
    }, 120);
  }

  /* ------------------------------------------------------------------- gaps */

  function gapsHtml(f) {
    if (!f.gaps.length) return '';
    const rp = ui.rp;
    const note = rp.notes[f.id];
    const editing = !!rp.noteOpen[f.id];
    return `
      <div class="bx-gaps">
        <ul class="bx-gaps__list">${f.gaps.map((g) => `<li>${icon('gap', 14)}<span>${esc(g)}</span></li>`).join('')}</ul>
        ${
          editing
            ? `<div class="bx-note">
                <label class="bx-label" for="bx-note-${f.id}">Your note</label>
                <textarea class="bx-textarea" id="bx-note-${f.id}" rows="4" placeholder="What should the brain know about this? It is read on the next regenerate.">${esc(note || '')}</textarea>
                <div class="bx-note__actions">
                  <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-act="note-save" data-field-id="${f.id}">Save note</button>
                  <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-act="note-cancel" data-field-id="${f.id}">Cancel</button>
                </div>
              </div>`
            : note
              ? `<div class="bx-note bx-note--saved">
                  <div class="bx-note__saved-head"><span class="bx-label">Your note</span><button type="button" class="bx-link bx-link--quiet" data-act="note-open" data-field-id="${f.id}">${icon('pencil', 13)}Edit</button></div>
                  <p>${esc(note)}</p>
                </div>`
              : `<div class="bx-gaps__actions">
                  <span>Fill a gap with a source or a note.</span>
                  <button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-act="add-source">${icon('upload', 13)}Add a source</button>
                  <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-act="note-open" data-field-id="${f.id}">${icon('pencil', 13)}Write it down</button>
                </div>`
        }
      </div>`;
  }

  /* ------------------------------------------------------------ regenerate */

  function regenButton(f, opts = {}) {
    const running = ui.rp.running[f.id] != null;
    const label = opts.label || 'Regenerate';
    if (running)
      return `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs is-busy" disabled><span class="bx-spinner" aria-hidden="true"></span>Regenerating…</button>`;
    return `<button type="button" class="bx-btn ${opts.secondary ? 'bx-btn--secondary' : 'bx-btn--ghost'} bx-btn--xs ${opts.cls || ''}" data-act="regen" data-field-id="${f.id}" title="Rebuild this answer from the current index">${icon('refresh', 13)}${opts.iconOnly ? '' : esc(label)}</button>`;
  }

  function runningStrip(f) {
    const p = ui.rp.running[f.id];
    const n = f.sources.filter((s) => !B.isExcluded(s)).length;
    if (p == null) {
      return ui.rp.regenerated[f.id]
        ? `<p class="bx-regenerated">${icon('check', 13)}Regenerated just now from ${B.plural(n, 'source')}</p>`
        : '';
    }
    return `<div class="bx-running" role="status"><span class="bx-running__text">Re-reading ${B.plural(n, 'source')}…</span><span class="bx-running__track"><span style="width:${Math.round(p * 100)}%"></span></span></div>`;
  }

  /* one handler for the report actions every version shares */
  function handleReportAction(e, slot, rerender) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return false;
    const rp = ui.rp;
    const act = btn.dataset.act;
    const fieldId =
      btn.dataset.fieldId ||
      (btn.dataset.src ? btn.dataset.src.split(':')[0] : null) ||
      (btn.closest('[data-field]') || {}).dataset?.field;
    switch (act) {
      case 'src-row': {
        const key = btn.dataset.src;
        const open = !rp.srcOpen[key];
        rp.srcOpen[key] = open;
        if (!open && rp.confirm === key) rp.confirm = null;
        setDisclose(btn.closest('.bx-srcs__item'), open, { trigger: btn });
        return true;
      }
      case 'exclude':
        rp.confirm = btn.dataset.src;
        rerender(fieldId);
        return true;
      case 'exclude-no':
        rp.confirm = null;
        rerender(fieldId);
        return true;
      case 'exclude-yes':
        rp.excluded[btn.dataset.src] = true;
        rp.confirm = null;
        B.regenerate([fieldId]);
        rerender(fieldId);
        return true;
      case 'include':
        delete rp.excluded[btn.dataset.src];
        rerender(fieldId);
        return true;
      case 'note-open':
        rp.noteOpen[fieldId] = true;
        rerender(fieldId);
        setTimeout(() => {
          const t = slot.querySelector(`#bx-note-${fieldId}`);
          if (t) t.focus();
        }, 30);
        return true;
      case 'note-cancel':
        rp.noteOpen[fieldId] = false;
        rerender(fieldId);
        return true;
      case 'note-save': {
        const t = slot.querySelector(`#bx-note-${fieldId}`);
        const v = t ? t.value.trim() : '';
        if (v) rp.notes[fieldId] = v;
        else delete rp.notes[fieldId];
        rp.noteOpen[fieldId] = false;
        rerender(fieldId);
        B.toast(v ? 'Note saved - read on the next regenerate' : 'Note removed');
        return true;
      }
      case 'add-source':
        e.preventDefault();
        B.toast('Opens Library to add a source');
        return true;
      case 'regen':
        /* a plan Brain has just rewritten is not the plan anyone confirmed, so the
           signature comes off and the section asks to be read again */
        if (fieldId === 'roadmap' && B.rmSigned()) {
          B.rmUnsign(
            'Brain rebuilt the plan from the index, so it is not the one that was confirmed.',
            'Brain'
          );
        }
        B.regenerate([fieldId]);
        rerender(fieldId);
        return true;
      default:
        return false;
    }
  }

  /* live progress for a field while it regenerates, without a re-render */
  function bindProgress(slot) {
    const onProgress = (e) => {
      if (!slot.isConnected) {
        document.removeEventListener('brain:progress', onProgress);
        return;
      }
      e.detail.fieldIds.forEach((id) => {
        B.$$(`[data-running="${id}"] .bx-running__track > span`, slot).forEach(
          (bar) => (bar.style.width = `${Math.round(e.detail.p * 100)}%`)
        );
      });
      B.$$('[data-running-all] .bx-running__track > span', slot).forEach(
        (bar) => (bar.style.width = `${Math.round(e.detail.p * 100)}%`)
      );
    };
    document.addEventListener('brain:progress', onProgress);
  }

  /* "Regenerate all" with its inline confirm - the same control in every version */
  function regenAllControl(opts = {}) {
    const runningAll = Object.keys(ui.rp.running).length > 1;
    if (runningAll)
      return `<div class="bx-running" role="status" data-running-all><span class="bx-running__text">Regenerating ${B.fields.length} fields…</span><span class="bx-running__track"><span></span></span></div>`;
    if (ui.rp.allConfirm)
      return `<div class="bx-confirm bx-confirm--inline" role="alertdialog" aria-label="Regenerate all"><p>Rebuild all ${B.fields.length} answers?</p><div class="bx-confirm__actions"><button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-act="all-yes">Regenerate all</button><button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-act="all-no">Cancel</button></div></div>`;
    if (opts.iconOnly)
      return `<button type="button" class="bx-rft__icon" data-act="all" aria-label="Regenerate all" data-tip="Regenerate all · rebuild every answer from the index">${icon('refresh', 15)}</button>`;
    return `<button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-act="all">${icon('refresh', 13)}Regenerate all</button>`;
  }

  // returns true when it handled the click; `after` re-renders what changed
  function handleRegenAll(e, after) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return false;
    const act = btn.dataset.act;
    if (act === 'all') ui.rp.allConfirm = true;
    else if (act === 'all-no') ui.rp.allConfirm = false;
    else if (act === 'all-yes') {
      ui.rp.allConfirm = false;
      B.regenerate(B.fields.map((f) => f.id));
    } else return false;
    after(act);
    return true;
  }

  /* ------------------------------------------------------------- knowledge */

  const evidenceOf = (f) => (f.replaced ? 'replaced' : f.unlocated ? 'unlocated' : 'located');

  // only the exceptions speak; located wording is the default and stays quiet
  function evidenceTag(f, opts = {}) {
    if (f.replaced)
      return `<span class="bx-evi bx-evi--replaced" title="A newer fact replaced this one">${icon('history', 13)}${opts.iconOnly ? '' : 'Replaced'}</span>`;
    if (f.unlocated)
      return `<span class="bx-evi bx-evi--missing" title="The recorded wording is not on the page any more">${icon('search-x', 13)}${opts.iconOnly ? '' : 'Not found'}</span>`;
    return opts.showLocated
      ? `<span class="bx-evi" title="The wording is on the page">${icon('located', 13)}${opts.iconOnly ? '' : 'Located'}</span>`
      : '';
  }

  function factEvidence(fact) {
    if (fact.unlocated) {
      return `<div class="bx-quote bx-quote--unlocated">${icon('search-x', 15)}<p>Recorded from this page as <b>“${esc(fact.recordedAs)}”</b>, but that wording is not on the page as it stands now. Open the page to check it.</p></div>`;
    }
    return `<blockquote class="bx-quote">${B.evidenceHtml(fact.evidence)}</blockquote>`;
  }

  const confText = (fact) =>
    `<span class="bx-conf ${fact.band === 'low' ? 'is-low' : ''} bx-num" title="${fact.band === 'low' ? 'Below 0.85 - shown dimmed' : 'Confidence'}">${fact.confidence.toFixed(2)}</span>`;

  function factUsesHtml(fact) {
    const uses = B.factUses[fact.id];
    if (!uses) return '';
    return uses
      .map(
        (u) =>
          `<button type="button" class="bx-link bx-link--cyan" data-go-field="${u.field.id}">${esc(u.field.title)} <span class="bx-num">[${esc(u.n)}]</span></button>`
      )
      .join('<span class="bx-sep">,</span> ');
  }

  /* what opens under a fact row: the page's wording, then the record */
  function factDetail(fact, opts = {}) {
    const uses = factUsesHtml(fact);
    const rows = [
      opts.source === false
        ? null
        : [
            'Source',
            `<a class="bx-link" href="${esc(fact.src.href)}" target="_blank" rel="noreferrer noopener">${esc(fact.src.short)}<span class="bx-kv__path">${esc(shortPath(fact.src.path))}</span>${icon('external', 12)}</a>`,
          ],
      ['Learned', esc(dates.fmtStamp(fact.learnedAt))],
      [
        'Confidence',
        `${confText(fact)}${fact.band === 'low' ? '<span class="bx-kv__hint">below 0.85</span>' : ''}`,
      ],
      uses ? ['Cited in', uses] : null,
    ].filter(Boolean);
    return `
      <div class="bx-fact">
        <div class="bx-fact__evidence">
          <p class="bx-label">${fact.unlocated ? 'Recorded wording' : 'On the page'}</p>
          ${factEvidence(fact)}
        </div>
        <dl class="bx-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>`;
  }

  /* ---------------------------------------------------------------- tables */

  function sortHeader(cols, sort, dir, attr = 'data-sort') {
    return cols
      .map(([key, label, cls]) => {
        if (!key)
          return `<span class="bx-th ${cls || ''}" role="columnheader">${esc(label)}</span>`;
        const on = sort === key;
        return `<button type="button" class="bx-th bx-th--sort ${on ? 'is-sorted' : ''} ${cls || ''}" role="columnheader" ${attr}="${key}" aria-sort="${on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}">${esc(label)}${icon(on ? (dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrow-up-down', 12)}</button>`;
      })
      .join('');
  }

  function pagerHtml({ total, page, per, attr = 'data-pg', labelled = false, noun = 'fact' }) {
    const pages = Math.max(1, Math.ceil(total / per));
    const start = total ? (page - 1) * per + 1 : 0;
    const end = Math.min(page * per, total);
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (pages <= 7 || i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    if (labelled)
      return `
      <div class="bx-pager bx-pager--labelled">
        <span class="bx-pager__range">${total ? `Showing <b class="bx-num">${start}–${end}</b> of <b class="bx-num">${total}</b> ${B.plural(total, noun).replace(/^\d+ /, '')}` : 'No results'}</span>
        ${
          pages > 1
            ? `<div class="bx-pager__pages">
                <button type="button" class="bx-pager__btn bx-pager__btn--step" ${attr}="${page - 1}" ${page <= 1 ? 'disabled' : ''}>${icon('chevron-left', 14)}Previous</button>
                ${nums
                  .map((n) =>
                    n === '…'
                      ? '<span class="bx-pager__gap">…</span>'
                      : `<button type="button" class="bx-pager__btn bx-num ${n === page ? 'is-on' : ''}" ${attr}="${n}" aria-current="${n === page ? 'page' : 'false'}">${n}</button>`
                  )
                  .join('')}
                <button type="button" class="bx-pager__btn bx-pager__btn--step" ${attr}="${page + 1}" ${page >= pages ? 'disabled' : ''}>Next${icon('chevron-right', 14)}</button>
              </div>`
            : ''
        }
      </div>`;
    return `
      <div class="bx-pager">
        <span class="bx-pager__range bx-num">${total ? `${start}–${end} of ${total}` : 'No results'}</span>
        ${
          pages > 1
            ? `<div class="bx-pager__pages">
                <button type="button" class="bx-pager__btn" ${attr}="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevron-left', 14)}</button>
                ${nums
                  .map((n) =>
                    n === '…'
                      ? '<span class="bx-pager__gap">…</span>'
                      : `<button type="button" class="bx-pager__btn bx-num ${n === page ? 'is-on' : ''}" ${attr}="${n}" aria-current="${n === page ? 'page' : 'false'}">${n}</button>`
                  )
                  .join('')}
                <button type="button" class="bx-pager__btn" ${attr}="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next page">${icon('chevron-right', 14)}</button>
              </div>`
            : ''
        }
      </div>`;
  }

  /* ---------------------------------------------------------------- roadmap */

  const phaseTone = (p) =>
    p.state === 'done' ? 'done' : p.state === 'current' ? 'building' : 'queued';
  const phasePill = (p) =>
    `<span class="bx-pill bx-pill--${phaseTone(p)}">${esc(p.statusLabel)}</span>`;
  const rmClockText = (rm) =>
    rm.before
      ? `Starts ${dates.fmtShort(rm.start)}`
      : rm.after
        ? `Ended ${dates.fmtShort(rm.end)}`
        : `Day ${rm.day} of ${rm.horizon}`;
  const phaseDates = (p) => `${dates.fmtShort(p.start)} – ${dates.fmtShort(p.end)}`;
  const phaseWhen = (rm, p) =>
    p.state === 'current'
      ? `${B.plural(p.left, 'day')} left`
      : p.state === 'upcoming'
        ? `Starts in ${B.plural(dates.diffDays(rm.today, p.start), 'day')}`
        : `Ended ${dates.fmtShort(p.end)}`;
  const todayPct = (rm) => Math.max(0, Math.min(100, ((rm.dayRaw - 0.5) / rm.horizon) * 100));
  function monthTicks(rm) {
    const ticks = [];
    for (let d = 1; d < rm.horizon; d++) {
      const iso = dates.addDays(rm.start, d);
      if (iso.endsWith('-01'))
        ticks.push({ pct: (d / rm.horizon) * 100, label: dates.fmtShort(iso).split(' ')[0] });
    }
    return ticks;
  }

  // the four records the approval wrote, by key: marketing / kpis / phases / strategy
  const rmField = (rm, key) => rm.fields.find((f) => f.key === key);
  const confirmedPill = () => `<span class="bx-pill bx-pill--done">Confirmed</span>`;
  const approvedText = (rm) =>
    rm.strategy.approvedAt
      ? `Approved ${dates.fmtShort(rm.strategy.approvedAt)} by ${rm.strategy.approvedBy}`
      : `Drafted ${dates.fmtShort(rm.strategy.suggestedAt)} - not approved`;

  // each record type keeps one icon in every version, so the four read as a set
  const RM_ICON = { marketing: 'flag', kpis: 'gauge', phases: 'milestone', strategy: 'located' };
  const rmHeading = (rm, key, opts = {}) =>
    `<h4 class="bx-rmh ${opts.cls || ''}"><span class="bx-rmh__icon bx-rmh__icon--${key}" aria-hidden="true">${icon(RM_ICON[key], opts.size || 15)}</span><span class="bx-rmh__label">${esc(rmField(rm, key).label)}</span>${opts.key ? `<span class="bx-key">${esc(rmField(rm, key).path)}</span>` : ''}${opts.after || ''}</h4>`;

  // the numbered marker that ties a phase to its KPI wherever either appears
  const phaseMarker = (p, cls = '') =>
    `<span class="bx-pm bx-pm--${p.state} ${cls}" aria-hidden="true">${p.index + 1}</span>`;

  const avatar = (rm, size = 24) =>
    `<img class="bx-avatar" src="${esc(rm.strategy.approverAvatar)}" width="${size}" height="${size}" alt="">`;
  const approverChip = (rm, opts = {}) => `
    <span class="bx-approver">
      ${avatar(rm, opts.size || 28)}
      <span class="bx-approver__text"><b>${esc(rm.strategy.approvedBy || 'Nobody yet')}</b><small class="bx-num">${rm.strategy.approvedAt ? `approved ${esc(rm.strategy.version)} · ${dates.fmtShort(rm.strategy.approvedAt)}` : `drafted · ${dates.fmtShort(rm.strategy.suggestedAt)}`}</small></span>
      ${opts.pill === false ? '' : confirmedPill()}
    </span>`;

  // the approval as a sentence: who approved, and when
  const approvedBy = (rm, opts = {}) => `
    <span class="bx-approver bx-approver--line">
      ${avatar(rm, opts.size || 28)}
      <span class="bx-approver__text"><b>${rm.strategy.approvedBy ? `Approved by ${esc(rm.strategy.approvedBy)}` : 'Not approved yet'}</b><small class="bx-num">${dates.fmtShort(rm.strategy.approvedAt || rm.strategy.suggestedAt)} · ${esc(rm.strategy.name)} ${esc(rm.strategy.version)}</small></span>
      ${opts.pill === false ? '' : confirmedPill()}
    </span>`;

  /* The plan's dated axis: a major tick where each phase starts and where the plan
     ends, labelled with the date, and a minor tick each week between them. */
  function axisTicks(rm) {
    const major = [
      ...rm.phases.map((p) => ({
        pct: ((p.days[0] - 1) / rm.horizon) * 100,
        label: dates.fmtShort(p.start),
      })),
      { pct: 100, label: dates.fmtShort(rm.end), end: true },
    ];
    const minor = [];
    for (let d = 7; d < rm.horizon; d += 7) {
      const pct = (d / rm.horizon) * 100;
      if (!major.some((m) => Math.abs(m.pct - pct) < 2)) minor.push(pct);
    }
    return { major, minor };
  }

  // the calendar months a plan crosses, as bands across its width
  function monthBands(rm) {
    const out = [];
    let d = 0;
    while (d < rm.horizon) {
      const iso = dates.addDays(rm.start, d);
      const label = dates.fmtShort(iso).split(' ')[0];
      const start = d;
      while (d < rm.horizon && dates.fmtShort(dates.addDays(rm.start, d)).split(' ')[0] === label)
        d++;
      out.push({
        label,
        left: (start / rm.horizon) * 100,
        width: ((d - start) / rm.horizon) * 100,
      });
    }
    return out;
  }

  const axisHtml = (rm, cls) => {
    const { major, minor } = axisTicks(rm);
    return `
      <div class="bx-axis ${cls || ''}" aria-hidden="true">
        ${minor.map((pct) => `<i class="bx-axis__minor" style="left:${pct.toFixed(2)}%"></i>`).join('')}
        ${major
          .map(
            (m, i) =>
              `<span class="bx-axis__major ${i === 0 ? 'is-start' : ''} ${m.end ? 'is-end' : ''}" style="left:${m.pct.toFixed(2)}%"><b class="bx-num">${esc(m.label)}</b></span>`
          )
          .join('')}
      </div>`;
  };

  /* ------------------------------------------------------- roadmap hosting */

  /* Roadmap designs are chosen apart from report designs, so a report only hosts
     one: as a section above its fields, or as the body of a pane (Report F). The
     roadmap view renders into `[data-roadmap-host]` and owns every click in it. */

  function roadmapSection(ctx) {
    const V = B.roadmapView();
    if (!V) return '';
    const rm = B.roadmapAt(B.state.today);
    return `
      <section class="bx-rmsec" aria-labelledby="bx-rmsec-title">
        <header class="bx-sechead">
          <div>
            <h2 class="bx-sechead__title" id="bx-rmsec-title">Roadmap</h2>
            <p class="bx-sechead__sub">${esc(rm.strategy.name)} · <span data-rm-clock>${esc(rmClockText(rm))}</span></p>
          </div>
        </header>
        <div class="bx-card bx-rmhost ${V.cardClass || ''}" data-field="roadmap" data-roadmap-host>${V.render(ctx, { host: 'card' })}</div>
      </section>`;
  }

  function roadmapPane(ctx) {
    const V = B.roadmapView();
    if (!V) return '';
    return `
      <div class="bx-rmhost bx-rmhost--pane ${V.cardClass || ''}" data-field="roadmap" data-roadmap-host>${V.render(ctx, { host: 'pane' })}</div>`;
  }

  function mountRoadmap(scope, ctx) {
    const V = B.roadmapView();
    if (!V) return;
    B.$$('[data-roadmap-host]', scope).forEach((host) => {
      host.addEventListener('click', (e) => {
        /* the phase you are reading: the one running is open to start with, the one
           you pick replaces it, and picking the open one again puts the card away
           and gives the months the whole width */
        const ph = e.target.closest('[data-rm-pick]');
        if (ph) {
          const i = Number(ph.dataset.rmPick);
          const rm = B.roadmapAt(B.state.today);
          const run = rm.current || rm.next || rm.phases[rm.phases.length - 1];
          const openAt = B.ui.rp.rmPick === undefined ? (run ? run.index : null) : B.ui.rp.rmPick;
          B.ui.rp.rmPick = openAt === i ? null : i;
          if (!(V.repick && V.repick(host, ctx))) repaintRoadmap(host, ctx);
          return;
        }
        const btn = e.target.closest('[data-rm-src]');
        if (!btn) return;
        const src = btn.dataset.rmSrcPhase;
        openRmSources(B.roadmapAt(B.state.today), src != null ? Number(src) : null);
      });
      host.addEventListener('keydown', (e) => {
        const ph = e.target.closest && e.target.closest('[data-rm-pick]');
        if (!ph || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        ph.click();
      });
      if (V.mount) V.mount(host, ctx);
    });
  }

  // the plan is drawn again in place, without the page around it moving
  function repaintRoadmap(host, ctx) {
    const V = B.roadmapView();
    if (!V) return;
    host.innerHTML = V.render(ctx, { host: 'pane' });
    if (V.mount) V.mount(host, ctx);
  }

  function roadmapDate(scope, ctx) {
    const rm = B.roadmapAt(B.state.today);
    B.$$('[data-rm-clock]', scope).forEach((el) => (el.textContent = rmClockText(rm)));
    const V = B.roadmapView();
    if (!V || !V.onDate) return;
    B.$$('[data-roadmap-host]', scope).forEach((host) => V.onDate(host, ctx));
  }

  // a report ignores clicks its roadmap handles
  const inRoadmap = (e) => !!e.target.closest('[data-roadmap-host]');

  /* The roadmap's supporting sources, shaped like a report field's so every
     version shows them with the same sources table: the approval record, the
     onboarding answer it grew from, and the Knowledge facts each phase rests on. */
  let rmSources = null;
  function roadmapField(rm) {
    if (rmSources) return rmSources;
    let n = 0;
    const st = rm.strategy;
    const sources = [
      {
        title: `${st.name} ${st.version}`,
        family: 'Decision',
        familyLabel: 'Approved strategy',
        kind: 'decision',
        excerpts: [
          {
            n: String(++n),
            snippet: `${approvedText(rm)} - confirms the marketing goal, the KPI and the phases.`,
          },
        ],
      },
      {
        title: 'Your 90-day goal',
        family: 'Answer',
        familyLabel: 'Onboarding answer',
        kind: 'answer',
        excerpts: [
          {
            n: String(++n),
            snippet: `“${st.answer}” - the three objectives were drafted from this answer on ${dates.fmtShort(st.suggestedAt)}.`,
          },
        ],
      },
    ];
    const byPage = {};
    rm.phases.forEach((p) =>
      (p.facts || []).forEach((id) => {
        const fact = B.factById[id];
        if (!fact) return;
        if (!byPage[fact.source]) {
          byPage[fact.source] = {
            title: fact.src.title,
            family: 'Facts',
            familyLabel: 'Fact',
            kind: 'page',
            excerpts: [],
          };
          sources.push(byPage[fact.source]);
        }
        byPage[fact.source].excerpts.push({
          n: String(++n),
          snippet: fact.statement,
          evidence: fact.evidence,
          fact: fact.id,
          // a neutral marker: the list is built once, the phase states move with the date
          tag: `<span class="bx-pm bx-pm--sm" aria-hidden="true">${p.index + 1}</span>${esc(p.name)}`,
        });
      })
    );
    sources.forEach((src, i) => (src.key = `roadmap:${i}`));
    rmSources = { id: 'roadmap', title: 'Roadmap', sources };
    return rmSources;
  }

  /* ------------------------------------------------- the roadmap's own top

     The roadmap is not a report field, so it does not wear one's header. Its top
     is a plan banner: when the plan runs, the goal with its figure and deadline
     set apart, when it was last edited - and, on the right, what the plan rests
     on, which opens in its own sheet rather than a report-style sources table. */
  /* the goal, figure-led: the number large on its own, the rest a quiet line beside
     it (the three styles were settled on this one in round 21) */
  const rmGoalHtml = (rm) => {
    const m = rm.marketing;
    const goal = m.goal;
    const fig = `${m.figure} ${m.unit}`;
    const i = goal.indexOf(fig);
    const j = goal.lastIndexOf(m.by);
    if (i < 0 || j < 0) return `<span class="bx-rmg">${esc(goal)}</span>`;
    const between = goal.slice(i + fig.length, j);
    const after = goal.slice(j + m.by.length);
    return `<span class="bx-rmg bx-rmg--figure"><span class="bx-rmg__fig bx-num">${esc(m.figure)}</span><span class="bx-rmg__line"><b>${esc(m.unit)}</b>${esc(between)}<b class="bx-num">${esc(m.by)}</b>${esc(after)}</span></span>`;
  };

  // the phase hues every roadmap draws with: launch teal, then violet, then indigo
  const RM_HUES = ['#0ea5b8', '#8b5cf6', '#4f46e5'];

  // how many sources the plan rests on - each design says it its own way
  const rmSourceCount = (rm) => roadmapField(rm).sources.length;

  // the plan's run, as a small label led by a calendar
  const rmKicker = (rm, cls = '') =>
    `<p class="bx-rmt__kicker ${cls}">${icon('calendar', 12)}${rm.horizon}-day plan<span class="bx-sep">·</span><span class="bx-num">${dates.fmtShort(rm.start)} – ${dates.fmtShort(rm.end)}</span></p>`;

  /* What the plan rests on, in its own sheet - drawn as the plan's own chain: the
     approval that confirmed it, the answer it was drafted from, then each phase
     with the facts it rests on, every fact opening in Knowledge. */
  function rmSourcesSheet(rm, focusPhase) {
    const rf = roadmapField(rm);
    const nFacts = rm.phases.reduce((n, p) => n + p.facts.filter((id) => B.factById[id]).length, 0);
    const step = (cls, node, head, body, attrs = '') => `
      <li class="bx-rms__step ${cls}" ${attrs}>
        <span class="bx-rms__node" aria-hidden="true">${node}</span>
        <div class="bx-rms__shead">${head}</div>
        ${body}
      </li>`;
    return `
      <div class="bx-drawer__scrim" data-rms-close></div>
      <aside class="bx-drawer__sheet bx-rms" role="dialog" aria-modal="true" aria-labelledby="bx-rms-title">
        <header class="bx-drawer__head">
          <p class="bx-label" id="bx-rms-title">What this plan rests on</p>
          <div class="bx-drawer__nav">
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-rms-close aria-label="Close">${icon('x', 15)}</button>
          </div>
        </header>
        <div class="bx-drawer__body bx-rms__body">
          <div class="bx-rms__top">
            ${rmKicker(rm)}
            <p class="bx-rms__goal">${rmGoalHtml(rm)}</p>
            <p class="bx-rms__sum bx-num">${B.plural(rf.sources.length, 'source')}<span class="bx-sep">·</span>an approval, an answer and ${B.plural(nFacts, 'fact')}</p>
          </div>
          <ol class="bx-rms__chain">
            ${step(
              'bx-rms__step--decision',
              icon('check', 12),
              `<b>The approval</b><span class="bx-pill bx-pill--done">Confirmed</span>`,
              `<div class="bx-rms__card">
                 <div class="bx-rms__who">
                   <img class="bx-avatar" src="${esc(rm.strategy.approverAvatar)}" width="28" height="28" alt="">
                   <p><b>${esc(rm.strategy.approvedBy || 'Nobody yet')}</b><small class="bx-num">${esc(rm.strategy.name)} ${esc(rm.strategy.version)} · ${dates.fmtShort(rm.strategy.approvedAt || rm.strategy.suggestedAt)}</small></p>
                 </div>
                 <p class="bx-rms__note">Confirms the marketing goal, the KPI and the ${B.plural(rm.phases.length, 'phase')}.</p>
               </div>`
            )}
            ${step(
              'bx-rms__step--answer',
              icon('ask', 12),
              `<b>The answer it was drafted from</b><span class="bx-rms__when bx-num">Onboarding · ${dates.fmtShort(rm.strategy.suggestedAt)}</span>`,
              `<blockquote class="bx-rms__quote">${esc(rm.strategy.answer)}</blockquote>`
            )}
            ${rm.phases
              .map((p) =>
                step(
                  `bx-rms__step--phase is-${p.state} ${focusPhase === p.index ? 'is-focus' : ''}`,
                  `<span class="bx-num">${p.index + 1}</span>`,
                  `<b>${esc(p.name)}</b><span class="bx-rms__when bx-num">${phaseDates(p)}</span>`,
                  `<ul class="bx-rms__facts">${p.facts
                    .map((id) => {
                      const f = B.factById[id];
                      return f
                        ? `<li class="bx-rms__fact">
                             <p>${esc(f.statement)}</p>
                             <div class="bx-rms__fmeta">${srcCell(f)}<button type="button" class="bx-rms__open" data-rms-fact="${f.id}">Open in Knowledge${icon('arrow-right', 12)}</button></div>
                           </li>`
                        : '';
                    })
                    .join('')}</ul>`,
                  `data-rms-phase="${p.index}" style="--hue:${RM_HUES[p.index % RM_HUES.length]}"`
                )
              )
              .join('')}
          </ol>
        </div>
      </aside>`;
  }

  function openRmSources(rm, focusPhase) {
    document.querySelectorAll('.bx-drawer--rms').forEach((el) => el.remove());
    const wrap = document.createElement('div');
    wrap.className = 'bx-drawer bx-drawer--rms';
    wrap.innerHTML = rmSourcesSheet(rm, focusPhase);
    (document.querySelector('.app-shell') || document.body).appendChild(wrap);
    const sheet = wrap.querySelector('.bx-drawer__sheet');
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        wrap.querySelector('.bx-drawer__scrim'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );
      gsap.fromTo(
        sheet,
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
    if (focusPhase != null) {
      const sec = wrap.querySelector(`[data-rms-phase="${focusPhase}"]`);
      if (sec) setTimeout(() => sec.scrollIntoView({ block: 'start' }), 40);
    }
    const close = () => wrap.remove();
    const btn = wrap.querySelector('[data-rms-close].bx-btn');
    if (btn) btn.focus();
    wrap.addEventListener('click', (e) => {
      if (e.target.closest('[data-rms-close]')) {
        close();
        return;
      }
      const f = e.target.closest('[data-rms-fact]');
      if (f) {
        close();
        B.openFact(f.dataset.rmsFact);
      }
    });
    const onKey = (e) => {
      if (!wrap.isConnected) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
  }

  /* ---------------------------------------------- knowledge cells, round 12

     Every Knowledge table has the same five columns - Statement, Kind, Source,
     Conf., Learned - and draws two of them the same way everywhere: the kind as a
     light label with its icon, and the source in whichever of three cells is
     picked (Versions → Source cell). */

  // the kind: its icon and its name on a light wash of its hue
  const kindCell = (f) =>
    `<span class="bx-klabel bx-kav--${esc(f.kind)}">${icon(KIND_ICON[f.kind] || 'fact', 12)}${esc(kindLabel(f.kind))}</span>`;

  /* every source is a page on the brand's own site, so each wears the site's icon
     and is told apart by its page name */
  const SITE_ICON = 'assets/brand/logo.webp';
  const siteIcon = (cls = 'bx-sc__fav', size = 16) =>
    `<img class="${cls}" src="${SITE_ICON}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async">`;

  // the source: the page as a pill, with the site's icon
  function srcCell(f) {
    const attrs = `href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener" title="${esc(f.src.title)} · ${esc(f.src.path)}"`;
    return `<a class="bx-sc bx-sc--pill" ${attrs}>${siteIcon()}<span class="bx-sc__name">${esc(f.src.short)}</span></a>`;
  }

  /* the same pill with nowhere to go: in a table a field can rest on several
     sources, so the cell says which and the sheet is where they are read */
  function srcCellFlat(f) {
    return `<span class="bx-sc bx-sc--pill is-flat">${siteIcon()}<span class="bx-sc__name">${esc(f.src.short)}</span></span>`;
  }

  /* ---------------------------------------------- the words that carry it

     A text marks its most important few words - whatever kind they are - in the hue
     of the kind of fact they belong to, and a hover says what each one is (a
     feature, an offer, a price, who it is for, a promise, the proof behind one...).
     In Knowledge F's statements, Knowledge D's (while its filters are folded) and
     the report's answers. The words and their kinds are written for the prototype
     in keywords.js (the product would take them from the extraction). */
  const KW = window.BRAIN_KEYWORDS || { types: {}, facts: {}, answers: {} };
  const ENT_BY = KW.types;
  // a text carries two marks at most
  const MAX_MARKS = 2;

  // a text's key phrases, placed: the first occurrence of each, none overlapping
  function placeKeys(text, keys) {
    const out = [];
    keys.forEach(([ph, type]) => {
      if (!ENT_BY[type]) return;
      let from = 0;
      let at;
      while ((at = text.indexOf(ph, from)) >= 0) {
        const b = at + ph.length;
        if (!out.some((h) => at < h.b && b > h.a)) {
          out.push({ a: at, b, type, ph });
          break;
        }
        from = at + 1;
      }
    });
    return out.sort((p, q) => p.a - q.a);
  }
  const markSpan = (text, type) =>
    `<mark class="bx-ent bx-kav--${ENT_BY[type].kind}" data-ent="${type}">${esc(text)}</mark>`;

  function markedStatement(f) {
    const text = f.statement;
    let out = '';
    let at = 0;
    placeKeys(text, KW.facts[f.id] || [])
      .slice(0, MAX_MARKS)
      .forEach((h) => {
        out += esc(text.slice(at, h.a)) + markSpan(text.slice(h.a, h.b), h.type);
        at = h.b;
      });
    return out + esc(text.slice(at));
  }

  /* any text, marked with the phrases given - the fields' values use the phrases
     curated for the facts they rest on, so a value is marked the way the fact it
     came from is */
  function markTextHtml(text, keys, max = MAX_MARKS) {
    let out = '';
    let at = 0;
    placeKeys(text, keys)
      .slice(0, max)
      .forEach((h) => {
        out += esc(text.slice(at, h.a)) + markSpan(text.slice(h.a, h.b), h.type);
        at = h.b;
      });
    return out + esc(text.slice(at));
  }

  // the key phrases of a set of facts, in the order the facts are given
  const keysOfFacts = (ids) =>
    (ids || []).flatMap((id) => KW.facts[id] || []).filter(([ph]) => ph && ph.length > 2);

  // the bubble: one, in the shell, placed over whichever mark is hovered
  let entTip = null;
  function showEntTip(mark) {
    const e = ENT_BY[mark.dataset.ent];
    if (!e) return;
    if (!entTip) {
      entTip = document.createElement('div');
      entTip.className = 'bx-entip';
      entTip.setAttribute('role', 'tooltip');
      (document.querySelector('.app-shell') || document.body).appendChild(entTip);
    }
    entTip.className = `bx-entip bx-kav--${e.kind}`;
    entTip.innerHTML = `<span class="bx-entip__icon">${icon(e.icon, 13)}</span><span class="bx-entip__text"><b>${esc(e.label)}</b><small>${esc(e.hint)}</small></span>`;
    entTip.hidden = false;
    const r = mark.getBoundingClientRect();
    const w = entTip.offsetWidth;
    const h = entTip.offsetHeight;
    const below = r.top - h - 10 < 8;
    entTip.dataset.side = below ? 'below' : 'above';
    const left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    entTip.style.left = `${Math.round(left)}px`;
    entTip.style.top = `${Math.round(below ? r.bottom + 10 : r.top - h - 10)}px`;
    entTip.style.setProperty('--tail', `${Math.round(r.left + r.width / 2 - left)}px`);
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.killTweensOf(entTip);
      gsap.fromTo(
        entTip,
        { autoAlpha: 0, y: below ? -3 : 3 },
        { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }
      );
    }
  }
  function hideEntTip() {
    if (entTip) entTip.hidden = true;
  }
  if (!window.__bxEntBound) {
    window.__bxEntBound = true;
    document.addEventListener('mouseover', (e) => {
      const m = e.target.closest && e.target.closest('.bx-ent');
      if (m) showEntTip(m);
    });
    document.addEventListener('mouseout', (e) => {
      const m = e.target.closest && e.target.closest('.bx-ent');
      if (m && !(e.relatedTarget && m.contains(e.relatedTarget))) hideEntTip();
    });
    document.addEventListener('brain:scroll', hideEntTip);
    document.addEventListener('brain:render', hideEntTip);
    document.addEventListener('click', hideEntTip, true);
  }

  /* The key to the marks: what they are, that a hover names each one, and a small
     control to put them away - the same switch J is. */
  const entKey = () =>
    `<p class="bx-entkey"><span class="bx-entkey__sample" aria-hidden="true">key words</span>hover one to see what it is<button type="button" class="bx-entkey__off" data-marks-toggle aria-pressed="${!B.marksAreOff()}" aria-label="Show or hide the key words" data-tip="Key words \u00b7 turn the marks off and back on (or press J)">${icon('eye-off', 14)}</button></p>`;

  if (!window.__bxMarksBound) {
    window.__bxMarksBound = true;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('[data-marks-toggle]');
      if (btn) B.toggleMarks(B.marksAreOff());
    });
  }

  /* An answer marks its key phrases in its own text only - never inside a citation
     or a link - and never more than two to an answer. `within` keeps the marks
     to the parts of the answer that should carry them. Prose's own phrase marks
     give way to these, so the two never add up. */
  function markEntitiesHtml(html, opts = {}) {
    const keys = KW.answers[opts.id] || [];
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('mark.bx-hl').forEach((mk) => mk.replaceWith(...mk.childNodes));
    tpl.content.normalize();
    if (!keys.length) return tpl.innerHTML;
    const within = opts.within || null;
    const done = new Set();
    // how many marks the answer already carries - two at most in all its paragraphs
    const used = new Map();
    const blockOf = () => tpl;
    const nodes = [];
    const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.nodeValue.trim()) continue;
      if (within && !el.closest(within)) continue;
      if (el.closest('button, a, mark, .bx-cite, .bx-ent')) continue;
      nodes.push(n);
    }
    nodes.forEach((n) => {
      const block = blockOf(n.parentElement);
      const room = MAX_MARKS - (used.get(block) || 0);
      const left = keys.filter(([ph]) => !done.has(ph));
      if (room <= 0 || !left.length) return;
      const text = n.nodeValue;
      const hits = placeKeys(text, left).slice(0, room);
      if (!hits.length) return;
      used.set(block, (used.get(block) || 0) + hits.length);
      const frag = document.createDocumentFragment();
      let at = 0;
      hits.forEach((h) => {
        if (h.a > at) frag.appendChild(document.createTextNode(text.slice(at, h.a)));
        const mk = document.createElement('mark');
        mk.className = `bx-ent bx-kav--${ENT_BY[h.type].kind}`;
        mk.dataset.ent = h.type;
        mk.textContent = text.slice(h.a, h.b);
        frag.appendChild(mk);
        done.add(h.ph);
        at = h.b;
      });
      if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
      n.parentNode.replaceChild(frag, n);
    });
    return tpl.innerHTML;
  }

  /* ---------------------------------------------- confidence

     The number always, and its band as three rising bars filled to it - facts sit
     between 0.78 and 0.99, so a length barely moves; the band is what reads. */
  const BAND_TITLE = {
    high: 'high - 0.90 and above',
    medium: 'medium - 0.85 to 0.89',
    low: 'low - below 0.85, shown dimmed',
  };
  function confCell(f) {
    const t = `title="Confidence ${f.confidence.toFixed(2)} · ${BAND_TITLE[f.band] || ''}"`;
    return `<span class="bx-cc bx-cc--sig is-${f.band}" ${t}><span class="bx-cc__sig" aria-hidden="true"><i></i><i></i><i></i></span><b class="bx-num">${f.confidence.toFixed(2)}</b></span>`;
  }

  /* --------------------------------------------- knowledge records, shared

     Both Knowledge versions open a fact the same way: the statement, three
     coloured chips (kind, confidence, wording), the page itself as a small
     browser window with the wording marked, and the facts about the fact. */

  // a fact's source is a page - so it reads and works as a link
  const srcLink = (f) =>
    `<a class="bx-srclink" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener" title="${esc(f.src.title)} · ${esc(f.src.path)}"><span class="bx-srclink__name">${esc(f.src.short)}</span>${icon('external', 11)}</a>`;

  /* ------------------------------------------------ the page it came from

     A fact's page as a small browser window: a Mac bar (the three coloured dots,
     the address, a way out to the page), the page itself, and at the foot whether
     the wording is still there. The page is small - a glance at where the wording
     sits, not a copy of the site - and is rebuilt from the passage the index kept:
     its shouting lines as headings, the rest as text, the wording marked. The
     page's link and button labels (a line that ends in an arrow) are left out:
     nothing here can be pressed, so nothing may look as if it could. Three designs
     (Versions → Captured page):
       1 Site  the site's own dark bar (its logo, a sketch of its menu), the page's
               heading, then the passage
       2 Hero  a short band of the brand's own imagery with the heading over it,
               the passage under it
       3 Crop  a clip of the page: it runs on above and below, faded, a scrollbar
               at its edge; the wording in full ink, the rest dimmed
     Nothing on the page is invented: every word is the passage's own, and the
     menu is only a sketch. */

  const ARROWS = new Set(['⟩', '❯', '▸', '→', '›', '»']);
  const isShout = (w) => /[A-Z]/.test(w) && !/[a-z]/.test(w);
  const endsSentence = (w) => /[.!?:]["”’)]?$/.test(w);

  // the passage as blocks: { t: 'h' | 'cta' | 'p', words: [{ w, mark }] }
  function pageBlocks(evidence) {
    // words, the located wording kept whole; `glue` - no space before it
    const words = [];
    let open = true;
    String(evidence || '')
      .split(/(⟦[\s\S]*?⟧)/)
      .forEach((part) => {
        if (!part) return;
        if (part.startsWith('⟦')) {
          words.push({ w: part.slice(1, -1), mark: true, glue: !open });
          open = false;
          return;
        }
        part
          .split(/\s+/)
          .filter(Boolean)
          .forEach((w, k) => words.push({ w, glue: k === 0 && !open && !/^\s/.test(part) }));
        open = /\s$/.test(part);
      });
    const blocks = [];
    let para = [];
    const flush = () => {
      if (para.length) blocks.push({ t: 'p', words: para });
      para = [];
    };
    for (let i = 0; i < words.length; i++) {
      const cur = words[i];
      if (!cur.mark && ARROWS.has(cur.w)) {
        // a button: the words since the sentence began, a few at most
        let from = para.length;
        while (from > 0 && !para[from - 1].mark && !endsSentence(para[from - 1].w)) from--;
        let label = para.slice(from);
        if (label.length > 5) label = label.slice(-2);
        para = para.slice(0, para.length - label.length);
        flush();
        if (label.length) blocks.push({ t: 'cta', words: label });
        continue;
      }
      // a heading: two or more shouting words in a row
      let j = i;
      while (j < words.length && !words[j].mark && isShout(words[j].w)) j++;
      if (j - i >= 2) {
        flush();
        const run = words.slice(i, j);
        // a run that ends in an arrow is a button; one that stops at a full stop
        // inside splits into a kicker and its heading
        if (j < words.length && ARROWS.has(words[j].w)) {
          blocks.push({ t: 'cta', words: run });
          i = j;
          continue;
        }
        let part = [];
        run.forEach((w, k) => {
          part.push(w);
          if (endsSentence(w.w) && k < run.length - 1) {
            blocks.push({ t: 'h', words: part });
            part = [];
          }
        });
        if (part.length) blocks.push({ t: 'h', words: part });
        i = j - 1;
        continue;
      }
      para.push(cur);
    }
    flush();
    return blocks;
  }

  function blocksHtml(all) {
    // a page's buttons cannot be pressed here, so they are not drawn
    const blocks = all.filter((b) => b.t !== 'cta');
    const text = (ws) =>
      ws
        .map(
          (x, k) =>
            (k && !x.glue ? ' ' : '') +
            (x.mark ? `<mark class="bx-browser__mark">${esc(x.w)}</mark>` : esc(x.w))
        )
        .join('');
    return blocks
      .map((b, i) => {
        if (b.t === 'h') {
          // a heading straight before another reads as its kicker
          const kicker = blocks[i + 1] && blocks[i + 1].t === 'h';
          return `<p class="${kicker ? 'bx-pg__kicker' : 'bx-pg__h'}">${text(b.words)}</p>`;
        }
        let html = text(b.words);
        // the passage was cut from a longer page: say so where it runs on
        if (i === 0 && /^[a-z(,;]/.test(b.words[0].w)) html = `… ${html}`;
        if (i === blocks.length - 1 && !endsSentence(b.words[b.words.length - 1].w)) html += ' …';
        return `<p class="bx-pg__p">${html}</p>`;
      })
      .join('');
  }

  // the page's own heading, as its title bar names it
  const pageTitle = (f) => String(f.src.title || f.src.short).replace(/ — HomeCourt$/, '');

  // the brand's own imagery, one picture per page of its site
  const PAGE_IMG = {
    '38177a73': 'img-08',
    '77138b8b': 'img-06',
    '218f705e': 'img-07',
    21830774: 'img-05',
    '308fca75': 'img-03',
    ebd6c429: 'img-03',
    '11dcc065': 'img-01',
    baa50449: 'img-06',
  };

  /* the page a fact came from, rebuilt from its own passage: the brand's picture
     with the page's heading over it, then the passage in its place (Hero, settled
     in round 22 - the Site and Crop designs were dropped) */
  function pageHtml(f) {
    const body = f.unlocated
      ? `<div class="bx-browser__missing">
          <span class="bx-browser__ghost" style="width:92%"></span>
          <span class="bx-browser__ghost" style="width:78%"></span>
          <p>${icon('search-x', 12)}<span>Recorded as <q>${esc(f.recordedAs)}</q></span></p>
          <span class="bx-browser__ghost" style="width:64%"></span>
        </div>`
      : blocksHtml(pageBlocks(f.evidence));
    // the page runs on past the passage: a sketch of the lines around it
    const more = f.unlocated
      ? ''
      : '<div class="bx-pg__more" aria-hidden="true"><i></i><i></i><i></i></div>';
    return `
      <div class="bx-pg bx-pg--hero">
        <div class="bx-pg__hero">
          <img class="bx-pg__img" src="assets/brand/${PAGE_IMG[f.source] || 'img-06'}.jpg" alt="" loading="lazy" decoding="async">
          <span class="bx-pg__brand">${siteIcon('bx-pg__logo', 12)}HomeCourt</span>
          <p class="bx-pg__title">${esc(pageTitle(f))}</p>
        </div>
        <div class="bx-pg__body">${body}${more}</div>
      </div>`;
  }

  function browserView(f) {
    const path = String(f.src.path || '');
    const cut = path.indexOf('/');
    const host = cut < 0 ? path : path.slice(0, cut);
    const rest = cut < 0 ? '' : path.slice(cut);
    const state = f.replaced ? 'replaced' : f.unlocated ? 'missing' : 'found';
    const status = {
      found: [icon('located', 13), 'Wording found on the page'],
      missing: [icon('search-x', 13), 'Wording not on the page as it stands now'],
      replaced: [icon('history', 13), 'Replaced by a newer fact'],
    }[state];
    return `
      <figure class="bx-browser is-${state}">
        <div class="bx-browser__bar">
          <span class="bx-browser__dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="bx-browser__url">${icon('globe', 12)}<span><b>${esc(host)}</b>${esc(rest)}</span></span>
          <a class="bx-browser__open" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener" aria-label="Open the page">${icon('external', 13)}</a>
        </div>
        <div class="bx-browser__page">${pageHtml(f)}</div>
        <figcaption class="bx-browser__status">${status[0]}<span>${status[1]}</span></figcaption>
      </figure>`;
  }

  /* One fact's record - the same in Knowledge D's rows (`split`: the row is wide, the
     list sits beside the page) and in Knowledge F's drawer (the list over it): a
     quiet list - kind, confidence, source, learned, cited - and the page it came
     from. */
  function recordBody(f, opts = {}) {
    const uses = factUsesHtml(f);
    const stamp = esc(dates.fmtStamp(f.learnedAt));
    const none = '<span class="bx-rec__none">Not cited in the report</span>';
    return `
      <div class="bx-rec bx-rec--props ${opts.split ? 'is-split' : ''}">
        <dl class="bx-props">
          <div><dt>${icon('tag', 13)}Kind</dt><dd>${kindCell(f)}</dd></div>
          <div><dt>${icon('gauge', 13)}Confidence</dt><dd>${confCell(f)}</dd></div>
          <div><dt>${icon('globe', 13)}Source</dt><dd>${srcCell(f)}</dd></div>
          <div><dt>${icon('clock', 13)}Learned</dt><dd class="bx-num">${stamp}</dd></div>
          <div><dt>${icon('book', 13)}Cited in</dt><dd>${uses || none}</dd></div>
        </dl>
        ${browserView(f)}
      </div>`;
  }

  window.BX = {
    rmGoalHtml,
    rmSourceCount,
    RM_HUES,
    rmKicker,
    openRmSources,
    kindCell,
    srcCell,
    srcCellFlat,
    siteIcon,
    srcLink,
    browserView,
    pageBlocks,
    recordBody,
    monthBands,
    splitLede,
    quotesOf,
    answerLayered,
    KIND_ICON,
    kindAvatar,
    wordingPill,
    ring,
    confMeter,
    confCell,
    confIcon,
    secIcon,
    FIELD_ICON,
    hideTip,
    markedStatement,
    markTextHtml,
    keysOfFacts,
    markEntitiesHtml,
    entKey,
    approvedBy,
    axisTicks,
    axisHtml,
    roadmapSection,
    roadmapPane,
    mountRoadmap,
    roadmapDate,
    inRoadmap,
    srcName,
    knowledgeSourceFor,
    glyph,
    confPill,
    confDot,
    kindLabel,
    tokensHtml,
    answerHtml,
    bindCites,
    hideCite,
    setDisclose,
    flash,
    excerptsHtml,
    excludeControls,
    openLink,
    srcPath,
    shortPath,
    sourcesTable,
    sourceRow,
    revealExcerpt,
    gapsHtml,
    regenButton,
    runningStrip,
    handleReportAction,
    bindProgress,
    regenAllControl,
    handleRegenAll,
    evidenceOf,
    evidenceTag,
    factEvidence,
    confText,
    factUsesHtml,
    factDetail,
    sortHeader,
    pagerHtml,
    phaseTone,
    phasePill,
    rmClockText,
    phaseDates,
    phaseWhen,
    todayPct,
    monthTicks,
    rmField,
    confirmedPill,
    approvedText,
    rmHeading,
    phaseMarker,
    avatar,
    approverChip,
    roadmapField,
    fieldIcon,
    answerClamp,
    fitMore,
    toggleMore,
    sourceSquares,
    gapDots,
  };
})();
