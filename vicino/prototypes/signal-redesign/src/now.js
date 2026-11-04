/* Now: the two captures merged into one page, drawn from the data with the product's
   own class names and CSS, so it reads as dev.pulse does today. Every state the
   product has works; nothing here is a proposal. */
(function () {
  var S = window.SG;
  var D = S.data;
  var state = S.state;
  var esc = S.esc;
  var icon = S.icon;

  function head() {
    var market = state.page === 'market';
    var attention = !S.collecting();
    return (
      '<div class="signal-page__head"><h1>Signal</h1><nav class="signal-switcher" aria-label="Signal sections"><span class="signal-switcher__thumb" aria-hidden="true"></span>' +
      '<a class="signal-switcher__tab' + (market ? ' is-active' : '') + '" aria-label="Market" href="#" data-act="page" data-id="market"><span>Market</span><span class="signal-switcher__hint">what’s moving</span></a>' +
      '<a class="signal-switcher__tab' + (!market ? ' is-active' : '') + '" aria-label="Sentiment" href="#" data-act="page" data-id="sentiment"><span>Sentiment</span><span class="signal-switcher__hint">how you’re heard</span></a></nav>' +
      '<a class="signal-settings-link" href="#" data-act="settings">Settings' + (attention ? '<span class="signal-settings-link__health" title="Collection needs attention"><span class="sr-only">— collection needs attention</span></span>' : '') + '</a></div>'
    );
  }

  function card(f, i) {
    if (state.justHidden[f.id]) {
      return '<article class="signal-trends-feed-card"><div class="signal-trends-feed-card__main"><p class="signal-trends-feed-card__claim">Hidden for everyone on the brand. <button type="button" class="signal-trends-quiet-btn" data-act="undo" data-id="' + f.id + '">Undo</button></p></div></article>';
    }
    var open = !!state.expanded[f.id];
    var lead = i === 0;
    var badges = '<span class="signal-trends-feed-badge is-kind" title="' + S.KIND[f.kind].label + (f.entity ? ' · ' + esc(f.entity) : '') + '">' + S.KIND[f.kind].label + (f.entity ? '<span class="signal-trends-feed-badge__entity">' + esc(f.entity) + '</span>' : '') + '</span>';
    if (f.dir === 'watch') badges += '<span class="signal-trends-feed-badge is-watch" title="' + esc(f.watchTitle) + '">Watch</span><span class="signal-trends-feed-card__direction-note is-' + f.dirTone + '">' + esc(f.dirNote) + '</span>';
    if (f.dir === 'opportunity') badges += '<span class="signal-trends-feed-badge is-opportunity" title="Opportunity">Opportunity</span>';
    var date = 'Found ' + f.found + (f.posted ? ' · posted ' + f.posted : '');
    var more = open ? 'Show less' : 'Show more · ' + S.plural(f.sources.length, 'source');
    return (
      '<article class="signal-trends-feed-card' + (lead ? ' is-lead' : '') + ' is-openable' + (open ? '' : ' is-collapsed') + '"><div class="signal-trends-feed-card__main">' +
      (lead && open ? '<p class="signal-trends-feed-card__lead-note">Newest finding, opened for you</p>' : '') +
      '<div class="signal-trends-feed-card__meta">' + badges + '<span class="signal-trends-feed-card__date">' + date + '</span></div>' +
      '<h3 class="signal-trends-feed-card__fact"><button type="button" class="signal-trends-feed-card__open" data-act="finding-toggle" data-id="' + f.id + '">' + esc(f.title) + '</button></h3>' +
      (open
        ? '<div class="signal-trends-feed-card__sources">' + f.sources.map(function (s) {
            return '<a class="signal-trends-ev-chip" href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer"><span class="signal-trends-ev-chip__src">' + esc(s.src) + '</span><span class="signal-trends-ev-chip__title">' + esc(s.title) + '</span></a>';
          }).join('') + '</div>'
        : '') +
      (f.read
        ? open
          ? '<div class="signal-trends-feed-card__read"><span class="signal-trends-feed-card__read-head"><span class="signal-trends-feed-card__read-label">For Shopify</span><span class="signal-trends-feed-card__read-hint">Signal’s read</span></span><p>' + esc(f.read) + '</p></div><div class="signal-trends-feed-card__direction"><span class="signal-trends-feed-card__read-label">A direction to discuss</span><p>' + esc(f.direction) + '</p></div>'
          : '<p class="signal-trends-feed-card__claim">' + esc(f.read) + '</p>'
        : '<p class="signal-trends-feed-card__claim">' + esc(f.claim) + '</p>') +
      '<div class="signal-trends-feed-card__actions">' +
      (f.discussion
        ? '<button type="button" class="signal-trends-quiet-btn signal-trends-discussion-open" data-act="ask" data-type="finding" data-id="' + f.id + '">Discussion open · ' + esc(f.discussion) + '</button>'
        : '<button type="button" class="signal-trends-quiet-btn signal-trends-feed-card__ask" data-act="ask" data-type="finding" data-id="' + f.id + '">Ask Vicino</button>') +
      '<button type="button" class="signal-trends-quiet-btn" aria-expanded="' + open + '" data-act="finding-toggle" data-id="' + f.id + '">' + more + '</button>' +
      '<button type="button" class="signal-trends-quiet-btn signal-trends-feed-card__dismiss" data-act="ignore" data-id="' + f.id + '">' + icon('eye-off', 14) + 'Ignore</button>' +
      '<span class="signal-trends-hide-hint">Hides this finding and the links it cites for everyone on the brand</span></div></div></article>'
    );
  }

  function restore() {
    if (!state.hidden.length) return '';
    var n = state.hidden.length;
    return (
      '<div class="signal-trends-feed__restore"><div class="signal-trends-feed__restore-head"><p class="signal-trends-feed__restore-count">' + (n === 1 ? '1 finding hidden for the brand' : n + ' findings hidden for the brand') + '</p>' +
      '<button type="button" class="signal-trends-quiet-btn signal-trends-feed__restore-toggle" aria-expanded="' + state.seeHidden + '" data-act="see-hidden">See which' + icon(state.seeHidden ? 'chevron-up' : 'chevron-down', 13) + '</button>' +
      '<button type="button" class="signal-trends-pill signal-trends-feed__restore-all" data-act="restore-all">' + icon('undo', 13) + (n === 1 ? 'Restore' : 'Restore all') + '</button></div>' +
      (state.seeHidden
        ? '<ul class="signal-trends-feed__restore-list">' + state.hidden.map(function (id) {
            return '<li class="signal-trends-feed__restore-item"><div class="signal-trends-feed__restore-text"><p class="signal-trends-feed__restore-title">' + esc(S.finding(id).title) + '</p></div><button type="button" class="signal-trends-quiet-btn" data-act="undo" data-id="' + id + '">' + icon('undo', 13) + 'Restore</button></li>';
          }).join('') + '</ul>'
        : '') +
      '</div>'
    );
  }

  function rail() {
    var m = D.market;
    var c = m.context;
    return (
      '<aside class="signal-market-rail" aria-label="Research context"><section class="signal-market-rail__card">' +
      '<a class="brain-attention brain-attention--stacked" href="#" data-act="nothing"><span class="brain-attention__pane" aria-hidden="true"></span><span class="brain-attention__mark" aria-hidden="true">' + icon('brain', 15) + '</span><span class="brain-attention__copy"><strong class="brain-attention__title">' + esc(m.attention.title) + '</strong><span class="brain-attention__line">' + esc(m.attention.line) + '</span></span><span class="brain-attention__move"><span>' + esc(m.attention.move) + '</span>' + icon('arrow-right', 13) + '</span></a>' +
      '<h3>Research context</h3><dl class="signal-market-rail__kv' + (state.ctxFull ? '' : ' is-brief') + '"><div class="signal-market-rail__goal"><dt>Current goal</dt><dd>' + esc(c.goal) + '</dd></div><div><dt>Audience</dt><dd class="signal-market-rail__background">' + esc(c.audience) + '</dd></div><div><dt>Positioning</dt><dd class="signal-market-rail__background">' + esc(c.positioning) + '</dd></div></dl>' +
      '<p class="signal-market-rail__cta"><button type="button" class="signal-trends-quiet-btn" aria-expanded="' + state.ctxFull + '" data-act="ctx-toggle">' + (state.ctxFull ? 'Show less' : 'View full context') + '</button></p><p class="signal-market-rail__foot">' + esc(c.foot) + '</p></section>' +
      '<section class="signal-market-rail__card"><h3>Research scope</h3><ul class="signal-market-rail__chips" aria-label="What the research reads">' + m.scope.chips.map(function (x) {
        return '<li>' + esc(x) + '</li>';
      }).join('') + '</ul><p class="signal-market-rail__stamp">' + esc(m.scope.stamp) + '</p><p class="signal-market-rail__cta"><button type="button" class="signal-trends-quiet-btn" data-act="history-toggle">Research history ›</button></p></section></aside>'
    );
  }

  function history() {
    return (
      '<div class="signal-trends-research-tools"><button type="button" class="signal-trends-quiet-btn" aria-expanded="' + state.historyOpen + '" data-act="history-toggle">Research history</button>' +
      (state.historyOpen
        ? '<div><div class="signal-trends-workspace__secondary"><section class="signal-trends-history"><div class="signal-trends-history__head"><h3>Research runs</h3><span class="signal-trends-history__count">1</span></div><div class="signal-trends-history__table-wrap"><table class="signal-trends-history-table"><thead><tr><th scope="col">Run</th><th scope="col">Window</th><th scope="col">Result</th><th scope="col">Findings</th><th scope="col">Started by</th></tr></thead><tbody>' +
          D.market.runs.map(function (r) {
            return '<tr><td><button type="button" class="signal-trends-history-table__open" data-act="trend-open" data-id="' + r.id + '">' + esc(r.when) + '</button></td><td class="signal-trends-history-table__num">' + esc(r.window) + '</td><td><span class="signal-trends-history-pill is-positive">' + esc(r.result) + '</span></td><td class="signal-trends-history-table__num">' + r.findings + '</td><td class="signal-trends-history-table__trigger">' + esc(r.by) + '</td></tr>';
          }).join('') +
          '</tbody></table></div></section></div></div>'
        : '') +
      '</div>'
    );
  }

  function trend() {
    var r = D.market.report;
    return (
      '<div class="signal-trends-workspace__report-view"><button type="button" class="signal-trends-back-btn" data-act="trend-close">' + icon('arrow-left', 15) + 'Back to feed</button><section class="signal-trends-workspace__report" aria-label="Selected trend report"><div class="signal-trends-report"><section class="signal-trends-report-summary"><div class="signal-trends-report-summary__head"><div><span class="signal-trends-report-summary__kicker">' + icon('calendar', 15) + esc(r.kicker) + '</span><h2>' + esc(r.title) + '</h2><p>' + esc(r.created) + '</p></div><span class="signal-trends-status-badge is-positive">Complete</span></div><p class="signal-trends-report-summary__description">' + esc(r.desc) + '</p><div class="signal-trends-report-metrics">' +
      r.metrics.map(function (m) {
        return '<div class="signal-trends-report-metric"><span class="signal-trends-report-metric__icon" aria-hidden="true">' + icon(m.icon, 17) + '</span><div><span>' + esc(m.label) + '</span><strong>' + esc(m.value) + '</strong><small>' + esc(m.sub) + '</small></div></div>';
      }).join('') +
      '</div></section><section class="signal-trends-findings"><div class="signal-trends-findings__head"><div><span>Evidence-backed findings</span><h2>What is changing</h2></div><p>5 findings cleared the report threshold.</p></div><div class="signal-trends-findings__grid">' +
      r.items.map(function (it) {
        var f = S.finding(it.id);
        return '<div class="signal-trends-finding-card__wrap"><button type="button" class="signal-trends-finding-card" data-act="evidence" data-id="' + it.id + '"><span class="signal-trends-finding-card__rank">' + it.rank + '</span><div class="signal-trends-finding-card__score"><span>Relevance</span><strong>' + f.rel + '%</strong></div><h3>' + esc(f.title) + '</h3><p>' + esc(f.read) + '</p><div class="signal-trends-finding-card__meta"><span title="' + esc(it.src) + '">' + icon('file', 13) + esc(it.src) + '</span><span>' + icon('layers', 13) + S.plural(f.sources.length, 'source') + '</span><span>' + icon('calendar', 13) + esc(it.date) + '</span></div><span class="signal-trends-finding-card__open">View evidence' + icon('arrow-up-right', 14) + '</span></button></div>';
      }).join('') +
      '</div></section></div></section></div>'
    );
  }

  function pills() {
    var c = S.counts();
    return [['all', 'All'], ['market', 'Market'], ['audience', 'Audience'], ['competitor', 'Competitor']].map(function (p) {
      return '<button type="button" class="signal-market-filters__pill" aria-pressed="' + (state.filter === p[0]) + '" data-act="filter" data-id="' + p[0] + '">' + p[1] + '<span class="signal-market-filters__count">' + c[p[0]] + '</span></button>';
    }).join('');
  }

  function market() {
    var m = D.market;
    var list = S.feed();
    var running = state.research === 'running';
    return (
      '<div class="v4-section-inner signal-page"><div class="signal-page__content">' + head() +
      '<div class="signal-trends-workspace"><header class="signal-trends-feed-header"><div><span class="signal-trends-feed-header__eyebrow">' + esc(m.eyebrow) + '</span><h2>' + esc(m.question) + '</h2><p>' + esc(m.sub) + '</p></div><div class="signal-trends-feed-header__status"><span class="signal-trends-checked-chip"><span class="signal-trends-checked-chip__dot" aria-hidden="true"></span>' + (running ? 'Research running' : 'Research ran ' + esc(state.ran)) + '</span></div></header>' +
      (state.trendRun
        ? trend()
        : '<div class="signal-trends-workspace__market"><div class="signal-trends-workspace__market-main"><section class="signal-trends-research-action" aria-label="Research"><p>' + (running ? 'Reading query ' + Math.min(state.researchStep + 1, 8) + ' of 8…' : esc(m.runLine)) + '</p><button type="button" class="signal-trends-primary-button" data-act="research-run"' + (running ? ' disabled' : '') + '>' + (running ? 'Running…' : 'Run research') + '</button><span class="signal-trends-research-action__note">Uses credits</span></section>' +
          '<div class="signal-market-filters"><div class="signal-market-filters__pills" role="group" aria-label="Filter findings">' + pills() + '</div><div class="signal-market-filters__sort"><label><span>Sort</span><select aria-label="Sort" data-change="sort"><option value="research"' + (state.sort === 'research' ? ' selected' : '') + '>By research time</option><option value="source"' + (state.sort === 'source' ? ' selected' : '') + '>By newest source</option></select></label></div></div>' +
          '<div class="signal-trends-feed"><section class="signal-trends-feed-section" aria-label="Findings">' + list.map(card).join('') + '</section>' + restore() + '</div>' + history() + '</div>' + rail() + '</div>') +
      '</div></div></div>'
    );
  }

  /* --------------------------------------------------------------- sentiment */

  /* The Sentiment page v2 proposal: the report is the reading spine, new findings are
     one line (a new high-severity risk is never folded), operations live in Settings.
     Markup and CSS are the proposal's; the numbers are Shopify's. */
  function svBadge(sev) {
    var map = { critical: ['high', 'Critical'], warning: ['med', 'Warning'], info: ['open', 'Risk'], high: ['high', 'High'], medium: ['med', 'Medium'] };
    return '<span class="sv-badge sv-badge-' + map[sev][0] + '">' + map[sev][1] + '</span>';
  }
  function svHandle(id, type, discussion, primary) {
    if (state.handled[id]) {
      return '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end"><span class="sv-badge sv-badge-handled">Handled</span><span class="sv-meta">by you · just now · <button class="sv-btn sv-btn-quiet sv-btn-mini" type="button" data-act="handle-undo" data-id="' + id + '">Undo</button></span></div>';
    }
    var ask = discussion
      ? '<button class="sv-btn sv-btn-quiet" type="button" data-act="ask" data-type="' + type + '" data-id="' + id + '">Discussion open</button>'
      : '<button class="sv-btn ' + (primary ? 'sv-btn-primary' : 'sv-btn-quiet') + '" type="button" data-act="ask" data-type="' + type + '" data-id="' + id + '">Ask Vicino</button>';
    if (primary) return '<div class="sv-row" style="gap:8px">' + ask + '<button class="sv-btn" type="button" data-act="handle" data-id="' + id + '">Mark handled</button></div>';
    return '<div class="sv-row" style="gap:8px"><span class="sv-badge sv-badge-open">Open</span><button class="sv-btn" type="button" data-act="handle" data-id="' + id + '">Mark handled</button>' + ask + '</div>';
  }
  function svNewRow(r, primary, flat) {
    return (
      '<div class="sv-risk"' + (flat ? ' style="border-top:0;padding-top:12px"' : '') + '>' + svBadge(r.sev) + '<div><p class="sv-quote-text">“' + esc(r.text) + '”</p><p class="sv-meta">X · ' + esc(r.date) + (flat ? '' : ' · <span class="sv-badge sv-badge-new">New</span>') + ' · <a href="' + esc(r.href) + '" target="_blank" rel="noopener noreferrer">View post ›</a></p></div>' + svHandle(r.id, 'risk', r.discussion, primary) + '</div>'
    );
  }
  function svSpark() {
    var t = S.trend();
    var max = Math.max.apply(null, t.map(function (x) {
      return x.value;
    }));
    var thin = t.some(function (x) {
      return x.thin;
    });
    return (
      '<div><p class="sv-eyebrow" style="margin-bottom:8px">Last ' + t.length + ' reports · mentions</p><div class="sv-spark" role="img" aria-label="Mentions over the last ' + t.length + ' reports: ' + t.map(function (x) {
        return x.value;
      }).join(', ') + '">' + t.map(function (x) {
        return '<i class="' + (x.thin ? 'is-thin' : '') + '" style="height:' + Math.max(Math.round((x.value / max) * 40), 6) + 'px" title="' + esc(x.window + ': ' + x.value + ' mentions') + '"></i>';
      }).join('') + '</div><div class="sv-sparklabels">' + t.map(function (x) {
        return '<span>' + x.label + '</span>';
      }).join('') + '</div><p class="sv-meta" style="margin-top:6px">' + (thin ? 'Dashed = under 20 mentions. No period yet had enough for a read.' : 'Dashed = under 20 mentions · blank = no report that period') + '</p></div>'
    );
  }
  function svPicker() {
    return (
      '<span class="sg-picker" data-pop><button class="sv-btn sv-btn-quiet" type="button" style="min-height:24px;padding:0 4px;font-size:12px" data-act="picker-toggle" aria-expanded="' + state.pickerOpen + '">Change ▾</button>' + (state.pickerOpen ? S.pickerMenu() : '') + '</span>'
    );
  }
  function svVerdict(r) {
    var thin = !!r.thin;
    var pull = thin ? null : S.citedQuote(r);
    return (
      '<section class="sv-card sv-hero" aria-labelledby="verdict-title"><div class="sv-hero__main"><div class="sv-row" style="gap:8px"><p class="sv-eyebrow">' + esc(r.label) + '</p>' + svPicker() + '<span class="sv-sep">·</span><a href="#" style="font-size:12px;font-weight:700" data-act="report-history">All reports</a></div>' +
      '<h2 id="verdict-title" class="sv-h2">' + esc(r.short) + '</h2><p class="sv-sub">' + esc(r.sub) + (r.cites.length ? ' ' + r.cites.map(function (n) {
        return '<button class="sv-cite" type="button" data-act="cite" data-id="' + n + '" aria-label="Go to supporting post ' + n + '">[' + n + ']</button>';
      }).join('') : '') + '</p>' +
      (pull ? '<blockquote class="sv-pull"><p>' + esc(pull.text) + '</p><p class="sv-meta">X · ' + esc(pull.who) + ' · ' + esc(pull.date) + ' · ' + esc(pull.eng) + ' · <span class="sv-lean sv-lean-' + pull.lean + '">' + (pull.lean === 'positive' ? 'Positive' : 'Negative') + '</span> · [' + pull.n + '] · <a href="' + esc(pull.href) + '" target="_blank" rel="noopener noreferrer">Open post ›</a></p></blockquote>' : '') +
      '<p class="sv-sub" style="font-weight:700">' + esc(r.receipt) + '</p></div>' +
      '<div class="sv-hero__side">' + (thin
        ? r.stats.map(function (st) {
            return '<div class="sv-stat"><b>' + st.value + '</b><span>' + esc(st.label) + '</span></div>';
          }).join('')
        : '<div class="sv-stat"><b>' + r.mix.mentions + '</b><span>mentions</span><em class="sv-flat">' + esc(r.delta) + '</em></div>' +
          r.stats.slice(1).map(function (st) {
            return '<div class="sv-stat"><b>' + st.value + '</b><span>' + (st.label === 'of mentions positive' ? 'positive' : esc(st.label)) + '</span><em class="sv-flat">' + esc(r.delta) + '</em></div>';
          }).join('')) + svSpark() + '</div></section>'
    );
  }
  function svSince() {
    var v = D.v2;
    var list = S.newRisks();
    return (
      '<details class="sv-card" style="padding:14px 24px"' + (state.sinceOpen ? ' open' : '') + '><summary class="sv-row" style="justify-content:space-between" data-act="since-toggle"><span>Since this report · <span style="color:#0d7685">' + esc(S.sinceLine()) + '</span></span><span class="sv-meta" style="font-weight:500">' + esc(v.since.counted) + '</span></summary>' +
      (state.sinceOpen ? (list.length ? '<div style="margin-top:10px">' + list.map(function (r) {
        return svNewRow(r);
      }).join('') + '</div>' : '<p class="sv-sub" style="margin-top:10px">' + esc(v.since.thinNote) + '</p>') : '') + '</details>'
    );
  }
  function svNewAlert() {
    var v = D.v2;
    var urgent = S.urgentRisks();
    var rest = S.newRisks().filter(function (r) {
      return r.sev !== 'critical';
    });
    return (
      '<section class="sv-card sv-alert"><div class="sv-row" style="justify-content:space-between"><div class="sv-row" style="gap:8px"><span class="sv-badge sv-badge-new">New</span><p class="sv-eyebrow">Since this report · ' + esc(S.sinceLine()) + '</p></div><span class="sv-meta">' + esc(v.since.counted) + '</span></div>' +
      urgent.map(function (r, i) {
        return svNewRow(r, true, i === 0);
      }).join('') +
      (state.allNew ? rest.map(function (r) {
        return svNewRow(r, true);
      }).join('') : '') +
      '<button class="sv-btn sv-btn-quiet" type="button" data-act="all-new">' + (state.allNew ? 'Show fewer' : 'Show ' + rest.length + ' more new risks') + '</button></section>'
    );
  }
  function svAttention(r) {
    var v = D.v2;
    var list = r.thin || state.allAttention ? r.risks : r.risks.slice(0, 4);
    return (
      '<section class="sv-card" aria-labelledby="attention-title"><p class="sv-eyebrow">Needs your attention</p><h3 id="attention-title" class="sv-h3" style="margin-top:6px">' + esc(r.attentionHead) + '</h3><p class="sv-meta" style="margin-top:4px">' + esc(r.attentionSub || (state.sstate === 'failure' ? v.failureAttentionSub : v.attentionSub)) + '</p><div style="margin-top:12px">' +
      list.map(function (p) {
        return '<div class="sv-risk">' + svBadge(p.sev) + '<div><p class="sv-quote-text">' + esc(p.text) + '</p><p class="sv-meta">X · ' + esc(p.who) + ' · ' + esc(p.date) + ' · ' + esc(p.eng) + ' · <a href="' + esc(p.href) + '" target="_blank" rel="noopener noreferrer">Open post ›</a></p></div>' + svHandle(p.id, 'post') + '</div>';
      }).join('') +
      '</div>' + (r.thin ? '' : '<p class="sv-meta" style="margin-top:8px"><button class="sv-btn sv-btn-quiet sv-btn-mini" type="button" data-act="all-attention">' + (state.allAttention ? 'Show fewer' : 'Show all ' + r.risks.length + ' of the most severe') + '</button> · ' + esc(r.riskFine) + '</p>') + '</section>'
    );
  }
  function svQuote(q) {
    return '<div class="sv-quote" data-cite="' + q.n + '"><span class="sv-platform">X</span><div><p>' + esc(q.text) + '</p><p class="sv-meta"><b>' + esc(q.who) + '</b> · ' + esc(q.date) + ' · ' + esc(q.eng) + ' · <span class="sv-lean sv-lean-' + q.lean + '">' + (q.lean === 'positive' ? 'Positive' : 'Negative') + '</span> · [' + q.n + '] · <a href="' + esc(q.href) + '" target="_blank" rel="noopener noreferrer">Open post ›</a></p></div></div>';
  }
  function svThemes(r) {
    var v = D.v2;
    if (r.thin) {
      var posts = state.morePosts ? r.posts : r.posts.slice(0, 3);
      return (
        '<section class="sv-card" aria-labelledby="posts-title"><p class="sv-eyebrow">Posts you can check</p><h3 id="posts-title" class="sv-h3" style="margin-top:6px">' + esc(r.themesHead) + '</h3><p class="sv-meta" style="margin-top:4px">' + esc(r.postsSub) + '</p><div style="margin-top:8px">' + posts.map(svQuote).join('') + '<div class="sv-row" style="gap:8px;margin-top:8px"><button class="sv-btn sv-btn-quiet" type="button" data-act="posts-more">' + (state.morePosts ? 'Show fewer' : 'Show 3 more posts') + '</button></div></div></section>'
      );
    }
    return (
      '<section class="sv-card" aria-labelledby="themes-title"><p class="sv-eyebrow">Themes</p><h3 id="themes-title" class="sv-h3" style="margin-top:6px">' + esc(r.themesHead) + '</h3><p class="sv-meta" style="margin-top:4px">' + esc(v.themesSub) + '</p><div style="margin-top:8px">' +
      r.themes.map(function (t) {
        var more = !!state.moreQuotes[t.id];
        var qs = more ? t.quotes : t.quotes.slice(0, 1);
        return (
          '<div class="sv-theme"><div><b style="font-size:15px">' + esc(t.name) + '</b><p class="sv-finding">' + esc(t.summary) + '</p></div><div class="sv-stat" style="padding-top:2px"><b style="font-size:20px">' + t.mentions + '</b><span>' + esc(t.voices.replace(' from ', ' · ')) + '</span></div><div><span class="sv-lean sv-lean-' + t.lean + '">' + esc(t.leanLabel) + '</span><p class="sv-meta" style="margin-top:2px">' + t.pos + ' positive / ' + t.neu + ' neutral / ' + t.neg + ' negative</p></div><div><p class="sv-meta">No comparable period</p></div>' +
          '<div style="grid-column:1 / -1">' + qs.map(svQuote).join('') + '<div class="sv-row" style="gap:8px;margin-top:4px"><button class="sv-btn sv-btn-quiet" type="button" data-act="quotes-more" data-id="' + t.id + '">' + (more ? 'Show fewer' : 'Show 2 more quoted posts') + '</button><button class="sv-btn" type="button" style="min-height:32px;padding:6px 12px" data-act="ask" data-type="theme" data-id="' + t.id + '">Ask Vicino</button></div></div></div>'
        );
      }).join('') +
      '</div><p class="sv-meta" style="margin-top:10px">' + esc(r.themeFine) + '</p></section>'
    );
  }
  function svUncertain() {
    var v = D.v2;
    var rows = state.sstate === 'thin' ? v.uncertain.slice(0, 1) : v.uncertain;
    return (
      '<section class="sv-card" aria-labelledby="uncertain-title"><p class="sv-eyebrow">Uncertain mentions</p><h3 id="uncertain-title" class="sv-h3" style="margin-top:6px">' + S.plural(rows.length, 'post') + ' might be about you</h3><p class="sv-meta" style="margin-top:4px">' + esc(v.uncertainSub) + '</p><div style="margin-top:8px">' +
      rows.map(function (u) {
        var st = state.uncertain[u.id];
        var ctl = st === 'counted'
          ? '<div class="sv-row" style="gap:8px"><span class="sv-badge sv-badge-handled">Counted as yours</span><span class="sv-meta">in the next report · <button class="sv-btn sv-btn-quiet sv-btn-mini" type="button" data-act="us-undo" data-id="' + u.id + '">Undo</button></span></div>'
          : st === 'dropped'
          ? '<div class="sv-row" style="gap:8px"><span class="sv-badge sv-badge-open">Marked as not yours</span><span class="sv-meta"><button class="sv-btn sv-btn-quiet sv-btn-mini" type="button" data-act="us-undo" data-id="' + u.id + '">Undo</button></span></div>'
          : '<div class="sv-row" style="gap:8px"><button class="sv-btn" type="button" data-act="us" data-id="' + u.id + '">That’s us</button><button class="sv-btn sv-btn-quiet" type="button" data-act="not-us" data-id="' + u.id + '">Not us</button></div>';
        return '<div class="sv-risk is-platform"><span class="sv-platform">' + u.platform + '</span><div><p style="margin:0 0 4px;font-size:14px">' + esc(u.text) + '</p><p class="sv-meta">' + esc(u.meta) + ' · <a href="' + esc(u.href) + '" target="_blank" rel="noopener noreferrer">View post ›</a></p></div>' + ctl + '</div>';
      }).join('') +
      '</div></section>'
    );
  }
  function svBasis() {
    var b = S.basis();
    return (
      '<details class="sv-card" id="basis"' + (state.basisOpen ? ' open' : '') + '><summary class="sv-row" style="justify-content:space-between" data-act="basis-toggle"><span>Basis &amp; coverage</span><span class="sv-meta" style="font-weight:500">' + esc(b.summary) + '</span></summary>' +
      (state.basisOpen
        ? '<div class="sv-basis"><div><p class="sv-eyebrow">Where mentions came from</p><p class="sv-sub" style="margin-top:6px">' + esc(b.from) + '</p></div><div><p class="sv-eyebrow">Coverage</p><p class="sv-sub" style="margin-top:6px">' + esc(b.coverage) + '</p></div><div><p class="sv-eyebrow">What this plan watches</p><p class="sv-sub" style="margin-top:6px">' + esc(b.watches) + ' · <a href="#" data-act="settings">Review in Settings ›</a></p></div></div><p class="sv-meta" style="margin-top:12px">' + esc(b.fine) + '</p>'
        : '') + '</details>'
    );
  }
  function svFoot() {
    var v = D.v2;
    var failed = state.sstate === 'failure';
    return (
      (failed
        ? '<section class="sv-card sv-alert" style="padding:14px 24px"><div class="sv-row" style="justify-content:space-between"><div><p class="sv-sub" style="font-weight:700">' + esc(v.failure.title) + '</p><p class="sv-meta" style="margin-top:4px">' + esc(v.failure.detail) + '</p></div><div class="sv-row" style="gap:8px"><button class="sv-btn" type="button" data-act="cfg-check"' + (state.checking ? ' disabled' : '') + '>' + (state.checking ? 'Checking…' : 'Check X now') + '</button><span class="sv-meta">' + esc(v.failure.note) + '</span><a href="#" style="font-size:13px;font-weight:700" data-act="settings">Fix in Settings ›</a></div></div></section>'
        : '') +
      '<div class="sv-row" style="justify-content:space-between;padding:0 4px"><p class="sv-meta">' + esc(failed ? v.failure.footer : v.footer) + ' · <a href="#" data-act="settings">Manage in Settings ›</a></p><p class="sv-meta"><a href="#" data-act="page" data-id="market">Market research ›</a></p></div>'
    );
  }

  function sentiment() {
    var r = S.report();
    var v = D.v2;
    var failed = state.sstate === 'failure';
    var none = S.noReport();
    return (
      '<div class="v4-section-inner signal-page"><div class="signal-page__content">' + head() + '<div class="sv-page">' +
      '<div class="sv-row" style="justify-content:space-between;align-items:flex-end"><div><h2 class="sv-h1">Sentiment</h2><p class="sv-sub">' + esc(v.subline) + '</p></div><p class="sv-meta">' + esc(v.meta) + '</p></div>' +
      S.pastBanner() + (failed ? svNewAlert() : '') +
      (none
        ? '<section class="sv-card"><p class="sv-sub">This run produced no report.</p></section>'
        : svVerdict(r) + S.reportHistoryBlock() + (failed ? '' : svSince()) + svAttention(r) + svThemes(r) + svUncertain() + svBasis()) +
      svFoot() +
      '</div></div></div>'
    );
  }

  /* -------------------------------------------------------------- their drawers */

  function detail(head, body) {
    return '<div class="signal-trends-detail-backdrop" data-scrim="drawer"></div><div class="signal-trends-detail-backdrop sg-now-detail"><div class="signal-trends-detail" role="dialog" aria-modal="true"><div class="signal-trends-detail__head"><div>' + head + '</div><button type="button" aria-label="Close" data-act="drawer-close">' + icon('x', 17) + '</button></div><div class="signal-trends-detail__body">' + body + '</div></div></div>';
  }
  function drawer(d) {
    if (d.type !== 'risk' && d.type !== 'evidence') return '';
    if (d.type === 'risk') {
      var r = S.risk(d.id);
      return detail(
        '<span>' + esc(r.label === 'Risk' ? 'Risk' : r.label + ' risk') + '</span><strong>X · ' + esc(r.date) + '</strong>',
        '<h2>' + esc(r.text) + '</h2><div class="signal-trends-detail__relevance"><span>What the post says</span><p>' + esc(r.says) + '</p></div><div class="signal-trends-detail__evidence-head"><div><h3>Sources</h3></div></div><div class="signal-trends-detail__evidence-list"><article class="signal-trends-evidence-card"><div class="signal-trends-evidence-card__meta"><span>X</span></div><a href="' + esc(r.href) + '" target="_blank" rel="noopener noreferrer">View the post' + icon('arrow-up-right', 14) + '</a></article></div><p style="margin-top:16px">' +
          (r.discussion ? '<button type="button" class="signal-trends-quiet-btn signal-trends-discussion-open" data-act="ask" data-type="risk" data-id="' + r.id + '">Discussion open · ' + esc(r.discussion) + '</button>' : '<button type="button" class="signal-trends-quiet-btn signal-trends-feed-card__ask" data-act="ask" data-type="risk" data-id="' + r.id + '">Ask Vicino</button>') +
          '</p>'
      );
    }
    var it = S.trendItem(d.id);
    var f = S.finding(d.id);
    return detail(
      '<span>Finding ' + it.rank + '</span><strong>' + f.rel + '% relevance</strong>',
      '<h2>' + esc(f.title) + '</h2><div class="signal-trends-detail__relevance"><span>Why this matters for the brand</span><p>' + esc(f.read) + '</p></div><div class="signal-trends-detail__relevance signal-trends-direction"><span>A direction to discuss</span><p>' + esc(f.direction) + '</p></div><div class="signal-trends-detail__evidence-head"><div>' + icon('file', 16) + '<h3>Linked evidence</h3></div><span>' + S.plural(it.evidence.length, 'source') + '</span></div><div class="signal-trends-detail__evidence-list">' +
        it.evidence.map(function (ev) {
          return '<article class="signal-trends-evidence-card"><div class="signal-trends-evidence-card__meta"><span>' + esc(ev.src) + '</span><span>' + esc(ev.date) + '</span><span>' + ev.fit + '% source fit</span></div><h4>' + esc(ev.title) + '</h4><p>' + esc(ev.body) + '</p><a href="' + esc(ev.href) + '" target="_blank" rel="noopener noreferrer">Read original source' + icon('arrow-up-right', 14) + '</a></article>';
        }).join('') +
        '</div>'
    );
  }

  S.designs.now = { market: market, sentiment: sentiment, drawer: drawer };

  /* the switcher's thumb sits under the active tab, measured once it's in the page */
  S.hooks.afterRender.push(function () {
    if (state.design !== 'now') return;
    var nav = document.querySelector('.signal-switcher');
    var on = nav && nav.querySelector('.is-active');
    var thumb = nav && nav.querySelector('.signal-switcher__thumb');
    if (on && thumb) {
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + on.offsetLeft + 'px)';
    }
  });
})();
