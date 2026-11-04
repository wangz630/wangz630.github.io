/* Main chat and side chats — the Recent chats block of the sidebar — and the
   chat window it opens.

   Three questions, each with drawings and the captured one (Now):

   - the sidebar: the main chat pinned as a slim bar above the side chats, told
     apart by a fill (A Tint), a divider (B Plain) or a shadow (C Lift);
   - the chat window: the dock's panel redrawn on glass — six drawings, A to
     F — with the conversation, the history, the empty "new chat" state and
     fullscreen each drawn in the same material;
   - the folded rail: what the sidebar shows for chats once it folds.

   The rest of the page is the capture. The chat's own controls are wired the
   way the product wires them (read off dev.pulse on 2026-10-22): the dock's
   launcher opens the panel beside the content and folds the sidebar, Close
   puts both back, Show chats turns the panel into the history, the back arrow
   returns, the fullscreen toggle widens the panel to the page (its glyph
   turns to "shrink" while it is wide), New chat opens the empty state, and
   Compact chat carries its own tooltip. Picking a chat anywhere makes it the
   open one everywhere.

   Keys: I hides and shows the chat icon in the history, B gives Paper and Mist a grey bubble instead of the cyan one, W makes the focused field grey instead of white, D drops and restores the rule under the main chat, E hides and shows the Editing card, V folds and unfolds the prototype panel, H takes the tab off the
   screen and back; 1–4 pick a sidebar drawing, 5–0 and - pick a chat
   window. */
