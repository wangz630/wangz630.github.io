/* Calendar — Campaigns, Approvals and Calendar as one section.

   There is no campaign above a post any more: the page shows posts, sorted by
   time. Views: Calendar (month, week), List (this week, this month, later,
   earlier), Board (the five stages), each in three designs. What used to be the Approvals section and
   the Calendar's "needs attention" panel are the Needs you rail. What a
   campaign grouped is now a tag. A post opens in the drawer (src/drawer.js)
   through window.CD_API, which takes data only. */
(function () {
  'use strict';

  var root = document.getElementById('cal-root');
  if (!root) return;
  var API = window.CD_API;

  // ---------------------------------------------------------------- dates
  // the prototype's clock is fixed, so its samples always read the same
  var NOW = new Date(2026, 10, 2, 9, 30);
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function ymd(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function dateOf(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }
  function startOfWeek(d) {
    return addDays(d, -d.getDay());
  }
  var TODAY = ymd(NOW);

  function short(d) {
    return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate();
  }
  function dowShort(d) {
    return DOW[d.getDay()].slice(0, 3) + ', ' + short(d);
  }
  function longDate(d) {
    return DOW[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function minutes(t) {
    var m = /(\d+):(\d+) (AM|PM)/.exec(t || '12:00 PM');
    return ((+m[1] % 12) + (m[3] === 'PM' ? 12 : 0)) * 60 + +m[2];
  }
  function stamp(p) {
    var d = dateOf(p.date);
    d.setMinutes(minutes(p.time));
    return d;
  }
  function relDay(s) {
    var n = Math.round((dateOf(s) - dateOf(TODAY)) / 864e5);
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    return 'In ' + n + 'd';
  }

  // ----------------------------------------------------------------- data
  // stages: the words the product already uses, and their colours
  var STAGES = [
    { k: 'brief', name: 'Briefs', c: 'var(--stage-briefs)' },
    { k: 'producing', name: 'Producing', c: 'var(--stage-generating)' },
    { k: 'review', name: 'Content review', c: 'var(--stage-review)' },
    { k: 'publication', name: 'Publication', c: 'var(--stage-scheduled)' },
    { k: 'published', name: 'Published', c: 'var(--stage-published)' },
  ];
  var FORMATS = { video: ['Vertical video', 'film'], carousel: ['Carousel', 'layers'], text: ['Text post', 'text'] };

  // What a campaign grouped is a tag now. The first three are the live
  // brand's campaigns; Winter sale is the example from the brief.
  var TAGS = [
    { id: 'ai', name: 'AI shopping', c: '#0ea5b8' },
    { id: 'sell', name: 'Start with what you sell', c: '#6366f1' },
    { id: 'popup', name: 'Pop-up sale', c: '#ec4899' },
    { id: 'winter', name: 'Winter sale', c: '#f19a08', auto: true, rule: 'winter' },
    { id: 'holiday', name: 'Holiday prep', c: '#2e9d40' },
  ];
  var TAG_COLORS = ['#0ea5b8', '#6366f1', '#ec4899', '#f19a08', '#2e9d40', '#3987f3', '#8a8e95'];

  var ME = 'Zi Wang';
  var UNA = 'Unassigned';
  // the fifteen posts on the live brand on 2026-11-02, then samples that fill
  // out the month so every stage and state shows
  var POSTS = [
    p('Could Your Product Be Ready for AI Discovery?', '2026-10-05', '12:30 PM', 'video', 'producing', { fail: 'Generation failed', tags: ['ai'], img: 'scene-1', risk: 'Low' }),
    p('Your First AI Shopping Checklist', '2026-10-07', '9:00 AM', 'text', 'published', { tags: ['ai'] }),
    p('Why Merchants Start With One Product', '2026-10-12', '12:00 PM', 'carousel', 'published', { tags: ['sell'], img: 'slide-1' }),
    p('Inside a Pop-Up Sale Day', '2026-10-14', '3:00 PM', 'video', 'published', { tags: ['popup'], img: 'scene-3' }),
    p('Check Your Store Requirements First', '2026-10-16', '12:37 PM', 'text', 'review', { approve: 'content', tags: ['ai'], owner: ME }),
    p('An X carousel makes the link between an in-person pop-up sale, connected Shopify inventory, and an informed next online stock decision easy to understand and share.', '2026-10-20', '12:00 PM', 'carousel', 'published', { tags: ['popup'], img: 'slide-2' }),
    p('Check the Plan Before Choosing', '2026-10-22', '7:05 PM', 'text', 'brief', { approve: 'brief', flagged: true, tags: ['ai'], owner: ME, risk: 'Medium' }),
    p('A short text-led merchant onboarding carousel that connects what a merchant sells with building a storefront and giving shoppers a reason to return.', '2026-10-23', '12:00 PM', 'carousel', 'review', { approve: 'content', tags: ['sell'], img: 'slide-1' }),
    p('See Which Channels You Can Choose', '2026-10-23', '3:30 PM', 'carousel', 'producing', { fail: 'Generation failed', tags: ['ai'], img: 'slide-2' }),
    p('Which Channel Fits This Product?', '2026-10-23', '7:05 PM', 'video', 'brief', { approve: 'brief', flagged: true, tags: ['ai'], owner: ME, img: 'scene-2', risk: 'Medium' }),
    p('A four-slide X carousel showing how an in-person pop-up sale can inform an online stock decision in a connected Shopify inventory setup.', '2026-10-25', '12:00 PM', 'carousel', 'producing', { tags: ['popup'], img: 'ref-4' }),
    p('Follow the Purchase Step', '2026-10-26', '12:30 PM', 'video', 'brief', { tags: ['ai'], img: 'scene-1' }),
    p('What a Connected Inventory Means', '2026-10-27', '12:00 PM', 'text', 'published', { tags: ['popup'] }),
    p('A concrete one-platform example showing a merchant product, its storefront, and the connected business context, with an invitation to search for Shopify.', '2026-10-28', '12:00 PM', 'carousel', 'producing', { tags: ['sell'], img: 'ref-3' }),
    p('A short, text-led X carousel that moves from having a product to building a storefront around it, then prompts ready-to-explore merchants to search for Shopify.', '2026-10-29', '12:00 PM', 'carousel', 'producing', { tags: ['sell'], img: 'slide-1' }),
    p('Find Your Catalog Starting Point', '2026-10-29', '7:15 PM', 'carousel', 'published', { tags: ['ai'], img: 'slide-2' }),
    p('Verify Where Checkout Happens', '2026-10-30', '9:40 AM', 'carousel', 'brief', { approve: 'brief', flagged: true, tags: ['ai'], owner: ME, risk: 'High', img: 'ref-1' }),
    p('Five Minutes With a First-Time Seller', '2026-11-01', '12:00 PM', 'video', 'published', { tags: ['sell'], img: 'scene-4' }),
    p('One Question to Ask Before You Add a Product', '2026-11-02', '3:00 PM', 'text', 'publication', { tags: ['ai'] }),
    p('A practical X carousel illustrates how a merchant’s product connects to storefront and store-running tasks on Shopify, with a search prompt for merchants ready to explore.', '2026-11-04', '12:00 PM', 'carousel', 'review', { approve: 'content', tags: ['sell'], img: 'slide-1' }),
    p('What Shoppers Ask an AI About Your Product', '2026-11-05', '12:00 PM', 'video', 'producing', { tags: ['ai'], img: 'scene-2' }),
    p('Three Things to Check Before Black Friday', '2026-11-06', '9:00 AM', 'carousel', 'publication', { tags: ['holiday'], img: 'slide-2', owner: ME }),
    p('Set Your Holiday Shipping Cutoffs', '2026-11-09', '12:00 PM', 'text', 'brief', { approve: 'brief', tags: ['holiday'], owner: ME, risk: 'Low' }),
    p('Bundle Slow Stock Before the Holidays', '2026-11-11', '5:00 PM', 'carousel', 'brief', { approve: 'brief', tags: ['holiday'], owner: ME, risk: 'Low', img: 'slide-1' }),
    p('A Founder Packs the First Holiday Order', '2026-11-12', '12:30 PM', 'video', 'producing', { tags: ['holiday'], img: 'scene-3' }),
    p('Winter Sale: What to Stock First', '2026-11-16', '10:00 AM', 'carousel', 'brief', { tags: ['winter'], img: 'ref-3' }),
    p('Three Bundles for the Cold Months', '2026-11-18', '9:00 AM', 'carousel', 'brief', { tags: ['winter'], img: 'slide-2' }),
    p('How to Price a Winter Bundle', '2026-11-18', '12:00 PM', 'text', 'review', { approve: 'content', tags: ['winter'], owner: ME }),
    p('A Mug and Saucer Set for the Winter Sale', '2026-11-18', '3:00 PM', 'carousel', 'publication', { tags: ['winter'], img: 'slide-1' }),
    p('Ask Your Customers What They Want This Winter', '2026-11-18', '5:30 PM', 'text', 'brief', { tags: ['winter'] }),
    p('Behind the Winter Sale Shoot', '2026-11-20', '3:00 PM', 'video', 'brief', { tags: ['winter'], img: 'scene-2' }),
    p('Winter Sale Starts Monday', '2026-11-27', '9:00 AM', 'text', 'publication', { tags: ['winter'], owner: ME }),
    p('Winter Sale Is Live', '2026-11-30', '9:00 AM', 'video', 'publication', { tags: ['winter'], img: 'scene-4', owner: ME }),
    p('Last Day of the Winter Sale', '2026-12-04', '9:00 AM', 'text', 'brief', { tags: ['winter'] }),
    p('A Holiday Gift Guide for Your Store', '2026-12-08', '12:00 PM', 'carousel', 'brief', { tags: ['holiday'], img: 'ref-4' }),
    p('Start With What You Sell', null, null, 'text', 'brief', { tags: ['sell'] }),
  ];

  function p(title, date, time, fmt, stage, x) {
    x = x || {};
    return {
      id: 'p' + (p.n = (p.n || 0) + 1),
      title: title,
      date: date,
      time: time,
      fmt: fmt,
      stage: stage,
      approve: x.approve || null,
      flagged: !!x.flagged,
      fail: x.fail || null,
      tags: x.tags || [],
      img: x.img ? 'assets/' + x.img + '.jpg' : null,
      owner: x.owner || UNA,
      risk: x.risk || 'Not assessed',
      channel: 'X',
      archived: false,
    };
  }

  var INSIGHTS = [
    {
      id: 'b2b',
      title: 'Shopify B2B is being positioned for seasonal wholesale workflows',
      say: 'Merchants are asking how wholesale fits the holiday rush, and few brands answer it yet.',
      tag: 'Seasonal wholesale',
    },
    {
      id: 'agent',
      title: 'Shopify checkout agent flow framed as user-controlled',
      say: 'The conversation is moving from whether agents can buy to who stays in charge at checkout.',
      tag: 'AI shopping',
    },
    {
      id: 'holiday',
      title: 'Holiday prep content is using Shopify as the default store builder',
      say: 'Prep checklists now name Shopify without explaining it, which leaves room for a practical take.',
      tag: 'Holiday prep',
    },
  ];

  // ---------------------------------------------------------------- state
  var S = {
    view: 'calendar', // calendar | list | board
    mode: 'month', // month | week
    cursor: dateOf(TODAY),
    tags: [], // tag ids; empty is all
    f: { stage: [], cond: [], format: [], owner: [], risk: [], time: [] },
    q: '',
    rail: null, // approve | fix | nodate
    apType: 'all', // all | brief | content
    insights: false,
    goneInsights: [],
    pop: null,
    modal: null,
    sel: [],
    showArchived: false,
    shut: {}, // list groups folded
    toast: null,
    drag: null,
    opened: null,
    design: 'a', // a Plain | b Picture | c Agenda
    calView: 'design', // design | current: the calendar as it was
    dayOpen: null, // C: the day open beside the month
  };

  // the view is in the link, so a view can be sent or reloaded
  (function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (['list', 'board'].indexOf(h.get('v')) > -1) S.view = h.get('v');
    if (h.get('m') === 'week') S.mode = 'week';
    if (['approve', 'fix', 'nodate'].indexOf(h.get('r')) > -1) S.rail = h.get('r');
    if (h.get('i') === '1') S.insights = true;
    if (h.get('t')) S.tags = h.get('t').split(',');
    if (h.get('d')) S.cursor = dateOf(h.get('d'));
    if (['a', 'b', 'c'].indexOf(h.get('g')) > -1) S.design = h.get('g');
    if (h.get('cv') === 'current') S.calView = 'current';
  })();

  function writeHash() {
    var h = new URLSearchParams();
    if (S.view !== 'calendar') h.set('v', S.view);
    if (S.mode !== 'month') h.set('m', S.mode);
    if (S.rail) h.set('r', S.rail);
    if (S.insights) h.set('i', '1');
    if (S.tags.length) h.set('t', S.tags.join(','));
    if (S.view === 'calendar' && ymd(S.cursor) !== TODAY) h.set('d', ymd(S.cursor));
    if (S.design !== 'a') h.set('g', S.design);
    if (S.calView === 'current') h.set('cv', 'current');
    var q = h.toString();
    history.replaceState(null, '', location.pathname + location.search + (q ? '#' + q : ''));
  }

  // ---------------------------------------------------------------- icons
  var ICONS = {
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    board: '<rect width="6" height="16" x="3" y="4" rx="1.5"/><rect width="6" height="10" x="15" y="4" rx="1.5"/>',
    wand: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
    film: '<rect width="18" height="16" x="3" y="4" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    text: '<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
    stamp: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    calX: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M9 16h6"/>',
    send: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  };
  var X_LOGO =
    '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';

  // a tag is a filled tag in its colour
  function tagGlyph(c, size) {
    size = size || 12;
    return (
      '<svg class="cal-tagi" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + c + '" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42zM7.5 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>'
    );
  }
  function ic(name, size) {
    size = size || 14;
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>'
    );
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --------------------------------------------------------------- reading a post
  function byId(id) {
    return POSTS.filter(function (x) {
      return x.id === id;
    })[0];
  }
  function tagOf(id) {
    return TAGS.filter(function (t) {
      return t.id === id;
    })[0];
  }
  function stageOf(x) {
    return STAGES.filter(function (s) {
      return s.k === x.stage;
    })[0];
  }
  function missed(x) {
    return !!x.date && x.stage !== 'published' && stamp(x) < NOW;
  }
  function needsFix(x) {
    return !x.archived && (!!x.fail || (missed(x) && !x.approve));
  }
  function toApprove(x) {
    return !x.archived && !!x.approve;
  }
  function noDate(x) {
    return !x.archived && !x.date && x.stage !== 'published';
  }
  function atRisk(x) {
    if (x.archived || !x.date || missed(x) || x.stage === 'published' || x.stage === 'publication') return false;
    return (stamp(x) - NOW) / 36e5 < 72;
  }
  function onTrack(x) {
    return !x.archived && !!x.date && (x.stage === 'published' || (x.stage === 'publication' && !missed(x)));
  }
  // in the product's words
  function statusOf(x) {
    if (x.fail) return { t: x.fail, k: 'fix' };
    if (x.stage === 'published') return { t: 'Published', k: 'published' };
    if (x.stage === 'publication') return { t: 'Scheduled', k: 'publication' };
    if (x.stage === 'review') return x.approve ? { t: 'Needs content approval', k: 'review' } : { t: 'Approved', k: 'review' };
    if (x.stage === 'producing') return { t: 'Generating', k: 'producing' };
    return x.approve ? { t: 'Needs approval', k: 'brief' } : { t: 'Not generated yet', k: 'brief' };
  }
  function whenText(x) {
    return x.date ? short(dateOf(x.date)) + ' · ' + x.time : 'No date';
  }
  function hoursLate(x) {
    return Math.round((NOW - stamp(x)) / 36e5);
  }

  function matches(x) {
    if (x.archived && !S.showArchived) return false;
    if (S.tags.length) {
      var hit = S.tags.some(function (t) {
        return t === 'none' ? !x.tags.length : x.tags.indexOf(t) > -1;
      });
      if (!hit) return false;
    }
    var f = S.f;
    if (f.stage.length && f.stage.indexOf(x.stage) < 0) return false;
    if (f.format.length && f.format.indexOf(x.fmt) < 0) return false;
    if (f.owner.length && f.owner.indexOf(x.owner) < 0) return false;
    if (f.risk.length && f.risk.indexOf(x.risk) < 0) return false;
    if (f.cond.length) {
      var c = f.cond.some(function (k) {
        return k === 'approval' ? !!x.approve : !!x.fail;
      });
      if (!c) return false;
    }
    if (f.time.length) {
      var kind = !x.date ? 'none' : missed(x) ? 'missed' : 'set';
      if (f.time.indexOf(kind) < 0) return false;
    }
    if (S.q && x.title.toLowerCase().indexOf(S.q.toLowerCase()) < 0) return false;
    return true;
  }
  function visible() {
    return POSTS.filter(matches);
  }
  function onDay(s) {
    return visible()
      .filter(function (x) {
        return x.date === s;
      })
      .sort(function (a, b) {
        return minutes(a.time) - minutes(b.time);
      });
  }
  function nextUp() {
    return POSTS.filter(function (x) {
      return !x.archived && x.date && x.stage !== 'published' && stamp(x) > NOW;
    }).sort(function (a, b) {
      return stamp(a) - stamp(b);
    })[0];
  }

  // ----------------------------------------------------------------- small parts
  // a post with no picture yet still has a face: a small drawing of what it will be
  var ART = {
    text: '<rect class="cal-art__a" x="5" y="3" width="14" height="18" rx="2"/><rect class="cal-art__b" x="8" y="7" width="8" height="1.6" rx=".8"/><rect class="cal-art__b" x="8" y="10.6" width="8" height="1.6" rx=".8"/><rect class="cal-art__b" x="8" y="14.2" width="5" height="1.6" rx=".8"/>',
    carousel: '<rect class="cal-art__c" x="11" y="5.5" width="10" height="13" rx="2"/><rect class="cal-art__a" x="3.5" y="3.5" width="12.5" height="17" rx="2"/><circle class="cal-art__b" cx="7.6" cy="8.4" r="1.5"/><path class="cal-art__b" d="M5.8 16.8l2.7-3.5 1.9 2.2 1.3-1.5 2 2.8z"/>',
    video: '<rect class="cal-art__a" x="6.5" y="2.5" width="11" height="19" rx="2.4"/><path class="cal-art__b" d="M10.4 9.1v5.8a.5.5 0 0 0 .76.43l4.7-2.9a.5.5 0 0 0 0-.86l-4.7-2.9a.5.5 0 0 0-.76.43z"/>',
  };
  function art(x) {
    return '<svg class="cal-art" viewBox="0 0 24 24" aria-hidden="true">' + ART[x.fmt] + '</svg>';
  }
  function thumb(x, cls) {
    return (
      '<span class="cal-thumb ' + (cls || '') + (x.img ? '' : ' is-none') + '" style="--st:' + stageOf(x).c + '">' +
      (x.img ? '<img src="' + x.img + '" alt="" draggable="false">' : art(x)) +
      '</span>'
    );
  }
  function pill(x) {
    var s = statusOf(x);
    return '<span class="cal-pill is-' + s.k + '">' + (s.k === 'fix' ? ic('warn', 11) : '<i></i>') + esc(s.t) + '</span>';
  }
  function xMark() {
    return '<span class="cal-x" title="X" aria-label="X">' + X_LOGO + '</span>';
  }
  function avatar(x) {
    return x.owner === UNA
      ? '<span class="cal-ava is-none" title="Unassigned">' + ic('user', 11) + '</span>'
      : '<span class="cal-ava" title="' + esc(x.owner) + '"><img src="assets/approver.png" alt=""></span>';
  }
  function tagChips(x, withAdd) {
    return (
      '<span class="cal-tags">' +
      x.tags
        .map(function (id) {
          var t = tagOf(id);
          return t ? '<span class="cal-tag">' + tagGlyph(t.c, 11) + esc(t.name) + '</span>' : '';
        })
        .join('') +
      (withAdd
        ? '<button type="button" class="cal-tag cal-tag--add" data-cal="pop-tagpost" data-arg="' + x.id + '">' + ic('plus', 10) + (x.tags.length ? '' : 'Tag') + '</button>'
        : '') +
      '</span>'
    );
  }

  // ---------------------------------------------------------------- the top
  function door(key, icon, n, label) {
    return (
      '<button type="button" class="cal-door is-' + key + (S.rail === key ? ' is-on' : '') + (n ? '' : ' is-zero') + '" data-cal="rail" data-arg="' + key + '" aria-pressed="' + (S.rail === key) + '">' +
      '<i class="cal-door__ico">' + ic(icon, 14) + '</i><b>' + n + '</b><span>' + label + '</span></button>'
    );
  }

  function renderHead() {
    var nx = nextUp();
    var live = INSIGHTS.filter(function (i) {
      return S.goneInsights.indexOf(i.id) < 0;
    }).length;
    return (
      '<header class="cal-head"><h1 class="cal-title">Calendar</h1><div class="cal-doors" role="group" aria-label="What needs you">' +
      door('approve', 'stamp', POSTS.filter(toApprove).length, 'To approve') +
      door('fix', 'warn', POSTS.filter(needsFix).length, 'Need fixing') +
      door('nodate', 'calX', POSTS.filter(noDate).length, 'No date') +
      (nx
        ? '<button type="button" class="cal-door is-next" data-cal="open" data-arg="' + nx.id + '" title="Next up: ' + esc(nx.title) + '"><i class="cal-door__ico">' + ic('clock', 14) + '</i><b>' + relDay(nx.date) + '</b><span>Next up · ' + nx.time + '</span></button>'
        : '') +
      '</div><div class="cal-head__acts"><button type="button" class="cal-btn cal-btn--ins' + (S.insights ? ' is-on' : '') + '" data-cal="insights" aria-expanded="' + S.insights + '">' + ic('wand', 13) + 'Vicino insight' + (live ? '<b>' + live + '</b>' : '') + '</button>' +
      '<button type="button" class="cal-btn cal-btn--ink" data-cal="plan" data-arg="' + TODAY + '">' + ic('plus', 14) + 'Plan a post</button></div></header>'
    );
  }

  function renderInsights() {
    if (!S.insights) return '';
    var live = INSIGHTS.filter(function (i) {
      return S.goneInsights.indexOf(i.id) < 0;
    });
    return (
      '<section class="cal-ins" aria-label="Vicino insight"><header class="cal-ins__head"><i class="cal-ins__ico">' + ic('wand', 14) + '</i><h2>Vicino insight</h2><span>' +
      (live.length ? live.length + ' direction' + (live.length === 1 ? '' : 's') + ' from this week’s signals' : 'Nothing left this week. Vicino proposes again as new signals come in.') +
      '</span><button type="button" class="cal-link" data-cal="insights">Hide</button></header>' +
      (live.length
        ? '<div class="cal-ins__cards">' +
          live
            .map(function (i) {
              return (
                '<article class="cal-icard"><span class="cal-kind">Opportunity</span><h3>' + esc(i.title) + '</h3><p>' + esc(i.say) + '</p><div class="cal-icard__acts"><button type="button" class="cal-btn cal-btn--soft cal-btn--sm" data-cal="plan-insight" data-arg="' + i.id + '">' + ic('plus', 12) + 'Plan a post</button><button type="button" class="cal-link cal-link--quiet" data-cal="insight-gone" data-arg="' + i.id + '">Remove</button></div></article>'
              );
            })
            .join('') +
          '</div>'
        : '<button type="button" class="cal-link" data-cal="insight-back">Bring back what I removed</button>') +
      '</section>'
    );
  }

  // --------------------------------------------------------------- the bar
  function seg(items, cur, act, cls) {
    return (
      '<div class="cal-seg ' + (cls || '') + '" role="group">' +
      items
        .map(function (o) {
          return '<button type="button" class="cal-seg__opt' + (o[0] === cur ? ' is-on' : '') + '" data-cal="' + act + '" data-arg="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + (o[2] ? ic(o[2], 13) : '') + o[1] + '</button>';
        })
        .join('') +
      '</div>'
    );
  }
  function periodLabel() {
    if (S.mode === 'week') {
      var a = startOfWeek(S.cursor);
      var b = addDays(a, 6);
      return short(a) + ' – ' + (a.getMonth() === b.getMonth() ? b.getDate() : short(b)) + ', ' + b.getFullYear();
    }
    return MONTHS[S.cursor.getMonth()] + ' ' + S.cursor.getFullYear();
  }
  function filterCount() {
    var f = S.f;
    return f.stage.length + f.cond.length + f.format.length + f.owner.length + f.risk.length + f.time.length + (S.showArchived ? 1 : 0);
  }

  function renderBar() {
    var cal = S.view === 'calendar';
    var fc = filterCount();
    var n = visible().length;
    return (
      '<div class="cal-bar">' +
      (cal
        ? '<div class="cal-nav"><button type="button" class="cal-btn cal-btn--sm" data-cal="today">Today</button><button type="button" class="cal-iconbtn" data-cal="prev" aria-label="Previous ' + S.mode + '">' + ic('chevL', 15) + '</button><button type="button" class="cal-iconbtn" data-cal="next" aria-label="Next ' + S.mode + '">' + ic('chevR', 15) + '</button>' +
          '<button type="button" class="cal-range" data-cal="pop-jump" title="Jump to a date">' + periodLabel() + ic('chevD', 12) + '</button>' + seg([['month', 'Month'], ['week', 'Week']], S.mode, 'mode', 'cal-seg--mode') + '</div>'
        : '<span class="cal-bar__count">' + n + ' post' + (n === 1 ? '' : 's') + '</span>') +
      '<span class="cal-grow"></span>' +
      '<button type="button" class="cal-btn' + (S.tags.length ? ' is-active' : '') + '" data-cal="pop-tags">' + ic('tag', 13) + (S.tags.length === 1 && S.tags[0] !== 'none' ? esc(tagOf(S.tags[0]).name) : S.tags.length > 1 ? S.tags.length + ' tags' : S.tags[0] === 'none' ? 'No tag' : 'All tags') + ic('chevD', 12) + '</button>' +
      '<button type="button" class="cal-btn' + (fc ? ' is-active' : '') + '" data-cal="pop-filter">' + ic('sliders', 13) + 'Filter' + (fc ? '<b>' + fc + '</b>' : '') + '</button>' +
      '<label class="cal-search">' + ic('search', 13) + '<input id="cal-q" type="search" placeholder="Search posts" value="' + esc(S.q) + '" aria-label="Search posts"></label>' +
      seg([['calendar', 'Calendar', 'calendar'], ['list', 'List', 'list'], ['board', 'Board', 'board']], S.view, 'view', 'cal-seg--view') +
      '</div>'
    );
  }

  // what is filtered, each one a chip to take off
  var F_LABEL = {
    stage: { brief: 'Briefs', producing: 'Producing', review: 'Content review', publication: 'Publication', published: 'Published' },
    cond: { approval: 'Needs approval', failed: 'Failed' },
    format: { video: 'Vertical video', carousel: 'Carousel', text: 'Text post' },
    owner: {},
    risk: {},
    time: { missed: 'Missed its time', set: 'Time set', none: 'Unscheduled' },
  };
  var F_NAME = { stage: 'Stage', cond: 'Condition', format: 'Format', owner: 'Owner', risk: 'Risk', time: 'Planned time' };

  function renderActive() {
    var out = [];
    Object.keys(S.f).forEach(function (g) {
      S.f[g].forEach(function (v) {
        out.push('<button type="button" class="cal-fchip" data-cal="f-off" data-arg="' + g + ':' + esc(v) + '"><span>' + F_NAME[g] + '</span>' + esc(F_LABEL[g][v] || v) + ic('close', 11) + '</button>');
      });
    });
    if (S.showArchived) out.push('<button type="button" class="cal-fchip" data-cal="archived-toggle">Archived shown' + ic('close', 11) + '</button>');
    if (!out.length) return '';
    return '<div class="cal-active">' + out.join('') + '<button type="button" class="cal-link" data-cal="f-clear">Clear all</button></div>';
  }

  // one tag chosen: what the campaign's head told you, in one line
  function renderTagBand() {
    if (S.tags.length !== 1 || S.tags[0] === 'none') return '';
    var t = tagOf(S.tags[0]);
    if (!t) return '';
    var ps = POSTS.filter(function (x) {
      return !x.archived && x.tags.indexOf(t.id) > -1;
    });
    if (!ps.length) return '';
    var dated = ps
      .filter(function (x) {
        return x.date;
      })
      .sort(function (a, b) {
        return stamp(a) - stamp(b);
      });
    var pub = ps.filter(function (x) {
      return x.stage === 'published';
    }).length;
    var appr = ps.filter(toApprove).length;
    var gen = ps.filter(function (x) {
      return x.stage === 'brief' && !x.approve;
    }).length;
    return (
      '<section class="cal-tagband" aria-label="' + esc(t.name) + '"><div class="cal-tagband__name">' + tagGlyph(t.c, 15) + '<b>' + esc(t.name) + '</b><button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="tag-edit" data-arg="' + t.id + '" title="Edit this tag" aria-label="Edit this tag">' + ic('pencil', 11) + '</button></div>' +
      '<div class="cal-tagband__facts"><span>' + ps.length + ' post' + (ps.length === 1 ? '' : 's') + '</span>' +
      (dated.length ? '<span>' + short(dateOf(dated[0].date)) + ' – ' + short(dateOf(dated[dated.length - 1].date)) + '</span>' : '') +
      '<span><b>' + pub + '</b>/' + ps.length + ' published</span>' +
      (appr ? '<span class="is-warn">' + appr + ' need' + (appr === 1 ? 's' : '') + ' approval</span>' : '') +
      (t.auto ? '<span class="cal-tagband__auto" title="Vicino adds this tag to new posts about ' + esc(t.rule) + '">' + ic('wand', 11) + 'Added by Vicino</span>' : '') +
      '</div>' +
      '<div class="cal-split" role="img" aria-label="Posts by stage">' +
      STAGES.map(function (s) {
        var n = ps.filter(function (x) {
          return x.stage === s.k;
        }).length;
        return n ? '<i style="flex:' + n + ';background:' + s.c + '" title="' + s.name + ': ' + n + '"></i>' : '';
      }).join('') +
      '</div>' +
      '<div class="cal-tagband__acts">' +
      (gen ? '<button type="button" class="cal-btn cal-btn--soft cal-btn--sm" data-cal="gen-tag" data-arg="' + t.id + '">Generate (' + gen + ')</button>' : '') +
      '<button type="button" class="cal-btn cal-btn--soft cal-btn--sm" data-cal="plan-tag" data-arg="' + t.id + '">' + ic('plus', 12) + 'Plan a post</button></div></section>'
    );
  }

  // ---------------------------------------------------------------- calendar
  function chipMeta(x) {
    if (x.fail) return '<span class="cal-chip__flag">' + ic('warn', 10) + (x.fail === 'Stopped' ? 'Stopped' : 'Failed') + '</span>';
    if (missed(x)) return '<span class="cal-chip__flag">' + ic('warn', 10) + 'Missed its time</span>';
    return x.time + (x.approve ? '<em title="Needs your approval">' + ic('stamp', 11) + '<span>Approve</span></em>' : '');
  }
  function chip(x) {
    var drag = x.stage !== 'published' && !x.archived;
    return (
      '<button type="button" class="cal-chip' + (x.fail || missed(x) ? ' is-fix' : '') + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" data-hover="' + x.id + '"' + (drag ? ' draggable="true" data-drag="' + x.id + '"' : '') + '>' +
      thumb(x) +
      '<span class="cal-chip__txt"><span class="cal-chip__meta"><i class="cal-dot"></i>' + chipMeta(x) + '</span><span class="cal-chip__row"><span class="cal-chip__title">' + esc(x.title) + '</span>' + tagMarks(x) + '</span></span></button>'
    );
  }

  function renderLegend(range) {
    var vis = visible().filter(function (x) {
      return x.date && x.date >= range[0] && x.date <= range[1];
    });
    var risk = vis.filter(atRisk).length;
    var track = vis.filter(onTrack).length;
    return (
      '<div class="cal-legend"><div class="cal-legend__stages">' +
      STAGES.map(function (s) {
        var on = S.f.stage.indexOf(s.k) > -1;
        var n = vis.filter(function (x) {
          return x.stage === s.k;
        }).length;
        return '<button type="button" class="cal-lg' + (on ? ' is-on' : '') + '" data-cal="f-stage" data-arg="' + s.k + '" aria-pressed="' + on + '" title="Show only ' + s.name + '"><i style="background:' + s.c + '"></i>' + s.name + '<b>' + n + '</b></button>';
      }).join('') +
      '</div><div class="cal-legend__side"><span title="Posts with a time that are published or scheduled, and posts due within 3 days that aren’t ready">' + track + ' on track · ' + (risk ? '<b>' + risk + ' at risk</b>' : '0 at risk') + '</span><span class="cal-tz" title="Times shown in America/New_York, which is both the brand’s zone and yours">' + ic('globe', 12) + 'New York · brand time</span></div></div>'
    );
  }

  function dayPlus(s) {
    if (s < TODAY) return '';
    var d = dateOf(s);
    return '<button type="button" class="cal-day__plus" data-cal="plan" data-arg="' + s + '" title="Plan a post on ' + DOW[d.getDay()] + ', ' + short(d) + '" aria-label="Plan a post on ' + longDate(d) + '">' + ic('plus', 13) + '</button>';
  }

  function renderMonth() {
    var first = new Date(S.cursor.getFullYear(), S.cursor.getMonth(), 1);
    var start = startOfWeek(first);
    var last = new Date(S.cursor.getFullYear(), S.cursor.getMonth() + 1, 0);
    var weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    var cells = '';
    for (var i = 0; i < weeks * 7; i++) {
      var d = addDays(start, i);
      var s = ymd(d);
      var posts = onDay(s);
      var show = posts.length > 3 ? posts.slice(0, 2) : posts;
      cells +=
        '<div class="cal-day' + (d.getMonth() !== S.cursor.getMonth() ? ' is-out' : '') + (s === TODAY ? ' is-today' : '') + (s < TODAY ? ' is-past' : '') + '" data-day="' + s + '"><div class="cal-day__head"><span class="cal-day__n">' + d.getDate() + '</span>' + dayPlus(s) + '</div><div class="cal-day__posts">' +
        show.map(chip).join('') +
        (posts.length > show.length ? '<button type="button" class="cal-more" data-cal="pop-day" data-arg="' + s + '">+' + (posts.length - show.length) + ' more</button>' : '') +
        '</div></div>';
    }
    return (
      '<section class="cal-sheet" aria-label="' + periodLabel() + '">' + renderLegend([ymd(start), ymd(addDays(start, weeks * 7 - 1))]) +
      '<div class="cal-dow">' + DOW.map(function (n) { return '<span>' + n.slice(0, 3) + '</span>'; }).join('') + '</div><div class="cal-month" style="--weeks:' + weeks + '">' + cells + '</div></section>'
    );
  }

  // ---------------------------------------------------------------- the designs
  // Three ways to draw the same page; the Prototype panel switches them. The
  // calendar's sheet and post differ by design. List and Board share one
  // structure, the one draft/campaign's have, and differ only in their finish.
  // A Plain: words on one white sheet, nothing in a box it doesn't need.
  // B Picture: every post is led by its picture.
  // C Agenda: the picture melts into the stage's colour, the date reads first.
  var VIEWS = {
    monthA: monthA,
    weekA: weekA,
    monthB: monthB,
    weekB: weekB,
    monthC: monthC,
    weekC: weekC,
  };

  function monthGrid() {
    var first = new Date(S.cursor.getFullYear(), S.cursor.getMonth(), 1);
    var start = startOfWeek(first);
    var last = new Date(S.cursor.getFullYear(), S.cursor.getMonth() + 1, 0);
    var weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    var days = [];
    for (var i = 0; i < weeks * 7; i++) days.push(addDays(start, i));
    return { weeks: weeks, days: days, from: ymd(start), to: ymd(days[days.length - 1]) };
  }
  // the week is a timetable: the hours down the left, each post at its time
  var HOUR = 64;
  var TG_PAD = 12;
  function clock(m) {
    var h = Math.floor(m / 60);
    return (h % 12 || 12) + ':' + pad2(m % 60) + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function tgTop(m, from) {
    return TG_PAD + ((m - from * 60) / 60) * HOUR;
  }
  // posts too close to fit one under the other share the column's width
  function laneOut(posts, from, cardH) {
    var groups = [];
    var cur = null;
    var items = posts.map(function (x) {
      return { x: x, top: tgTop(minutes(x.time), from), lane: 0, lanes: 1 };
    });
    items.forEach(function (it) {
      if (cur && it.top < cur.end) {
        cur.items.push(it);
        cur.end = Math.max(cur.end, it.top + cardH);
      } else {
        cur = { items: [it], end: it.top + cardH };
        groups.push(cur);
      }
    });
    groups.forEach(function (g) {
      var ends = [];
      g.items.forEach(function (it) {
        var l = 0;
        while (l < ends.length && ends[l] > it.top) l++;
        ends[l] = it.top + cardH;
        it.lane = l;
      });
      g.items.forEach(function (it) {
        it.lanes = ends.length;
      });
    });
    return items;
  }
  function weekGrid(entry, cls, cardH) {
    var a = startOfWeek(S.cursor);
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(a, i));
    // the working day, stretched to reach any post outside it
    var from = 8;
    var to = 21;
    days.forEach(function (d) {
      onDay(ymd(d)).forEach(function (x) {
        var h = minutes(x.time) / 60;
        from = Math.min(from, Math.floor(h));
        to = Math.min(24, Math.max(to, Math.ceil(h) + 2));
      });
    });
    var axis = '';
    for (var h = from; h < to; h++) axis += '<span style="top:' + tgTop(h * 60, from) + 'px">' + clock(h * 60) + '</span>';
    var nowM = NOW.getHours() * 60 + NOW.getMinutes();
    var heads = days
      .map(function (d) {
        var s = ymd(d);
        return '<div class="cal-tg__day' + (s === TODAY ? ' is-today' : '') + (s < TODAY ? ' is-past' : '') + '"><span>' + DOW[d.getDay()].slice(0, 3) + '</span><b class="cal-day__n">' + d.getDate() + '</b>' + dayPlus(s) + '</div>';
      })
      .join('');
    var cols = days
      .map(function (d) {
        var s = ymd(d);
        return (
          '<div class="cal-tg__col' + (s === TODAY ? ' is-today' : '') + '" data-day="' + s + '" data-from="' + from + '" data-to="' + to + '">' +
          (s === TODAY && nowM >= from * 60 && nowM < to * 60 ? '<i class="cal-tg__now" style="top:' + tgTop(nowM, from) + 'px"></i>' : '') +
          laneOut(onDay(s), from, cardH)
            .map(function (it) {
              return '<div class="cal-tg__post' + (it.lanes > 1 ? ' is-tight' : '') + '" style="top:' + it.top + 'px;left:' + (it.lane / it.lanes) * 100 + '%;width:' + 100 / it.lanes + '%">' + entry(it.x) + '</div>';
            })
            .join('') +
          '</div>'
        );
      })
      .join('');
    return (
      '<section class="cal-sheet cal-tg ' + cls + '" style="--hour:' + HOUR + 'px;--pad:' + TG_PAD + 'px" aria-label="' + periodLabel() + '">' + renderLegend([ymd(days[0]), ymd(days[6])]) +
      '<div class="cal-tg__head"><span class="cal-tg__corner"></span>' + heads + '</div><div class="cal-tg__body"><div class="cal-tg__axis" style="height:' + (TG_PAD + (to - from) * HOUR) + 'px">' + axis + '</div>' + cols + '</div></section>'
    );
  }
  function dayCls(d, s) {
    return (d.getMonth() !== S.cursor.getMonth() ? ' is-out' : '') + (s === TODAY ? ' is-today' : '') + (s < TODAY ? ' is-past' : '');
  }
  function dragAttr(x) {
    return x.stage !== 'published' && !x.archived ? ' draggable="true" data-drag="' + x.id + '"' : '';
  }
  function shortTime(t) {
    return t.replace(':00 ', ' ');
  }
  function dowHead() {
    return '<div class="cal-dow">' + DOW.map(function (n) { return '<span>' + n.slice(0, 3) + '</span>'; }).join('') + '</div>';
  }
  function moreBtn(n, s) {
    return '<button type="button" class="cal-more" data-cal="pop-day" data-arg="' + s + '">+' + n + ' more</button>';
  }
  // the one thing about a post that needs someone, if there is one
  function attention(x) {
    if (x.fail) return { k: 'fix', t: x.fail === 'Stopped' ? 'Stopped' : 'Failed' };
    if (missed(x)) return { k: 'fix', t: 'Missed' };
    if (x.approve) return { k: 'ask', t: 'Approve' };
    return null;
  }
  // a dot and the word, where a pill would shout
  function stateWord(x) {
    var s = statusOf(x);
    return '<span class="cal-state is-' + s.k + '" style="--st:' + stageOf(x).c + '">' + (s.k === 'fix' ? ic('warn', 12) : '<i></i>') + esc(s.t) + '</span>';
  }
  // the first tag by name; a click changes them
  function tagCell(x) {
    var ts = tagList(x);
    var names = ts.map(function (t) { return t.name; }).join(', ');
    var inner = ts.length
      ? tagGlyph(ts[0].c, 13) + '<span>' + esc(ts[0].name) + '</span>' + (ts.length > 1 ? '<small>+' + (ts.length - 1) + '</small>' : '')
      : '<em>' + ic('plus', 11) + 'Tag</em>';
    if (x.archived) return '<span class="cal-tagcell is-still">' + (ts.length ? inner : '') + '</span>';
    return '<button type="button" class="cal-tagcell" data-cal="pop-tagpost" data-arg="' + x.id + '"' + (ts.length > 1 ? ' title="' + esc(names) + '"' : '') + ' aria-label="' + (ts.length ? 'Tags: ' + esc(names) : 'Add a tag') + '">' + inner + '</button>';
  }
  // just the marks, with the name on hover
  function tagMarks(x) {
    var ts = tagList(x);
    if (!ts.length) return '';
    return (
      '<span class="cal-marks">' +
      ts
        .map(function (t) {
          return '<span title="' + esc(t.name) + '">' + tagGlyph(t.c, 13) + '</span>';
        })
        .join('') +
      '</span>'
    );
  }
  function checkBox(x) {
    var sel = S.sel.indexOf(x.id) > -1;
    return '<button type="button" class="cal-check' + (sel ? ' is-on' : '') + '" data-cal="sel" data-arg="' + x.id + '" aria-pressed="' + sel + '" aria-label="Select this post">' + ic('check', 11) + '</button>';
  }
  // the first tag by name, then how many more
  function tagLine(x) {
    var ts = tagList(x);
    if (!ts.length) return '';
    var names = ts.map(function (t) { return t.name; }).join(', ');
    return '<span class="cal-tline"' + (ts.length > 1 ? ' title="' + esc(names) + '"' : '') + '>' + tagGlyph(ts[0].c, 11) + '<span>' + esc(ts[0].name) + '</span>' + (ts.length > 1 ? '<small>+' + (ts.length - 1) + '</small>' : '') + '</span>';
  }
  // the time and, if a post waits on someone, that word; what went wrong replaces the time
  function timeBits(x) {
    var a = attention(x);
    if (a && a.k === 'fix') return '<span class="cal-bit is-fix">' + ic('warn', 10) + a.t + '</span>';
    return '<span class="cal-bit"><i class="cal-dot"></i>' + shortTime(x.time) + '</span>' + (a ? askBit() : '');
  }
  // the word, or its stamp where there's no room for the word
  function askBit() {
    return '<span class="cal-bit is-ask" title="Needs approval">' + ic('stamp', 11) + '<em>Approve</em></span>';
  }
  // a row keeps its one height: what you can do waits for the pointer
  function rowActs(x) {
    if (x.archived) return '<span class="cal-acts is-on"><button type="button" class="cal-btn cal-btn--sm" data-cal="restore" data-arg="' + x.id + '">Restore</button></span>';
    var b = '';
    if (x.approve) b += '<button type="button" class="cal-btn cal-btn--sm" data-cal="open" data-arg="' + x.id + '">Review</button>';
    if (!x.date) b += '<button type="button" class="cal-btn cal-btn--sm" data-cal="schedule" data-arg="' + x.id + '">Schedule</button>';
    else if (missed(x)) {
      if (!x.approve) b += '<button type="button" class="cal-link" data-cal="pick" data-arg="' + x.id + '">Let Vicino pick</button>';
      b += '<button type="button" class="cal-btn cal-btn--sm" data-cal="schedule" data-arg="' + x.id + '">New time</button>';
    }
    return b ? '<span class="cal-acts">' + b + '</span>' : '';
  }
  function longTitle(x) {
    return x.title.length > 56 ? ' title="' + esc(x.title) + '"' : '';
  }

  var GROUPS = [
    ['nodate', 'No date', 'Briefs waiting for a time'],
    ['week', 'This week', ''],
    ['month', 'This month', ''],
    ['later', 'Later', ''],
    ['earlier', 'Earlier', ''],
    ['archived', 'Archived', ''],
  ];
  function groupOf(x) {
    if (x.archived) return 'archived';
    if (!x.date) return 'nodate';
    var wk = startOfWeek(dateOf(TODAY));
    var d = dateOf(x.date);
    if (d < wk) return 'earlier';
    if (d <= addDays(wk, 6)) return 'week';
    if (d.getFullYear() === NOW.getFullYear() && d.getMonth() === NOW.getMonth()) return 'month';
    return 'later';
  }
  function byGroup(vis) {
    return GROUPS.map(function (g) {
      var ps = vis.filter(function (x) {
        return groupOf(x) === g[0];
      });
      ps.sort(function (a, b) {
        if (!a.date || !b.date) return 0;
        return g[0] === 'earlier' ? stamp(b) - stamp(a) : stamp(a) - stamp(b);
      });
      return { g: g, ps: ps };
    }).filter(function (o) {
      return o.ps.length;
    });
  }
  function groupHead(o) {
    var shut = !!S.shut[o.g[0]];
    return '<button type="button" class="cal-group__head" data-cal="group" data-arg="' + o.g[0] + '" aria-expanded="' + !shut + '"><span class="cal-group__chev">' + ic('chevD', 13) + '</span><h2>' + o.g[1] + '</h2><b>' + o.ps.length + '</b>' + (o.g[2] ? '<span>' + o.g[2] + '</span>' : '') + '</button>';
  }
  function byStage(vis) {
    return STAGES.map(function (s) {
      return {
        s: s,
        ps: vis
          .filter(function (x) {
            return x.stage === s.k;
          })
          .sort(function (a, b) {
            if (!a.date) return -1;
            if (!b.date) return 1;
            return s.k === 'published' ? stamp(b) - stamp(a) : stamp(a) - stamp(b);
          }),
      };
    });
  }

  // ---------------------------------------------------------------- A · Plain
  // a white card lifted off the sheet: the thumbnail beside two lines of title,
  // the time and the tag under both
  function postA(x) {
    var a = attention(x);
    return (
      '<button type="button" class="cal-pa' + (a ? ' is-' + a.k : '') + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" data-hover="' + x.id + '"' + dragAttr(x) + '>' +
      '<span class="cal-pa__top">' + thumb(x, 'is-pa') + '<span class="cal-pa__title">' + esc(x.title) + '</span></span><span class="cal-pa__meta">' + timeBits(x) + tagLine(x) + '</span></button>'
    );
  }
  function monthA() {
    var g = monthGrid();
    var cells = g.days
      .map(function (d) {
        var s = ymd(d);
        var posts = onDay(s);
        return (
          '<div class="cal-day' + dayCls(d, s) + '" data-day="' + s + '"><div class="cal-day__head"><span class="cal-day__n">' + d.getDate() + '</span>' + dayPlus(s) + '</div><div class="cal-posts">' +
          posts.slice(0, 2).map(postA).join('') + (posts.length > 2 ? moreBtn(posts.length - 2, s) : '') + '</div></div>'
        );
      })
      .join('');
    return '<section class="cal-sheet" aria-label="' + periodLabel() + '">' + renderLegend([g.from, g.to]) + dowHead() + '<div class="cal-month" style="--weeks:' + g.weeks + '">' + cells + '</div></section>';
  }
  function weekA() {
    return weekGrid(postA, '', 58);
  }
  // -------------------------------------------------------------- B · Picture
  function badges(x) {
    var a = attention(x);
    if (a && a.k === 'fix') return '<span class="cal-badge is-fix">' + ic('warn', 10) + a.t + '</span>';
    return '<span class="cal-badge">' + shortTime(x.time) + '</span>' + (a ? '<span class="cal-badge is-ask">Approve</span>' : '');
  }
  // the post's picture as a cover across the day, its title and tag under it
  function postB(x, more, s) {
    return (
      '<div class="cal-pb' + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '"><button type="button" class="cal-pb__btn" data-cal="open" data-arg="' + x.id + '" data-hover="' + x.id + '"' + dragAttr(x) + '>' +
      '<span class="cal-pb__cover' + (x.img ? '' : ' is-none') + '">' + (x.img ? '<img src="' + x.img + '" alt="" draggable="false">' : art(x)) + '<span class="cal-badges">' + badges(x) + '</span></span>' +
      '<span class="cal-pb__title"><i class="cal-dot"></i><span>' + esc(x.title) + '</span></span>' + tagLine(x) + '</button>' +
      (more ? '<button type="button" class="cal-pb__more" data-cal="pop-day" data-arg="' + s + '">+' + more + '</button>' : '') + '</div>'
    );
  }
  function monthB() {
    var g = monthGrid();
    var cells = g.days
      .map(function (d) {
        var s = ymd(d);
        var posts = onDay(s);
        return '<div class="cal-day' + dayCls(d, s) + '" data-day="' + s + '"><div class="cal-day__head"><span class="cal-day__n">' + d.getDate() + '</span>' + dayPlus(s) + '</div>' + (posts.length ? postB(posts[0], posts.length - 1, s) : '') + '</div>';
      })
      .join('');
    return '<section class="cal-sheet cal-sb" aria-label="' + periodLabel() + '">' + renderLegend([g.from, g.to]) + dowHead() + '<div class="cal-month" style="--weeks:' + g.weeks + '">' + cells + '</div></section>';
  }
  function weekB() {
    return weekGrid(function (x) {
      return postB(x, 0, x.date);
    }, 'cal-sb', 93);
  }
  // --------------------------------------------------------------- C · Agenda
  function dayCard(x) {
    var a = attention(x);
    var acts = '';
    if (x.approve) acts += '<button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="open" data-arg="' + x.id + '">Review</button>';
    if (a && a.t === 'Missed') {
      acts += '<button type="button" class="cal-btn cal-btn--sm" data-cal="schedule" data-arg="' + x.id + '">New time</button>';
      if (!x.approve) acts += '<button type="button" class="cal-link" data-cal="pick" data-arg="' + x.id + '">Let Vicino pick</button>';
    }
    return (
      '<article class="cal-cpost' + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" role="button" tabindex="0"' + dragAttr(x) + '>' + thumb(x, 'is-c') +
      '<div class="cal-cpost__main"><span class="cal-cpost__time">' + x.time + '</span><h3' + longTitle(x) + '>' + esc(x.title) + '</h3>' + stateWord(x) + (x.tags.length ? tagChips(x) : '') + (acts ? '<div class="cal-cpost__acts">' + acts + '</div>' : '') + '</div></article>'
    );
  }
  function dayPane(s) {
    var d = dateOf(s);
    var posts = onDay(s);
    var after = visible()
      .filter(function (x) {
        return x.date && x.date > s && x.stage !== 'published';
      })
      .sort(function (a, b) {
        return stamp(a) - stamp(b);
      })
      .slice(0, 4);
    return (
      '<aside class="cal-cpane" aria-label="' + longDate(d) + '"><header class="cal-cpane__head"><div><h2>' + DOW[d.getDay()] + ', ' + short(d) + '</h2><span>' + (s === TODAY ? 'Today · ' : '') + (posts.length ? posts.length + ' post' + (posts.length === 1 ? '' : 's') : 'No posts') + '</span></div>' +
      '<div class="cal-cpane__acts">' + (s >= TODAY ? '<button type="button" class="cal-btn cal-btn--sm" data-cal="plan" data-arg="' + s + '">' + ic('plus', 12) + 'Plan</button>' : '') + '<button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="day-close" aria-label="Close this day">' + ic('close', 13) + '</button></div></header>' +
      (posts.length ? '<div class="cal-cpane__posts">' + posts.map(dayCard).join('') + '</div>' : '<p class="cal-cpane__none">' + (s >= TODAY ? 'Nothing planned for this day.' : 'Nothing went out this day.') + '</p>') +
      (after.length
        ? '<div class="cal-cpane__next"><h3>After this day</h3>' +
          after
            .map(function (x) {
              return '<button type="button" class="cal-cnext" style="--st:' + stageOf(x).c + '" data-cal="day-pick" data-arg="' + x.date + '"><b>' + short(dateOf(x.date)) + '</b><i class="cal-dot"></i><span>' + esc(x.title) + '</span></button>';
            })
            .join('') +
          '</div>'
        : '') +
      '</aside>'
    );
  }
  // the post's stage colour with its picture fading in from the left, the time on the
  // picture, two lines of title and the tag beside it
  function postC(x) {
    var a = attention(x);
    return (
      '<button type="button" class="cal-pc' + (a ? ' is-' + a.k : '') + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" data-hover="' + x.id + '"' + dragAttr(x) + '>' +
      '<span class="cal-pc__bleed' + (x.img ? '' : ' is-none') + '">' + (x.img ? '<img src="' + x.img + '" alt="" draggable="false">' : art(x)) + '</span><span class="cal-pc__time">' + shortTime(x.time) + '</span>' +
      '<span class="cal-pc__txt"><span class="cal-pc__title">' + esc(x.title) + '</span><span class="cal-pc__meta">' +
      (a ? (a.k === 'fix' ? '<span class="cal-bit is-fix">' + ic('warn', 10) + a.t + '</span>' : askBit()) : '') + tagLine(x) + '</span></span></button>'
    );
  }
  // one sheet read week by week: each week says what it holds at its left
  function monthC() {
    var g = monthGrid();
    var open = !S.rail && S.dayOpen && S.dayOpen >= g.from && S.dayOpen <= g.to ? S.dayOpen : null;
    var rows = '';
    for (var w = 0; w < g.weeks; w++) {
      var days = g.days.slice(w * 7, (w + 1) * 7);
      var now = ymd(days[0]) <= TODAY && TODAY <= ymd(days[6]);
      var inWeek = 0;
      var cells = days
        .map(function (d) {
          var s = ymd(d);
          var posts = onDay(s);
          inWeek += posts.length;
          var show = posts.slice(0, 2);
          return (
            '<div class="cal-cd' + dayCls(d, s) + (s === open ? ' is-sel' : '') + '" data-day="' + s + '" data-cal="day-pick" data-arg="' + s + '" role="button" tabindex="0" aria-pressed="' + (s === open) + '" aria-label="Open ' + longDate(d) + '"><div class="cal-day__head"><span class="cal-day__n">' + d.getDate() + '</span>' + dayPlus(s) + '</div><div class="cal-posts">' +
            show.map(postC).join('') + (posts.length > show.length ? moreBtn(posts.length - show.length, s) : '') + '</div></div>'
          );
        })
        .join('');
      rows += '<div class="cal-cw' + (now ? ' is-now' : '') + '"><div class="cal-cw__label"><b>' + (now ? 'This week' : short(days[0])) + '</b><span>' + (inWeek ? inWeek + ' post' + (inWeek === 1 ? '' : 's') : 'No posts') + '</span></div>' + cells + '</div>';
    }
    return (
      '<div class="cal-ccal' + (open ? ' has-pane' : '') + '"><section class="cal-sheet cal-sc" aria-label="' + periodLabel() + '">' + renderLegend([g.from, g.to]) +
      '<div class="cal-cw cal-cw--head"><span></span>' + DOW.map(function (n) { return '<span>' + n.slice(0, 3) + '</span>'; }).join('') + '</div><div class="cal-cweeks">' + rows + '</div></section>' + (open ? dayPane(open) : '') + '</div>'
    );
  }
  function weekC() {
    return weekGrid(postC, 'cal-sc', 54);
  }
  // ------------------------------------------------- List and Board, in every design
  // the columns draft/campaign's list has, with a post's tags under its title
  // where its campaign used to be implied
  function stageCell(x) {
    var a = attention(x);
    var why = x.fail ? esc(x.fail) : 'Needs your approval';
    return (
      '<span class="cal-stage"><span class="cal-pill is-' + x.stage + '"><i></i>' + stageOf(x).name + '</span>' +
      (a && (a.k === 'ask' || x.fail) ? '<span class="cal-pill is-' + a.k + '" title="' + why + '">' + (a.k === 'fix' ? ic('warn', 11) : ic('stamp', 11)) + (a.k === 'ask' ? 'Needs approval' : a.t) + (x.flagged ? '<em title="Flagged">' + ic('warn', 11) + '</em>' : '') + '</span>' : '') +
      '</span>'
    );
  }
  // no time yet is a blank, with the time Vicino would put there under it
  function vicinoSlot(x) {
    if (x.archived) return '';
    var first = suggestions(x.id)[0];
    if (!first) return '';
    return '<button type="button" class="cal-aislot" data-cal="pick" data-arg="' + x.id + '" title="Use Vicino’s recommended time">' + ic('wand', 11) + '<span>' + short(dateOf(first.date)) + ', ' + first.time + '</span></button>';
  }
  function schedCell(x) {
    if (!x.date) return '<span class="cal-sched is-none"><span class="cal-nodash">– –</span>' + vicinoSlot(x) + '</span>';
    var d = dateOf(x.date);
    var late = missed(x);
    var day = S.design === 'c' ? '<b class="cal-sched__n">' + d.getDate() + '</b><span class="cal-sched__txt"><b>' + DOW[d.getDay()].slice(0, 3) + ', ' + MONTHS[d.getMonth()].slice(0, 3) + '</b>' : '<span class="cal-sched__txt"><b>' + short(d) + '</b>';
    return '<span class="cal-sched' + (late ? ' is-late' : '') + '"' + (late ? ' title="Missed its time"' : '') + '>' + day + '<span>' + x.time + (late ? ' · Missed' : '') + '</span></span></span>';
  }
  function chanMark() {
    return '<span class="cal-chan" title="X" aria-label="X">' + X_LOGO + '</span>';
  }
  function listRow(x) {
    var fmt = FORMATS[x.fmt];
    return (
      '<div class="cal-lrow' + (S.sel.indexOf(x.id) > -1 ? ' is-sel' : '') + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" role="button" tabindex="0">' +
      '<span class="cal-lrow__pic">' + thumb(x, 'is-l') + checkBox(x) + '</span>' +
      '<div class="cal-lrow__main"><span class="cal-lrow__title"' + longTitle(x) + '>' + esc(x.title) + '</span>' + tagCell(x) + '</div>' +
      '<span class="cal-lrow__owner">' + avatar(x) + '</span>' + stageCell(x) +
      '<span class="cal-lrow__fmt">' + ic(fmt[1], 13) + fmt[0] + '</span>' + schedCell(x) +
      '<span class="cal-lrow__chan">' + chanMark() + '</span>' + rowActs(x) + '</div>'
    );
  }
  function renderList() {
    var vis = visible();
    if (!vis.length) return emptyView();
    return (
      '<section class="cal-ls" aria-label="Posts by time"><div class="cal-colhead"><span></span><span>Post</span><span class="is-owner">Owner</span><span>Stage</span><span class="is-fmt">Format</span><span>Planned time</span><span class="is-chan">Channel</span></div>' +
      byGroup(vis)
        .map(function (o) {
          return '<section class="cal-group' + (S.shut[o.g[0]] ? ' is-shut' : '') + '">' + groupHead(o) + (S.shut[o.g[0]] ? '' : '<div class="cal-group__rows">' + o.ps.map(listRow).join('') + '</div>') + '</section>';
        })
        .join('') +
      '</section>'
    );
  }
  // draft/campaign's card in three layers: the picture says what it is, then the
  // title, then under a line the time, the tags and whose it is
  function boardWhen(x) {
    if (!x.date) return '<div class="cal-bc__when is-none"><span class="cal-nodash">– –</span>' + vicinoSlot(x) + '</div>';
    var late = missed(x);
    return '<div class="cal-bc__when' + (late ? ' is-late' : '') + '"><span>' + short(dateOf(x.date)) + ' · ' + x.time + '</span>' + (late ? '<b>Missed</b>' : '') + '</div>';
  }
  // in a condition's column the condition goes without saying, so the chip says
  // which stage the post is in
  function boardChip(x, inCond) {
    var flagged = x.flagged ? '<em title="Flagged">' + ic('warn', 11) + '</em>' : '';
    if (inCond) return '<span class="cal-bc__chip cal-bc__cond"><i style="background:' + stageOf(x).c + '"></i>' + stageOf(x).name + flagged + '</span>';
    var a = attention(x);
    if (!a || !(a.k === 'ask' || x.fail)) return '';
    return '<span class="cal-bc__chip cal-bc__cond is-' + a.k + '"' + (x.fail ? ' title="' + esc(x.fail) + '"' : '') + '>' + ic(a.k === 'fix' ? 'warn' : 'stamp', 11) + (a.k === 'ask' ? 'Needs approval' : a.t) + flagged + '</span>';
  }
  function boardCard(x, inCond) {
    var fmt = FORMATS[x.fmt];
    return (
      '<article class="cal-bc' + (x.archived ? ' is-archived' : '') + '" style="--st:' + stageOf(x).c + '" data-cal="open" data-arg="' + x.id + '" role="button" tabindex="0"><div class="cal-bc__media' + (x.img ? '' : ' is-none') + '">' +
      (x.img ? '<img src="' + x.img + '" alt="" draggable="false">' : art(x)) +
      '<span class="cal-bc__chip cal-bc__kind" title="X · ' + fmt[0] + '">' + X_LOGO + fmt[0] + '</span>' +
      boardChip(x, inCond) +
      '</div><h3' + longTitle(x) + '>' + esc(x.title) + '</h3>' +
      '<div class="cal-bc__foot">' + boardWhen(x) + '<div class="cal-bc__row">' + tagCell(x) + avatar(x) + '</div></div>' + (x.archived ? '<span class="cal-acts is-on"><button type="button" class="cal-btn cal-btn--sm" data-cal="restore" data-arg="' + x.id + '">Restore</button></span>' : '') + '</article>'
    );
  }
  // draft/campaign hangs these off the right of its five stages: not places a post
  // moves through but conditions it is in, so a post is here and in its stage too.
  // A sliver of the first stays on screen, which says the board goes further.
  var CONDS = [
    { name: 'Needs approval', c: 'var(--cyan-600)', none: 'Nothing needs approval', has: toApprove },
    {
      name: 'Failed',
      c: 'var(--cd-warn)',
      none: 'Nothing has failed',
      has: function (x) {
        return !x.archived && !!x.fail && x.fail !== 'Stopped';
      },
    },
  ];
  function boardCol(name, c, ps, none, inCond) {
    return (
      '<div class="cal-bd__col' + (inCond ? ' is-cond' : '') + '" style="--st:' + c + '"><header class="cal-lanehead"><i></i><h2>' + name + '</h2><b>' + ps.length + '</b></header><div class="cal-bd__cards">' +
      (ps
        .map(function (x) {
          return boardCard(x, inCond);
        })
        .join('') || '<p class="cal-bd__none">' + none + '</p>') +
      '</div></div>'
    );
  }
  function renderBoard() {
    var vis = visible();
    if (!vis.length) return emptyView();
    return (
      '<section class="cal-bd" aria-label="Posts by stage">' +
      byStage(vis)
        .map(function (l) {
          return boardCol(l.s.name, l.s.c, l.ps, 'Nothing in this stage', false);
        })
        .join('') +
      CONDS.map(function (o) {
        var ps = vis.filter(o.has).sort(function (a, b) {
          if (!a.date) return -1;
          if (!b.date) return 1;
          return stamp(a) - stamp(b);
        });
        return boardCol(o.name, o.c, ps, o.none, true);
      }).join('') +
      '</section>'
    );
  }

  // ------------------------------------------------- the row in the Prototype panel
  var DESIGN_SAY = {
    a: 'Calendar: the full grid, a post a white card lifted off it. List: one white sheet with hairlines between rows. Board: a grey well for each column.',
    b: 'Calendar: week lines only, a post its picture as a cover. List and Board: no sheet, each post its own white card on the page, led by a large picture.',
    c: 'Calendar: read week by week, a post fading from its picture into its stage colour. List: one card for each stretch of time. Board: a soft well for each column, in its colour. Click a calendar day to open it beside the month.',
  };
  function swSeg(opts, cur, act) {
    return (
      '<div class="cd-sw__seg" role="group">' +
      opts
        .map(function (o) {
          return '<button type="button" class="cd-sw__opt' + (o[0] === cur ? ' is-on' : '') + '" data-cal="' + act + '" data-arg="' + o[0] + '">' + o[1] + '</button>';
        })
        .join('') +
      '</div>'
    );
  }
  API.panelRows = function () {
    return (
      '<div class="cd-sw__row"><span class="cd-sw__label">Page design</span>' + swSeg([['a', 'A · Plain'], ['b', 'B · Picture'], ['c', 'C · Agenda']], S.design, 'design') + '<p class="cd-sw__desc">' + DESIGN_SAY[S.design] + '</p></div>' +
      '<div class="cd-sw__row"><span class="cd-sw__label">Calendar view</span>' + swSeg([['design', 'From the design'], ['current', 'Current']], S.calView, 'cal-view') + '<p class="cd-sw__desc">' + (S.calView === 'current' ? 'The calendar as it was before these designs, with the List and Board of the design above.' : 'The calendar drawn the design’s way. Current keeps the calendar as it was.') + '</p></div>'
    );
  };
  API.panelTag = function () {
    return 'Design ' + S.design.toUpperCase();
  };

  function emptyView() {
    return '<section class="cal-sheet cal-empty"><b>No posts match</b><span>Try fewer filters, or clear them.</span><button type="button" class="cal-btn cal-btn--soft cal-btn--sm" data-cal="f-clear-all">Clear all</button></section>';
  }

  // ------------------------------------------------------------- the Needs you rail
  function eligibleBriefs() {
    return POSTS.filter(function (x) {
      return toApprove(x) && x.approve === 'brief' && x.fmt !== 'video' && !x.flagged && !missed(x);
    });
  }

  function railRow(x, kind) {
    var d = x.date ? dateOf(x.date) : null;
    var late = missed(x);
    var line = '';
    if (kind === 'fix') {
      line = x.fail ? x.fail + '. Regenerate it in the post.' : 'Still not ready ' + hoursLate(x) + ' hours after its planned time, so nothing published.';
    } else if (kind === 'approve') {
      line = late ? 'Was due ' + short(d) + ', ' + x.time : 'Publishes ' + short(d) + ', ' + x.time;
    } else line = 'A brief with no date';
    return (
      '<article class="cal-rrow" data-rail-post="' + x.id + '">' +
      '<div class="cal-rrow__top"><span class="cal-kind is-plain">' + (x.approve === 'brief' ? 'Brief' : x.approve === 'content' ? 'Content' : stageOf(x).name) + '</span>' +
      (x.flagged ? '<span class="cal-flagged">' + ic('warn', 10) + 'Flagged</span>' : '') +
      (late && kind === 'approve' ? '<span class="cal-missed">Missed its time</span>' : '') + xMark() + '</div>' +
      '<button type="button" class="cal-rrow__title" data-cal="open" data-arg="' + x.id + '">' + esc(x.title) + '</button>' +
      '<p class="cal-rrow__line' + (kind === 'fix' ? ' is-warn' : '') + '">' + (kind === 'fix' ? ic('warn', 11) : '') + '<span>' + esc(line) + '</span></p>' +
      (x.tags.length ? tagChips(x) : '') +
      '<div class="cal-rrow__acts">' +
      (kind === 'nodate'
        ? '<button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="schedule" data-arg="' + x.id + '">Schedule</button><button type="button" class="cal-link" data-cal="pick" data-arg="' + x.id + '">Let Vicino pick a time</button>'
        : kind === 'fix'
          ? (x.fail
            ? '<button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="open" data-arg="' + x.id + '">Open the post</button>'
            : '<button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="schedule" data-arg="' + x.id + '">Choose a new time</button><button type="button" class="cal-link" data-cal="pick" data-arg="' + x.id + '">Let Vicino pick</button>') +
            '<button type="button" class="cal-link cal-link--quiet" data-cal="archive" data-arg="' + x.id + '">Archive</button>'
          : '<button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="open" data-arg="' + x.id + '">Review</button>' +
            (late
              ? '<button type="button" class="cal-link" data-cal="schedule" data-arg="' + x.id + '">New time</button><button type="button" class="cal-link" data-cal="pick" data-arg="' + x.id + '">Let Vicino pick</button><button type="button" class="cal-link cal-link--quiet" data-cal="archive" data-arg="' + x.id + '">Archive</button>'
              : '')) +
      '</div></article>'
    );
  }

  function renderRail() {
    if (!S.rail) return '';
    var approve = POSTS.filter(toApprove);
    var fix = POSTS.filter(needsFix);
    var nod = POSTS.filter(noDate);
    var body = '';
    if (S.rail === 'approve') {
      var shown = approve.filter(function (x) {
        return S.apType === 'all' || x.approve === S.apType;
      });
      var ok = eligibleBriefs();
      var videos = approve.filter(function (x) {
        return x.approve === 'brief' && x.fmt === 'video';
      }).length;
      var solo = approve.filter(function (x) {
        return x.approve === 'content' || x.flagged || (missed(x) && x.fmt !== 'video');
      }).length;
      body =
        '<div class="cal-rail__sub">' +
        seg([['all', 'All ' + approve.length], ['brief', 'Brief ' + approve.filter(function (x) { return x.approve === 'brief'; }).length], ['content', 'Content ' + approve.filter(function (x) { return x.approve === 'content'; }).length]], S.apType, 'ap-type', 'cal-seg--sm') +
        '</div>' +
        (S.apType !== 'content'
          ? '<div class="cal-batch-note"><button type="button" class="cal-btn cal-btn--soft cal-btn--sm cal-batch-note__btn" data-cal="approve-briefs"' + (ok.length ? '' : ' disabled') + '>Approve displayed briefs (' + ok.length + ')</button><p>' +
            [videos ? videos + ' video' + (videos === 1 ? '' : 's') + ' left out: review the storyboard in each brief' : '', solo ? solo + ' post' + (solo === 1 ? '' : 's') + ' need' + (solo === 1 ? 's' : '') + ' individual review' : ''].filter(Boolean).join('. ') +
            '.</p></div>'
          : '') +
        shown
          .sort(function (a, b) {
            return stamp(a) - stamp(b);
          })
          .map(function (x) {
            return railRow(x, 'approve');
          })
          .join('');
    } else if (S.rail === 'fix') {
      body =
        fix
          .sort(function (a, b) {
            return stamp(a) - stamp(b);
          })
          .map(function (x) {
            return railRow(x, 'fix');
          })
          .join('') || '<p class="cal-rail__none">Nothing needs fixing.</p>';
    } else {
      body =
        nod
          .map(function (x) {
            return railRow(x, 'nodate');
          })
          .join('') || '<p class="cal-rail__none">Every post has a time.</p>';
    }
    return (
      '<aside class="cal-rail" aria-label="Needs you"><header class="cal-rail__head"><h2>Needs you</h2><button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="rail-close" aria-label="Close">' + ic('close', 13) + '</button></header>' +
      '<div class="cal-rail__tabs">' + seg([['approve', 'To approve ' + approve.length], ['fix', 'Need fixing ' + fix.length], ['nodate', 'No date ' + nod.length]], S.rail, 'rail-tab', 'cal-seg--sm cal-seg--fill') + '</div>' +
      '<div class="cal-rail__body" id="cal-rail-body">' + body + '</div></aside>'
    );
  }

  // ------------------------------------------------------------ selection (List)
  function renderSelBar() {
    if (!S.sel.length || S.view !== 'list') return '';
    var ps = S.sel.map(byId);
    var briefs = ps.filter(function (x) {
      return x.approve === 'brief' && x.fmt !== 'video' && !x.flagged;
    }).length;
    var gen = ps.filter(function (x) {
      return x.stage === 'brief' && !x.approve;
    }).length;
    return (
      '<div class="cal-selbar" role="toolbar" aria-label="Selected posts"><b>' + ps.length + ' selected</b>' +
      '<button type="button" class="cal-selbar__btn" data-cal="pop-tagsel">' + ic('tag', 12) + 'Add tag</button>' +
      (gen ? '<button type="button" class="cal-selbar__btn" data-cal="sel-gen">Generate (' + gen + ')</button>' : '') +
      (briefs ? '<button type="button" class="cal-selbar__btn" data-cal="sel-approve">Approve briefs (' + briefs + ')</button>' : '') +
      '<button type="button" class="cal-selbar__btn" data-cal="sel-archive">' + ic('archive', 12) + 'Archive</button>' +
      '<button type="button" class="cal-selbar__x" data-cal="sel-clear" aria-label="Clear the selection">' + ic('close', 13) + '</button></div>'
    );
  }

  // ---------------------------------------------------------------- render
  function view() {
    var g = S.design.toUpperCase();
    if (S.view === 'list') return renderList();
    if (S.view === 'board') return renderBoard();
    if (S.calView === 'current') return S.mode === 'week' ? weekGrid(chip, '', 52) : renderMonth();
    return VIEWS[(S.mode === 'week' ? 'week' : 'month') + g]();
  }

  function render() {
    var top = root.scrollTop;
    var rb = document.getElementById('cal-rail-body');
    var railTop = rb ? rb.scrollTop : 0;
    var bd = root.querySelector('.cal-bd');
    var bdLeft = bd ? bd.scrollLeft : 0;
    var active = document.activeElement && document.activeElement.id === 'cal-q';
    var caret = active ? document.activeElement.selectionStart : 0;
    root.innerHTML =
      '<div class="cal' + (S.rail ? ' has-rail' : '') + '" data-design="' + S.design + '" data-cal-view="' + (S.calView === 'current' ? 'current' : 'design') + '">' + renderHead() + renderInsights() + renderBar() + renderActive() + renderTagBand() +
      '<div class="cal-body"><div class="cal-view" id="cal-view" data-view="' + S.view + '">' + view() + '</div>' + renderRail() + '</div>' + renderSelBar() + '</div>';
    root.scrollTop = top;
    var rb2 = document.getElementById('cal-rail-body');
    if (rb2) rb2.scrollTop = railTop;
    var bd2 = root.querySelector('.cal-bd');
    if (bd2) bd2.scrollLeft = bdLeft;
    if (active) {
      var q = document.getElementById('cal-q');
      q.focus();
      q.setSelectionRange(caret, caret);
    }
    var badge = document.getElementById('cal-nav-badge');
    if (badge) {
      var n = POSTS.filter(toApprove).length;
      badge.textContent = n || '';
      badge.style.display = n ? '' : 'none';
    }
    writeHash();
    renderLayer();
    syncDrawerTags();
  }

  // ------------------------------------------------------------------ the layer
  var layer = document.createElement('div');
  layer.id = 'cal-layer';
  layer.className = 'pulse-ds';
  document.body.appendChild(layer);
  var hoverEl = document.createElement('div');
  hoverEl.className = 'pulse-ds cal-hover';
  hoverEl.hidden = true;
  document.body.appendChild(hoverEl);

  function renderLayer() {
    // a part only animates when it first appears, not on each redraw
    var had = {
      pop: !!layer.querySelector('.cal-pop'),
      modal: !!layer.querySelector('.cal-modal'),
      toast: !!layer.querySelector('.cal-toast'),
    };
    layer.innerHTML = renderPop() + renderModal() + renderToast();
    Object.keys(had).forEach(function (k) {
      var el = layer.querySelector('.cal-' + k);
      if (el && !had[k]) el.classList.add('is-enter');
    });
    placePop();
    var af = layer.querySelector('[data-autofocus]');
    if (af && !layer.contains(document.activeElement)) {
      af.focus();
      if (af.setSelectionRange) af.setSelectionRange(af.value.length, af.value.length);
    }
  }

  function placePop() {
    var el = layer.querySelector('.cal-pop');
    if (!el || !S.pop || !S.pop.rect) return;
    var r = S.pop.rect;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    var left = S.pop.right ? r.right - w : r.left;
    left = Math.max(12, Math.min(window.innerWidth - w - 12, left));
    var top = r.bottom + 8;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  function toast(html, opts) {
    opts = opts || {};
    clearTimeout(toast.t);
    S.toast = { html: html, undo: opts.undo || null };
    toast.t = setTimeout(function () {
      S.toast = null;
      renderLayer();
    }, opts.ms || 5200);
  }
  function renderToast() {
    if (!S.toast) return '';
    return (
      '<div class="cal-toast" role="status"><i class="cal-toast__ico">' + ic('check', 12) + '</i><span>' + S.toast.html + '</span>' +
      (S.toast.undo ? '<button type="button" class="cal-link" data-cal="undo">Undo</button>' : '') +
      '</div>'
    );
  }
  function snap() {
    return JSON.stringify(POSTS);
  }

  // ------------------------------------------------------------------ popovers
  function miniCal(month, picked, act) {
    var first = new Date(month.getFullYear(), month.getMonth(), 1);
    var start = startOfWeek(first);
    var days = '';
    for (var i = 0; i < 42; i++) {
      var d = addDays(start, i);
      var s = ymd(d);
      days += '<button type="button" class="cal-mini__d' + (d.getMonth() !== month.getMonth() ? ' is-out' : '') + (s === TODAY ? ' is-today' : '') + (s === picked ? ' is-on' : '') + '" data-cal="' + act + '" data-arg="' + s + '">' + d.getDate() + '</button>';
    }
    return (
      '<div class="cal-mini"><div class="cal-mini__head"><button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="mini-prev" aria-label="Previous month">' + ic('chevL', 13) + '</button><b>' + MONTHS[month.getMonth()] + ' ' + month.getFullYear() + '</b><button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="mini-next" aria-label="Next month">' + ic('chevR', 13) + '</button></div>' +
      '<div class="cal-mini__dow">' + DOW.map(function (n) { return '<span>' + n[0] + '</span>'; }).join('') + '</div><div class="cal-mini__grid">' + days + '</div></div>'
    );
  }

  function tagRows(checked, act) {
    var q = (S.pop.q || '').toLowerCase();
    return TAGS.filter(function (t) {
      return !q || t.name.toLowerCase().indexOf(q) > -1;
    })
      .map(function (t) {
        var on = checked.indexOf(t.id) > -1;
        var n = POSTS.filter(function (x) {
          return !x.archived && x.tags.indexOf(t.id) > -1;
        }).length;
        return (
          '<div class="cal-tagrow"><button type="button" class="cal-tagrow__main" data-cal="' + act + '" data-arg="' + t.id + '" aria-pressed="' + on + '">' + tagGlyph(t.c, 14) + '<span>' + esc(t.name) + '</span><small>' + n + '</small><em class="cal-tagrow__tick' + (on ? ' is-on' : '') + '">' + ic('check', 12) + '</em></button>' +
          '<button type="button" class="cal-tagrow__edit" data-cal="tag-edit" data-arg="' + t.id + '" title="Edit this tag" aria-label="Edit ' + esc(t.name) + '">' + ic('pencil', 11) + '</button></div>'
        );
      })
      .join('');
  }

  function renderPop() {
    var P = S.pop;
    if (!P) return '';
    if (P.type === 'jump') return '<div class="cal-pop cal-pop--mini">' + miniCal(P.month, ymd(S.cursor), 'jump') + '<div class="cal-pop__foot"><button type="button" class="cal-link" data-cal="today">Go to today</button></div></div>';
    if (P.type === 'tags') {
      var q = (P.q || '').trim();
      var exact = TAGS.some(function (t) {
        return t.name.toLowerCase() === q.toLowerCase();
      });
      return (
        '<div class="cal-pop cal-pop--tags"><label class="cal-pop__search">' + ic('search', 13) + '<input id="cal-tagq" type="text" placeholder="Search or create a tag" value="' + esc(q) + '" data-autofocus></label>' +
        '<div class="cal-pop__k"><span>Tags ' + TAGS.length + '</span>' + (S.tags.length ? '<button type="button" class="cal-link" data-cal="tags-none">Show all</button>' : '') + '</div><div class="cal-pop__list" id="cal-taglist">' + tagRows(S.tags, 'tag-toggle') +
        (q ? '' : '<div class="cal-tagrow"><button type="button" class="cal-tagrow__main" data-cal="tag-toggle" data-arg="none" aria-pressed="' + (S.tags.indexOf('none') > -1) + '">' + tagGlyph('var(--surface-3)', 14) + '<span>No tag</span><small>' + POSTS.filter(function (x) { return !x.archived && !x.tags.length; }).length + '</small><em class="cal-tagrow__tick' + (S.tags.indexOf('none') > -1 ? ' is-on' : '') + '">' + ic('check', 12) + '</em></button></div>') +
        '</div><div class="cal-pop__foot">' +
        '<button type="button" class="cal-link" data-cal="tag-new" data-arg="' + esc(q && !exact ? q : '') + '">' + ic('plus', 12) + (q && !exact ? 'Create “' + esc(q) + '”' : 'New tag') + '</button></div></div>'
      );
    }
    if (P.type === 'tagpost') {
      var cur = P.plan ? S.modal.tags : P.ids.length === 1 ? byId(P.ids[0]).tags : [];
      var q2 = (P.q || '').trim();
      var exact2 = TAGS.some(function (t) {
        return t.name.toLowerCase() === q2.toLowerCase();
      });
      return (
        '<div class="cal-pop cal-pop--tags"><label class="cal-pop__search">' + ic('search', 13) + '<input id="cal-tagq" type="text" placeholder="Add a tag" value="' + esc(q2) + '" data-autofocus></label><div class="cal-pop__list" id="cal-taglist">' + tagRows(cur, 'tag-post') + '</div>' + (P.plan ? '' : '<div class="cal-pop__foot"><button type="button" class="cal-link" data-cal="tag-new" data-arg="' + esc(q2 && !exact2 ? q2 : '') + '">' + ic('plus', 12) + (q2 && !exact2 ? 'Create “' + esc(q2) + '”' : 'New tag') + '</button></div>') + '</div>'
      );
    }
    if (P.type === 'filter') {
      var groups = [
        ['stage', STAGES.map(function (s) { return [s.k, s.name]; })],
        ['cond', [['approval', 'Needs approval'], ['failed', 'Failed']]],
        ['format', [['video', 'Vertical video'], ['carousel', 'Carousel'], ['text', 'Text post']]],
        ['owner', [[ME, ME], [UNA, UNA]]],
        ['risk', [['Not assessed', 'Not assessed'], ['Low', 'Low'], ['Medium', 'Medium'], ['High', 'High']]],
        ['time', [['missed', 'Missed its time'], ['set', 'Time set'], ['none', 'Unscheduled']]],
      ];
      return (
        '<div class="cal-pop cal-pop--filter"><div class="cal-filter__head"><b>Filter</b>' + (filterCount() ? '<button type="button" class="cal-link" data-cal="f-clear">Clear all</button>' : '') + '</div>' +
        '<div class="cal-filter__g"><span>Channel</span><div><span class="cal-fopt is-on is-fixed">' + xMark() + 'X</span></div></div>' +
        groups
          .map(function (g) {
            return (
              '<div class="cal-filter__g"><span>' + F_NAME[g[0]] + '</span><div>' +
              g[1]
                .map(function (o) {
                  var on = S.f[g[0]].indexOf(o[0]) > -1;
                  return '<button type="button" class="cal-fopt' + (on ? ' is-on' : '') + '" data-cal="f-toggle" data-arg="' + g[0] + ':' + esc(o[0]) + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
                })
                .join('') +
              '</div></div>'
            );
          })
          .join('') +
        '<div class="cal-filter__g cal-filter__g--last"><span>Archived</span><div><button type="button" class="cal-fopt' + (S.showArchived ? ' is-on' : '') + '" data-cal="archived-toggle">Show archived posts</button></div></div></div>'
      );
    }
    if (P.type === 'day') {
      var d = dateOf(P.day);
      return (
        '<div class="cal-pop cal-pop--day"><div class="cal-pop__k"><b>' + DOW[d.getDay()] + ', ' + short(d) + '</b>' + (P.day >= TODAY ? '<button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="plan" data-arg="' + P.day + '" title="Plan a post on this day" aria-label="Plan a post on this day">' + ic('plus', 13) + '</button>' : '') + '</div><div class="cal-pop__day">' + onDay(P.day).map(S.calView === 'current' ? chip : S.design === 'c' ? postC : postA).join('') + '</div></div>'
      );
    }
    return '';
  }

  // -------------------------------------------------------------------- dialogs
  var TIMES = (function () {
    var out = [];
    for (var h = 6; h < 23; h++) {
      [0, 30].forEach(function (m) {
        out.push((h % 12 || 12) + ':' + pad2(m) + ' ' + (h < 12 ? 'AM' : 'PM'));
      });
    }
    return out;
  })();

  function nearestGap(date, time, except) {
    var t = dateOf(date);
    t.setMinutes(minutes(time));
    var best = Infinity;
    POSTS.forEach(function (x) {
      if (x.id === except || !x.date || x.archived || x.stage === 'published') return;
      best = Math.min(best, Math.abs(stamp(x) - t) / 36e5);
    });
    return best;
  }
  function suggestions(id) {
    var out = [];
    var d = addDays(dateOf(TODAY), 1);
    for (var i = 0; i < 14 && out.length < 3; i++) {
      ['10:00 AM', '5:00 PM'].forEach(function (t) {
        if (out.length >= 3) return;
        var s = ymd(addDays(d, i));
        var gap = nearestGap(s, t, id);
        if (gap >= 3) out.push({ date: s, time: t, gap: Math.round(gap) });
      });
    }
    return out;
  }
  function slotName(s) {
    return (s.date === ymd(addDays(dateOf(TODAY), 1)) ? 'Tomorrow' : dowShort(dateOf(s.date))) + ' · ' + s.time;
  }

  function renderModal() {
    var M = S.modal;
    if (!M) return '';
    var inner = '';
    if (M.type === 'schedule') {
      var x = byId(M.id);
      var sug = suggestions(M.id);
      inner =
        '<div class="cal-modal__card" role="dialog" aria-modal="true" aria-label="Schedule"><span class="cal-modal__k">' + (x.date ? 'New time' : 'Schedule') + '</span><h3>' + esc(x.title) + '</h3>' +
        '<p class="cal-modal__say">Times are in New York time. Suggested times are at least 3 hours from your other posts. They are defaults, not engagement predictions.</p>' +
        '<div class="cal-modal__label">Suggested times</div><div class="cal-slots">' +
        sug
          .map(function (s, i) {
            return '<button type="button" class="cal-slot' + (M.date === s.date && M.time === s.time ? ' is-on' : '') + '" data-cal="slot" data-arg="' + i + '"><b>' + slotName(s) + '</b><span>' + s.gap + ' hours from the nearest scheduled post</span></button>';
          })
          .join('') +
        '</div><div class="cal-modal__label">Or pick an exact time</div><div class="cal-exact"><button type="button" class="cal-field" data-cal="field-date">' + ic('calendar', 13) + (M.date ? dowShort(dateOf(M.date)) : 'Pick a date') + '</button><button type="button" class="cal-field" data-cal="field-time">' + ic('clock', 13) + esc(M.time || 'Pick a time') + '</button>' +
        (M.field === 'date' ? '<div class="cal-drop cal-drop--date">' + miniCal(M.month, M.date, 'pick-date') + '</div>' : '') +
        (M.field === 'time' ? '<div class="cal-drop cal-drop--time">' + TIMES.map(function (t) { return '<button type="button" class="cal-drop__t' + (t === M.time ? ' is-on' : '') + '" data-cal="pick-time" data-arg="' + t + '">' + t + '</button>'; }).join('') + '</div>' : '') +
        '</div><div class="cal-modal__foot"><button type="button" class="cal-btn cal-btn--flat" data-cal="modal-close">Cancel</button><button type="button" class="cal-btn cal-btn--ink" data-cal="schedule-go"' + (M.date && M.time ? '' : ' disabled') + '>Schedule</button></div></div>';
    }
    if (M.type === 'plan') {
      inner =
        '<div class="cal-modal__card cal-modal__card--plan" role="dialog" aria-modal="true" aria-label="Plan a post"><header class="cal-plan__head"><span class="vorb" style="width:26px;height:26px"><span class="vorb__halo"></span><span class="vorb__core"></span></span><h3>Plan a post with Vicino</h3><button type="button" class="cal-iconbtn cal-iconbtn--sm" data-cal="modal-close" aria-label="Close">' + ic('close', 13) + '</button></header>' +
        '<div class="cal-plan__box"><textarea id="cal-plan-text" rows="4" data-autofocus aria-label="What this post should do">' + esc(M.text) + '</textarea><div class="cal-plan__row">' +
        '<button type="button" class="cal-field cal-field--sm" data-cal="plan-date">' + ic('calendar', 12) + (M.date ? dowShort(dateOf(M.date)) : 'No date yet') + '</button>' +
        M.tags
          .map(function (id) {
            var t = tagOf(id);
            return t ? '<button type="button" class="cal-tag cal-tag--btn" data-cal="plan-untag" data-arg="' + id + '" title="Take this tag off">' + tagGlyph(t.c, 11) + esc(t.name) + ic('close', 9) + '</button>' : '';
          })
          .join('') +
        '<button type="button" class="cal-tag cal-tag--add" data-cal="pop-tagplan">' + ic('plus', 10) + 'Tag</button><span class="cal-grow"></span><button type="button" class="cal-send" data-cal="plan-go" aria-label="Send to Vicino">' + ic('send', 15) + '</button>' +
        (M.field === 'date' ? '<div class="cal-drop cal-drop--date cal-drop--up">' + miniCal(M.month, M.date, 'plan-pick') + '</div>' : '') +
        '</div></div><p class="cal-plan__note">Vicino asks what you need, checks the time against your other posts, then drafts the brief onto the calendar.</p></div>';
    }
    if (M.type === 'tag') {
      var cnt = M.auto && M.rule.trim() ? autoMatches(M.rule, M.id).length : 0;
      inner =
        '<div class="cal-modal__card" role="dialog" aria-modal="true" aria-label="' + (M.id ? 'Edit tag' : 'New tag') + '"><span class="cal-modal__k">Tag</span><h3>' + (M.id ? 'Edit this tag' : 'New tag') + '</h3><p class="cal-modal__say">A tag keeps related posts together, like everything for one sale. Filter by it to see them all.</p>' +
        '<label class="cal-modal__label" for="cal-tag-name">Name</label><input id="cal-tag-name" class="cal-input" type="text" placeholder="Winter sale" value="' + esc(M.name) + '" data-autofocus>' +
        '<div class="cal-modal__label">Colour</div><div class="cal-swatches">' +
        TAG_COLORS.map(function (c) {
          return '<button type="button" class="cal-swatch' + (c === M.c ? ' is-on' : '') + '" style="--c:' + c + '" data-cal="tag-color" data-arg="' + c + '" aria-label="Colour" aria-pressed="' + (c === M.c) + '"></button>';
        }).join('') +
        '</div><div class="cal-modal__label">How posts get it</div>' +
        seg([['hand', 'I add it myself'], ['auto', 'Vicino adds it']], M.auto ? 'auto' : 'hand', 'tag-how', 'cal-seg--sm') +
        (M.auto
          ? '<label class="cal-modal__label" for="cal-tag-rule">Add it to posts about</label><input id="cal-tag-rule" class="cal-input" type="text" placeholder="winter, cold-season stock" value="' + esc(M.rule) + '"><p class="cal-modal__hint" id="cal-tag-hint">' + hintFor(cnt) + '</p>'
          : '') +
        '<div class="cal-modal__foot">' + (M.id ? '<button type="button" class="cal-link cal-link--quiet cal-modal__del" data-cal="tag-delete">Delete tag</button>' : '') + '<button type="button" class="cal-btn cal-btn--flat" data-cal="modal-close">Cancel</button><button type="button" class="cal-btn cal-btn--ink" data-cal="tag-save">' + (M.id ? 'Save' : 'Create tag') + '</button></div></div>';
    }
    return '<div class="cal-modal" data-cal="modal-scrim">' + inner + '</div>';
  }
  function hintFor(n) {
    return n ? 'New posts about this get the tag. ' + n + ' post' + (n === 1 ? '' : 's') + ' you already have would get it too.' : 'New posts about this get the tag.';
  }
  function autoMatches(rule, except) {
    var words = rule
      .toLowerCase()
      .split(',')
      .map(function (w) {
        return w.trim();
      })
      .filter(Boolean);
    return POSTS.filter(function (x) {
      if (x.archived || (except && x.tags.indexOf(except) > -1)) return false;
      var t = x.title.toLowerCase();
      return words.some(function (w) {
        return t.indexOf(w) > -1;
      });
    });
  }

  // ------------------------------------------------------------------ opening a post
  function whereOf(x) {
    if (x.stage === 'published') return 'published';
    if (x.stage === 'publication') return 'scheduled';
    if (x.stage === 'review') return 'review';
    if (x.stage === 'producing') return x.fail && x.fail !== 'Stopped' ? 'failed' : 'generating';
    return x.fmt === 'video' && !x.approve ? 'unplanned' : 'planned';
  }
  function tagList(x) {
    return x.tags.map(tagOf).filter(Boolean);
  }
  // the post the drawer has open; with no post from this page, its sample post
  function drawerPost() {
    return byId(S.opened ? S.opened.id : 'p1');
  }
  var drawerTags = '';
  function syncDrawerTags() {
    var list = tagList(drawerPost());
    var key = JSON.stringify(list);
    if (key === drawerTags) return;
    drawerTags = key;
    API.setTags(list);
  }
  // the times the drawer offers when you approve or change a post's time
  function slotsFor(x) {
    var out = x.date && !missed(x) ? [{ when: whenText(x), note: 'The time you planned' }] : [];
    suggestions(x.id).forEach(function (s) {
      if (out.length < 3) out.push({ when: short(dateOf(s.date)) + ' · ' + s.time, note: (out.length ? '' : 'Vicino’s pick · ') + s.gap + ' hours from your nearest post' });
    });
    return out;
  }

  function openPost(id) {
    var x = byId(id);
    if (!x) return;
    hideHover();
    S.pop = null;
    S.opened = { id: id, where: whereOf(x) };
    renderLayer();
    drawerTags = JSON.stringify(tagList(x));
    S.opened.when = API.open({
      title: x.title,
      format: x.fmt,
      where: S.opened.where,
      when: whenText(x),
      stopped: x.fail === 'Stopped',
      slots: slotsFor(x),
      tags: tagList(x),
    }).when;
  }
  // what happened in the drawer comes back to the calendar
  API.onClose = function (snap2) {
    var o = S.opened;
    S.opened = null;
    if (!o) return;
    var x = byId(o.id);
    if (!x) return;
    var before = snap();
    var now = snap2.gen === 'stopped' && snap2.brief === 'generating' ? 'stopped' : snap2.brief;
    if (now !== o.where) {
      if (now === 'generating' || now === 'stopped') {
        x.stage = 'producing';
        x.approve = null;
        x.fail = now === 'stopped' ? 'Stopped' : null;
      } else if (now === 'review') {
        x.stage = 'review';
        x.approve = 'content';
        x.fail = null;
      } else if (now === 'scheduled') {
        x.stage = 'publication';
        x.approve = null;
        x.fail = null;
      } else if (now !== 'failed' && now !== 'published') {
        // back in the brief: reopened, cancelled, or newly planned
        x.stage = 'brief';
        x.fail = null;
        x.approve = now === 'planned' ? 'brief' : null;
      }
    }
    var w = snap2.when !== o.when && /^([A-Z][a-z]{2}) (\d+) · (.+)$/.exec(snap2.when || '');
    if (w) {
      var mo = MONTHS.map(function (m) {
        return m.slice(0, 3);
      }).indexOf(w[1]);
      if (mo > -1) {
        x.date = ymd(new Date(2026, mo, +w[2]));
        x.time = w[3];
      }
    }
    if (snap2.archived) {
      x.archived = true;
      toast('<b>Archived.</b> It leaves the calendar. You can restore it from Filter.', { undo: before });
    }
    render();
  };
  API.onTagAdd = function (el) {
    if (S.pop && S.pop.type === 'tagpost') return;
    var r = el.getBoundingClientRect();
    var id = drawerPost().id;
    // after this click has finished: a click outside closes an open popover
    setTimeout(function () {
      S.pop = { type: 'tagpost', ids: [id], rect: r };
      render();
    }, 0);
  };
  API.onTagRemove = function (tagId) {
    var x = drawerPost();
    x.tags = x.tags.filter(function (t) {
      return t !== tagId;
    });
    render();
  };

  // ------------------------------------------------------------------ hover card
  var hoverT = null;
  var hoverOut = null;
  function hideHover() {
    clearTimeout(hoverT);
    clearTimeout(hoverOut);
    hoverEl.hidden = true;
    hoverEl.innerHTML = '';
  }
  function showHover(id, anchor) {
    var x = byId(id);
    if (!x) return;
    var fmt = FORMATS[x.fmt];
    var late = missed(x);
    hoverEl.innerHTML =
      '<div class="cal-hover__in">' +
      (x.img ? '<span class="cal-hover__img"><img src="' + x.img + '" alt=""></span>' : '') +
      '<div class="cal-hover__top">' + pill(x) + (late ? '<span class="cal-missed">Missed its time</span>' : '') + '</div><h4>' + esc(x.title) + '</h4>' +
      '<p class="cal-hover__meta">' + ic('clock', 11) + whenText(x) + '<i></i>' + ic(fmt[1], 11) + fmt[0] + '<i></i>' + xMark() + '</p>' +
      (x.tags.length ? tagChips(x) : '') +
      '<div class="cal-hover__acts"><button type="button" class="cal-btn cal-btn--ink cal-btn--sm" data-cal="open" data-arg="' + x.id + '">Open</button>' +
      (x.stage !== 'published' ? '<button type="button" class="cal-link" data-cal="schedule" data-arg="' + x.id + '">Change time</button>' : '') +
      '<button type="button" class="cal-link" data-cal="pop-tagpost" data-arg="' + x.id + '">Add tag</button></div></div>';
    hoverEl.hidden = false;
    var r = anchor.getBoundingClientRect();
    var w = hoverEl.offsetWidth;
    var h = hoverEl.offsetHeight;
    var left = r.right + 8;
    if (left + w > window.innerWidth - 12) left = r.left - w - 8;
    var top = Math.max(12, Math.min(window.innerHeight - h - 12, r.top - 6));
    hoverEl.style.left = Math.max(12, left) + 'px';
    hoverEl.style.top = top + 'px';
  }

  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest ? e.target.closest('[data-hover]') : null;
    if (t) {
      clearTimeout(hoverOut);
      clearTimeout(hoverT);
      if (S.drag) return;
      hoverT = setTimeout(function () {
        if (document.contains(t)) showHover(t.getAttribute('data-hover'), t);
      }, 420);
      return;
    }
    if (e.target.closest && e.target.closest('.cal-hover')) {
      clearTimeout(hoverOut);
      return;
    }
    clearTimeout(hoverT);
    if (!hoverEl.hidden) {
      clearTimeout(hoverOut);
      hoverOut = setTimeout(hideHover, 160);
    }
  });

  // ---------------------------------------------------------------- doing things
  function openPop(type, el, extra) {
    var o = extra || {};
    o.type = type;
    o.rect = el.getBoundingClientRect();
    S.pop = o;
    render();
  }

  function setSchedule(x, date, time, label) {
    var before = snap();
    x.date = date;
    x.time = time;
    S.modal = null;
    toast('<b>' + esc(label || 'Scheduled') + '</b> for ' + dowShort(dateOf(date)) + ' · ' + time + '.', { undo: before });
    render();
  }

  function act(name, arg, el, ev) {
    var x;
    var before;
    switch (name) {
      // ---- views
      case 'view':
        S.view = arg;
        S.pop = null;
        S.sel = arg === 'list' ? S.sel : [];
        render();
        return;
      case 'mode':
        S.mode = arg;
        render();
        return;
      case 'prev':
      case 'next':
        var dir = name === 'prev' ? -1 : 1;
        S.cursor = S.mode === 'week' ? addDays(S.cursor, 7 * dir) : new Date(S.cursor.getFullYear(), S.cursor.getMonth() + dir, 1);
        render();
        return;
      case 'today':
        S.cursor = dateOf(TODAY);
        S.pop = null;
        render();
        return;
      case 'pop-jump':
        if (S.pop && S.pop.type === 'jump') {
          S.pop = null;
          render();
          return;
        }
        openPop('jump', el, { month: new Date(S.cursor.getFullYear(), S.cursor.getMonth(), 1) });
        return;
      case 'mini-prev':
      case 'mini-next':
        var step = name === 'mini-prev' ? -1 : 1;
        var holder = S.modal && S.modal.field === 'date' ? S.modal : S.pop;
        holder.month = new Date(holder.month.getFullYear(), holder.month.getMonth() + step, 1);
        renderLayer();
        return;
      case 'jump':
        S.cursor = dateOf(arg);
        S.pop = null;
        render();
        return;

      // ---- the design being looked at
      case 'design':
        S.design = arg;
        S.pop = null;
        hideHover();
        render();
        API.refreshPanel();
        return;
      case 'cal-view':
        S.calView = arg;
        render();
        API.refreshPanel();
        return;
      case 'day-pick':
        // from the list under the panel a day stays open, and may be next month
        S.dayOpen = S.dayOpen === arg && !el.classList.contains('cal-cnext') ? null : arg;
        S.rail = null;
        var grid = monthGrid();
        if (arg < grid.from || arg > grid.to) S.cursor = new Date(dateOf(arg).getFullYear(), dateOf(arg).getMonth(), 1);
        render();
        return;
      case 'day-close':
        S.dayOpen = null;
        render();
        return;

      case 'group':
        S.shut[arg] = !S.shut[arg];
        render();
        return;

      // ---- the rail
      case 'rail':
        S.rail = S.rail === arg ? null : arg;
        render();
        return;
      case 'rail-tab':
        S.rail = arg;
        document.getElementById('cal-rail-body').scrollTop = 0;
        render();
        return;
      case 'rail-close':
        S.rail = null;
        render();
        return;
      case 'ap-type':
        S.apType = arg;
        render();
        return;
      case 'approve-briefs':
        before = snap();
        var ok = eligibleBriefs();
        ok.forEach(function (b) {
          b.stage = 'producing';
          b.approve = null;
        });
        toast('<b>' + ok.length + ' brief' + (ok.length === 1 ? '' : 's') + ' approved.</b> Vicino is generating ' + (ok.length === 1 ? 'it' : 'them') + '. This uses credits.', { undo: before });
        render();
        return;

      // ---- insights
      case 'insights':
        S.insights = !S.insights;
        render();
        return;
      case 'insight-gone':
        S.goneInsights.push(arg);
        toast('<b>Removed.</b> Vicino won’t suggest this one again this week.');
        render();
        return;
      case 'insight-back':
        S.goneInsights = [];
        render();
        return;
      case 'plan-insight':
        var ins = INSIGHTS.filter(function (i) {
          return i.id === arg;
        })[0];
        var it = TAGS.filter(function (t) {
          return t.name === ins.tag;
        })[0];
        S.modal = { type: 'plan', date: null, tags: it ? [it.id] : [], month: dateOf(TODAY), title: ins.title, text: 'Plan a post from this week’s signal: “' + ins.title + '.” Suggest the angle and a clear time, then draft the brief.' };
        render();
        return;

      // ---- open
      case 'open':
        openPost(arg);
        return;

      // ---- filters
      case 'pop-tags':
        if (S.pop && S.pop.type === 'tags') {
          S.pop = null;
          render();
          return;
        }
        openPop('tags', el, { right: true });
        return;
      case 'pop-filter':
        if (S.pop && S.pop.type === 'filter') {
          S.pop = null;
          render();
          return;
        }
        openPop('filter', el, { right: true });
        return;
      case 'tag-toggle':
        S.tags = S.tags.indexOf(arg) > -1 ? S.tags.filter(function (t) { return t !== arg; }) : S.tags.concat([arg]);
        render();
        return;
      case 'tags-none':
        S.tags = [];
        render();
        return;
      case 'f-stage':
        toggleF('stage', arg);
        render();
        return;
      case 'f-toggle':
        var ft = arg.split(':');
        toggleF(ft[0], ft.slice(1).join(':'));
        render();
        return;
      case 'f-off':
        var fo = arg.split(':');
        toggleF(fo[0], fo.slice(1).join(':'));
        render();
        return;
      case 'f-clear':
        Object.keys(S.f).forEach(function (k) {
          S.f[k] = [];
        });
        S.showArchived = false;
        render();
        return;
      case 'f-clear-all':
        Object.keys(S.f).forEach(function (k) {
          S.f[k] = [];
        });
        S.showArchived = false;
        S.tags = [];
        S.q = '';
        render();
        return;
      case 'archived-toggle':
        S.showArchived = !S.showArchived;
        render();
        return;
      case 'pop-day':
        openPop('day', el, { day: arg });
        return;

      // ---- time
      case 'schedule':
        x = byId(arg);
        hideHover();
        S.pop = null;
        S.modal = { type: 'schedule', id: arg, date: x.date && !missed(x) ? x.date : null, time: x.date && !missed(x) ? x.time : null, field: null, month: dateOf(x.date && !missed(x) ? x.date : TODAY) };
        render();
        return;
      case 'slot':
        var sl = suggestions(S.modal.id)[+arg];
        S.modal.date = sl.date;
        S.modal.time = sl.time;
        S.modal.field = null;
        renderLayer();
        return;
      case 'field-date':
        S.modal.field = S.modal.field === 'date' ? null : 'date';
        renderLayer();
        return;
      case 'field-time':
        S.modal.field = S.modal.field === 'time' ? null : 'time';
        renderLayer();
        var on = layer.querySelector('.cal-drop__t.is-on');
        if (on) on.scrollIntoView({ block: 'center' });
        return;
      case 'pick-date':
        S.modal.date = arg;
        S.modal.field = null;
        renderLayer();
        return;
      case 'pick-time':
        S.modal.time = arg;
        S.modal.field = null;
        renderLayer();
        return;
      case 'schedule-go':
        setSchedule(byId(S.modal.id), S.modal.date, S.modal.time);
        return;
      case 'pick':
        x = byId(arg);
        var first = suggestions(arg)[0];
        setSchedule(x, first.date, first.time, 'Vicino picked a time:');
        return;
      case 'archive':
        before = snap();
        byId(arg).archived = true;
        toast('<b>Archived.</b> It leaves the calendar. You can restore it from Filter.', { undo: before });
        render();
        return;
      case 'restore':
        byId(arg).archived = false;
        toast('<b>Restored.</b>');
        render();
        return;
      case 'undo':
        var old = JSON.parse(S.toast.undo);
        POSTS.length = 0;
        old.forEach(function (o) {
          POSTS.push(o);
        });
        S.toast = null;
        render();
        return;

      // ---- list selection
      case 'sel':
        S.sel = S.sel.indexOf(arg) > -1 ? S.sel.filter(function (i) { return i !== arg; }) : S.sel.concat([arg]);
        render();
        return;
      case 'sel-clear':
        S.sel = [];
        render();
        return;
      case 'sel-gen':
        before = snap();
        var gs = S.sel.map(byId).filter(function (b) {
          return b.stage === 'brief' && !b.approve;
        });
        gs.forEach(function (b) {
          b.stage = 'producing';
        });
        S.sel = [];
        toast('<b>Generating ' + gs.length + ' post' + (gs.length === 1 ? '' : 's') + '.</b> This uses credits.', { undo: before });
        render();
        return;
      case 'sel-approve':
        before = snap();
        var bs = S.sel.map(byId).filter(function (b) {
          return b.approve === 'brief' && b.fmt !== 'video' && !b.flagged;
        });
        bs.forEach(function (b) {
          b.stage = 'producing';
          b.approve = null;
        });
        S.sel = [];
        toast('<b>' + bs.length + ' brief' + (bs.length === 1 ? '' : 's') + ' approved.</b> This uses credits.', { undo: before });
        render();
        return;
      case 'sel-archive':
        before = snap();
        var n = S.sel.length;
        S.sel.forEach(function (i) {
          byId(i).archived = true;
        });
        S.sel = [];
        toast('<b>' + n + ' post' + (n === 1 ? '' : 's') + ' archived.</b>', { undo: before });
        render();
        return;

      // ---- tags
      case 'pop-tagpost':
        hideHover();
        openPop('tagpost', el, { ids: [arg] });
        return;
      case 'pop-tagsel':
        openPop('tagpost', el, { ids: S.sel.slice() });
        return;
      case 'pop-tagplan':
        openPop('tagpost', el, { ids: [], plan: true });
        return;
      case 'tag-post':
        var ids = S.pop.ids;
        if (S.pop.plan) {
          S.modal.tags = S.modal.tags.indexOf(arg) > -1 ? S.modal.tags.filter(function (t) { return t !== arg; }) : S.modal.tags.concat([arg]);
          S.pop = null;
          renderLayer();
          return;
        }
        if (ids.length === 1) {
          x = byId(ids[0]);
          x.tags = x.tags.indexOf(arg) > -1 ? x.tags.filter(function (t) { return t !== arg; }) : x.tags.concat([arg]);
        } else {
          ids.forEach(function (i) {
            var y = byId(i);
            if (y.tags.indexOf(arg) < 0) y.tags = y.tags.concat([arg]);
          });
          S.pop = null;
          S.sel = [];
          toast('<b>' + esc(tagOf(arg).name) + '</b> added to ' + ids.length + ' posts.');
        }
        render();
        return;
      case 'tag-new':
        var from = S.pop;
        S.pop = null;
        S.modal = { type: 'tag', id: null, name: arg || '', c: TAG_COLORS[TAGS.length % TAG_COLORS.length], auto: false, rule: '', forPosts: from && from.ids ? from.ids : null };
        render();
        return;
      case 'tag-edit':
        var te = tagOf(arg);
        S.pop = null;
        S.modal = { type: 'tag', id: te.id, name: te.name, c: te.c, auto: !!te.auto, rule: te.rule || '' };
        render();
        return;
      case 'tag-color':
        S.modal.c = arg;
        renderLayer();
        return;
      case 'tag-how':
        S.modal.auto = arg === 'auto';
        renderLayer();
        return;
      case 'tag-save':
        saveTag();
        return;
      case 'tag-delete':
        var gone = S.modal.id;
        POSTS.forEach(function (q) {
          q.tags = q.tags.filter(function (t) {
            return t !== gone;
          });
        });
        TAGS.splice(
          TAGS.map(function (t) {
            return t.id;
          }).indexOf(gone),
          1
        );
        S.tags = S.tags.filter(function (t) {
          return t !== gone;
        });
        S.modal = null;
        toast('<b>Tag deleted.</b> Its posts stay on the calendar.');
        render();
        return;
      case 'gen-tag':
        before = snap();
        var gt = POSTS.filter(function (q) {
          return !q.archived && q.tags.indexOf(arg) > -1 && q.stage === 'brief' && !q.approve;
        });
        gt.forEach(function (q) {
          q.stage = 'producing';
        });
        toast('<b>Generating ' + gt.length + ' post' + (gt.length === 1 ? '' : 's') + '</b> tagged ' + esc(tagOf(arg).name) + '. This uses credits.', { undo: before });
        render();
        return;

      // ---- planning
      case 'plan':
        hideHover();
        S.pop = null;
        var pd = dateOf(arg);
        S.modal = { type: 'plan', date: arg, tags: S.tags.filter(function (t) { return t !== 'none'; }), month: pd, text: 'Plan a post for ' + longDate(pd) + ' (America/New_York, brand time). Ask me what it should do, check the time I want against my other posts or suggest a clear one, then draft the brief onto the time I pick.' };
        render();
        return;
      case 'plan-tag':
        S.modal = { type: 'plan', date: null, tags: [arg], month: dateOf(TODAY), text: 'Plan a post for ' + tagOf(arg).name + '. Look at the posts it already has, suggest what is missing and a clear time, then draft the brief.' };
        render();
        return;
      case 'plan-date':
        S.modal.field = S.modal.field === 'date' ? null : 'date';
        renderLayer();
        return;
      case 'plan-pick':
        S.modal.date = arg;
        S.modal.field = null;
        renderLayer();
        return;
      case 'plan-untag':
        S.modal.tags = S.modal.tags.filter(function (t) {
          return t !== arg;
        });
        renderLayer();
        return;
      case 'plan-go':
        planGo();
        return;

      // ---- dialogs
      case 'modal-close':
        S.modal = null;
        renderLayer();
        return;
      case 'modal-scrim':
        if (ev.target === el) {
          S.modal = null;
          renderLayer();
        }
        return;
      default:
        return;
    }
  }

  function toggleF(g, v) {
    S.f[g] = S.f[g].indexOf(v) > -1 ? S.f[g].filter(function (o) { return o !== v; }) : S.f[g].concat([v]);
  }

  function saveTag() {
    var M = S.modal;
    var name = M.name.trim();
    if (!name) {
      var inp = document.getElementById('cal-tag-name');
      if (inp) inp.focus();
      return;
    }
    var added = 0;
    if (M.id) {
      var t = tagOf(M.id);
      t.name = name;
      t.c = M.c;
      t.auto = M.auto;
      t.rule = M.rule;
      if (M.auto && M.rule.trim()) {
        autoMatches(M.rule, M.id).forEach(function (x) {
          x.tags = x.tags.concat([M.id]);
          added++;
        });
      }
      toast('<b>' + esc(name) + '</b> saved' + (added ? ', and added to ' + added + ' post' + (added === 1 ? '' : 's') : '') + '.');
    } else {
      var id = 't' + Date.now();
      TAGS.push({ id: id, name: name, c: M.c, auto: M.auto, rule: M.rule });
      if (M.auto && M.rule.trim()) {
        autoMatches(M.rule).forEach(function (x) {
          x.tags = x.tags.concat([id]);
          added++;
        });
      }
      if (M.forPosts) {
        M.forPosts.forEach(function (i) {
          byId(i).tags = byId(i).tags.concat([id]);
          added++;
        });
      }
      toast('<b>' + esc(name) + '</b> created' + (added ? ' and added to ' + added + ' post' + (added === 1 ? '' : 's') : '') + '. Filter by it from Tags.');
    }
    S.modal = null;
    render();
  }

  function planGo() {
    var M = S.modal;
    var title = M.title || (M.date ? 'New post for ' + short(dateOf(M.date)) : 'New post');
    S.modal = null;
    toast('<b>Vicino is drafting the brief…</b>', { ms: 1500 });
    renderLayer();
    var n = p(title, M.date, M.date ? '12:00 PM' : null, 'video', 'brief', { tags: M.tags, owner: ME });
    setTimeout(function () {
      POSTS.push(n);
      S.toast = null;
      if (M.date) S.cursor = dateOf(M.date);
      render();
      openPost(n.id);
    }, 1200);
  }

  // ------------------------------------------------------------------- events
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-cal]') : null;
    var inside = e.target.closest && e.target.closest('.cal-pop, .cal-hover');
    if (S.pop && !inside && !(el && /^(pop-|tag-post|tag-toggle|mini-|f-toggle)/.test(el.getAttribute('data-cal')))) {
      S.pop = null;
      if (!el) {
        renderLayer();
        return;
      }
    }
    if (!el) return;
    var nm = el.getAttribute('data-cal');
    // a button inside a clickable row does its own thing, and only that
    act(nm, el.getAttribute('data-arg'), el, e);
    if (nm !== 'open') e.stopPropagation();
  });

  root.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-cal]')) {
      e.preventDefault();
      act(e.target.getAttribute('data-cal'), e.target.getAttribute('data-arg'), e.target, e);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (S.pop) {
      S.pop = null;
      renderLayer();
    } else if (S.modal) {
      S.modal = null;
      renderLayer();
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'cal-q') {
      S.q = t.value;
      render();
    } else if (t.id === 'cal-tagq' && S.pop) {
      S.pop.q = t.value;
      var caret = t.selectionStart;
      renderLayer();
      var q = document.getElementById('cal-tagq');
      if (q) {
        q.focus();
        q.setSelectionRange(caret, caret);
      }
    } else if (t.id === 'cal-plan-text' && S.modal) {
      S.modal.text = t.value;
    } else if (t.id === 'cal-tag-name' && S.modal) {
      S.modal.name = t.value;
    } else if (t.id === 'cal-tag-rule' && S.modal) {
      S.modal.rule = t.value;
      var h = document.getElementById('cal-tag-hint');
      if (h) h.textContent = hintFor(t.value.trim() ? autoMatches(t.value, S.modal.id).length : 0);
    }
  });

  // drag a post to another day; on the week's timetable, to another time as well
  var dropGuide = document.createElement('i');
  dropGuide.className = 'cal-tg__guide';
  function slotAt(col, y) {
    var from = +col.getAttribute('data-from') * 60;
    var last = +col.getAttribute('data-to') * 60 - 30;
    var top = y - (S.dragY || 0) - col.getBoundingClientRect().top - TG_PAD;
    return Math.max(from, Math.min(last, from + Math.round((top / HOUR) * 2) * 30));
  }
  root.addEventListener('dragstart', function (e) {
    var t = e.target.closest && e.target.closest('[data-drag]');
    if (!t) return;
    S.drag = t.getAttribute('data-drag');
    S.dragY = e.clientY - t.getBoundingClientRect().top;
    hideHover();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', S.drag);
    t.classList.add('is-dragging');
  });
  root.addEventListener('dragover', function (e) {
    if (!S.drag) return;
    var d = e.target.closest && e.target.closest('[data-day]');
    if (!d) return;
    e.preventDefault();
    root.querySelectorAll('.is-drop').forEach(function (c) {
      if (c !== d) c.classList.remove('is-drop');
    });
    d.classList.add('is-drop');
    if (d.hasAttribute('data-from')) {
      var m = slotAt(d, e.clientY);
      dropGuide.style.top = tgTop(m, +d.getAttribute('data-from')) + 'px';
      dropGuide.setAttribute('data-t', clock(m));
      if (dropGuide.parentNode !== d) d.appendChild(dropGuide);
    }
  });
  root.addEventListener('drop', function (e) {
    if (!S.drag) return;
    var d = e.target.closest && e.target.closest('[data-day]');
    var id = S.drag;
    S.drag = null;
    dropGuide.remove();
    if (!d) return;
    e.preventDefault();
    var day = d.getAttribute('data-day');
    var x = byId(id);
    var inGrid = d.hasAttribute('data-from');
    var time = inGrid ? clock(slotAt(d, e.clientY)) : x.time || '12:00 PM';
    if (day < TODAY) {
      toast('<b>That day has passed.</b> Pick today or later.');
      render();
      return;
    }
    var at = dateOf(day);
    at.setMinutes(minutes(time));
    if (inGrid && at < NOW) {
      toast('<b>That time has passed.</b> Pick a later time.');
      render();
      return;
    }
    if (day === x.date && time === x.time) {
      render();
      return;
    }
    setSchedule(x, day, time, 'Moved');
  });
  root.addEventListener('dragend', function () {
    S.drag = null;
    dropGuide.remove();
    root.querySelectorAll('.is-drop, .is-dragging').forEach(function (c) {
      c.classList.remove('is-drop');
      c.classList.remove('is-dragging');
    });
  });

  // the sidebar's Calendar is this page
  var navCal = document.querySelector('.nav-item.active');
  if (navCal)
    navCal.addEventListener('click', function (e) {
      e.preventDefault();
    });

  window.addEventListener('resize', function () {
    hideHover();
    if (S.pop) {
      S.pop = null;
      renderLayer();
    }
  });
  root.addEventListener('scroll', function () {
    hideHover();
    if (S.pop && S.pop.type !== 'tagpost') {
      S.pop = null;
      renderLayer();
    }
  });

  render();
  API.refreshPanel();
})();
