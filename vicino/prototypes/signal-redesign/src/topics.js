/* Topics: the page organised by what it's about. Market is a mosaic of the plan's
   research topics and Sentiment a mosaic of the themes people raised, each with a small
   drawn scene. The size and the picture carry the meaning; the words open in the drawer. */
(function () {
  var S = window.SG;
  var D = S.data;
  var state = S.state;
  var esc = S.esc;
  var icon = S.icon;

  function dot(f) {
    if (!f.dir) return '';
    return '<i class="tp-dot is-' + (f.dirTone === 'risk' ? 'amber' : 'green') + '" title="' + esc(f.dirNote || 'Opportunity') + '"></i>';
  }

  /* --------------------------------------------------------------------- market */

  function row(f) {
    if (state.justHidden[f.id]) return S.hiddenLine(f);
    return (
      '<button type="button" class="tp-row" data-act="finding-open" data-id="' + f.id + '">' + S.subjectLogo(f) + '<span class="tp-row__text"><b>' + esc(S.headline(f)) + '</b></span>' + dot(f) + (f.discussion ? '<span class="tp-row__chat" title="Discussion open">' + icon('chat', 13) + '</span>' : '') + '</button>'
    );
  }

  function topicCard(topic, list, cls) {
    var mine = list.filter(function (f) {
      return f.topic === topic.id;
    });
    if (!mine.length) return '';
    var withDir = mine.filter(function (f) {
      return f.dir;
    }).length;
    return (
      '<section class="tp-topic sg-card ' + cls + '" data-rise style="--b:' + topic.hue + '"><header class="tp-topic__scene"><div class="tp-topic__say"><b>' + mine.length + '</b><h2>' + esc(topic.name) + '</h2><p>' + (withDir ? withDir + ' with a direction' : 'For awareness') + '</p></div><span class="tp-topic__art">' + S.illus(topic.id) + '</span></header><div class="tp-topic__rows">' + mine.map(row).join('') + '</div></section>'
    );
  }

  function market() {
    if (state.trendRun) return '<div class="sg-page tp">' + S.topBar() + S.trendReport() + '</div>';
    var list = S.feed();
    var c = S.counts();
    function t(id, text) {
      return '<button type="button" class="sg-tab' + (state.filter === id ? ' is-on' : '') + '" data-act="filter" data-id="' + id + '">' + text + '<em>' + c[id] + '</em></button>';
    }
    var tops = D.market.topics;
    return (
      '<div class="sg-page tp">' + S.topBar() +
      '<div class="tp-lead" data-rise><div><span class="tp-eyebrow"><b>' + esc(D.market.eyebrow) + '</b></span><h2>' + esc(D.market.leadShort) + ' <span>' + esc(D.market.leadRest) + '</span></h2></div></div>' +
      '<div class="tp-tools" data-rise><span class="sg-tabs" role="group" aria-label="Filter findings">' + t('all', 'All') + t('market', 'Market') + t('audience', 'Audience') + t('competitor', 'Competitor') + '</span><span class="tp-key"><span><i class="tp-dot is-green"></i>Opportunity</span><span><i class="tp-dot is-amber"></i>Possible risk</span></span><label class="sg-select" title="Sort">' + icon('sort', 14) + '<select aria-label="Sort" data-change="sort"><option value="research"' + (state.sort === 'research' ? ' selected' : '') + '>By research time</option><option value="source"' + (state.sort === 'source' ? ' selected' : '') + '>By newest source</option></select></label></div>' +
      '<div class="tp-mosaic">' + topicCard(tops[0], list, 'is-a') + topicCard(tops[1], list, 'is-b') + topicCard(tops[2], list, 'is-c') +
      '<div class="tp-stack">' + topicCard(tops[3], list, 'is-d') + '<section class="tp-research sg-card" data-rise role="button" tabindex="0" data-act="research-open"><div class="tp-research__head">' + S.tile('globe', 'var(--cyan-600)') + '<b>Research</b>' + icon('chevron-right', 15) + '</div>' +
      S.fact('target', 'var(--sg-violet)', 'Read against your goal', '<p>' + esc(D.market.context.goal) + '</p>') + '</section>' + S.attentionBar() + '</div></div>' + S.restoreBar() + '</div>'
    );
  }

  /* ------------------------------------------------------------------ sentiment */

  /* the statement reads like Market's: what happened in black, the rest quieter */
  function statement(text) {
    var at = text.indexOf(', ');
    if (at < 0) return esc(text);
    return esc(text.slice(0, at + 1)) + ' <span>' + esc(text.slice(at + 2)) + '</span>';
  }

  /* a theme gets the same card as a research topic: how many and what it's about on a
     drawn scene, then which way it leans and one person saying it */
  function themeCard(t, cls) {
    var m = S.themeOf(t);
    var q = t.quotes[0];
    var counts = [[t.pos, 'positive'], [t.neu, 'neutral'], [t.neg, 'negative']].filter(function (c) {
      return c[0] > 0;
    }).map(function (c) {
      return '<span><b>' + c[0] + '</b> ' + c[1] + '</span>';
    }).join('');
    return (
      '<section class="tp-topic tp-tcard sg-card ' + cls + '" data-rise role="button" tabindex="0" data-act="theme-open" data-id="' + t.id + '" style="--b:' + m.hue + '"><header class="tp-topic__scene"><div class="tp-topic__say"><b>' + t.mentions + '</b><h2>' + esc(t.name) + '</h2>' + S.leanLab(t.lean, t.leanLabel) + '</div><span class="tp-topic__art">' + S.illus(m.scene) + '</span></header>' +
      '<div class="tp-tcard__body"><div class="tp-tcard__split">' + S.strip(t.pos, t.neu, t.neg) + '<small>' + counts + '</small></div><div class="tp-tcard__say">' + S.avatar(q.who, 'md') + '<p>' + esc(S.quoted(q.text)) + '</p></div></div></section>'
    );
  }
  function themeMosaic(r) {
    var themes = r.themes.slice().sort(function (a, b) {
      return b.mentions - a.mentions;
    });
    var spans = ['is-s7', 'is-s5', 'is-s4', 'is-s4', 'is-s4'];
    return S.sec({ title: 'Themes', note: r.themesHead }) + '<div class="tp-mosaic">' + themes.map(function (t, i) {
      return themeCard(t, spans[i] || 'is-s4');
    }).join('') + '</div><p class="sg-fine tp-fine" data-rise>' + esc(r.themeFine) + '</p>';
  }

  function column(title, note, count, body, foot) {
    return (
      '<section class="tp-col">' + S.sec({ title: title, note: note, count: count }) + '<div class="tp-panel sg-card" data-rise><div class="tp-panel__body">' + body + '</div>' + (foot ? '<div class="tp-panel__foot">' + foot + '</div>' : '') + '</div></section>'
    );
  }

  function sentiment() {
    var r = S.report();
    var failed = state.sstate === 'failure';
    if (S.noReport()) return '<div class="sg-page tp">' + S.topBar() + S.pastBanner() + '<div class="sg-card sg-noreport" data-rise>This run produced no report.</div>' + S.footerStatus() + '</div>';
    var news = S.newRisks();
    var urgent = S.urgentRisks();
    var others = news.filter(function (n) {
      return n.sev !== 'critical';
    });
    var side = r.thin
      ? '<div class="tp-report__nums is-cells">' + r.stats.slice(0, 2).map(function (s) {
        return S.cell(s.value, s.label);
      }).join('') + '</div>'
      : '<div class="tp-report__nums"><div class="tp-report__mix">' + S.donut(r.mix, 104, r.mix.pos + '%', 'positive') + S.donutLegend(r.mix) + '</div><div class="tp-report__count"><b>' + r.mix.mentions + '</b><small>mentions</small>' + S.microTrend() + '</div></div>';
    var attention = r.thin || state.allAttention ? r.risks : r.risks.slice(0, 3);
    var sinceList = state.sinceOpen ? news : news.slice(0, 3);
    var unc = S.uncertainRows();
    var posts = r.thin ? (state.morePosts ? r.posts : r.posts.slice(0, 4)) : null;
    function linkBtn(act, text) {
      return '<button type="button" class="sg-link" data-act="' + act + '">' + esc(text) + '</button>';
    }
    return (
      '<div class="sg-page tp">' + S.topBar() + S.pastBanner() +
      (failed
        ? S.sec({ title: 'Since this report', note: S.sinceLine(), side: esc(D.v2.since.counted) }) + '<section class="tp-alert" data-rise><div class="tp-alert__grid">' + urgent.concat(state.allNew ? others : []).map(function (n) {
          return S.post(n, 'risk');
        }).join('') + '</div>' + linkBtn('all-new', state.allNew ? 'Show fewer' : 'Show ' + others.length + ' more new risks') + '</section>'
        : '') +
      S.sec({ title: state.report === 'past' && !r.thin ? 'Past report' : 'Latest report', after: S.reportPicker(), side: '<button type="button" class="sg-link" data-act="report-history">All reports</button>' }) +
      '<section class="sg-card tp-report" data-rise><div class="tp-report__read"><p class="tp-report__say">' + statement(r.short) + '</p>' +
      (state.readMore ? '<p class="sg-claim">' + esc(r.headline) + ' ' + esc(r.sub) + '</p>' + S.cites(r) : '') + (r.thin ? '<p class="sg-fine">' + esc(r.sayShort) + '</p>' : '<button type="button" class="sg-fold' + (state.readMore ? ' is-open' : '') + '" data-act="read-more" aria-expanded="' + state.readMore + '">' + icon('chevron-right', 13) + '<span>' + (state.readMore ? 'Show less' : 'The full summary') + '</span></button>') + '</div>' + side + '</section>' +
      S.reportHistoryBlock() +
      (r.thin
        ? S.sec({ title: 'Posts you can check', note: r.postsSub }) + '<section class="sg-card tp-checks" data-rise><div class="tp-posts">' + posts.map(S.quoteBubble).join('') + '</div>' + linkBtn('posts-more', state.morePosts ? 'Show fewer' : 'Show 2 more posts') + '</section>'
        : themeMosaic(r)) +
      '<div class="tp-trio">' +
      column('Needs your attention', 'Risk posts in this report', r.riskTotal, attention.map(function (p) {
        return S.post(p, 'post');
      }).join(''), r.thin ? '' : linkBtn('all-attention', state.allAttention ? 'Show fewer' : 'Show the ' + r.risks.length + ' most severe')) +
      (failed
        ? column('Collection', 'X isn’t collecting', null, '<p class="tp-panel__say">' + esc(D.v2.failure.title) + '</p><p class="sg-fine">' + esc(D.v2.failure.detail) + '</p>' + S.runsChart(), '<span class="tp-collect">' + S.btn(state.checking ? 'Checking…' : 'Check X now', 'cfg-check', { tone: 'ink', icon: 'refresh', disabled: state.checking }) + '<span class="sg-credits">' + esc(D.v2.failure.note) + '</span></span>')
        : column('Since this report', S.sinceLine(), news.length || null, sinceList.length ? sinceList.map(function (n) {
          return S.post(n, 'risk');
        }).join('') : '<p class="sg-fine">' + esc(D.v2.since.thinNote) + '</p>', news.length > 3 ? linkBtn('since-toggle', state.sinceOpen ? 'Show fewer' : 'Show all ' + news.length) : '')) +
      column('Uncertain mentions', 'Not counted unless you confirm', unc.length, unc.map(S.uncertainRow).join('')) +
      '</div>' + S.basisRow() + S.footerLine() + '</div>'
    );
  }

  S.designs.topics = { market: market, sentiment: sentiment };
})();
