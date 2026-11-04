/* Timeline: the page organised by when. A chart sits at the top of both pages and
   shows the rhythm, and any stop, before a word is read; everything below follows the
   same dates. Things open in place, under their own row. */
(function () {
  var S = window.SG;
  var D = S.data;
  var state = S.state;
  var esc = S.esc;
  var icon = S.icon;

  function chevron(open) {
    return icon(open ? 'chevron-up' : 'chevron-down', 15);
  }
  /* --------------------------------------------------------------------- market */

  /* three lanes on the 30-day window, then the days since research last ran, drawn as
     what they are: a stretch with nothing in it */
  function marketChart(list) {
    var c = S.counts();
    function t(id, text) {
      return '<button type="button" class="sg-tab' + (state.filter === id ? ' is-on' : '') + '" data-act="filter" data-id="' + id + '">' + text + '<em>' + c[id] + '</em></button>';
    }
    var ticks = [[0, 'Aug 30'], [8, 'Sep 7'], [15, 'Sep 14'], [22, 'Sep 21'], [29, 'Sep 28']];
    function x(day) {
      return 3 + (day / 29) * 91;
    }
    var lanes = ['market', 'audience', 'competitor'].map(function (k) {
      var mine = list.filter(function (f) {
        return f.kind === k && !state.justHidden[f.id];
      });
      var seen = {};
      var dots = mine.slice().sort(function (a, b) {
        return (a.dir ? 1 : 0) - (b.dir ? 1 : 0);
      }).map(function (f) {
        seen[f.day] = (seen[f.day] || 0) + 1;
        var step = seen[f.day] - 1;
        var tone = f.dir ? (f.dirTone === 'risk' ? 'amber' : 'green') : '';
        return '<button type="button" class="tl-dot" style="left:calc(' + x(f.day) + '% - ' + step * 17 + 'px);z-index:' + (10 - step) + '" data-act="finding-jump" data-id="' + f.id + '" data-tip="' + esc(S.headline(f)) + '" aria-label="' + esc(S.headline(f)) + '">' + S.subjectLogo(f) + (tone ? '<i class="is-' + tone + '"></i>' : '') + '</button>';
      }).join('');
      return '<div class="tl-lane"><span class="tl-lane__name">' + S.tile(S.KIND[k].icon, S.KIND[k].hue, 'sm') + S.KIND[k].label + '</span><div class="tl-lane__track">' + dots + '</div></div>';
    }).join('');
    var running = state.research === 'running';
    return (
      '<section class="sg-card tl-chart" data-rise>' + head(D.market.question, 'Each mark is a finding, placed on the day its source was posted.', { side: '<span class="sg-tabs" role="group" aria-label="Filter findings">' + t('all', 'All') + t('market', 'Market') + t('audience', 'Audience') + t('competitor', 'Competitor') + '</span>' }) +
      '<div class="tl-plot"><div class="tl-plot__main">' + lanes + '<div class="tl-axis"><span class="tl-lane__name"></span><div class="tl-axis__ticks">' + ticks.map(function (k) {
        return '<span style="left:' + x(k[0]) + '%">' + k[1] + '</span>';
      }).join('') + '</div></div></div>' +
      '<div class="tl-plot__gap"><b>' + (running ? 'Reading now' : esc(state.ran)) + '</b><small>' + (running ? 'Research is running' : 'since research last ran') + '</small>' + S.runResearchBtn('ink') + '</div></div>' +
      '<div class="tl-key"><span><i class="is-green"></i>Opportunity</span><span><i class="is-amber"></i>Possible risk</span><span><i></i>No direction</span></div></section>'
    );
  }

  function findingRow(f) {
    if (state.justHidden[f.id]) return S.hiddenLine(f);
    var open = !!state.opened[f.id];
    return (
      '<div class="tl-row' + (open ? ' is-open' : '') + '" data-row="' + f.id + '"><button type="button" class="tl-row__bar" data-act="finding-open" data-id="' + f.id + '" aria-expanded="' + open + '">' + S.subjectLogo(f) + '<span class="tl-row__text"><b>' + esc(S.headline(f)) + '</b><small>' + (f.about && f.kind === 'competitor' ? esc(f.about.name) : S.KIND[f.kind].label) + ' · ' + S.plural(f.sources.length, 'source') + (f.discussion ? ' · Discussion open' : '') + '</small></span>' + S.dirLab(f) + (f.rel ? S.ring(f.rel, 32) : '') + chevron(open) + '</button>' +
      (open ? '<div class="tl-open">' + S.findingBody(f) + '<div class="tl-open__acts">' + S.askBtn('finding', f.id, f.discussion, 'ink') + S.ignoreBtn(f.id) + '</div></div>' : '') + '</div>'
    );
  }

  /* days, newest first, on one line down the page */
  function river(groups, rowFn) {
    return (
      '<div class="tl-river">' +
      groups.map(function (g) {
        return '<div class="tl-day" data-rise><div class="tl-day__when"><b>' + esc(g.date) + '</b><small>' + esc(g.note) + '</small></div><div class="tl-day__rows sg-card">' + g.items.map(rowFn).join('') + '</div></div>';
      }).join('') +
      '</div>'
    );
  }
  function byDate(list, keyFn, note) {
    var groups = [];
    list.forEach(function (it) {
      var k = keyFn(it);
      var g = groups.filter(function (x) {
        return x.date === k;
      })[0];
      if (!g) {
        g = { date: k, items: [] };
        groups.push(g);
      }
      g.items.push(it);
    });
    groups.forEach(function (g) {
      g.note = note(g.items.length);
    });
    return groups;
  }

  function market() {
    if (state.trendRun) return '<div class="sg-page tl">' + S.topBar({ noRun: true }) + S.trendReport() + '</div>';
    var list = S.feed();
    var bySource = state.sort === 'source';
    var groups = byDate(
      bySource
        ? list.slice().sort(function (a, b) {
            return b.day - a.day || (b.dir ? 1 : 0) - (a.dir ? 1 : 0);
          })
        : list,
      function (f) {
        return bySource ? f.posted || f.found : 'Found ' + f.found;
      },
      function (n) {
        return S.plural(n, 'finding');
      }
    );
    return (
      '<div class="sg-page tl">' + S.topBar({ noRun: true }) + marketChart(list) +
      '<div class="tl-sec" data-rise><h2>By date</h2><span>' + list.length + '</span><label class="sg-select tl-sec__tool" title="Sort">' + icon('sort', 14) + '<select aria-label="Sort" data-change="sort"><option value="source"' + (bySource ? ' selected' : '') + '>By newest source</option><option value="research"' + (bySource ? '' : ' selected') + '>By research time</option></select></label></div>' +
      river(groups, findingRow) + S.restoreBar() +
      '<section class="tl-context" data-rise>' + S.researchLine() + S.attentionBar() + '</section></div>'
    );
  }

  /* ------------------------------------------------------------------ sentiment */

  /* A card's title: big enough to find from across the page, with room under it. Every
     card starts the same way, so the titles make one straight edge down the page. An icon
     goes on a title whose rows don't already carry their own. */
  function head(title, note, o) {
    o = o || {};
    return '<header class="tl-head">' + (o.icon ? S.tile(o.icon, o.hue) : '') + '<div class="tl-head__text"><div class="tl-head__line"><h2>' + esc(title) + '</h2>' + (o.after || '') + '</div>' + (note ? '<p>' + esc(note) + '</p>' : '') + '</div>' + (o.side ? '<div class="tl-head__side">' + o.side + '</div>' : '') + '</header>';
  }

  /* The collection runs are the real daily counts: the seven up to the report add up
     to its 170 mentions. */
  function dailyCounts(thin) {
    var runs = D.runs.slice().reverse().filter(function (r) {
      return r.trigger === 'Schedule' && r.mentions !== null;
    }).map(function (r) {
      return { day: +r.day.replace('Oct ', ''), mentions: r.mentions, status: r.status };
    });
    if (!thin) return runs;
    return runs.slice(0, 7).map(function (b, i) {
      return { day: b.day, mentions: D.v2.thinDaily[i], status: b.status };
    });
  }
  function riskCounts(r) {
    var pins = {};
    function add(date) {
      if (date.indexOf('Oct') !== 0) return;
      var d = +date.replace('Oct ', '');
      pins[d] = (pins[d] || 0) + 1;
    }
    if (state.report === 'latest' || r.thin) r.risks.forEach(function (p) {
      add(p.date);
    });
    S.newRisks().forEach(function (n) {
      add(n.date);
    });
    return pins;
  }

  /* A line with a fading wash, on solid hairlines: the design system's single-series
     form. The past report has no daily counts, so it's its 30-day average as a dashed
     gray reference. Each period sits under its own tab, which is the report picker. */
  function sentimentChart() {
    var r = S.report();
    var thin = !!r.thin;
    var failed = state.sstate === 'failure';
    var days = dailyCounts(thin);
    var n = days.length;
    var left = thin ? 0 : 12;
    var ymax = thin ? 20 : 80;
    var ticks = thin ? [0, 5, 10, 15, 20] : [0, 20, 40, 60, 80];
    function x(i) {
      return left + ((i + 0.5) / n) * (100 - left);
    }
    function y(v) {
      return 100 - (v / ymax) * 100;
    }
    var line = days.map(function (b, i) {
      return x(i) + ',' + y(b.mentions);
    }).join(' ');
    var peakAt = 0;
    days.forEach(function (b, i) {
      if (b.mentions > days[peakAt].mentions) peakAt = i;
    });
    var endAt = n - 1;
    var past = D.reports.past;
    var pastAvg = past.mix.mentions / 30;
    var pastOn = state.report === 'past' && !thin;
    var latestCount = days.filter(function (b) {
      return b.day <= 14;
    }).length;
    var latestW = (latestCount / n) * (100 - left);
    var sinceW = 100 - left - latestW;
    var pins = riskCounts(r);
    var latest = thin ? r : D.reports.latest;
    function tab(on, width, act, id, label, sub) {
      return '<button type="button" class="tl-tab' + (on ? ' is-on' : '') + '" style="width:' + width + '%" data-act="' + act + '"' + (id ? ' data-id="' + id + '"' : '') + '><b>' + esc(label) + '</b><small>' + esc(sub) + '</small></button>';
    }
    var points = days.map(function (b, i) {
      var key = i === peakAt || i === endAt;
      return (
        '<span class="tl-pt' + (key ? ' is-key' : '') + (i > latestCount - 1 ? ' is-new' : '') + (i >= n - 2 ? ' is-tail' : '') + '" style="left:' + x(i) + '%;top:' + y(b.mentions) + '%" data-tip="Oct ' + b.day + ' · ' + b.mentions + ' mentions · ' + b.status + '" tabindex="0">' + (key ? '<em>' + b.mentions + '</em>' : '') + '</span>'
      );
    }).join('');
    var next = failed
      ? '<div class="tl-plot__gap is-alert"><b>Stopped</b><small>since Oct 16</small>' + S.btn(state.checking ? 'Checking…' : 'Check X now', 'cfg-check', { tone: 'ink', icon: 'refresh', disabled: state.checking }) + '<span class="sg-credits">' + esc(D.v2.failure.note) + '</span></div>'
      : '<div class="tl-plot__gap is-next"><b>Oct 21</b><small>next report</small><span class="sg-fine">Every week at 08:00</span></div>';
    return (
      '<section class="sg-card tl-chart has-head" data-rise>' + head(D.sentiment.question, 'Mentions collected each day, with risk posts under them.', { side: '<small>' + esc(D.v2.meta) + '</small>' }) +
      '<div class="tl-plot"><div class="tl-sc">' +
      '<div class="tl-tabs">' + (thin ? '' : tab(pastOn, left, 'report', 'past', 'Past', past.verdict.split(' · ')[0])) + tab(!pastOn, latestW, 'report', 'latest', 'Latest report · ' + latest.window, thin ? 'Too few for a split' : latest.verdict) + (thin ? '' : tab(state.sinceOpen, sinceW, 'since-toggle', '', 'Since', (S.sinceLine().split(' · ')[1] || ''))) + '</div>' +
      '<div class="tl-area">' + ticks.map(function (t) {
        return '<i class="tl-grid" style="top:' + y(t) + '%"><u>' + t + '</u></i>';
      }).join('') +
      (thin ? '' : '<span class="tl-band' + (pastOn ? ' is-on' : '') + '" style="left:0;width:' + left + '%"></span>') + '<span class="tl-band' + (pastOn ? '' : ' is-on') + '" style="left:' + left + '%;width:' + latestW + '%"></span>' +
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="tlWash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--chart-1)" stop-opacity=".26"/><stop offset="1" stop-color="var(--chart-1)" stop-opacity="0"/></linearGradient></defs><polygon points="' + x(0) + ',100 ' + line + ' ' + x(endAt) + ',100" fill="url(#tlWash)"/>' +
      (thin ? '' : '<line class="tl-ref" x1="0" x2="' + left + '" y1="' + y(pastAvg) + '" y2="' + y(pastAvg) + '"/>') + '<polyline class="tl-line' + (thin ? ' is-thin' : '') + '" points="' + line + '"/></svg>' + points +
      (thin ? '' : '<span class="tl-reflabel" style="left:' + left / 2 + '%;top:' + y(pastAvg) + '%">≈' + Math.round(pastAvg) + ' a day</span>') + '</div>' +
      '<div class="tl-days">' + (thin ? '' : '<span style="left:' + left / 2 + '%">Sep 7 – Oct 7</span>') + days.map(function (b, i) {
        return '<span style="left:' + x(i) + '%">' + (i === 0 ? 'Oct ' : '') + b.day + '</span>';
      }).join('') + '</div>' +
      '<div class="tl-risks"><u>Risk</u>' + days.map(function (b, i) {
        return pins[b.day] ? '<span style="left:' + x(i) + '%" title="' + S.plural(pins[b.day], 'risk post') + ' on Oct ' + b.day + '">' + pins[b.day] + '</span>' : '';
      }).join('') + '</div></div>' + next + '</div></section>'
    );
  }

  function readPanel(r) {
    var top = head(state.report === 'past' && !r.thin ? 'Past report' : 'Latest report', null, {
      icon: 'file',
      hue: 'var(--cyan-600)',
      after: S.reportPicker(),
      side: '<button type="button" class="sg-link" data-act="report-history">All reports</button>'
    });
    if (r.thin) {
      return (
        '<section class="sg-card tl-read" data-rise>' + top + '<div class="tl-read__body"><div class="tl-read__main"><h2>' + esc(r.short) + '</h2><p class="sg-fine">' + esc(r.receipt) + '</p></div><div class="tl-read__side"><div class="tl-cells">' + r.stats.map(function (s) {
          return S.cell(s.value, s.label);
        }).join('') + '</div><div class="sg-oneline"><span class="sg-oneline__tag">In one line</span><p>' + esc(r.sayShort) + '</p></div></div></div></section>'
      );
    }
    var m = r.mix;
    var pull = S.citedQuote(r);
    return (
      '<section class="sg-card tl-read" data-rise>' + top + '<div class="tl-read__body"><div class="tl-read__main"><h2>' + esc(r.short) + '</h2>' + S.shareBlock(m) + '</div><div class="tl-read__side"><div class="tl-cells">' + S.cell(m.mentions, 'mentions') + S.cell(r.riskTotal, 'risk posts') + '<span class="sg-cell">' + S.microTrend() + '<small>Last ' + S.trend().length + ' reports</small></span></div>' +
      (pull ? '<div class="sg-bubbles">' + S.quoteBubble(pull) + '</div>' : '') + '</div></div>' +
      (state.readMore ? '<p class="sg-claim tl-read__more">' + esc(r.headline) + ' ' + esc(r.sub) + '</p><div class="tl-read__more">' + S.cites(r) + '</div>' : '') +
      '<div class="tl-read__foot"><button type="button" class="sg-fold' + (state.readMore ? ' is-open' : '') + '" data-act="read-more" aria-expanded="' + state.readMore + '">' + icon('chevron-right', 13) + '<span>' + (state.readMore ? 'Show less' : 'The full summary') + '</span></button><span class="sg-fine">' + esc(r.receipt) + '</span></div></section>'
    );
  }

  /* dated rows, newest first */
  function riverDays(items, kind, noteFn) {
    return byDate(items, function (it) {
      return it.date;
    }, noteFn).map(function (g) {
      return '<div class="tl-rday"><div class="tl-rday__when"><b>' + esc(g.date) + '</b></div><div class="tl-rday__rows">' + g.items.map(function (it) {
        return S.post(it, kind, { noDate: true, row: true });
      }).join('') + '</div></div>';
    }).join('');
  }
  /* What came in since the report and what the report found share one card, because they're
     one stretch of time: newest at the top, the report's date where one hands over to the
     other. Since shows its newest rows at rest, so it's never a title with nothing under it. */
  function riverPanel(r, failed) {
    var news = S.newRisks();
    var others = news.filter(function (n) {
      return n.sev !== 'critical';
    });
    var attention = (r.thin || state.allAttention ? r.risks : r.risks.slice(0, 5)).slice().sort(function (a, b) {
      return dayOf(b.date) - dayOf(a.date);
    });
    function none() {
      return '';
    }
    function stat(value, label) {
      return '<span class="tl-stat"><b>' + value + '</b><small>' + esc(label) + '</small></span>';
    }
    function link(act, text) {
      return '<button type="button" class="sg-link tl-rv__more" data-act="' + act + '">' + esc(text) + '</button>';
    }
    function rows(items, kind, more) {
      return '<div class="tl-rv__rows">' + riverDays(items, kind, none) + more + '</div>';
    }
    var shown = failed ? S.urgentRisks().concat(state.allNew ? others : []) : state.sinceOpen ? news : news.slice(0, 2);
    var sinceMore = failed ? link('all-new', state.allNew ? 'Show fewer' : 'Show ' + others.length + ' more new risks') : news.length > 2 ? link('since-toggle', state.sinceOpen ? 'Show fewer' : 'Show all ' + news.length + ' new risks') : '';
    return (
      '<section class="sg-card tl-rv" data-rise><div class="tl-rv__group' + (failed ? ' is-alert' : '') + '">' +
      head('Since this report', D.v2.since.explain, {
        icon: failed ? 'alert' : 'radio',
        hue: failed ? 'var(--sg-amber)' : 'var(--cyan-600)',
        side: stat(state.sstate === 'thin' ? D.v2.thin.sincePosts : D.v2.since.posts, 'new posts') + stat(news.length, news.length === 1 ? 'new risk' : 'new risks')
      }) +
      (shown.length ? rows(shown, 'risk', sinceMore) : '<p class="sg-fine tl-rv__note">' + esc(D.v2.since.thinNote) + '</p>') + '</div>' +
      '<div class="tl-rv__mark"><b>' + (!r.thin && state.report === 'past' ? 'Oct 7' : 'Oct 14') + '</b><span>Report generated</span></div>' +
      '<div class="tl-rv__group">' + head('Needs your attention', r.attentionHead, { icon: 'alert', hue: 'var(--sg-amber)' }) +
      rows(attention, 'post', r.thin ? '' : link('all-attention', state.allAttention ? 'Show fewer' : 'Show the ' + r.risks.length + ' most severe')) + '</div></section>'
    );
  }

  /* gained and lost around one axis: position says which way, so the pair can stay in
     one family and the row still reads at a glance */
  function themesPanel(r) {
    var peak = 0;
    r.themes.forEach(function (t) {
      peak = Math.max(peak, t.pos, t.neg);
    });
    return (
      '<section class="sg-card tl-th" data-rise>' + head('Themes', r.themesHead) + '<div class="tl-mkey"><span></span><span class="is-neg">Negative</span><span class="is-pos">Positive</span><span>Mentions</span><span></span></div>' +
      r.themes.map(function (t) {
        var open = !!state.openThemes[t.id];
        return (
          '<div class="tl-mrow' + (open ? ' is-open' : '') + '"><button type="button" class="tl-mrow__bar" data-act="theme-open" data-id="' + t.id + '" aria-expanded="' + open + '"><span class="tl-mrow__name">' + S.themeTile(t) + '<b>' + esc(t.name) + '</b></span><span class="tl-mir is-neg"><small>' + (t.neg || '') + '</small><i data-grow style="width:' + (t.neg / peak) * 86 + '%"></i></span><span class="tl-mir is-pos"><i data-grow style="width:' + (t.pos / peak) * 86 + '%"></i><small>' + (t.pos || '') + '</small></span><em>' + t.mentions + '</em>' + chevron(open) + '</button>' + (open ? '<div class="tl-mrow__open">' + S.themeBody(t) + '</div>' : '') + '</div>'
        );
      }).join('') + '<p class="sg-fine">' + esc(r.themeFine) + '</p></section>'
    );
  }

  function sentiment() {
    var r = S.report();
    var failed = state.sstate === 'failure';
    if (S.noReport()) return '<div class="sg-page tl">' + S.topBar() + S.pastBanner() + '<div class="sg-card sg-noreport" data-rise>This run produced no report.</div>' + S.footerStatus() + '</div>';
    var posts = r.thin ? (state.morePosts ? r.posts : r.posts.slice(0, 3)) : null;
    return (
      '<div class="sg-page tl is-sentiment">' + S.topBar() + S.pastBanner() + sentimentChart() + readPanel(r) + S.reportHistoryBlock() + riverPanel(r, failed) +
      (r.thin
        ? '<section class="sg-card tl-th" data-rise>' + head('Posts you can check', r.postsSub) + '<div class="sg-bubbles">' + posts.map(S.quoteBubble).join('') + '</div><button type="button" class="sg-link" data-act="posts-more">' + (state.morePosts ? 'Show fewer' : 'Show 3 more posts') + '</button></section>'
        : themesPanel(r)) +
      '<section class="sg-card tl-th" data-rise>' + head('Uncertain mentions', 'Not counted unless you confirm') + '<div class="tl-unclist">' + S.uncertainRows().map(S.uncertainRow).join('') + '</div></section>' +
      S.basisRow() + S.footerStatus() + '</div>'
    );
  }
  function dayOf(date) {
    var parts = date.split(' ');
    return (parts[0] === 'Oct' ? 100 : 0) + +parts[1];
  }

  S.designs.timeline = { market: market, sentiment: sentiment };
})();
