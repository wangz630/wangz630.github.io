/* The prototype's state and everything every design shares: what a click does, the
   icons, the small helpers. The four designs only draw; they read `SG.state` and
   mark their controls with data-act="…" data-id="…". Classic script, no modules,
   so double-clicking index.html works. */
window.SG = (function () {
  var D = window.SG_DATA;
  var DESIGNS = ['now', 'lanes', 'timeline', 'topics'];

  var state = {
    design: 'lanes',
    page: 'market',
    /* Market */
    filter: 'all',
    sort: 'research',
    expanded: { f1: true },
    opened: {},
    hidden: [],
    justHidden: {},
    seeHidden: false,
    ctxFull: false,
    historyOpen: false,
    moreOpen: false,
    trendRun: null,
    research: 'idle',
    researchStep: 0,
    ran: D.market.ran,
    /* Sentiment */
    report: 'latest',
    pastRun: null,
    pickerOpen: false,
    /* which of the v2 page's states: normal, thin, failure */
    sstate: 'normal',
    sinceOpen: false,
    allAttention: false,
    allNew: false,
    morePosts: false,
    basisOpen: false,
    handled: {},
    uncertain: {},
    reportHistory: false,
    addLinkState: 'idle',
    runsFilter: 'all',
    moreQuotes: {},
    openThemes: {},
    readMore: false,
    planPaused: false,
    checking: false,
    cfgDetails: false,
    cfgPlatform: false,
    /* Overlays */
    drawer: null,
    modal: null,
    settings: false,
    chat: null,
    /* Which palette the sentiment split wears */
    palette: 'cyan',
    /* Corner menu */
    menuOpen: false
  };

  /* ---------------------------------------------------------- persisted bits */

  var KEY = 'sg-signal-proto';
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ design: state.design, page: state.page, palette: state.palette, sstate: state.sstate }));
    } catch (e) {}
  }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (DESIGNS.indexOf(saved.design) > -1) state.design = saved.design;
      if (saved.page === 'market' || saved.page === 'sentiment') state.page = saved.page;
      if (saved.palette === 'cyan' || saved.palette === 'product') state.palette = saved.palette;
      if (saved.sstate === 'normal' || saved.sstate === 'thin' || saved.sstate === 'failure') state.sstate = saved.sstate;
    } catch (e) {}
    var q = new URLSearchParams(location.search);
    if (DESIGNS.indexOf(q.get('v')) > -1) state.design = q.get('v');
    if (q.get('p') === 'market' || q.get('p') === 'sentiment') state.page = q.get('p');
    if (q.get('report') === 'past') state.report = 'past';
    if (q.get('palette') === 'product') state.palette = 'product';
    if (q.get('s') === 'normal' || q.get('s') === 'thin' || q.get('s') === 'failure') state.sstate = q.get('s');
    if (state.design === 'timeline') state.sort = 'source';
  }

  /* ----------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* the source snippets carry <strong> from the search result; only that survives */
  function rich(s) {
    return esc(s).replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '</strong>');
  }
  function domain(href) {
    try {
      return new URL(href).hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }
  function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : many || one + 's');
  }
  function finding(id) {
    return D.findings.filter(function (f) {
      return f.id === id;
    })[0];
  }
  function headline(f) {
    return f.short || f.title;
  }
  function report() {
    if (state.sstate === 'thin') return D.v2.thin;
    return D.reports[state.report];
  }
  /* X keeps collecting except in the failure state */
  function collecting() {
    return state.sstate !== 'failure';
  }
  /* what's new since the report. A new high-severity risk is never folded, so the
     normal state is drawn without them and the failure state opens the page on them. */
  function newRisks() {
    if (state.sstate === 'thin') return [];
    if (state.sstate === 'failure') return D.period.risks;
    return D.period.risks.filter(function (r) {
      return r.sev !== 'critical';
    });
  }
  function urgentRisks() {
    return newRisks().filter(function (r) {
      return r.sev === 'critical';
    });
  }
  function sinceLine() {
    if (state.sstate === 'thin') return D.v2.thin.sinceText;
    var n = newRisks().length;
    return D.v2.since.posts + ' new posts · ' + n + ' new risk' + (n === 1 ? '' : 's');
  }
  /* the report's risk rows, whichever report or state */
  function postById(id) {
    return report().risks.filter(function (p) {
      return p.id === id;
    })[0];
  }
  function basis() {
    if (state.sstate === 'thin') return D.v2.thin.basis;
    var r = report();
    return {
      from: 'X ' + r.mix.mentions,
      coverage: state.sstate === 'failure' ? D.v2.basis.coverageFail : D.v2.basis.coverage,
      watches: D.v2.basis.watches,
      summary: D.v2.basis.summary,
      fine: 'Sentiment mix: ' + r.mix.pos + '% positive · ' + r.mix.neu + '% neutral · ' + r.mix.neg + '% negative, by mention. ' + r.mix.posts + ' posts were collected; ' + r.mix.mentions + ' mentions were read from them, since one post can yield several.'
    };
  }
  function trend() {
    return state.sstate === 'thin' ? D.v2.thin.trend : D.v2.trend;
  }
  function risk(id) {
    return D.period.risks.filter(function (r) {
      return r.id === id;
    })[0];
  }
  function theme(id) {
    return report().themes.filter(function (t) {
      return t.id === id;
    })[0];
  }
  function trendItem(id) {
    return D.market.report.items.filter(function (i) {
      return i.id === id;
    })[0];
  }

  /* the feed as the filter and sort leave it, hidden ones out */
  function feed() {
    var list = D.findings.filter(function (f) {
      if (state.hidden.indexOf(f.id) > -1 && !state.justHidden[f.id]) return false;
      return state.filter === 'all' || f.kind === state.filter;
    });
    if (state.sort === 'source') {
      list = list.slice().sort(function (a, b) {
        return (b.postedOrder || 0) - (a.postedOrder || 0);
      });
    }
    return list;
  }
  function counts() {
    var live = D.findings.filter(function (f) {
      return state.hidden.indexOf(f.id) === -1;
    });
    function n(k) {
      return live.filter(function (f) {
        return f.kind === k;
      }).length;
    }
    return { all: live.length, market: n('market'), audience: n('audience'), competitor: n('competitor') };
  }
  /* the page's own question, answered: the findings Signal gave a direction */
  function withDirection(list) {
    return list.filter(function (f) {
      return !!f.dir;
    });
  }
  function withoutDirection(list) {
    return list.filter(function (f) {
      return !f.dir;
    });
  }

  /* Icons: lucide's paths, one stroke set, drawn at the size asked for. */
  var ICON = {
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    spark:
      '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    tick: '<path d="M20 6 9 17l-5-5"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'eye-off':
      '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    sliders:
      '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    bars: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    pie: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
    clip: '<path d="M13.234 20.252 21 12.3"/><path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"/>',
    sort: '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
    layers:
      '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    pointer: '<path d="M12.586 12.586 19 19"/><path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    brain: '<path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>'
  };
  function icon(name, size) {
    var s = size || 16;
    return (
      '<svg class="sg-ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICON[name] || '') +
      '</svg>'
    );
  }
  function xLogo(size) {
    var s = size || 12;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  }

  /* --------------------------------------------------------------- rendering */

  var designs = {};
  var hooks = { afterRender: [] };
  var animateNext = true;

  function main() {
    return document.querySelector('main.signal-shell');
  }

  function render(opts) {
    opts = opts || {};
    var root = document.getElementById('sg-root');
    var shell = document.querySelector('.app-shell');
    if (!root) return;
    var scroller = main();
    var y = scroller.scrollTop;
    var panes = {};
    root.querySelectorAll('[data-keep]').forEach(function (el) {
      panes[el.dataset.keep] = el.scrollTop;
    });
    var focusEl = document.activeElement;
    var focusKey = focusEl && focusEl.dataset && focusEl.dataset.act ? focusEl.dataset.act + '|' + (focusEl.dataset.id || '') : null;

    shell.dataset.sgDesign = state.design;
    shell.dataset.sgPage = state.page;
    shell.dataset.sgPalette = state.palette;
    /* the redesigns read the design system's tokens; Base stays on the captured ones */
    var redesign = state.design !== 'now';
    root.classList.toggle('sg-ds', redesign);
    document.getElementById('sg-overlay').classList.toggle('sg-ds', redesign);
    root.innerHTML = designs[state.design][state.page]();

    root.querySelectorAll('[data-keep]').forEach(function (el) {
      if (panes[el.dataset.keep] != null && !opts.top) el.scrollTop = panes[el.dataset.keep];
    });
    scroller.scrollTop = opts.top ? 0 : y;

    if (focusKey) {
      var parts = focusKey.split('|');
      var again = document.querySelector('#sg-root [data-act="' + parts[0] + '"]' + (parts[1] ? '[data-id="' + parts[1] + '"]' : ''));
      if (again) again.focus({ preventScroll: true });
    }
    hooks.afterRender.forEach(function (fn) {
      fn();
    });
    SG.renderOverlays();
    SG.renderMenu();
    if (opts.animate || animateNext) SG.enter(root);
    animateNext = false;
  }

  /* ------------------------------------------------------------------- toast */

  var toastTimer = null;
  function toast(text) {
    var el = document.getElementById('sg-toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-on');
    }, 3200);
  }

  /* ----------------------------------------------------------------- actions */

  var researchTimer = null;
  function startResearch() {
    if (state.research === 'running') return;
    state.research = 'running';
    state.researchStep = 0;
    render();
    clearInterval(researchTimer);
    researchTimer = setInterval(function () {
      state.researchStep += 1;
      if (state.researchStep >= 8) {
        clearInterval(researchTimer);
        state.research = 'idle';
        state.ran = 'just now';
        render();
        toast('Research finished. No new findings in this prototype.');
        return;
      }
      render();
    }, 700);
  }

  function setDesign(id) {
    if (state.design === id) return;
    /* Timeline's whole point is when a source was posted, so it reads by that */
    if (id === 'timeline') state.sort = 'source';
    else if (state.design === 'timeline') state.sort = 'research';
    state.design = id;
    state.drawer = null;
    state.pickerOpen = false;
    save();
    render({ top: true, animate: true });
  }
  function setPage(id) {
    if (state.page === id) return;
    state.page = id;
    state.drawer = null;
    state.trendRun = null;
    state.pickerOpen = false;
    save();
    render({ top: true, animate: true });
  }
  function setReport(id) {
    state.report = id;
    state.pastRun = null;
    state.pickerOpen = false;
    state.reportHistory = false;
    state.openThemes = {};
    state.moreQuotes = {};
    state.allAttention = false;
    render();
  }

  /* where a [n] chip in the report lands: the theme that quotes post n */
  function themeOfCite(n) {
    var found = null;
    report().themes.forEach(function (t) {
      t.quotes.forEach(function (q) {
        if (q.n === n) found = t;
      });
    });
    return found;
  }

  /* Timeline opens things in place; Lanes and Topics in the drawer */
  function openFinding(id) {
    if (state.design === 'timeline') state.opened[id] = !state.opened[id];
    else state.drawer = { type: 'finding', id: id };
    render();
  }
  function openRisk(id) {
    state.drawer = { type: 'risk', id: id };
    render();
  }
  function openTheme(id) {
    if (state.design === 'timeline') state.openThemes[id] = !state.openThemes[id];
    else state.drawer = { type: 'theme', id: id };
    render();
  }

  /* a chat that belongs to one thing on the page, the way the product words it */
  function askAbout(type, id) {
    var ctx;
    if (type === 'finding') {
      var f = finding(id);
      ctx = {
        title: headline(f),
        prompt: 'What should we do about this finding? ' + f.title + ' Give me your quick read and the options.',
        open: !!f.discussion,
        since: f.discussion
      };
    } else if (type === 'risk') {
      var r = risk(id);
      ctx = {
        title: r.text,
        prompt: 'How should we respond to this ' + (r.sev === 'critical' ? 'critical ' : '') + 'brand risk? ' + r.text + ' What the post says: ' + r.says + ' Seen on X, ' + r.date + '. Give me your quick read and the options.',
        open: !!r.discussion,
        since: r.discussion
      };
    } else if (type === 'theme') {
      var t = theme(id);
      ctx = { title: t.name, prompt: 'What is behind the ' + t.name + ' theme this period? ' + t.summary + ' Give me your quick read and the options.' };
    } else if (type === 'post') {
      var pr = postById(id);
      ctx = { title: pr.text, prompt: 'How should we respond to this risk post? ' + pr.text + ' Seen on X, ' + pr.date + '. Give me your quick read and the options.' };
    } else {
      ctx = { title: 'New chat', prompt: id || '' };
    }
    if (ctx.prompt) {
      var f2 = type === 'finding' ? finding(id) : null;
      var r2 = type === 'risk' ? risk(id) : null;
      if (f2) f2.discussion = f2.discussion || 'started just now';
      if (r2) r2.discussion = r2.discussion || 'started just now';
    }
    state.chat = {
      title: ctx.title,
      msgs: ctx.prompt ? [{ me: true, text: ctx.prompt }, { me: false, sample: true }] : []
    };
    state.drawer = null;
    render();
  }

  var actions = {
    design: function (id) {
      setDesign(id);
    },
    page: function (id) {
      setPage(id);
    },
    filter: function (id) {
      state.filter = id;
      render();
    },
    'finding-toggle': function (id) {
      state.expanded[id] = !state.expanded[id];
      render();
    },
    'finding-open': openFinding,
    /* from a mark on the chart to its row: open it and go there */
    'finding-jump': function (id) {
      state.opened[id] = true;
      render();
      SG.scrollTo('[data-row="' + id + '"]');
    },
    ask: function (id, el) {
      askAbout(el.dataset.type, id);
    },
    ignore: function (id) {
      if (state.hidden.indexOf(id) === -1) state.hidden.push(id);
      state.justHidden[id] = true;
      if (state.drawer && state.drawer.id === id) state.drawer = null;
      render();
    },
    undo: function (id) {
      state.hidden = state.hidden.filter(function (x) {
        return x !== id;
      });
      delete state.justHidden[id];
      render();
    },
    'see-hidden': function () {
      state.seeHidden = !state.seeHidden;
      render();
    },
    'restore-all': function () {
      state.hidden = [];
      state.justHidden = {};
      state.seeHidden = false;
      render();
    },
    'ctx-toggle': function () {
      state.ctxFull = !state.ctxFull;
      render();
    },
    'history-toggle': function () {
      state.historyOpen = !state.historyOpen;
      render();
    },
    'more-toggle': function () {
      state.moreOpen = !state.moreOpen;
      render();
    },
    'research-run': startResearch,
    'research-open': function () {
      state.drawer = { type: 'research' };
      render();
    },
    'post-open': function (id) {
      state.drawer = { type: 'post', id: id };
      render();
    },
    'trend-open': function () {
      state.trendRun = 'r1';
      state.drawer = null;
      render({ top: true });
    },
    'trend-close': function () {
      state.trendRun = null;
      render({ top: true });
    },
    evidence: function (id) {
      state.drawer = { type: 'evidence', id: id };
      render();
    },
    'drawer-close': function () {
      state.drawer = null;
      render();
    },
    'drawer-step': function (id) {
      var d = state.drawer;
      if (!d) return;
      var ids = feed().map(function (f) {
        return f.id;
      });
      var at = ids.indexOf(d.id);
      var to = ids[(at + (+id) + ids.length) % ids.length];
      state.drawer = { type: 'finding', id: to };
      render();
    },
    'risk-open': openRisk,
    'theme-open': openTheme,
    cite: function (id) {
      var t = themeOfCite(+id);
      if (!t) return;
      state.moreQuotes[t.id] = true;
      if (state.design === 'lanes' || state.design === 'topics') state.drawer = { type: 'theme', id: t.id };
      else state.openThemes[t.id] = true;
      state.citeFlash = +id;
      render();
      SG.flashCite(+id);
    },
    'quotes-more': function (id) {
      state.moreQuotes[id] = !state.moreQuotes[id];
      render();
    },
    'picker-toggle': function () {
      state.pickerOpen = !state.pickerOpen;
      render();
    },
    report: setReport,
    'report-history': function () {
      state.pickerOpen = false;
      state.reportHistory = !state.reportHistory;
      render();
      if (state.reportHistory) SG.scrollTo('[data-mark="report-history"]');
    },
    'back-latest': function () {
      setReport('latest');
    },
    'read-more': function () {
      state.readMore = !state.readMore;
      render();
    },
    handle: function (id) {
      state.handled[id] = true;
      render();
    },
    'handle-undo': function (id) {
      delete state.handled[id];
      render();
    },
    us: function (id) {
      state.uncertain[id] = 'counted';
      render();
    },
    'not-us': function (id) {
      state.uncertain[id] = 'dropped';
      render();
    },
    'us-undo': function (id) {
      delete state.uncertain[id];
      render();
    },
    'since-toggle': function () {
      state.sinceOpen = !state.sinceOpen;
      render();
    },
    'all-attention': function () {
      state.allAttention = !state.allAttention;
      render();
    },
    'all-new': function () {
      state.allNew = !state.allNew;
      render();
    },
    'posts-more': function () {
      state.morePosts = !state.morePosts;
      render();
    },
    'basis-toggle': function () {
      state.basisOpen = !state.basisOpen;
      render();
    },
    'add-link': function () {
      state.modal = state.modal === 'addlink' ? null : 'addlink';
      state.addLinkState = 'idle';
      state.settings = false;
      render();
    },
    'add-link-send': function () {
      var input = document.querySelector('[data-link-input]');
      if (input && !input.value.trim()) {
        input.focus();
        return;
      }
      state.addLinkState = 'reading';
      render();
      setTimeout(function () {
        state.modal = null;
        state.addLinkState = 'idle';
        render();
        toast('Added. What Signal finds joins this period’s posts.');
      }, 1400);
    },
    collection: function () {
      state.modal = 'collection';
      state.settings = false;
      render();
    },
    'modal-close': function () {
      state.modal = null;
      render();
    },
    'cfg-details': function () {
      state.cfgDetails = !state.cfgDetails;
      render();
    },
    'cfg-platform': function () {
      state.cfgPlatform = !state.cfgPlatform;
      render();
    },
    'cfg-pause': function () {
      state.planPaused = !state.planPaused;
      render();
    },
    'cfg-check': function () {
      state.checking = true;
      render();
      setTimeout(function () {
        state.checking = false;
        if (state.sstate === 'failure') state.sstate = 'normal';
        render();
        toast('Check finished. X is collecting again.');
      }, 1600);
    },
    'runs-toggle': function () {
      state.drawer = { type: 'runs' };
      state.settings = false;
      render();
    },
    'runs-filter': function (id) {
      state.runsFilter = id;
      render();
    },
    'run-row': function (id) {
      var run = D.runs.filter(function (r) {
        return r.id === id;
      })[0];
      state.pastRun = id;
      state.drawer = null;
      state.report = run.report || state.report;
      render({ top: true });
    },
    settings: function () {
      state.settings = !state.settings;
      render();
    },
    'chat-new': function () {
      state.chat = { title: 'New chat', msgs: [] };
      render();
    },
    'chat-close': function () {
      state.chat = null;
      render();
    },
    'chat-send': function () {
      var ta = document.querySelector('[data-chat-input]');
      var text = ta ? ta.value.trim() : '';
      if (!text) return;
      state.chat.msgs.push({ me: true, text: text });
      state.chat.msgs.push({ me: false, sample: true });
      if (state.chat.title === 'New chat') state.chat.title = text.slice(0, 48);
      render();
    },
    nothing: function () {
      toast('That page isn’t part of this prototype.');
    },
    'set-palette': function (id) {
      state.palette = id;
      save();
      render();
    },
    'set-report': setReport,
    'set-sstate': function (id) {
      state.sstate = id;
      state.pastRun = null;
      state.drawer = null;
      if (id === 'thin') state.report = 'latest';
      if (state.page !== 'sentiment') state.page = 'sentiment';
      save();
      render({ top: true, animate: true });
    },
    'set-research': function (id) {
      if (id === 'running') startResearch();
      else {
        clearInterval(researchTimer);
        state.research = 'idle';
        render();
      }
    },
    'menu-toggle': function () {
      state.menuOpen = !state.menuOpen;
      SG.renderMenu();
    }
  };

  function act(name, id, el) {
    if (actions[name]) actions[name](id, el);
  }

  return {
    data: D,
    state: state,
    designs: designs,
    hooks: hooks,
    DESIGNS: DESIGNS,
    load: load,
    save: save,
    esc: esc,
    rich: rich,
    domain: domain,
    plural: plural,
    finding: finding,
    headline: headline,
    report: report,
    collecting: collecting,
    newRisks: newRisks,
    urgentRisks: urgentRisks,
    sinceLine: sinceLine,
    postById: postById,
    basis: basis,
    trend: trend,
    risk: risk,
    theme: theme,
    trendItem: trendItem,
    feed: feed,
    counts: counts,
    withDirection: withDirection,
    withoutDirection: withoutDirection,
    icon: icon,
    xLogo: xLogo,
    render: render,
    toast: toast,
    act: act,
    setDesign: setDesign,
    setPage: setPage,
    main: main
  };
})();
