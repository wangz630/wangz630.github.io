/* The pieces the three redesigns draw alike: labels, tiles, the sentiment split,
   the trend report, the collection dialog, the drawers, the chat window, the corner
   menu. Now keeps the product's own markup (now.js) and only borrows the chat and
   the menu from here. */
(function () {
  var S = window.SG;
  var D = S.data;
  var state = S.state;
  var esc = S.esc;
  var icon = S.icon;

  var KIND = {
    market: { label: 'Market', icon: 'trending', hue: 'var(--sg-market)' },
    audience: { label: 'Audience', icon: 'users', hue: 'var(--sg-audience)' },
    competitor: { label: 'Competitor', icon: 'crosshair', hue: 'var(--sg-competitor)' }
  };

  function tile(name, hue, size) {
    return '<span class="sg-tile' + (size ? ' is-' + size : '') + '" style="--t:' + hue + '">' + icon(name, size === 'sm' ? 12 : size === 'lg' ? 18 : 14) + '</span>';
  }
  function kindTile(k, size) {
    return tile(KIND[k].icon, KIND[k].hue, size);
  }

  /* one label recipe: a tinted fill, never a ring. Taxonomy is the product's. */
  function lab(text, tone, title) {
    return '<span class="sg-lab is-' + tone + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(text) + '</span>';
  }
  function dirLab(f) {
    if (f.dir === 'opportunity') return lab('Opportunity', 'green');
    if (f.dir === 'watch') return lab(f.dirNote || 'Watch', f.dirTone === 'risk' ? 'amber' : 'green-soft', f.watchTitle);
    return '';
  }
  /* Critical keeps its weight without red: the design system keeps red for falling
     data, so the ladder is a deeper amber, a softer amber, grey. */
  function pill(text, tone) {
    return '<span class="sg-pill is-' + tone + '">' + esc(text) + '</span>';
  }
  function sevLab(r) {
    return pill(r.label, r.sev === 'critical' ? 'strong' : r.sev === 'warning' ? 'soft' : 'grey');
  }
  function postSevLab(sev) {
    return pill(sev === 'high' ? 'High' : 'Medium', sev === 'high' ? 'strong' : 'soft');
  }
  function leanLab(lean, text) {
    return pill(text, lean === 'negative' ? 'soft' : lean === 'positive' ? 'green' : 'grey');
  }

  /* a mark for where something came from: the site's first letter on a quiet tile,
     X and the two communities by their own sign. No favicon requests. */
  function srcMark(src, size) {
    var s = (src.src || '').toLowerCase();
    var mark;
    if (s === 'x') mark = S.xLogo(size === 'lg' ? 14 : 10);
    else if (s === 'reddit') mark = 'r';
    else if (s === 'hackernews') mark = 'Y';
    else mark = (S.domain(src.href || '') || s || '?').charAt(0).toUpperCase();
    return '<span class="sg-mark' + (size ? ' is-' + size : '') + '">' + mark + '</span>';
  }
  function letterMark(name, size) {
    return '<span class="sg-mark is-ink' + (size ? ' is-' + size : '') + '">' + esc(name.charAt(0)) + '</span>';
  }

  /* ---------------------------------------------------------- logos and marks */

  /* Who or where something is from, by its own logo: the site's favicon, with the
     first letter under it for when the image can't load. */
  var FAVICON = 'https://www.google.com/s2/favicons?sz=64&domain=';
  function logo(domain, name, size) {
    if (domain === 'x.com') return '<span class="sg-logo is-x' + (size ? ' is-' + size : '') + '" title="X">' + S.xLogo(size === 'lg' ? 16 : size === 'sm' ? 10 : 12) + '</span>';
    return '<span class="sg-logo' + (size ? ' is-' + size : '') + '" title="' + esc(name || domain) + '"><b>' + esc((name || domain || '?').charAt(0).toUpperCase()) + '</b>' + (domain ? '<img src="' + FAVICON + encodeURIComponent(domain) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') + '</span>';
  }
  function sourceDomain(src) {
    var k = (src.src || '').toLowerCase();
    if (k === 'x') return 'x.com';
    if (k === 'reddit') return 'reddit.com';
    if (k === 'hackernews') return 'news.ycombinator.com';
    return S.domain(src.href);
  }
  /* a finding's sources, as a row of small logos */
  function sourceLogos(f, size) {
    return '<span class="sg-logos">' + f.sources.map(function (src) {
      return logo(sourceDomain(src), S.domain(src.href), size || 'sm');
    }).join('') + '</span>';
  }
  /* who the finding is about, or failing that where it came from */
  function subjectLogo(f, size) {
    if (f.about) return logo(f.about.domain, f.about.name, size);
    var src = f.sources[0];
    return logo(sourceDomain(src), S.domain(src.href), size);
  }
  /* relevance as a ring: the number inside, the sweep around it */
  function ring(pct, size) {
    var s = size || 34, r = 15.5, c = 2 * Math.PI * r;
    return (
      '<span class="sg-ring" style="width:' + s + 'px;height:' + s + 'px" title="' + pct + '% relevance"><svg viewBox="0 0 36 36" width="' + s + '" height="' + s + '" aria-hidden="true"><circle cx="18" cy="18" r="' + r + '" fill="none" class="sg-ring__track"/><circle cx="18" cy="18" r="' + r + '" fill="none" class="sg-ring__fill" stroke-dasharray="' + (pct / 100) * c + ' ' + c + '" transform="rotate(-90 18 18)"/></svg><b>' + pct + '</b></span>'
    );
  }
  function avatar(handle, size) {
    var clean = handle.replace(/[^a-zA-Z0-9]/g, '');
    var hue = 1 + (clean.charCodeAt(0) + clean.length) % 8;
    return '<span class="sg-avatar' + (size ? ' is-' + size : '') + '" style="--t:var(--identity-' + hue + ')" title="' + esc(handle) + '">' + esc(clean.charAt(0).toUpperCase()) + '<i>' + S.xLogo(7) + '</i></span>';
  }
  function fact(ic, hue, label, value) {
    return '<div class="sg-factrow">' + tile(ic, hue) + '<div><span>' + esc(label) + '</span>' + value + '</div></div>';
  }

  /* small drawn scenes, one per research topic, so a block says what it's about before
     a word is read */
  var ILLUS = {
    checkout:
      '<rect x="46" y="16" width="82" height="52" rx="9" fill="#c9dcfb" transform="rotate(8 87 42)"/><g transform="rotate(-5 76 50)"><rect x="32" y="26" width="88" height="56" rx="9" fill="#fff"/><rect x="32" y="37" width="88" height="10" fill="#3987f3" opacity=".85"/><rect x="42" y="56" width="26" height="5" rx="2.5" fill="#d7e6fd"/><rect x="42" y="66" width="16" height="5" rx="2.5" fill="#d7e6fd"/><rect x="98" y="58" width="13" height="13" rx="4" fill="#ecf1f0"/></g><circle cx="128" cy="24" r="12" fill="#43ba51"/><path d="m122.8 24 3.6 3.6 6.8-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    ai:
      '<g><rect x="30" y="22" width="30" height="30" rx="7" fill="#fff"/><rect x="66" y="22" width="30" height="30" rx="7" fill="#e2e3fc"/><rect x="30" y="58" width="30" height="24" rx="7" fill="#e2e3fc"/><rect x="66" y="58" width="30" height="24" rx="7" fill="#fff"/><rect x="36" y="28" width="18" height="11" rx="3" fill="#c7c9f8"/><rect x="36" y="43" width="11" height="3.5" rx="1.75" fill="#c7c9f8"/><rect x="72" y="64" width="18" height="8" rx="3" fill="#c7c9f8"/></g><path d="M116 14c1.6 9 4 11.4 13 13-9 1.6-11.4 4-13 13-1.6-9-4-11.4-13-13 9-1.6 11.4-4 13-13Z" fill="#8b7cf0"/><path d="M134 44c.8 4.4 2 5.6 6.4 6.4-4.4.8-5.6 2-6.4 6.4-.8-4.4-2-5.6-6.4-6.4 4.4-.8 5.6-2 6.4-6.4Z" fill="#a5a8fa"/>',
    store:
      '<rect x="40" y="38" width="80" height="46" rx="5" fill="#fff"/><path d="M36 22h88l8 20a11 11 0 0 1-21.6 2 11 11 0 0 1-21.2 0 11 11 0 0 1-21.2 0 11 11 0 0 1-21.2 0A11 11 0 0 1 28 42Z" fill="#7fd6cc"/><path d="M58 22h14l-2 22H49.6ZM88 22h14l9 22H90Z" fill="#fff" opacity=".65"/><rect x="50" y="56" width="26" height="28" rx="3" fill="#d5f0ec"/><rect x="84" y="56" width="26" height="17" rx="3" fill="#ecf1f0"/><circle cx="71" cy="71" r="1.8" fill="#0f9d8f"/>',
    other:
      '<circle cx="80" cy="48" r="32" fill="#fff"/><path d="M48 48h64M80 16c9 9 14 20 14 32s-5 23-14 32c-9-9-14-20-14-32s5-23 14-32Z" fill="none" stroke="#b1b5bb" stroke-width="2"/><circle cx="112" cy="24" r="10" fill="#f7ce84"/><path d="M112 19v5.5M112 28.4v.1" stroke="#a1640b" stroke-width="2.4" stroke-linecap="round"/>',
    perf:
      '<rect x="30" y="14" width="100" height="70" rx="9" fill="#fff"/><path d="M30 23a9 9 0 0 1 9-9h82a9 9 0 0 1 9 9v5H30Z" fill="#d7e6fd"/><circle cx="40" cy="21" r="2.4" fill="#7daff8"/><circle cx="48" cy="21" r="2.4" fill="#b0cdfa"/><path d="M42 62h13l6-16 10 26 8-20 6 10h31" fill="none" stroke="#3987f3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="128" cy="20" r="12" fill="#f7ce84"/><path d="M128 14v7M128 25.6v.1" stroke="#a1640b" stroke-width="2.6" stroke-linecap="round"/>',
    ease:
      '<rect x="28" y="20" width="104" height="60" rx="9" fill="#fff"/><rect x="40" y="32" width="48" height="8" rx="4" fill="#e2e3fc"/><rect x="40" y="46" width="32" height="8" rx="4" fill="#ecf1f0"/><rect x="92" y="54" width="30" height="16" rx="8" fill="#a5a8fa"/><circle cx="114" cy="62" r="5.4" fill="#fff"/><path d="M84 52l6 24 5.4-8.6 9.6-1.8Z" fill="#141416" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>',
    service:
      '<path d="M40 22h62a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H60l-14 12v-12h-6a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10Z" fill="#fff"/><circle cx="56" cy="42" r="3.4" fill="#7fd6cc"/><circle cx="71" cy="42" r="3.4" fill="#7fd6cc"/><circle cx="86" cy="42" r="3.4" fill="#7fd6cc"/><path d="M100 44h22a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-3v9l-10-9H100a8 8 0 0 1-8-8V52a8 8 0 0 1 8-8Z" fill="#0f766e"/><path d="M103 56h16M103 63h10" stroke="#d5f0ec" stroke-width="2.6" stroke-linecap="round"/>',
    price:
      '<path d="M64 18h40a8 8 0 0 1 8 8v40L74 88 42 56Z" fill="#fff" transform="rotate(6 80 52)"/><circle cx="96" cy="32" r="5" fill="#f7c9dd"/><path d="M62 54l22-13M66 64l22-13" stroke="#ecf1f0" stroke-width="4" stroke-linecap="round"/><circle cx="124" cy="62" r="16" fill="#f4a9c9"/><path d="M124 52v20M129 56.6c-1-1.6-3-2.6-5-2.6-3 0-5.4 1.6-5.4 4 0 5.4 11 3 11 8.4 0 2.4-2.6 4-5.6 4-2.4 0-4.6-1-5.6-3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
    idea:
      '<path d="M80 14a26 26 0 0 0-16 46.5c3 2.4 5 5.5 5 9.5h22c0-4 2-7.1 5-9.5A26 26 0 0 0 80 14Z" fill="#fff"/><rect x="69" y="72" width="22" height="6" rx="3" fill="#b8f3fb"/><rect x="72" y="81" width="16" height="5" rx="2.5" fill="#b8f3fb"/><path d="M71 42l6 6 11-13" fill="none" stroke="#0ea5b8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M122 18c1.4 7.6 3.4 9.6 11 11-7.6 1.4-9.6 3.4-11 11-1.4-7.6-3.4-9.6-11-11 7.6-1.4 9.6-3.4 11-11Z" fill="#0ea5b8"/><path d="M36 52c.9 4.8 2.2 6.1 7 7-4.8.9-6.1 2.2-7 7-.9-4.8-2.2-6.1-7-7 4.8-.9 6.1-2.2 7-7Z" fill="#7ce8f7"/>',
    versus:
      '<rect x="34" y="50" width="28" height="34" rx="5" fill="#fff"/><rect x="66" y="30" width="28" height="54" rx="5" fill="#a5a8fa"/><rect x="98" y="58" width="28" height="26" rx="5" fill="#fff"/><path d="M80 12l3.6 7.4 8.2 1.2-6 5.8 1.4 8.2L80 30.8l-7.2 3.8 1.4-8.2-6-5.8 8.2-1.2Z" fill="#4338ca"/>'
  };
  function illus(id) {
    return '<svg class="sg-illus" viewBox="0 0 160 96" aria-hidden="true">' + (ILLUS[id] || '') + '</svg>';
  }

  /* the page's one-line head: name, the two pages on a glass step bar, what's current */
  function topBar(opts) {
    opts = opts || {};
    var market = state.page === 'market';
    function step(id, ic, text) {
      return '<button type="button" class="sg-step' + (state.page === id ? ' is-on' : '') + '" data-act="page" data-id="' + id + '">' + icon(ic, 14) + text + '</button>';
    }
    var running = state.research === 'running';
    return (
      '<header class="sg-top" data-rise><h1>Signal</h1><span class="sg-steps">' + step('market', 'trending', 'Market') + step('sentiment', 'chat', 'Sentiment') + '</span><span class="sg-top__right">' +
      (market
        ? (running ? '' : '<span class="sg-stamp">' + icon('clock', 13) + 'Research ran ' + esc(state.ran) + '</span>') + (opts.noRun && !running ? '' : runResearchBtn('ink'))
        : '<span class="sg-stamp">' + icon('clock', 13) + 'Updated Oct 14 · next report Oct 21</span>') +
      settingsBtn() + '</span></header>'
    );
  }

  /* -------------------------------------------------------- sentiment marks */

  /* part-to-whole: one continuous bar, labelled directly */
  function strip(pos, neu, neg, big) {
    var parts = [
      ['pos', pos],
      ['neu', neu],
      ['neg', neg]
    ]
      .filter(function (p) {
        return p[1] > 0;
      })
      .map(function (p) {
        return '<i class="sg-strip__' + p[0] + '" style="flex-grow:' + p[1] + '"></i>';
      })
      .join('');
    return '<span class="sg-strip' + (big ? ' is-big' : '') + '" role="img" aria-label="' + pos + ' positive, ' + neu + ' neutral, ' + neg + ' negative" data-grow>' + parts + '</span>';
  }
  function stripLegend(m) {
    return (
      '<span class="sg-strip-key">' +
      '<span><i class="sg-strip__pos"></i>Positive <b>' + m.pos + '%</b></span>' +
      '<span><i class="sg-strip__neu"></i>Neutral <b>' + m.neu + '%</b></span>' +
      '<span><i class="sg-strip__neg"></i>Negative <b>' + m.neg + '%</b></span>' +
      '</span>'
    );
  }
  /* the split, read from either end: the two big figures sit over their own side */
  function shareBlock(m) {
    return (
      '<div class="sg-share"><div class="sg-share__nums"><span><b>' + m.pos + '%</b><small><i class="sg-strip__pos"></i>Positive</small></span><span class="is-mid"><small><i class="sg-strip__neu"></i>Neutral ' + m.neu + '%</small></span><span class="is-end"><b>' + m.neg + '%</b><small><i class="sg-strip__neg"></i>Negative</small></span></div>' + strip(m.pos, m.neu, m.neg, true) + '</div>'
    );
  }
  /* the design system's ring: rounded segments, 2px surface gaps, a figure at its centre */
  function donut(m, size, center, sub) {
    var r = 16, stroke = 5.5, c = 2 * Math.PI * r, s = size || 72;
    var gap = 1.4;
    var at = 0;
    var arcs = [
      ['pos', m.pos],
      ['neu', m.neu],
      ['neg', m.neg]
    ]
      .filter(function (a) {
        return a[1] > 0;
      })
      .map(function (a) {
        var len = (a[1] / 100) * c;
        var seen = Math.max(len - stroke - gap, 0.01);
        var out = '<circle class="sg-donut__' + a[0] + '" r="' + r + '" cx="20" cy="20" fill="none" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + seen + ' ' + (c - seen) + '" stroke-dashoffset="' + -(at + stroke / 2 + gap / 2) + '"/>';
        at += len;
        return out;
      })
      .join('');
    return (
      '<span class="sg-donut" style="width:' + s + 'px;height:' + s + 'px"><svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" role="img" aria-label="' + m.pos + '% positive, ' + m.neu + '% neutral, ' + m.neg + '% negative"><g transform="rotate(-90 20 20)">' + arcs + '</g></svg>' +
      (center ? '<span class="sg-donut__c"><b>' + center + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' : '') +
      '</span>'
    );
  }
  function donutLegend(m) {
    function row(k, label, pct, n) {
      return '<span><i class="sg-strip__' + k + '"></i><em>' + label + '</em><b>' + pct + '%</b><small>' + n + '</small></span>';
    }
    return '<span class="sg-donutkey">' + row('pos', 'Positive', m.pos, m.posN) + row('neu', 'Neutral', m.neu, m.neuN) + row('neg', 'Negative', m.neg, m.negN) + '</span>';
  }
  /* a theme's share of all mentions, on a hatched track, split by which way it leans */
  function themeMeter(t, total) {
    return (
      '<span class="sg-tmeter" title="' + t.pos + ' positive, ' + t.neu + ' neutral, ' + t.neg + ' negative"><span class="sg-tmeter__fill" data-grow style="width:' + (t.mentions / total) * 100 + '%">' + (t.pos ? '<i class="sg-strip__pos" style="flex-grow:' + t.pos + '"></i>' : '') + (t.neu ? '<i class="sg-strip__neu" style="flex-grow:' + t.neu + '"></i>' : '') + (t.neg ? '<i class="sg-strip__neg" style="flex-grow:' + t.neg + '"></i>' : '') + '</span></span>'
    );
  }
  /* mentions across the last reports, as a straight micro-line with the end dot */
  function microTrend() {
    var t = S.trend();
    var max = Math.max.apply(null, t.map(function (x) {
      return x.value;
    }));
    var pts = t.map(function (x, i) {
      return [t.length > 1 ? 6 + (i / (t.length - 1)) * 68 : 40, 22 - (x.value / max) * 16];
    });
    var thin = t.some(function (x) {
      return x.thin;
    });
    var last = pts[pts.length - 1];
    return (
      '<span class="sg-micro' + (thin ? ' is-thin' : '') + '" title="' + esc(t.map(function (x) {
        return x.window + ': ' + x.value;
      }).join(' · ')) + '"><svg viewBox="0 0 80 28" width="80" height="28" aria-hidden="true"><polyline points="' + pts.map(function (p) {
        return p.join(',');
      }).join(' ') + '" fill="none"/>' + pts.slice(0, -1).map(function (p) {
        return '<circle class="is-past" cx="' + p[0] + '" cy="' + p[1] + '" r="2.5"/>';
      }).join('') + '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="4"/></svg><small>' + t.map(function (x) {
        return x.value;
      }).join(' → ') + '</small></span>'
    );
  }
  function cell(value, label) {
    return '<span class="sg-cell"><b>' + value + '</b><small>' + esc(label) + '</small></span>';
  }

  /* -------------------------------------------------------------- what people said */

  var THEME = {
    'Product performance': { icon: 'activity', hue: 'var(--identity-6)', scene: 'perf' },
    'Ease of use': { icon: 'pointer', hue: 'var(--identity-2)', scene: 'ease' },
    'Customer service': { icon: 'headphones', hue: 'var(--identity-5)', scene: 'service' },
    'Price and value': { icon: 'tag', hue: 'var(--identity-4)', scene: 'price' },
    Innovation: { icon: 'spark', hue: 'var(--identity-1)', scene: 'idea' },
    'Against competitors': { icon: 'crosshair', hue: 'var(--identity-3)', scene: 'versus' }
  };
  function themeOf(t) {
    return THEME[t.name] || { icon: 'quote', hue: 'var(--text-3)', scene: 'other' };
  }
  function themeTile(t, size) {
    var m = themeOf(t);
    return tile(m.icon, m.hue, size);
  }
  function whoOf(item) {
    if (item.who) return item.who;
    var m = /x\.com\/([^/]+)/.exec(item.href || '');
    return m ? m[1] : 'X';
  }
  /* what someone wrote always wears quotation marks, so it reads as taken from a post */
  function quoted(text) {
    return '“' + text.replace(/^[“"]/, '').replace(/[”"]$/, '') + '”';
  }
  /* only what's there: "0 likes · 0 replies" says nothing */
  function engOf(eng) {
    return (eng || '').split(' · ').filter(function (p) {
      return p.charAt(0) !== '0';
    }).join(' · ');
  }
  /* a post, as a post: who said it, what they said, when. The moves take the date's
     place on hover, so nothing is held blank for them. */
  function post(item, kind, opts) {
    opts = opts || {};
    var done = state.handled[item.id];
    var meta = [opts.noDate ? '' : item.date, engOf(item.eng)].filter(Boolean).join(' · ');
    return (
      '<article class="sg-post' + (done ? ' is-done' : '') + (opts.flat ? ' is-flat' : '') + (opts.row ? ' is-row' : '') + '" role="button" tabindex="0" data-act="' + (kind === 'risk' ? 'risk-open' : 'post-open') + '" data-id="' + item.id + '"><div class="sg-post__head">' + avatar(whoOf(item), 'md') + '<b class="sg-post__who">' + esc(whoOf(item)) + '</b>' + (kind === 'risk' ? sevLab(item) : postSevLab(item.sev)) + '</div><p class="sg-post__text">' + esc(quoted(item.text)) + '</p>' +
      '<div class="sg-post__foot"><small>' + esc(meta) + '</small><span class="sg-post__acts">' + handleCtl(item.id) + (done ? '' : askBtn(kind, item.id, item.discussion)) + '</span></div></article>'
    );
  }
  function uncertainRow(u) {
    return (
      '<div class="sg-uncrow">' + logo('x.com') + '<div class="sg-uncrow__text"><p>' + esc(quoted(u.text)) + '</p><small>' + esc(u.meta) + '</small></div>' + uncertainCtl(u) + '</div>'
    );
  }
  /* the proposal's Basis & coverage: closed by default, one line till it's asked for. Its
     title is the size of the Brain page's Names & accounts row. */
  function basisRow() {
    return (
      '<section class="sg-card sg-basisrow" data-rise><button type="button" class="sg-basisrow__bar" data-act="basis-toggle" aria-expanded="' + state.basisOpen + '">' + tile('pie', 'var(--text-3)') + '<b>Basis &amp; coverage</b><small>' + esc(S.basis().summary) + '</small>' + icon(state.basisOpen ? 'chevron-up' : 'chevron-down', 15) + '</button>' + (state.basisOpen ? '<div class="sg-basisrow__body">' + basisBlock() + '</div>' : '') + '</section>'
    );
  }
  /* a section's title, on the page over its card, so titles can be read down the page */
  function sec(o) {
    return '<div class="sg-sec" data-rise><h2>' + esc(o.title) + '</h2>' + (o.count != null ? '<em>' + o.count + '</em>' : '') + (o.after || '') + (o.note ? '<small>' + esc(o.note) + '</small>' : '') + (o.side ? '<span class="sg-sec__side">' + o.side + '</span>' : '') + '</div>';
  }
  /* the report's window, as a quiet control */
  function reportPicker() {
    return (
      '<span class="sg-picker sg-picker--inline" data-pop><button type="button" class="sg-picker__btn" data-act="picker-toggle" aria-expanded="' + state.pickerOpen + '">' + esc(S.report().window) + icon('chevron-down', 13) + '</button>' + (state.pickerOpen ? pickerMenu() : '') + '</span>'
    );
  }

  /* --------------------------------------------------------------- controls */

  function btn(text, act, opts) {
    opts = opts || {};
    return (
      '<button type="button" class="sg-btn' + (opts.tone ? ' is-' + opts.tone : '') + '" data-act="' + act + '"' + (opts.id != null ? ' data-id="' + esc(opts.id) + '"' : '') + (opts.type ? ' data-type="' + opts.type + '"' : '') + (opts.title ? ' title="' + esc(opts.title) + '"' : '') + (opts.disabled ? ' disabled' : '') + (opts.expanded != null ? ' aria-expanded="' + !!opts.expanded + '"' : '') + '>' +
      (opts.icon ? icon(opts.icon, 14) : '') +
      (text ? '<span>' + esc(text) + '</span>' : '') +
      (opts.after ? icon(opts.after, 14) : '') +
      '</button>'
    );
  }
  /* what you do with a finding: open discussions keep their place on the card */
  function askBtn(type, id, discussion, tone) {
    if (discussion) {
      return '<button type="button" class="sg-btn is-discuss" data-act="ask" data-type="' + type + '" data-id="' + esc(id) + '" title="Discussion open · ' + esc(discussion) + '">' + icon('chat', 14) + '<span>Discussion open</span></button>';
    }
    return '<button type="button" class="sg-btn' + (tone ? ' is-' + tone : ' is-cyan') + '" data-act="ask" data-type="' + type + '" data-id="' + esc(id) + '">' + orb(14) + '<span>Ask Vicino</span></button>';
  }
  function orb(size) {
    return '<span class="vorb" aria-hidden="true" style="width:' + size + 'px;height:' + size + 'px"><span class="vorb__halo"></span><span class="vorb__core"></span></span>';
  }
  function ignoreBtn(id) {
    return '<button type="button" class="sg-btn is-ghost" data-act="ignore" data-id="' + esc(id) + '" title="Hides this finding and the links it cites for everyone on the brand">' + icon('eye-off', 14) + '<span>Ignore</span></button>';
  }
  function settingsBtn() {
    return '<button type="button" class="sg-btn is-plain" data-act="settings" aria-expanded="' + state.settings + '">' + icon('sliders', 14) + '<span>Settings</span>' + (S.collecting() ? '' : '<i class="sg-dot" title="Collection needs attention"></i>') + '</button>';
  }
  /* Operations left the reading page in the v2 proposal; this is where they're reached */
  function settingsPop() {
    function op(ic, text, act) {
      return '<button type="button" class="sg-op" data-act="' + act + '">' + icon(ic, 14) + '<span>' + text + '</span>' + icon('chevron-right', 13) + '</button>';
    }
    return (
      '<div class="sg-pop sg-pop--settings" data-pop-settings><p class="sg-pop__title">Can you trust what Signal is showing today?</p>' +
      '<div class="sg-health"><span class="sg-health__row">' + tile('check', 'var(--sg-green)', 'sm') + '<span><b>Market</b>Last research finished Sep 28</span></span>' +
      (S.collecting()
        ? '<span class="sg-health__row">' + tile('check', 'var(--sg-green)', 'sm') + '<span><b>Sentiment</b>1 of 1 platform collecting</span></span>'
        : '<span class="sg-health__row">' + tile('alert', 'var(--sg-amber)', 'sm') + '<span><b>Sentiment</b>Nothing collected from X since Oct 16</span>' + btn(state.checking ? 'Checking…' : 'Run now', 'cfg-check', { title: 'Uses credits', disabled: state.checking }) + '</span>') +
      '</div><div class="sg-ops">' + op('radio', 'Collection', 'collection') + op('bars', 'Collection runs', 'runs-toggle') + op('link', 'Add a link', 'add-link') + '</div><button type="button" class="sg-link" data-act="nothing">Open Signal settings' + icon('arrow-up-right', 13) + '</button></div>'
    );
  }

  function runResearchBtn(tone) {
    if (state.research === 'running') {
      return '<span class="sg-running" role="status"><i class="sg-running__bar" style="transform:scaleX(' + state.researchStep / 8 + ')"></i>Reading query ' + Math.min(state.researchStep + 1, 8) + ' of 8</span>';
    }
    return '<span class="sg-run">' + btn('Run research', 'research-run', { tone: tone || 'ink', icon: 'refresh' }) + '<span class="sg-credits" title="Each run uses credits">Uses credits</span></span>';
  }

  /* --------------------------------------------------------------- findings */

  function hiddenLine(f) {
    return '<div class="sg-undo">' + icon('eye-off', 14) + '<span>Hidden for everyone on the brand</span><button type="button" class="sg-link" data-act="undo" data-id="' + f.id + '">Undo</button></div>';
  }
  function restoreBar() {
    var ids = state.hidden.filter(function (id) {
      return !state.justHidden[id] || true;
    });
    if (!ids.length) return '';
    return (
      '<div class="sg-restore"><div class="sg-restore__head">' + icon('eye-off', 14) + '<span>' + (ids.length === 1 ? '1 finding hidden for the brand' : ids.length + ' findings hidden for the brand') + '</span>' +
      '<button type="button" class="sg-link" data-act="see-hidden" aria-expanded="' + state.seeHidden + '">See which</button>' +
      btn(ids.length === 1 ? 'Restore' : 'Restore all', 'restore-all', { icon: 'undo' }) + '</div>' +
      (state.seeHidden
        ? '<ul class="sg-restore__list">' +
          ids
            .map(function (id) {
              var f = S.finding(id);
              return '<li><span>' + esc(S.headline(f)) + '</span><button type="button" class="sg-link" data-act="undo" data-id="' + id + '">Restore</button></li>';
            })
            .join('') +
          '</ul>'
        : '') +
      '</div>'
    );
  }

  function sourceRow(src) {
    return (
      '<a class="sg-source" href="' + esc(src.href) + '" target="_blank" rel="noopener noreferrer">' + logo(sourceDomain(src), S.domain(src.href)) +
      '<span class="sg-source__text"><b>' + esc(src.title) + '</b><small>' + esc(S.domain(src.href)) + '</small></span>' + icon('arrow-up-right', 14) + '</a>'
    );
  }
  /* the body of a finding, wherever it opens: the read, the direction, the sources */
  function findingBody(f) {
    var out = '';
    if (f.short) out += '<p class="sg-full">' + esc(f.title) + '</p>';
    if (f.claim) out += '<p class="sg-claim">' + esc(f.claim) + '</p>';
    if (f.read) out += fact('spark', 'var(--cyan-600)', 'Signal’s read', '<p>' + esc(f.read) + '</p>');
    if (f.direction) out += '<div class="sg-oneline"><span class="sg-oneline__tag">A direction to discuss</span><p>' + esc(f.direction) + '</p></div>';
    out += '<div class="sg-sources"><span class="sg-eyebrow">' + S.plural(f.sources.length, 'source') + '</span>' + f.sources.map(sourceRow).join('') + '</div>';
    return out;
  }

  /* --------------------------------------------------------- research panels */

  function contextBlock() {
    var c = D.market.context;
    function row(ic, hue, label, value, big) {
      return '<div class="sg-fact">' + tile(ic, hue) + '<div><span class="sg-fact__label">' + label + '</span><p class="' + (big ? 'is-big' : state.ctxFull ? '' : 'is-clamped') + '">' + esc(value) + '</p></div></div>';
    }
    return (
      '<div class="sg-facts">' +
      row('target', 'var(--sg-violet)', 'Current goal', c.goal, true) +
      row('users', 'var(--sg-audience)', 'Audience', c.audience) +
      row('megaphone', 'var(--sg-market)', 'Positioning', c.positioning) +
      '</div><div class="sg-facts__foot"><button type="button" class="sg-link" data-act="ctx-toggle" aria-expanded="' + state.ctxFull + '">' + (state.ctxFull ? 'Show less' : 'View full context') + '</button>' + (state.ctxFull ? '<small>' + esc(c.foot) + '</small>' : '') + '</div>'
    );
  }
  function scopeBlock() {
    return '<ul class="sg-chips">' + D.market.scope.chips.map(function (c) {
      return '<li>' + esc(c) + '</li>';
    }).join('') + '</ul><p class="sg-fine">' + esc(D.market.scope.stamp) + '</p>';
  }
  function runsTable() {
    return (
      '<div class="sg-table sg-table--runs" role="table"><div class="sg-table__head" role="row"><span>Run</span><span>Window</span><span>Result</span><span>Findings</span><span>Started by</span></div>' +
      D.market.runs.map(function (r) {
        return '<button type="button" class="sg-table__row" role="row" data-act="trend-open" data-id="' + r.id + '"><span><b>' + esc(r.when) + '</b></span><span>' + esc(r.window) + '</span><span>' + lab(r.result, 'green') + '</span><span>' + r.findings + '</span><span>' + esc(r.by) + '</span></button>';
      }).join('') +
      '</div>'
    );
  }
  /* goal, reach, history: one line that opens the whole research drawer */
  function researchLine() {
    var chips = D.market.scope.chips;
    return (
      '<div class="sg-rline" role="button" tabindex="0" data-act="research-open"><div><span>Current goal</span><p>' + esc(D.market.context.goal) + '</p></div><div><span>Reads</span><p>' + (chips.length - 1) + ' kinds of source · ' + esc(chips[0].toLowerCase()) + '</p></div><div><span>History</span><p>1 run · finished Sep 28</p></div>' + icon('chevron-right', 15) + '</div>'
    );
  }
  function attentionBar() {
    var a = D.market.attention;
    return (
      '<button type="button" class="sg-attention" data-act="nothing">' + tile('brain', 'var(--cyan-600)') + '<span class="sg-attention__text"><b>' + esc(a.title) + '</b><small>' + esc(a.line) + '</small></span><span class="sg-attention__move">' + esc(a.move) + icon('arrow-right', 13) + '</span></button>'
    );
  }

  /* the trend report a research run opens */
  function trendReport() {
    var r = D.market.report;
    return (
      '<section class="sg-trend">' +
      '<button type="button" class="sg-btn" data-act="trend-close">' + icon('arrow-left', 14) + '<span>Back to feed</span></button>' +
      '<div class="sg-card sg-trend__head" data-rise><div class="sg-trend__top"><div><span class="sg-eyebrow">' + icon('calendar', 13) + esc(r.kicker) + '</span><h2>' + esc(r.title) + '</h2><p class="sg-fine">' + esc(r.created) + '</p></div>' + lab('Complete', 'green') + '</div>' +
      '<div class="sg-metrics">' +
      r.metrics.map(function (m) {
        return '<div class="sg-metric">' + tile(m.icon, 'var(--text-3)') + '<div><b>' + esc(m.value) + '</b><span>' + esc(m.label) + '</span><small>' + esc(m.sub) + '</small></div></div>';
      }).join('') +
      '</div></div>' +
      '<div class="sg-card sg-trend__list" data-rise><div class="sg-card__head"><h3>What is changing</h3><span class="sg-fine">5 findings cleared the report threshold</span></div>' +
      r.items.map(function (it) {
        var f = S.finding(it.id);
        return (
          '<button type="button" class="sg-rank" data-act="evidence" data-id="' + it.id + '"><span class="sg-rank__n">' + it.rank + '</span><span class="sg-rank__text"><b>' + esc(S.headline(f)) + '</b><small>' + esc(it.src === 'grounding' ? S.domain(f.sources[0].href) : it.src) + ' · ' + S.plural(f.sources.length, 'source') + ' · ' + esc(it.date) + '</small></span>' +
          '<span class="sg-meter" title="Relevance"><i data-grow style="width:' + f.rel + '%"></i></span><span class="sg-rank__pct">' + f.rel + '%</span>' + icon('chevron-right', 14) + '</button>'
        );
      }).join('') +
      '</div></section>'
    );
  }

  /* ---------------------------------------------------------- sentiment blocks */

  function pastBanner() {
    if (state.pastRun) {
      var run = D.runs.filter(function (r) {
        return r.id === state.pastRun;
      })[0];
      return '<div class="sg-banner">' + lab(run.status, run.status === 'Complete' ? 'green' : 'amber') + '<span><b>Viewing the run of ' + esc(run.when) + '</b> ' + esc(run.window) + (run.mentions != null ? ' · ' + run.mentions + ' mentions' : '') + '</span><button type="button" class="sg-link" data-act="back-latest">Back to latest' + icon('arrow-right', 13) + '</button></div>';
    }
    if (state.report === 'past') {
      return '<div class="sg-banner">' + icon('history', 14) + '<span>You’re reading a <b>past report · ' + esc(S.report().window) + '</b>. This period’s panel is still this week.</span><button type="button" class="sg-link" data-act="back-latest">Back to latest' + icon('arrow-right', 13) + '</button></div>';
    }
    return '';
  }
  function noReport() {
    var run = state.pastRun && D.runs.filter(function (r) {
      return r.id === state.pastRun;
    })[0];
    return !!(run && !run.report);
  }
  function pickerMenu() {
    var rs = D.reports;
    return (
      '<div class="sg-pop sg-pop--picker"><p class="sg-pop__head">Reports · newest first</p>' +
      ['latest', 'past'].map(function (k) {
        var r = rs[k];
        return '<button type="button" class="sg-pick' + (state.report === k ? ' is-on' : '') + '" data-act="report" data-id="' + k + '"><span>' + (state.report === k ? icon('tick', 13) : '') + '</span><b>' + esc(r.window) + (k === 'latest' ? '<small>Latest</small>' : '') + '</b><em>' + esc(r.verdict) + '</em></button>';
      }).join('') +
      '<button type="button" class="sg-link" data-act="report-history">All reports' + icon('arrow-right', 13) + '</button></div>'
    );
  }
  function cites(r) {
    return '<span class="sg-cites"><span>Supporting posts</span>' + r.cites.map(function (n) {
      return '<button type="button" data-act="cite" data-id="' + n + '" aria-label="Go to supporting post ' + n + '">' + n + '</button>';
    }).join('') + '</span>';
  }
  function reportHistoryBlock() {
    if (!state.reportHistory) return '';
    return (
      '<div class="sg-card sg-hist" data-mark="report-history"><div class="sg-card__head"><h3>Report history</h3><span class="sg-fine">One report per period · newest first</span>' + btn('Close', 'report-history', { tone: 'ghost' }) + '</div>' +
      ['latest', 'past'].map(function (k) {
        var r = D.reports[k];
        return '<button type="button" class="sg-hist__row' + (state.report === k ? ' is-on' : '') + '" data-act="report" data-id="' + k + '"><b>' + esc(r.window) + (k === 'latest' ? ' <small>Latest</small>' : '') + '</b><span>' + esc(r.short) + '</span>' + donut(r.mix, 30) + '<em>' + esc(r.verdict) + '</em></button>';
      }).join('') +
      '</div>'
    );
  }
  function themeBody(t) {
    var shown = state.moreQuotes[t.id] ? t.quotes : t.quotes.slice(0, 1);
    return (
      '<p class="sg-claim">' + esc(t.summary) + '</p>' +
      '<div class="sg-mixline">' + strip(t.pos, t.neu, t.neg) + '<small><b>' + t.pos + '</b> positive · <b>' + t.neu + '</b> neutral · <b>' + t.neg + '</b> negative</small></div>' +
      '<p class="sg-fine">' + esc(t.voices) + ' · No comparable period before this one</p>' +
      '<div class="sg-bubbles">' + shown.map(quoteBubble).join('') + '</div>' +
      '<div class="sg-rowacts">' + btn(state.moreQuotes[t.id] ? 'Show fewer' : 'Show 2 more quoted posts', 'quotes-more', { id: t.id, tone: 'ghost', expanded: !!state.moreQuotes[t.id] }) + askBtn('theme', t.id) + '</div>'
    );
  }
  function quoteBubble(q) {
    return (
      '<figure class="sg-bubble is-' + q.lean + '" data-cite="' + q.n + '"><blockquote>' + esc(q.text) + '</blockquote>' +
      '<figcaption>' + avatar(q.who) + '<b>' + esc(q.who) + '</b><span>' + esc(q.date) + '</span><span>' + esc(q.eng) + '</span><span class="sg-bubble__n">' + q.n + '</span><a href="' + esc(q.href) + '" target="_blank" rel="noopener noreferrer">Open post' + icon('arrow-up-right', 12) + '</a></figcaption></figure>'
    );
  }
  /* ------------------------------------------------- the v2 page's shared parts */

  function citedQuote(r) {
    var found = null;
    r.themes.forEach(function (t) {
      t.quotes.forEach(function (q) {
        if (q.n === r.cites[0]) found = q;
      });
    });
    return found;
  }
  /* Risk handling is separate from discussion: Open or Handled, with undo, then Ask */
  function handleCtl(id) {
    if (state.handled[id]) {
      return '<span class="sg-handled">' + lab('Handled', 'green') + '<small>by you · just now</small><button type="button" class="sg-link" data-act="handle-undo" data-id="' + esc(id) + '">Undo</button></span>';
    }
    return '<button type="button" class="sg-btn" data-act="handle" data-id="' + esc(id) + '">' + icon('tick', 13) + '<span>Mark handled</span></button>';
  }
  function uncertainCtl(u) {
    var st = state.uncertain[u.id];
    if (st === 'counted') return '<span class="sg-handled">' + lab('Counted as yours', 'green') + '<small>in the next report</small><button type="button" class="sg-link" data-act="us-undo" data-id="' + u.id + '">Undo</button></span>';
    if (st === 'dropped') return '<span class="sg-handled">' + lab('Marked as not yours', 'grey') + '<button type="button" class="sg-link" data-act="us-undo" data-id="' + u.id + '">Undo</button></span>';
    return '<span class="sg-usnot"><button type="button" class="sg-btn" data-act="us" data-id="' + u.id + '">That’s us</button><button type="button" class="sg-btn is-ghost" data-act="not-us" data-id="' + u.id + '">Not us</button></span>';
  }
  function uncertainRows() {
    return state.sstate === 'thin' ? D.v2.uncertain.slice(0, 1) : D.v2.uncertain;
  }
  function basisBlock() {
    var b = S.basis();
    return (
      '<div class="sg-basis3"><div>' + tile('pie', 'var(--sg-market)') + '<span><b>Where mentions came from</b><p>' + esc(b.from) + '</p></span></div><div>' + tile('check', S.collecting() ? 'var(--sg-green)' : 'var(--sg-amber)') + '<span><b>Coverage</b><p>' + esc(b.coverage) + '</p></span></div><div>' + tile('eye', 'var(--sg-violet)') + '<span><b>What this plan watches</b><p>' + esc(b.watches) + ' <button type="button" class="sg-link" data-act="settings">Review in Settings</button></p></span></div></div><p class="sg-fine">' + esc(b.fine) + '</p>'
    );
  }
  function failureCard() {
    if (S.collecting()) return '';
    var f = D.v2.failure;
    return (
      '<div class="sg-failure">' + tile('alert', 'var(--sg-amber)') + '<span class="sg-failure__text"><b>' + esc(f.title) + '</b><small>' + esc(f.detail) + '</small></span><span class="sg-run">' + btn(state.checking ? 'Checking…' : 'Check X now', 'cfg-check', { disabled: state.checking, tone: 'plain', icon: 'refresh' }) + '<span class="sg-credits">' + esc(f.note) + '</span></span><button type="button" class="sg-link" data-act="settings">Fix in Settings' + icon('arrow-right', 13) + '</button></div>'
    );
  }
  function footerStatus() {
    return failureCard() + footerLine();
  }
  function footerLine() {
    return (
      '<div class="sg-footline"><span>' + esc(S.collecting() ? D.v2.footer : D.v2.failure.footer) + '</span><button type="button" class="sg-link" data-act="settings">Manage in Settings</button><button type="button" class="sg-link" data-act="page" data-id="market">Market research' + icon('arrow-right', 13) + '</button></div>'
    );
  }
  function themeHead() {
    return S.report().thin ? 'Posts you can check' : 'Themes';
  }

  /* the runs as a picture first: one capsule a run, the stop drawn as a gap */
  function runsChart() {
    var runs = D.runs.slice().reverse().filter(function (r) {
      return r.mentions !== null && r.trigger !== 'Manual';
    });
    var peak = 65;
    var bars = runs.map(function (r) {
      var h = Math.max((r.mentions / peak) * 100, r.mentions === 0 ? 2 : 4);
      return '<button type="button" class="sg-col' + (r.mentions === peak ? ' is-peak' : '') + (r.status === 'Partial' ? ' is-partial' : '') + '" data-act="run-row" data-id="' + r.id + '" title="' + esc(r.day + ' · ' + r.mentions + ' mentions · ' + r.status) + '"><span class="sg-col__n">' + r.mentions + '</span><i style="height:' + h + '%"></i><span class="sg-col__d">' + esc(r.day.replace('Oct ', '')) + '</span></button>';
    }).join('');
    var gap = S.collecting()
      ? ''
      : '<div class="sg-cols__gap" title="Nothing collected since Oct 16"><span>' + icon('alert', 13) + 'Stopped since Oct 16</span></div>';
    return (
      '<div class="sg-cols" role="img" aria-label="Mentions collected per daily run, October 8 to 16, with a gap after October 16">' + bars + gap + '</div>' +
      '<div class="sg-cols__key"><span><i class="is-full"></i>Complete</span><span><i class="is-partial"></i>Partial</span><span class="sg-fine">Mentions per daily run · Oct</span></div>'
    );
  }
  function runsBlock() {
    var f = state.runsFilter;
    var problems = D.runs.filter(function (r) {
      return r.status === 'Partial';
    }).length;
    var rows = D.runs.filter(function (r) {
      if (f === 'scheduled') return r.trigger === 'Schedule';
      if (f === 'manual') return r.trigger === 'Manual';
      if (f === 'problems') return r.status === 'Partial';
      return true;
    });
    function pill(id, text) {
      return '<button type="button" class="sg-tab' + (f === id ? ' is-on' : '') + '" data-act="runs-filter" data-id="' + id + '">' + text + '</button>';
    }
    return (
      '<div class="sg-drawer__bar">' + tile('bars', 'var(--sg-market)') + '<span class="sg-drawer__kind"><b>Collection runs</b><small>' + S.plural(D.runs.length, 'run') + ' · ' + problems + ' partial</small></span><span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div><div class="sg-drawer__body sg-runs"><span class="sg-tabs">' + pill('all', 'All') + pill('scheduled', 'Scheduled') + pill('manual', 'Manual') + pill('problems', 'Problems ' + problems) + '</span>' +
      runsChart() +
      '<div class="sg-table sg-table--coll"><div class="sg-table__head"><span>Status</span><span>Started</span><span>Trigger</span><span>Took</span><span>Mentions</span><span>Window</span></div>' +
      rows.map(function (r) {
        return '<button type="button" class="sg-table__row" data-act="run-row" data-id="' + r.id + '"><span>' + lab(r.status, r.status === 'Complete' ? 'green' : 'amber') + '</span><span><b>' + esc(r.when) + '</b><small>' + esc(r.ago) + '</small></span><span>' + esc(r.trigger) + '</span><span>' + esc(r.took) + '</span><span>' + (r.mentions == null ? '—' : r.mentions) + '</span><span>' + esc(r.window) + '</span></button>';
      }).join('') +
      '</div><p class="sg-fine">Showing ' + rows.length + ' of ' + D.runs.length + ' runs · times in Eastern Time, the plan’s timezone</p>' +
      '<p class="sg-fine">' + esc(D.collection.inactive) + '</p></div>'
    );
  }
  function addLinkDialog() {
    var reading = state.addLinkState === 'reading';
    return (
      '<div class="sg-scrim" data-scrim="modal"></div><form class="sg-dialog sg-dialog--small" role="dialog" aria-modal="true" aria-label="Add a link" onsubmit="return false"><div class="sg-dialog__head">' + tile('link', 'var(--cyan-600)') + '<div><h2>Add a link</h2><p>Signal reads the page once. Reading it uses credits.</p></div><button type="button" class="sg-icon-btn" data-act="modal-close" aria-label="Close">' + icon('x', 15) + '</button></div>' +
      '<div class="sg-dialog__body sg-linkform"><label><span>Page link</span><input data-link-input inputmode="url" placeholder="https://…"' + (reading ? ' disabled' : '') + ' /></label><label><span>Why it matters (optional)</span><input maxlength="500" placeholder="A review of us worth answering, an article that mentions us…"' + (reading ? ' disabled' : '') + ' /></label><div class="sg-linkform__foot"><span></span>' + btn('Cancel', 'modal-close', { tone: 'ghost' }) + btn(reading ? 'Reading the page…' : 'Add to Signal', 'add-link-send', { tone: 'ink', disabled: reading }) + '</div></div></form>'
    );
  }

  /* ---------------------------------------------------------- drawers + dialog */

  function drawerFinding(id) {
    var f = S.finding(id);
    var k = KIND[f.kind];
    return (
      '<div class="sg-drawer__bar">' + subjectLogo(f) + '<span class="sg-drawer__kind"><b>' + k.label + (f.entity ? ' · ' + esc(f.entity) : '') + '</b><small>Found ' + esc(f.found) + (f.posted ? ' · posted ' + esc(f.posted) : '') + '</small></span>' + dirLab(f) +
      '<span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-step" data-id="-1" aria-label="Previous finding">' + icon('chevron-up', 15) + '</button><button type="button" class="sg-icon-btn" data-act="drawer-step" data-id="1" aria-label="Next finding">' + icon('chevron-down', 15) + '</button><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body"><div class="sg-statement"><h2>' + esc(S.headline(f)) + '</h2>' + (f.rel ? ring(f.rel, 44) : '') + '</div>' + findingBody(f) + '</div>' +
      '<div class="sg-drawer__foot">' + askBtn('finding', f.id, f.discussion, 'ink') + ignoreBtn(f.id) + '</div>'
    );
  }
  function drawerRisk(id) {
    var r = S.risk(id);
    return (
      '<div class="sg-drawer__bar">' + tile('alert', 'var(--sg-amber)') + '<span class="sg-drawer__kind"><b>' + esc(r.label === 'Risk' ? 'Risk' : r.label + ' risk') + '</b><small>X · ' + esc(r.date) + '</small></span><span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body"><h2>' + esc(quoted(r.text)) + '</h2><figure class="sg-bubble"><figcaption class="is-top">' + logo('x.com') + '<b>What the post says</b></figcaption><blockquote>' + esc(quoted(r.says)) + '</blockquote></figure><a class="sg-source" href="' + esc(r.href) + '" target="_blank" rel="noopener noreferrer">' + logo('x.com') + '<span class="sg-source__text"><b>View the post</b><small>x.com</small></span>' + icon('arrow-up-right', 14) + '</a></div>' +
      '<div class="sg-drawer__foot">' + askBtn('risk', r.id, r.discussion, 'ink') + handleCtl(r.id) + '</div>'
    );
  }
  function drawerPost(id) {
    var p = S.postById(id);
    return (
      '<div class="sg-drawer__bar">' + tile('alert', 'var(--sg-amber)') + '<span class="sg-drawer__kind"><b>Risk post · ' + esc(S.report().window) + '</b><small>X · ' + esc(p.who) + ' · ' + esc(p.date) + '</small></span>' + postSevLab(p.sev) + '<span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body"><h2>' + esc(quoted(p.text)) + '</h2><p class="sg-fine">' + esc(p.eng) + '</p><a class="sg-source" href="' + esc(p.href) + '" target="_blank" rel="noopener noreferrer"><span class="sg-mark">' + S.xLogo(10) + '</span><span class="sg-source__text"><b>View post</b><small>x.com</small></span>' + icon('arrow-up-right', 14) + '</a></div>' +
      '<div class="sg-drawer__foot">' + askBtn('post', p.id, null, 'ink') + handleCtl(p.id) + '</div>'
    );
  }
  function drawerTheme(id) {
    var t = S.theme(id);
    return (
      '<div class="sg-drawer__bar">' + themeTile(t) + '<span class="sg-drawer__kind"><b>' + t.mentions + ' mentions</b><small>' + esc(S.report().window) + '</small></span>' + leanLab(t.lean, t.leanLabel) + '<span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body"><h2>' + esc(t.name) + '</h2>' + themeBody(t) + '</div>'
    );
  }
  function drawerEvidence(id) {
    var it = S.trendItem(id);
    var f = S.finding(id);
    return (
      '<div class="sg-drawer__bar">' + S.kindTile(f.kind) + '<span class="sg-drawer__kind"><b>Finding ' + it.rank + '</b><small>' + f.rel + '% relevance</small></span><span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body"><h2>' + esc(S.headline(f)) + '</h2>' + (f.short ? '<p class="sg-full">' + esc(f.title) + '</p>' : '') +
      '<div class="sg-read"><span class="sg-eyebrow">Why this matters for the brand</span><p>' + esc(f.read) + '</p></div><div class="sg-oneline"><span class="sg-oneline__tag">A direction to discuss</span><p>' + esc(f.direction) + '</p></div>' +
      '<div class="sg-sources"><span class="sg-eyebrow">Linked evidence · ' + S.plural(it.evidence.length, 'source') + '</span>' +
      it.evidence.map(function (ev) {
        return '<article class="sg-evidence"><div class="sg-evidence__meta">' + logo(sourceDomain(ev), S.domain(ev.href), 'sm') + '<span>' + esc(S.domain(ev.href)) + '</span><span>' + esc(ev.date) + '</span><span class="sg-meter is-sm" title="Source fit"><i style="width:' + ev.fit + '%"></i></span><small>' + ev.fit + '% fit</small></div><h4>' + esc(ev.title) + '</h4><p>' + S.rich(ev.body) + '</p><a class="sg-link" href="' + esc(ev.href) + '" target="_blank" rel="noopener noreferrer">Read original source' + icon('arrow-up-right', 13) + '</a></article>';
      }).join('') +
      '</div></div>'
    );
  }

  function collectionDialog() {
    var c = D.collection;
    var p = c.platform;
    var live = S.collecting();
    return (
      '<div class="sg-scrim" data-scrim="modal"></div><div class="sg-dialog" role="dialog" aria-modal="true" aria-label="Collection">' +
      '<div class="sg-dialog__head">' + tile('radio', 'var(--cyan-600)', 'lg') + '<div><h2>Collection</h2><p>Everything here takes effect when you press it.</p></div>' + lab(state.planPaused ? 'Paused' : 'Active', state.planPaused ? 'grey' : 'green') + btn(state.planPaused ? 'Resume plan' : 'Pause plan', 'cfg-pause', { tone: 'plain' }) + '<button type="button" class="sg-icon-btn" data-act="modal-close" aria-label="Close">' + icon('x', 15) + '</button></div>' +
      '<div class="sg-dialog__body">' +
      '<section><div class="sg-card__head"><h3>Platforms</h3><button type="button" class="sg-link" data-act="nothing">Manage targets in Settings' + icon('arrow-up-right', 13) + '</button></div>' +
      '<div class="sg-pfrow"><span class="sg-mark is-lg">' + S.xLogo(14) + '</span><div class="sg-pfrow__text"><b>X</b>' + lab(live ? 'Collecting' : 'Stopped since Oct 16', live ? 'green' : 'amber') + '<small>' + esc(p.outcome) + '</small><small>' + esc(p.queries) + ' · Collects daily at 02:00</small></div>' +
      '<span class="sg-run">' + btn(state.checking ? 'Checking…' : 'Check now', 'cfg-check', { icon: 'refresh', disabled: state.checking }) + '<span class="sg-credits">Uses credits</span></span>' + btn('Details', 'cfg-platform', { tone: 'ghost', after: state.cfgPlatform ? 'chevron-up' : 'chevron-down', expanded: state.cfgPlatform }) + '</div>' +
      (state.cfgPlatform
        ? '<div class="sg-pfdetail"><p class="sg-fine">' + esc(p.schedule) + '</p><span class="sg-eyebrow">Queries</span><ul class="sg-query">' + p.list.map(function (q) {
            return '<li>' + esc(q) + '</li>';
          }).join('') + '<li class="is-more">' + esc(p.more) + '</li></ul><p class="sg-fine">' + esc(p.when) + ' · ' + esc(p.limits) + '</p></div>'
        : '') +
      '<p class="sg-fine">' + esc(c.platformsSub) + '</p></section>' +
      '<section><div class="sg-card__head"><h3>What this plan watches</h3><button type="button" class="sg-link" data-act="nothing">Edit in Settings' + icon('arrow-up-right', 13) + '</button></div>' +
      '<div class="sg-watch"><span>Brand terms</span><ul class="sg-chips"><li>' + c.watches.terms.join('</li><li>') + '</li></ul><span>Topics</span><ul class="sg-chips"><li>' + c.watches.topics.join('</li><li>') + '</li></ul><span>Risk triggers</span><p class="sg-fine">' + esc(c.watches.triggers) + '</p></div></section>' +
      '<section><button type="button" class="sg-fold' + (state.cfgDetails ? ' is-open' : '') + '" data-act="cfg-details" aria-expanded="' + state.cfgDetails + '">' + icon('chevron-right', 14) + '<span>Collection details</span></button>' +
      (state.cfgDetails
        ? '<div class="sg-excluded"><p class="sg-fine">' + esc(c.excludedSub) + '</p>' + c.excluded.map(function (e) {
            return '<div class="sg-excl"><p>' + esc(e.text) + '</p><small>' + esc(e.why) + '</small></div>';
          }).join('') + c.requests.map(function (r) {
            return '<p class="sg-fine">' + esc(r) + '</p>';
          }).join('') + '</div>'
        : '') +
      '</section></div></div>'
    );
  }

  function drawerResearch() {
    return (
      '<div class="sg-drawer__bar">' + tile('globe', 'var(--sg-market)') + '<span class="sg-drawer__kind"><b>Research</b><small>Ran ' + esc(state.ran) + '</small></span><span class="sg-drawer__nav"><button type="button" class="sg-icon-btn" data-act="drawer-close" aria-label="Close">' + icon('x', 15) + '</button></span></div>' +
      '<div class="sg-drawer__body">' + attentionBar() +
      '<div class="sg-block"><h3>Research context</h3>' + contextBlock() + '</div>' +
      '<div class="sg-block"><h3>Research scope</h3>' + scopeBlock() + '</div>' +
      '<div class="sg-block"><h3>Research runs</h3>' + runsTable() + '</div></div>' +
      '<div class="sg-drawer__foot">' + runResearchBtn('ink') + '</div>'
    );
  }

  /* --------------------------------------------------------------- chat window */

  /* The chat opens the product's way: the sidebar folds and the page moves over.
     Never slid over the content. The window is draft/side-chats' Paper. */
  function sampleReply() {
    return (
      '<p class="sg-chat__tag">Sample reply</p><p><b>Quick read.</b> This is worth a response, but it’s one signal so far. Check it against what the rest of this period says before you commit a message to it.</p>' +
      '<p><b>Options</b></p><ul><li>Answer in public, with what you know today.</li><li>Brief support so the next reply is consistent.</li><li>Keep watching and revisit at the next report.</li></ul>'
    );
  }
  function chatWindow() {
    var c = state.chat;
    return (
      '<aside class="sg-chat" role="dialog" aria-label="Vicino"><header class="sg-chat__head">' + orb(20) + '<b>Vicino</b><span>' + esc(c.title) + '</span><button type="button" class="sg-icon-btn" data-act="chat-new" aria-label="New chat" title="New chat">' + icon('plus', 15) + '</button><button type="button" class="sg-icon-btn" data-act="chat-close" aria-label="Close">' + icon('x', 15) + '</button></header>' +
      '<div class="sg-chat__thread">' +
      (c.msgs.length
        ? c.msgs.map(function (m) {
            return m.me ? '<div class="sg-chat__me">' + esc(m.text) + '</div>' : '<div class="sg-chat__them">' + sampleReply() + '</div>';
          }).join('')
        : '<div class="sg-chat__empty">' + orb(44) + '<b>Ask what Signal is picking up</b><span>Findings, risks and themes on this page are all in reach.</span></div>') +
      '</div><form class="sg-chat__composer" onsubmit="return false"><textarea data-chat-input rows="2" placeholder="Message Vicino…"></textarea><div><button type="button" class="sg-icon-btn" data-act="nothing" aria-label="Attach">' + icon('clip', 15) + '</button><button type="button" class="sg-send" data-act="chat-send" aria-label="Send">' + icon('arrow-up', 15) + '</button></div></form></aside>'
    );
  }

  /* ----------------------------------------------------------------- overlays */

  /* Now draws its own drawers with the product's classes; a design can claim one. */
  S.renderOverlays = function () {
    var box = document.getElementById('sg-overlay');
    var shell = document.querySelector('.app-shell');
    var side = document.querySelector('.app-sidebar');
    var d = state.drawer;
    var html = '';
    var design = S.designs[state.design];
    if (d) {
      if (design.drawer && design.drawer(d)) html += design.drawer(d);
      else {
        var inner = d.type === 'finding' ? drawerFinding(d.id) : d.type === 'risk' ? drawerRisk(d.id) : d.type === 'theme' ? drawerTheme(d.id) : d.type === 'research' ? drawerResearch() : d.type === 'post' ? drawerPost(d.id) : d.type === 'runs' ? runsBlock() : drawerEvidence(d.id);
        html += '<div class="sg-scrim is-light" data-scrim="drawer"></div><aside class="sg-drawer" role="dialog" aria-modal="true">' + inner + '</aside>';
      }
    }
    if (state.modal === 'collection') html += collectionDialog();
    if (state.modal === 'addlink') html += addLinkDialog();
    if (state.settings) html += settingsPop();
    if (state.chat) html += chatWindow();

    var keepScroll = box.querySelector('.sg-chat__thread');
    var wasOpen = {
      drawer: !!box.querySelector('.sg-drawer, .signal-trends-detail'),
      chat: !!box.querySelector('.sg-chat'),
      dialog: !!box.querySelector('.sg-dialog, .cfg')
    };
    var body = box.querySelector('.sg-drawer__body, .signal-trends-detail');
    var bodyY = body ? body.scrollTop : 0;
    var prevDrawerId = box.dataset.drawerId || '';
    box.innerHTML = html;
    box.dataset.drawerId = d ? d.type + ':' + d.id : '';
    var bodyNow = box.querySelector('.sg-drawer__body, .signal-trends-detail');
    if (bodyNow && prevDrawerId === box.dataset.drawerId) bodyNow.scrollTop = bodyY;
    var thread = box.querySelector('.sg-chat__thread');
    if (thread) thread.scrollTop = thread.scrollHeight;
    if (keepScroll && thread && !state.chat) thread.scrollTop = 0;

    /* the chat folds the sidebar and pushes the page, and hands the fold back */
    var chatOn = !!state.chat;
    if (chatOn && !shell.classList.contains('is-tour-split')) {
      S._sideWasCollapsed = side.classList.contains('is-collapsed');
      shell.classList.add('is-tour-split');
      side.classList.add('is-collapsed');
    } else if (!chatOn && shell.classList.contains('is-tour-split')) {
      shell.classList.remove('is-tour-split');
      if (!S._sideWasCollapsed) side.classList.remove('is-collapsed');
    }

    /* scrims close what they sit under */
    box.querySelectorAll('[data-scrim]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.dataset.scrim === 'drawer') state.drawer = null;
        else state.modal = null;
        S.render();
      });
    });

    /* motion: once, on the way in, and only for what just arrived */
    if (!wasOpen.drawer) S.slide(box.querySelector('.sg-drawer, .signal-trends-detail'), 18, 0);
    if (!wasOpen.chat) S.slide(box.querySelector('.sg-chat'), -14, 0);
    if (!wasOpen.dialog) S.slide(box.querySelector('.sg-dialog'), 0, 10);
  };

  /* -------------------------------------------------------------------- motion */

  function canMove() {
    return window.gsap && document.visibilityState === 'visible' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  S.slide = function (el, x, y) {
    if (!el || !canMove()) return;
    var move = window.gsap.from(el, { x: x, y: y, autoAlpha: 0, duration: 0.28, ease: 'power2.out', clearProps: 'all' });
    setTimeout(function () {
      move.progress(1);
    }, 500);
  };
  /* a design or a page arriving: the blocks rise in order and the bars draw. A
     re-render from a click never comes through here. */
  S.enter = function (root) {
    if (!canMove()) return;
    var moves = [];
    var blocks = root.querySelectorAll('[data-rise]');
    if (blocks.length) {
      moves.push(window.gsap.from(blocks, { y: 12, autoAlpha: 0, duration: 0.42, ease: 'power2.out', stagger: 0.04, clearProps: 'all' }));
    }
    var bars = root.querySelectorAll('[data-grow]');
    if (bars.length) {
      moves.push(window.gsap.from(bars, { scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'power3.out', stagger: 0.015, delay: 0.1, clearProps: 'transform,transformOrigin' }));
    }
    /* a tab that loses focus stops its frames; the page must still end up visible */
    setTimeout(function () {
      moves.forEach(function (m) {
        m.progress(1);
      });
    }, 1400);
  };
  S.scrollTo = function (sel) {
    var el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  S.flashCite = function (n) {
    var el = document.querySelector('[data-cite="' + n + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('is-flash');
    setTimeout(function () {
      el.classList.remove('is-flash');
    }, 1600);
  };

  /* --------------------------------------------------------------- corner menu */

  var LABEL = { now: 'Base', lanes: 'Lanes', timeline: 'Timeline', topics: 'Topics' };
  var DESC = {
    now: 'The baseline to compare against. Market is the capture, in the product’s own CSS. Sentiment is the Sentiment page v2 proposal, with Shopify’s numbers.',
    lanes: 'Organised by what to do with it. One lane per kind of thing, each saying what it is at its left, with its items beside it.',
    timeline: 'Organised by when. A chart first shows the rhythm and any stop at a glance; one river of dates runs down the page below it.',
    topics: 'Organised by what it’s about. One block per topic or theme, each with its own drawn scene and the voices under it.'
  };
  var SDESC = {
    normal: 'The report with findings. New risks stay on one line, so the critical ones are left out of this state.',
    thin: 'Under 20 mentions: no split, no themes, the posts to read one by one. A sample state: the counts are made up, the posts are real.',
    failure: 'How Shopify’s plan stands today: X stopped since Oct 16, and new critical risks open the page, never folded.'
  };
  var menuScroll = 0;
  var menu;
  function seg(list, picked, act, label) {
    return (
      '<div class="sg-sw__seg" role="radiogroup" aria-label="' + label + '">' +
      list.map(function (x) {
        var on = x.id === picked;
        return '<button type="button" role="radio" aria-checked="' + on + '" class="sg-sw__opt' + (on ? ' is-on' : '') + '" data-act="' + act + '" data-id="' + x.id + '">' + x.label + '</button>';
      }).join('') +
      '</div>'
    );
  }
  S.renderMenu = function () {
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'sg-menu';
      menu.className = 'sg-sw pulse-ds sg-ds';
      document.body.appendChild(menu);
      menu.addEventListener(
        'scroll',
        function (e) {
          if (e.target.classList && e.target.classList.contains('sg-sw__panel')) menuScroll = e.target.scrollTop;
        },
        true
      );
    }
    var open = state.menuOpen;
    var kept = menu.classList.contains('is-gone');
    menu.innerHTML =
      '<button type="button" class="sg-sw__tab" data-act="menu-toggle" aria-expanded="' + open + '" aria-controls="sg-sw-panel">' + icon('layers', 15) + '<span>Prototype</span><b>' + LABEL[state.design] + '</b>' + icon(open ? 'chevron-down' : 'chevron-up', 14) + '</button>' +
      '<div class="sg-sw__panel" id="sg-sw-panel"' + (open ? '' : ' hidden') + '>' +
      '<p class="sg-sw__title">Prototype controls</p><p class="sg-sw__hint">Three ways to organise the Signal page, on the same data and functions as Base. Same components, three layouts of its own.</p>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Design</span>' +
      seg(S.DESIGNS.map(function (id) {
        return { id: id, label: LABEL[id] };
      }), state.design, 'design', 'Which design') +
      '<p class="sg-sw__desc">' + DESC[state.design] + '</p></div>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Page</span>' + seg([{ id: 'market', label: 'Market' }, { id: 'sentiment', label: 'Sentiment' }], state.page, 'page', 'Which page') + '</div>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Sentiment report</span>' + seg([{ id: 'latest', label: 'Latest' }, { id: 'past', label: 'Past' }], state.report, 'set-report', 'Which report') + '</div>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Sentiment state</span>' + seg([{ id: 'normal', label: 'Normal' }, { id: 'thin', label: 'Thin sample' }, { id: 'failure', label: 'Failure' }], state.sstate, 'set-sstate', 'Which Sentiment state') + '<p class="sg-sw__desc">' + SDESC[state.sstate] + '</p></div>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Market research</span>' + seg([{ id: 'idle', label: 'Idle' }, { id: 'running', label: 'Running' }], state.research, 'set-research', 'Research state') + '</div>' +
      '<div class="sg-sw__row"><span class="sg-sw__label">Sentiment colours</span>' + seg([{ id: 'cyan', label: 'Cyan pair' }, { id: 'product', label: 'Green + terracotta' }], state.palette, 'set-palette', 'Sentiment palette') + '<p class="sg-sw__desc">Cyan pair follows design-system/charts, which keeps polarity in one family. Green and terracotta are what the product wears now.</p></div>' +
      '<p class="sg-sw__keys"><kbd>1</kbd>–<kbd>4</kbd> design · <kbd>M</kbd> <kbd>S</kbd> page · <kbd>V</kbd> folds this panel · <kbd>H</kbd> hides the tab</p>' +
      '</div>';
    if (kept) menu.classList.add('is-gone');
    var panel = menu.querySelector('.sg-sw__panel');
    if (panel && open) panel.scrollTop = menuScroll;
  };

  /* the shared parts, for the designs */
  S.KIND = KIND;
  S.logo = logo;
  S.sourceDomain = sourceDomain;
  S.sourceLogos = sourceLogos;
  S.subjectLogo = subjectLogo;
  S.ring = ring;
  S.avatar = avatar;
  S.fact = fact;
  S.illus = illus;
  S.topBar = topBar;
  S.tile = tile;
  S.kindTile = kindTile;
  S.lab = lab;
  S.dirLab = dirLab;
  S.sevLab = sevLab;
  S.postSevLab = postSevLab;
  S.leanLab = leanLab;
  S.srcMark = srcMark;
  S.letterMark = letterMark;
  S.strip = strip;
  S.stripLegend = stripLegend;
  S.donut = donut;
  S.donutLegend = donutLegend;
  S.shareBlock = shareBlock;
  S.themeMeter = themeMeter;
  S.microTrend = microTrend;
  S.cell = cell;
  S.pill = pill;
  S.themeOf = themeOf;
  S.themeTile = themeTile;
  S.whoOf = whoOf;
  S.quoted = quoted;
  S.post = post;
  S.uncertainRow = uncertainRow;
  S.basisRow = basisRow;
  S.sec = sec;
  S.reportPicker = reportPicker;
  S.btn = btn;
  S.askBtn = askBtn;
  S.orb = orb;
  S.ignoreBtn = ignoreBtn;
  S.settingsBtn = settingsBtn;
  S.runResearchBtn = runResearchBtn;
  S.hiddenLine = hiddenLine;
  S.restoreBar = restoreBar;
  S.sourceRow = sourceRow;
  S.findingBody = findingBody;
  S.contextBlock = contextBlock;
  S.scopeBlock = scopeBlock;
  S.runsTable = runsTable;
  S.attentionBar = attentionBar;
  S.researchLine = researchLine;
  S.trendReport = trendReport;
  S.pastBanner = pastBanner;
  S.noReport = noReport;
  S.cites = cites;
  S.reportHistoryBlock = reportHistoryBlock;
  S.themeBody = themeBody;
  S.quoteBubble = quoteBubble;
  S.basisBlock = basisBlock;
  S.runsChart = runsChart;
  S.runsBlock = runsBlock;
  S.pickerMenu = pickerMenu;
  S.citedQuote = citedQuote;
  S.handleCtl = handleCtl;
  S.uncertainCtl = uncertainCtl;
  S.uncertainRows = uncertainRows;
  S.failureCard = failureCard;
  S.footerStatus = footerStatus;
  S.footerLine = footerLine;
  S.themeHead = themeHead;
  S.drawerResearch = drawerResearch;
  S.drawerPost = drawerPost;
  S.drawerFinding = drawerFinding;
  S.drawerRisk = drawerRisk;
  S.drawerTheme = drawerTheme;
  S.drawerEvidence = drawerEvidence;
  S.collectionDialog = collectionDialog;
})();
