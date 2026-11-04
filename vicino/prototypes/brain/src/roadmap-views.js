/* The roadmap, in three designs (Versions → Roadmap).

   All three read the same plan, and in all three the timeline is the frame the
   phases sit in rather than a strip of its own: in Grid and Stream the plan is a
   table whose month lines run through every row, in Track the phase cards are
   laid out on the months themselves. Today is always the one dark mark.

   The head changes with the design, because the goal does not have to be read the
   same way twice:

     1 Grid      the goal large over a month table - a row a phase, its bar where
                 its dates fall, its KPI and target in their own columns
     2 Track     the goal on one line, the phases headed over the board, their
                 cards standing on the stretch of plan each one runs, the months
                 named under the line and today straight through it
     3 Stream    no goal in the head: the plan runs down the card and ends on it -
                 the dates at the left, a card a phase, today floating over the
                 phase it falls in
     4 Calendar  the goal large across the top, the three phases as cards under
                 it, and the plan's months right below them - a tick a week, a
                 band a phase, today one line down the weeks

   Each phase keeps one hue - solid while it runs, a tint while it is ahead, grey
   once it is past. */
(function () {
  'use strict';
  const B = window.Brain;
  const X = window.BX;
  const { esc, icon, ui, dates } = B;

  const HUES = ['#0ea5b8', '#8b5cf6', '#4f46e5', '#0f766e'];
  const hue = (p) => HUES[p.index % HUES.length];
  const pct = (rm, day) => Math.max(0, Math.min(100, (day / rm.horizon) * 100));
  const at = (rm, p) => pct(rm, p.days[0] - 1);
  const wide = (rm, p) => pct(rm, p.len);
  const stateWord = (p) =>
    p.state === 'current' ? 'Running now' : p.state === 'done' ? 'Done' : 'Upcoming';
  // the state as a small label, each on a light fill of its own
  const stateTag = (p) => `<span class="bx-rmn__state is-${p.state}">${stateWord(p)}</span>`;
  const num = (p) => `Phase ${p.index + 1}`;

  const factsBtn = (p) =>
    `<button type="button" class="bx-rmn__facts" data-rm-src data-rm-src-phase="${p.index}" data-tip="What this phase rests on · ${B.plural(p.facts.length, 'fact')} from the index, in the plan's sources">${B.plural(p.facts.length, 'fact')}${icon('arrow-right', 11)}</button>`;

  // the months, named where they start, with room enough to read
  const monthMarks = (rm) => X.monthBands(rm).filter((m) => m.width >= 7);
  const rulesHtml = (rm) =>
    `<span class="bx-rmn__rules" aria-hidden="true">${monthMarks(rm)
      .map((m) => `<i style="left:${m.left.toFixed(2)}%"></i>`)
      .join('')}</span>`;

  /* ------------------------------------------------------------- the head */

  const goalHtml = (rm) => {
    const m = rm.marketing;
    return esc(m.goal)
      .replace(`${esc(m.figure)} ${esc(m.unit)}`, `<b>${esc(m.figure)} ${esc(m.unit)}</b>`)
      .replace(esc(m.by), `<b class="bx-num">${esc(m.by)}</b>`);
  };

  // one quiet line of plan facts, the same in all three
  function metaHtml(rm, opts = {}) {
    const where = rm.before
      ? `Starts ${esc(dates.fmtShort(rm.start))}`
      : rm.after
        ? `Ended ${esc(dates.fmtShort(rm.end))}`
        : `<b class="bx-num">Day ${rm.day}</b> of ${rm.horizon}<span class="bx-sep">·</span><b class="bx-num">${B.plural(Math.max(0, rm.horizon - rm.day), 'day')}</b> left`;
    return `<p class="bx-rmn__meta"><b class="bx-num">${rm.horizon} days</b><span class="bx-sep">·</span><span class="bx-num">${esc(dates.fmtShort(rm.start))} – ${esc(dates.fmtShort(rm.end))}</span><span class="bx-sep">·</span>${where}${
      opts.short
        ? ''
        : rm.strategy.approvedAt
          ? `<span class="bx-sep">·</span>${esc(rm.strategy.version)} approved <span class="bx-num">${esc(dates.fmtShort(rm.strategy.approvedAt))}</span>`
          : `<span class="bx-sep">·</span>not approved yet`
    }</p>`;
  }

  /* what the plan rests on, as the product draws it: the three kinds of record
     stacked, then the count, then when it was approved */
  const srcBlock = (rm) => `
    <button type="button" class="bx-rmn__srcx" data-rm-src aria-haspopup="dialog">
      <span class="bx-rmn__srcicons" aria-hidden="true">
        <i class="is-approval">${icon('check', 11)}</i>
        <i class="is-answer">${icon('ask', 11)}</i>
        <i class="is-fact">${icon('page', 11)}</i>
      </span>
      <span class="bx-rmn__srctext"><b>${B.plural(X.rmSourceCount(rm), 'source')}</b> this plan rests on${icon('arrow-right', 13)}</span>
      <small class="bx-rmn__srcwhen">${icon('history', 11)}${rm.strategy.approvedAt ? 'Updated' : 'Drafted'} <span class="bx-num">${esc(dates.fmtShort(rm.strategy.approvedAt || rm.strategy.suggestedAt))}</span><span class="bx-sep">·</span>${esc(rm.strategy.name)} ${esc(rm.strategy.version)}</small>
    </button>`;

  const srcBtn = (rm) =>
    `<button type="button" class="bx-rmn__src" data-rm-src aria-haspopup="dialog" data-tip="What this plan rests on · The approval, the onboarding answer it grew from, and the facts behind each phase">${B.plural(X.rmSourceCount(rm), 'source')}${icon('arrow-right', 12)}</button>`;

  /* the head in four readings of the same goal: large across the top, large, on
     one line, or not in the head at all (Stream ends on it instead) */
  function headHtml(rm, kind) {
    if (kind === 'big')
      return `
        <header class="bx-rmn__head bx-rmn__head--big">
          <p class="bx-rmn__label">Marketing goal</p>
          <p class="bx-rmn__goal bx-rmn__goal--lg">${goalHtml(rm)}</p>
          ${srcBlock(rm)}
          ${metaHtml(rm, { short: true })}
        </header>`;
    if (kind === 'stream')
      return `
        <header class="bx-rmn__head bx-rmn__head--plain">
          <p class="bx-rmn__label">The 90-day plan</p>
          ${srcBtn(rm)}
          ${metaHtml(rm)}
        </header>`;
    if (kind === 'inline')
      return `
        <header class="bx-rmn__head bx-rmn__head--inline">
          <p class="bx-rmn__label">Marketing goal</p>
          <p class="bx-rmn__goal bx-rmn__goal--sm">${goalHtml(rm)}</p>
          ${srcBtn(rm)}
          ${metaHtml(rm)}
        </header>`;
    return `
      <header class="bx-rmn__head">
        <p class="bx-rmn__label">Marketing goal</p>
        <p class="bx-rmn__goal">${goalHtml(rm)}</p>
        ${srcBtn(rm)}
        ${metaHtml(rm)}
      </header>`;
  }

  const shell = (rm, cls, kind, body) => `
    ${headHtml(rm, kind)}
    <div class="bx-rmn__body bx-rmn__body--${cls}" data-rmn-body>${body}</div>`;

  /* --------------------------------------------------------------- 1 · Grid */

  /* the plan as one month table: the months head it, their lines run down every
     row, a phase's bar is drawn where its dates fall and carries the KPI it
     leads, and the target it must reach closes the row */
  function gridHtml(rm) {
    const now = X.todayPct(rm);
    /* the phase you are reading: the one running, unless you picked another - and
       clicking the one that is picked puts the card away and gives the months the
       whole width */
    const picked = pickedPhase(rm);
    const line =
      rm.before || rm.after
        ? ''
        : `<i class="bx-rmg__now" style="left:${now.toFixed(2)}%" aria-hidden="true"></i>`;
    const row = (p) => `
      <div class="bx-rmg__row is-${p.state} ${picked && picked.index === p.index ? 'is-picked' : ''}" role="row" data-rm-pick="${p.index}" tabindex="0" aria-pressed="${!!(picked && picked.index === p.index)}">
        <div class="bx-rmg__phase" role="rowheader">
          <p class="bx-rmg__num">${esc(num(p))}${stateTag(p)}</p>
          <p class="bx-rmg__when bx-num">${esc(X.phaseDates(p))}<span class="bx-sep">·</span>${p.len} days</p>
        </div>
        <div class="bx-rmg__track" role="cell">
          ${rulesHtml(rm)}
          <div class="bx-rmg__bar" style="left:${at(rm, p).toFixed(2)}%;width:${wide(rm, p).toFixed(2)}%">
            ${p.state === 'current' ? `<i class="bx-rmg__fill" style="width:${((p.elapsed / p.len) * 100).toFixed(2)}%"></i>` : ''}
            <h5 class="bx-rmg__name">${esc(p.name)}</h5>
          </div>
          ${line}
        </div>
      </div>`;
    return `
      <div class="bx-rmg2 ${picked ? 'is-open' : ''}">
        <div class="bx-rmg" role="table" aria-label="The plan's phases by month">
          <div class="bx-rmg__head" role="row">
            <span class="bx-rmg__h" role="columnheader">Phase</span>
            <div class="bx-rmg__scale" role="columnheader">
              ${monthMarks(rm)
                .map(
                  (m) =>
                    `<span class="bx-rmg__mon" style="left:${m.left.toFixed(2)}%">${esc(m.label)}</span>`
                )
                .join('')}
              ${
                rm.before || rm.after
                  ? ''
                  : `<span class="bx-rmn__chip bx-rmg__nowchip" style="left:clamp(44px, ${now.toFixed(2)}%, calc(100% - 44px))"><b>Today</b><span class="bx-num">${esc(dates.fmtShort(rm.today))}</span></span>`
              }
            </div>
          </div>
          <div class="bx-rmg__rows" role="rowgroup">${rm.phases.map(row).join('')}</div>
          <p class="bx-rmg__foot"><span class="bx-num">${esc(dates.fmtShort(rm.end))}</span> · the plan ends on <b class="bx-num">${esc(rm.marketing.figure)} ${esc(rm.marketing.unit)}</b></p>
        </div>
        ${picked ? phaseCard(picked) : ''}
      </div>`;
  }

  /* the phase you picked, read on its own: what it is aiming at and what it rests
     on - the two columns the table used to carry for every row at once */
  const phaseCard = (p) => `
    <aside class="bx-rmp2 is-${p.state}" aria-label="${esc(`${num(p)} - ${p.name}`)}">
      <header class="bx-rmp2__head">
        <span class="bx-rmp2__num">${esc(num(p))}</span>
        ${stateTag(p)}
      </header>
      <h5 class="bx-rmp2__name">${esc(p.name)}</h5>
      <p class="bx-rmp2__when bx-num">${esc(X.phaseDates(p))}<span class="bx-sep">·</span>${p.len} days</p>
      <dl class="bx-rmp2__f">
        <div>
          <dt>${icon('target', 12)}KPI it leads</dt>
          <dd>${esc(p.lead.label)}<b class="bx-num">${esc(p.lead.target)}</b></dd>
        </div>
        <div>
          <dt>${icon('milestone', 12)}Target by its end</dt>
          <dd><b class="bx-num">${esc(p.milestoneLabel)}</b><small class="bx-num">by ${esc(dates.fmtShort(p.end))}</small></dd>
        </div>
      </dl>
      <div class="bx-rmp2__foot">${factsBtn(p)}</div>
    </aside>`;

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = () => (typeof window.gsap === 'undefined' || reduced() ? null : window.gsap);

  /* Which phase is being read, given what has been picked: none, the one running,
     or the one named. */
  const pickedPhase = (rm) => {
    if (ui.rp.rmPick === null) return null;
    const running = rm.current || rm.next || rm.phases[rm.phases.length - 1];
    if (ui.rp.rmPick === undefined) return running || null;
    return rm.phases.find((p) => p.index === ui.rp.rmPick) || null;
  };

  /* Picking a phase used to redraw the whole plan, which read as a jump. Now only
     what changed changes: the marks on the rows, the class that opens the column
     the card sits in (the track widths transition), and the card's own words, which
     go out upwards and come back in under them. */
  function gridRepick(host) {
    const grid = host.querySelector('.bx-rmg2');
    if (!grid) return false;
    const rm = B.roadmapAt(B.state.today);
    const picked = pickedPhase(rm);
    B.$$('[data-rm-pick]', grid).forEach((r) => {
      const on = !!picked && Number(r.dataset.rmPick) === picked.index;
      r.classList.toggle('is-picked', on);
      r.setAttribute('aria-pressed', String(on));
    });
    const was = grid.querySelector('.bx-rmp2');
    const g = anim();
    if (!picked) {
      grid.classList.remove('is-open');
      if (was && g)
        g.to(was, {
          autoAlpha: 0,
          x: 10,
          duration: 0.18,
          ease: 'power1.in',
          onComplete: () => was.remove(),
        });
      else if (was) was.remove();
      return true;
    }
    if (!was) {
      grid.classList.add('is-open');
      grid.insertAdjacentHTML('beforeend', phaseCard(picked));
      const el = grid.querySelector('.bx-rmp2');
      if (g)
        g.fromTo(
          el,
          { autoAlpha: 0, x: 14 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.34,
            ease: 'power3.out',
            clearProps: 'opacity,visibility,transform',
          }
        );
      return true;
    }
    const tpl = document.createElement('template');
    tpl.innerHTML = phaseCard(picked).trim();
    const next = tpl.content.firstElementChild;
    if (!g) {
      was.replaceWith(next);
      return true;
    }
    // the wash follows the phase on its own transition, so only the words move
    was.className = next.className;
    g.to([...was.children], {
      autoAlpha: 0,
      y: -7,
      duration: 0.13,
      ease: 'power1.in',
      onComplete: () => {
        was.innerHTML = next.innerHTML;
        g.fromTo(
          [...was.children],
          { autoAlpha: 0, y: 9 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.28,
            ease: 'power2.out',
            stagger: 0.035,
            clearProps: 'opacity,visibility,transform',
          }
        );
      },
    });
    return true;
  }

  /* -------------------------------------------------------------- 2 · Track */

  /* the phases as cards standing on the months they run through: the card is as
     wide as its own stretch of the plan, the month lines run behind them, and
     today is one line through the whole board */
  function trackHtml(rm) {
    const now = X.todayPct(rm);
    const head = (p) => `
      <li class="bx-rmt2__ph is-${p.state}" style="--hue:${hue(p)};left:${at(rm, p).toFixed(2)}%;width:${wide(rm, p).toFixed(2)}%">
        <span class="bx-rmt2__phname">${esc(num(p))}</span>
        ${stateTag(p)}
      </li>`;
    const card = (p) => `
      <li class="bx-rmt2__slot" style="left:${at(rm, p).toFixed(2)}%;width:${wide(rm, p).toFixed(2)}%">
        <div class="bx-rmt2__card is-${p.state}" style="--hue:${hue(p)}">
          <div class="bx-rmt2__top">
            <h5 class="bx-rmt2__name">${esc(p.name)}</h5>
            <p class="bx-rmt2__when bx-num">${esc(X.phaseDates(p))}<span class="bx-sep">·</span>${p.len} days</p>
          </div>
          <dl class="bx-rmt2__f">
            <div><dt>KPI it leads</dt><dd>${esc(p.lead.label)} <b class="bx-num">${esc(p.lead.target)}</b></dd></div>
            <div><dt>Target by its end</dt><dd><b class="bx-num">${esc(p.milestoneLabel)}</b> <span class="bx-rmt2__soft bx-num">by ${esc(dates.fmtShort(p.end))}</span></dd></div>
          </dl>
          <div class="bx-rmt2__foot">${factsBtn(p)}</div>
        </div>
      </li>`;
    return `
      <div class="bx-rmt2">
        <ol class="bx-rmt2__phs">
          ${rm.phases.map(head).join('')}
          ${
            rm.before || rm.after
              ? ''
              : `<span class="bx-rmn__chip bx-rmt2__nowchip" style="left:clamp(46px, ${now.toFixed(2)}%, calc(100% - 46px))"><b>Today</b><span class="bx-num">${esc(dates.fmtShort(rm.today))}</span></span>`
          }
        </ol>
        <div class="bx-rmt2__board">
          ${rulesHtml(rm)}
          ${rm.before || rm.after ? '' : `<i class="bx-rmt2__now" style="left:${now.toFixed(2)}%" aria-hidden="true"></i>`}
          <ol class="bx-rmt2__cards">${rm.phases.map(card).join('')}</ol>
        </div>
        <div class="bx-rmt2__rail" aria-hidden="true">
          <i class="bx-rmt2__fill" style="width:${pct(rm, rm.day).toFixed(2)}%"></i>
          ${rm.phases.map((p) => `<i class="bx-rmt2__node ${p.state === 'upcoming' ? '' : 'is-done'}" style="left:${at(rm, p).toFixed(2)}%"></i>`).join('')}
          <i class="bx-rmt2__node is-end" style="left:100%"></i>
        </div>
        <div class="bx-rmt2__months">
          ${monthMarks(rm)
            .map(
              (m) =>
                `<span class="bx-rmt2__mon" style="left:${m.left.toFixed(2)}%">${esc(m.label)}</span>`
            )
            .join('')}
        </div>
        <div class="bx-rmt2__ends">
          <span class="bx-num">${esc(dates.fmtShort(rm.start))}</span>
          <span class="bx-num">${esc(dates.fmtShort(rm.end))} · ${esc(rm.marketing.figure)} ${esc(rm.marketing.unit)}</span>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------- 3 · Stream */

  /* the plan down the card, as a dated table: the dates at the left on the line,
     a row a phase under the same three column heads, today a dark dated row where
     it falls - and the goal is the row the plan ends on */
  function streamHtml(rm) {
    const nowIn = (p) =>
      p.state === 'current' && !rm.before && !rm.after
        ? `<span class="bx-rms2__now"><i style="width:${Math.max(4, Math.min(96, (p.elapsed / p.len) * 100)).toFixed(2)}%"></i><span class="bx-rmn__chip"><b>Today</b><span class="bx-num">Day ${rm.day} of ${rm.horizon}</span></span></span>`
        : '';
    const row = (p) => `
      <li class="bx-rms2__row is-${p.state}" style="--hue:${hue(p)}">
        <p class="bx-rms2__when">
          <b class="bx-num">${esc(dates.fmtShort(p.start))}</b>
          <small class="bx-num">to ${esc(dates.fmtShort(p.end))}<span class="bx-sep">·</span>${p.len} days</small>
        </p>
        <span class="bx-rms2__node" aria-hidden="true"></span>
        <div class="bx-rms2__card">
          <div class="bx-rms2__what">
            <p class="bx-rms2__num">${esc(num(p))}${stateTag(p)}</p>
            <h5 class="bx-rms2__name">${esc(p.name)}</h5>
          </div>
          <p class="bx-rms2__kpi">${esc(p.lead.label)} <b class="bx-num">${esc(p.lead.target)}</b></p>
          <p class="bx-rms2__target"><b class="bx-num">${esc(p.milestoneLabel)}</b>${factsBtn(p)}</p>
          ${nowIn(p)}
        </div>
      </li>`;
    return `
      <div class="bx-rms2">
        <div class="bx-rms2__head">
          <span>When</span>
          <span></span>
          <span class="bx-rms2__hcard"><span>Phase</span><span>KPI it leads</span><span>Target by its end</span></span>
        </div>
        <ol class="bx-rms2__rows">
          ${rm.phases.map(row).join('')}
          <li class="bx-rms2__row is-end">
            <p class="bx-rms2__when"><b class="bx-num">${esc(dates.fmtShort(rm.end))}</b></p>
            <span class="bx-rms2__node is-end" aria-hidden="true">${icon('flag', 11)}</span>
            <div class="bx-rms2__card bx-rms2__card--end">
              <div class="bx-rms2__goal">
                <p class="bx-rmn__label">Marketing goal</p>
                <p class="bx-rms2__goaltext">${goalHtml(rm)}</p>
              </div>
            </div>
          </li>
        </ol>
      </div>`;
  }

  /* ----------------------------------------------------------- 4 · Calendar */

  /* the goal large across the top, the three phases as cards under it, and right
     below them the plan's own months - a week a tick, each phase a band where its
     dates fall, today one line down the whole thing */
  function calendarHtml(rm) {
    const now = X.todayPct(rm);
    const card = (p) => `
      <li class="bx-rmc2__card is-${p.state}" style="--hue:${hue(p)}">
        <i class="bx-rmc2__rule" aria-hidden="true"></i>
        <div class="bx-rmc2__top">
          <p class="bx-rmc2__num">${esc(num(p))}${stateTag(p)}</p>
          <h5 class="bx-rmc2__name">${esc(p.name)}</h5>
          <p class="bx-rmc2__when bx-num">${esc(X.phaseDates(p))}<span class="bx-sep">·</span>${p.len} days</p>
        </div>
        <dl class="bx-rmc2__f">
          <div><dt>KPI it leads</dt><dd>${esc(p.lead.label)} <b class="bx-num">${esc(p.lead.target)}</b></dd></div>
          <div><dt>Target by its end</dt><dd><b class="bx-num">${esc(p.milestoneLabel)}</b> <span class="bx-rmc2__soft bx-num">by ${esc(dates.fmtShort(p.end))}</span></dd></div>
        </dl>
        <div class="bx-rmc2__foot">${factsBtn(p)}</div>
      </li>`;
    // a tick a week, so the months read like a calendar rather than a bar
    const weeks = [];
    for (let d = 7; d < rm.horizon; d += 7) weeks.push(pct(rm, d));
    const months = monthMarks(rm);
    return `
      <div class="bx-rmc2">
        <ol class="bx-rmc2__cards">${rm.phases.map(card).join('')}</ol>
        <div class="bx-rmc2__cal">
          <div class="bx-rmc2__months">
            ${months
              .map(
                (m, i) =>
                  `<span class="bx-rmc2__mon" style="left:${m.left.toFixed(2)}%;width:${(i + 1 < months.length ? months[i + 1].left - m.left : 100 - m.left).toFixed(2)}%">${esc(m.label)}</span>`
              )
              .join('')}
          </div>
          <div class="bx-rmc2__grid">
            ${weeks.map((w) => `<i class="bx-rmc2__week" style="left:${w.toFixed(2)}%"></i>`).join('')}
            ${months.map((m) => `<i class="bx-rmc2__mline" style="left:${m.left.toFixed(2)}%"></i>`).join('')}
            ${rm.phases
              .map(
                (p) =>
                  `<span class="bx-rmc2__band is-${p.state}" style="--hue:${hue(p)};left:${at(rm, p).toFixed(2)}%;width:calc(${wide(rm, p).toFixed(2)}% - 7px)"><b>${esc(num(p))}</b></span>`
              )
              .join('')}
            ${
              rm.before || rm.after
                ? ''
                : `<i class="bx-rmc2__now" style="left:${now.toFixed(2)}%"></i>`
            }
          </div>
          <div class="bx-rmc2__ends">
            <span class="bx-num">${esc(dates.fmtShort(rm.start))}</span>
            ${
              rm.before || rm.after
                ? ''
                : `<span class="bx-rmn__chip bx-rmc2__nowchip" style="left:clamp(46px, ${now.toFixed(2)}%, calc(100% - 46px))"><b>Today</b><span class="bx-num">${esc(dates.fmtShort(rm.today))}</span></span>`
            }
            <span class="bx-num">${esc(dates.fmtShort(rm.end))} · ${esc(rm.marketing.figure)} ${esc(rm.marketing.unit)}</span>
          </div>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------- the three */

  function paint(host, state, kind, html) {
    const rm = B.roadmapAt(state.today);
    const body = host.querySelector('[data-rmn-body]');
    if (body) body.innerHTML = html(rm);
    const head = host.querySelector('.bx-rmn__head');
    if (head) head.outerHTML = headHtml(rm, kind);
  }

  const design = (key, cls, kind, html, extra) =>
    B.register('roadmap', key, {
      cardClass: `bx-rmn bx-rmn--${cls}`,
      render({ state }) {
        const rm = B.roadmapAt(state.today);
        return shell(rm, cls, kind, html(rm));
      },
      onDate: (host, { state }) => paint(host, state, kind, html),
      ...(extra || {}),
    });

  design('1', 'grid', 'full', gridHtml, { repick: gridRepick });
  design('2', 'track', 'inline', trackHtml);
  design('3', 'stream', 'stream', streamHtml);
  design('4', 'calendar', 'big', calendarHtml);

  /* The roadmap section's four fields read the plan as it stands now, so changing
     how long it runs changes what they say (`live` in `brain-fields.js`). */
  window.BXF_LIVE = {
    marketing: () => B.roadmapAt(B.state.today).marketing.goal,
    kpis: () =>
      B.roadmapAt(B.state.today)
        .kpis.map((k) => `${k.label} → ${k.target} ${k.note}`)
        .join(' · '),
    phases: () =>
      B.roadmapAt(B.state.today)
        .phases.map(
          (p) =>
            `${p.name} (${B.dates.fmtShort(p.start)} – ${B.dates.fmtShort(p.end)}) → ${p.milestoneLabel}`
        )
        .join(' · '),
    strategy: () => {
      const rm = B.roadmapAt(B.state.today);
      const S = rm.strategy;
      return S.approvedBy
        ? `${S.name} ${S.version}, approved by ${S.approvedBy} · written from what the brand answered in onboarding: “${S.answer}”`
        : `${S.name}, not approved yet · drafted from what the last plan ended on: “${S.answer}”`;
    },
  };
})();
