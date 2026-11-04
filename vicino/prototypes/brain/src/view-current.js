/* "Current" - the Brain page as shipped on dev.pulse.vicino.ai (2026-09-16).

   Markup and class names follow the captured DOM exactly so app.css (the purged
   production stylesheet) draws it unchanged. Behaviour follows what the live page
   does: Show more, the Sources / Not in the index disclosures, the exclude
   confirmation, Write it down, Regenerate; on Knowledge the keyword filter, From
   select, kind facets, sortable columns and multi-open evidence rows.

   Ask and Index map are registered here too; they are shared by every page
   version (A/B/C restyle the same markup from their own stylesheets). */
(function () {
  'use strict';
  const B = window.Brain;
  const { esc, icon, fields, fieldById, facts, sources, sourceById, ui, dates } = B;

  /* ------------------------------------------------------------------ page */

  /* ---------------------------------------------------------------- report */

  /* ------------------------------------------------------------- knowledge */

  const openRows = new Set();
  const kindCounts = B.countBy(facts, (f) => f.kind);

  function tableBody() {
    const kn = ui.kn;
    const list = B.sortFacts(
      B.filterFacts({ ...kn, kinds: kn.kinds.slice(0, 1), bands: [], evidence: [] })
    );
    if (!list.length)
      return `<tr><td colspan="5"><p class="brain-browse__empty">No claims match these filters.</p></td></tr>`;
    return list
      .map((f) => {
        const open = openRows.has(f.id);
        const row = `
          <tr class="brain-table__row brain-table__row--clickable ${open ? 'brain-table__row--open' : ''} ${f.muted ? 'brain-table__row--muted' : ''}" role="button" tabindex="0" aria-expanded="${open}" data-row="${f.id}" data-fact="${f.id}">
            <td class="brain-table__statement"><span ${f.muted && !f.replaced ? `title="Confidence ${f.confidence.toFixed(2)}"` : ''}>${esc(f.statement)}</span>${f.replaced ? '<span class="brain-claim__chip">Replaced</span>' : ''}</td>
            <td class="brain-table__kind">${esc(f.kind)}</td>
            <td class="brain-table__source" title="${esc(f.src.title)}"><a class="brain-table__source-link" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener" title="Open the original">${esc(f.src.title)}</a></td>
            <td class="brain-table__num">${f.confidence.toFixed(2)}</td>
            <td class="brain-table__num" title="${esc(f.learnedAt)}">${dates.fmtTsShort(f.learnedAt)}</td>
          </tr>`;
        if (!open) return row;
        const ev = f.unlocated
          ? `<p class="brain-evidence brain-evidence--unlocated">Recorded from this source as “${esc(f.recordedAs)}”, but that wording is not in the source as it stands now — open the source to check it.</p>`
          : `<blockquote class="brain-evidence">${B.evidenceHtml(f.evidence, 'brain-evidence__quote')}</blockquote>`;
        return `${row}<tr class="brain-table__evidence"><td colspan="5">${ev}</td></tr>`;
      })
      .join('');
  }

  const SORTS = [
    ['kind', 'Kind'],
    ['source', 'Source'],
    ['confidence', 'Conf.'],
    ['learned', 'Learned'],
  ];

  function headHtml() {
    const kn = ui.kn;
    return `<tr><th scope="col">Statement</th>${SORTS.map(([k, label]) => {
      const on = kn.sort === k;
      return `<th scope="col" aria-sort="${on ? (kn.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" class="brain-table__sort" data-sort="${k}">${label}${on ? `<span class="brain-table__arrow" aria-hidden="true">${kn.dir === 'asc' ? '▴' : '▾'}</span>` : ''}</button></th>`;
    }).join('')}</tr>`;
  }

  function facetsHtml() {
    const kn = ui.kn;
    const active = kn.kinds[0];
    return `${B.D.knowledge.kinds
      .map(
        (k) =>
          `<button type="button" aria-pressed="${active === k.key}" class="brain-browse__facet ${active === k.key ? 'brain-browse__facet--active' : ''}" data-facet="${k.key}"><span class="brain-browse__facet-name">${esc(k.key)}</span><span class="brain-browse__facet-count">${kindCounts[k.key]}</span></button>`
      )
      .join(
        ''
      )}${active || kn.source || kn.q ? '<button type="button" class="brain-browse__facet-clear" data-clear>Clear the filter</button>' : ''}`;
  }

  function countText() {
    const kn = ui.kn;
    const n = B.filterFacts({ ...kn, kinds: kn.kinds.slice(0, 1), bands: [], evidence: [] }).length;
    return n === facts.length ? `${facts.length} claims` : `${n} of ${facts.length} claims`;
  }

  B.register('knowledge', 'current', {
    render() {
      const kn = ui.kn;
      return `
        <div class="brain-browse">
          <div class="brain-browse__controls">
            <input type="search" class="brain-browse__search" aria-label="Filter claims by keyword" placeholder="Filter claims by keyword" value="${esc(kn.q)}">
            <label class="brain-browse__from">From:<select class="brain-browse__from-select">
              <option value="">All sources</option>
              ${sources.map((s) => `<option value="${s.id}" ${kn.source === s.id ? 'selected' : ''}>${esc(s.title)} (${s.count})</option>`).join('')}
            </select></label>
            <p class="brain-browse__count">${countText()}</p>
          </div>
          <div class="brain-browse__facets" role="group" aria-label="Filter by kind">${facetsHtml()}</div>
          <table class="brain-table">
            <colgroup><col><col style="width: 88px;"><col style="width: 200px;"><col style="width: 56px;"><col style="width: 72px;"></colgroup>
            <thead>${headHtml()}</thead>
            <tbody>${tableBody()}</tbody>
          </table>
        </div>`;
    },
    mount(slot) {
      const kn = ui.kn;
      if (kn.open) {
        openRows.add(kn.open);
        kn.open = null;
        B.$('tbody', slot).innerHTML = tableBody();
      }
      const refresh = () => {
        B.$('tbody', slot).innerHTML = tableBody();
        B.$('thead', slot).innerHTML = headHtml();
        B.$('.brain-browse__facets', slot).innerHTML = facetsHtml();
        B.$('.brain-browse__count', slot).textContent = countText();
      };
      slot.addEventListener('input', (e) => {
        if (e.target.matches('.brain-browse__search')) {
          kn.q = e.target.value;
          refresh();
        }
      });
      slot.addEventListener('change', (e) => {
        if (e.target.matches('.brain-browse__from-select')) {
          kn.source = e.target.value;
          refresh();
        }
      });
      const toggleRow = (tr) => {
        const id = tr.dataset.row;
        if (openRows.has(id)) openRows.delete(id);
        else openRows.add(id);
        refresh();
      };
      slot.addEventListener('click', (e) => {
        if (e.target.closest('.brain-table__source-link')) return;
        const facet = e.target.closest('[data-facet]');
        if (facet) {
          kn.kinds = kn.kinds[0] === facet.dataset.facet ? [] : [facet.dataset.facet];
          refresh();
          return;
        }
        if (e.target.closest('[data-clear]')) {
          B.clearFilters();
          B.$('.brain-browse__search', slot).value = '';
          B.$('.brain-browse__from-select', slot).value = '';
          refresh();
          return;
        }
        const sort = e.target.closest('[data-sort]');
        if (sort) {
          const k = sort.dataset.sort;
          if (kn.sort === k) kn.dir = kn.dir === 'asc' ? 'desc' : 'asc';
          else {
            kn.sort = k;
            kn.dir = k === 'kind' || k === 'source' ? 'asc' : 'desc';
          }
          refresh();
          return;
        }
        const tr = e.target.closest('[data-row]');
        if (tr) toggleRow(tr);
      });
      slot.addEventListener('keydown', (e) => {
        const tr = e.target.closest('[data-row]');
        if (tr && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          toggleRow(tr);
          const again = slot.querySelector(`[data-row="${tr.dataset.row}"]`);
          if (again) again.focus();
        }
      });
    },
  });

  /* ------------------------------------------------------- Index map (shared) */

  // Positions are a deterministic, illustrative layout - the capture did not
  // include the embedding coordinates.
  function seeded(seed) {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  function layout(n, clusters, seed) {
    const rnd = seeded(seed);
    const centers = Array.from({ length: clusters }, () => [
      0.12 + rnd() * 0.76,
      0.14 + rnd() * 0.72,
    ]);
    return Array.from({ length: n }, (_, i) => {
      const c = centers[i % clusters];
      const r = 0.02 + rnd() * 0.09;
      const t = rnd() * Math.PI * 2;
      return [
        Math.min(0.97, Math.max(0.03, c[0] + Math.cos(t) * r)),
        Math.min(0.95, Math.max(0.05, c[1] + Math.sin(t) * r * 1.4)),
      ];
    });
  }
  const SPACES = {
    text: {
      label: 'Text, facts and captions',
      n: 24,
      note: 'Everything the index read as words. Distances mean something inside this view only.',
      legend: 'Captions',
      pts: layout(24, 4, 7),
    },
    images: {
      label: 'Images and files',
      n: 351,
      note: 'Everything the index read as pictures and files. Distances mean something inside this view only.',
      legend: 'Images',
      pts: layout(351, 9, 42),
    },
  };

  B.register('map', null, {
    render() {
      const m = ui.map;
      const sp = SPACES[m.space];
      const S = B.D.summary;
      const st = B.reportStats;
      const W = 1000;
      const H = 520;
      /* the numbers that used to sit in the page header live here, where the rest
         of the index's technical reading is */
      /* what the index is made of, in the same band the report's hero uses: the
         chunk count belongs to the map's own legend, not here */
      const stats = [
        ['Sources', st.sources, 'pages and files read'],
        ['Facts', S.facts, 'kept, each with its evidence'],
        [
          'Embedded',
          `${Math.round((S.embedded / S.chunks) * 100)}%`,
          'of the index placed on the map',
        ],
        ['Assets', S.assets, 'images and video in the library'],
      ];
      return `
        <section class="brain-map">
          <header class="brain-map__head">
            <div class="brain-map__titles">
              <h3 class="brain-map__title">The index</h3>
              <p class="brain-map__lede">What Brain has read about ${esc(B.D.brand.name)}, and how close it all sits<span class="bx-sep">·</span>indexed <span class="bx-num">${esc(B.dates.fmtLong(S.lastIndexed))}</span></p>
            </div>
            <dl class="brain-map__stats">
              ${stats
                .map(
                  ([k, v, note]) =>
                    `<div><dd class="bx-num">${v}</dd><dt>${esc(k)}</dt><small>${esc(note)}</small></div>`
                )
                .join('')}
            </dl>
          </header>
          <div class="brain-map__spaces" role="group" aria-label="Embedding space">
            ${Object.entries(SPACES)
              .map(
                ([k, s]) =>
                  `<button type="button" class="brain-map__space ${m.space === k ? 'is-active' : ''}" data-space="${k}" aria-pressed="${m.space === k}">${s.label} (${s.n})</button>`
              )
              .join('')}
          </div>
          <p class="brain-map__space-note">${sp.note}</p>
          <div class="brain-map__legend">
            <span class="brain-map__legend-item"><span class="brain-map__swatch" style="background: var(--indigo-500)"></span>${sp.legend} (${sp.n})</span>
            <span class="brain-map__model">${esc(B.D.summary.model)}</span>
          </div>
          <div class="brain-map__stage">
            <div class="brain-map__plot-wrap">
              <svg class="brain-map__svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${sp.n} ${sp.legend.toLowerCase()} plotted by similarity">
                <rect class="brain-map__plot" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="0"></rect>
                ${sp.pts
                  .map(
                    ([x, y], i) =>
                      `<circle class="brain-map__point" cx="${(x * W).toFixed(1)}" cy="${(y * H).toFixed(1)}" r="${m.space === 'text' ? 6 : 3.6}" fill="var(--indigo-500)" data-pt="${i}"><title>${sp.legend.slice(0, -1)} ${i + 1}</title></circle>`
                  )
                  .join('')}
              </svg>
            </div>
          </div>
        </section>`;
    },
    mount(slot) {
      slot.addEventListener('click', (e) => {
        const b = e.target.closest('[data-space]');
        if (b) {
          ui.map.space = b.dataset.space;
          B.renderPanel({ keepScroll: true });
        }
      });
    },
  });
})();