(function () {
  'use strict';

  var KEY = 'sc-variant';
  var KEY_W = 'sc-window';

  /* Picks saved before the defaults last moved are let go, so the defaults
     show: a link or a saved pick counts only if it carries this version. */
  var STORE_V = '5';
  var params = new URLSearchParams(location.search);
  var urlCurrent = params.get('s') === STORE_V;
  var storeCurrent = false;
  try {
    storeCurrent = localStorage.getItem('sc-store') === STORE_V;
    if (!storeCurrent) {
      ['sc-variant', 'sc-window', 'sc-rail', 'sc-card', 'sc-head', 'sc-hist', 'sc-dated', 'sc-apd', 'sc-long', 'sc-vhead'].forEach(
        function (k) {
          localStorage.removeItem(k);
        }
      );
    }
    localStorage.setItem('sc-store', STORE_V);
  } catch (e) {
    /* private window */
  }

  var VARIANTS = [
    {
      id: 'now',
      label: 'Now',
      desc: 'The section as the product draws it today: one list, every chat alike, the open one on a faint green-grey fill.',
    },
    {
      id: 'a',
      label: 'Tint',
      desc: 'The main chat is one slim bar pinned above the list — the orb and its name — in cyan glass: the light cyan as before, now with a lit rim and a sheen, set in from the edges, a cyan rule under it. The rows beneath in neutral greys; a dots menu on hover.',
    },
    {
      id: 'b',
      label: 'Section',
      desc: 'The main chat is the first thing in the block, right under the sidebar’s rule, with no title over it — it is not a list. Then “Side chats” as a section of its own: the eyebrow with Manage and New beside it, since those act on side chats only, and the rows under it.',
    },
    {
      id: 'c',
      label: 'Inset',
      desc: 'The whole block sinks into a soft grey well, with air around what is in it. The main chat is a white pill standing proud inside, the side chats rows on the grey, the open one white too. One container says “chats”, the white says “the main one”.',
    },
    {
      id: 'd',
      label: 'Shelf',
      desc: 'A flat bar at the head of the block, cyan fading to white left to right, the orb on it, lifted by a light shadow and no stroke. A rule under it, then the side chats.',
    },
    {
      id: 'e',
      label: 'Launcher',
      desc: 'The main chat drawn as an action, not an item: a pill of glass — a lit rim, a sheen — with the orb at its left, the dock’s launcher in small. A rule under it, then the side chats.',
    },
    {
      id: 'f',
      label: 'Ink',
      desc: 'The main chat as the one dark thing in the sidebar: a pill of black glass, white name, the orb on it — the anchor the ink buttons are elsewhere in Pulse. The side chats stay light under it.',
    },
  ];

  var WINDOWS = [
    {
      id: 'now',
      label: 'Now',
      desc: 'The panel as the product draws it today: a white card with 22px corners and a stroke, a 69px header, bubbles with their own shadows, a pill composer.',
    },
    {
      id: 'a',
      label: 'Mist',
      desc: 'The lightest: near-white glass, a short blur, the faintest shadow — a sheet of paper more than a pane. Your turns on the faintest tint; the field the only other tonal thing on it.',
    },
    {
      id: 'b',
      label: 'Frost',
      desc: 'Thin, cold glass: the page shows through at 60%, blurred hard, the rim lit strongest. Vicino’s replies sit in frosted white cards; yours on a cyan tint; the field is frosted too.',
    },
    {
      id: 'c',
      label: 'Paper',
      desc: 'The one to build on: light glass with room in it — 26px margins — a trace of cyan at the top, a one-line header. The field a shade deeper than the ground, 14px from the sides; while editing, the post as a glass card clipped to its corner.',
    },
    {
      id: 'd',
      label: 'Haze',
      desc: 'No colour at all: white glass that thins from the top down — 92% at the head to 78% at the foot — so the pane reads as mist settling, lightest where the words start. Everything on it is grey or ink.',
    },
    {
      id: 'e',
      label: 'Round',
      desc: 'The same light glass drawn rounder: 22px corners on the pane, both sides of the conversation in bubbles — Vicino’s white, yours tinted — and a field and a card to match. Softer by geometry, not by colour.',
    },
    {
      id: 'f',
      label: 'Drawer',
      desc: 'Hung from the top edge: flush to the top of the page and to the sidebar, corners only at the foot, a toolbar header under a hairline. Your turns on an ink tint; “Editing” an ink band joined to the field.',
    },
  ];

  var RAILS = [
    {
      id: 'now',
      label: 'Now',
      desc: 'The rail as the product draws it: one grey dot per chat, the open one black — a string of dots nobody can read, and a crowded one.',
    },
    {
      id: 'a',
      label: 'Mark',
      desc: 'The orb alone, in a soft tile, is the whole of it: one mark for chats, a cyan dot at its corner when something is unread. Click it for the history. Nothing else in the rail.',
    },
    {
      id: 'b',
      label: 'Stack',
      desc: 'The orb is the top card of a small stack — two more cards show behind it, down and to the right — so one mark says “and the rest”. Hover fans the stack; a cyan dot says something is unread; click opens the history.',
    },
    {
      id: 'c',
      label: 'Capsule',
      desc: 'The block becomes one capsule: the orb at the top, the count at the foot, on a single soft shape. Two targets — the main chat, and the rest.',
    },
    {
      id: 'd',
      label: 'Badge',
      desc: 'The orb with the count on its corner, the way an app icon wears one: an ink badge with “10” — the side chats, counted. One mark; click for the history.',
    },
    {
      id: 'e',
      label: 'Nav',
      desc: 'No orb: chats become one more item in the rail’s own row of icons — a chat glyph drawn at the weight of Home and Signal, lit like them when open. The rail stays one list of places.',
    },
    {
      id: 'f',
      label: 'Spark',
      desc: 'An ink disc with Vicino’s sparkle in white — the mark Brain already uses — in place of the orb. One solid, legible coin for “Vicino”; click for the history.',
    },
  ];

  var HISTS = [
    {
      id: 'a',
      label: 'Fold',
      desc: 'The main chat as a card, then the side chats as one list with hairlines between: the five latest show, the rest fold under “Show 5 more”. One line each, the title only; time and menu on hover. Documents as cards two to a row.',
    },
    {
      id: 'b',
      label: 'Dated',
      desc: 'The main chat as a card, then the side chats by day — Today, Yesterday, This week, Earlier — one line each, no times; the day says when. How the day headings are set is picked on the next row. Documents grouped the same way.',
    },
    {
      id: 'c',
      label: 'Main first',
      desc: 'The main chat as a card, then “Side chats” and one plain list, every title on the same left edge as the card’s orb. Time and menu on hover. Documents a list of small pages, each tinted and marked by its kind.',
    },
  ];

  /* Dated's day headings, three ways — none with a filled block. */
  var DATEDS = [
    {
      id: 'rule',
      label: 'Rule',
      desc: 'Each day a small-capital heading with a hairline running on to the right of it; the chats under it, a clear step of space before the next day.',
    },
    {
      id: 'weight',
      label: 'Weight',
      desc: 'Levels by type alone: the day small, regular and grey; the chats under it a size larger in dark regular — the way a sidebar of projects reads.',
    },
    {
      id: 'divider',
      label: 'Divider',
      desc: 'A full-width hairline between days and a quiet heading under each line, so each day reads as its own section.',
    },
  ];

  var CARDS = [
    {
      id: 'clip',
      label: 'Clip',
      desc: 'The post as a low card clipped to the field’s top-left corner: the picture, “Editing a post”, the name, a clear — one line, in the field’s own glass.',
    },
    {
      id: 'float',
      label: 'Float',
      desc: 'Narrower and taller, and floating: the picture stands up on top, tilted, a second sheet peeking from behind it; under it “Editing a post” and the name. It hovers over the field’s corner, half on, half off.',
    },
  ];

  /* The capture's chats, told apart. `title` is the prompt the product uses
     today; `short` the title the history asks for; `ctx` what the chat is
     about. The open side chat is the one the captured panel shows. */
  var MAIN = {
    id: 'main',
    title: 'Main chat',
    short: 'Main chat',
    time: '2h',
    date: 'Oct 22, 12:51 PM',
    chip: 'Main',
    ctx: { kind: 'Brain', name: 'Shopify' },
  };
  var SIDE = [
    {
      id: 's1',
      title: 'Guided campaign tour 3',
      short: 'Guided campaign tour 3',
      time: '1h',
      date: 'Oct 22, 2:51 PM',
      locked: true,
      chip: 'Tour',
      ctx: { kind: 'Campaign', name: 'Your first post' },
    },
    {
      id: 's2',
      title: 'Can you add this image to the reference image for this brief?',
      short: 'Reference image for the brief',
      time: '3h',
      date: 'Oct 22, 1:39 PM',
      ctx: { kind: 'Post', name: 'A four-slide X carousel' },
    },
    {
      id: 's3',
      title: 'What should I do next?',
      short: 'What to do next',
      time: '5h',
      date: 'Oct 21, 6:59 PM',
      ctx: { kind: 'Brain', name: 'Roadmap' },
    },
    {
      id: 's4',
      title: "I'm not satisfied with the story structure, could you generate …",
      short: 'Story structure, another take',
      time: '1d',
      date: 'Oct 21, 5:29 PM',
      gen: true,
      ctx: { kind: 'Post', name: 'Pop-up sale carousel' },
    },
    {
      id: 's5',
      title: 'How should we respond to this critical brand risk? Looks like t…',
      short: 'Responding to the brand risk',
      time: '1d',
      date: 'Oct 19, 6:12 PM',
      unread: true,
      ctx: { kind: 'Signal', name: 'Critical brand risk' },
    },
    {
      id: 's6',
      title: 'Help me plan a new campaign — start by asking me about the goal.',
      short: 'Planning a new campaign',
      time: '2d',
      date: 'Oct 19, 5:47 PM',
      ctx: { kind: 'Campaign', name: 'Untitled' },
    },
    {
      id: 's7',
      title: 'Generate fresh creative options for “Verify Where Checkout Happ…',
      short: 'Creative options for Verify Checkout',
      time: '3d',
      date: 'Oct 19, 5:35 PM',
      ctx: { kind: 'Campaign', name: 'Verify Where Checkout Happens' },
    },
    {
      id: 's8',
      title: 'Guided campaign tour 2',
      short: 'Guided campaign tour 2',
      time: '4d',
      date: 'Oct 19, 5:29 PM',
      locked: true,
      chip: 'Tour',
      ctx: { kind: 'Campaign', name: 'When a Pop-Up Sale Changes Stock' },
    },
    {
      id: 's9',
      title: 'What should we do about this market update? WooCommerce reinf...',
      short: 'WooCommerce market update',
      time: 'Oct 14',
      date: 'Oct 9, 5:07 PM',
      ctx: { kind: 'Signal', name: 'WooCommerce reinforces checkout' },
    },
    {
      id: 's10',
      title: 'This signals Shopify is actively productizing generative-AI c...',
      short: 'Shopify’s generative-AI signal',
      time: 'Oct 12',
      date: 'Oct 1, 6:49 PM',
      ctx: { kind: 'Signal', name: 'Shopify productizes generative AI' },
    },
  ];

  var PROMPTS = [
    'What should I do next?',
    'Summarize the latest brand signals.',
    'Draft a short creative plan.',
  ];

  var section = document.querySelector('.sidebar-recent-chat');
  if (!section) return;
  var captured = section.innerHTML;
  var capturedClass = section.className;

  var state = {
    variant: read(KEY, 'v', VARIANTS, 'd'),
    window: read(KEY_W, 'w', WINDOWS, 'c'),
    rail: read('sc-rail', 'c', RAILS, 'b'),
    card: read('sc-card', 't', CARDS, 'float'),
    hist: read('sc-hist', 'h', HISTS, 'b'),
    dated: read('sc-dated', 'd', DATEDS, 'weight'),
    foldOpen: false,
    finding: false,
    docsGone: {},
    active: 's2',
    open: false,
    view: 'chat',
    tab: 'chats',
    fullscreen: false,
    query: '',
    pinned: {},
    gone: {},
  };

  function read(key, param, list, fallback) {
    var q = urlCurrent ? params.get(param) : null;
    var saved = null;
    try {
      if (storeCurrent) saved = localStorage.getItem(key);
    } catch (e) {
      /* private window */
    }
    var v = q || saved || fallback;
    return list.some(function (x) {
      return x.id === v;
    })
      ? v
      : fallback;
  }

  function save() {
    try {
      localStorage.setItem(KEY, state.variant);
      localStorage.setItem(KEY_W, state.window);
      localStorage.setItem('sc-rail', state.rail);
      localStorage.setItem('sc-card', state.card);
      localStorage.setItem('sc-hist', state.hist);
      localStorage.setItem('sc-dated', state.dated);
    } catch (e) {
      /* private window */
    }
    var url = new URL(location.href);
    url.searchParams.delete('m');
    url.searchParams.set('s', STORE_V);
    url.searchParams.set('v', state.variant);
    url.searchParams.set('w', state.window);
    url.searchParams.set('c', state.rail);
    url.searchParams.set('t', state.card);
    url.searchParams.delete('g');
    url.searchParams.delete('l');
    url.searchParams.set('h', state.hist);
    url.searchParams.set('d', state.dated);
    url.searchParams.delete('f');
    history.replaceState(null, '', url);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function chatOf(id) {
    if (id === 'main') return MAIN;
    for (var i = 0; i < SIDE.length; i++) if (SIDE[i].id === id) return SIDE[i];
    return null;
  }

  function titleOf(id) {
    var c = chatOf(id);
    if (c) return c.short;
    var b = section.querySelector('[data-chat="' + id + '"] .sidebar-recent-chat__title');
    return b ? b.textContent : '';
  }

  var ICON = {
    /* The history's chat glyph: a round speech bubble, drawn thin. */
    bubble:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    chat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    chats:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>',
    search:
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    doc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    trash:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    more: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    pin: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>',
    grow: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>',
    shrink:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 10 7-7"/><path d="M20 10h-6V4"/><path d="m3 21 7-7"/><path d="M4 14h6v6"/></svg>',
    spark:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>',
    clip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  };

  /* ── Sidebar pieces ─────────────────────────────────────────────────── */

  function orb() {
    return '<span class="sc-orb" aria-hidden="true"><span class="vorb"><span class="vorb__halo"></span><span class="vorb__core"></span></span></span>';
  }

  function glyph() {
    return '<span class="sc-glyph" aria-hidden="true">' + ICON.chat + '</span>';
  }

  function head(label) {
    return (
      '<div class="sidebar-recent-chat__head">' +
      (label || '') +
      '<div class="sidebar-recent-chat__actions">' +
      '<button class="sidebar-recent-chat__action-btn" type="button" aria-label="Manage chats" aria-pressed="false" title="Manage chats">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path></svg></button>' +
      '<button class="sidebar-recent-chat__action-btn" type="button" aria-label="New side chat" title="New side chat" data-new>' +
      '<svg fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg></button>' +
      '</div></div>'
    );
  }

  function row(c) {
    var active = state.open && state.active === c.id;
    return (
      '<button class="sidebar-recent-chat__item sc-row' +
      (active ? ' active' : '') +
      (c.locked ? ' is-delete-locked' : '') +
      '" type="button" data-chat="' +
      c.id +
      '" title="' +
      esc(c.title) +
      '"' +
      (active ? ' aria-current="page"' : '') +
      '>' +
      glyph() +
      '<span class="sidebar-recent-chat__copy"><span class="sidebar-recent-chat__title">' +
      esc(c.short) +
      '</span></span>' +
      '<span class="sc-rowmore" role="button" tabindex="0" aria-label="More" data-more="' +
      c.id +
      '">' +
      ICON.more +
      '</span></button>'
    );
  }

  function live() {
    return SIDE.filter(function (c) {
      return !state.gone[c.id];
    });
  }

  function rows() {
    return live().map(row).join('');
  }

  function unreadCount() {
    return live().filter(function (c) {
      return c.unread;
    }).length;
  }

  /* What a folded rail adds under the orb: the count, for the Capsule.
     Hidden while the sidebar is open. */
  function railExtras() {
    var n = live().length;
    var unread = unreadCount();
    return (
      '<button class="sc-cap' +
      (unread ? ' is-unread' : '') +
      '" type="button" aria-label="' +
      n +
      ' side chats' +
      (unread ? ', ' + unread + ' unread' : '') +
      '" title="' +
      n +
      ' side chats' +
      (unread ? ' · ' + unread + ' unread' : '') +
      '">' +
      n +
      '</button>' +
      '<span class="sc-n" aria-hidden="true">' +
      n +
      '</span>'
    );
  }

  function main() {
    var active = state.open && state.active === 'main';
    return (
      '<button class="sidebar-recent-chat__item sc-main' +
      (active ? ' active' : '') +
      '" type="button" data-chat="main" title="Main chat"' +
      (active ? ' aria-current="page"' : '') +
      '>' +
      orb() +
      '<span class="sidebar-recent-chat__copy"><span class="sidebar-recent-chat__title">' +
      MAIN.title +
      '</span></span>' +
      '</button>'
    );
  }

  /* ── The sidebar drawings ───────────────────────────────────────────── */

  var draw = {
    now: function () {
      section.className = capturedClass + ' sc-col-' + state.rail;
      section.innerHTML = captured;
      var items = section.querySelectorAll('.sidebar-recent-chat__item');
      items.forEach(function (b, i) {
        var c = SIDE[i];
        b.dataset.chat = c ? c.id : 's' + (i + 1);
        if (i === 1 && c) {
          b.querySelector('.sidebar-recent-chat__title').textContent = c.title;
          b.title = c.title;
          b.setAttribute('aria-label', c.title);
        }
        var on = state.open && b.dataset.chat === state.active;
        b.classList.toggle('active', on);
        if (on) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
        b.classList.add('sc-row');
        b.insertAdjacentHTML('afterbegin', glyph());
      });
      section.insertAdjacentHTML('beforeend', railExtras());
    },
    a: function () {
      pinned('sc-a', true);
    },
    b: section_,
    c: function () {
      pinned('sc-c', false);
    },
    d: function () {
      pinned('sc-d', true);
    },
    e: function () {
      pinned('sc-e', true);
    },
    f: function () {
      pinned('sc-f', true);
    },
  };

  /* Section: the main chat first, then a rule, then "Side chats" as a titled
     section with the actions that only apply to side chats. */
  function section_() {
    section.className =
      capturedClass + ' is-sc sc-b sc-col-' + state.rail + (state.norule ? ' sc-norule' : '');
    section.innerHTML =
      main() +
      head('<span>Side chats</span>') +
      '<div class="sidebar-recent-chat__list">' +
      rows() +
      '</div>' +
      railExtras();
  }

  function pinned(cls, rule) {
    section.className =
      capturedClass +
      ' is-sc ' +
      cls +
      ' sc-col-' +
      state.rail +
      (state.norule ? ' sc-norule' : '');
    section.innerHTML =
      head('<span>Chats</span>') +
      main() +
      (rule ? '<div class="sc-rule" role="presentation"></div>' : '') +
      '<div class="sidebar-recent-chat__list">' +
      rows() +
      '</div>' +
      railExtras();
  }

  function render() {
    draw[state.variant]();
    renderWindow();
    renderSwitcher();
  }

  /* ── Picking a chat ─────────────────────────────────────────────────── */

  function pick(id) {
    state.active = id;
    var c = chatOf(id);
    if (c && c.unread) c.unread = false;
    var title = id === 'main' ? null : titleOf(id);
    var launcher = document.querySelector('.chat-dock__launcher-text');
    if (launcher) {
      launcher.textContent = title
        ? 'Message Vicino — continues “' + title + '”'
        : 'Message Vicino — in your main chat';
    }
    if (state.view === 'chat') setSubtitle(title || 'Main chat');
    draw[state.variant]();
    if (state.view === 'sessions') renderSessions();
  }

  section.addEventListener('click', function (e) {
    if (e.target.closest('.sc-cap')) {
      openChat();
      showSessions();
      return;
    }
    if (e.target.closest('[data-new]')) {
      openChat();
      showEmpty();
      return;
    }
    var more = e.target.closest('[data-more]');
    if (more) {
      e.stopPropagation();
      openMenu(more, more.dataset.more);
      return;
    }
    var b = e.target.closest('[data-chat]');
    if (!b) return;
    /* folded, the one-mark drawings' orb is the whole of chats: it opens the history */
    if (
      'abdef'.indexOf(state.rail) >= 0 &&
      side &&
      side.classList.contains('is-collapsed') &&
      b.dataset.chat === 'main'
    ) {
      openChat();
      showSessions();
      return;
    }
    pick(b.dataset.chat);
    if (state.view !== 'chat') backToChat();
    if (!state.open) openChat();
  });

  /* ── The chat window ────────────────────────────────────────────────── */

  var shell = document.querySelector('.app-shell') || document.body;
  var dock = document.querySelector('.chat-dock');
  var panel = document.querySelector('.chat-dock__panel');
  var launcherRow = document.querySelector('.chat-dock__launcher-row');
  var side = document.getElementById('app-sidebar');
  var header = panel && panel.querySelector('.chat-dock__header');
  var subtitle = panel && panel.querySelector('.chat-dock__subtitle');
  var body = panel && panel.querySelector('.chat-dock__body');
  var compose = panel && panel.querySelector('.chat-dock__compose');
  var composer = panel && panel.querySelector('.chat-dock__composer');
  var input = panel && panel.querySelector('.chat-dock__input');
  var announcement = panel && panel.querySelector('.chat-dock__announcement');
  var compactWrap = header && header.querySelector('.chat-dock__compact-wrap');
  var showChats = header && header.querySelector('[aria-label="Show chats"]');
  var fullBtn = header && header.querySelector('.chat-dock__fullscreen-toggle');
  var closeBtn = header && header.querySelector('[aria-label="Close Vicino"]');
  var sideWasCollapsed = false;

  /* The back arrow the product shows in place of Show chats while the history
     is open. */
  var backBtn = document.createElement('button');
  backBtn.className = 'chat-dock__header-button';
  backBtn.type = 'button';
  backBtn.setAttribute('aria-label', 'Back to current chat');
  backBtn.dataset.tip = 'Back to current chat';
  backBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>';
  backBtn.style.display = 'none';
  if (closeBtn) closeBtn.parentNode.insertBefore(backBtn, closeBtn);

  /* The header's icon buttons swap the browser's title for the product's
     tooltip, drawn in CSS from data-tip. */
  [showChats, fullBtn, closeBtn].forEach(function (b) {
    if (!b) return;
    b.dataset.tip = b.title || b.getAttribute('aria-label');
    b.removeAttribute('title');
  });
  if (closeBtn) closeBtn.dataset.tip = 'Close';

  var sessions = document.createElement('div');
  sessions.className = 'chat-dock__sessions';
  sessions.style.display = 'none';
  if (announcement) announcement.parentNode.insertBefore(sessions, announcement.nextSibling);

  /* The empty state: what a new chat opens on (the product's "Ask Vicino"). */
  var empty = document.createElement('div');
  empty.className = 'sc-empty';
  empty.style.display = 'none';
  empty.innerHTML =
    '<div class="sc-empty__glow" aria-hidden="true"></div>' +
    '<span class="sc-empty__orb" aria-hidden="true"><span class="vorb"><span class="vorb__halo"></span><span class="vorb__core"></span></span></span>' +
    '<h2 class="sc-empty__title">Ask Vicino</h2>' +
    '<p class="sc-empty__lede">Work with Shopify’s knowledge, signals, and campaign context.</p>' +
    '<div class="sc-empty__chips">' +
    PROMPTS.map(function (p) {
      return (
        '<button type="button" class="sc-empty__chip" data-prompt="' +
        esc(p) +
        '">' +
        esc(p) +
        '</button>'
      );
    }).join('') +
    '</div>';
  if (announcement) announcement.parentNode.insertBefore(empty, sessions.nextSibling);
  empty.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-prompt]');
    if (chip && input) {
      input.value = chip.dataset.prompt;
      input.focus();
    }
  });

  /* Each turn's "when": the meta line the Paper drawing reads as a thread. */
  var WHEN = [
    '14 min ago',
    '13 min ago',
    '12 min ago',
    '9 min ago',
    '8 min ago',
    '3 min ago',
    '2 min ago',
    '2 min ago',
  ];
  /* Vicino's turns carry their time in the actions row, beside Copy, so it
     shows only on hover with the rest of the row. */
  if (panel) {
    panel.querySelectorAll('.chat-dock__message:not(.is-user)').forEach(function (m, i) {
      var row = m.querySelector('.chat-dock__message-actions');
      if (row)
        row.insertAdjacentHTML(
          'beforeend',
          '<span class="sc-when">' + (WHEN[i] || 'just now') + '</span>'
        );
    });
  }

  /* ── Attachments ────────────────────────────────────────────────────── */

  /* The files the prototype can attach: the capture's own pictures, plus a
     PDF and a document, to show a tile that has no picture. */
  var FILES = [
    { name: 'Pop-up sale carousel.jpg', img: 'assets/f70b8de1-643d-4b33-affb-56037a37cff5.jpg' },
    { name: 'Inventory playbook.pdf', kind: 'PDF' },
    { name: 'Launch brief.docx', kind: 'DOC' },
    {
      name: 'Zest storefront.png',
      img: 'assets/122e8c41eba24eca979b38b3a584a683-An-online-store-interface-for-a-juice-brand-nam.png',
    },
    {
      name: 'Guests on Earth.png',
      img: 'assets/2b12fa68c9644dbbaa17aea4161e8f35-Photo-of-Guests-on-Earth-natural-cleaning-produ.png',
    },
    {
      name: 'Our Place cookware.png',
      img: 'assets/4a8df5b8faa34ff68bd0290c3ee5d1c0-Photo-of-Our-Place-cookware-products.png',
    },
    {
      name: 'Glossier site.png',
      img: 'assets/54614322c9324f3fbdc52b4347dee4a9-Image-of-Glossier-website-selling-beauty-produc.png',
    },
  ];

  function fileGlyph() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
  }

  /* A tile in a message for a file with no picture — the same veil, the
     same Save. */
  function fileTile(f, inBrain) {
    return (
      '<span class="sc-file" tabindex="0" title="' +
      esc(f.name) +
      '">' +
      fileGlyph() +
      '<span class="sc-file__kind">' +
      f.kind +
      '</span>' +
      '<span class="sc-file__veil"><span class="chat-dock__message-attachment"><span>' +
      esc(f.name) +
      '</span></span>' +
      (inBrain
        ? '<span class="chat-dock__attachment-status">' +
          ICON.chat.replace('width="14" height="14"', 'width="11" height="11"') +
          'In Brain</span>'
        : '<button type="button" class="chat-dock__attachment-save">Save to Brain</button>') +
      '</span></span>'
    );
  }

  /* The first user turn carries one picture in the capture; two more files
     join it here so the row and its sideways scroll can be seen. */
  var firstAtt =
    panel && panel.querySelector('.chat-dock__message.is-user .chat-dock__message-attachments');
  if (firstAtt) {
    firstAtt.insertAdjacentHTML('beforeend', fileTile(FILES[1], true) + fileTile(FILES[2], false));
  }

  /* Attaching in the composer: the attach control adds the next files from
     the list; each tile can be cleared. */
  var attRow = document.createElement('div');
  attRow.className = 'sc-att';
  attRow.setAttribute('aria-label', 'Attached files');
  var attached = [];
  var attNext = 0;
  var attachBtn = panel && panel.querySelector('.chat-dock__tool');
  /* the capture's send is disabled (an empty field); here it is live, so the
     control can be seen as it is, and sending does nothing */
  var sendBtn = panel && panel.querySelector('.chat-dock__send');
  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.type = 'button';
  }
  if (composer) composer.insertBefore(attRow, composer.firstChild);

  function renderAttached() {
    if (!composer) return;
    composer.classList.toggle('has-att', attached.length > 0);
    if (attachBtn) attachBtn.classList.toggle('is-on', attached.length > 0);
    attRow.innerHTML = attached
      .map(function (f, i) {
        return (
          '<span class="sc-att__item" title="' +
          esc(f.name) +
          '">' +
          (f.img
            ? '<img src="' + f.img + '" alt="">'
            : fileGlyph() + '<span class="sc-file__kind">' + f.kind + '</span>') +
          '<span class="sc-att__name">' +
          esc(f.name) +
          '</span>' +
          '<button type="button" class="sc-att__x" aria-label="Remove ' +
          esc(f.name) +
          '" data-att="' +
          i +
          '"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
          '</span>'
        );
      })
      .join('');
  }

  if (attachBtn) {
    attachBtn.addEventListener('click', function (e) {
      e.preventDefault();
      /* two files per press, as if picked together */
      for (var i = 0; i < 2; i++) {
        attached.push(FILES[attNext % FILES.length]);
        attNext++;
      }
      renderAttached();
      if (input) input.focus();
    });
  }

  attRow.addEventListener('click', function (e) {
    var x = e.target.closest('[data-att]');
    if (!x) return;
    attached.splice(Number(x.dataset.att), 1);
    renderAttached();
  });

  /* The "Editing · Post · …" chip over the composer, drawn again for the
     glass windows. The capture's chip stays for Now; this one sits beside it
     and the CSS shows one or the other. */
  var target = panel && panel.querySelector('.chat-dock__target');
  var redrawn = null;
  if (target) {
    var label = target.querySelector('.chat-dock__target-label');
    var parts = (label ? label.textContent : '').split(' · ');
    var name = parts.slice(2).join(' · ') || parts.join(' · ');
    /* with the post drawer here, the card names the post as the drawer does */
    if (window.SCPost) name = window.SCPost.title;
    redrawn = document.createElement('div');
    redrawn.className = 'sc-tg';
    redrawn.innerHTML =
      '<span class="sc-tg__tile" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3v18"/><rect width="12" height="18" x="6" y="3" rx="2"/><path d="M22 3v18"/></svg></span>' +
      '<span class="sc-tg__text"><span class="sc-tg__kicker"><b>Editing</b> a post</span><span class="sc-tg__name">' +
      esc(name) +
      '</span></span>' +
      '<button type="button" class="sc-tg__clear" aria-label="Stop editing this post" title="Stop editing"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
    target.parentNode.insertBefore(redrawn, target.nextSibling);
    /* clearing takes the card out altogether, so the field closes up */
    redrawn.querySelector('.sc-tg__clear').addEventListener('click', function (e) {
      e.stopPropagation();
      setEditing(false);
    });
    /* the card is the post: clicking it opens the post drawer, and again closes it */
    if (window.SCPost) {
      redrawn.classList.add('is-link');
      redrawn.title = 'Open the post';
      redrawn.addEventListener('click', function () {
        /* it opens on Story, where the change is being made or has landed;
           one at a time, it shows the post rather than closing it */
        if (oneAtATime() && pane === 'chat') showPane('post');
        else if (window.SCPost.isOpen()) window.SCPost.close();
        else openPost({ reveal: true });
      });
    }
  }

  /* The card is hidden by default; E (or the switcher's link) brings it in
     and takes it away again: both the capture's chip and the redrawn card
     leave the form altogether, so the field closes up, and come back in
     front of the composer. */
  var tgParent = target && target.parentNode;
  var tgNext = redrawn && redrawn.nextSibling;
  /* hidden by default (Zi, 2026-10-29): E shows it, and nothing else turns
     it back on — not R, not the menu */
  state.editing = false;

  function setEditing(on) {
    state.editing = !!on;
    show(state.view);
    renderSwitcher();
  }

  function placeEditing() {
    if (!target || !redrawn || !tgParent) return;
    var on = state.view === 'chat' && state.editing;
    if (on && !redrawn.parentNode) {
      tgParent.insertBefore(target, tgNext);
      tgParent.insertBefore(redrawn, tgNext);
    } else if (!on && redrawn.parentNode) {
      target.remove();
      redrawn.remove();
    }
  }

  placeEditing();

  /* ── Applying an approved change, and when it fails ─────────────────────
     The ClickUp issue "Poor Error Recovery After Approval Failure": once a
     change was approved, a failure threw it away — a red card, then a second
     message saying the same thing, and the user had to ask all over again.

     Here the approval stays one card for its whole life. What was approved
     stays on it (the new story structure itself), the head's chip is the
     outcome, and a failure says it once, in plain words, with Retry — the
     same approved change, no new approval. The post it was meant for says
     so too: the Editing card marks the section that did not change. */
  /* The versions are the post drawer's (src/drawer/post-drawer.js), so the
     card and the post say the same thing. */
  var POSTD = window.SCPost || null;
  /* What the change covers: 'story' (one section, the story structure) or
     'brief' (the whole brief). The menu switches it; the card, the post and
     the Editing card follow. */
  var scope = 'brief';
  if (POSTD) POSTD.setScope(scope);
  function pool() {
    if (!POSTD) return DRAFTS;
    return scope === 'brief' ? POSTD.story.briefDrafts : POSTD.story.drafts;
  }
  function what(cap) {
    var w = scope === 'brief' ? 'brief' : 'story structure';
    return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }
  var DRAFTS = POSTD
    ? POSTD.story.drafts
    : [
        {
          frames: [
            'A shop owner tallies what sold at a weekend pop-up, the sheet still on the counter.',
            'The same counts sit in Shopify inventory beside the online stock.',
            'One product runs low in both places; the owner reorders it before Monday.',
            'The restock arrives, and the product is back on the online shelf.',
          ],
          caption: 'What sells in person can tell you what to stock online.',
          blurb: 'Here’s a new story structure.',
          sum: '4 new frames and a new caption.',
        },
      ];

  /* "View changes": where to review what landed. It opens the post on the
     section that changed and plays its highlight again. */
  function viewBtn() {
    return POSTD
      ? '<button type="button" class="sc-ap__view" data-ap-view>View changes' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>'
      : '';
  }

  /* ── Drafting, reviewing, then applying: one card ──────────────────────
     ClickUp "[AI Post Editing] Issue interacting with AI when making edits":
     the approval card asked the user to approve a long block of AI
     instructions — not the content — so it was hard to know what was being
     approved. Zi's call (2026-10-29): skip approving instructions. Vicino
     writes the new version straight away, in the card, frame by frame
     (drafting); the user reads the real frames and chooses (review): apply
     it to the post, try another version, compare it with the post, or type a
     note for a revision. Only "Apply to post" writes to the post (applying,
     then failed / stopped / applied, as before).

     `ap.state`: 'drafting' · 'review' · 'unwritten' (stopped before a draft
     was ready) · 'applying' · 'failed' · 'stopped' · 'applied'.
     `ap.drafts` lists the versions written so far (indexes into DRAFTS),
     `ap.cur` the one shown. Nothing of a version shows until it is whole:
     while drafting the card holds a quiet placeholder, so the same card
     serves any change (a story, a whole brief, an image). The page opens on the first draft, written when the chat opens. */
  var ap = {
    state: 'drafting',
    all: false,
    why: false,
    drafts: [],
    cur: 0,
    fresh: false, // a version just finished: it comes in, once, all together
    rvScroll: 0, // where the review area was scrolled, kept across redraws
    expanded: false, // "Show all": the whole version shown, the card grown to it
    applies: 0,
  };
  var apCard = null;
  var apSay = null;
  var apTurn = null;

  function draft() {
    var list = pool();
    return list[ap.drafts[ap.cur]] || list[0];
  }

  /* ── The run: one in-progress state for drafting, applying and Retry ───
     ClickUp "[AI Post Editing] Missing Generation / In-Progress State": the
     work never looked like it was happening. Under the card sits
     draft/brain-generation's rolling log (chosen 2026-10-19), cut to one
     quiet line: the step being taken, with a typed ellipsis; the next step
     pushes it up and out. No checks, no counter, no progress bar, no time.
     Stop is the composer's send button, which turns into Stop while Vicino
     works. The log is one element kept across re-renders, so each row's
     entrance plays once. */
  var RUNS = {
    /* said of any change — a story, a whole brief, an image — since nothing
       of the version is shown until it is whole */
    draft: [
      'Reading what’s on the post now',
      'Writing a new version',
      'Checking it against the brief',
      'Getting it ready to review',
    ],
    first: ['Checking the post’s latest version', 'Putting the new version in place', 'Saving to the post'],
    retry: ['Checking the post’s latest version', 'Putting the new version in place', 'Saving to the post'],
  };
  var STEP_MS = 1500;
  var DRAFT_MS = 1500;
  var run = { timer: null, kind: 'draft', started: false };
  var motion =
    !!window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var logEl = document.createElement('div');
  logEl.className = 'sc-ap__log';
  logEl.setAttribute('role', 'status');
  logEl.setAttribute('aria-live', 'polite');
  logEl.innerHTML = '<ol aria-label="What Vicino is doing"></ol>';
  var logList = logEl.firstChild;
  var logCurrent = null;

  function logAtBottom() {
    return logEl.scrollHeight - logEl.clientHeight - logEl.scrollTop < 2;
  }

  /* a new step comes in at the foot, running; the rows glide up one row */
  function logAdd(label) {
    var pinned = logAtBottom();
    logList.insertAdjacentHTML(
      'beforeend',
      '<li class="sc-log__row is-active">' +
        '<span class="sc-log__label">' +
        esc(label) +
        '<span class="sc-log__dots" aria-hidden="true"><i></i><i></i><i></i></span></span></li>'
    );
    logCurrent = logList.lastElementChild;
    if (pinned) logEl.scrollTop = logEl.scrollHeight;
    if (!motion || !logEl.isConnected) return;
    var rows = window.gsap.utils.toArray(logList.children);
    /* finish, don't just kill, a glide still running: a killed "from" tween
       would leave its row where it started — invisible */
    window.gsap.getTweensOf(rows).forEach(function (t) {
      t.progress(1).kill();
    });
    window.gsap.from(rows, {
      y: logCurrent.getBoundingClientRect().height || 24,
      duration: 0.6,
      ease: 'power3.out',
    });
    window.gsap.from(logCurrent, { autoAlpha: 0, duration: 0.4, delay: 0.12, ease: 'power2.out' });
  }

  /* the running step is done: it loses its dots and is carried up out of
     the one-line window by the next */
  function logDone() {
    if (!logCurrent) return;
    logCurrent.classList.remove('is-active');
    var dots = logCurrent.querySelector('.sc-log__dots');
    if (dots) dots.remove();
  }

  function logReset() {
    logList.innerHTML = '';
    logCurrent = null;
  }

  function stopTimer() {
    clearInterval(run.timer);
    run.timer = null;
  }

  function busy() {
    return ap.state === 'drafting' || ap.state === 'applying';
  }

  /* Writing a version: each step brings the next frame into the card. A
     `note` makes it the revision; otherwise it is the next take. `hold`
     (the switcher) leaves it on its last step. */
  function startDraft(note, hold) {
    stopTimer();
    run.kind = 'draft';
    run.started = true;
    logReset();
    /* the last version in the pool is the revision after a note; the
       others take turns as "Try another" */
    var n = pool().length;
    var takes = Math.max(1, n - 1);
    var next = note ? n - 1 : ap.drafts.length ? (ap.drafts[ap.drafts.length - 1] + 1) % takes : 0;
    ap.drafts.push(next);
    ap.cur = ap.drafts.length - 1;
    ap.rvScroll = 0;
    ap.state = 'drafting';
    ap.why = false;
    if (POSTD) POSTD.setProposal(draft());
    renderApply();
    renderSwitcher();
    var steps = RUNS.draft;
    var i = 0;
    logAdd(steps[0]);
    run.timer = setInterval(function () {
      if (i === steps.length - 1) {
        if (hold) return stopTimer();
        stopTimer();
        logDone();
        ap.fresh = true;
        ap.state = 'review';
        renderApply();
        renderSwitcher();
        return;
      }
      logDone();
      i += 1;
      logAdd(steps[i]);
    }, DRAFT_MS);
  }

  /* Applying the version shown: the first time it fails at its last step,
     so the recovery can be seen; Retry runs it again to the end. */
  function startRun(kind, hold) {
    stopTimer();
    run.kind = kind;
    run.started = true;
    logReset();
    ap.state = 'applying';
    ap.why = false;
    renderApply();
    renderSwitcher();
    var steps = RUNS[kind];
    var i = 0;
    logAdd(steps[0]);
    run.timer = setInterval(function () {
      if (i === steps.length - 1) {
        if (hold) return stopTimer();
        stopTimer();
        logDone();
        ap.state = kind === 'first' ? 'failed' : 'applied';
        renderApply();
        renderSwitcher();
        return;
      }
      logDone();
      i += 1;
      logAdd(steps[i]);
    }, STEP_MS);
  }

  function applyDraft() {
    ap.applies += 1;
    startRun(ap.applies === 1 ? 'first' : 'retry');
  }

  /* Stop: drafting falls back to the version before it (or to nothing
     written); applying stops with the post unchanged. */
  function stopRun() {
    stopTimer();
    if (ap.state === 'drafting') {
      ap.drafts.pop();
      if (ap.drafts.length) {
        ap.cur = ap.drafts.length - 1;
        ap.state = 'review';
        if (POSTD) POSTD.setProposal(draft());
      } else ap.state = 'unwritten';
    } else ap.state = 'stopped';
    renderApply();
    renderSwitcher();
  }

  /* While Vicino works, the composer's send button is Stop: the same ink
     circle, a square in place of the arrow — the way a chat stops a reply it
     is still writing. */
  var sendIconHtml = sendBtn ? sendBtn.innerHTML : '';
  var placeholder = input ? input.getAttribute('placeholder') : '';
  function setSendStop(on) {
    if (!sendBtn) return;
    if (sendBtn.classList.contains('is-stop') === on) return;
    sendBtn.classList.toggle('is-stop', on);
    sendBtn.innerHTML = on
      ? '<svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="currentColor"/></svg>'
      : sendIconHtml;
    sendBtn.setAttribute('aria-label', on ? 'Stop Vicino' : 'Send message');
  }

  /* the first draft is written the first time the chat is opened, so it is seen */
  function startFirstRun() {
    if (run.started || !apCard) return;
    startDraft();
  }

  var AP_ICON = {
    brief:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3v18"/><rect width="12" height="18" x="6" y="3" rx="2"/><path d="M22 3v18"/></svg>',
    check:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    alert:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
    retry:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    arrow:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    panel:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>',
    left: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  };

  var WHY =
    'The post was edited after you chose this version, so Vicino stopped rather than write over it. Retry puts this same structure on the latest version; you don’t need to choose it again.';

  function retryBtn(label) {
    return (
      '<button type="button" class="sc-ap__retry" data-ap-retry>' +
      AP_ICON.retry +
      (label || 'Retry') +
      '</button>'
    );
  }

  function whyBtn() {
    return (
      '<button type="button" class="sc-ap__why" data-ap-why aria-expanded="' +
      ap.why +
      '">Why?</button>'
    );
  }

  function whyText() {
    return ap.why ? '<p class="sc-ap__detail">' + WHY + '</p>' : '';
  }

  /* The head's chip is where it stands. Never "Approved" while Vicino is
     still working. */
  function apChip() {
    if (ap.state === 'drafting')
      return '<span class="sc-ap__chip is-applying"><span class="sc-ring" aria-hidden="true"></span>Writing</span>';
    if (ap.state === 'review') return '<span class="sc-ap__chip is-review">To review</span>';
    if (ap.state === 'unwritten') return '<span class="sc-ap__chip is-stopped">Stopped</span>';
    if (ap.state === 'applying')
      return '<span class="sc-ap__chip is-applying"><span class="sc-ring" aria-hidden="true"></span>Updating</span>';
    if (ap.state === 'stopped') return '<span class="sc-ap__chip is-stopped">Stopped</span>';
    if (ap.state === 'applied')
      return '<span class="sc-ap__chip is-applied">' + AP_ICON.check + 'Applied</span>';
    return '<span class="sc-ap__chip is-failed">' + AP_ICON.alert + 'Not applied</span>';
  }

  /* The title says what the card is about at this point, in plain words. */
  function apTitle() {
    if (ap.state === 'drafting') return 'Writing a new ' + what();
    if (ap.state === 'review' || ap.state === 'unwritten') return 'A new ' + what();
    return 'Update the post’s ' + what();
  }

  /* Versions: "‹ Version 2 of 3 ›", once there is more than one. */
  function pager() {
    /* only while choosing: once a version is being applied it is the one */
    if (ap.drafts.length < 2 || (ap.state !== 'drafting' && ap.state !== 'review')) return '';
    var busyNow = busy();
    return (
      '<span class="sc-ap__pager"><button type="button" class="sc-ap__pg" data-ap-ver="-1" aria-label="Previous version"' +
      (ap.cur === 0 || busyNow ? ' disabled' : '') +
      '>' +
      AP_ICON.left +
      '</button><span>Version ' +
      (ap.cur + 1) +
      ' of ' +
      ap.drafts.length +
      '</span><button type="button" class="sc-ap__pg" data-ap-ver="1" aria-label="Next version"' +
      (ap.cur === ap.drafts.length - 1 || busyNow ? ' disabled' : '') +
      '>' +
      AP_ICON.right +
      '</button></span>'
    );
  }

  /* One plain line under the frames: where it stands, and what to do. */
  function apFoot() {
    if (ap.state === 'drafting' || ap.state === 'applying') {
      return '<div class="sc-ap__line sc-ap__run"><div data-log></div></div>';
    }
    if (ap.state === 'review') {
      return (
        '<div class="sc-ap__line sc-ap__choose">' +
        (POSTD
          ? '<button type="button" class="sc-ap__btn" data-ap-compare title="See the part of the post this would change">' +
            AP_ICON.panel +
            'Compare</button>'
          : '') +
        '<span class="sc-ap__acts2"><button type="button" class="sc-ap__btn" data-ap-another>' +
        AP_ICON.retry +
        'Try another</button>' +
        '<button type="button" class="sc-ap__btn is-ink" data-ap-apply>Apply to post' +
        AP_ICON.arrow +
        '</button></span></div>'
      );
    }
    if (ap.state === 'unwritten') {
      return (
        '<div class="sc-ap__line"><span class="sc-ap__msg">Stopped before the draft was finished. Nothing was written.</span>' +
        '<button type="button" class="sc-ap__retry" data-ap-redraft>' +
        AP_ICON.retry +
        'Write it again</button></div>'
      );
    }
    if (ap.state === 'applied') {
      return (
        '<div class="sc-ap__line"><span class="sc-ap__msg">' +
        (scope === 'brief' ? 'On the post’s brief.' : 'On the post’s Story section.') +
        '</span>' +
        viewBtn() +
        '</div>'
      );
    }
    if (ap.state === 'stopped') {
      return (
        '<div class="sc-ap__line"><span class="sc-ap__msg">Stopped before anything changed. Your post is unchanged.</span>' +
        retryBtn() +
        '</div>'
      );
    }
    if (ap.state === 'failed') {
      return (
        '<div class="sc-ap__line"><span class="sc-ap__msg">Your post is unchanged. ' +
        whyBtn() +
        '</span>' +
        retryBtn() +
        whyText() +
        '</div>'
      );
    }
    return '';
  }

  function apHtml() {
    var d = draft();
    var body_ =
      ap.state === 'applied'
        ? /* it landed: the full text is on the post now, so the card says
             only what changed and where to see it */
          '<p class="sc-ap__sum">' + esc(d.sum) + '</p>'
        : ap.state === 'unwritten'
          ? ''
          : ap.state === 'drafting'
            ? /* nothing of the version until it is whole: a quiet placeholder */
              '<div class="sc-ap__ghost sc-ap__ghostblock" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
            : /* the version, in the same scrolling window at every stage
                 that shows it: review, updating, not applied, stopped */
              '<p class="sc-ap__field"><span class="sc-ap__fk">' +
              (ap.state === 'review' ? 'Proposed' : 'The chosen version') +
              '</span>' +
              pager() +
              '</p>' +
              apReview();
    return (
      '<div class="sc-ap__card"><div class="sc-ap__head"><span class="sc-ap__icon">' +
      AP_ICON.brief +
      '</span><span class="sc-ap__title">' +
      apTitle() +
      '</span>' +
      apChip() +
      '</div>' +
      body_ +
      apFoot() +
      '</div>'
    );
  }

  /* The frames. While drafting, the written ones and a quiet placeholder
     for each still to come; in review, all of them and the caption, to be
     read; while applying and after, the first two and "Show all". */
  /* A version can be long — a whole brief is six parts. The card keeps a
     ceiling and the version scrolls inside it (the Window design, kept on
     2026-10-29 over Tabs and Index); the buttons stay under it. */
  function partsOf(d) {
    var frames =
      '<ol class="sc-ap__frames sc-ap__frames--in">' +
      d.frames
        .map(function (f, i) {
          return '<li><span class="sc-ap__n">' + (i + 1) + '</span><span>' + esc(f) + '</span></li>';
        })
        .join('') +
      '</ol>';
    if (scope === 'brief')
      return [
        { k: 'msg', label: 'Main message', g: 'Message', html: '<p class="sc-rv__lead">' + esc(d.statement) + '</p>' },
        { k: 'aud', label: 'Target audience', g: 'Message', html: '<p>' + esc(d.audience) + '</p>' },
        { k: 'cta', label: 'Call to action', g: 'Message', html: '<p>' + esc(d.cta) + '</p>' },
        {
          k: 'proof',
          label: 'Proof points',
          g: 'Message',
          html:
            '<p class="sc-rv__chips">' +
            d.proofs
              .map(function (x) {
                return '<span>' + esc(x) + '</span>';
              })
              .join('') +
            '</p>',
        },
        { k: 'story', label: 'Story', g: 'Story', html: frames },
        { k: 'cap', label: 'Caption', g: 'Story', html: '<p>' + esc(d.caption) + '</p>' },
      ];
    return [
      { k: 'story', label: 'Frames', g: 'Story', html: frames },
      { k: 'cap', label: 'Caption', g: 'Story', html: '<p>' + esc(d.caption) + '</p>' },
    ];
  }

  function rvParts(list) {
    return list
      .map(function (p) {
        return (
          '<section class="sc-rv__part" data-part="' +
          p.k +
          '"><h4 class="sc-rv__k">' +
          p.label +
          '</h4>' +
          p.html +
          '</section>'
        );
      })
      .join('');
  }

  /* The version in a window under a ceiling: one scrolling area, soft
     fades on the edges that have more, and a small "More" cue at its foot
     until the end. Lower once the version has been chosen, so the card
     makes room for where the change stands. */
  function apReview() {
    var parts = partsOf(draft());
    return (
      '<div class="sc-rv' +
      (ap.state === 'review' ? '' : ' is-chosen') +
      (ap.expanded ? ' is-open' : '') +
      '"><div class="sc-rv__scroll" data-rv-scroll>' +
      rvParts(parts) +
      '</div>' +
      cueHtml() +
      '</div>'
    );
  }

  /* Show all / Show less. Folded, the version scrolls in its window under
     the ceiling; "Show all" lets the whole card grow to the version's full
     length (the window's height eases open, the fades and the ceiling go),
     and "Show less" at its foot folds it back and brings the card into
     view. The choice holds while the card is redrawn. */
  function cueHtml() {
    var open = ap.expanded;
    return (
      '<button type="button" class="sc-rv__cue" data-rv-more aria-expanded="' +
      open +
      '">' +
      (open ? 'Show less' : 'Show all') +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
      (open ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6') +
      '"/></svg></button>'
    );
  }

  function setExpanded(open) {
    var el = apCard && apCard.querySelector('[data-rv-scroll]');
    if (!el) return;
    var rv = el.parentNode;
    var from = el.offsetHeight;
    ap.expanded = open;
    rv.classList.toggle('is-open', open);
    if (!open) el.scrollTop = 0;
    var cue = rv.querySelector('[data-rv-more]');
    if (cue) cue.outerHTML = cueHtml();
    fitReview();
    var to = open ? el.scrollHeight : el.offsetHeight;
    if (motion && Math.abs(to - from) > 2) {
      /* the ceiling would clamp the fold back at once: lift it while easing */
      el.style.maxHeight = 'none';
      el.style.overflow = 'hidden';
      window.gsap.fromTo(
        el,
        { height: from },
        {
          height: to,
          duration: 0.42,
          ease: 'power2.out',
          clearProps: 'height',
          onComplete: function () {
            el.style.maxHeight = '';
            el.style.overflow = '';
            fitReview();
          },
        }
      );
    }
    /* folding back: if the card's top has gone above the thread, bring it in */
    if (!open && body) {
      var cardTop = apCard.getBoundingClientRect().top - body.getBoundingClientRect().top;
      if (cardTop < 0)
        body.scrollTo({ top: body.scrollTop + cardTop - 12, behavior: motion ? 'smooth' : 'auto' });
    }
  }

  /* After a render and on every scroll: which edges have more (the fades
     and A's cue), and which part is in view (C's index). */
  function fitReview() {
    var el = apCard && apCard.querySelector('[data-rv-scroll]');
    if (!el) return;
    var rv = el.parentNode;
    var more = !rv.classList.contains('is-open') && el.scrollHeight - el.clientHeight > 2;
    rv.classList.toggle('is-long', more);
    rv.classList.toggle('at-top', el.scrollTop < 2);
    rv.classList.toggle('at-end', el.scrollHeight - el.clientHeight - el.scrollTop < 2);
    ap.rvScroll = el.scrollTop;

  }

  /* Vicino's words over the card follow it: what it is doing, then what the
     version is. */
  function apWords() {
    if (ap.state === 'drafting')
      return ap.drafts.length > 1 && ap.drafts[ap.cur] === 2
        ? 'Revising the ' + what() + ' with your note…'
        : 'Writing a new ' + what() + ' for this carousel…';
    if (ap.state === 'unwritten') return 'I stopped before the new ' + what() + ' was ready.';
    return draft().blurb;
  }

  /* The Editing card's line: which part of the post the outcome touched. */
  var tgNote = null;
  if (redrawn) {
    tgNote = document.createElement('button');
    tgNote.type = 'button';
    tgNote.className = 'sc-tg__note';
    var tgText = redrawn.querySelector('.sc-tg__text');
    if (tgText) tgText.appendChild(tgNote);
    tgNote.addEventListener('click', function (e) {
      e.stopPropagation();
      /* the line names a part of the post, so it opens the post there */
      if (POSTD) {
        openPost({
          reveal: true,
          wash: ap.state === 'applied',
          focus: ap.state === 'review',
        });
        return;
      }
      if (!apCard) return;
      if (state.view !== 'chat') backToChat();
      apCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  var tgFade = null;
  /* The thread follows the latest: when the card changes — a version
     starting, arriving whole, an outcome — and the reader was at (or near)
     the bottom, it scrolls on to show the newest. A reader who has scrolled
     up to read earlier turns is left where they are. */
  var lastState = null;
  function followLatest(wasNear, changed) {
    if (!body || !wasNear || !changed) return;
    var go = function () {
      body.scrollTo({ top: body.scrollHeight, behavior: motion ? 'smooth' : 'auto' });
    };
    go();
    /* the version fades in over half a second; settle once more after it */
    setTimeout(go, 520);
  }

  function renderApply() {
    if (!apCard) return;
    var wasNear = body && state.open && body.scrollHeight - body.clientHeight - body.scrollTop < 160;
    var changed = ap.state !== lastState;
    lastState = ap.state;
    if (changed) ap.rvScroll = 0;
    apCard.className = 'sc-ap is-' + ap.state;
    apCard.innerHTML = apHtml();
    if (apSay) apSay.textContent = apWords();
    /* the log is kept, not redrawn, so its rows don't replay */
    var rvEl = apCard.querySelector('[data-rv-scroll]');
    if (rvEl) {
      rvEl.scrollTop = ap.rvScroll || 0;
      fitReview();
    }
    var slot = apCard.querySelector('[data-log]');
    if (slot) {
      slot.replaceWith(logEl);
      /* moving it back in resets its scroll: keep the step being taken in view */
      logEl.scrollTop = logEl.scrollHeight;
    }
    /* a version just written comes in all together, once */
    if (ap.fresh) {
      ap.fresh = false;
      var whole = apCard.querySelector('.sc-ap__field');
      var list = apCard.querySelector('.sc-rv');
      if (motion && list)
        window.gsap.from([whole, list], {
          autoAlpha: 0,
          y: 6,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        });
    }
    setSendStop(busy() && run.started);
    if (input)
      input.setAttribute(
        'placeholder',
        ap.state === 'review' ? 'Tell Vicino what to change…' : placeholder
      );
    if (paneHost) {
      notePanes();
      layoutPanes();
    }
    if (POSTD) POSTD.setOutcome(ap.state);
    followLatest(wasNear, changed);
    if (redrawn) {
      clearTimeout(tgFade);
      redrawn.classList.toggle('is-failed', ap.state === 'failed');
      redrawn.classList.toggle('is-applied', ap.state === 'applied');
      redrawn.classList.toggle('is-applying', busy() || ap.state === 'review');
      if (ap.state === 'drafting') {
        tgNote.innerHTML =
          '<span class="sc-ring" aria-hidden="true"></span><span><b>' + what(true) + '</b> being rewritten…</span>';
        tgNote.title = 'Vicino is writing a new version in the chat.';
        tgNote.hidden = false;
      } else if (ap.state === 'review') {
        tgNote.innerHTML = '<span><b>' + what(true) + '</b> · to review</span>';
        tgNote.title = 'Compare the new version with the post.';
        tgNote.hidden = false;
      } else if (ap.state === 'applying') {
        tgNote.innerHTML =
          '<span class="sc-ring" aria-hidden="true"></span><span><b>' + what(true) + '</b> updating…</span>';
        tgNote.title = 'Vicino is updating the story structure.';
        tgNote.hidden = false;
      } else if (ap.state === 'failed') {
        tgNote.innerHTML = AP_ICON.alert + '<span><b>' + what(true) + '</b> not updated</span>';
        tgNote.title = 'Update failed. The original version is shown.';
        tgNote.hidden = false;
      } else if (ap.state === 'applied') {
        tgNote.innerHTML = AP_ICON.check + '<span><b>' + what(true) + '</b> updated</span>';
        tgNote.title = 'The new story structure is on the post.';
        tgNote.hidden = false;
        /* success is news for a moment, then the card is just the post again */
        tgFade = setTimeout(function () {
          tgNote.hidden = true;
          redrawn.classList.remove('is-applied');
        }, 4000);
      } else {
        tgNote.hidden = true;
      }
    }
  }

  /* The switcher and F come through here. 'drafting' and 'applying' start
     a run (held on its last step); the others set the card where it stands,
     with a version written if none is yet. */
  function setApply(s, hold) {
    if (s === 'drafting') {
      startDraft(false, hold);
      return;
    }
    if (s === 'applying') {
      if (!ap.drafts.length) ap.drafts = [0];
      startRun(hold ? 'first' : 'retry', hold);
      return;
    }
    stopTimer();
    run.started = true;
    if (!ap.drafts.length) {
      ap.drafts = [0];
      ap.cur = 0;
    }
    if (POSTD) POSTD.setProposal(draft());
    ap.state = s;
    if (s === 'failed') ap.why = false;
    renderApply();
    renderSwitcher();
  }

  var APS = [
    {
      id: 'drafting',
      label: 'Writing',
      desc: 'Asked for a change, Vicino writes the new version straight away. Nothing of it shows until it is whole: the card holds a quiet placeholder and one line says the step, the same for any change. The send button is Stop. Nothing on the post changes.',
    },
    {
      id: 'review',
      label: 'Review',
      desc: 'The new version, every frame and the caption, to be read: Apply to post, Try another, Compare with the post (the drawer shows Current · Proposed), or type a note for a revision. Versions are kept: ‹ Version 2 of 2 ›.',
    },
    {
      id: 'applying',
      label: 'Updating',
      desc: 'Apply pressed (or Retry): the chip says Updating, the line shows each step, Stop is the send button, and the post and the Editing card say Story structure is updating.',
    },
    {
      id: 'failed',
      label: 'Failed',
      desc: 'The chosen version stays on the card, the post is unchanged, and Retry runs the same change. The Editing card marks Story structure as not updated.',
    },
    {
      id: 'stopped',
      label: 'Stopped',
      desc: 'Stop pressed while applying: nothing changed on the post, and Retry runs it again.',
    },
    {
      id: 'applied',
      label: 'Applied',
      desc: 'The chip turns to Applied, the card shrinks to what changed, and View changes opens the post on it.',
    },
  ];

  /* What a change covers, for the menu: the same flow either way. */
  var SCOPES = [
    { id: 'story', label: 'One section' },
    { id: 'brief', label: 'The whole brief' },
  ];

  function setScope(sc) {
    scope = sc;
    var ask = body && body.querySelector('.sc-ap-ask');
    if (ask)
      ask.textContent =
        sc === 'brief'
          ? 'This brief isn’t working. Could you regenerate the whole thing?'
          : 'I’m not satisfied with the story structure, could you generate a new one?';
    if (POSTD) POSTD.setScope(sc);
    runFromApproval();
  }

  /* R: the whole thing again, from the ask: a fresh first draft. */
  function runFromApproval() {
    if (!state.open) openChat();
    if (state.view !== 'chat') backToChat();
    ap.drafts = [];
    ap.applies = 0;
    startDraft();
    if (apCard) apCard.scrollIntoView({ block: 'center' });
  }

  /* From the switcher or F: open the chat on the card and set where it stands. */
  function showApproval(s) {
    if (!state.open) openChat();
    if (state.view !== 'chat') backToChat();
    setApply(s, true);
    if (apCard) apCard.scrollIntoView({ block: 'center' });
  }

  /* A note typed while a version waits: it goes into the thread, and the
     card — moved under it — writes the revision. */
  function reviseWith(text) {
    if (!apTurn || !body) return;
    var before = typeof sfWrap !== 'undefined' && sfWrap ? sfWrap : null;
    var note = document.createElement('div');
    note.innerHTML =
      '<article class="chat-dock__message is-user sc-ap-turn"><span class="chat-dock__avatar" aria-hidden="true">You</span>' +
      '<div class="chat-dock__message-body"><div class="chat-dock__sender">You</div>' +
      '<div class="chat-dock__message-text"><p>' +
      esc(text) +
      '</p></div></div></article>';
    body.insertBefore(note.firstChild, before);
    body.insertBefore(apTurn, before);
    startDraft(true);
    body.scrollTop = body.scrollHeight;
  }

  if (body) {
    body.insertAdjacentHTML(
      'beforeend',
      '<article class="chat-dock__message is-user sc-ap-turn"><span class="chat-dock__avatar" aria-hidden="true">You</span>' +
        '<div class="chat-dock__message-body"><div class="chat-dock__sender">You</div>' +
        '<div class="chat-dock__message-text"><p class="sc-ap-ask">' +
        (scope === 'brief'
          ? 'This brief isn’t working. Could you regenerate the whole thing?'
          : 'I’m not satisfied with the story structure, could you generate a new one?') +
        '</p></div></div></article>' +
        '<article class="chat-dock__message sc-ap-turn sc-ap-reply"><span class="chat-dock__avatar is-orb" aria-hidden="true"><span class="vorb" aria-hidden="true" style="width: 22px; height: 22px;"><span class="vorb__halo"></span><span class="vorb__core"></span></span></span>' +
        '<div class="chat-dock__message-body"><div class="chat-dock__sender">Vicino</div>' +
        '<div class="chat-dock__message-text"><div class="chat-dock__assistant-answer"><div class="chat-dock__markdown"><p class="sc-ap-say"></p></div></div></div>' +
        '<section class="sc-ap" aria-label="The new story structure"></section>' +
        '<div class="chat-dock__message-actions"><span class="sc-when">just now</span></div>' +
        '</div></article>'
    );
    apCard = body.querySelector('.sc-ap');
    /* the version's window reports its scroll (the fades, the cue) */
    apCard.addEventListener(
      'scroll',
      function (e) {
        if (e.target.matches && e.target.matches('[data-rv-scroll]')) fitReview();
      },
      true
    );
    apSay = body.querySelector('.sc-ap-say');
    apTurn = body.querySelector('.sc-ap-reply');
    apCard.addEventListener('click', function (e) {
      var ver = e.target.closest('[data-ap-ver]');
      var rvScroller = apCard.querySelector('[data-rv-scroll]');
      if (e.target.closest('[data-rv-more]') && rvScroller) {
        setExpanded(!ap.expanded);
        return;
      }
      if (e.target.closest('[data-ap-retry]')) {
        setApply('applying');
      } else if (e.target.closest('[data-ap-apply]')) {
        applyDraft();
      } else if (e.target.closest('[data-ap-another]')) {
        startDraft();
      } else if (e.target.closest('[data-ap-redraft]')) {
        startDraft();
      } else if (e.target.closest('[data-ap-compare]')) {
        openPost({ reveal: true, focus: true });
      } else if (ver) {
        ap.cur = Math.max(0, Math.min(ap.drafts.length - 1, ap.cur + Number(ver.dataset.apVer)));
        ap.rvScroll = 0;
        if (POSTD) POSTD.setProposal(draft());
        renderApply();
      } else if (e.target.closest('[data-ap-why]')) {
        ap.why = !ap.why;
        renderApply();
      } else if (e.target.closest('[data-ap-view]')) {
        openPost({ reveal: true, wash: true });
      }
    });
    renderApply();
  }

  /* ── When a message can't be sent ───────────────────────────────────────
     The ClickUp issue "Chat Error State UI 'Try Again' UI Refinement": the
     error sat as red text under a red-ringed field with its own Try again
     link — apart from the message, easy to miss, and crowded.

     Drawn the way Claude shows a message that failed: the message goes into
     the thread as your turn, as it was typed, greyed until it goes, and
     under it, where the reply would have been, one quiet notice — what
     happened, and Retry. The field is left clean.
     Here every first send fails so the state can be seen; Retry sends it. */
  var sf = { state: 'idle', text: '' };
  var sfTimer = null;
  var sfWrap = document.createElement('div');
  sfWrap.className = 'sc-sf-wrap';
  if (body) body.appendChild(sfWrap);

  /* `unsent`: the message is in the thread but has not gone, so it is greyed */
  function youTurn(text, unsent) {
    return (
      '<article class="chat-dock__message is-user sc-sf-turn' +
      (unsent ? ' is-unsent' : '') +
      '"><span class="chat-dock__avatar" aria-hidden="true">You</span>' +
      '<div class="chat-dock__message-body"><div class="chat-dock__sender">You</div>' +
      '<div class="chat-dock__message-text"><p>' +
      esc(text) +
      '</p></div></div></article>'
    );
  }

  function renderSend() {
    var html = '';
    if (sf.state === 'failed' || sf.state === 'sending') {
      html =
        youTurn(sf.text, true) +
        '<div class="sc-sf' +
        (sf.state === 'sending' ? ' is-sending' : '') +
        '" role="status">' +
        (sf.state === 'failed'
          ? '<span class="sc-sf__icon">' +
            AP_ICON.alert +
            '</span><span class="sc-sf__text"><b>Message not sent.</b> Something went wrong on our side.</span>' +
            '<button type="button" class="sc-sf__retry" data-sf-retry>' +
            AP_ICON.retry +
            'Retry</button>'
          : '<span class="sc-ap__spin" aria-hidden="true"></span><span class="sc-sf__text">Sending…</span>') +
        '</div>';
    }
    sfWrap.innerHTML = html;
    if (html && body) body.scrollTop = body.scrollHeight;
  }

  function failSend(text) {
    clearTimeout(sfTimer);
    sf.text = text;
    sf.state = 'failed';
    if (input && input.value.trim() === text) input.value = '';
    renderSend();
  }

  function retrySend() {
    if (sf.state !== 'failed') return;
    sf.state = 'sending';
    renderSend();
    sfTimer = setTimeout(function () {
      sf.state = 'idle';
      sfWrap.insertAdjacentHTML('beforebegin', youTurn(sf.text));
      renderSend();
      if (body) body.scrollTop = body.scrollHeight;
    }, 1100);
  }

  function sendNow() {
    /* while Vicino works, Enter waits: the words stay typed */
    if (sf.state === 'sending' || busy()) return;
    var text = input ? input.value.trim() : '';
    if (!text) return;
    /* a version is waiting: what is typed is a note for the next one */
    if (ap.state === 'review') {
      input.value = '';
      reviseWith(text);
      return;
    }
    failSend(text);
  }

  /* From the switcher or G: a message that didn't go. */
  function showSendFail() {
    if (!state.open) openChat();
    if (state.view !== 'chat') backToChat();
    failSend('Make the caption shorter and try again');
  }

  /* the send button is Stop while a run is going */
  if (sendBtn)
    sendBtn.addEventListener('click', function () {
      if (busy()) stopRun();
      else sendNow();
    });
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendNow();
      }
    });
  }
  var form = composer && composer.closest('form');
  if (form)
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendNow();
    });
  if (body)
    body.addEventListener('click', function (e) {
      if (e.target.closest('[data-sf-retry]')) retrySend();
    });

  /* ── Chat and post when there isn't room for both ───────────────────────
     ClickUp "[AI Post Editing] Responsive Layout Issue on Smaller Screens":
     as the window narrowed, the chat and the post drawer ran into each
     other. Here they never overlap:
       wide (1242px and up)  — side by side, the chat at 510px;
       1152–1241px           — still side by side, the chat narrowed to
                               420px so the post keeps at least 640px;
       below 1152px          — one at a time. Both take the room beside the
                               rail, and a Chat · Post switch in each one's
                               head flips between them. The switch carries
                               the other side's news: a ring while the post
                               is updating, a dot when it changed or failed.
     The widths are CSS (`--sc-chat-w`, `body.sc-one`); this decides which
     one is showing. Opening the post — the Editing card, its note, View
     changes — shows the post. */
  var oneMQ = window.matchMedia('(max-width: 1151px)');
  var pane = 'chat';
  var unseen = { chat: false, post: false };
  var paneHost = document.createElement('span');
  paneHost.className = 'sc-pane-host';
  if (header) {
    var firstBtn = header.querySelector('.chat-dock__compact-wrap, .chat-dock__header-button');
    header.insertBefore(paneHost, firstBtn);
  }

  function oneAtATime() {
    return oneMQ.matches && state.open && !!POSTD && POSTD.isOpen();
  }

  function paneMark(which) {
    if (which === 'post') {
      if (ap.state === 'applying') return '<span class="sc-ring" aria-hidden="true"></span>';
      if (unseen.post)
        return (
          '<i class="sc-pane__dot' + (ap.state === 'applied' ? '' : ' is-failed') + '" aria-hidden="true"></i>'
        );
      return '';
    }
    if (ap.state === 'drafting') return '<span class="sc-ring" aria-hidden="true"></span>';
    return unseen.chat
      ? '<i class="sc-pane__dot' + (ap.state === 'failed' ? ' is-failed' : '') + '" aria-hidden="true"></i>'
      : '';
  }

  function switchHtml() {
    return (
      '<span class="sc-pane" role="tablist" aria-label="Show the chat or the post">' +
      ['chat', 'post']
        .map(function (k) {
          return (
            '<button type="button" role="tab" class="sc-pane__seg' +
            (pane === k ? ' is-on' : '') +
            '" aria-selected="' +
            (pane === k) +
            '" data-pane="' +
            k +
            '">' +
            (k === 'chat' ? 'Chat' : 'Post') +
            paneMark(k) +
            '</button>'
          );
        })
        .join('') +
      '</span>'
    );
  }

  function layoutPanes() {
    var one = oneAtATime();
    document.body.classList.toggle('sc-one', one);
    document.body.dataset.pane = pane;
    if (one) unseen[pane] = false;
    var h = one ? switchHtml() : '';
    paneHost.innerHTML = h;
    if (POSTD && POSTD.setHeadExtra) POSTD.setHeadExtra(h);
  }

  function showPane(p) {
    var news = p === 'post' && unseen.post;
    pane = p;
    layoutPanes();
    /* coming over to news on the post: take the reader to it */
    if (news && POSTD) POSTD.open({ reveal: true, wash: ap.state === 'applied' });
  }

  /* everything that opens the post comes through here */
  function openPost(opts) {
    if (!POSTD) return;
    POSTD.open(opts);
    if (oneMQ.matches) showPane('post');
  }

  /* the outcome changed on the side not showing: mark the switch */
  function notePanes() {
    if (!oneAtATime()) return;
    if (pane === 'chat' && (ap.state === 'applied' || ap.state === 'failed')) unseen.post = true;
    /* a failure to retry, or a version to choose, waits in the chat */
    if (pane === 'post' && (ap.state === 'failed' || ap.state === 'review')) unseen.chat = true;
  }

  document.addEventListener('click', function (e) {
    var seg = e.target.closest('[data-pane]');
    if (seg) showPane(seg.dataset.pane);
  });
  if (POSTD)
    POSTD.onChange(function (open) {
      /* the post opened last is the one shown if the window narrows */
      pane = open ? 'post' : 'chat';
      layoutPanes();
    });
  /* the window's width decides; listen to both, since some browsers (and
     device emulation) don't report a media query's change */
  if (oneMQ.addEventListener) oneMQ.addEventListener('change', layoutPanes);
  var wasOne = null;
  window.addEventListener('resize', function () {
    var now = oneMQ.matches;
    if (now !== wasOne) {
      wasOne = now;
      layoutPanes();
    }
  });

  function setSubtitle(text) {
    if (subtitle) subtitle.textContent = text;
  }

  function openChat() {
    if (!dock || !panel) return;
    if (state.open) return;
    state.open = true;
    dock.classList.add('is-open');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (launcherRow) launcherRow.style.display = 'none';
    /* the product opens the panel beside the content and folds the sidebar */
    if (side) sideWasCollapsed = side.classList.contains('is-collapsed');
    shell.classList.add('is-tour-split');
    if (side) side.classList.add('is-collapsed');
    setSubtitle(state.active === 'main' ? 'Main chat' : titleOf(state.active));
    draw[state.variant]();
    renderSwitcher();
    /* a thread opens on its latest turn */
    if (body) body.scrollTop = body.scrollHeight;
    startFirstRun();
    layoutPanes();
  }

  /* Closing the window also lets go of the sidebar's selection: no chat is
     open, so none is marked. The chat itself is remembered for next time. */
  function closeChat() {
    if (!dock || !panel) return;
    state.open = false;
    dock.classList.remove('is-open');
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (launcherRow) launcherRow.style.display = '';
    shell.classList.remove('is-tour-split');
    if (side && !sideWasCollapsed) side.classList.remove('is-collapsed');
    if (state.view !== 'chat') backToChat();
    draw[state.variant]();
    renderSwitcher();
    pane = 'chat';
    layoutPanes();
  }

  /* The three things the panel can show under its header. */
  function show(view) {
    state.view = view;
    panel.classList.toggle('is-sessions', view === 'sessions');
    panel.classList.toggle('is-empty', view === 'empty');
    var chat = view === 'chat';
    if (body) body.style.display = chat ? '' : 'none';
    if (compose) compose.style.display = view === 'sessions' ? 'none' : '';
    if (compactWrap) compactWrap.style.display = chat ? '' : 'none';
    if (showChats) showChats.style.display = view === 'sessions' ? 'none' : '';
    if (fullBtn) fullBtn.style.display = view === 'sessions' ? 'none' : '';
    backBtn.style.display = view === 'sessions' ? '' : 'none';
    sessions.style.display = view === 'sessions' ? '' : 'none';
    empty.style.display = view === 'empty' ? '' : 'none';
    placeEditing();
  }

  function showSessions() {
    show('sessions');
    setSubtitle(state.tab === 'chats' ? 'Chats' : 'Documents');
    renderSessions();
  }

  function showEmpty() {
    show('empty');
    setSubtitle('New chat');
    if (input) {
      input.value = '';
      input.placeholder = 'Message Vicino…';
    }
  }

  function backToChat() {
    show('chat');
    setSubtitle(state.active === 'main' ? 'Main chat' : titleOf(state.active));
  }

  function toggleFullscreen() {
    state.fullscreen = !state.fullscreen;
    panel.classList.toggle('is-fullscreen', state.fullscreen);
    if (fullBtn) {
      fullBtn.setAttribute('aria-pressed', String(state.fullscreen));
      fullBtn.setAttribute(
        'aria-label',
        state.fullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'
      );
      fullBtn.dataset.tip = state.fullscreen ? 'Exit fullscreen' : 'Fullscreen';
      fullBtn.innerHTML = state.fullscreen ? ICON.shrink : ICON.grow;
    }
  }

  /* ── The history ────────────────────────────────────────────────────── */

  function productSession(c) {
    var on = state.active === c.id;
    return (
      '<button class="chat-dock__session-item' +
      (on ? ' is-active' : '') +
      '" type="button" title="' +
      esc(c.title) +
      '" data-session="' +
      c.id +
      '"><span class="chat-dock__session-dot" aria-hidden="true"></span>' +
      '<span class="chat-dock__session-copy"><span class="chat-dock__session-title">' +
      esc(c.title) +
      (c.chip ? '<span class="chat-dock__session-chip">' + c.chip + '</span>' : '') +
      '</span><span class="chat-dock__session-date">' +
      esc(c.date) +
      '</span></span></button>'
    );
  }

  function tabs() {
    var chats = state.tab === 'chats';
    return (
      '<div class="page-nav-list chat-dock__history-tabs" role="group" aria-label="History">' +
      '<span class="segmented-thumb" aria-hidden="true"></span>' +
      '<button type="button" class="page-nav-item' +
      (chats ? ' active' : '') +
      '" aria-pressed="' +
      chats +
      '" data-tab="chats">Chats</button>' +
      '<button type="button" class="page-nav-item' +
      (chats ? '' : ' active') +
      '" aria-pressed="' +
      !chats +
      '" data-tab="documents">Documents</button></div>'
    );
  }

  function documents() {
    return (
      '<div class="chat-dock__documents">' +
      '<label class="chat-dock__documents-search">' +
      ICON.search +
      '<input type="search" placeholder="Search documents" aria-label="Search documents by title" value=""></label>' +
      '<div class="chat-dock__session-head"><span>Documents</span><span>1</span></div>' +
      '<ul class="chat-dock__documents-list" aria-label="Documents"><li class="chat-dock__documents-row">' +
      '<span class="chat-dock__document-card-icon" aria-hidden="true">' +
      ICON.doc +
      '</span>' +
      '<span class="chat-dock__documents-copy"><strong class="chat-dock__documents-title">Research and creative evidence brief — Pop-up sale to online stock decision</strong>' +
      '<span class="chat-dock__documents-meta">Research · edited Oct 22 · v1 · 3 sources · 1 chat</span>' +
      '<span class="brain-label is-none">Not in Brain</span></span>' +
      '<span class="chat-dock__documents-actions"><button type="button" class="chat-dock__document-button is-primary">Continue</button>' +
      '<button type="button" class="chat-dock__documents-delete" aria-label="Delete document" title="Delete document">' +
      ICON.trash +
      '</button></span>' +
      '</li></ul></div>'
    );
  }

  /* ── The history, three ways ───────────────────────────────────────────
     All three open on the main chat as a card, with plain text tabs, a
     search icon and a round New chat above it. They differ in how the side
     chats sit under it — Fold (a short list, the rest folded), Dated
     (grouped by day), Main first (one plain list) — and in how Documents
     is laid out. A row is the title alone; the time and the menu wait for
     hover. Nothing is indented: every left edge is the card's. */

  var ADD =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
  var CLOSE_X =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  /* What a document is, drawn: a colour and a glyph per kind. */
  function svg(paths) {
    return (
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      '</svg>'
    );
  }
  var DOCTYPE = {
    brief: {
      label: 'Brief',
      glyph: svg('<path d="M17 6H3"/><path d="M21 12H3"/><path d="M15 18H3"/>'),
    },
    deck: {
      label: 'Slides',
      glyph: svg(
        '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>'
      ),
    },
    sheet: {
      label: 'Sheet',
      glyph: svg(
        '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>'
      ),
    },
    notes: {
      label: 'Notes',
      glyph: svg(
        '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>'
      ),
    },
    pdf: { label: 'PDF', glyph: '<b class="sc-doc__word">PDF</b>' },
    image: { label: 'Image', glyph: '' },
  };

  /* The capture's one document and the files around it, so the tab reads
     as a shelf of different things. */
  var DOCS = [
    {
      id: 'd1',
      type: 'brief',
      short: 'Pop-up sale research brief',
      title: 'Research and creative evidence brief — Pop-up sale to online stock decision',
      meta: 'Research brief · 3 sources',
      time: '3h',
      chat: 's2',
    },
    {
      id: 'd2',
      type: 'deck',
      short: 'Carousel creative plan',
      title: 'Creative plan — a four-slide X carousel for the pop-up sale',
      meta: 'Slides · 4 slides · In Brain',
      time: '1d',
      chat: 's4',
    },
    {
      id: 'd3',
      type: 'sheet',
      short: 'Pop-up stock by day',
      title: 'Stock levels for each pop-up day, synced to the online store',
      meta: 'Sheet · 12 rows',
      time: '2d',
      chat: 's6',
    },
    {
      id: 'd4',
      type: 'notes',
      short: 'Brand risk response notes',
      title: 'Response notes — how to answer the critical brand risk',
      meta: 'Notes',
      time: '3d',
      chat: 's5',
    },
    {
      id: 'd5',
      type: 'pdf',
      short: 'Launch brief.pdf',
      title: 'Launch brief.pdf',
      meta: 'PDF · 2 pages',
      time: '4d',
      chat: 's1',
    },
    {
      id: 'd6',
      type: 'image',
      short: 'Zest storefront.png',
      title: 'Zest storefront.png',
      meta: 'Image · PNG',
      time: 'Oct 14',
      chat: 's9',
      img: 'assets/122e8c41eba24eca979b38b3a584a683-An-online-store-interface-for-a-juice-brand-nam.png',
    },
  ];

  var GROUPS = ['Today', 'Yesterday', 'This week', 'Earlier'];

  function groupOf(t) {
    if (/h$/.test(t)) return 'Today';
    if (t === '1d') return 'Yesterday';
    if (/^[2-6]d$/.test(t)) return 'This week';
    return 'Earlier';
  }

  function matches(text) {
    var q = state.query.trim().toLowerCase();
    return !q || text.toLowerCase().indexOf(q) >= 0;
  }

  function hEnd(mark, time, more) {
    return (
      '<span class="sc-h-end">' +
      (mark ? '<span class="sc-h-mark">' + mark + '</span>' : '') +
      (time ? '<span class="sc-h-time">' + esc(time) + '</span>' : '') +
      more +
      '</span>'
    );
  }

  function moreBtn(id) {
    return (
      '<button type="button" class="sc-h-more" aria-label="More" data-more="' +
      id +
      '">' +
      ICON.more +
      '</button>'
    );
  }

  /* A side chat: its title, one line, in every design. */
  function hRow(c) {
    var dated = state.hist === 'b';
    /* No spinner or dot on the row: the history stays text. */
    var mark = '';
    return (
      '<div class="sc-h-row' +
      (state.active === c.id ? ' is-open' : '') +
      (c.unread ? ' is-unread' : '') +
      '" data-session="' +
      c.id +
      '" role="button" tabindex="0" title="' +
      esc(c.title) +
      '">' +
      '<span class="sc-h-glyph" aria-hidden="true">' +
      ICON.bubble +
      '</span>' +
      '<span class="sc-h-copy"><span class="sc-h-title">' +
      esc(c.short) +
      (state.pinned[c.id]
        ? '<span class="sc-h-pin" aria-label="Pinned">' + ICON.pin + '</span>'
        : '') +
      '</span>' +
      '</span>' +
      hEnd(mark, dated ? '' : c.time, moreBtn(c.id)) +
      '</div>'
    );
  }

  /* The main chat, a card of its own above everything else. */
  function mainCard() {
    return (
      '<div class="sc-h-main' +
      (state.active === 'main' ? ' is-open' : '') +
      '" data-session="main" role="button" tabindex="0" title="Main chat">' +
      '<span class="sc-h-main__orb" aria-hidden="true">' +
      orb() +
      '</span>' +
      '<span class="sc-h-copy"><span class="sc-h-title">Main chat</span>' +
      '<span class="sc-h-ctx">' +
      esc(MAIN.ctx.kind) +
      ' · ' +
      esc(MAIN.ctx.name) +
      '</span></span>' +
      hEnd('', MAIN.time, moreBtn('main')) +
      '</div>'
    );
  }

  function dayHead(label) {
    return '<span>' + label + '</span>';
  }

  function hGroup(label, inner, cls) {
    return (
      '<div class="sc-h-group' +
      (cls ? ' ' + cls : '') +
      '"><div class="sc-h-eyebrow">' +
      label +
      '</div>' +
      inner +
      '</div>'
    );
  }

  function chatsList() {
    var v = state.hist;
    var side = live().filter(function (c) {
      return matches(c.short + ' ' + c.title + ' ' + c.ctx.kind + ' ' + c.ctx.name);
    });
    var pins = side.filter(function (c) {
      return state.pinned[c.id];
    });
    var rest = side.filter(function (c) {
      return !state.pinned[c.id];
    });
    var withMain = matches('Main chat ' + MAIN.ctx.kind + ' ' + MAIN.ctx.name);
    var out = withMain ? mainCard() : '';
    if (v === 'a') {
      var all = pins.concat(rest);
      var open = state.foldOpen || !!state.query.trim();
      var shown = open ? all : all.slice(0, 5);
      if (all.length)
        out +=
          '<div class="sc-fold" aria-label="Side chats">' +
          shown.map(hRow).join('') +
          (all.length > 5 && !state.query.trim()
            ? '<button type="button" class="sc-fold__more" data-fold aria-expanded="' +
              open +
              '">' +
              (open ? 'Show less' : 'Show ' + (all.length - 5) + ' more') +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
              (open ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6') +
              '"/></svg></button>'
            : '') +
          '</div>';
    } else if (v === 'b') {
      if (pins.length) out += hGroup(dayHead('Pinned'), pins.map(hRow).join(''), 'is-day');
      GROUPS.forEach(function (g) {
        var rs = rest.filter(function (c) {
          return groupOf(c.time) === g;
        });
        if (rs.length) out += hGroup(dayHead(g), rs.map(hRow).join(''), 'is-day');
      });
    } else if (side.length) {
      out += hGroup('Side chats', pins.concat(rest).map(hRow).join(''));
    }
    return out || '<p class="sc-h-none">Nothing matches “' + esc(state.query) + '”.</p>';
  }

  /* A document's face: a small page tinted by its kind with its glyph, or
     the picture itself. */
  function docFace(d, big) {
    var t = DOCTYPE[d.type];
    if (d.img)
      return (
        '<span class="sc-doc is-image' +
        (big ? ' is-big' : '') +
        '" aria-hidden="true"><img src="' +
        d.img +
        '" alt=""></span>'
      );
    return (
      '<span class="sc-doc is-' +
      d.type +
      (big ? ' is-big' : '') +
      '" aria-hidden="true">' +
      (big ? '<i class="sc-doc__lines"></i>' : '') +
      '<span class="sc-doc__glyph">' +
      t.glyph +
      '</span></span>'
    );
  }

  function delBtn(d) {
    return (
      '<button type="button" class="sc-h-more" aria-label="Delete ' +
      esc(d.short) +
      '" data-doc-del="' +
      d.id +
      '">' +
      ICON.trash +
      '</button>'
    );
  }

  function docRow(d) {
    return (
      '<div class="sc-h-row is-doc" data-doc="' +
      d.id +
      '" role="button" tabindex="0" title="' +
      esc(d.title) +
      '">' +
      docFace(d) +
      '<span class="sc-h-copy"><span class="sc-h-title">' +
      esc(d.short) +
      '</span><span class="sc-h-ctx">' +
      esc(d.meta) +
      '</span></span>' +
      hEnd('', state.hist === 'b' ? '' : d.time, delBtn(d)) +
      '</div>'
    );
  }

  /* Fold lays documents out as cards with a preview, two to a row. */
  function docCard(d) {
    return (
      '<div class="sc-docc" data-doc="' +
      d.id +
      '" role="button" tabindex="0" title="' +
      esc(d.title) +
      '">' +
      '<span class="sc-docc__face is-' +
      d.type +
      '">' +
      docFace(d, true) +
      delBtn(d) +
      '</span>' +
      '<span class="sc-docc__title">' +
      esc(d.short) +
      '</span><span class="sc-docc__meta">' +
      esc(d.meta) +
      '</span></div>'
    );
  }

  function docsList() {
    var v = state.hist;
    var docs = DOCS.filter(function (d) {
      return !state.docsGone[d.id] && matches(d.short + ' ' + d.title + ' ' + d.meta);
    });
    var out = '';
    if (v === 'a') {
      out = docs.length ? '<div class="sc-docs-grid">' + docs.map(docCard).join('') + '</div>' : '';
    } else if (v === 'b') {
      GROUPS.forEach(function (g) {
        var ds = docs.filter(function (d) {
          return groupOf(d.time) === g;
        });
        if (ds.length) out += hGroup(g, ds.map(docRow).join(''));
      });
    } else {
      out = docs.length ? '<div class="sc-docs-list">' + docs.map(docRow).join('') + '</div>' : '';
    }
    if (out) return out;
    return state.query
      ? '<p class="sc-h-none">Nothing matches “' + esc(state.query) + '”.</p>'
      : '<p class="sc-h-none">Documents Vicino writes with you land here.</p>';
  }

  function hTab(id, label) {
    var on = state.tab === id;
    return (
      '<button type="button" role="tab" aria-selected="' +
      on +
      '" class="sc-h-tab' +
      (on ? ' is-on' : '') +
      '" data-tab="' +
      id +
      '">' +
      label +
      '</button>'
    );
  }

  function hFind(quiet) {
    return (
      '<label class="sc-h-find' +
      (quiet ? ' is-quiet' : '') +
      '">' +
      ICON.search +
      '<input type="search" placeholder="Search ' +
      (state.tab === 'chats' ? 'chats' : 'documents') +
      '" aria-label="Search" value="' +
      esc(state.query) +
      '">' +
      (quiet
        ? ''
        : '<button type="button" class="sc-h-icon is-small" data-find-close aria-label="Close search">' +
          CLOSE_X +
          '</button>') +
      '</label>'
    );
  }

  /* The bar: the text tabs, search as an icon that opens a pill in their
     place, New chat. */
  function hBar() {
    var tabsHtml =
      '<div class="sc-h-tabs" role="tablist" aria-label="History">' +
      hTab('chats', 'Chats') +
      hTab('documents', 'Documents') +
      '</div>';
    var newBtn =
      '<button type="button" class="sc-h-new" data-new aria-label="New chat" data-tip="New chat">' +
      ADD +
      '</button>';
    var findBtn =
      '<button type="button" class="sc-h-icon" data-find aria-label="Search" data-tip="Search">' +
      ICON.search +
      '</button>';
    return (
      '<div class="sc-h-bar">' +
      (state.finding ? hFind(false) : tabsHtml + findBtn) +
      newBtn +
      '</div>'
    );
  }

  function hList() {
    return state.tab === 'chats' ? chatsList() : docsList();
  }

  function renderSessions(focusFind) {
    var chats = state.tab === 'chats';
    if (state.window === 'now') {
      var all = [MAIN].concat(live());
      sessions.className = 'chat-dock__sessions';
      sessions.innerHTML =
        tabs() +
        (chats
          ? '<button class="chat-dock__new-session" type="button" data-new>' +
            ICON.plus +
            '<span>New chat</span></button>' +
            '<div class="chat-dock__session-head"><span>Recent chats</span><span>' +
            all.length +
            '</span></div>' +
            '<div class="chat-dock__session-list">' +
            all.map(productSession).join('') +
            '</div>'
          : documents());
      var on = sessions.querySelector('.page-nav-item.active');
      var thumb = sessions.querySelector('.segmented-thumb');
      if (on && thumb) {
        thumb.style.width = on.offsetWidth + 'px';
        thumb.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      }
      return;
    }
    sessions.className =
      'chat-dock__sessions sc-hist hv-' +
      state.hist +
      ' hd-' +
      state.dated +
      (state.noIcons ? ' no-icons' : '');
    sessions.innerHTML = hBar() + '<div class="sc-h-list">' + hList() + '</div>';
    if (focusFind) {
      var f = sessions.querySelector('.sc-h-find input');
      if (f) {
        f.focus();
        f.setSelectionRange(f.value.length, f.value.length);
      }
    }
  }

  function closeFind() {
    state.finding = false;
    state.query = '';
    renderSessions();
  }

  sessions.addEventListener('input', function (e) {
    if (e.target.matches('.sc-h-find input')) {
      state.query = e.target.value;
      var list = sessions.querySelector('.sc-h-list');
      if (list) list.innerHTML = hList();
    }
  });

  sessions.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (tab) {
      state.tab = tab.dataset.tab;
      state.query = '';
      state.finding = false;
      show('sessions');
      setSubtitle(state.tab === 'chats' ? 'Chats' : 'Documents');
      renderSessions();
      return;
    }
    if (e.target.closest('[data-fold]')) {
      state.foldOpen = !state.foldOpen;
      sessions.querySelector('.sc-h-list').innerHTML = hList();
      return;
    }
    if (e.target.closest('[data-find-close]')) {
      e.preventDefault();
      closeFind();
      return;
    }
    if (e.target.closest('[data-find]')) {
      state.finding = true;
      renderSessions(true);
      return;
    }
    if (e.target.closest('[data-new]')) {
      showEmpty();
      return;
    }
    var del = e.target.closest('[data-doc-del]');
    if (del) {
      state.docsGone[del.dataset.docDel] = true;
      sessions.querySelector('.sc-h-list').innerHTML = hList();
      return;
    }
    var more = e.target.closest('[data-more]');
    if (more) {
      openMenu(more, more.dataset.more);
      return;
    }
    var doc = e.target.closest('[data-doc]');
    if (doc) {
      var d = DOCS.filter(function (x) {
        return x.id === doc.dataset.doc;
      })[0];
      backToChat();
      if (d) pick(d.chat);
      return;
    }
    var item = e.target.closest('[data-session]');
    if (item) {
      backToChat();
      pick(item.dataset.session);
    }
  });

  sessions.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && e.target.closest('.sc-h-find')) {
      closeFind();
      return;
    }
    if (e.key === 'Enter' && e.target.matches('[data-session]')) {
      backToChat();
      pick(e.target.dataset.session);
    }
    if (e.key === 'Enter' && e.target.matches('[data-doc]')) e.target.click();
  });

  /* The row menu: Rename, Pin, Archive, Delete. */
  var menu = null;

  function openMenu(anchor, id) {
    closeMenu();
    var c = chatOf(id);
    menu = document.createElement('div');
    menu.className = 'sc-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML =
      '<button type="button" role="menuitem" data-act="rename">Rename</button>' +
      '<button type="button" role="menuitem" data-act="pin">' +
      (state.pinned[id] ? 'Unpin' : 'Pin') +
      '</button>' +
      '<button type="button" role="menuitem" data-act="archive">Archive</button>' +
      '<button type="button" role="menuitem" class="is-danger" data-act="delete">Delete</button>';
    var r = anchor.getBoundingClientRect();
    menu.style.top = r.bottom + 4 + 'px';
    menu.style.left = Math.max(8, r.right - 150) + 'px';
    document.body.appendChild(menu);
    anchor.setAttribute('aria-expanded', 'true');
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.dataset.act;
      if (act === 'pin') state.pinned[id] = !state.pinned[id];
      else if (act === 'archive' || act === 'delete') {
        if (id !== 'main') state.gone[id] = true;
        if (state.active === id) pick('main');
      } else if (act === 'rename' && c) {
        var next = prompt('Rename this chat', c.short);
        if (next) c.short = next;
      }
      closeMenu();
      renderSessions();
      draw[state.variant]();
    });
    setTimeout(function () {
      document.addEventListener('click', onDoc);
      document.addEventListener('keydown', onKey);
    }, 0);
    function onDoc(e) {
      if (menu && !menu.contains(e.target)) closeMenu();
    }
    function onKey(e) {
      if (e.key === 'Escape') closeMenu();
    }
    menu.cleanup = function () {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }

  function closeMenu() {
    if (!menu) return;
    menu.cleanup();
    menu.remove();
    menu = null;
    document.querySelectorAll('[data-more][aria-expanded]').forEach(function (b) {
      b.removeAttribute('aria-expanded');
    });
  }

  if (dock) {
    dock.addEventListener('click', function (e) {
      if (e.target.closest('.chat-dock__launcher-new')) {
        openChat();
        showEmpty();
      } else if (e.target.closest('.chat-dock__launcher')) {
        openChat();
      } else if (e.target.closest('[aria-label="Close Vicino"]')) {
        closeChat();
      } else if (e.target.closest('[aria-label="Show chats"]')) {
        showSessions();
      } else if (e.target.closest('[aria-label="Back to current chat"]')) {
        backToChat();
      } else if (e.target.closest('.chat-dock__fullscreen-toggle')) {
        toggleFullscreen();
      }
    });
  }

  var collapse = document.querySelector('.sidebar-logo-collapse');
  if (side && collapse) {
    collapse.addEventListener('click', function () {
      var on = !side.classList.contains('is-collapsed');
      side.classList.toggle('is-collapsed', on);
      sideWasCollapsed = on;
      collapse.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
      collapse.title = on ? 'Expand sidebar' : 'Collapse sidebar';
      collapse.style.transform = on ? 'scaleX(-1)' : '';
    });
  }

  /* The window drawing is a class on the dock; Now is none. */
  function renderWindow() {
    if (!dock) return;
    dock.className = dock.className
      .replace(/\bcw(?:-[a-f])?(?![\w-])/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (state.window !== 'now') dock.classList.add('cw', 'cw-' + state.window);
    dock.classList.toggle('tg-float', state.card === 'float');
    dock.classList.toggle('cw-greybubble', !!state.greybubble);
    dock.classList.toggle('cw-greyfocus', !!state.greyfocus);
    if (state.view === 'sessions') renderSessions();
  }

  /* Picking a history design shows it. */
  function setHist(id) {
    state.hist = id;
    state.finding = false;
    state.query = '';
    save();
    if (!state.open) openChat();
    showSessions();
    renderSwitcher();
  }

  function setCard(id) {
    state.card = id;
    save();
    render();
  }

  /* The rail only shows while the sidebar is folded, so picking one folds it. */
  function setRail(id) {
    state.rail = id;
    save();
    render();
    if (side && collapse && !side.classList.contains('is-collapsed')) collapse.click();
  }

  /* ── The switcher ────────────────────────────────────────────────────── */

  var sw = document.createElement('div');
  sw.id = 'sc-switcher';
  sw.className = 'sc-sw';
  var swOpen = false;
  /* Where the panel was scrolled to. The panel is written again on every
     pick, and folding it hides it, so its place is held here and put back:
     a switch leaves the panel on the row that was switched, and reopening
     finds it there too. */
  var swScroll = 0;
  /* on the page's top level, with the pulse-ds tokens: inside the shell it
     would sit under the post drawer, which is its own layer over the shell */
  sw.classList.add('pulse-ds');
  document.body.appendChild(sw);
  sw.addEventListener(
    'scroll',
    function (e) {
      if (e.target.classList && e.target.classList.contains('sc-sw__panel'))
        swScroll = e.target.scrollTop;
    },
    true
  );

  function current(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  function seg(list, picked, attr, label) {
    return (
      '<div class="sc-sw__seg" role="radiogroup" aria-label="' +
      label +
      '">' +
      list
        .map(function (x) {
          var on = x.id === picked;
          return (
            '<button type="button" role="radio" aria-checked="' +
            on +
            '" class="sc-sw__opt' +
            (on ? ' is-on' : '') +
            '" data-' +
            attr +
            '="' +
            x.id +
            '">' +
            x.label +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function renderSwitcher() {
    var v = current(VARIANTS, state.variant);
    var w = current(WINDOWS, state.window);
    var c = current(RAILS, state.rail);
    var t = current(CARDS, state.card);
    var hh = current(HISTS, state.hist);
    var dd = current(DATEDS, state.dated);
    sw.innerHTML =
      '<button type="button" class="sc-sw__tab" aria-expanded="' +
      swOpen +
      '" aria-controls="sc-sw-panel">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>' +
      '<span>Prototype</span><b>' +
      v.label +
      '</b><b>' +
      w.label +
      '</b><b>' +
      c.label +
      '</b>' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
      (swOpen ? 'm6 9 6 6 6-6' : 'm18 15-6-6-6 6') +
      '"/></svg></button>' +
      '<div class="sc-sw__panel" id="sc-sw-panel"' +
      (swOpen ? '' : ' hidden') +
      '>' +
      '<p class="sc-sw__title">Prototype controls</p>' +
      '<p class="sc-sw__hint">Picked so far: Shelf in the sidebar, Paper for the window, Float for the Editing card, Stack on the folded rail. Open now: how the chats history reads.</p>' +
      '<div class="sc-sw__row"><span class="sc-sw__label">Main chat and side chats</span>' +
      seg(VARIANTS, state.variant, 'variant', 'How the pinned bar is told apart') +
      '<p class="sc-sw__desc">' +
      v.desc +
      '</p></div>' +
      '<div class="sc-sw__row"><span class="sc-sw__label">The chat window</span>' +
      seg(WINDOWS, state.window, 'window', 'What the chat window is made of') +
      '<p class="sc-sw__desc">' +
      w.desc +
      (state.open ? '' : ' · open it from the launcher at the foot of the page') +
      '</p>' +
      '<p class="sc-sw__links">' +
      (state.open
        ? '<button type="button" data-go="chat">Conversation</button><button type="button" data-go="empty">New chat</button><button type="button" data-go="sessions">History</button><button type="button" data-go="full">' +
          (state.fullscreen ? 'Side' : 'Fullscreen') +
          '</button>'
        : '<button type="button" data-go="open">Open the chat</button>') +
      '</p></div>' +
      '<div class="sc-sw__row"><span class="sc-sw__label">The chats history</span>' +
      seg(HISTS, state.hist, 'hist', 'How the chats history reads') +
      '<p class="sc-sw__desc">' +
      hh.desc +
      '</p></div>' +
      (state.hist === 'b'
        ? '<div class="sc-sw__row"><span class="sc-sw__label">Dated · the day headings</span>' +
          seg(DATEDS, state.dated, 'dated', 'How Dated sets its day headings') +
          '<p class="sc-sw__desc">' +
          dd.desc +
          '</p></div>'
        : '') +
      '<div class="sc-sw__row"><span class="sc-sw__label">The “Editing a post” card</span>' +
      seg(CARDS, state.card, 'card', 'How the Editing card is drawn') +
      '<p class="sc-sw__desc">' +
      t.desc +
      ' · <a href="#" data-editing>' +
      (state.editing ? 'hide the card' : 'show the card') +
      '</a> (<kbd>E</kbd>)</p></div>' +
      '<div class="sc-sw__row"><span class="sc-sw__label">Changing the post, and when it fails</span>' +
      seg(SCOPES, scope, 'scope', 'What the change covers') +
      '<p class="sc-sw__desc">A change to the post, from the ask to the post: Vicino writes the new version in the card, you review it (apply, try another, compare, or type a note), and only then is it applied. The head’s chip says where it stands.</p>' +
      seg(APS, ap ? ap.state : 'failed', 'ap', 'Where the approved change stands') +
      '<p class="sc-sw__desc">' +
      current(APS, ap ? ap.state : 'failed').desc +
      ' · <a href="#" data-ap-run>start again from the ask</a> (<kbd>R</kbd>) · <a href="#" data-ap-replay>fail applying it</a> (<kbd>F</kbd>)</p>' +
      '<p class="sc-sw__desc">A message that can’t be sent is drawn the way Claude shows it: the message in the thread, greyed until it goes, and a quiet notice under it with Retry. Send anything (the first send always fails here), or <a href="#" data-sf-demo>fail a send</a> (<kbd>G</kbd>).</p>' +
      '<p class="sc-sw__desc">The post: click the Editing card (or press <kbd>P</kbd>) to open it in its drawer. When an update lands, the drawer opens its details on Story, lights it cyan for a moment and flags it Updated; “View changes” in the chat takes you there again.</p></div>' +
      '<div class="sc-sw__row"><span class="sc-sw__label">The folded rail</span>' +
      seg(RAILS, state.rail, 'rail', 'What the folded sidebar shows for chats') +
      '<p class="sc-sw__desc">' +
      c.desc +
      (state.open ? '' : ' · fold the sidebar with the logo’s chevron, or open the chat') +
      '</p></div>' +
      '<p class="sc-sw__keys"><kbd>1</kbd>–<kbd>4</kbd> sidebar · <kbd>5</kbd>–<kbd>0</kbd> <kbd>-</kbd> window · <kbd>R</kbd> starts the change again from the ask · <kbd>F</kbd> fails applying it · <kbd>G</kbd> fails a send · <kbd>P</kbd> opens and closes the post · <kbd>I</kbd> hides and shows the chat icon in the history · <kbd>B</kbd> gives Paper and Mist a grey bubble instead of the cyan one, and back · <kbd>W</kbd> makes the focused field grey and white again · <kbd>D</kbd> drops and restores the rule under the main chat · <kbd>E</kbd> hides and shows the Editing card · <kbd>V</kbd> folds this panel · <kbd>H</kbd> takes the tab off the screen and back</p>' +
      '</div>';
    var panelEl = sw.querySelector('.sc-sw__panel');
    if (panelEl && swOpen) panelEl.scrollTop = swScroll;
  }

  sw.addEventListener('click', function (e) {
    var tab = e.target.closest('.sc-sw__tab');
    if (tab) {
      swOpen = !swOpen;
      renderSwitcher();
      return;
    }
    var opt = e.target.closest('[data-variant]');
    if (opt) setVariant(opt.dataset.variant);
    var win = e.target.closest('[data-window]');
    if (win) setWindow(win.dataset.window);
    var r = e.target.closest('[data-rail]');
    if (r) setRail(r.dataset.rail);
    if (e.target.closest('[data-sf-demo]')) {
      e.preventDefault();
      showSendFail();
      return;
    }
    var scp = e.target.closest('[data-scope]');
    if (scp) {
      setScope(scp.dataset.scope);
      return;
    }
    if (e.target.closest('[data-ap-run]')) {
      e.preventDefault();
      runFromApproval();
      return;
    }
    var aps = e.target.closest('[data-ap], [data-ap-replay]');
    if (aps) {
      e.preventDefault();
      showApproval(aps.dataset.ap || 'failed');
      return;
    }
    var dt = e.target.closest('[data-dated]');
    if (dt) {
      state.dated = dt.dataset.dated;
      save();
      if (!state.open) openChat();
      showSessions();
      renderSwitcher();
    }
    var hs = e.target.closest('[data-hist]');
    if (hs) setHist(hs.dataset.hist);
    var cd = e.target.closest('[data-card]');
    if (cd) setCard(cd.dataset.card);
    var ed = e.target.closest('[data-editing]');
    if (ed) {
      e.preventDefault();
      if (!state.open) openChat();
      if (state.view !== 'chat') backToChat();
      setEditing(!state.editing);
    }
    var go = e.target.closest('[data-go]');
    if (go) {
      var g = go.dataset.go;
      if (g === 'open') openChat();
      else if (g === 'chat') backToChat();
      else if (g === 'empty') showEmpty();
      else if (g === 'sessions') showSessions();
      else if (g === 'full') toggleFullscreen();
      renderSwitcher();
    }
  });

  function setVariant(id) {
    state.variant = id;
    save();
    render();
  }

  function setWindow(id) {
    state.window = id;
    save();
    render();
  }

  var WINKEYS = ['5', '6', '7', '8', '9', '0', '-'];

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'v' || e.key === 'V') {
      swOpen = !swOpen;
      renderSwitcher();
    } else if (e.key === 'h' || e.key === 'H') {
      sw.classList.toggle('is-gone');
    } else if (e.key === 'w' || e.key === 'W') {
      state.greyfocus = !state.greyfocus;
      renderWindow();
    } else if (e.key === 'i' || e.key === 'I') {
      state.noIcons = !state.noIcons;
      if (state.view === 'sessions') renderSessions();
    } else if (e.key === 'b' || e.key === 'B') {
      state.greybubble = !state.greybubble;
      renderWindow();
    } else if (e.key === 'd' || e.key === 'D') {
      state.norule = !state.norule;
      render();
    } else if (e.key === 'e' || e.key === 'E') {
      if (!state.open) openChat();
      if (state.view !== 'chat') backToChat();
      setEditing(!state.editing);
    } else if (e.key === 'r' || e.key === 'R') {
      runFromApproval();
    } else if (e.key === 'f' || e.key === 'F') {
      showApproval('failed');
    } else if ((e.key === 'p' || e.key === 'P') && window.SCPost) {
      window.SCPost.toggle();
    } else if (e.key === 'g' || e.key === 'G') {
      showSendFail();
    } else if (e.key >= '1' && e.key <= '4') {
      setVariant(VARIANTS[Number(e.key) - 1].id);
    } else if (WINKEYS.indexOf(e.key) >= 0) {
      setWindow(WINDOWS[WINKEYS.indexOf(e.key)].id);
    }
  });

  pick(state.active);
  render();
})();
