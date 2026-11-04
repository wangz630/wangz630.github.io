/* A report field and the Brain fields it is made of.

   The answer is written from these fields, so the fields view says that first:
   how many there are, and where each one stands. The status is the product's own
   - Confirmed, Partly known, Not set, Read from Strategy - and a Not set field
   carries a small tag saying why it is empty, because the three are not the same
   thing:

     You declare         only the brand can answer it (Set, or None)
     Brain can write it  the index holds facts for it; Generate writes it
     Not in the index    nothing read so far says it - these sit only under the
                         report fields whose answer says "Not in the index"

   A field is always read as its name with its key under it, then its value, then
   where it came from, how sure the index is of it, and its status. Three designs (Versions → Fields design):

     1 Rows     the table Knowledge F draws - a grey head, a line between every
                column, a number at the left
     2 Cards    a card a field, its head, its value and its moves in their own
                blocks, grouped by status
     3 Split    the fields listed at the left, the one you pick open at the right
     4 Stripes  the same table with no lines at all - every other row on a fill
     5 Pages    the same table five rows at a time, turned like slides
     6 Card pages  the cards four at a time, turned the same way

   What the brand does lives for the session, like every other action here. */
(function () {
  'use strict';
  const B = window.Brain;
  const X = window.BX;
  const { esc, icon, ui } = B;
  const DATA = window.BRAIN_FIELDS || {};
  const QUERY = window.BRAIN_FIELD_QUERIES || {};

  ui.rp.bf = ui.rp.bf || {};
  // the field whose drawer is open, if any
  ui.rp.bfOpen = ui.rp.bfOpen || null;
  ui.rp.bfEdit = ui.rp.bfEdit || null;
  ui.rp.bfPage = ui.rp.bfPage || {};
  ui.rp.bfFact = ui.rp.bfFact || {};
  ui.rp.bfFilter = ui.rp.bfFilter || {};
  // fields the brand adds itself, for the session
  ui.rp.bfNew = ui.rp.bfNew || {};
  ui.rp.bfAdd = ui.rp.bfAdd || null;
  // which long answers are open, and which field the split design has picked
  ui.rp.bfMore = ui.rp.bfMore || {};

  const drawerDesign = () => B.state.fdrawer || '1';

  const FID_OF = {};
  Object.keys(DATA).forEach((fid) => DATA[fid].fields.forEach((fd) => (FID_OF[fd.key] = fid)));
  const listOf = (fid) => (DATA[fid] ? DATA[fid].fields : []).concat(ui.rp.bfNew[fid] || []);
  const fieldOf = (key) => {
    const fid = FID_OF[key];
    return fid ? listOf(fid).find((fd) => fd.key === key) : null;
  };

  /* a field as it stands now: what Brain holds, with what the brand did over it -
     and, for the four the roadmap draws, the value as the plan reads today */
  /* A field the index holds the facts for is never left empty waiting to be asked:
     Brain writes it on its run and marks it Inferred, with the confidence that
     working it out earns. So `draft` is a written value, not a move. */
  const now = (fd) => {
    const u = ui.rp.bf[fd.key] || {};
    const live = fd.live && window.BXF_LIVE && window.BXF_LIVE[fd.live];
    const auto =
      fd.status === 'notset' && fd.draft && !fd.you && !fd.nothing && !u.status
        ? { value: fd.draft, facts: fd.draftFacts || [], status: 'partly', inferredOnly: true }
        : {};
    return {
      ...fd,
      ...(live ? { value: live() } : {}),
      ...auto,
      ...u,
      base: fd.status,
      status: u.status || auto.status || fd.status,
    };
  };

  /* what kind of thing a field is at this moment - the three empties told apart */
  function kindOf(v) {
    if (v.status !== 'notset') return v.status;
    if (v.you) return 'you';
    if (v.nothing) return 'gap';
    return v.draft ? 'draft' : 'gap';
  }

  /* How Brain knows a field, worked out from its evidence rather than asked of the
     model (the Brand Brain Console review): Direct is quoted from a page Brain read,
     Inferred was worked out from what the index holds - including a value with
     nothing behind it at all. An owner's own wording is not scored; it stands over
     all of it. */
  function howOf(v) {
    if (v.inferredOnly) return 'inferred';
    const facts = (v.facts || []).map((id) => B.factById[id]).filter(Boolean);
    if (!facts.length) return 'inferred';
    const best = Math.max(...facts.map((f) => f.confidence));
    const direct = facts.some((f) => !f.unlocated && !f.replaced) && best >= 0.95;
    return direct ? 'direct' : 'inferred';
  }

  // when it was last written, and by whom
  function updatedOf(v, k) {
    if (['wrote', 'edited', 'none'].includes(k) && v.at)
      return { when: stamp(v.at), by: 'You', now: true };
    if (k === 'confirmed' && v.confirmedNow && v.at)
      return { when: stamp(v.at), by: 'You', now: true };
    if (k === 'confirmed' && v.confirmedAt) return { when: day(v.confirmedAt), by: 'You' };
    if (k === 'strategy') return { when: day(v.confirmedAt || B.D.summary.lastIndexed), by: 'You' };
    if (v.gen && v.at) return { when: stamp(v.at), by: 'Brain', now: true };
    const facts = (v.facts || []).map((id) => B.factById[id]).filter(Boolean);
    if (facts.length) {
      const last = facts
        .map((f) => f.learnedAt)
        .sort()
        .pop();
      return { when: day(last), by: 'Brain' };
    }
    if ((v.from || []).length) return { when: day(B.D.summary.lastIndexed), by: 'Onboarding' };
    return null;
  }

  /* ONE vocabulary, read the same way on a section card and on a field. What Brain
     knows is one of four things; who wrote it, what it rests on and how sure the
     index is are said beside it - never folded into the same badge.

       Confirmed  someone at the brand has said it is right - wrote it themselves,
                  or approved the strategy it was written from
       Direct     quoted from a page Brain read; nobody has confirmed it yet
       Inferred   worked out from what the index holds; no page says it outright
       Missing    nothing is written here yet - you declare it, Brain can write it,
                  or nothing read says it                                        */
  const STATE_OF = {
    confirmed: 'confirmed',
    edited: 'confirmed',
    wrote: 'confirmed',
    none: 'confirmed',
    strategy: 'confirmed',
    running: 'running',
    you: 'missing',
    draft: 'missing',
    gap: 'missing',
  };
  const stateOf = (v, k) => (k === 'partly' ? howOf(v) : STATE_OF[k] || 'missing');
  const STATE = {
    confirmed: ['Confirmed', 'Confirmed · someone at the brand has said this is right'],
    direct: ['Direct', 'Direct · quoted from a page Brain read, and not confirmed yet'],
    inferred: [
      'Inferred',
      'Inferred · worked out from what the index holds; no page says it outright',
    ],
    missing: ['Missing', 'Missing · nothing is written here yet'],
    running: ['Writing it…', 'Writing it… · Brain is writing this from the index'],
  };
  const statusOf = stateOf;

  function counts(fid) {
    const c = {
      total: 0,
      confirmed: 0,
      direct: 0,
      inferred: 0,
      missing: 0,
      running: 0,
      you: 0,
      draft: 0,
      gap: 0,
      gapx: 0,
      check: 0,
    };
    listOf(fid).forEach((fd) => {
      const v = now(fd);
      const k = kindOf(v);
      c.total++;
      c[stateOf(v, k)]++;
      if (['you', 'draft'].includes(k)) c[k]++;
      if (k === 'gap') c[v.gap ? 'gap' : 'gapx']++;
    });
    c.check = c.direct + c.inferred;
    return c;
  }

  /* The order never changes. A field confirmed here stays where it was - the table
     is read like a table, and what you want to see alone you filter for. */
  const FILTERS = [
    ['all', 'All'],
    ['check', 'To check'],
    ['missing', 'Missing'],
    ['confirmed', 'Confirmed'],
  ];
  const filterOf = (fid) => ui.rp.bfFilter[fid] || 'all';
  const inFilter = (v, k, sel) => {
    const st = stateOf(v, k);
    if (sel === 'all') return true;
    if (sel === 'check') return st === 'direct' || st === 'inferred';
    return st === sel;
  };
  const shown = (fid) => {
    const sel = filterOf(fid);
    return listOf(fid).filter((fd) => {
      const v = now(fd);
      return inFilter(v, kindOf(v), sel);
    });
  };
  const filterCount = (fid, sel) =>
    listOf(fid).filter((fd) => {
      const v = now(fd);
      return inFilter(v, kindOf(v), sel);
    }).length;

  const stamp = (t) =>
    t
      ? new Date(t).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '';
  const day = (d) => B.dates.fmtShort(d);
  const req = (v) =>
    v.need === 'B'
      ? '<i class="bx-bf__req" data-tip="Required · Brain needs it for its first snapshot" aria-label="Required">*</i>'
      : '';

  /* where a field's value came from, and how sure the index is of it - the same two
     badges the Knowledge tables carry, read for a field rather than for a fact */
  function originOf(v, k) {
    // a field with no value has nothing to source and nothing to be sure of
    if (['you', 'draft', 'gap'].includes(k)) return null;
    if (['wrote', 'edited', 'none'].includes(k)) return { kind: 'you' };
    if (k === 'strategy') return { kind: 'you' };
    const facts = (v.facts || []).map((id) => B.factById[id]).filter(Boolean);
    if (facts.length) return { kind: 'fact', facts };
    if ((v.from || []).length) return { kind: 'profile', label: v.from[0] };
    /* It has a value and nothing at all behind it: Brain wrote it from the way the
       brand reads as a whole, not from a passage. Saying "-" here leaves Inferred
       looking like it came from nowhere, so the cell says so instead. */
    if (v.value) return { kind: 'brain' };
    return null;
  }

  const srcBadge = (v, k, opts = {}) => {
    const o = originOf(v, k);
    if (!o) return opts.blank ? '' : '<span class="bx-bf__none" aria-hidden="true">—</span>';
    if (o.kind === 'you')
      return `<span class="bx-bf__from is-you" data-tip="Declared by the brand · your wording, not the index's">${icon('user', 12)}<span class="bx-bf__fromt">You</span></span>`;
    if (o.kind === 'brain')
      return `<span class="bx-bf__from is-brainw" data-tip="Brain's own wording \u00b7 worked out from how the brand reads as a whole - no single page says it, so there is nothing to be sure of">${icon('spark', 12)}<span class="bx-bf__fromt">Brain's wording</span></span>`;
    if (o.kind === 'profile')
      return `<span class="bx-bf__from is-profile" data-tip="${esc(`Read off ${o.label}`)}">${icon('page', 12)}<span class="bx-bf__fromt">${esc(o.label)}</span></span>`;
    const more = new Set(o.facts.map((f) => f.source)).size - 1;
    /* In the table the source is not a way off the page: a field can rest on
       several, so reading them means opening the sheet, where each one carries
       what it says and its own link. */
    const cell = opts.flat ? X.srcCellFlat(o.facts[0]) : X.srcCell(o.facts[0]);
    return `<span class="bx-bf__src ${o.ahead ? 'is-ahead' : ''}" ${opts.flat ? `data-tip="${esc(more > 0 ? `Read from ${o.facts[0].src.short} and ${more} more \u00b7 open the field to read them` : `Read from ${o.facts[0].src.short} \u00b7 open the field to read it`)}"` : ''}>${cell}${more > 0 ? `<b class="bx-bf__more2 bx-num">+${more}</b>` : ''}</span>`;
  };

  const confBadge = (v, k, opts = {}) => {
    const o = originOf(v, k);
    if (!o || o.kind !== 'fact')
      return opts.blank ? '' : '<span class="bx-bf__none" aria-hidden="true">—</span>';
    const avg = o.facts.reduce((n, f) => n + f.confidence, 0) / o.facts.length;
    const band = avg >= 0.9 ? 'high' : avg >= 0.85 ? 'medium' : 'low';
    return `<span class="bx-bf__conf ${o.ahead ? 'is-ahead' : ''}" data-tip="${esc(`How sure the index is · ${avg.toFixed(2)} across ${B.plural(o.facts.length, 'fact')}`)}">${X.confCell({ confidence: avg, band })}</span>`;
  };

  const metaHtml = (v, k) => {
    const bits = [
      srcBadge(v, k, { blank: true }),
      confBadge(v, k, { blank: true }),
      whoHtml(v, k, { blank: false }),
    ].filter(Boolean);
    return bits.length
      ? `<p class="bx-bf__meta">${bits.join('<i class="bx-bf__mdot" aria-hidden="true"></i>')}</p>`
      : '';
  };

  const proof = (v) => ({
    facts: (v.facts || []).map((id) => B.factById[id]).filter(Boolean),
    from: v.from || [],
  });

  /* the pieces every design is built from: a name with its key under it, the one
     status word, and - where a field is empty - the small label that says why */
  const nameHtml = (v, cls = '') =>
    `<span class="bx-bf__name ${cls}"><b>${esc(v.label)}${req(v)}</b><small class="bx-bf__key">${esc(v.key)}</small></span>`;
  const statusPill = (v, k) => {
    const st = stateOf(v, k);
    const [label, tip] = STATE[st];
    const thin = st === 'inferred' && !(v.facts || []).length && !(v.from || []).length;
    return `<span class="bx-bf__pill is-${st}" data-tip="${esc(thin ? 'Inferred · it has a value and nothing behind it at all' : tip)}">${label}</span>`;
  };
  /* Missing says Missing and stops there - what to do about it is the move beside
     it, and what it would say is the line where the answer would be. */
  const stateCell = (v, k) => statusPill(v, k);

  function valueText(v, k) {
    if (k === 'running') return '<span class="bx-bf__muted">Writing it from the index…</span>';
    if (k === 'none')
      return '<span class="bx-bf__muted">None - the brand says there is none</span>';
    if (k === 'strategy' && !v.value)
      return '<span class="bx-bf__muted">Set when you approved the plan</span>';
    if (k === 'you') return '<span class="bx-bf__muted">Only you can answer this</span>';
    if (k === 'draft')
      return `<span class="bx-bf__muted">Brain can write this from ${B.plural((v.draftFacts || []).length, 'fact')}</span>`;
    if (k === 'gap')
      return `<span class="bx-bf__muted">Nothing Brain has read answers this yet${v.gap ? ` — the report calls it “${esc(v.gap)}”` : ''}. Add a source that says it, or write it down yourself.</span>`;
    // the value carries the marks of the facts it was written from
    return X.markTextHtml(String(v.value || ''), X.keysOfFacts(v.facts));
  }

  /* what a field can have done to it: never more than two, and each one an icon
     that says its name on hover - nothing is offered twice */
  function moves(v, k) {
    const out = [];
    const m = (act, label, ic, tip, strong = false, named = false) =>
      out.push({ act, label, ic, tip, strong, named });
    if (k === 'you') {
      m('set', 'Set it', 'pencil', 'Set \u00b7 write the brand\u2019s answer', true);
      m('none', 'None', 'none', 'None \u00b7 record that the brand has none of this');
    } else if (k === 'gap') {
      m(
        'source',
        'Add source',
        'plus',
        'Add a source \u00b7 point Brain at a page that says it',
        true
      );
      m(
        'write',
        'Write it',
        'pencil',
        'Write it down \u00b7 your own wording, kept as the answer',
        false,
        true
      );
    } else if (k === 'partly') {
      m('confirm', 'Confirm', 'check', 'Confirm \u00b7 it reads right', true);
      m('edit', 'Edit', 'pencil', 'Edit \u00b7 change the wording');
    } else if (k === 'confirmed') m('edit', 'Edit', 'pencil', 'Edit \u00b7 change the wording');
    else if (k === 'strategy') {
      /* a field the approved plan wrote is the brand's own answer, confirmed like
         any other - there is no Strategy of its own to send anyone to */
      m('edit', 'Edit', 'pencil', 'Edit \u00b7 change the wording');
    } else if (k === 'edited' || k === 'wrote')
      m('edit', 'Edit', 'pencil', 'Edit \u00b7 change the wording');
    else if (k === 'none') m('change', 'Change', 'pencil', 'Change \u00b7 answer it after all');
    return out;
  }
  /* every move looks like what it does: confirming is green, the brand's own
     answer is ink, Generate is Brain's violet, writing what the index cannot is
     amber, and the quiet ones stay grey */
  const moveDesign = () => B.state.movebtn || '1';
  const moveBtn = (v, x, opts = {}) =>
    `<button type="button" class="bx-bf__mv is-m${moveDesign()} is-act-${x.act} ${opts.words ? 'is-words' : ''}" data-bf-act="${x.act}" data-bf-key="${esc(v.key)}" aria-label="${esc(x.label)}"${opts.words ? '' : ` data-tip="${esc(x.tip)}"`}>${icon(x.ic, 13)}${opts.words ? esc(x.label) : ''}</button>`;

  /* The move a field is waiting for says its name and is filled, so a table of
     fields reads as a list of things to do; whatever else it can take stays a
     quiet icon beside it. */
  const movesHtml = (v, k, opts = {}) => {
    const list = moves(v, k);
    if (!list.length) return '';
    if (opts.words || opts.primary) return list.map((x) => moveBtn(v, x, { words: true })).join('');
    return list.map((x) => moveBtn(v, x)).join('');
  };

  /* writing in a field: a card that floats over the row it belongs to - it has no
     stroke, and it pushes nothing out of its way */
  const HINT = {
    edit: 'Your wording replaces what Brain read, and stays through any regeneration.',
    notright: 'What should it say? Brain keeps your wording over anything it reads later.',
    set: 'Only you can answer this - write it the way Brain should use it.',
    write: 'Write it yourself - Brain uses your wording from now on.',
  };
  function editorHtml(v, mode) {
    const id = `bf-ta-${v.key.replace(/[^a-z0-9]/gi, '-')}`;
    const start = mode === 'set' || mode === 'write' ? '' : v.value || '';
    return `
      <div class="bx-bfa is-editing">
        <label class="bx-bfa__hint" for="${id}">${icon('pencil', 12)}<span>${HINT[mode] || HINT.edit}</span></label>
        <textarea class="bx-bfa__ta" id="${id}" data-bf-ta="${esc(v.key)}" rows="3" placeholder="${start ? '' : 'Type it here'}">${esc(start)}</textarea>
        <div class="bx-bfa__eacts">
          <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bf-act="save" data-bf-key="${esc(v.key)}">Save</button>
          <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-bf-act="cancel" data-bf-key="${esc(v.key)}">Cancel</button>
          <span class="bx-bf__ekeys"><kbd>⌘</kbd><kbd>↵</kbd> save<span class="bx-sep">·</span><kbd>Esc</kbd> cancel</span>
        </div>
      </div>`;
  }

  /* one fact behind a field: what it says, where it was read, and - when you open
     it - the passage it was read from, with the wording that carries it marked */
  function factHtml(v, f) {
    const key = `${v.key}:${f.id}`;
    const open = !!ui.rp.bfFact[key];
    return `
      <li class="bx-bf__fact ${open ? 'is-open' : ''}">
        <button type="button" class="bx-bf__fhead" data-bf-fact="${esc(key)}" aria-expanded="${open}">
          <span class="bx-bf__fstmt">${X.markedStatement(f)}</span>
          <span class="bx-bf__ftags">${X.kindCell(f)}${X.srcCell(f)}${X.confCell(f)}${icon('chevron-down', 14, 'bx-bf__fchev')}</span>
        </button>
        <div class="bx-disclose ${open ? 'is-open' : ''}">
          <div>
            <div class="bx-bf__fbody">
              ${X.factEvidence(f)}
              <div class="bx-bf__facts2">
                <a class="bx-bf__flink" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener">${icon('external', 12)}${esc(f.src.path || f.src.short)}</a>
                <button type="button" class="bx-bf__open" data-open-fact="${f.id}">Open in Knowledge${icon('arrow-right', 12)}</button>
              </div>
            </div>
          </div>
        </div>
      </li>`;
  }

  /* the head every design wears: what the section is made of, and where its fields
     stand - the meter and the tally read in the one vocabulary */
  const tally = (k, n) =>
    n
      ? `<span class="bx-bf__tally is-${k}" data-tip="${esc(`${STATE[k][0]} · ${B.plural(n, 'field')}`)}"><i aria-hidden="true"></i><b class="bx-num">${n}</b>${STATE[k][0].toLowerCase()}</span>`
      : '';
  const SEGS = ['confirmed', 'direct', 'inferred', 'missing'];
  /* where a section stands, read in its own head - the bar and the tally live with
     the section's name, not over its table */
  function headHtml(f, opts = {}) {
    const c = counts(f.id);
    const why = [
      c.you ? `<b class="bx-num">${c.you}</b> for you to answer` : '',
      c.gap + c.gapx ? `<b class="bx-num">${c.gap + c.gapx}</b> want a new source` : '',
    ].filter(Boolean);
    return `
      <div class="bx-bf__head">
        <div class="bx-bf__meter" aria-hidden="true">${SEGS.map((k) =>
          c[k] ? `<i class="is-${k}" style="flex:${c[k]}"></i>` : ''
        ).join('')}</div>
        <p class="bx-bf__tallies">${SEGS.map((k) => tally(k, c[k])).join('')}${
          c.missing
            ? `<span class="bx-bf__why">${why.join('<span class="bx-sep">·</span>')}</span>`
            : ''
        }</p>
        ${staleHtml(f)}
      </div>`;
  }

  /* what to look at, and a way to add a field of your own. Confirming never moves a
     row - if you want only what still wants you, you say so here. */
  /* What to look at, and a way to add a field of your own. Three ways to say it
     (Versions -> Filter bar): tabs on the table's own edge, a line of its own over
     it, or a bar of its own with room between the two. */
  function barHtml(fid) {
    const sel = filterOf(fid);
    const adding = ui.rp.bfAdd === fid;
    const chips = FILTERS.map(([k, label]) => {
      const n = filterCount(fid, k);
      return `<button type="button" class="bx-bf__fchip ${sel === k ? 'is-on' : ''} is-${k}" data-bf-filter="${k}" data-bf-fid="${fid}" aria-pressed="${sel === k}" ${n ? '' : 'disabled'}><i aria-hidden="true"></i>${esc(label)}<b class="bx-num">${n}</b></button>`;
    }).join('');
    const add = `<button type="button" class="bx-bf__add ${adding ? 'is-on' : ''}" data-bf-act="${adding ? 'add-cancel' : 'add-field'}" data-bf-fid="${fid}" aria-label="${adding ? 'Stop adding a field' : 'Add a field'}" data-tip="${adding ? 'Stop adding a field' : 'Add a field \u00b7 name it, and Brain answers it on its next run'}">${icon('plus', 14)}</button>`;
    return `
      <div class="bx-bf__bar">
        <div class="bx-bf__filters" role="group" aria-label="Which fields to show">${chips}</div>
        ${X.entKey()}
        ${add}
      </div>`;
  }

  const footHtml = () =>
    `<p class="bx-bf__foot">${icon('info', 12)}<span>A field marked <b>*</b> is one Brain needs before its first snapshot. <b>Confirmed</b> means you have said it reads right; <b>Direct</b> was quoted from a page Brain read; <b>Inferred</b> was worked out from what the index holds; <b>Missing</b> is still waiting on you. The button beside a field is the one thing it is waiting for.</span></p>`;

  /* --------------------------------------------------- who wrote it, and when */

  const WHO = {
    You: {
      cls: 'is-you',
      photo: 'assets/avatars/you.png',
      mark: 'ZW',
      tip: 'Zi Wang · someone at the brand wrote or confirmed it',
    },
    Brain: {
      cls: 'is-brain',
      icon: 'spark',
      tip: 'Brain · written from the facts the index holds',
    },
    Onboarding: {
      cls: 'is-ob',
      icon: 'upload',
      tip: 'Onboarding · read off the brand profile when Brain was set up',
    },
  };
  function whoHtml(v, k, opts = {}) {
    const u = updatedOf(v, k);
    if (!u)
      return opts.blank === false ? '' : '<span class="bx-bf__none" aria-hidden="true">—</span>';
    const w = WHO[u.by] || WHO.Brain;
    const face = w.photo
      ? `<img src="${esc(w.photo)}" alt="" loading="lazy" decoding="async">`
      : w.mark
        ? esc(w.mark)
        : icon(w.icon, 11);
    return `<span class="bx-bf__who" data-tip="${esc(`${w.tip} · ${u.when}`)}"><i class="bx-bf__av ${w.cls} ${w.photo ? 'is-photo' : ''}">${face}</i><span class="bx-bf__whot"><b>${esc(u.by)}</b><small class="bx-num">${esc(u.when)}</small></span></span>`;
  }

  /* ------------------------------------------------------------- the answer

     However a section is laid out, a field's answer is read the same way: the
     Panels body size, its key words marked, a chip for every fact it cites, and
     three lines with Show more when it runs long. Editing happens in place - the
     answer becomes the box you type in, with no stroke around it. */

  const sDesign = () => B.state.sdesign || '1';
  const LONG = 190;

  const citeHtml = (v, k) => {
    if (['you', 'draft', 'gap', 'running'].includes(k)) return '';
    const facts = (v.facts || []).map((id) => B.factById[id]).filter(Boolean);
    if (!facts.length) return '';
    return facts
      .map(
        (f, i) =>
          `<button type="button" class="bx-cite brain-prose__cite" data-bf-cite="${esc(v.key)}:${f.id}" data-quote="${esc(`${f.statement}||${f.src.short} · ${B.dates.fmtShort(f.learnedAt)} · ${f.confidence.toFixed(2)}`)}">[${i + 1}]</button>`
      )
      .join('');
  };

  function answerHtml(v, k, opts = {}) {
    const editing = ui.rp.bfEdit && ui.rp.bfEdit.key === v.key ? ui.rp.bfEdit.mode : null;
    if (editing) return editorHtml(v, editing);
    const text = String(v.value || '');
    const long = text.length > (opts.limit || LONG);
    const open = !!ui.rp.bfMore[v.key];
    return `
      <div class="bx-bfa">
        <div class="bx-bfa__text bx-clamp ${long && !open ? 'is-clamped' : ''}" style="--lines:${opts.lines || 3}">${valueText(v, k)}${citeHtml(v, k)}</div>
        ${
          long
            ? `<button type="button" class="bx-more" data-bf-more="${esc(v.key)}">${open ? 'Show less' : 'Show more'}</button>`
            : ''
        }
      </div>`;
  }

  /* what the field rests on, said in one quiet line under the answer */
  /* Where it came from, how sure the index is and who last wrote it: three quiet
     lines of their own, beside the answer rather than under it, so the answer is
     read as a sentence and nothing crowds it. */
  const metaCell = (v, k) => {
    const rows = [
      srcBadge(v, k, { blank: true }),
      confBadge(v, k, { blank: true }),
      whoHtml(v, k, { blank: false }),
    ].filter(Boolean);
    if (!rows.length) return '';
    return `<span class="bx-bfm">${rows.map((html) => `<span class="bx-bfm__r">${html}</span>`).join('')}</span>`;
  };

  /* ------------------------------------------------------------- the designs */

  /* ------------------------------------------------- the section's own table

     A section is read the way Knowledge F's facts are: a head that names the
     columns, a row a field, a hairline between every cell, and one fill on hover.
     The field's name, its key and the one status word share the first column -
     they are the same thing said three ways - and everything the answer rests on
     gets a column of its own after it. The whole row opens the sheet; only the
     buttons in the last column do anything else, and the move a field is waiting
     for always starts at the same place, so the column reads as a list of things
     to do rather than a ragged edge. */

  const THEAD = `
    <div class="bx-bfr__thead" role="row">
      <span role="columnheader">${icon('type', 12)}Field</span>
      <span role="columnheader">${icon('ask', 12)}What it answers</span>
      <span role="columnheader">${icon('globe', 12)}Read from</span>
      <span role="columnheader">${icon('hash', 12)}Conf</span>
      <span role="columnheader">${icon('clock', 12)}Last written</span>
      <span role="columnheader"><span class="bx-sr">What it is waiting for</span></span>
    </div>`;

  const readRow = (fd) => {
    const v = now(fd);
    const k = kindOf(v);
    const st = stateOf(v, k);
    const open = ui.rp.bfOpen === v.key;
    return `
      <li class="bx-bfr__row is-${k} is-s-${st} ${open ? 'is-open' : ''}" data-bf-row="${esc(v.key)}" data-bf-open="${esc(v.key)}" role="row" tabindex="0" aria-label="${esc(`${v.label} - open this field`)}">
        <span class="bx-bfr__c is-field" role="cell">
          <b class="bx-bfr__name">${esc(v.label)}${req(v)}</b>
          <small class="bx-bf__key">${esc(v.key)}</small>
          ${stateCell(v, k)}
        </span>
        <span class="bx-bfr__c is-answer" role="cell">${answerHtml(v, k, { lines: 3 })}</span>
        <span class="bx-bfr__c is-src" role="cell">${srcBadge(v, k, { blank: true, flat: true }) || dash()}</span>
        <span class="bx-bfr__c is-conf" role="cell">${confBadge(v, k, { blank: true }) || dash()}</span>
        <span class="bx-bfr__c is-who" role="cell">${whoHtml(v, k, { blank: true }) || dash()}</span>
        <span class="bx-bfr__c is-acts" role="cell">${movesHtml(v, k, { primary: true })}</span>
      </li>`;
  };

  const dash = () => '<span class="bx-bf__none" aria-hidden="true">\u2014</span>';

  const listHtml = (rows) =>
    `<ul class="bx-bfr__list" role="rowgroup">${rows.map(readRow).join('')}</ul>`;

  /* ---------------------------------------------------------------- the drawer

     A field opens the way a fact does in Knowledge F: a sheet from the right, over
     the table it came from. Three designs are open (Versions → Field drawer):

       1 Record  the field as a record - label and value at the top, then the
                 answer, then every fact behind it
       2 Brief   the answer first and large, in a block you could write in, its
                 sources as files under it
       3 Trail   how it got here as a run of steps, then the answer and its facts */

  const SECTION_OF = (key) => {
    const fid = FID_OF[key];
    const f = B.fieldById[fid] || SYNTH[fid];
    return f ? f.title : '';
  };

  // the moves, with their names on, for the sheet's foot
  /* Edit is on the answer, so the foot carries only the moves that change the
     field's state - never a second way to write in it */
  const WRITE_ACTS = ['edit', 'notright', 'set', 'write'];
  const drawerActs = (v, k) => {
    const list = moves(v, k).filter((m) => !WRITE_ACTS.includes(m.act));
    return `
    <div class="bx-fdr__acts">
      ${list.map((x) => moveBtn(v, x, { words: true })).join('')}
    </div>`;
  };

  const factsBlock = (v, title) => {
    const p = proof(v);
    if (!p.facts.length)
      return `<p class="bx-fdr__none">${icon('info', 13)}Nothing in the index stands behind this one yet.</p>`;
    return `
      <p class="bx-fdr__h">${title}<b class="bx-num">${p.facts.length}</b></p>
      <ul class="bx-bf__facts">${p.facts.map((f) => factHtml(v, f)).join('')}</ul>`;
  };

  /* The sheet reads in one order: what was asked, the answer, what kind of answer
     it is, and what it rests on. Confidence is the answer's - it says how sure the
     index is of what is written - so it is read on the answer, not beside a source;
     and a source is read once, in the block that names them. */

  // the answer's own properties - not its sources, and not its confidence
  const aboutRows = (v, k) => {
    const u = updatedOf(v, k);
    const rows = [
      ['check', 'Status', stateCell(v, k)],
      [
        'clock',
        'Last written',
        u ? whoHtml(v, k) : '<span class="bx-bf__none">not written yet</span>',
      ],
      ['book', 'Section', `<span class="bx-fdr__sec">${esc(SECTION_OF(v.key))}</span>`],
      [
        'type',
        'Field key',
        `<span class="bx-fdr__key">${esc(v.key)}</span>${v.need === 'B' ? '<span class="bx-fdr__req">required for the first snapshot</span>' : ''}`,
      ],
    ];
    return `<dl class="bx-fdr__rows">${rows
      .map(([ic, label, val]) => `<div><dt>${icon(ic, 13)}${label}</dt><dd>${val}</dd></div>`)
      .join('')}</dl>`;
  };

  const drawerBrief = (v, k) => {
    const u = updatedOf(v, k);
    const p = proof(v);
    const editing = !!(ui.rp.bfEdit && ui.rp.bfEdit.key === v.key);
    const conf = confBadge(v, k, { blank: true });
    const editAct = moves(v, k).find((m) => ['edit', 'notright', 'set', 'write'].includes(m.act));
    return `
      <div class="bx-fdr is-brief">
        <p class="bx-fdr__q">${icon('ask', 13)}<span>${esc(QUERY[v.key] || '')}</span></p>

        <section class="bx-fdr__block">
          <div class="bx-fdr__bhead">
            <h4 class="bx-fdr__h2">The answer</h4>
            ${
              editAct && !editing
                ? `<button type="button" class="bx-fdr__edit" data-bf-act="${editAct.act}" data-bf-key="${esc(v.key)}" aria-label="Edit this answer" data-tip="Edit · write it the way Brain should use it">${icon('pencil', 14)}</button>`
                : ''
            }
          </div>
          ${answerHtml(v, k, { lines: 14, limit: 1100 })}
          <p class="bx-fdr__aprops">
            ${conf || ''}
            ${u ? `<span class="bx-fdr__awho">${esc(u.by)} wrote this <b class="bx-num">${esc(u.when)}</b></span>` : '<span class="bx-fdr__awho">not written yet</span>'}
          </p>
        </section>

        <section class="bx-fdr__block">
          <h4 class="bx-fdr__h2">About this answer</h4>
          ${aboutRows(v, k)}
        </section>

        <section class="bx-fdr__block">
          <div class="bx-fdr__bhead">
            <h4 class="bx-fdr__h2">What it rests on${p.facts.length ? `<span class="bx-fdr__n bx-num">${p.facts.length}</span>` : ''}</h4>
          </div>
          <ul class="bx-fdr__files">
            ${
              p.facts.length
                ? p.facts
                    .map(
                      (f) => `
              <li class="bx-fdr__file ${ui.rp.bfFact[`${v.key}:${f.id}`] ? 'is-lit' : ''}" data-bf-fsrc="${esc(f.id)}">
                <a class="bx-fdr__flink2" href="${esc(f.src.href)}" target="_blank" rel="noreferrer noopener">
                  <span class="bx-fdr__fav">${X.siteIcon('bx-fdr__favimg', 18)}</span>
                  <span class="bx-fdr__filet"><b>${esc(f.src.short)}${icon('external', 11)}</b><small>${esc(f.src.path || f.src.href)}</small></span>
                </a>
                <p class="bx-fdr__fstmt">${esc(f.statement)}</p>
                <p class="bx-fdr__fmeta">${X.kindCell(f)}${X.confCell(f)}<span class="bx-fdr__fwhen">read ${esc(B.dates.fmtShort(f.learnedAt))}</span>
                  <button type="button" class="bx-bf__open" data-open-fact="${f.id}">Open in Knowledge${icon('arrow-right', 12)}</button>
                </p>
              </li>`
                    )
                    .join('')
                : `<li class="bx-fdr__none">${icon('info', 13)}Nothing in the index stands behind this one yet.</li>`
            }
          </ul>
        </section>
      </div>`;
  };

  const DRAWERS = { 2: drawerBrief };

  function drawerHtml(key) {
    const fd = fieldOf(key);
    if (!fd) return '';
    const v = now(fd);
    const k = kindOf(v);
    const fid = FID_OF[key];
    const list = shown(fid);
    const i = list.findIndex((x) => x.key === key);
    return `
      <div class="bx-drawer__scrim" data-bf-dclose></div>
      <aside class="bx-drawer__sheet bx-drawer__sheet--field bx-view" role="dialog" aria-modal="true" aria-labelledby="bx-fdr-title">
        <header class="bx-drawer__head bx-fdr__head">
          <span class="bx-tile is-sm is-${esc(fid)}">${icon(X.FIELD_ICON[fid] || 'book', 13)}</span>
          <span class="bx-fdr__where">${esc(SECTION_OF(key))}<span class="bx-drawer__pos bx-num">${i + 1} of ${list.length}</span></span>
          <div class="bx-drawer__nav">
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-bf-dstep="-1" ${i <= 0 ? 'disabled' : ''} aria-label="The field before this">${icon('chevron-up', 15)}</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-bf-dstep="1" ${i >= list.length - 1 ? 'disabled' : ''} aria-label="The field after this">${icon('chevron-down', 15)}</button>
            <button type="button" class="bx-btn bx-btn--ghost bx-btn--icon bx-btn--xs" data-bf-dclose aria-label="Close">${icon('x', 15)}</button>
          </div>
        </header>
        <h3 class="bx-fdr__title" id="bx-fdr-title">${esc(v.label)}${req(v)}</h3>
        <div class="bx-drawer__body bx-fdr__body">
          ${(DRAWERS[drawerDesign()] || drawerBrief)(v, k)}
        </div>
        <footer class="bx-drawer__foot bx-fdr__foot">${drawerActs(v, k)}</footer>
      </aside>`;
  }

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function closeDrawer() {
    const el = document.querySelector('.bx-drawer.is-field:not(.is-closing)');
    const was = ui.rp.bfOpen;
    ui.rp.bfOpen = null;
    // a run is counted by what is open, so whatever is counting it hears this
    document.dispatchEvent(new CustomEvent('brain:drawer', { detail: { open: null, was } }));
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
      setTimeout(() => el.remove(), window.gsap && !reduce() ? 200 : 0);
    }
    if (was) {
      const row = document.querySelector(`[data-bf-row="${CSS.escape(was)}"]`);
      if (row) {
        row.classList.remove('is-open');
        const back = row.matches('[data-bf-open]') ? row : row.querySelector('[data-bf-open]');
        if (back) back.focus({ preventScroll: true });
      }
    }
  }

  function openDrawer(key) {
    if (!fieldOf(key)) return;
    const was = ui.rp.bfOpen;
    ui.rp.bfOpen = key;
    document.dispatchEvent(new CustomEvent('brain:drawer', { detail: { open: key, was } }));
    document
      .querySelectorAll('[data-bf-row]')
      .forEach((r) => r.classList.toggle('is-open', r.dataset.bfRow === key));
    const existing = document.querySelector('.bx-drawer.is-field:not(.is-closing)');
    if (existing) {
      existing.innerHTML = drawerHtml(key);
      const body = existing.querySelector('.bx-drawer__body');
      if (body && was !== key) B.motion.fadeIn(body, { duration: 0.16 });
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'bx-drawer is-field';
    wrap.innerHTML = drawerHtml(key);
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
    const close = wrap.querySelector('[data-bf-dclose].bx-btn');
    if (close) close.focus();
  }

  // the sheet is redrawn where it stands when what it shows changes
  const repaintDrawer = () => {
    if (!ui.rp.bfOpen) return;
    const el = document.querySelector('.bx-drawer.is-field:not(.is-closing)');
    if (el) el.innerHTML = drawerHtml(ui.rp.bfOpen);
  };

  /* ------------------------------------------------------- too many for one page

     A long section is turned like slides: the pages sit in a track that snaps, so
     arrows, dots or a swipe sideways move through them. */
  const PER_PAGE = 6;
  // Split keeps every field in its rail, so it never pages
  const paged = (rest) => rest.length > 8;
  const pagesOf = (rest) => {
    const out = [];
    for (let i = 0; i < rest.length; i += PER_PAGE) out.push(rest.slice(i, i + PER_PAGE));
    return out;
  };

  function pagerHtml(fid, pages, at, total) {
    const from = at * PER_PAGE + 1;
    const to = Math.min(total, (at + 1) * PER_PAGE);
    return `
      <div class="bx-bfp__bar" data-bf-pager="${fid}">
        <button type="button" class="bx-bfp__arrow" data-bf-page="${at - 1}" data-bf-fid="${fid}" aria-label="The fields before these" ${at === 0 ? 'disabled' : ''}>${icon('chevron-left', 15)}</button>
        <p class="bx-bfp__count"><b class="bx-num">${from}–${to}</b> of <b class="bx-num">${total}</b> fields</p>
        <span class="bx-bfp__dots">${pages
          .map(
            (rows, i) =>
              `<button type="button" class="bx-bfp__dot ${i === at ? 'is-on' : ''}" data-bf-page="${i}" data-bf-fid="${fid}" aria-label="Page ${i + 1} of ${pages.length}" aria-current="${i === at}"></button>`
          )
          .join('')}</span>
        <button type="button" class="bx-bfp__arrow" data-bf-page="${at + 1}" data-bf-fid="${fid}" aria-label="The fields after these" ${at === pages.length - 1 ? 'disabled' : ''}>${icon('chevron-right', 15)}</button>
      </div>`;
  }

  // the pager follows a swipe as well as a click
  function syncPager(track) {
    const fid = track.dataset.bfTrack;
    const at = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (ui.rp.bfPage[fid] === at) return;
    ui.rp.bfPage[fid] = at;
    const bar = document.querySelector(`[data-bf-pager="${fid}"]`);
    if (!bar) return;
    const total = track.querySelectorAll('[data-bf-row]').length;
    const pages = track.querySelectorAll('[data-bf-slide]').length;
    bar.querySelectorAll('.bx-bfp__dot').forEach((d, i) => {
      d.classList.toggle('is-on', i === at);
      d.setAttribute('aria-current', String(i === at));
    });
    const arrows = bar.querySelectorAll('.bx-bfp__arrow');
    arrows[0].disabled = at === 0;
    arrows[0].dataset.bfPage = String(at - 1);
    arrows[1].disabled = at === pages - 1;
    arrows[1].dataset.bfPage = String(at + 1);
    const count = bar.querySelector('.bx-bfp__count');
    if (count)
      count.innerHTML = `<b class="bx-num">${at * PER_PAGE + 1}–${Math.min(total, (at + 1) * PER_PAGE)}</b> of <b class="bx-num">${total}</b> fields`;
    track
      .querySelectorAll('[data-bf-slide]')
      .forEach((sl, i) => sl.setAttribute('aria-hidden', String(i !== at)));
  }
  if (!window.__bxPagerBound) {
    window.__bxPagerBound = true;
    document.addEventListener(
      'scroll',
      (e) => {
        const t = e.target;
        if (t && t.dataset && t.dataset.bfTrack) syncPager(t);
      },
      true
    );
  }

  /* ------------------------------------------------------------- the section */

  // sections that are not one of the captured report's own
  const SYNTH = {
    roadmap: {
      id: 'roadmap',
      title: 'Roadmap',
      question: 'What is the plan, and where is it up to?',
    },
  };

  function panelHtml(fid, opts = {}) {
    const f = B.fieldById[fid] || SYNTH[fid];
    const rows = shown(fid);
    const many = paged(rows);
    const pages = many ? pagesOf(rows) : [rows];
    const at = Math.min(ui.rp.bfPage[fid] || 0, pages.length - 1);
    return `
      <div class="bx-bf" data-bf-panel="${fid}">
        ${opts.head === false ? '' : headHtml(f, opts)}
        ${barHtml(fid)}
        <section class="bx-card bx-bf__tablecard" role="table">
          ${rows.length === 0 ? '' : THEAD}
          <div class="bx-bf__rest">
            ${
              rows.length === 0
                ? `<p class="bx-bf__none2">${icon(listOf(fid).length ? 'check' : 'plus', 16)}${
                    listOf(fid).length
                      ? 'Nothing here under this filter.'
                      : 'No fields yet - add the first one, or let Brain write them on its next run.'
                  }</p>`
                : many
                  ? `<div class="bx-bfp__track" data-bf-track="${fid}" tabindex="0" aria-label="These fields, ${PER_PAGE} at a time">
              ${pages
                .map(
                  (page, i) =>
                    `<section class="bx-bfp__slide" data-bf-slide="${i}" aria-hidden="${i === at ? 'false' : 'true'}">${listHtml(page)}</section>`
                )
                .join('')}
            </div>${pagerHtml(fid, pages, at, rows.length)}`
                  : listHtml(rows)
            }
            ${ui.rp.bfAdd === fid ? newFieldHtml(fid) : ''}
          </div>
          ${footHtml()}
        </section>
      </div>`;
  }

  /* ------------------------------------------------------- over the answer */

  const CHANGES = ['edited', 'wrote', 'none'];
  function changedSince(fid) {
    const since = ui.rp.regenerated[fid] || 0;
    return listOf(fid)
      .filter((fd) => {
        const u = ui.rp.bf[fd.key];
        return u && u.at && u.at > since && (CHANGES.includes(u.status) || u.gen);
      })
      .map((fd) => fd.label);
  }
  const andList = (xs) =>
    xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

  /* the note over the fields when the section was written before the brand's own
     changes to them - the only thing left over the table */
  const staleHtml = (f) => {
    const changed = changedSince(f.id);
    return changed.length
      ? `<p class="bx-bf__stale">${icon('info', 13)}<span>This section was written before your changes to ${andList(changed.map((l) => `<b>${esc(l)}</b>`))}<button type="button" class="bx-bf__link" data-act="regen" data-field-id="${f.id}">${icon('refresh', 12)}Regenerate</button></span></p>`
      : '';
  };

  // a section opens on its fields: there is no paragraph over them
  const viewHtml = (f, opts) => panelHtml(f.id, opts);

  /* ---------------------------------------------------------------- actions */

  // the panel is redrawn whole: the counts, the groups and the order all follow
  function repaint(fid, focusKey) {
    // whoever drew the head is told, because a move can land a beat after its click
    setTimeout(
      () => document.dispatchEvent(new CustomEvent('brain:fields', { detail: { fid } })),
      0
    );
    const panel = document.querySelector(`[data-bf-panel="${fid}"]`);
    // the section head belongs to whoever drew the panel - repainting never adds one,
    // but it does redraw the one already on the page, so the meter and the tally move
    const own = panel && panel.querySelector('.bx-bf__head');
    if (!own) {
      const head = document.querySelector('.bx-rf__dhead .bx-bf__head');
      if (head) head.outerHTML = headHtml(B.fieldById[fid] || SYNTH[fid]);
    }
    if (panel) panel.outerHTML = panelHtml(fid, { head: !!own });
    repaintDrawer();
    // the fields turned like slides keep the page they were on
    const track = document.querySelector(`[data-bf-track="${fid}"]`);
    if (track) track.scrollLeft = (ui.rp.bfPage[fid] || 0) * track.clientWidth;
    if (!focusKey) return null;
    const row = document.querySelector(`[data-bf-row="${CSS.escape(focusKey)}"]`);
    // the box you type in is wherever the answer is showing - the row, or the sheet
    focusEditor(document.querySelector('.bx-drawer.is-field .bx-fdr') || row);
    return row;
  }

  /* every box you can type in grows to its text; the one you opened takes the caret */
  function focusEditor(row) {
    document.querySelectorAll('[data-bf-ta]').forEach((el) => {
      const fit = () => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight + 2}px`;
      };
      fit();
      el.addEventListener('input', fit);
    });
    const ta = row && row.querySelector('[data-bf-ta]');
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }

  /* a field the brand adds itself: named here, and Missing from then on - the same
     field as any other, with "You declare" on it until someone answers it */
  let added = 0;
  function addField(fid) {
    const box = document.querySelector(`[data-bf-panel="${fid}"] .bx-bf__new`);
    const name = box && box.querySelector('[data-bf-new-name]');
    const q = box && box.querySelector('[data-bf-new-q]');
    const label = name ? name.value.trim() : '';
    if (!label) {
      if (name) name.focus();
      return;
    }
    added += 1;
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const key = `custom.${slug || `field_${added}`}`;
    if (fieldOf(key)) {
      B.toast(`${label} is already a field here`);
      return;
    }
    ui.rp.bfNew[fid] = (ui.rp.bfNew[fid] || []).concat({
      key,
      label,
      need: 'O',
      you: true,
      status: 'notset',
      yours: true,
    });
    FID_OF[key] = fid;
    QUERY[key] = (q && q.value.trim()) || `What should Brain know about ${label.toLowerCase()}?`;
    ui.rp.bfAdd = null;
    ui.rp.bfFilter[fid] = 'all';
    repaint(fid);
    B.toast(`${label} added - answer it, and Brain uses it from now on`);
  }

  // the card that asks for the new field's name and the question it answers
  const newFieldHtml = (fid) => `
      <div class="bx-bf__new" data-bf-new="${fid}">
        <p class="bx-bf__newh">${icon('plus', 13)}A field of your own<span>Brain answers it on the next run, or you write it yourself</span></p>
        <div class="bx-bf__newrow">
          <label class="bx-bf__newl">Name<input type="text" class="bx-bf__newi" data-bf-new-name placeholder="Sponsorships"></label>
          <label class="bx-bf__newl is-wide">What should Brain answer?<input type="text" class="bx-bf__newi" data-bf-new-q placeholder="Which teams and events does the brand sponsor?"></label>
        </div>
        <div class="bx-bf__newacts">
          <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bf-act="add-save" data-bf-fid="${fid}">Add field</button>
          <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-bf-act="add-cancel" data-bf-fid="${fid}">Cancel</button>
        </div>
      </div>`;

  function save(key) {
    const fd = fieldOf(key);
    /* The field is written in two places at once - its row in the report and,
       over it, the drawer - so the editor that was typed into is the one in the
       drawer whenever the drawer is the thing on top. */
    const sheet =
      ui.rp.bfOpen === key
        ? document.querySelector('.bx-drawer.is-field:not(.is-closing) .bx-drawer__body')
        : null;
    const row = document.querySelector(`[data-bf-row="${CSS.escape(key)}"]`);
    const ta = (sheet || row) && (sheet || row).querySelector('[data-bf-ta]');
    const text = ta ? ta.value.trim() : '';
    ui.rp.bfEdit = null;
    if (!fd || !text) {
      repaint(FID_OF[key]);
      return;
    }
    const v = now(fd);
    ui.rp.bf[key] = {
      status: v.base === 'notset' ? 'wrote' : 'edited',
      value: text,
      prev: v.value || null,
      facts: v.facts,
      from: v.from,
      at: Date.now(),
    };
    repaint(FID_OF[key]);
    B.toast(`${fd.label} saved - Brain uses your wording from now on`);
  }

  function generate(key) {
    const fd = fieldOf(key);
    ui.rp.bf[key] = { status: 'running' };
    repaint(FID_OF[key]);
    setTimeout(() => {
      if (fd.draft) {
        ui.rp.bf[key] = {
          status: 'partly',
          value: fd.draft,
          facts: fd.draftFacts,
          gen: true,
          at: Date.now(),
        };
        B.toast(
          `${fd.label} written from ${B.plural(fd.draftFacts.length, 'fact')} - check it, then confirm it`
        );
      } else {
        ui.rp.bf[key] = { status: 'notset', nothing: true };
        B.toast(`Nothing in the index says what ${fd.label} is yet`);
      }
      repaint(FID_OF[key]);
      const row = document.querySelector(`[data-bf-row="${CSS.escape(key)}"]`);
      if (row) B.motion.fadeIn(row, { duration: 0.2 });
    }, 1400);
  }

  const edit = (key, mode) => {
    ui.rp.bfEdit = { key, mode };
    repaint(FID_OF[key], key);
  };

  // one click handler for every field; true when it took the click
  function handle(e) {
    // the sheet's own controls
    if (e.target.closest('[data-bf-dclose]')) {
      closeDrawer();
      return true;
    }
    const step = e.target.closest('[data-bf-dstep]');
    if (step) {
      const fid = FID_OF[ui.rp.bfOpen];
      const list = shown(fid);
      const i = list.findIndex((x) => x.key === ui.rp.bfOpen);
      const next = list[i + Number(step.dataset.bfDstep)];
      if (next) openDrawer(next.key);
      return true;
    }
    /* a chip after the answer opens the field on the fact it cites - it sits inside
       the answer, so it is asked about before the answer itself */
    const cite = e.target.closest('[data-bf-cite]');
    if (cite) {
      // a citation opens the field and goes straight to the source it stands for
      const [key, fact] = cite.dataset.bfCite.split(':');
      Object.keys(ui.rp.bfFact).forEach((kk) => delete ui.rp.bfFact[kk]);
      ui.rp.bfFact[`${key}:${fact}`] = true;
      openDrawer(key);
      requestAnimationFrame(() => {
        const src = document.querySelector(`.bx-drawer [data-bf-fsrc="${CSS.escape(fact)}"]`);
        if (src) src.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return true;
    }
    // a fact opens to the passage it was read from
    const ft = e.target.closest('[data-bf-fact]');
    if (ft) {
      const key = ft.dataset.bfFact;
      ui.rp.bfFact[key] = !ui.rp.bfFact[key];
      const box = ft.parentElement;
      const disc = box && box.querySelector('.bx-disclose');
      box.classList.toggle('is-open', !!ui.rp.bfFact[key]);
      ft.setAttribute('aria-expanded', String(!!ui.rp.bfFact[key]));
      if (disc) X.setDisclose(box, !!ui.rp.bfFact[key], { trigger: ft });
      return true;
    }
    // what the table shows - the rows themselves never move
    const fl = e.target.closest('[data-bf-filter]');
    if (fl) {
      const fid = fl.dataset.bfFid;
      ui.rp.bfFilter[fid] = fl.dataset.bfFilter;
      ui.rp.bfPage[fid] = 0;
      repaint(fid);
      return true;
    }
    const more = e.target.closest('[data-bf-more]');
    if (more) {
      const key = more.dataset.bfMore;
      ui.rp.bfMore[key] = !ui.rp.bfMore[key];
      repaint(FID_OF[key]);
      return true;
    }
    /* the whole row opens the field, so anything inside it that does something
       else - a move, Show more, a citation - is caught above this. Selecting the
       answer's text is not a click on the row. */
    const opn = e.target.closest('[data-bf-open]');
    if (opn && !e.target.closest('[data-bf-act]')) {
      const sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length > 1 && opn.contains(sel.anchorNode)) return true;
      openDrawer(opn.dataset.bfOpen);
      return true;
    }
    const pg = e.target.closest('[data-bf-page]');
    if (pg) {
      const fid = pg.dataset.bfFid;
      const at = Number(pg.dataset.bfPage);
      const track = document.querySelector(`[data-bf-track="${fid}"]`);
      if (track) track.scrollTo({ left: at * track.clientWidth, behavior: 'smooth' });
      return true;
    }
    const btn = e.target.closest('[data-bf-act]');
    if (!btn) return false;
    const act = btn.dataset.bfAct;
    const key = btn.dataset.bfKey;
    const fd = key ? fieldOf(key) : null;
    if (act === 'add-field' || act === 'add-cancel') {
      const fid = btn.dataset.bfFid;
      ui.rp.bfAdd = act === 'add-field' ? fid : null;
      repaint(fid);
      const inp = document.querySelector(`[data-bf-new="${fid}"] [data-bf-new-name]`);
      if (inp) inp.focus();
      return true;
    }
    if (act === 'add-save') {
      addField(btn.dataset.bfFid);
      return true;
    }
    if (act === 'confirm-all') {
      const fid = btn.dataset.bfFid;
      const left = listOf(fid).filter((x) => kindOf(now(x)) === 'partly');
      if (!left.length) return true;
      const where =
        (B.fieldById[fid] || {}).title || (fid === 'roadmap' ? 'Roadmap' : 'this section');
      B.ask({
        icon: 'check',
        title: `Confirm ${B.plural(left.length, 'field')} in ${where}?`,
        body: `Every field here that is waiting to be checked is marked <b>Confirmed</b>, in your name and dated today. Fields with nothing in them are left alone, and you can still edit any of them afterwards.`,
        go: 'Confirm them',
        onGo: () => {
          left.forEach((x) => {
            ui.rp.bf[x.key] = {
              ...(ui.rp.bf[x.key] || {}),
              status: 'confirmed',
              confirmedNow: true,
              at: Date.now(),
            };
          });
          repaint(fid);
          B.toast(`${B.plural(left.length, 'field')} confirmed`);
        },
      });
      return true;
    }
    if (!fd) return true;
    const fid = FID_OF[key];
    switch (act) {
      case 'why':
        openDrawer(key);
        break;
      case 'confirm':
        ui.rp.bf[key] = {
          ...(ui.rp.bf[key] || {}),
          status: 'confirmed',
          confirmedNow: true,
          at: Date.now(),
        };
        repaint(fid);
        B.toast(`${fd.label} confirmed`);
        break;
      case 'edit':
      case 'notright':
      case 'set':
      case 'write':
        edit(key, act);
        break;
      case 'change':
        delete ui.rp.bf[key];
        edit(key, fd.you ? 'set' : 'write');
        break;
      case 'cancel':
        ui.rp.bfEdit = null;
        repaint(fid);
        break;
      case 'save':
        save(key);
        break;
      case 'none':
        ui.rp.bf[key] = { status: 'none', at: Date.now() };
        repaint(fid);
        B.toast(`${fd.label}: none - recorded as an answer`);
        break;
      case 'undo':
        /* a field the brand wrote before this session has its own wording in the
           data, so undo needs somewhere to land: what Brain read, or - where only
           the brand can answer it - back to Not set. */
        if (['wrote', 'edited', 'none'].includes(fd.status))
          ui.rp.bf[key] = fd.prev
            ? { status: 'partly', value: fd.prev, prev: null, at: null }
            : { status: 'notset', value: null, at: null };
        else delete ui.rp.bf[key];
        repaint(fid);
        B.toast(
          fd.you && !fd.prev
            ? `${fd.label} is back to Not set`
            : `${fd.label} is back to what Brain read`
        );
        break;
      case 'generate':
        generate(key);
        break;
      case 'strategy': {
        const go = document.querySelector('.bx-rf__nav [data-f-item="roadmap"]');
        if (go) go.click();
        else B.toast('The message hierarchy is kept in the approved 90-day strategy');
        break;
      }
      default:
        break;
    }
    return true;
  }

  // ⌘/Ctrl + Enter saves an open editor, Esc puts it away
  function keys(e) {
    if (e.key === 'Escape' && ui.rp.bfOpen && !e.target.closest('[data-bf-ta]')) {
      e.preventDefault();
      closeDrawer();
      return;
    }
    // a row is reached with the keyboard the way a button is
    const row = e.target.closest && e.target.closest('.bx-bfr__row[data-bf-open]');
    if (row && (e.key === 'Enter' || e.key === ' ') && e.target === row) {
      e.preventDefault();
      openDrawer(row.dataset.bfOpen);
      return;
    }
    const ta = e.target.closest && e.target.closest('[data-bf-ta]');
    if (!ta) return;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save(ta.dataset.bfTa);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      ui.rp.bfEdit = null;
      repaint(FID_OF[ta.dataset.bfTa]);
    }
  }

  /* the sheet is appended to the shell, outside the report's slot, so its own
     clicks and keys are caught here rather than by the view that opened it */
  if (!window.__bxfDrawerBound) {
    window.__bxfDrawerBound = true;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.bx-drawer.is-field')) return;
      if (e.target.closest('a[href]')) return;
      handle(e);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !ui.rp.bfOpen) return;
      if (e.target.closest('[data-bf-ta]')) return;
      e.preventDefault();
      closeDrawer();
    });
  }

  window.BXF = {
    viewHtml,
    closeDrawer,
    /* what a section still wants, by kind and with the fields' own names - the
       overview's review list says what it is asking for, not just how many */
    groups(fid) {
      const out = { you: [], gap: [] };
      listOf(fid).forEach((fd) => {
        const v = now(fd);
        const k = kindOf(v);
        if (out[k]) out[k].push({ label: v.label, need: v.need, key: v.key });
      });
      return out;
    },
    // the meter and the tally, for a section's own head
    head: (f, opts = {}) => headHtml(f, opts),
    tabExtra: () => '',
    counts,
    handle,
    keys,
    /* mark every field in a section that is still waiting to be checked. The
       roadmap confirms its fields and its plan in one move, so it needs this
       without going through the button. */
    confirmAll(fid) {
      const left = listOf(fid).filter((x) => kindOf(now(x)) === 'partly');
      left.forEach((x) => {
        ui.rp.bf[x.key] = {
          ...(ui.rp.bf[x.key] || {}),
          status: 'confirmed',
          confirmedNow: true,
          at: Date.now(),
        };
      });
      if (left.length) repaint(fid);
      return left.length;
    },
    has: (fid) => !!DATA[fid] || (ui.rp.bfNew[fid] || []).length > 0,

    /* ------------------------------------------------- read from other pages

       A Brain field surfaces wherever the product uses it, so the touchpoints on
       Home, Signal, the campaign and the library have to read a field the way
       this view reads it. They go through these three rather than keeping a copy:
       one vocabulary (Confirmed / Direct / Inferred / Missing), one place a
       confirmation is written, one way back to the field itself. */
    field(key) {
      const fd = fieldOf(key);
      if (!fd) return null;
      const v = now(fd);
      const k = kindOf(v);
      const st = stateOf(v, k);
      const fid = FID_OF[key];
      return {
        key,
        label: v.label,
        need: v.need,
        kind: k,
        state: st,
        word: STATE[st][0],
        tip: STATE[st][1],
        value: v.value || '',
        fid,
        section: (DATA[fid] || {}).section || '',
        // only what Brain wrote itself can be confirmed; an empty field is answered
        confirmable: k === 'partly',
        confirmedNow: !!v.confirmedNow,
        /* why an empty field is empty, which decides whether anyone but the brand
           can fill it - a touchpoint says "only you can answer this" from here */
        empty: k === 'you' ? 'you' : k === 'draft' ? 'draft' : k === 'gap' ? 'gap' : null,
      };
    },

    /* one field, one record - the same write the fields view makes, so a
       confirmation from Home or a campaign shows on the field itself */
    confirm(key) {
      const fd = fieldOf(key);
      if (!fd) return false;
      if (kindOf(now(fd)) !== 'partly') return false;
      ui.rp.bf[key] = {
        ...(ui.rp.bf[key] || {}),
        status: 'confirmed',
        confirmedNow: true,
        at: Date.now(),
      };
      repaint(FID_OF[key]);
      return true;
    },

    /* the brand answers an empty field from somewhere else in the product (the
       library records who owns a picture); it lands as the brand's own wording.
       What was there before comes back, so a touchpoint can offer to undo it. */
    declare(key, value) {
      const fd = fieldOf(key);
      if (!fd) return false;
      const prev = ui.rp.bf[key] ? { ...ui.rp.bf[key] } : null;
      ui.rp.bf[key] = {
        ...(ui.rp.bf[key] || {}),
        status: 'wrote',
        value,
        at: Date.now(),
      };
      repaint(FID_OF[key]);
      return prev || true;
    },

    // put a field back the way `declare` found it
    restore(key, prev) {
      if (!fieldOf(key)) return false;
      if (prev && typeof prev === 'object') ui.rp.bf[key] = { ...prev };
      else delete ui.rp.bf[key];
      repaint(FID_OF[key]);
      return true;
    },

    /* land on the field itself: the Brain tab, the report field it belongs to,
       then its drawer. The panel is redrawn on the way, which clears overlays,
       so the drawer opens after it. */
    openFrom(key, opts = {}) {
      if (!fieldOf(key)) return false;
      const fid = FID_OF[key];
      if (window.AppPages && window.AppPages.route !== 'brain') window.AppPages.go('brain');
      /* The table behind the drawer has to be showing the row the drawer is
         about, or the reader cannot see which field they are answering. A
         filter can hide it and a long section pages it away, so both are
         cleared on the way in. */
      if (!shown(fid).some((fd) => fd.key === key)) ui.rp.bfFilter[fid] = 'all';
      const at = shown(fid).findIndex((fd) => fd.key === key);
      if (at >= 0) ui.rp.bfPage[fid] = Math.floor(at / PER_PAGE);
      /* The report is a selection, not a scroll position: `fSel` is what it
         draws, so it is set before the panel is drawn again. (`B.goField` is
         from the report's older shape and leaves it on the overview, which is
         why the table behind the drawer used to be the wrong one.) */
      if (B.fieldById[fid] || fid === 'roadmap') ui.rp.fSel = fid;
      B.go('report');
      setTimeout(() => {
        /* a touchpoint can send the reader here to rewrite the answer, not only
           to read it: the drawer is built from this, so the editor has to be
           asked for before it is built rather than put over it afterwards */
        if (opts.edit) ui.rp.bfEdit = { key, mode: 'edit' };
        openDrawer(key);
        /* the track is a scroller, so the page it is on is a scroll position;
           then the row is brought into view, because a row marked as open on a
           part of the page nobody is looking at marks nothing */
        const track = document.querySelector(`[data-bf-track="${fid}"]`);
        const slide = track && track.children[ui.rp.bfPage[fid] || 0];
        if (track && slide && track.children[0])
          track.scrollLeft = slide.offsetLeft - track.children[0].offsetLeft;
        const row = document.querySelector(`[data-bf-row="${CSS.escape(key)}"]`);
        const main = document.getElementById('brain-main');
        if (row && main) {
          const to =
            main.scrollTop +
            row.getBoundingClientRect().top -
            main.getBoundingClientRect().top -
            150;
          main.scrollTo({ top: Math.max(0, to), behavior: reduce() ? 'auto' : 'smooth' });
        }
      }, 140);
      return true;
    },
    // a section of the brand's own: empty until someone adds a field to it
    addSection(id, title, question) {
      DATA[id] = { section: title, fields: [] };
      SYNTH[id] = { id, title, question };
    },
  };
})();
