/* Lanes: the page organised by what to do with each thing. A lane says what it is at
   its left, in a word, a line and a count, and holds its items to the right, so the
   page can be read down the left edge alone. Items are a logo, a headline and a mark;
   the words open in the drawer. */
(function () {
  var S = window.SG;
  var D = S.data;
  var state = S.state;
  var esc = S.esc;
  var icon = S.icon;

  function lane(o) {
    return (
      '<section class="ln-lane' + (o.tone ? ' is-' + o.tone : '') + '" data-rise style="--b:' + o.hue + '"><header class="ln-lane__head"><span class="ln-lane__top">' + S.tile(o.icon, o.hue) + (o.count != null ? '<b>' + o.count + '</b>' : '') + '</span><h2>' + esc(o.title) + '</h2><p>' + esc(o.sub) + '</p></header><div class="ln-lane__body">' + o.body + '</div></section>'
    );
  }
  function grid(items, max) {
    return '<div class="ln-grid" style="--n:' + Math.min(items.length || 1, max || 4) + '">' + items.join('') + '</div>';
  }

  /* --------------------------------------------------------------------- market */

  function findingCard(f) {
    if (state.justHidden[f.id]) return S.hiddenLine(f);
    return (
      '<article class="ln-card" role="button" tabindex="0" data-act="finding-open" data-id="' + f.id + '"><div class="ln-card__top">' + S.sourceLogos(f) + (f.rel ? S.ring(f.rel, 32) : '') + '</div><h3>' + esc(S.headline(f)) + '</h3>' +
      '<div class="ln-card__foot"><small>' + (f.dirNote ? esc(f.dirNote) + ' · ' : '') + S.KIND[f.kind].label + (f.posted ? ' · ' + esc(f.posted) : '') + '</small>' + S.askBtn('finding', f.id, f.discussion) + '</div></article>'
    );
  }
  function moveCard(f) {
    if (state.justHidden[f.id]) return S.hiddenLine(f);
    return (
      '<article class="ln-card is-move" role="button" tabindex="0" data-act="finding-open" data-id="' + f.id + '"><div class="ln-card__who">' + S.subjectLogo(f, 'lg') + '<small>' + esc(f.about ? f.about.name : S.KIND[f.kind].label) + '</small></div><h3>' + esc(S.headline(f)) + '</h3><div class="ln-card__foot"><small>' + esc(f.found) + '</small>' + S.askBtn('finding', f.id, f.discussion) + '</div></article>'
    );
  }

  function market() {
    if (state.trendRun) return '<div class="sg-page ln">' + S.topBar() + S.trendReport() + '</div>';
    var list = S.feed();
    var c = S.counts();
    function t(id, text) {
      return '<button type="button" class="sg-tab' + (state.filter === id ? ' is-on' : '') + '" data-act="filter" data-id="' + id + '">' + text + '<em>' + c[id] + '</em></button>';
    }
    var opp = list.filter(function (f) {
      return f.dir === 'opportunity';
    });
    var watch = list.filter(function (f) {
      return f.dir === 'watch';
    });
    var rest = S.withoutDirection(list);
    var moves = rest.filter(function (f) {
      return f.kind === 'competitor';
    });
    var notes = rest.filter(function (f) {
      return f.kind !== 'competitor';
    });
    return (
      '<div class="sg-page ln">' + S.topBar() +
      '<div class="ln-intro" data-rise><h2>' + esc(D.market.question) + '</h2><span class="ln-intro__tools"><span class="sg-tabs" role="group" aria-label="Filter findings">' + t('all', 'All') + t('market', 'Market') + t('audience', 'Audience') + t('competitor', 'Competitor') + '</span><label class="sg-select" title="Sort">' + icon('sort', 14) + '<select aria-label="Sort" data-change="sort"><option value="research"' + (state.sort === 'research' ? ' selected' : '') + '>By research time</option><option value="source"' + (state.sort === 'source' ? ' selected' : '') + '>By newest source</option></select></label></span></div>' +
      (opp.length ? lane({ icon: 'bulb', hue: 'var(--sg-green)', title: 'Opportunity', sub: 'Worth acting on', count: opp.length, body: grid(opp.map(findingCard), 3) }) : '') +
      (watch.length ? lane({ icon: 'eye', hue: 'var(--sg-amber)', title: 'Watch', sub: 'One source so far', count: watch.length, body: grid(watch.map(findingCard), 3) }) : '') +
      (moves.length ? lane({ icon: 'crosshair', hue: 'var(--sg-competitor)', title: 'Competitors', sub: 'What rivals are saying', count: moves.length, body: grid(moves.map(moveCard), 4) }) : '') +
      (notes.length ? lane({ icon: 'trending', hue: 'var(--sg-market)', title: 'Market notes', sub: 'Good to know', count: notes.length, body: grid(notes.map(moveCard), 3) }) : '') +
      S.restoreBar() +
      lane({
        icon: 'globe',
        hue: 'var(--cyan-600)',
        title: 'Research',
        sub: 'What findings are read against',
        body:
          S.researchLine() + S.attentionBar()
      }) +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------ sentiment */

  /* The same lanes as Market. The first one is the report's read, on the one surface
     the design system keeps for what Vicino wrote. */
  function verdictLane(r) {
    var head =
      '<header class="ln-lane__head">' + S.tile('file', 'var(--cyan-600)') + '<h2>' + (state.report === 'past' && !r.thin ? 'Past report' : 'Latest report') + '</h2>' + S.reportPicker() + '<button type="button" class="sg-link ln-allreports" data-act="report-history">All reports</button></header>';
    if (r.thin) {
      return (
        '<section class="ln-lane is-ai" data-rise>' + head + '<div class="ln-lane__body ln-read"><h2>' + esc(r.short) + '</h2><p class="ln-read__say">' + esc(r.sayShort) + '</p><div class="ln-cells">' + r.stats.map(function (s) {
          return S.cell(s.value, s.label);
        }).join('') + '<span class="sg-cell is-trend">' + S.microTrend() + '<small>Last ' + S.trend().length + ' reports · under 20 mentions</small></span></div><p class="sg-fine">' + esc(r.receipt) + '</p></div></section>'
      );
    }
    var m = r.mix;
    return (
      '<section class="ln-lane is-ai" data-rise>' + head + '<div class="ln-lane__body ln-read"><h2>' + esc(r.short) + '</h2>' + S.shareBlock(m) +
      '<div class="ln-cells">' + S.cell(m.mentions, 'mentions') + S.cell(r.riskTotal, 'risk posts') + S.cell(m.posts, 'posts collected') + '<span class="sg-cell is-trend">' + S.microTrend() + '<small>Last ' + S.trend().length + ' reports · mentions</small></span></div>' +
      (state.readMore ? '<p class="sg-claim">' + esc(r.headline) + ' ' + esc(r.sub) + '</p>' + S.cites(r) : '') +
      '<div class="ln-read__foot"><button type="button" class="sg-fold' + (state.readMore ? ' is-open' : '') + '" data-act="read-more" aria-expanded="' + state.readMore + '">' + icon('chevron-right', 13) + '<span>' + (state.readMore ? 'Show less' : 'The full summary') + '</span></button><span class="sg-fine">' + esc(r.receipt) + '</span></div></div></section>'
    );
  }

  /* a theme, on one line: what it is, how much of the talk it holds, which way it leans */
  function themeRow(t, total) {
    return (
      '<button type="button" class="ln-theme" data-act="theme-open" data-id="' + t.id + '">' + S.themeTile(t) + '<span class="ln-theme__name">' + esc(t.name) + '</span>' + S.themeMeter(t, total) + '<b>' + t.mentions + '</b>' + S.leanLab(t.lean, t.leanLabel) + icon('chevron-right', 14) + '</button>'
    );
  }

  function sentiment() {
    var r = S.report();
    var failed = state.sstate === 'failure';
    if (S.noReport()) return '<div class="sg-page ln">' + S.topBar() + S.pastBanner() + '<div class="sg-card sg-noreport" data-rise>This run produced no report.</div>' + S.footerStatus() + '</div>';
    var urgent = S.urgentRisks();
    var news = S.newRisks();
    var others = news.filter(function (n) {
      return n.sev !== 'critical';
    });
    var sinceList = failed ? urgent.concat(state.allNew ? others : []) : state.sinceOpen ? news : news.slice(0, 3);
    function riskPost(n) {
      return S.post(n, 'risk');
    }
    function reportPost(p) {
      return S.post(p, 'post');
    }
    var since = lane({
      icon: 'radio',
      tone: failed ? 'alert' : '',
      hue: failed ? 'var(--sg-amber)' : 'var(--cyan-600)',
      title: 'Since this report',
      sub: 'New, not in a report yet',
      count: news.length,
      body: (sinceList.length ? grid(sinceList.map(riskPost), 3) : '<p class="sg-fine">' + esc(D.v2.since.thinNote) + '</p>') + '<div class="ln-lane__foot"><small>' + esc(S.sinceLine()) + ' · ' + esc(D.v2.since.counted) + '</small>' + (news.length > 3 ? '<button type="button" class="sg-link" data-act="' + (failed ? 'all-new' : 'since-toggle') + '">' + ((failed ? state.allNew : state.sinceOpen) ? 'Show fewer' : 'Show all ' + news.length) + '</button>' : '') + '</div>'
    });
    var attention = r.thin || state.allAttention ? r.risks : r.risks.slice(0, 3);
    var posts = r.thin ? (state.morePosts ? r.posts : r.posts.slice(0, 3)) : null;
    var total = r.thin ? 1 : r.mix.mentions;
    return (
      '<div class="sg-page ln">' + S.topBar() + S.pastBanner() + (failed ? since : '') + verdictLane(r) + S.reportHistoryBlock() + (failed ? '' : since) +
      lane({
        icon: 'alert',
        hue: 'var(--sg-amber)',
        title: 'Needs your attention',
        sub: r.thin ? 'One post, whatever the sample' : 'Risk posts in this report',
        count: r.riskTotal,
        body: grid(attention.map(reportPost), 3) + (r.thin ? '' : '<div class="ln-lane__foot"><small>' + esc(r.attentionHead) + '</small><button type="button" class="sg-link" data-act="all-attention">' + (state.allAttention ? 'Show fewer' : 'Show the ' + r.risks.length + ' most severe') + '</button></div>')
      }) +
      (r.thin
        ? lane({ icon: 'quote', hue: 'var(--sg-market)', title: 'Posts you can check', sub: 'Too few for themes', count: r.posts.length, body: '<div class="sg-bubbles">' + posts.map(S.quoteBubble).join('') + '</div><div class="ln-lane__foot"><small></small><button type="button" class="sg-link" data-act="posts-more">' + (state.morePosts ? 'Show fewer' : 'Show 3 more posts') + '</button></div>' })
        : lane({ icon: 'quote', hue: 'var(--sg-market)', title: 'Themes', sub: 'What the feedback gathers around', count: r.themes.length, body: '<div class="ln-themes">' + r.themes.map(function (t) {
            return themeRow(t, total);
          }).join('') + '</div><div class="ln-lane__foot"><small>' + esc(r.themeFine) + '</small><span class="sg-strip-key"><span><i class="sg-strip__pos"></i>Positive</span><span><i class="sg-strip__neu"></i>Neutral</span><span><i class="sg-strip__neg"></i>Negative</span></span></div>' })) +
      lane({
        icon: 'info',
        hue: 'var(--text-3)',
        title: 'Uncertain',
        sub: 'Is this about you?',
        count: S.uncertainRows().length,
        body: '<div class="ln-unc">' + S.uncertainRows().map(S.uncertainRow).join('') + '</div>'
      }) +
      (failed ? lane({ icon: 'alert', tone: 'alert', hue: 'var(--sg-amber)', title: 'Collection', sub: 'X isn’t collecting', body: S.failureCard() }) : '') +
      S.basisRow() + S.footerLine() + '</div>'
    );
  }

  S.designs.lanes = { market: market, sentiment: sentiment };
})();
