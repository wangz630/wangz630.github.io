/* How a report field's answer reads: Panels, settled in round 22.

   The answer is always the same captured sentences with their citations. Panels
   puts the field at a glance in four tinted blocks first, then the whole answer
   at one body size, three lines and Show more. (Prose and Editorial were dropped.)

   The blocks live in `answer-data.js` and are written for the prototype (the
   README says so; the page carries no notes about itself). */
(function () {
  'use strict';
  const B = window.Brain;
  const X = window.BX;
  const { esc, icon, ui } = B;
  const EXTRA = window.BRAIN_ANSWER_EXTRA || {};

  const extraOf = (f) => EXTRA[f.id] || {};

  /* ------------------------------------------------------- marking phrases */

  // mark the phrases that carry the answer, inside the text only - never inside a
  // citation button or an attribute
  function markTerms(html, terms) {
    if (!terms || !terms.length) return html;
    const quoted = terms
      .slice()
      .sort((a, b) => b.length - a.length)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${quoted.join('|')})`, 'gi');
    return `>${html}<`
      .replace(/>([^<]*)</g, (m, text) => `>${text.replace(re, '<mark class="bx-hl">$1</mark>')}<`)
      .slice(1, -1);
  }

  /* ------------------------------------------------------------- the pieces */

  const moreBtn = (key, open) =>
    `<button type="button" class="brain-field__more bx-more" data-more="${key}" aria-expanded="${open}" hidden>${open ? 'Show less' : 'Show more'}</button>`;

  /* ------------------------------------------------------------ 3 · Panels */

  // the field at a glance in four tinted blocks first, then the whole answer at one
  // body size, three lines and Show more
  function panels(f, key, open) {
    const glance = extraOf(f).glance || [];
    const all = f.paragraphs.map((p) => `<p>${X.tokensHtml(p, f.id).trim()}</p>`).join('');
    return `
      <div class="bx-ans bx-ans--panels">
        ${
          glance.length
            ? `<div class="bx-glc bx-glc--style-a">
                 ${glance
                   .map(
                     (g, i) => `
                   <div class="bx-glc__cell bx-glc--${esc(g.tone || 'a')}">
                     <span class="bx-glc__mark">${icon(g.icon || 'fact', 14)}</span>
                     <p class="bx-glc__label">${esc(g.label)}</p>
                     <p class="bx-glc__value">${esc(g.value)}</p>
                     <span class="bx-glc__n bx-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                   </div>`
                   )
                   .join('')}
               </div>`
            : ''
        }
        <div class="bx-arest bx-ans__body bx-clamp ${open ? '' : 'is-clamped'}" style="--lines:3" data-clamp="${key}">${all}</div>
        ${moreBtn(key, open)}
      </div>`;
  }

  // one entry point, with the fold state kept per field
  function answerFor(f, scope) {
    const key = `${scope}:${f.id}`;
    const open = !!ui.rp.more[key];
    const html = panels(f, key, open);
    // the answer's key words are marked in its own text, never in the blocks
    return X.markEntitiesHtml(html, { id: f.id, within: '.bx-ans__body' });
  }

  window.BXA = { answerFor, markTerms };
  X.answerFor = answerFor;
})();
