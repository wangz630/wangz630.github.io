/* The brand profile, rendered inside Brain's Report tab.

   The profile used to be its own page in the sidebar; here it is a group of
   objects in the report browser, so the report's fields and the profile's
   sections read as one document. The visual identity blocks are also used by the
   report's own Visual identity field. */
(function () {
  'use strict';
  const B = window.Brain;
  const { esc, icon } = B;
  const P = window.BRAIN_PROFILE;

  const CONF_LABEL = {
    supported: 'Supported by evidence',
    direct: 'Direct from source',
    inferred: 'Inferred',
    unconfirmed: 'Unconfirmed',
  };
  const conf = (key) =>
    key
      ? `<span class="bx-pill bx-pill--${key} bx-pill--compact">${CONF_LABEL[key] || B.cap(key)}</span>`
      : '';

  const list = (items, cls = '') =>
    `<ul class="bx-bp__list ${cls}">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

  /* ------------------------------------------------------- visual identity */

  const swatch = (c) => `
    <div class="bx-bp__swatch ${c.low ? 'is-low' : ''}">
      <span class="bx-bp__chip" style="background:${esc(c.hex)}"></span>
      <span class="bx-bp__sname">${esc(c.name)}</span>
      <span class="bx-bp__shex bx-num">${esc(c.hex)}</span>
      <span class="bx-bp__srole">${esc(c.role)}</span>
      <span class="bx-bp__sfrom">${esc(c.from)}</span>
    </div>`;

  function visualHtml(opts = {}) {
    const v = P.visual;
    return `
      <div class="bx-bp__visual ${opts.cls || ''}">
        ${
          opts.skipLogo
            ? ''
            : `<section class="bx-bp__vblock">
          <h4 class="bx-bp__vh">${icon('image', 14)}Logo</h4>
          <div class="bx-bp__logo">
            <img src="${esc(v.logo.src)}" alt="HomeCourt logo" width="96" height="96">
            <p>${esc(v.logo.note)}</p>
          </div>
        </section>`
        }
        <section class="bx-bp__vblock">
          <h4 class="bx-bp__vh">${icon('grid', 14)}Colour palette</h4>
          <div class="bx-bp__swatches">${v.colors.map(swatch).join('')}</div>
          <div class="bx-bp__contrast">
            <p class="bx-bp__vnote">${esc(v.contrast.note)}</p>
            <ul>
              ${v.contrast.pairs
                .map(
                  (p) => `
                <li>
                  <span class="bx-bp__pair" aria-hidden="true"><i style="background:${esc(p.bg)}"><b style="background:${esc(p.fg)}"></b></i></span>
                  <span class="bx-bp__pairtext bx-num">${esc(p.fg)} on ${esc(p.bg)}</span>
                  <span class="bx-bp__ratio bx-num">${esc(p.ratio)}</span>
                  <span class="bx-bp__verdict">${esc(p.verdict)}</span>
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </section>
        <section class="bx-bp__vblock">
          <h4 class="bx-bp__vh">${icon('type', 14)}Typography</h4>
          <div class="bx-bp__type">
            ${v.type
              .map(
                (t) => `
              <div class="bx-bp__face">
                <span class="bx-bp__aa" style="font-family:${esc(t.family)}, var(--font-sans)">Aa</span>
                <b>${esc(t.role)} — ${esc(t.family)}</b>
                <small>${esc(t.rules)} · ${esc(t.conf)} · homecourt.ai</small>
              </div>`
              )
              .join('')}
          </div>
        </section>
        <section class="bx-bp__vblock">
          <h4 class="bx-bp__vh">${icon('camera', 14)}Imagery</h4>
          <div class="bx-bp__imgs">
            ${v.imagery
              .map(
                (im) =>
                  `<figure><img src="${esc(im.src)}" alt="" loading="lazy" width="240" height="160"><figcaption>${esc(im.from)}</figcaption></figure>`
              )
              .join('')}
          </div>
        </section>
      </div>`;
  }

  /* --------------------------------------------------------------- sections */

  const bodies = {
    snapshot: (s) => `
      <div class="bx-bp__kv">
        ${s.overview
          .map(
            (o) => `
          <div class="bx-bp__row">
            <dt>${esc(o.label)}</dt>
            <dd><p>${esc(o.value)}</p>${conf(o.conf)}</dd>
          </div>`
          )
          .join('')}
      </div>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Core features</h4>
        <div class="bx-bp__chips">${s.features.map((f) => `<span class="bx-chip bx-chip--sm">${esc(f)}</span>`).join('')}</div>
      </section>`,

    visual: () => visualHtml(),

    identity: (s) => `
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Positioning — what you say vs. what the market hears</h4>
        <div class="bx-bp__two">
          <div class="bx-bp__col">
            <p class="bx-label">What you say ${conf('supported')}</p>
            ${list(s.says)}
          </div>
          <div class="bx-bp__col">
            <p class="bx-label">What the market hears ${conf('unconfirmed')}</p>
            ${list(s.hears)}
          </div>
        </div>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">The problem you solve ${conf('supported')}</h4>
        <p class="bx-bp__lede">${esc(s.problem)}</p>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Category &amp; competitive set ${conf('unconfirmed')}</h4>
        <div class="bx-bp__comp">
          ${s.competitors
            .map(
              (c) => `
            <div class="bx-bp__comprow">
              <div><b>${esc(c.name)}</b><small>${esc(c.site)}</small></div>
              <p>${esc(c.note)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">SWOT — auto-derived ${conf('unconfirmed')}</h4>
        <div class="bx-bp__swot">
          ${Object.entries(s.swot)
            .map(
              ([k, items]) => `
            <div class="bx-bp__quad is-${k.toLowerCase()}">
              <p class="bx-label">${esc(k)}</p>
              ${list(items)}
            </div>`
            )
            .join('')}
        </div>
      </section>`,

    conviction: (s) => `
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Stands for / stands against ${conf('unconfirmed')}</h4>
        <div class="bx-bp__stands">
          ${s.stands
            .map(
              (r) => `
            <div class="bx-bp__stand">
              <p class="is-for"><span aria-hidden="true">+</span>${esc(r.for)}</p>
              <p class="is-against"><span aria-hidden="true">−</span>${esc(r.against)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Non-negotiables</h4>
        ${list(s.nonNegotiables)}
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Decision rules</h4>
        <div class="bx-bp__rules">
          ${s.rules
            .map(
              (r) => `
            <div class="bx-bp__rule">
              <p><span class="bx-label">If</span>${esc(r.if)}</p>
              <p><span class="bx-label">Then</span>${esc(r.then)}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>`,

    community: (s) => `
      <div class="bx-bp__kv">
        ${s.segments
          .map(
            (o) => `
          <div class="bx-bp__row">
            <dt>${esc(o.label)}</dt>
            <dd><p>${esc(o.value)}</p>${conf(o.conf)}</dd>
          </div>`
          )
          .join('')}
      </div>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">User persona ${conf('supported')}</h4>
        <div class="bx-bp__persona">
          <span class="bx-bp__avatar" aria-hidden="true">${esc(s.persona.initials)}</span>
          <div>
            <b>${esc(s.persona.name)}</b>
            <p>${esc(s.persona.body)}</p>
          </div>
        </div>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Purchase triggers ${conf('unconfirmed')}</h4>
        ${list(s.triggers, 'bx-bp__list--spaced')}
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Underserved — the growth seed ${conf('unconfirmed')}</h4>
        <div class="bx-bp__seeds">
          ${s.seeds
            .map(
              (sd) => `
            <div class="bx-bp__seed">
              <span class="bx-bp__seedn bx-num">${esc(sd.n)}</span>
              <div><b>${esc(sd.title)}</b><p>${esc(sd.body)}</p></div>
            </div>`
            )
            .join('')}
        </div>
      </section>`,

    expression: (s) => `
      <div class="bx-bp__kv">
        ${s.voice
          .map(
            (o) =>
              `<div class="bx-bp__row"><dt>${esc(o.label)}</dt><dd><p>${esc(o.value)}</p></dd></div>`
          )
          .join('')}
      </div>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Vocabulary</h4>
        <p class="bx-label">Signature language</p>
        <div class="bx-bp__chips">${s.vocabulary.signature.map((t) => `<span class="bx-chip bx-chip--sm">${esc(t)}</span>`).join('')}</div>
        <p class="bx-label">Preferred terminology</p>
        <div class="bx-bp__chips">${s.vocabulary.preferred.map((t) => `<span class="bx-chip bx-chip--sm">${esc(t)}</span>`).join('')}</div>
        <p class="bx-bp__vnote">Banned words: ${esc(s.vocabulary.banned)}</p>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Do / don't</h4>
        <div class="bx-bp__two">
          <div class="bx-bp__col"><p class="bx-label">Do ${conf('supported')}</p>${list(s.dos)}</div>
          <div class="bx-bp__col"><p class="bx-label">Don't ${conf('unconfirmed')}</p>${list(s.donts)}</div>
        </div>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Voice sample — AI-written from the spec ${conf('unconfirmed')}</h4>
        <blockquote class="bx-quote">${esc(s.sample)}</blockquote>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">Core message ${conf('supported')}</h4>
        <p class="bx-bp__lede">${esc(s.core)}</p>
      </section>`,

    insights: (s) => `
      <div class="bx-bp__insights">
        ${s.insights
          .map(
            (i) => `
          <article class="bx-bp__insight">
            <span class="bx-bp__seedn bx-num">${esc(i.n)}</span>
            <div>
              <b>${esc(i.title)}</b>
              <p class="bx-bp__lede">${esc(i.lede)}</p>
              <p>${esc(i.body)}</p>
              ${conf(i.conf)}
            </div>
          </article>`
          )
          .join('')}
      </div>`,
  };

  function groundingHtml() {
    const g = P.grounding;
    return `
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">How well each section is grounded</h4>
        <div class="bx-bp__ground">
          <div class="bx-bp__grow is-head"><span>Section</span><span>Grounding</span><span>Weakest field</span></div>
          ${g.rows
            .map(
              (r) => `
            <div class="bx-bp__grow">
              <span>${esc(r.section)}</span>
              <span class="bx-num">${esc(r.grounding)}</span>
              <span>${conf('unconfirmed')}</span>
            </div>`
            )
            .join('')}
        </div>
        <p class="bx-bp__vnote">${esc(g.note)}</p>
      </section>
      <section class="bx-bp__block">
        <h4 class="bx-bp__h">${icon('alert', 14)}Sources disagree</h4>
        <p>${esc(g.disagree)}</p>
      </section>`;
  }

  const SECTIONS = [
    ...P.sections.map((s) => ({ id: s.id, n: s.n, title: s.title, sub: s.sub, icon: s.icon })),
    {
      id: 'sources',
      n: 'H',
      title: 'Sources & confidence',
      sub: `${P.grounding.sources} · how much of each section rests on external facts.`,
      icon: 'layers',
    },
  ];

  function sectionBody(id) {
    if (id === 'sources') return groundingHtml();
    const s = P.sections.find((x) => x.id === id);
    return s && bodies[id] ? bodies[id](s) : '';
  }

  window.BXP = {
    P,
    SECTIONS,
    sectionBody,
    visualHtml,
    byId: (id) => SECTIONS.find((s) => s.id === id),
  };
})();
