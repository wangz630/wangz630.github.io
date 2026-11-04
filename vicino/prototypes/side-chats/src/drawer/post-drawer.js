/* The post drawer — draft/campaign-drawer's default design (Proposed, the
   Clean brief, the glass step bar, the Paper surface), for a carousel, here
   filled with the post the chat is editing. Its markup is the one
   draft/campaign-drawer's script draws, taken 2026-10-28; its CSS sits
   beside this file. Only what this prototype needs is wired: open, close,
   the "More brief details" fold, and the Story section an update lands on.
   The rest of its controls are drawn as they are and live in
   draft/campaign-drawer.

   What it adds (ClickUp "[AI Post Editing] Updated Content Is Not Clearly
   Highlighted"): when an update lands, the drawer opens its details, scrolls
   to the section that changed, washes it in cyan for a moment, and leaves an
   "Updated" flag beside it. While an
   update has failed, the same place says the original is shown. */
(function () {
  'use strict';

  /* The post, and the two versions of its story. */
  var POST = {
    title: 'From the Pop-Up Counter to the Restock',
    when: 'Oct 30 · 9:40 AM',
    statement:
      'What sells at a pop-up can tell you what to stock online, when both counts sit in one Shopify inventory.',
    audience: 'Shop owners who sell in person and online.',
    cta: 'Tell us what your last pop-up taught you.',
    proofs: ['Pop-up sales counts', 'One shared inventory', 'A reorder before Monday'],
    campaign:
      'This post is part of “Sell Where Your Shoppers Are”, in its “Bring the Pop-Up Online” phase. The campaign shows merchants how in-person and online sales can share one stock.',
    channel: 'On X, as a carousel of 4 images. Planned for Oct 30 · 9:40 AM, New York time.',
    guardrails:
      'Show counts as a hand-kept tally and a plain stock number; do not depict invented Shopify screens or reorder flows.',
    requirements: 'None yet. Scenes and on-screen words are set on the storyboard, not here.',
  };

  var STORY = {
    before: {
      frames: [
        'A pop-up table at a weekend market, products laid out beside a card reader.',
        'A shopper buys the last jar on the table.',
        'Back home, the owner opens the online store to see what is listed.',
        'The owner decides what to restock from memory.',
      ],
      caption: 'Pop-ups and online stores can share one inventory. Here is how.',
    },
    after: {
      frames: [
        'A shop owner tallies what sold at a weekend pop-up, the sheet still on the counter.',
        'The same counts sit in Shopify inventory beside the online stock.',
        'One product runs low in both places; the owner reorders it before Monday.',
        'The restock arrives, and the product is back on the online shelf.',
      ],
      caption:
        'What sells in person can tell you what to stock online. What did your last pop-up teach you?',
    },
  };

  /* The versions Vicino writes in the chat, in the order it writes them:
     the first take, "Try another", and a revision after a note. Each says
     in a line what it is (`blurb`) and, once applied, what changed (`sum`). */
  STORY.drafts = [
    {
      frames: STORY.after.frames,
      caption: STORY.after.caption,
      blurb:
        'Here’s a new story structure. It follows one shop owner from the pop-up counter to the reorder, so each slide moves the decision forward. Have a look before it goes on the post.',
      sum: '4 new frames, from the pop-up counter to the restock, and a new caption.',
    },
    {
      frames: [
        'A pop-up table sells out of one candle by noon; the owner photographs the empty spot.',
        'At home, the online listing for that candle still shows twelve in stock.',
        'The owner links both counts in Shopify inventory, so the next sale updates both.',
        'Next weekend, the candle is restocked before the market opens.',
      ],
      caption:
        'One inventory for the market table and the online shop. What sold out on you last?',
      blurb:
        'Here’s another take. It starts from a sell-out at the table and ends with both counts in one inventory.',
      sum: '4 new frames, from a sell-out at the table to one shared inventory, and a new caption.',
    },
    {
      frames: [
        'Close on a hand-written tally from a weekend pop-up, three items circled.',
        'The same three items in Shopify inventory, their online stock running low.',
        'The owner reorders all three before Monday, from one screen.',
        'Monday: the three are back on the online shelf, tagged “Pop-up favourite”.',
      ],
      caption: 'Your pop-up already told you what to stock. What did yours say?',
      blurb:
        'Revised with your note. It now opens on the tally itself and keeps every frame on the same three products.',
      sum: '4 new frames, from the pop-up tally to three restocked favourites, and a new caption.',
    },
  ];

  /* Versions of the whole brief, for a change that regenerates all of it. */
  STORY.briefDrafts = [
    {
      statement:
        'A weekend pop-up is a stock count you didn’t have to run: let it decide what goes back online first.',
      audience: 'Shop owners who sell at markets and pop-ups as well as online.',
      cta: 'Tell us the one thing your last pop-up sold out of.',
      proofs: ['Pop-up tallies', 'One Shopify inventory', 'A Monday reorder'],
      frames: STORY.after.frames,
      caption: STORY.after.caption,
      blurb:
        'Here’s a new brief. It turns the pop-up into the stock count and keeps every part of the post on that one idea. Have a look before it goes on the post.',
      sum: 'A new brief: main message, audience, call to action, proof points and a 4-frame story.',
    },
    {
      statement:
        'Sell in person, stock online from the same numbers: one Shopify inventory keeps both honest.',
      audience: 'Merchants running both a market stall and an online store.',
      cta: 'Show us your market-day bestseller.',
      proofs: ['Shared stock counts', 'No double selling', 'Restock from one screen'],
      frames: STORY.drafts[1].frames,
      caption: STORY.drafts[1].caption,
      blurb: 'Here’s another take on the whole brief, built around one shared stock count.',
      sum: 'A new brief built around one shared stock count, with a new 4-frame story.',
    },
    {
      statement:
        'Your pop-up already wrote your restock list: three favourites, one inventory, back online by Monday.',
      audience: 'Makers who sell at weekend pop-ups and through a Shopify store.',
      cta: 'What made your pop-up favourites list?',
      proofs: ['Three pop-up favourites', 'One inventory', 'Back online by Monday'],
      frames: STORY.drafts[2].frames,
      caption: STORY.drafts[2].caption,
      blurb:
        'Revised with your note. The brief now stays on three pop-up favourites from the first line to the caption.',
      sum: 'A new brief around three pop-up favourites, with a new 4-frame story.',
    },
  ];

  var st = {
    scope: 'story', // what a change covers: 'story' (one section) or 'brief' (all of it)
    open: false,
    settled: false,
    details: false,
    look: false,
    /* where the story stands: 'before' (the original), 'applying' (Vicino
       is updating it), 'failed' or 'stopped' (the original is shown),
       'updated' */
    story: 'before',
    proposal: null, // the version waiting in the chat, while it is drafted or reviewed
    /* An outcome's label (Updated, Not updated, Stopped) is news for a few
       seconds, then fades; it comes back when the outcome happens again or
       the reader asks for it (View changes, the Editing card's note). */
    noted: false, // the outcome label is showing
    landedAt: 0, // when the update landed, for "Updated 3 min ago"
    applied: null, // the version that went on the post
    headx: '', // what the page puts at the head's right (the Chat · Post switch)
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ic(path, size, extra) {
    return (
      '<svg class="cd-ic" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (extra || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      path +
      '</svg>'
    );
  }

  var I = {
    x: '<path d="M4 4l16 16M20 4L4 20" stroke-width="2.6"></path>',
    archive:
      '<rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path>',
    close: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    layers:
      '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    chevL: '<path d="m15 18-6-6 6-6"></path>',
    chevR: '<path d="m9 18 6-6-6-6"></path>',
    chevD: '<path d="m6 9 6 6 6-6"></path>',
    chevU: '<path d="m18 15-6-6-6 6"></path>',
    person: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
    target:
      '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1.2" fill="currentColor"></circle>',
    badge:
      '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path>',
    info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"></path><path d="M14 3v5h5"></path><path d="M9 13h6M9 17h4"></path>',
    wand:
      '<path d="m15 4-9 9"></path><path d="M14 4a7 7 0 0 1 6 6"></path><path d="m3 21 9-9"></path><path d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"></path><path d="M5 3l.7 1.5L7 5l-1.3.5L5 7l-.7-1.5L3 5l1.3-.5Z"></path>',
    pen: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path>',
    sliders:
      '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"></path><circle cx="16" cy="6" r="2"></circle><circle cx="10" cy="12" r="2"></circle><circle cx="18" cy="18" r="2"></circle>',
    bubble: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>',
    cal: '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>',
    coins:
      '<circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path>',
    arrowR: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    alert: '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
  };

  /* ── The Story row: where an update lands ───────────────────────────── */

  function beats(v, cls) {
    return (
      '<ol class="cdb-full__beats' +
      (cls ? ' ' + cls : '') +
      '">' +
      v.frames
        .map(function (f, i) {
          return (
            '<li style="--i:' +
            i +
            '"><b>Frame ' +
            (i + 1) +
            '</b><span>' +
            esc(f) +
            '</span></li>'
          );
        })
        .join('') +
      '<li style="--i:' +
      v.frames.length +
      '"><b>Caption</b><span>The caption reads: “' +
      esc(v.caption) +
      '”</span></li></ol>'
    );
  }

  /* What the change covers, in words: "story structure" or "the brief". */
  function what() {
    return st.scope === 'brief' ? 'the brief' : 'story structure';
  }

  /* The label on the part of the post a change covers. The proposed
     version is never shown here: until it is applied it lives in the chat,
     and the drawer shows only what is on the post. */
  function flag() {
    if (st.story === 'drafting')
      return '<span class="sc-pd-flag is-applying"><span class="sc-ring" aria-hidden="true"></span>A new version is being written in the chat</span>';
    if (st.story === 'review')
      return '<span class="sc-pd-flag is-review">A new version is in the chat · not on the post yet</span>';
    if (settled() && !st.noted) return '';
    if (st.story === 'updated')
      return (
        '<span class="sc-pd-flag is-updated">' +
        ic(I.check, 11, 2.6) +
        'Updated ' +
        ago() +
        '</span>'
      );
    if (st.story === 'failed')
      return (
        '<span class="sc-pd-flag is-failed">' +
        ic(I.alert, 11) +
        'Not updated · the original is shown</span>'
      );
    if (st.story === 'stopped')
      return '<span class="sc-pd-flag is-stopped">Stopped · the original is shown</span>';
    if (st.story === 'applying')
      return (
        '<span class="sc-pd-flag is-applying"><span class="sc-ring" aria-hidden="true"></span>Updating ' +
        what() +
        '…</span>'
      );
    return '';
  }

  /* An outcome that has settled: updated, or not (failed, stopped). */
  function settled() {
    return st.story === 'updated' || st.story === 'failed' || st.story === 'stopped';
  }

  function ago() {
    var m = Math.floor((Date.now() - st.landedAt) / 60000);
    return m < 1 ? 'just now' : m === 1 ? '1 min ago' : m < 60 ? m + ' min ago' : 'over an hour ago';
  }

  /* show the outcome's label for a few seconds, then let it fade */
  var noteTimer = null;
  var NOTE_MS = 6000;
  function note() {
    if (!settled()) return;
    clearTimeout(noteTimer);
    st.noted = true;
    if (st.open) render();
    noteTimer = setTimeout(function () {
      var flags = root.querySelector('.sc-pd-flags');
      if (flags) flags.classList.add('is-leaving');
      noteTimer = setTimeout(
        function () {
          st.noted = false;
          if (st.open) render();
        },
        flags ? 320 : 0
      );
    }, NOTE_MS);
  }

  /* the part's own outcome class: only while its label is showing */
  function partState() {
    return settled() && !st.noted ? 'settled' : st.story;
  }

  /* What is on the post now: the applied version where it has landed. */
  function cur() {
    var a = st.story === 'updated' ? st.applied : null;
    var brief = a && st.scope === 'brief';
    return {
      statement: brief ? a.statement : POST.statement,
      audience: brief ? a.audience : POST.audience,
      cta: brief ? a.cta : POST.cta,
      proofs: brief ? a.proofs : POST.proofs,
      story: a ? { frames: a.frames, caption: a.caption } : STORY.before,
    };
  }


  function storyRow() {
    var mine = st.scope === 'story';
    return (
      '<div class="cdb-st__row sc-pd-story' +
      (mine ? ' is-' + partState() : '') +
      '" data-sec="story"><dt>Story</dt><dd>' +
      (mine && flag() ? '<div class="sc-pd-flags">' + flag() + '</div>' : '') +
      beats(cur().story) +
      '</dd></div>'
    );
  }

  /* For a change to the whole brief, its label sits at the top of the
     brief card. */
  function briefFlags() {
    if (st.scope !== 'brief' || !flag()) return '';
    return (
      '<div class="sc-pd-flags sc-pd-briefflags">' +
      flag() +
      '</div>'
    );
  }


  /* ── The drawer ─────────────────────────────────────────────────────── */

  function row(dt, dd) {
    return '<div class="cdb-st__row"><dt>' + dt + '</dt><dd><p>' + esc(dd) + '</p></dd></div>';
  }

  function cell(mod, icon, dt, dd) {
    return (
      '<div class="cdb-grid__cell"><span class="cdb-fico cdb-fico--' +
      mod +
      '">' +
      ic(icon, 13) +
      '</span><div class="cdb-grid__txt"><dt>' +
      dt +
      '</dt><dd>' +
      dd +
      '</dd></div></div>'
    );
  }

  function help(label) {
    return (
      '<span class="cdb-hl">' +
      label +
      '<button type="button" class="cdb-help" aria-label="What is ' +
      label.toLowerCase() +
      '?">' +
      ic(I.info, 11) +
      '</button></span>'
    );
  }

  function html() {
    var c = cur();
    var now = c.story;
    return (
      '<div class="pulse-ds cd post-drawer' +
      (st.settled ? ' is-settled' : '') +
      '" data-primary="ink" data-surface="paper" data-chrome="flat">' +
      /* the backdrop doesn't close the drawer: it stays open beside the
         chat and the page until × or Esc, and clicks pass through to what
         is behind it */
      '<div class="post-drawer__scrim"></div>' +
      '<div class="post-drawer__panel" role="dialog" aria-label="Post detail — ' +
      esc(POST.title) +
      '">' +
      // head
      '<div class="cd-top"><div class="cd-head"><div class="cd-head__id"><div class="cd-head__titlerow"><h2 class="cd-head__title">' +
      esc(POST.title) +
      '</h2><span class="cd-state cd-state--draft">Draft</span></div>' +
      '<div class="cd-head__meta"><span class="cd-head__facts"><span class="cd-head__ch"><span class="cd-chan" title="X" aria-label="X">' +
      ic(I.x, 10) +
      '</span></span><i></i><span>Carousel</span><i></i><span>' +
      POST.when +
      '</span></span></div></div>' +
      '<div class="cd-head__acts"><span class="sc-pd-headx">' +
      st.headx +
      '</span><button type="button" class="cd-ibtn" title="Archive draft" aria-label="Archive draft">' +
      ic(I.archive, 16) +
      '</button><button type="button" class="cd-ibtn" title="Close" aria-label="Close post detail" data-pd="close">' +
      ic(I.close, 16) +
      '</button></div></div>' +
      '<div class="cd-steps cd-steps--glass" role="tablist"><span class="cd-glass__track">' +
      '<button type="button" class="cd-glass__seg is-now is-active" role="tab" aria-selected="true" title="Brief — Check what it says"><span class="cd-gno">1</span><span class="cd-glass__name">Brief</span></button>' +
      '<button type="button" class="cd-glass__seg is-later is-locked" role="tab" aria-selected="false" title="The result appears here once it is generated"><span class="cd-gno">2</span><span class="cd-glass__name">Review</span></button></span>' +
      '<button type="button" class="cd-glass__ctx cd-steps__ctx" role="tab" aria-selected="false">' +
      ic(I.layers, 12) +
      'Context</button></div></div>' +
      // body
      '<div class="cd-body"><div class="cd-view cd-view--brief"><div class="cdb cdb--clean">' +
      '<p class="cdb-purpose"><b>Check what this post says.</b> <span>If it reads right, approve and generate.</span></p>' +
      '<section class="cdb-clean cdb-hoverable is-artout' +
      (st.scope === 'brief' ? ' sc-pd-target is-' + partState() : '') +
      '" data-sec="brief">' +
      briefFlags() +
      '<div class="cdb-clean__top"><div class="cdb-clean__say"><header class="cdb-clean__head"><span class="cdb-k">The main message</span></header><p class="cdb-statement">' +
      esc(c.statement) +
      '</p></div>' +
      '<div class="cdb-art cdb-art--carousel" aria-hidden="true"><span class="cdb-art__card"><span class="cdb-art__who"><i></i><b></b></span><span class="cdb-art__lines"><b></b><b></b></span><span class="cdb-art__media cdb-art__media--carousel"><span class="cdb-art__pic">' +
      ic(I.image, 14) +
      '</span><span class="cdb-art__arrow is-l">' +
      ic(I.chevL, 9) +
      '</span><span class="cdb-art__arrow is-r">' +
      ic(I.chevR, 9) +
      '</span><span class="cdb-art__dots"><i class="is-on"></i><i></i><i></i><i></i></span></span></span></div></div>' +
      '<dl class="cdb-grid">' +
      cell('speaks', I.person, 'Target audience', esc(c.audience)) +
      cell('cta', I.target, 'Call to action', esc(c.cta)) +
      cell(
        'proof',
        I.badge,
        help('Proof points'),
        '<span class="cdb-proofs">' +
          c.proofs
            .map(function (p) {
              return '<span>' + esc(p) + '</span>';
            })
            .join('') +
          '</span>'
      ) +
      cell(
        'opens',
        I.image,
        help('First image'),
        esc(now.frames[0]) + '<span class="cdb-where">Slide 1</span>'
      ) +
      '</dl>' +
      (st.details
        ? '<div class="cdb-more"><dl class="cdb-st">' +
          row('Campaign', POST.campaign) +
          row('Channel and timing', POST.channel) +
          storyRow() +
          row('Guardrails', POST.guardrails) +
          row('Requirements', POST.requirements) +
          '</dl></div>'
        : '') +
      '<div class="cdb-clean__foot"><button type="button" class="cdb-fulllink" data-pd="details" aria-expanded="' +
      st.details +
      '">' +
      ic(I.doc, 12) +
      (st.details ? 'Fewer brief details' : 'More brief details') +
      ic(st.details ? I.chevU : I.chevD, 11) +
      (!st.details && st.scope === 'story' && st.story !== 'before' && !(settled() && !st.noted)
        ? '<span class="sc-pd-dot is-' + st.story + '" aria-hidden="true"></span>'
        : '') +
      '</button><span class="cdb-editacts"><button type="button" class="cd-qbtn cd-qbtn--ai">' +
      ic(I.wand, 12) +
      'Rewrite with Vicino</button><button type="button" class="cd-qbtn">' +
      ic(I.pen, 12) +
      'Edit</button></span></div></section>' +
      '<section class="cdb-style cdb-hoverable"><button type="button" class="cdb-style__sum" aria-expanded="false"><span class="cdb-style__ico">' +
      ic(I.sliders, 14) +
      '</span><b>Look and tone</b><span class="cdb-style__sub"><span>Warm market light</span><span>4 references</span></span><span class="cdb-style__chev">' +
      ic(I.chevD, 13) +
      '</span></button></section>' +
      '</div></div></div>' +
      // foot
      '<div class="cd-foot"><div class="cd-foot__ribbon"></div><div class="cd-foot__bar">' +
      '<button type="button" class="cd-fchip" title="One approval starts generation"><span class="cd-gate__avatar"><img src="assets/approver.png" alt=""><i></i></span><span class="cd-fchip__txt"><span>Brief approval</span><b>Waiting on you</b></span></button>' +
      '<button type="button" class="cd-ibtn cd-fchip__ib" title="Comment" aria-label="Comment">' +
      ic(I.bubble, 14) +
      '</button>' +
      '<button type="button" class="cd-fchip cd-fchip--when" title="Change when it goes out">' +
      ic(I.cal, 14) +
      '<span class="cd-fchip__txt"><b>' +
      POST.when +
      '</b></span>' +
      ic(I.chevD, 12) +
      '</button><span class="cd-foot__grow"></span>' +
      '<div class="cd-foot__acts"><div class="cd-cta"><div class="cd-modemenu"><button type="button" class="cd-modemenu__btn" aria-expanded="false" title="How this post is made">' +
      ic(I.wand, 12) +
      '<span>Vicino draws them</span><span class="cd-credit"><i class="cd-credit__ico">' +
      ic(I.coins, 10) +
      '</i>Uses credits</span>' +
      ic(I.chevU, 11) +
      '</button></div><button type="button" class="cd-btn cd-btn--primary cd-cta__btn">Approve &amp; generate<span class="cd-cta__arrow">' +
      ic(I.arrowR, 12) +
      '</span></button></div></div></div></div>' +
      '</div></div>'
    );
  }

  /* ── Mounting ───────────────────────────────────────────────────────── */

  var root = document.createElement('div');
  root.id = 'sc-post';
  root.className = 'sc-post';
  document.body.appendChild(root);

  var listeners = [];

  function render() {
    if (!st.open) {
      root.innerHTML = '';
      document.body.classList.remove('sc-post-open');
      return;
    }
    var body = root.querySelector('.cd-body');
    var top = body ? body.scrollTop : 0;
    root.innerHTML = html();
    document.body.classList.add('sc-post-open');
    body = root.querySelector('.cd-body');
    if (body) body.scrollTop = top;
    st.settled = true;
  }

  
  /* Scroll the drawer to the Story row and play its wash once. */
  var washTimer = null;
  /* The part of the post a change covers: the Story row, or the whole
     brief card. */
  function targetEl() {
    return st.scope === 'brief'
      ? root.querySelector('[data-sec="brief"]')
      : root.querySelector('[data-sec="story"]');
  }

  /* Take the reader to that part. `mark`: 'wash' (it changed: cyan, then
     fading), 'focus' (it is what a waiting version would change: a lighter,
     shorter pulse) or nothing. */
  function reveal(mark) {
    if (mark === true) mark = 'wash';
    if (!st.open) return;
    if (st.scope === 'story' && !st.details) {
      st.details = true;
      render();
    }
    var body = root.querySelector('.cd-body');
    var el = targetEl();
    if (!body || !el) return;
    var top =
      el.getBoundingClientRect().top -
      body.getBoundingClientRect().top +
      body.scrollTop -
      (st.scope === 'brief' ? 16 : 72);
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    body.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
    if (!mark) return;
    clearTimeout(washTimer);
    el.classList.remove('is-wash', 'is-focus');
    // start the mark once the scroll has brought the part in
    washTimer = setTimeout(
      function () {
        var e2 = targetEl();
        if (!e2) return;
        void e2.offsetWidth;
        e2.classList.add(mark === 'focus' ? 'is-focus' : 'is-wash');
      },
      smooth ? 380 : 0
    );
  }


  function open(opts) {
    opts = opts || {};
    var was = st.open;
    st.open = true;
    if (!was) st.settled = false;
    render();
    emit();
    var mark = opts.wash ? 'wash' : opts.focus ? 'focus' : null;
    /* taken to an outcome (View changes, the Editing card's note): its
       label comes back for a few seconds */
    if (opts.reveal && settled()) note();
    if (opts.reveal) setTimeout(function () { reveal(mark); }, was ? 0 : 360);
  }

  function close() {
    if (!st.open) return;
    st.open = false;
    render();
    emit();
  }

  /* The chat tells the drawer where the approved change stands. */
  function setOutcome(s) {
    var next =
      s === 'applied'
        ? 'updated'
        : s === 'applying' || s === 'drafting' || s === 'review'
          ? s
          : s === 'unwritten'
            ? 'before'
            : s === 'stopped'
              ? 'stopped'
              : 'failed';
    var landed = next === 'updated' && st.story !== 'updated';
    var began =
      (next === 'applying' || next === 'review') && st.story !== next;
    var outcome = (next === 'updated' || next === 'failed' || next === 'stopped') && st.story !== next;
    if (landed) {
      st.applied = st.proposal || STORY.after;
      st.landedAt = Date.now();
    }
    st.story = next;
    if (outcome) note();
    else if (!settled()) {
      clearTimeout(noteTimer);
      st.noted = false;
    }
    if (st.open) {
      render();
      // the update lands while the post is open: take the reader to it
      if (landed) reveal(true);
      // a run starts: show where it is working, without the wash
      else if (began) reveal(false);
    }
  }

  function emit() {
    listeners.forEach(function (fn) {
      fn(st.open);
    });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pd]');
    if (!t) return;
    var what = t.dataset.pd;
    if (what === 'close') close();
    else if (what === 'details') {
      st.details = !st.details;
      render();
    }
  });

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === 'Escape' && st.open && !(t.closest && t.closest('input, textarea'))) close();
  });

  window.SCPost = {
    open: open,
    close: close,
    toggle: function (opts) {
      if (st.open) close();
      else open(opts);
    },
    isOpen: function () {
      return st.open;
    },
    setOutcome: setOutcome,
    /* the version the chat is drafting or offering */
    setProposal: function (d) {
      st.proposal = d;
      if (st.open && (st.story === 'review' || st.story === 'drafting')) render();
    },
    /* "Compare with the post": take the reader to the part a waiting
       version would change, with a light pulse; the post itself is shown */
    focusChange: function () {
      open({ reveal: true, focus: true });
    },
    /* what a change covers: 'story' (one section) or 'brief' (all of it) */
    setScope: function (sc) {
      st.scope = sc;
      st.story = 'before';
      st.applied = null;
        if (st.open) render();
    },
    /* set the head's extra without redrawing, so a wash in progress plays on */
    setHeadExtra: function (h) {
      if (st.headx === h) return;
      st.headx = h;
      var slot = root.querySelector('.sc-pd-headx');
      if (slot) slot.innerHTML = h;
    },
    onChange: function (fn) {
      listeners.push(fn);
    },
    title: POST.title,
    story: STORY,
  };
})();
