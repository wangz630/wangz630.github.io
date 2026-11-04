/* Ask, folded into the chat dock.

   Ask used to be its own tab: a search box, a line of explanation, a few starter
   questions and the matching facts underneath. It now lives where the product
   already puts questions - the message bar at the bottom. Typing there opens
   Vicino's panel on the left, and the answer arrives as a message: the stitched
   sentences with their citations, then the facts they came from, each openable
   in Knowledge. */
(function () {
  'use strict';
  const B = window.Brain;
  const { esc, icon, ui, facts } = B;

  const chat = (ui.chat = ui.chat || { msgs: [], pending: null, open: false, tipSeen: false });
  try {
    chat.tipSeen = localStorage.getItem('brain-prototype:asktip') === '1';
  } catch (e) {
    /* private window: the tip just shows again */
  }

  const STARTERS = [
    'What does HomeCourt cost?',
    'What do teams get for free?',
    'Who is HomeCourt+ for?',
  ];

  // the questions Brain can answer, by the part of the brand they touch
  const PROMPT_GROUPS = [
    {
      label: 'Pricing',
      icon: 'tag',
      tone: 'blue',
      kind: 'pricing',
      qs: [
        'What does HomeCourt cost?',
        'What do teams pay per player?',
        'What do teams get for free?',
      ],
    },
    {
      label: 'Audience',
      icon: 'users',
      tone: 'teal',
      kind: 'audience',
      qs: ['Who is HomeCourt+ for?', 'What do coaches get?', 'Does it work for schools?'],
    },
    {
      label: 'Proof',
      icon: 'check',
      tone: 'indigo',
      kind: 'claim',
      qs: [
        'What proof does HomeCourt lean on?',
        'Which pros appear in the material?',
        'What does the press say?',
      ],
    },
  ];

  /* ------------------------------------------------------------- retrieval */

  const STOP = new Set(
    'the a an and or of to in on for with what does do is are it its this that brand say says about how who which from by be can as at their they them has have your you our homecourt'.split(
      ' '
    )
  );
  const SYN = {
    cost: ['pricing', '$', 'price', 'plan'],
    price: ['pricing', '$'],
    team: ['teams'],
    coach: ['coaches'],
    teacher: ['teachers', 'pe'],
    free: ['free'],
    school: ['schools', 'pe'],
  };
  const tokenize = (q) =>
    q
      .toLowerCase()
      .replace(/[^a-z0-9$+\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map((w) => w.replace(/s$/, ''));

  function askIndex(q) {
    const terms = tokenize(q);
    const expanded = terms.flatMap((t) => [t, ...(SYN[t] || [])]);
    if (!expanded.length) return { hits: [], answer: [] };
    const scored = facts
      .map((f) => {
        const hay = `${f.statement} ${f.kind}`.toLowerCase();
        const ev = B.evidencePlain(f.evidence || f.recordedAs || '').toLowerCase();
        let score = 0;
        expanded.forEach((t) => {
          if (hay.includes(t)) score += 1;
          else if (ev.includes(t)) score += 0.35;
        });
        return { f, score: score * f.confidence };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 12);
    const max = top.length ? top[0].score : 1;
    return {
      hits: top.map((x) => ({ ...x, rel: x.score / max })),
      answer: top.slice(0, 3).map((x) => x.f),
    };
  }

  /* --------------------------------------------------------------- messages */

  const orb = (size) =>
    `<span class="vorb" aria-hidden="true" style="width:${size}px;height:${size}px"><span class="vorb__halo"></span><span class="vorb__core"></span></span>`;

  const userMsg = (text) => `
    <article class="chat-dock__message is-user">
      <span class="chat-dock__avatar" aria-hidden="true">You</span>
      <div class="chat-dock__message-body">
        <div class="chat-dock__sender">You</div>
        <div class="chat-dock__message-text"><p>${esc(text)}</p></div>
      </div>
    </article>`;

  const assistantShell = (inner) => `
    <article class="chat-dock__message">
      <span class="chat-dock__avatar is-orb" aria-hidden="true">${orb(22)}</span>
      <div class="chat-dock__message-body">
        <div class="chat-dock__sender">Vicino</div>
        <div class="chat-dock__message-text">${inner}</div>
      </div>
    </article>`;

  const pendingMsg = () =>
    assistantShell(
      `<p class="bx-chat__pending">${icon('search', 14)}Reading the index…<span class="bx-chat__dots" aria-hidden="true"><i></i><i></i><i></i></span></p>`
    );

  // the answer: the stitched sentences, then the facts they rest on
  function answerMsg(m) {
    const { q, result } = m;
    if (!result.hits.length)
      return assistantShell(`
        <div class="chat-dock__markdown">
          <p>Nothing in the index matches “${esc(q)}” yet. Try another wording, or add a source in Library.</p>
        </div>`);
    const answer = result.answer
      .map(
        (f, i) =>
          `${esc(f.statement)} <button type="button" class="brain-prose__cite bx-cite bx-chat__cite" data-chat-fact="${f.id}" aria-label="Fact ${i + 1}">[${i + 1}]</button>`
      )
      .join(' ');
    const open = !!m.openSources;
    return assistantShell(`
      <div class="chat-dock__assistant-answer">
        <div class="chat-dock__markdown"><p>${answer}</p></div>
        <p class="bx-chat__note">${icon('info', 12)}Stitched from the brand's own facts - every sentence is one of them.</p>
        <aside class="chat-dock__brand-sources" aria-label="Brand sources">
          <div class="chat-dock__brand-sources-head">
            <button type="button" class="chat-dock__brand-sources-toggle" data-chat-src="${esc(m.id)}" aria-expanded="${open}">
              <span>Brand sources</span> <span class="chat-dock__brand-sources-count">· ${result.hits.length}</span>
              ${icon('chevron-down', 14)}
            </button>
          </div>
          ${
            open
              ? `<ol class="bx-chat__hits">
                  ${result.hits
                    .map(
                      (h) => `
                    <li class="bx-chat__hit">
                      <p class="bx-chat__stmt">${esc(h.f.statement)}</p>
                      <p class="bx-chat__meta">
                        <span>${esc(h.f.src.short)}</span>
                        <span class="bx-sep">·</span>
                        <span class="bx-num">${h.f.confidence.toFixed(2)}</span>
                        <span class="bx-chat__rel" aria-hidden="true"><i style="width:${Math.round(h.rel * 100)}%"></i></span>
                        <button type="button" class="bx-link bx-link--quiet" data-chat-open="${h.f.id}">Open in Knowledge${icon('arrow-right', 12)}</button>
                      </p>
                    </li>`
                    )
                    .join('')}
                </ol>`
              : ''
          }
        </aside>
      </div>`);
  }

  const emptyHtml = () => `
    <div class="chat-dock__empty">
      <span class="chat-dock__empty-mark is-orb" aria-hidden="true">${orb(28)}</span>
      <h2>Ask Brain</h2>
      <p>Ask a question and Brain answers it from this brand's own material, with every sentence marked back to the fact it rests on.</p>
      <div class="chat-dock__prompt-chips">
        ${STARTERS.map((s) => `<button type="button" data-chat-ask="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>
    </div>`;

  function bodyHtml() {
    if (!chat.msgs.length && !chat.pending) return emptyHtml();
    return (
      chat.msgs.map((m) => (m.role === 'user' ? userMsg(m.text) : answerMsg(m))).join('') +
      (chat.pending ? userMsg(chat.pending) + pendingMsg() : '')
    );
  }

  /* ------------------------------------------------------------------ dock */

  function bindChat() {
    const dock = document.querySelector('.chat-dock');
    if (!dock) return;
    const panel = dock.querySelector('.chat-dock__panel');
    const body = dock.querySelector('.chat-dock__body');
    const input = dock.querySelector('.chat-dock__launcher-input');
    const composer = dock.querySelector('.chat-dock__input');
    const subtitle = dock.querySelector('.chat-dock__subtitle');
    const close = dock.querySelector('[aria-label="Close Vicino assistant"]');

    const paint = () => {
      body.innerHTML = bodyHtml();
      body.scrollTop = body.scrollHeight;
      if (subtitle)
        subtitle.textContent = chat.msgs.length
          ? chat.msgs.find((m) => m.role === 'user').text
          : 'Ask this brand’s index';
    };
    const setOpen = (open) => {
      chat.open = open;
      dock.classList.toggle('is-open', open);
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      if (open) {
        paint();
        setTimeout(() => composer && composer.focus(), 60);
      }
    };
    const send = (text) => {
      const q = (text || '').trim();
      if (!q) return;
      if (!chat.open) setOpen(true);
      chat.pending = q;
      paint();
      dismissTip();
      closeSheet();
      setTimeout(() => {
        chat.msgs.push({ role: 'user', text: q });
        chat.msgs.push({
          role: 'vicino',
          id: `a${chat.msgs.length}`,
          q,
          result: askIndex(q),
          openSources: false,
        });
        chat.pending = null;
        paint();
      }, 850);
    };

    /* ----------------------------------------------- how people find the bar

       Focus or hover the bar and a small sheet rises above it with a question
       from two of the groups Brain answers about - no kinds named, no colour per
       group, and neither the bar nor the sheet carries a stroke. It is one line:
       the title, the questions, then Other questions and Close (settled in round
       22; the Band and Quiet designs were dropped). */
    const askUi = dock.querySelector('[data-ask-ui]');
    const launcher = dock.querySelector('.chat-dock__launcher');
    let askRot = 0;
    let sheetOpen = false;

    function remember() {
      chat.tipSeen = true;
      try {
        localStorage.setItem('brain-prototype:asktip', '1');
      } catch (e) {
        /* nothing to remember in a private window */
      }
    }
    let closeWait = null;
    let flashOff = null;
    const holdSheet = () => clearTimeout(closeWait);
    const closeSheet = () => {
      clearTimeout(closeWait);
      if (!sheetOpen) return;
      sheetOpen = false;
      const sheet = askUi && askUi.querySelector('[data-ask-sheet]');
      if (sheet) sheet.hidden = true;
    };
    // asking clears whatever was offering questions
    const dismissTip = () => closeSheet();
    const openSheet = () => {
      holdSheet();
      if (sheetOpen || chat.open) return;
      sheetOpen = true;
      const sheet = askUi && askUi.querySelector('[data-ask-sheet]');
      if (sheet) {
        sheet.hidden = false;
        B.motion.rise(sheet, { y: 8, duration: 0.22 });
      }
    };

    /* One question from each group Brain answers about, on one line under a title
       - no kinds named, no colour per group: the sheet is the bar's own width and
       reads as one quiet band. Other questions turns all three to their next. */
    const askRowHtml = (n) =>
      PROMPT_GROUPS.slice(0, n || PROMPT_GROUPS.length)
        .map((g) => {
          const q = g.qs[askRot % g.qs.length];
          return `<button type="button" class="bx-askw__q" data-chat-ask="${esc(q)}">${esc(q)}</button>`;
        })
        .join('');

    const intro = `<p class="bx-askw__intro">Ask Brain about <b>${esc(B.D.brand.name)}</b></p>`;
    const closeBtn = `<button type="button" class="bx-askw__x" data-ask-close aria-label="Close">${icon('x', 14)}</button>`;
    const rotateBtn = `<button type="button" class="bx-askw__more" data-ask-rotate aria-label="Other questions" data-tip="Other questions">${icon('refresh', 13)}</button>`;

    /* Line, settled in round 22: the title, two questions and the two buttons on
       one row - the shortest the sheet can be. (Band and Quiet were dropped.) */
    const askUiHtml = () => `
      <div class="bx-askw__sheet bx-askw__sheet--v2" data-ask-sheet hidden>
        <div class="bx-askw__line">
          <span class="bx-askw__mark" aria-hidden="true">${orb(16)}</span>
          ${intro}
          <span class="bx-askw__qs" data-ask-rows>${askRowHtml(2)}</span>
          ${rotateBtn}
          ${closeBtn}
        </div>
      </div>`;

    function paintAsk() {
      if (!askUi) return;
      sheetOpen = false;
      askUi.innerHTML = askUiHtml();
      dock.classList.add('is-ask-sheet');
    }
    paintAsk();
    document.addEventListener('brain:render', paintAsk);

    if (launcher) {
      launcher.addEventListener('focusin', openSheet);
      launcher.addEventListener('mouseenter', openSheet);
    }
    // leaving gives you a moment to reach the sheet; the sheet itself holds it open
    const closeSoon = () => {
      clearTimeout(closeWait);
      if (document.activeElement === input) return;
      closeWait = setTimeout(closeSheet, 320);
    };
    dock.addEventListener('mouseleave', closeSoon);
    if (askUi) {
      askUi.addEventListener('mouseenter', holdSheet);
      askUi.addEventListener('mouseleave', closeSoon);
      askUi.addEventListener('focusin', holdSheet);
    }

    dock.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.target.closest('.chat-dock__launcher')) {
        send(input.value);
        input.value = '';
        return;
      }
      if (e.target.closest('.chat-dock__form')) {
        send(composer.value);
        composer.value = '';
      }
    });
    dock.addEventListener('input', (e) => {
      if (e.target === composer) {
        const btn = dock.querySelector('.chat-dock__send');
        if (btn) btn.disabled = !composer.value.trim();
      }
    });
    dock.addEventListener('keydown', (e) => {
      if (e.target === composer && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(composer.value);
        composer.value = '';
      }
      if (e.key === 'Escape' && chat.open) setOpen(false);
      if (e.key === 'Escape' && sheetOpen) closeSheet();
    });
    dock.addEventListener('click', (e) => {
      if (e.target.closest('[data-tip-close]')) {
        dismissTip();
        return;
      }
      if (e.target.closest('[data-ask-close]')) {
        closeSheet();
        remember();
        return;
      }
      // the next question in each group, the sheet staying where it is
      if (e.target.closest('[data-ask-rotate]')) {
        askRot++;
        const rows = askUi && askUi.querySelector('[data-ask-rows]');
        if (rows) {
          rows.innerHTML = askRowHtml(2);
          B.motion.fadeIn(rows, { duration: 0.18 });
        }
        return;
      }
      const chip = e.target.closest('[data-chat-ask]');
      if (chip) {
        send(chip.dataset.chatAsk);
        return;
      }
      const src = e.target.closest('[data-chat-src]');
      if (src) {
        const m = chat.msgs.find((x) => x.id === src.dataset.chatSrc);
        if (m) {
          m.openSources = !m.openSources;
          paint();
        }
        return;
      }
      const openFact = e.target.closest('[data-chat-open], [data-chat-fact]');
      if (openFact) {
        const id = openFact.dataset.chatOpen || openFact.dataset.chatFact;
        setOpen(false);
        B.openFact(id);
        return;
      }
      if (e.target.closest('[data-dock-close]') || (close && close.contains(e.target)))
        setOpen(false);
    });

    // the page's own "Ask Brain" button points at the bar
    document.addEventListener('brain:ask', (e) => {
      if (e.detail && e.detail.q) {
        send(e.detail.q);
        return;
      }
      dismissTip();
      if (input) {
        input.focus();
        const bar = input.closest('.chat-dock__launcher');
        // restart it even if the button is pressed while a nudge is still running
        bar.classList.remove('is-flash');
        void bar.offsetWidth;
        bar.classList.add('is-flash');
        clearTimeout(flashOff);
        flashOff = setTimeout(() => bar.classList.remove('is-flash'), 2100);
      }
    });
    document.addEventListener('click', (e) => {
      if (sheetOpen && !e.target.closest('.chat-dock')) closeSheet();
    });
  }

  B.askIndex = askIndex;
  B.bindChat = bindChat;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindChat);
  else bindChat();
})();
