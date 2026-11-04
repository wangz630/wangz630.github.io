/* The Brain notice - the one component every Brain touchpoint is made of.

   Brain holds 55 fields. Four of them are Confirmed, most are Brain's own
   reading, and some nobody has answered. The rest of the product uses those
   fields anyway, so wherever it is about to act on one the notice says, before
   the button is pressed, either what this will record or what is still missing -
   and it names the field, never a count.

   It has four voices, and they are never mixed in one notice:

     record   what pressing this will write down            Looks right / Continue
     guess    some of this is Brain's reading, not a fact   Confirm these
     blocked  this will not go out, and here is what stops it   (no primary)
     later    there is no answer to this yet, only a note   Got it

   The rules it keeps, which are the component's job rather than each page's:

     - it hugs the control that opened it, and leaves when that control does
     - it names the field (label + key), so "3 items" is never the whole message
     - one notice at a time, so nothing stacks on one button
     - no permission, no button: the row says who it waits on instead
     - a confirmation is one record per field, even when confirmed as a group,
       and it is written through BXF so the field itself shows it

   The touchpoints at the foot of this file are four of the nine: Home, Signal,
   Publishing (the campaign a post goes out from) and the library. */
(function () {
  'use strict';

  const B = window.Brain;
  const { esc, icon, ui } = B;
  const BXF = () => window.BXF;

  /* the design names a notice can wear, from the prototype panel's rows */
  const SKINS = ['queue', 'compact', 'sheet', 'split', 'gate', 'board'].map((n) => `is-${n}`);

  const TONES = {
    record: { word: 'Will be recorded', mark: 'circle-check', go: 'Looks right' },
    guess: { word: 'Still a guess', mark: 'alert', go: 'Confirm these' },
    blocked: { word: 'Will not publish', mark: 'exit', go: null },
    later: { word: 'No answer yet', mark: 'clock', go: 'Got it' },
  };

  /* every confirmation made in this session, one line per field - the component
     reports the count because the point of it is that nothing is recorded quietly */
  const ledger = [];

  let host = null; // what the notice is mounted in (with a scrim, when modal)
  let el = null; // the notice, while one is up
  let make = null; // the touchpoint it belongs to
  let spec = null; // what it is showing, re-derived on every paint
  let at = null; // the control it hugs
  let pick = null; // the option chosen inside it, for the ones that ask
  let page = 0; // which block is up, for the ones that turn
  let land = false; // a queue just opened, so it has not been paged yet
  let turned = 0; // which way a queue last turned, for the paint that follows
  const shown = {}; // answers opened out past their clamp

  /* --------------------------------------------------------------- the field */

  /* Who a check waits on when it is not the reader's to make. A name on its own
     reads as a label; the face reads as a person who has to act, which is what
     the row means. The picture is the approver's, as the plan already draws it. */
  const OWNER = {
    name: 'Devin O.',
    says: 'approves claims',
    face: 'assets/avatars/approver.png',
  };

  /* asks sent to the owner this session: the ask is itself a record, and the row
     says so until the owner has acted */
  const asked = {};

  const faceHtml = (size = 18) =>
    `<img class="bxn__face" src="${OWNER.face}" width="${size}" height="${size}" alt="">`;

  /* a mark that carries a sentence instead of printing it */
  const infoHtml = (tip, label) =>
    `<button type="button" class="bxn__info" data-tip="${esc(tip)}" aria-label="${esc(label || tip)}">${icon('info', 12)}</button>`;

  /* ONE row, for every list in every notice: the field's name with its key, what
     Brain actually holds for it, the state as a label in the one vocabulary, and
     the single move the row offers.

     The value is the point of the row. Confirm is a promise about a particular
     sentence, and a reader who cannot see the sentence is being asked to promise
     nothing in particular - so it is printed, clamped to two lines, and the
     reasoning that used to sit under it moved onto the block's own info mark. */
  function rowHtml(r) {
    return `
      <li class="bxn__item is-${r.state}${r.fresh ? ' is-fresh' : ''}${r.fail ? ' is-fail' : ''}${r.id ? '' : ''}"${r.id ? ` data-bxn-row="${esc(r.id)}"` : ''}>
        ${
          r.lead ||
          `<span class="bxn__ihead">
             <span class="bxn__iname">${esc(r.name)}</span>
             <span class="bxn__lab is-${r.state}">${esc(r.word)}</span>
           </span>
           ${r.note ? `<span class="bxn__inote">${esc(r.note)}</span>` : ''}`
        }
        ${
          r.value
            ? `<span class="bxn__ival${r.tight ? ' is-tight' : ''}${r.open ? ' is-open' : ''}">${esc(r.value)}</span>${
                r.more
                  ? `<button type="button" class="bxn__more" data-bxn-more="${esc(r.key)}">${r.open ? 'Show less' : 'Show more'}</button>`
                  : ''
              }`
            : ''
        }
        ${r.extra || ''}
        ${r.owner || ''}
        <span class="bxn__ifoot">
          ${r.key ? `<code class="bxn__ikey">${esc(r.key)}</code>` : '<span></span>'}
          <span class="bxn__iact">${r.act || ''}</span>
        </span>
      </li>`;
  }

  /* A Brain field, read through BXF so the words on it are the product's own.
     Anything the surface wants to add is `note`; nothing is repeated down the
     list - what is true of every row in a group is said once, on the group. */
  function row(r) {
    const f = BXF() && BXF().field(r.key);
    if (!f) return '';
    const wait = !!r.wait;
    const sent = wait && asked[r.key];
    const skin = spec.skin;
    /* Compact never shows what Brain wrote, so it cannot ask anyone to confirm
       it from there: its move is the way to read it. */
    const blind = skin === 'compact';
    const open = (label, opts) =>
      `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs bxn__go" data-bxn-open="${esc(f.key)}"${opts || ''} aria-label="${esc(`Open ${f.label} in Brain`)}">${label}${icon('arrow-right', 12)}</button>`;
    const act = f.confirmedNow
      ? `<span class="bxn__done">${icon('check', 13)}Recorded</span>`
      : sent
        ? `<span class="bxn__sent">${icon('clock', 13)}Sent</span>`
        : wait
          ? `<button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-bxn-ask="${esc(f.key)}">Send</button>`
          : !f.confirmable
            ? open(f.state === 'missing' ? 'Answer it' : 'Open')
            : blind
              ? open('Review')
              : /* the three moves an answer offers: say it is right, say it is
                   wrong and rewrite it, or go and read the whole of it */
                `${open('', ' data-bxn-peek title="Open in Brain"')}
                 <button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-bxn-correct="${esc(f.key)}">Correct</button>
                 <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bxn-confirm="${esc(f.key)}">Confirm</button>`;
    return rowHtml({
      name: f.label,
      key: f.key,
      // what Brain holds, which is the thing Confirm is a promise about
      value: f.value,
      open: !!shown[f.key],
      /* a long answer is read here rather than only in Brain; whether it is
         long enough to need the control is settled by measuring the clamp
         after the paint, not by counting letters */
      more: skin === 'sheet' && !!f.value,
      note: r.note,
      state: f.state,
      word: f.confirmedNow ? 'confirmed' : f.word.toLowerCase(),
      fresh: f.confirmedNow,
      act,
      owner: wait
        ? `<span class="bxn__owner">${faceHtml()}<span>${sent ? `Sent to <b>${esc(OWNER.name)}</b>` : `Only <b>${esc(OWNER.name)}</b> can confirm this`}</span></span>`
        : '',
    });
  }

  /* A check that is not a Brain field of its own - the channel's connection, a
     withdrawal - drawn as the same row so a list never changes shape halfway. */
  /* The label is the field's own state in the one vocabulary - Confirmed,
     Direct, Inferred, Missing - never a second set of words invented for this
     list. Whether the check passes is said by the row itself, which is washed
     when it does not, and by the count on the block's head. The two checks that
     are not Brain fields (the channel's connection, a withdrawal) still take a
     word from the same four: nothing recorded is Missing, settled is Confirmed. */
  function checkRow(c) {
    const f = c.key ? BXF().field(c.key) : null;
    const state = c.ask ? (c.ok ? 'confirmed' : 'missing') : f ? f.state : 'missing';
    const id = c.key || `ask:${c.ask.id}`;
    /* A check that does not pass is a different kind of row from one that does,
       so it is drawn as one: what is wrong leads, in the card's largest words,
       with the mark beside it carrying the colour; which field it is and what
       state it is in read under it, as a byline. A check that passes keeps the
       ordinary head, which is how the two tell themselves apart at a glance. */
    /* The state belongs in the corner of the card, where a row that passes
       keeps it - a row that does not should not move it somewhere else. And a
       field Brain read is not the same as one somebody checked, so it says
       both: `direct \u00b7 unconfirmed`. */
    const word =
      state === 'confirmed' || state === 'missing' ? state : `${state} \u00b7 unconfirmed`;
    const lead = c.ok
      ? ''
      : `<span class="bxn__alert">
           <span class="bx-tile bxn__amark" aria-hidden="true">${icon('alert', 15)}</span>
           <span class="bxn__acopy">
             <strong>${esc(c.note)}</strong>
             <small>${esc(c.label)}</small>
           </span>
         </span>
         <span class="bxn__lab is-${state} bxn__labtop">${esc(word)}</span>`;
    const act = c.ask
      ? c.ok
        ? `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs bxn__go" data-bxn-change="${esc(c.ask.id)}">Change${icon('undo', 12)}</button>`
        : ''
      : `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs bxn__go" data-bxn-open="${esc(c.key)}" aria-label="${esc(`${c.move} in Brain`)}">${esc(c.move)}${icon('arrow-right', 12)}</button>`;
    return rowHtml({
      id,
      name: c.label,
      key: c.key,
      note: c.note,
      /* A check that is in says so and stops: what it holds is in Brain, and
         repeating it here only makes the ones still open harder to find. One
         with nothing in it has nothing to print either, so both close up and
         leave the room to the rows that need reading. */
      value: c.ok || !f || !f.value ? '' : f.value,
      tight: true,
      // a reading the clamp cuts offers the rest of itself; `trimMore` takes
      // the control off again on the rows where nothing was actually cut
      more: !!(f && f.value),
      open: !!shown[c.key],
      state,
      word,
      fail: !c.ok,
      lead,
      extra: c.ask ? askHtml(c.ask) : '',
      act,
    });
  }

  /* The two this campaign answers for itself are answered here. One is a choice
     from what the store is actually running, the other a line to write; both are
     one control and one Save, because a question with a visible answer box is
     answered far more often than one with a button that opens a box. */
  function askHtml(a) {
    if (said[a.id]) return '';
    const open = pickOpen === a.id;
    const at = chose[a.id];
    return `
      <span class="bxn__ask2">
        ${
          a.pick
            ? `<span class="bxn__pick${open ? ' is-open' : ''}">
                 <button type="button" class="bxn__picked" data-bxn-pickopen="${esc(a.id)}" aria-expanded="${open}" aria-haspopup="listbox">
                   <span${at ? '' : ' class="is-none"'}>${esc(at || 'Choose one…')}</span>
                   ${icon('chevron-down', 14)}
                 </button>
                 <ul class="bxn__picks" role="listbox"${open ? '' : ' hidden'}>
                   ${a.pick
                     .map(
                       (o) =>
                         `<li role="option" aria-selected="${o === at}"><button type="button" class="bxn__pickone${o === at ? ' is-on' : ''}" data-bxn-pickval="${esc(a.id)}" data-bxn-val="${esc(o)}">${esc(o)}${o === at ? icon('check', 13) : ''}</button></li>`
                     )
                     .join('')}
                 </ul>
               </span>`
            : `<input type="text" class="bxn__wr" data-bxn-in="${esc(a.id)}" placeholder="${esc(a.write)}" aria-label="${esc(a.label)}" />`
        }
        <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bxn-save="${esc(a.id)}">Save</button>
      </span>`;
  }

  /* A reason the notice asks for: the words, and the one-word name of the list it
     lands on. Where exactly it lands is on the row's title, not in its copy.

     When the notice asks one question and nothing else (`picks`), the answer is
     the move: there is no tick to set and then confirm, because pressing the
     reason has already said everything the notice wanted. */
  function option(o) {
    const one = !!spec.picks;
    const on = !one && pick === o.id;
    const f = o.key ? BXF().field(o.key) : null;
    const design = spec.optsDesign || 'list';
    const lands = f ? f.label : 'Not recorded';
    const tip = f ? ` title="${esc(`Goes on ${f.label} · ${f.key}`)}"` : '';
    /* Split says the consequence on a line of its own; the other two carry it at
       the right of the reason, as a label or as plain words. Every one says it. */
    const body =
      design === 'split'
        ? `<span class="bxn__otext"><span class="bxn__oname">${esc(o.label)}</span><span class="bxn__osub${f ? '' : ' is-none'}">${f ? `Goes on ${esc(lands)}` : 'Nothing is written down'}</span></span>`
        : `<span class="bxn__oname">${esc(o.label)}</span><span class="bxn__lands${f ? '' : ' is-none'}">${esc(lands)}</span>`;
    const glyph =
      o.glyph && (design === 'rows' || design === 'split')
        ? `<span class="bx-tile is-sm bxn__oglyph" aria-hidden="true">${icon(o.glyph, 12)}</span>`
        : '';
    return `
      <li>
        <button type="button" class="bxn__opt ${one ? 'is-one' : ''} ${on ? 'is-on' : ''}" data-bxn-pick="${esc(o.id)}" ${one ? '' : `aria-pressed="${on}"`}${tip}>
          ${one ? '' : '<span class="bxn__tick" aria-hidden="true"></span>'}
          ${glyph}${body}
          ${one && design === 'rows' ? icon('chevron-right', 14) : ''}
        </button>
      </li>`;
  }

  /* A block, not a run of rows: its own head, what is left to do on it, the
     rows, and - this is the point - its own move at the foot. Two blocks that
     want two different things are two calls to action, not one at the bottom of
     the card for whichever of them happens to be first.

     What is true of everything in the block is on an info mark beside its name,
     not printed under it. */
  function groupHtml(g, i) {
    const items = g.items || [];
    const checks = g.checks || [];
    const left = items.filter((r) => {
      const f = BXF().field(r.key);
      return f && f.confirmable && !r.wait && !f.confirmedNow;
    });
    const open = checks.length
      ? checks.filter((c) => !c.ok)
      : items.filter((r) => {
          const f = BXF().field(r.key);
          return f && f.state !== 'confirmed';
        });
    /* Focus shows only what is in the way; the checks that pass fold into a line
       under them, because "it passed" is worth one line, not a row each. */
    const fold = spec.fold && checks.length && open.length && open.length < checks.length;
    const shown = fold ? checks.filter((c) => !c.ok) : checks;
    const body = checks.length ? shown.map(checkRow).join('') : items.map(row).join('');
    const passed = fold
      ? `<p class="bxn__gpass">${icon('check', 12)}${esc(
          checks
            .filter((c) => c.ok)
            .map((c) => c.label)
            .join(', ')
        )} ${checks.length - open.length === 1 ? 'is in' : 'are in'}</p>`
      : '';
    const move = g.together
      ? left.length > 1
        ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs bxn__all" data-bxn-group="${i}">${icon('check', 13)}Confirm all ${left.length}</button>`
        : ''
      : g.answer && open.length
        ? `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs bxn__all" data-bxn-answer="${i}">${esc(g.answer)}${icon('arrow-right', 13)}</button>`
        : '';
    return `
      <section class="bxn__group">
        <div class="bxn__ghead">
          <p class="bxn__glabel">${esc(g.label)}${g.sub ? infoHtml(`${g.label} · ${g.sub}`, `What ${g.label} means`) : ''}</p>
          <span class="bxn__gcount${open.length ? '' : ' is-clear'}">${
            open.length ? `${open.length} to go` : `${icon('check', 11)}All in`
          }</span>
        </div>
        <ul class="bxn__list">${body}</ul>
        ${passed}
        ${move ? `<div class="bxn__gfoot">${move}</div>` : ''}
      </section>`;
  }

  /* ---------------------------------------------------------------- the card */

  function html() {
    const t = TONES[spec.tone];
    const go = 'go' in spec ? spec.go : t.go;
    const items = spec.items ? `<ul class="bxn__list">${spec.items.map(row).join('')}</ul>` : '';
    /* Queue: one answer at a time, taken from both blocks in order. Two lists on
       one card is seven things asked at once; this asks one, and says which. */
    const flat = spec.one && spec.groups ? spec.groups.flatMap((g) => g.items || []) : null;
    if (flat) {
      /* Opening the queue lands on the first answer still open: coming back to
         it after settling one should show what is left, not what is done. */
      if (land) {
        // an item names its field; its state is the field's, read live
        const next = flat.findIndex((r) => {
          const f = r.key ? BXF().field(r.key) : null;
          return !f || f.state !== 'confirmed';
        });
        page = next < 0 ? 0 : next;
        land = false;
      }
      page = Math.min(Math.max(0, page), flat.length - 1);
    }
    const groups = !spec.groups
      ? ''
      : flat
        ? `<div class="bxn__turn">
             <div class="bxn__pager">
               <button type="button" class="bxn__parrow" data-bxn-page="-1" aria-label="The answer before this"${page === 0 ? ' disabled' : ''}>${icon('chevron-left', 15)}</button>
               <span class="bxn__pcount bx-num">${page + 1} of ${flat.length}</span>
               <button type="button" class="bxn__parrow" data-bxn-page="1" aria-label="The answer after this"${page === flat.length - 1 ? ' disabled' : ''}>${icon('chevron-right', 15)}</button>
             </div>
             <ul class="bxn__list">${row(flat[page])}</ul>
           </div>`
        : spec.groups.map((g, i) => groupHtml(g, i)).join('');
    const opts = spec.options
      ? `<ul class="bxn__opts is-${spec.optsDesign || 'list'}">${spec.options.map(option).join('')}</ul>`
      : '';
    /* The one move that is not the reader's to make reads as a person, not as a
       word in a row of buttons: a face, a name, and what they are being asked. */
    const second = spec.secondary
      ? spec.secondary.face
        ? `<button type="button" class="bxn__ask" data-bxn-second>
             ${faceHtml(28)}
             <span class="bxn__asktext"><b>${esc(spec.secondary.label)}</b><small>${esc(spec.secondary.sub || '')}</small></span>
             ${icon('arrow-right', 13)}
           </button>`
        : `<button type="button" class="bx-btn bx-btn--ghost bx-btn--xs bxn__second" data-bxn-second>${esc(spec.secondary.label)}</button>`
      : '';
    /* Bare: the question is the control that was pressed, and the choices answer
       it, so the head and the foot go. The card itself stays - the same surface,
       the same lift and the same arrow back to the control as every other notice
       - with nothing in it but the choices. */
    if (spec.bare)
      return `
        ${spec.modal ? '' : '<div class="bxn__arrow" aria-hidden="true"></div>'}
        <div class="bxn__scroll">${opts}</div>`;
    return `
      ${spec.modal ? '' : '<div class="bxn__arrow" aria-hidden="true"></div>'}
      <div class="bxn__head">
        <span class="bx-tile is-sm bxn__mark" aria-hidden="true">${icon(t.mark, 13)}</span>
        <span class="bxn__title">
          <span class="bx-label bxn__tone">${esc(t.word)}</span>
          <strong>${esc(spec.title)}${spec.info ? infoHtml(spec.info, 'What a claim carries') : ''}</strong>
          ${spec.info ? `<span class="bxn__railnote">${esc(spec.info.split(' · ').pop())}</span>` : ''}
        </span>
        <button type="button" class="bxn__x" data-bxn-no aria-label="Close">${icon('x', 14)}</button>
      </div>
      <div class="bxn__scroll">
        ${
          spec.meter
            ? `<div class="bxn__meter">
                 <div class="bxn__mbar"><i style="width:${Math.round((spec.meter.done / spec.meter.total) * 100)}%"></i></div>
                 <p class="bxn__mcount"><b class="bx-num">${spec.meter.done}</b> of ${spec.meter.total} checks in</p>
               </div>`
            : ''
        }
        ${spec.body ? `<p class="bxn__body">${spec.body}</p>` : ''}
        ${items}${groups}${opts}
        ${spec.foot ? `<p class="bxn__foot">${spec.foot}</p>` : ''}
      </div>
      <div class="bxn__acts"${!go && !spec.secondary ? ' hidden' : ''}>
        ${second}
        <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-bxn-no>${esc(spec.no || (go ? 'Not now' : 'Close'))}</button>
        ${go ? `<button type="button" class="bx-btn bx-btn--primary bxn__gobtn" data-bxn-go ${spec.needsPick && !pick ? 'aria-disabled="true"' : ''}>${esc(go)}</button>` : ''}
      </div>`;
  }

  /* ------------------------------------------------------------- where it sits

     Fixed, because a trigger can sit in a scroller, a drawer or the sidebar; it
     is measured against the viewport and re-measured while either moves. */
  function place() {
    if (!el) return;
    // a modal is not hung off anything; it sits in the middle and stays there
    if (el.classList.contains('is-modal')) return;
    if (!at || !at.isConnected) return close();
    const gut = 12;
    const r = at.getBoundingClientRect();
    /* It takes the side with room and never grows past it: a notice that ran off
       the bottom of the window would hide the very move it is asking for. */
    const below = window.innerHeight - r.bottom - 10 - gut;
    const above = r.top - 10 - gut;
    const want = Math.min(el.scrollHeight, 620);
    const up = below < want && above > below;
    el.classList.toggle('is-up', up);
    el.style.maxHeight = `${Math.max(180, Math.min(up ? above : below, 620))}px`;
    const h = el.offsetHeight;
    const w = el.offsetWidth;
    const top = up ? r.top - 10 - h : r.bottom + 10;
    const left = Math.min(Math.max(gut, r.left + r.width / 2 - w / 2), window.innerWidth - w - gut);
    el.style.top = `${Math.max(gut, top)}px`;
    el.style.left = `${left}px`;
    const arrow = el.querySelector('.bxn__arrow');
    if (arrow) {
      const x = Math.min(Math.max(18, r.left + r.width / 2 - left), w - 18);
      arrow.style.left = `${x}px`;
    }
  }

  /* The spec is re-derived every time, never kept: a field confirmed in this
     notice has to read as confirmed in the same breath, and so does a check that
     another touchpoint has since cleared. */
  /* the last page a turning notice has, so a turn that would run past it is not
     drawn as a turn at all */
  function lastPage() {
    if (!spec || !spec.one || !spec.groups) return 0;
    return spec.groups.reduce((n, g) => n + (g.items || []).length, 0) - 1;
  }

  function paint() {
    if (!el) return;
    /* `html()` writes the card again whole, so the panel that scrolls inside it
       is built from nothing and starts at its head. Opening a picker halfway
       down the checks threw the reader back to the top of them, which looks
       like the page jumping rather than a list opening. Hold the place.

       Not when the queue turns: there the answer being read has changed, and
       the head of the new one is where the reader should be. */
    const was = turned ? [] : [...el.querySelectorAll('.bxn__scroll')].map((n) => n.scrollTop);
    spec = make(at);
    el.innerHTML = html();
    // before anything is measured off the card, so nothing is measured mid-jump
    el.querySelectorAll('.bxn__scroll').forEach((n, i) => {
      if (was[i]) n.scrollTop = was[i];
    });
    turnPick();
    place();
    /* The card is measured after it has been placed, not before: asked too
       early it has no height yet, every reading looks uncut, and the control
       to see the rest is taken off the one row that needed it. */
    trimMore();
    setTimeout(trimMore, 0);
    /* A queue answers one thing at a time, so moving between them should be
       seen to be a move: the answer comes in from the side it was turned to,
       and the count follows it. */
    if (turned) {
      const turn = el.querySelector('.bxn__turn');
      if (turn) {
        B.motion.slideIn(turn.querySelector('.bxn__list'), { x: turned * 26, duration: 0.3 });
        B.motion.fadeIn(turn.querySelector('.bxn__pcount'), { duration: 0.3 });
      }
      turned = 0;
    }
  }

  /* The ask it belongs to is the last row of a panel that scrolls, so a list
     that always dropped would be cut off by the panel's own edge. It opens
     upward when there is no room under it. */
  function turnPick() {
    const list = el.querySelector('.bxn__picks:not([hidden])');
    if (!list) return;
    const box = el.querySelector('.bxn__scroll') || el;
    const room = box.getBoundingClientRect().bottom - list.getBoundingClientRect().top;
    if (room < list.offsetHeight + 8) list.closest('.bxn__pick').classList.add('is-up');
  }

  /* Only a value the clamp actually cuts offers to show the rest. The cut is a
     height, so it is known after the text is laid out - a letter count guesses
     it and gets rows of three short lines wrong in both directions. */
  function trimMore() {
    if (!el) return;
    el.querySelectorAll('[data-bxn-more]').forEach((btn) => {
      const val = btn.previousElementSibling;
      if (!val || !val.classList.contains('bxn__ival')) return;
      // nothing can be told from a box that has not been laid out yet
      if (!val.clientHeight) return;
      if (!val.classList.contains('is-open') && val.scrollHeight <= val.clientHeight + 2)
        btn.remove();
    });
  }

  function close() {
    if (!el) return;
    const was = at;
    (host || el).remove();
    host = null;
    el = null;
    make = null;
    spec = null;
    at = null;
    pick = null;
    page = 0;
    land = false;
    document.removeEventListener('scroll', place, true);
    window.removeEventListener('resize', place);
    if (was && was.isConnected) {
      was.classList.remove('is-bxn-on');
      was.removeAttribute('aria-expanded');
    }
  }

  function open(kind, trigger) {
    const fn = typeof kind === 'function' ? kind : TOUCH[kind];
    if (!fn) return;
    // one notice at a time, and the same control closes the one it opened
    const same = el && at === trigger;
    close();
    if (same) return;
    make = fn;
    at = trigger;
    pick = null;
    page = 0;
    land = true;
    /* Most of them hug the control that opened them. A checklist long enough to
       be read in blocks does not: it takes the middle of the screen, because a
       panel that tall hanging off a button is harder to read, not closer to it. */
    const first = fn(trigger);
    const modal = !!first.modal;
    host = document.createElement('div');
    host.className = modal ? 'bxn-host is-modal' : 'bxn-host';
    if (modal) host.innerHTML = '<div class="bxn__scrim" data-bxn-no></div>';
    el = document.createElement('div');
    el.className = `bxn is-${first.tone}${modal ? ' is-modal' : ''}${first.bare ? ' is-bare' : ''}${first.skin ? ` is-${first.skin}` : ''}`;
    el.setAttribute('role', 'dialog');
    if (modal) el.setAttribute('aria-modal', 'true');
    host.appendChild(el);
    (document.querySelector('.app-shell') || document.body).appendChild(host);
    paint();
    el.setAttribute('aria-label', spec.title);
    if (trigger) {
      trigger.classList.add('is-bxn-on');
      trigger.setAttribute('aria-expanded', 'true');
    }
    document.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const modal = el.classList.contains('is-modal');
      if (modal)
        gsap.fromTo(host.firstElementChild, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      gsap.fromTo(
        el,
        { y: modal ? 10 : el.classList.contains('is-up') ? 6 : -6, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: modal ? 0.26 : 0.2,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
        }
      );
    }
    const focus = el.querySelector(
      '[data-bxn-go], [data-bxn-pick], [data-bxn-confirm], [data-bxn-no]'
    );
    if (focus) focus.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------- the way back

     A notice sends the reader into Brain to answer one of the things it is
     waiting on. Without this they land on a field, confirm it, and are on their
     own: back to the campaign, find the post, press Approve again to see what is
     left. So the notice leaves a thread behind it - a strip that stays while they
     are away, counts down as they work, and puts them back where they were. */

  /* A run: the reader is sent into Brain to answer a string of fields, and the
     bar at the head of the screen is the only thing that knows how far they
     are. It says which one is up, how many are in, and takes them to the next;
     its list - folded until asked for - says which ones are still open.

     The bar is pinned across the top of the window and the field drawer drops
     under it (`body.bxn-running`), because a run is a state the whole screen is
     in, not a note on one corner of it. */

  let run = null; // { label, keys, route, touch, at }
  let runEl = null;
  let runList = false; // the fold is open
  let atWasIn = false; // whether the answer up now was already in at the last paint

  const runState = (k) => (BXF().field(k) || {}).state;
  const runIn = () => (run ? run.keys.filter((k) => runState(k) === 'confirmed') : []);
  const runOpenKeys = () => (run ? run.keys.filter((k) => runState(k) !== 'confirmed') : []);

  /* true while the drawer has been asked for and has not arrived - the bar
     must not mistake that for a drawer the reader has closed */
  let arriving = false;
  let arriveT = null;

  function startRun(from) {
    run = { ...from, at: null };
    arriving = false;
    clearTimeout(arriveT);
    runList = false;
    // the bar reports every answer going in, so nothing else needs to
    if (B.setQuiet) B.setQuiet(true);
    const next = runOpenKeys()[0] || run.keys[0];
    runTo(next);
  }

  /* going to a field is the run moving, so the bar and the drawer are one act */
  function runTo(key) {
    if (!run) return;
    run.at = key;
    atWasIn = runState(key) === 'confirmed';
    /* `openFrom` routes to Brain, redraws the report and only then opens the
       drawer, on a timer - so between this line and that one `bfOpen` is still
       empty, which to the bar looks exactly like a drawer somebody has shut.
       It was painting the resume notice for those few frames on every move,
       which is the flash on the way in. Say the drawer is coming. */
    arriving = true;
    clearTimeout(arriveT);
    // and if it never does, the bar must not be left waiting for it
    arriveT = setTimeout(() => {
      arriving = false;
      if (run) paintRun();
    }, 900);
    paintRun();
    BXF().openFrom(key);
    setTimeout(placeRun, 280);
  }

  function runNext() {
    if (!run) return;
    const left = runOpenKeys();
    if (!left.length) return endRun();
    // the one after the one being read, wrapping, so Next never stalls on itself
    const after = run.keys
      .slice(run.keys.indexOf(run.at) + 1)
      .find((k) => runState(k) !== 'confirmed');
    runTo(after || left[0]);
  }

  function endRun() {
    const back = run;
    run = null;
    arriving = false;
    clearTimeout(arriveT);
    runList = false;
    atWasIn = false;
    if (B.setQuiet) B.setQuiet(false);
    paintRun();
    if (!back) return;
    if (window.BXF && ui.rp.bfOpen) BXF().closeDrawer();
    if (window.AppPages && window.AppPages.route !== back.route) window.AppPages.go(back.route);
    setTimeout(() => {
      const to = document.querySelector(
        `[data-bxn-at="${back.touch}"], [data-bxn="${back.touch}"]`
      );
      if (!to) return;
      to.scrollIntoView({ block: 'center' });
      /* a run started from a panel puts the reader back in front of it, now
         reading the answers they just gave; one started from a page has nothing
         to reopen and the page itself is the thing to come back to */
      if (TOUCH[back.touch]) open(back.touch, to);
    }, 220);
  }

  function runRowHtml(k) {
    const f = BXF().field(k) || {};
    const on = k === run.at;
    const done = f.state === 'confirmed';
    return `
      <li>
        <button type="button" class="bxn-run__row${on ? ' is-on' : ''}${done ? ' is-done' : ''}" data-bxn-runto="${esc(k)}">
          <span class="bxn-run__tick" aria-hidden="true">${done ? icon('check', 12) : ''}</span>
          <span class="bxn-run__rname">${esc(f.label || k)}</span>
          <span class="bxn__lab is-${f.state || 'missing'}">${esc(f.state || 'missing')}</span>
        </button>
      </li>`;
  }

  function paintRun() {
    document.body.classList.toggle('bxn-running', !!run);
    if (!run) {
      if (runEl) runEl.remove();
      runEl = null;
      document.body.classList.remove('bxn-run-inside');
      clearInside();
      return;
    }
    const born = !runEl;
    if (!runEl) {
      runEl = document.createElement('div');
      (document.querySelector('.app-shell') || document.body).appendChild(runEl);
      runEl.addEventListener('click', onRunClick);
    }
    const design = B.homeDesign ? B.homeDesign() : 'float';
    // shut mid-run, which is not the same as not open yet - see runTo
    const away = !ui.rp.bfOpen && !arriving;
    /* Inside puts the run in the drawer's own foot, so while the drawer is
       there the bar has nothing to draw; when it is shut, every design falls
       back to the same thing - the run saying it is still going. */
    const inFoot = !away;
    document.body.classList.toggle('bxn-run-inside', inFoot);
    /* The run saying it is still going is one thing in one place, whichever
       design it interrupts - so the design's own class comes off with it, or
       the notice inherits a width, a column or a transform meant for something
       else and arrives folded in half. */
    runEl.className = away
      ? 'bxn-run is-away'
      : `bxn-run is-${design}${runList ? ' is-listing' : ''}`;
    runEl.innerHTML = away ? awayHtml() : runBodyHtml();
    if (inFoot) paintInside(design);
    else clearInside();
    placeRun();
    // it arrives with the page it belongs to, not on top of the one being left
    if (born) B.motion.rise(runEl.firstElementChild, { y: -10, duration: 0.34 });
    /* An answer going in is the moment the reader has to be told where to go
       next, and the bar is not where they are looking - they are in the drawer,
       on the button they just pressed. So Next says so itself. */
    const nowIn = runState(run.at) === 'confirmed';
    if (nowIn && !atWasIn) nudgeNext();
    atWasIn = nowIn;
  }

  function nudgeNext() {
    document.querySelectorAll('.bxn-run__next').forEach((b) => {
      b.classList.remove('is-nudge');
      // restart it even when two answers go in one after the other
      void b.offsetWidth;
      b.classList.add('is-nudge');
      setTimeout(() => b.classList.remove('is-nudge'), 2600);
    });
  }

  function onRunClick(e) {
    if (e.target.closest('[data-bxn-runend]')) return endRun();
    if (e.target.closest('[data-bxn-runnext]')) return runNext();
    if (e.target.closest('[data-bxn-runhome]')) {
      /* Later means later, not elsewhere: the run is dropped and the reader is
         left where they are. Going back to where it started is the other
         button, and it says so. */
      run = null;
      runList = false;
      if (B.setQuiet) B.setQuiet(false);
      paintRun();
      return;
    }
    if (e.target.closest('[data-bxn-runon]')) return runTo(run.at);
    if (e.target.closest('[data-bxn-runlist]')) {
      runList = !runList;
      paintRun();
      return;
    }
    const to = e.target.closest('[data-bxn-runto]');
    if (to) {
      runList = false;
      runTo(to.dataset.bxnRunto);
    }
  }

  /* the numbers every design is drawn from */
  function runFigures() {
    const inAll = runIn().length;
    const total = run.keys.length;
    return {
      inAll,
      total,
      left: total - inAll,
      at: run.keys.indexOf(run.at) + 1,
      now: BXF().field(run.at) || {},
      done: runState(run.at) === 'confirmed',
    };
  }

  const foldHtml = () => {
    const { left } = runFigures();
    return `
      <div class="bxn-run__fold"${runList ? '' : ' hidden'}>
        <p class="bxn-run__fhead">${esc(run.label)}<b class="bx-num">${left ? `${left} open` : 'all confirmed'}</b></p>
        <ul class="bxn-run__rows">${run.keys.map(runRowHtml).join('')}</ul>
      </div>`;
  };

  /* every design offers the same way out of the run, in the same words */
  const homeBtn = (words) =>
    `<button type="button" class="bxn-run__back${words ? '' : ' is-icon'}" data-bxn-runend${words ? '' : ` aria-label="Back to ${esc(run.short || 'where I was')}"`}>${icon('arrow-left', 14)}${words ? `<span>${esc(run.short || 'Done')}</span>` : ''}</button>`;

  const listBtn = (words) =>
    `<button type="button" class="bxn-run__list${words ? ' is-words' : ''}" data-bxn-runlist aria-expanded="${runList}" aria-label="Every answer in this run">${icon('rows', 14)}${words ? `<span>${esc(words)}</span>` : ''}${icon('chevron-down', 13)}</button>`;

  // the word is in a span of its own, so a column that has no room for it can
  // take it off and keep the mark
  const nextBtn = (left) =>
    `<button type="button" class="bx-btn bx-btn--primary bx-btn--xs bxn-run__next" data-bxn-runnext aria-label="${left ? 'The next answer' : 'Finish this run'}"><span>${left ? 'Next' : 'Finish'}</span>${icon('arrow-right', 12)}</button>`;

  /* Seven other places were drawn for the run bar - floating over the band,
     an isle, a dial, a tab on the sheet, and three rails standing down the
     drawer's left side - and Inside is the one that stayed: the run joins the
     drawer's own foot rather than hanging over it. */
  function runBodyHtml() {
    return foldHtml();
  }

  /* Inside: the run joins the drawer's own foot rather than hanging over it, so
     the sheet keeps its full height. The drawer is redrawn on every field, so
     the strip is put back after each one. */
  function paintInside(design) {
    const sheet = document.querySelector('.bx-drawer.is-field .bx-drawer__sheet');
    const foot = sheet && sheet.querySelector('.bx-drawer__foot');
    if (!foot) return;
    const { inAll, total, left } = runFigures();
    let strip = foot.querySelector('.bxn-run__in-foot');
    if (!strip) {
      strip = document.createElement('div');
      strip.className = 'bxn-run__in-foot';
      strip.addEventListener('click', onRunClick);
      foot.prepend(strip);
    }
    // the way home stays on the row and is named; the count sits beside it
    strip.innerHTML = `
      ${homeBtn(true)}
      ${listBtn()}
      <span class="bxn-run__meta"><b class="bx-num">${inAll}/${total}</b> confirmed</span>
      ${left ? nextBtn(left) : ''}`;
  }

  // whatever the drawer is carrying belongs to one design; moving off it takes it
  function clearInside() {
    document.querySelectorAll('.bxn-run__in-foot, .bxn-run__tab').forEach((n) => n.remove());
  }

  /* Closing the drawer does not end a run: it is still going, and the reader
     has to be told so and given the three answers - carry on, go back to where
     it started, or drop it. */
  function awayHtml() {
    const { inAll, total, left, now } = runFigures();
    return `
      <div class="bxn-run__away">
        <span class="bx-tile bxn-run__amark" aria-hidden="true">${icon('brain', 16)}</span>
        <span class="bxn-run__copy">
          <strong>You are part-way through confirming Brain</strong>
          <span><b class="bx-num">${inAll} of ${total}</b> confirmed${left ? ` · ${esc(now.label || '')} is next` : ' · nothing is left'}</span>
        </span>
        <button type="button" class="bx-btn bx-btn--ghost bx-btn--xs" data-bxn-runhome>Not now</button>
        <button type="button" class="bx-btn bx-btn--secondary bx-btn--xs" data-bxn-runend>Back to ${esc(run.short || 'where I was')}</button>
        <button type="button" class="bx-btn bx-btn--primary bx-btn--xs" data-bxn-runon>Keep going${icon('arrow-right', 12)}</button>
      </div>`;
  }

  /* where the sheet sits once it has arrived - its offset box, which no tween
     touches, rather than the rectangle it is painted into */
  function sheetAt(el) {
    const p = el.offsetParent;
    if (!p) {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top) };
    }
    const pr = p.getBoundingClientRect();
    return { left: Math.round(pr.left + el.offsetLeft), top: Math.round(pr.top + el.offsetTop) };
  }

  /* Where the bar sits. Float lies over the whole window; the two that stand in
     the band between the sidebar and the drawer are measured against both,
     because either can move. */
  function placeRun() {
    if (!runEl) return;
    const design = B.homeDesign ? B.homeDesign() : 'float';
    const side = document.querySelector('.app-sidebar');
    const from = side ? Math.round(side.getBoundingClientRect().right) : 0;
    const sheet = document.querySelector('.bx-drawer.is-field .bx-drawer__sheet');
    /* The sheet is measured where it is laid out, not where it is drawn: it is
       animated in on a transform, and a measurement taken mid-tween would pin
       the column a couple of dozen pixels off and leave it there. */
    const to = sheet ? sheetAt(sheet).left : window.innerWidth;
    const away = runEl.classList.contains('is-away');
    runEl.style.width = '';
    runEl.style.left = '';
    runEl.style.right = '';
    runEl.style.top = '';
    runEl.style.bottom = '';
    runEl.classList.remove('is-tight');
    if (away) return;
    /* the fold belongs to the control that opens it, so it is measured off
       that control and opens upward from it - a list that jumped to a corner
       of the screen was the one thing about this design left to guess at */
    const btn = document.querySelector('.bxn-run__in-foot [data-bxn-runlist]');
    if (!btn) return;
    const b = btn.getBoundingClientRect();
    runEl.style.left = `${Math.round(b.left)}px`;
    runEl.style.right = 'auto';
    runEl.style.top = 'auto';
    runEl.style.bottom = `${Math.round(window.innerHeight - b.top + 8)}px`;
  }

  /* --------------------------------------------------------------- recording */

  function record(key, what) {
    const f = BXF().field(key);
    if (!f) return;
    ledger.push({ key, label: f.label, what: what || 'Confirmed', at: Date.now() });
  }

  function confirmOne(key) {
    if (!BXF().confirm(key)) return false;
    record(key, 'Confirmed');
    B.toast(`${BXF().field(key).label} confirmed · 1 record`);
    return true;
  }

  /* ----------------------------------------------------------------- wiring */

  function bind() {
    /* The panel rebuilds itself on every pick, so by the time the click reaches
       the document the button that was pressed is already detached and no longer
       answers `closest('#bx-switcher')`. Catch it on the way down instead. */
    let fromPanel = false;
    document.addEventListener(
      'click',
      (e) => {
        fromPanel = !!(e.target.closest && e.target.closest('#bx-switcher'));
      },
      true
    );
    document.addEventListener('click', (e) => {
      /* The places that send the reader into Brain to answer a run of fields do
         it themselves - they do not open a notice first. The notice is still
         what the campaign's checks are made of, because those are read before a
         button is pressed rather than answered one after another. */
      const go = e.target.closest('[data-bxn-run]');
      if (go) {
        e.preventDefault();
        startRun(RUNS[go.dataset.bxnRun]());
        return;
      }
      const inside = el && el.contains(e.target);
      if (!inside) {
        const t = e.target.closest('[data-bxn]');
        if (t) {
          e.preventDefault();
          open(t.dataset.bxn, t);
          return;
        }
        /* the prototype panel is not "outside": it switches the design of the
           very notice that is open, so using it must not dismiss it */
        if (el && !fromPanel && !e.target.closest('.is-bxn-on')) close();
        return;
      }
      // a field the reader is typing in is theirs, not the panel's
      if (!e.target.closest('.bxn__wr')) e.preventDefault();
      // and a list left open while something else is pressed puts itself away
      if (pickOpen && !e.target.closest('.bxn__pick')) {
        pickOpen = null;
        setTimeout(paint, 0);
      }
      const confirm = e.target.closest('[data-bxn-confirm]');
      if (confirm) {
        confirmOne(confirm.dataset.bxnConfirm);
        // a queue asks one thing at a time, so answering one asks the next
        if (spec.one && page < lastPage()) {
          page += 1;
          turned = 1;
        }
        paint();
        return;
      }
      const group = e.target.closest('[data-bxn-group]');
      if (group) {
        const g = spec.groups[Number(group.dataset.bxnGroup)];
        // confirmed together, recorded one by one
        const done = (g.items || []).filter((r) => !r.wait && BXF().confirm(r.key));
        done.forEach((r) => record(r.key, 'Confirmed'));
        if (done.length) B.toast(`${done.length} confirmed · ${done.length} records`);
        paint();
        return;
      }
      /* the one move left when the check is not yours to make: asking is itself
         a record, so the row says it was sent and who has it */
      const ask = e.target.closest('[data-bxn-ask]');
      if (ask) {
        const key = ask.dataset.bxnAsk;
        asked[key] = Date.now();
        record(key, `Sent to ${OWNER.name} to approve`);
        B.toast(`Sent to ${OWNER.name} · 1 record`);
        paint();
        return;
      }
      const turn = e.target.closest('[data-bxn-page]');
      if (turn) {
        turned = Number(turn.dataset.bxnPage);
        page += turned;
        paint();
        return;
      }
      const answer = e.target.closest('[data-bxn-answer]');
      if (answer) {
        const g = spec.groups[Number(answer.dataset.bxnAnswer)];
        const first = (g.items || []).find((r) => (BXF().field(r.key) || {}).state !== 'confirmed');
        if (first) {
          const back = spec.back && spec.back();
          close();
          if (back) startRun({ ...back, keys: back.keys });
          else BXF().openFrom(first.key);
        }
        return;
      }
      const correct = e.target.closest('[data-bxn-correct]');
      if (correct) {
        const key = correct.dataset.bxnCorrect;
        const back = spec.back && spec.back();
        close();
        if (back) {
          startRun(back);
          runTo(key);
        }
        BXF().openFrom(key, { edit: true });
        return;
      }
      /* the two this campaign answers for itself */
      const popen = e.target.closest('[data-bxn-pickopen]');
      if (popen) {
        const id = popen.dataset.bxnPickopen;
        pickOpen = pickOpen === id ? null : id;
        paint();
        return;
      }
      const pval = e.target.closest('[data-bxn-pickval]');
      if (pval) {
        chose[pval.dataset.bxnPickval] = pval.dataset.bxnVal;
        pickOpen = null;
        paint();
        return;
      }
      const save = e.target.closest('[data-bxn-save]');
      if (save) {
        const id = save.dataset.bxnSave;
        const input = el.querySelector(`[data-bxn-in="${CSS.escape(id)}"]`);
        const val = chose[id] || (input ? String(input.value || '').trim() : '');
        if (!val) {
          shake([`ask:${id}`]);
          if (input) input.focus();
          return;
        }
        said[id] = val;
        pickOpen = null;
        B.toast('Answered for this campaign · 1 record');
        paint();
        return;
      }
      const change = e.target.closest('[data-bxn-change]');
      if (change) {
        delete said[change.dataset.bxnChange];
        delete chose[change.dataset.bxnChange];
        paint();
        return;
      }
      const say = e.target.closest('[data-bxn-say]');
      if (say) {
        B.toast(say.dataset.bxnSay);
        return;
      }
      const more = e.target.closest('[data-bxn-more]');
      if (more) {
        shown[more.dataset.bxnMore] = !shown[more.dataset.bxnMore];
        paint();
        return;
      }
      const openKey = e.target.closest('[data-bxn-open]');
      if (openKey) {
        const key = openKey.dataset.bxnOpen;
        const back = spec.back && spec.back();
        close();
        if (back) {
          startRun(back);
          runTo(key);
        } else BXF().openFrom(key);
        return;
      }
      const picked = e.target.closest('[data-bxn-pick]');
      if (picked) {
        pick = spec.picks || pick !== picked.dataset.bxnPick ? picked.dataset.bxnPick : null;
        // one question, one press: the pick is the answer
        if (spec.picks && spec.run) spec.run({ close, paint, pick: () => pick, record });
        else paint();
        return;
      }
      if (e.target.closest('[data-bxn-second]')) {
        const run = spec.secondary && spec.secondary.run;
        if (run) run({ close, paint, pick: () => pick, record });
        return;
      }
      if (e.target.closest('[data-bxn-go]')) {
        if (spec.needsPick && !pick) return;
        const run = spec.run;
        if (run) run({ close, paint, pick: () => pick, record });
        else close();
        return;
      }
      if (e.target.closest('[data-bxn-no]')) close();
    });

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && el) {
          e.preventDefault();
          e.stopImmediatePropagation();
          close();
        }
      },
      true
    );
    // a notice belongs to the page that opened it
    document.addEventListener('app:route', close);
    // the prototype panel can change a notice's design while it is open
    document.addEventListener('brain:reasons', () => {
      if (!el) return;
      const next = make(at);
      /* every skin this notice could be wearing, so switching replaces rather
         than stacks: a leftover class and the new one both apply, and the two
         then fight over the same elements */
      if (next.skin)
        el.className = `${el.className
          .split(' ')
          .filter((c) => c && !SKINS.includes(c))
          .join(' ')} is-${next.skin}`;
      paint();
    });
    document.addEventListener('brain:render', () => {
      if (el && at && !at.isConnected) close();
    });
  }

  /* ===================================================================
     The touchpoints. Each one is a function of the live field states, so a
     confirmation made in one is already true in the next.
     =================================================================== */

  const TOUCH = {};

  /* ---------------------------------------------- 1 of 9 · Home

     The setup reminder keeps showing while Brain's required answers are not all
     in. It names them in two groups, because they are not the same job: the ones
     Brain wrote can be confirmed here, and the ones nobody has answered can only
     be opened. The reminder itself records nothing. */
  const HOME_CHECK = [
    { key: 'identity.official_names' },
    { key: 'brand.positioning' },
    { key: 'audience.icp_segments' },
    { key: 'identity.brand_hierarchy' },
  ];
  const HOME_GAPS = [
    { key: 'objectives.current_priorities' },
    { key: 'brand.claim_policy' },
    { key: 'brand.values_language' },
  ];

  /* ---------------------------------------------- 2 of 9 · Signal

     Two notices, and they are different voices. A finding's "Not relevant" says
     what the reason will record (and one of the three records nothing at all).
     The research basis says Signal is reading fields that are still Brain's own.
     Signal itself never blocks. */
  /* a finding's own wording, cut at a word rather than mid-syllable */
  function short(text, max = 58) {
    const t = String(text || '')
      .trim()
      .replace(/\s+/g, ' ');
    if (t.length <= max) return t;
    const cut = t.slice(0, max);
    return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}\u2026`;
  }

  const SIGNAL_REASONS = [
    {
      id: 'samename',
      label: 'Another company with the same name',
      key: 'identity.exclusions',
      said: 'another company with the same name',
      glyph: 'users',
    },
    {
      id: 'offtopic',
      label: 'Not our market or our topic',
      key: 'market.exclusions',
      said: 'not our market or our topic',
      glyph: 'globe',
    },
    { id: 'noise', label: 'Just noise', said: 'just noise', glyph: 'eye-off' },
  ];

  /* Saying a finding is not relevant takes it out of the feed, so the feed has to
     say what happened and leave a way back. The strip stands where the finding
     stood; left alone it goes quiet after a while, and the undo goes with it. */
  const UNDO_MS = 9000;

  function undoStrip(card, reason, undo) {
    const strip = document.createElement('div');
    strip.className = 'bxn-undo';
    strip.setAttribute('role', 'status');
    strip.innerHTML = `
      <span class="bxn-undo__mark" aria-hidden="true">${icon('check', 13)}</span>
      <span class="bxn-undo__copy">
        <b>Not relevant &middot; ${esc(reason.said)}</b>
        <span>${
          reason.key
            ? `Fewer like this from now on &middot; on ${esc((BXF().field(reason.key) || {}).label || reason.key)}`
            : 'Fewer like this from now on &middot; nothing recorded'
        }</span>
      </span>
      <button type="button" class="bxn-undo__btn" data-bxn-undo>${icon('undo', 12)}Undo</button>`;
    card.replaceWith(strip);
    const go = () => {
      if (!strip.isConnected) return;
      strip.replaceWith(card);
      undo();
      B.toast('Put back · the record is gone');
    };
    strip.addEventListener('click', (e) => {
      if (e.target.closest('[data-bxn-undo]')) go();
    });
    // the way back is there for a while, then it is not
    setTimeout(() => {
      if (!strip.isConnected) return;
      strip.classList.add('is-going');
      setTimeout(() => strip.remove(), 320);
    }, UNDO_MS);
    return strip;
  }

  TOUCH.signalIgnore = (t) => {
    const card = t.closest('.signal-trends-feed-card');
    const what = card
      ? (card.querySelector('.signal-trends-feed-card__fact') || {}).textContent || ''
      : '';
    return {
      tone: 'record',
      title: 'Why is this not relevant?',
      options: SIGNAL_REASONS,
      optsDesign: B.reasonDesign ? B.reasonDesign() : 'split',
      bare: true,
      picks: true,
      go: null,
      run({ close: shut, pick: picked }) {
        const r = SIGNAL_REASONS.find((x) => x.id === picked());
        if (!r) return;
        let undo = () => {};
        if (r.key) {
          const had = (BXF().field(r.key) || {}).value || '';
          const prev = BXF().declare(r.key, `${had}${had ? ' · ' : ''}${short(what)}`.trim());
          const line = { key: r.key, label: BXF().field(r.key).label, what: 'Added one exclusion' };
          ledger.push({ ...line, at: Date.now() });
          undo = () => {
            BXF().restore(r.key, prev && typeof prev === 'object' ? prev : null);
            const i = ledger.findIndex((x) => x.key === line.key && x.what === line.what);
            if (i >= 0) ledger.splice(i, 1);
          };
        }
        shut();
        if (card) undoStrip(card, r, undo);
      },
    };
  };

  // the one vocabulary again, for the title on a mark that carries no words
  const STATE_WORD = {
    confirmed: 'Confirmed',
    direct: 'Direct · quoted from a page, not confirmed',
    inferred: 'Inferred · worked out from what the index holds',
    missing: 'Missing · nothing written here yet',
  };

  const SIGNAL_BASIS = [
    { key: 'audience.icp_segments', note: 'Signal reads every finding against this' },
    { key: 'brand.positioning', note: 'And decides what counts as our market from this' },
    { key: 'objectives.marketing', note: 'The current goal · approved with the 90-day strategy' },
  ];

  /* ---------------------------------------------- 6 of 9 · Publishing

     Two different things are asked before a campaign goes out, and the panel's
     job is to keep them apart.

     **Brand rules** hold for everything the brand publishes. They are answered
     once, they keep, and because none of them turns on anything this campaign
     does they can be taken in one move - one record each, still.

     **This campaign** is the part that goes stale: which products are on sale
     while it runs, what may be claimed about them. Each is asked on its own,
     and the second is not the reader's to answer at all - it waits on the owner,
     so that row has no Confirm, a face, and a way to send it.

     It opens as a modal rather than off the button: five rows in two blocks read
     better in the middle of the screen than hanging from a corner of it. */
  const PUB_BRAND = [
    { key: 'governance.content_rules', note: 'What may and may not be said on a channel' },
    { key: 'brand.examples', note: 'The on-brand writing the caption was drafted against' },
    { key: 'visual.imagery', note: 'How product frames may be shot' },
  ];
  const PUB_CAMPAIGN = [
    {
      key: 'products.offers_ctas',
      note: 'Which products are on sale while this campaign runs',
    },
    {
      key: 'products.claims',
      note: 'What the caption may promise about current Catalog guidance',
      wait: true,
    },
  ];

  TOUCH.publishChecks = () => {
    const open = PUB_BRAND.concat(PUB_CAMPAIGN).filter(
      (r) => (BXF().field(r.key) || {}).state !== 'confirmed'
    ).length;
    return {
      tone: 'record',
      modal: true,
      title: 'Before this campaign goes out on X',
      body: `First time on this channel, so they are asked once. ${open ? `${open} are still open` : 'All of them are in'} — and each confirmation is its own record, even the three taken together.`,
      groups: [
        {
          label: 'Brand rules',
          sub: 'These hold for everything the brand publishes, not just this campaign.',
          together: true,
          items: PUB_BRAND,
        },
        {
          label: 'This campaign',
          sub: 'These change while it runs, so they are asked for this campaign on its own.',
          items: PUB_CAMPAIGN,
        },
      ],
      foot: 'Nothing is blocked here — the post waits until they are all in.',
      back: () => ({
        label: 'Back to the launch checks',
        route: 'campaigns',
        touch: 'publishChecks',
        keys: PUB_BRAND.concat(PUB_CAMPAIGN).map((r) => r.key),
      }),
      go: 'Done',
      run({ close: shut }) {
        shut();
        B.toast('Checks kept · Approve still reads them');
      },
    };
  };

  /* What stops a post, in two kinds that are not answered in the same place.

     **Every campaign** are Brain fields. They hold for every campaign the brand
     runs, so they are confirmed once, in Brain, where they live - pressing one
     starts a run and the bar counts them off. The two blocks are named for the
     one thing that tells them apart - every campaign, this campaign - rather
     than for what kind of thing they are.

     **This campaign** is not Brain at all: it is two questions about this post,
     and the answers belong to it alone. They are answered here, in the panel,
     because sending someone to Brain to answer a question about one campaign
     would file it in the wrong place. */
  const PUB_GENERAL = [
    {
      key: 'governance.content_rules',
      ok: 'Your content rules are confirmed for X',
      open: 'Your content rules have not been confirmed yet',
      none: 'You have not written your content rules yet',
      move: 'Confirm your content rules',
    },
    {
      key: 'audience.negative_fit',
      ok: 'Who is not a fit is confirmed',
      open: 'Who is not a fit has not been confirmed yet',
      none: 'Nobody has said who is not a fit',
      move: 'Confirm who is not a fit',
    },
    {
      key: 'visual.prohibited_use',
      ok: 'What may not be shown is confirmed',
      open: 'What may not be shown has not been confirmed yet',
      none: 'Nobody has said what may not be shown',
      move: 'Confirm what may not be shown',
    },
  ];

  /* the two this campaign answers for itself, and what it has answered so far */
  const said = {};
  const chose = {}; // what the picker is holding before it is saved
  let pickOpen = null; // which picker's list is down
  const PUB_ASKS = [
    {
      id: 'onsale',
      label: 'What is on sale while this runs',
      ask: 'We do not know which products are on sale right now',
      pick: [
        'HomeCourt+ — 7 days free on a new membership',
        'HomeCourt for Teams — first month free',
        'Nothing is on sale right now',
      ],
    },
    {
      id: 'claim',
      label: 'What this post may promise',
      ask: 'We do not know what this post may promise about the current Catalog guidance',
      write: 'Write what it may promise, in one line',
    },
  ];

  function pubChecks() {
    const f = (k) => BXF().field(k) || {};
    const general = PUB_GENERAL.map((c) => {
      const fd = f(c.key);
      const ok = fd.state === 'confirmed';
      return {
        label: fd.label || c.key,
        key: c.key,
        ok,
        note: ok ? c.ok : fd.state === 'missing' ? c.none : c.open,
        move: ok ? 'Read it in Brain' : c.move,
      };
    });
    const campaign = PUB_ASKS.map((a) => ({
      label: a.label,
      ask: a,
      ok: !!said[a.id],
      // answered, the row's own name is the question, so the note is the answer
      note: said[a.id] || a.ask,
    }));
    return { general, campaign };
  }

  TOUCH.publishApprove = () => {
    const c = pubChecks();
    const all = c.general.concat(c.campaign);
    const bad = all.filter((l) => !l.ok);
    const design = B.pubDesign ? B.pubDesign() : 'split';
    const inAll = all.length - bad.length;
    const canAll = c.general.filter(
      (l) => !l.ok && (BXF().field(l.key) || {}).state !== 'missing'
    ).length;
    return {
      tone: 'blocked',
      modal: true,
      skin: design,
      fold: design === 'gate',
      meter: design === 'gate' ? { done: inAll, total: all.length } : null,
      title: bad.length === 1 ? 'One check stops this' : `${bad.length} checks stop this`,
      info: 'What a claim carries · Its evidence, the rights to what it shows, the channel’s rules, an approval, and nothing taken back since.',
      groups: [
        {
          label: 'Every campaign',
          sub: 'Brain fields that hold for all of them, confirmed once in Brain.',
          checks: c.general,
        },
        {
          label: 'This campaign',
          sub: 'Two questions about this post, answered here and kept with it.',
          checks: c.campaign,
        },
      ],
      /* The moves at the foot are about the panel, not about one row in it:
         everything that can be confirmed from here, and a word to whoever is
         waiting. A row's own move stays on that row. */
      go: canAll ? `Confirm all ${canAll}` : 'Confirm all',
      back: () => ({
        label: 'What stops this post',
        short: 'the post',
        route: 'campaigns',
        touch: 'publishApprove',
        keys: c.general.map((l) => l.key),
      }),
      secondary: {
        label: 'Comment',
        sub: 'Say what is missing',
        face: true,
        run() {
          B.toast('Opens the comment thread on this post');
        },
      },
      run({ paint: repaint }) {
        /* Confirm all means everything here that can be: a field with nothing
           in it cannot be confirmed from a panel, because there is nothing to
           confirm. Those rows shake instead and keep their own way in. */
        const ready = c.general.filter(
          (l) => !l.ok && (BXF().field(l.key) || {}).state !== 'missing'
        );
        const empty = all.filter(
          (l) => !l.ok && (!l.key || (BXF().field(l.key) || {}).state === 'missing')
        );
        const done = ready.filter((l) => BXF().confirm(l.key));
        done.forEach((l) => record(l.key, 'Confirmed'));
        if (done.length) B.toast(`${done.length} confirmed · ${done.length} records`);
        else if (empty.length) B.toast('Nothing here can be confirmed as it stands');
        repaint();
        shake(empty.map((l) => l.key || `ask:${l.ask.id}`));
      },
    };
  };

  /* A row with nothing in it cannot be confirmed, and saying so in a toast is
     easy to miss - it is the rows themselves that have to answer. */
  function shake(ids) {
    if (!el || !ids.length) return;
    ids.forEach((id) => {
      const li = el.querySelector(`[data-bxn-row="${CSS.escape(id)}"]`);
      if (!li) return;
      li.classList.remove('is-shake');
      // restart the animation even when the same row is asked twice running
      void li.offsetWidth;
      li.classList.add('is-shake');
      setTimeout(() => li.classList.remove('is-shake'), 700);
    });
  }

  /* ---------------------------------------------- 7 of 9 · Library

     A picture is asked about once, on the way in: whose is it. Four answers, one
     record per picture. "Not sure" is a real answer - it keeps the picture for
     internal use. Nothing is blocked here; a picture with no record stops later,
     at publishing. */
  const RIGHTS = [
    {
      id: 'ours',
      label: 'Ours — we made it',
      note: 'Shot or rendered by the brand',
      key: 'visual.asset_rights',
    },
    {
      id: 'licensed',
      label: 'Licensed — the licence is on file',
      note: 'Stock or commissioned; the licence is attached with it',
      key: 'visual.asset_rights',
    },
    {
      id: 'customer',
      label: "A customer's — they agreed",
      note: 'Their consent is recorded with their name, and they can take it back',
      key: 'visual.asset_rights',
    },
    {
      id: 'unsure',
      label: 'Not sure',
      note: 'Kept for internal use only until someone knows',
      lands: 'Recorded as unknown — the picture cannot go out',
    },
  ];
  const RIGHTS_WORD = {
    ours: 'Ours · made by the brand',
    licensed: 'Licensed · licence on file',
    customer: "A customer's · consent recorded, revocable",
    unsure: 'Unknown · internal use only',
  };

  TOUCH.libraryUpload = (t) => {
    const n = Number(t.dataset.bxnCount || 3);
    const one = t.dataset.bxnAsset || '';
    return {
      tone: 'record',
      title: one ? 'Whose picture is this?' : `Whose ${n === 1 ? 'picture' : `${n} pictures`}?`,
      body: one
        ? `<b>${esc(one)}</b> has no rights record, so it cannot go out.`
        : `One record per picture — ${n} ${n === 1 ? 'line' : 'lines'}, not one for the batch.`,
      options: RIGHTS,
      needsPick: true,
      foot: 'Nothing is blocked here — a picture with no record stops at publishing.',
      go: 'Continue',
      run({ close: shut, pick: picked }) {
        const r = RIGHTS.find((x) => x.id === picked());
        if (!r) return;
        BXF().declare('visual.asset_rights', RIGHTS_WORD[r.id]);
        const count = one ? 1 : n;
        for (let i = 0; i < count; i += 1) record('visual.asset_rights', RIGHTS_WORD[r.id]);
        if (window.BXN_RIGHTS) window.BXN_RIGHTS(one, RIGHTS_WORD[r.id]);
        B.toast(`${RIGHTS_WORD[r.id]} · ${count} ${count === 1 ? 'record' : 'records'}`);
        shut();
      },
    };
  };

  /* =========================================================== the triggers

     Three of the four pages are captures, so the trigger is added to them rather
     than edited into them: the reminder bar Home already carries, the foot of
     Signal's research basis, the campaign's launch checks and its Approve. */

  /* ----------------------------------------------- the three that read as Brain

     Home's reminder and Signal's cue are both about Brain, so three of their
     designs are built out of the report's own hero: its gradient (violet off
     the top-right corner over a cyan wash), its `Brain` kicker, its band of
     figures on a pane of thinned canvas, and the section tiles it files its
     fields under. The two places render the same markup, because looking the
     same is the point of them. */
  function brainBody(design, o) {
    /* A bar that says Brain before it is read. It borrows the Brain tab's own
       furniture - its glyph in a tinted square, its cyan, its sparkle - rather
       than the Connect bar's, because the two sit one above the other on Home
       and must not read as the same object. Connect is an invitation and stays
       quiet; this is the brand's own work waiting, so it is the louder of the
       two.

       Seven other cards were drawn against this one and are gone - halo,
       aurora and its float and press, bloom, lamp, beam, and three of those in
       amber on Signal's rail. What is left of them is the pieces this one kept:
       the glass pill came from aurora, and the two-line copy from all of them.

       `stacked` is Signal's column asking for the two lines rather than one,
       which is the only difference between the two places it is drawn. */
    const mark = `<span class="bxn-br__mk" aria-hidden="true">${icon('brain', 17)}</span>`;
    const go = (cls) =>
      `<button type="button" class="${cls}" ${o.act}>${icon('spark', 13)}<span>${esc(o.go)}</span>${icon('arrow-right', 14)}</button>`;
    const two = `
      <span class="bxn-br__copy">
        <strong class="bxn-br__title">${esc(o.title)}</strong>
        <span class="bxn-br__line">${esc(o.sub)}</span>
      </span>`;
    return `
      <span class="bxn-br__pane" aria-hidden="true"></span>
      ${mark}
      ${two}
      ${go('bxn-br__go is-glass')}`;
  }

  const isBrainCard = (d) => d === 'frost';

  /* A reminder with one thing to do on it should not ask to be hit on the one
     spot where the words are: the whole bar takes a press, and it lifts under
     the cursor to say so. The move stays, as a sign of what will happen rather
     than the only place it can be made to happen. */
  const WHOLE_BAR = ['frost'];

  function trigger(label, kind, tone, extra = '') {
    return `<button type="button" class="bxn-cue is-${tone}" data-bxn="${kind}" aria-haspopup="dialog" ${extra}>${icon(tone === 'blocked' ? 'exit' : tone === 'record' ? 'circle-check' : 'alert', 13)}<span>${label}</span></button>`;
  }

  /* The reminder says which, not how many: two by name, the rest counted. */
  function homeLine() {
    const check = HOME_CHECK.filter((r) => (BXF().field(r.key) || {}).confirmable).length;
    const gaps = HOME_GAPS.map((r) => BXF().field(r.key) || {}).filter(
      (f) => f.state === 'missing'
    );
    if (!check && !gaps.length) return null;
    const names = gaps.slice(0, 2).map((f) => f.label);
    const rest = gaps.length - names.length;
    const bits = [];
    if (names.length)
      bits.push(
        `${names.join(', ')}${rest ? ` and ${rest} more` : ''} ${names.length === 1 && !rest ? 'is' : 'are'} still unanswered`
      );
    if (check) bits.push(`${check} more ${check === 1 ? 'is' : 'are'} Brain's own reading`);
    return bits.join(' · ');
  }

  function syncHome() {
    const main = document.querySelector('.home-v2');
    if (!main) return;
    const old = main.querySelector('.bxn-bar');
    const line = homeLine();
    if (!line) {
      if (old) old.remove();
      return;
    }
    const keys = HOME_CHECK.concat(HOME_GAPS)
      .map((r) => r.key)
      .filter((k) => (BXF().field(k) || {}).state !== 'confirmed');
    const design = B.setupDesign ? B.setupDesign() : 'frost';
    /* The reminder leads with a mark, not a number: a figure in that corner
       reads as a badge on the icon slot every other row of Home has, and the
       count belongs in the sentence where it can be read as one. (Three plain
       layouts were drawn against this - the page's own white card, the Connect
       bar to the pixel, and that bar in amber - and the Brain card is the one
       that stayed.) */
    const body = brainBody(design, {
      title: `${keys.length} answers Brain needs before it is sure`,
      sub: line,
      go: 'Confirm them now',
      act: 'data-bxn-run="home"',
    });
    const cls = `bxn-bar is-${design} bxn-br`;
    if (old) {
      old.className = cls;
      old.dataset.bxnRun = 'home';
      old.innerHTML = body;
      return;
    }
    const bar = document.createElement('div');
    bar.className = cls;
    bar.dataset.bxnAt = 'home';
    // the whole bar is the control, so the delegated handler takes it
    bar.dataset.bxnRun = 'home';
    bar.innerHTML = body;
    const host = main.querySelector('.v4-section-inner');
    const after = host && host.querySelector('.brand-setup-cta');
    if (after) after.insertAdjacentElement('afterend', bar);
    else if (host) host.prepend(bar);
  }

  /* what a run over Home's answers is, wherever it is started from */
  const HOME_RUN = () => ({
    label: 'Answers Brain needs before it is sure',
    short: 'Home',
    route: 'home',
    touch: 'home',
    keys: HOME_CHECK.concat(HOME_GAPS).map((r) => r.key),
  });

  /* Signal reads every finding against three answers, and they are confirmed
     the same way Home's are: in Brain, with the run bar counting them off. */
  const BASIS_RUN = () => ({
    label: 'What Signal reads every finding against',
    short: 'Signal',
    route: 'signal',
    touch: 'signalBasis',
    keys: SIGNAL_BASIS.map((r) => r.key),
  });

  const RUNS = { home: HOME_RUN, signalBasis: BASIS_RUN };

  function syncSignal() {
    /* "Not relevant" asks something rather than doing it, so it carries a
       question mark - the finding does not go anywhere until a reason is given. */
    document.querySelectorAll('[data-bxn="signalIgnore"]').forEach((b) => {
      if (b.querySelector('.bx-icon')) return;
      b.classList.add('bxn-ask');
      b.innerHTML = `${icon('help', 13)}<span>Not relevant</span>`;
    });

    const foot = document.querySelector('.signal-market-rail__foot');
    if (!foot) return;
    const card = foot.parentElement;
    const states = SIGNAL_BASIS.map((r) => (BXF().field(r.key) || {}).state || 'missing');
    const open = states.filter((st) => st !== 'confirmed').length;
    const tone = open ? 'guess' : 'record';
    const design = B.basisDesign ? B.basisDesign() : 'flag';

    /* The card names its three answers itself (Audience / Positioning / Current
       goal), so the cue uses those words rather than inventing a second set. */
    const terms = Array.from(card.querySelectorAll('.signal-market-rail__kv dt')).map((d) =>
      d.textContent.trim()
    );

    /* Six other layouts were drawn for this card - a strip across its top, an
       edge down its side, a stamped count, and three takes on Home's amber
       reminder - and the Brain card is the one that stayed. What it says comes
       from Card brief: the count first, the names of the open answers under
       it. */
    const strong = open
      ? `${open} of ${states.length} answers are not confirmed`
      : 'All three answers are confirmed';
    const names = terms.filter((_, i) => states[i] !== 'confirmed');
    // what the card designs put under the count, and the mark they lead with
    const under = names.length
      ? names.join(' \u00b7 ')
      : 'Audience, positioning and the current goal';
    /* it leads with the count, the way Card brief does: the cue's job on this
       card is to say how many of the three are still unconfirmed, not to
       repeat the sentence Home uses */
    const body = brainBody(design, {
      stacked: true,
      title: strong,
      sub: under,
      go: open ? 'Confirm them now' : 'Open in Brain',
      act: '',
    });

    let cue = card.querySelector('.bxn-basis');
    const cls = `bxn-basis is-${design} is-${tone} bxn-br`;
    const changed = cue && cue.dataset.bxnDesign !== design;
    if (!cue) {
      cue = document.createElement('button');
      cue.type = 'button';
      /* pressing it goes into Brain and runs the three, the same as Home's
         reminder: the answers are changed where they live, not in a card over
         the page that is reading them */
      cue.dataset.bxnRun = 'signalBasis';
      cue.dataset.bxnAt = 'signalBasis';
    }
    cue.className = `${cls}${cue.classList.contains('is-bxn-on') ? ' is-bxn-on' : ''}`;
    cue.dataset.bxnDesign = design;
    cue.innerHTML = body;
    const head = card.querySelector('h4');
    if (head && cue.nextElementSibling !== head) head.insertAdjacentElement('beforebegin', cue);
    if (changed) {
      cue.classList.add('is-new');
      setTimeout(() => cue.classList.remove('is-new'), 900);
    }
  }

  function syncCampaign() {
    const main = document.querySelector('.campaign-header');
    if (!main) return;
    const checks = Array.from(main.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Review launch checks'
    );
    if (checks && !checks.dataset.bxn) {
      checks.dataset.bxn = 'publishChecks';
      checks.setAttribute('aria-haspopup', 'dialog');
    }
    const drawer = document.querySelector('.post-drawer');
    const approve =
      drawer &&
      Array.from(drawer.querySelectorAll('.post-drawer__actions button')).find(
        (b) => b.textContent.trim() === 'Approve'
      );
    if (approve && !approve.dataset.bxn) {
      approve.dataset.bxn = 'publishApprove';
      approve.setAttribute('aria-haspopup', 'dialog');
    }
  }

  function sync() {
    if (!window.BXF) return;
    const route = window.AppPages ? window.AppPages.route : 'brain';
    if (route === 'home') syncHome();
    if (route === 'signal') syncSignal();
    if (route === 'campaigns') syncCampaign();
  }

  window.BrainNotice = {
    open,
    close,
    sync,
    ledger,
    rights: RIGHTS,
    rightsWord: RIGHTS_WORD,
    touch: TOUCH,
    start() {
      bind();
      document.addEventListener('app:route', sync);
      document.addEventListener('brain:fields', sync);
      document.addEventListener('brain:fields', () => {
        if (run) paintRun();
      });
      document.addEventListener('brain:reasons', () => {
        if (run) paintRun();
      });
      /* the drawer going - by its close button, its scrim or Escape - does not
         end the run; it only changes what the run has to say */
      document.addEventListener('brain:drawer', (e) => {
        // it has arrived, or it has gone; either way it is no longer on its way
        if (e.detail && e.detail.open) {
          arriving = false;
          clearTimeout(arriveT);
        }
        if (run) setTimeout(paintRun, 0);
      });
      document.addEventListener('brain:render', () => {
        // the drawer is redrawn field by field, so Inside's strip is put back
        if (run) setTimeout(paintRun, 0);
      });
      window.addEventListener('resize', () => {
        if (run) paintRun();
      });
      sync();
    },
  };
})();
