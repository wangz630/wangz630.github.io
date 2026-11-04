/* Campaign post drawer — prototype script.

   Draws the proposed drawer (Brief / Storyboard / Context, the scene page,
   the dialogs, the footer) from CD_DATA. (The captured "Now" design was
   dropped in round 145.) Everything re-renders from `state`; text being typed
   lives in `state.draft` and never triggers a render. */
(function () {
  'use strict';

  var D = window.CD_DATA;
  var gsapOk = typeof window.gsap !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ state
  var params = new URLSearchParams(location.search);
  var initFormat =
    ['video', 'carousel', 'text'].indexOf(params.get('f')) > -1 ? params.get('f') : 'video';
  var state = {
    format: initFormat,
    post: clone(fmtSrc(initFormat).post),
    slides: clone(fmtSrc(initFormat).slides),
    copy: D.result[initFormat].copy,
    copyEdit: false,
    scheduled: false,
    failed: false, // generation broke, as opposed to you pressing Stop
    published: false,
    tags: [],
    drawing: false,
    req: null, // the Request changes composer: null | { step: 'ask' | 'plan' | 'running' }
    lightbox: null,
    playing: false,
    pickTime: 0,
    checksOpen: false,
    postedOpen: false,
    // only the proposed design is left (round 145)
    design: 'new',
    open: true,
    tab: 'brief',
    scene: null, // index of the scene page, or null
    paneTab: 'desc',
    edit: null, // 'who' | 'plan' | 'line:<i>' | 'ref:<i>'
    draft: {},
    rewrite: false,
    details: false,
    notes: false,
    tl: false,
    planned: params.get('s') !== 'unplanned',
    stale: params.get('s') === 'stale',
    lookPrev: null,
    decided: {},
    product: null,
    gen: null, // 'running' | 'stopped' | 'done'
    genPct: 0,
    modal: null,
    pop: null,
    toast: null,
    version: fmtSrc(initFormat).post.version,
    approved: null,
    primary: 'ink',
    // the design is settled (round 146): one version of each part is left,
    // the rest dropped from the Prototype panel and the link
    layout: 'clean',
    stepbar: 'glass',
    sblayout: 'bubble',
    glOpen: false,
    sbCase: 'words',
    flow: null,
    sbMode: false,
    nextUi: 'split',
    barUi: 'card',
    histOpen: false,
    lineEdit: null,
    sumbar: ['facts', 'stats', 'line'].indexOf(params.get('sm')) > -1 ? params.get('sm') : 'facts',
    chrome: 'flat',
    surface: 'paper',
    todoOpen: false,
    previewMode: 'auto',
    moreBrief: false,
    factHelp: null,
    refMenu: null,
    refMenuUp: false,
    // sample notices answered in this visit (prototype only)
    samplesDone: {},
    // C's preview breaks out over the card's top edge
    artOut: true,
    // a reference is added from one Add tile with a menu
    refAdd: 'menu',
    // the references sit as cards
    refUi: 'cards',
    refAddMenu: false,
    // the video's plan and Look, tone and voice on one card
    planUi: 'merged',
    // the first-visit tip at the menu by the button
    coach: false,
    ownAsset: null,
    planChoice: 'vicino',
    modeMenu: false,
    planning: false,
    showTodo: params.get('tc') === '1',
    vchat: null,
    lookOpen: false,
    nudge: true,
    unsaved: false,
    undo: null,
    when: fmtSrc(initFormat).post.when,
    brief: clone(fmtSrc(initFormat).brief),
    scenes: clone(fmtSrc(initFormat).scenes),
    refs: JSON.parse(JSON.stringify(D.references)),
    captions: JSON.parse(JSON.stringify(D.captions)),
    comments: 0,
  };
  if (state.stale) state.lookPrev = state.brief.look;
  var swOpen = false;
  var swHidden = false;

  // ---------------------------------------------------------------- helpers
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  // where a format's starting data lives: the video is the top-level post
  function fmtSrc(f) {
    f = f || state.format;
    if (f === 'video') return { post: D.post, brief: D.brief, scenes: D.scenes, slides: [] };
    var x = D.formats[f];
    return { post: x.post, brief: x.brief, scenes: [], slides: x.slides };
  }

  function isVideo() {
    return state.format === 'video';
  }

  // after Approve & generate the brief and storyboard are read-only
  function locked() {
    return !!state.gen;
  }

  // the post's stage: brief → generating → review → scheduled
  function stage() {
    if (!state.gen) return 'brief';
    if (state.gen === 'running' || state.gen === 'stopped') return 'generating';
    return state.scheduled ? 'scheduled' : 'review';
  }

  function steps() {
    return isVideo() ? 3 : 2;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var ICONS = {
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    spark:
      '<path d="M12 3v2"/><path d="M12 19v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>',
    // Lucide sparkles, as on the product's Rewrite with Vicino button
    wand: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    archive:
      '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    chevU: '<path d="m18 15-6-6-6 6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowL: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    arrowUp: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    coins:
      '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    feather:
      '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
    badge:
      '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    quote:
      '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    calendar:
      '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    layers:
      '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    text: '<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>',
    expand:
      '<path d="m15 3 6 6"/><path d="M21 3v6h-6"/><path d="m9 21-6-6"/><path d="M3 21v-6h6"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    stop: '<rect width="12" height="12" x="6" y="6" rx="2"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    trash:
      '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    upload:
      '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    x: '<path d="M4 4l16 16M20 4L4 20" stroke-width="2.6"/>',
    play: '<path d="M7 4.5v15l12-7.5Z" fill="currentColor" stroke="none"/>',
    pause:
      '<rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    mute: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
    replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    target:
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    wave: '<path d="M2 12h3l3-7 4 14 3-9 2 4h5"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    film: '<rect width="18" height="16" x="3" y="4" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    sliders:
      '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  };

  function ic(name, size) {
    size = size || 14;
    return (
      '<svg class="cd-ic" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICONS[name] +
      '</svg>'
    );
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function fmtTime(sec) {
    return Math.floor(sec / 60) + ':' + pad(sec % 60);
  }

  function sceneStart(i) {
    var t = 0;
    for (var k = 0; k < i; k++) t += state.scenes[k].dur;
    return t;
  }

  function totalDur() {
    return state.scenes.reduce(function (a, s) {
      return a + s.dur;
    }, 0);
  }

  function wordsFit(dur) {
    return Math.round(dur * 2.5);
  }

  function wordCount(s) {
    return (s || '').trim() ? s.trim().split(/\s+/).length : 0;
  }

  function sceneNo(i) {
    return i + 1;
  }

  // what a scene's preview does in the generation
  // broken: the scene's own picture can't be read (must fix); refused: the
  // content check turned the preview down (a question, like out of date);
  // checking: a redraw timed out and its result isn't known yet
  function previewUse(s) {
    if (!state.planned) return 'none';
    if (s.userImage && s.imageBad) return 'broken';
    if (state.stale) return 'unused';
    if (!s.preview || s.preview.state === 'none') return 'none';
    if (s.preview.state === 'stale' || s.preview.state === 'refused') return 'unused';
    if (s.preview.state === 'drawing') return 'drawing';
    if (s.preview.state === 'checking') return 'checking';
    return 'used';
  }

  // decide: previews that aren't used and aren't accepted yet; lines: lines
  // Vicino placed, not yet kept; fix: scene pictures that can't be read
  function counts() {
    var used = 0,
      fromDesc = [],
      decide = [],
      lines = [],
      fix = [];
    state.scenes.forEach(function (s, i) {
      var u = previewUse(s);
      if (u === 'used') used++;
      else fromDesc.push(i);
      if (u === 'broken') fix.push(i);
      // while the look is out of date, updating the storyboard answers them all
      // with your own picture in use, Vicino's preview is set aside, not asked about
      else if (u === 'unused' && !state.stale && !state.decided[s.id] && !(s.userImage && !s.imageBad))
        decide.push(i);
      if (s.line && s.lineBy && !state.decided['line-' + s.id] && state.brief.voice !== 'silent')
        lines.push(i);
    });
    return {
      used: used,
      fromDesc: fromDesc,
      decide: decide,
      lines: lines,
      fix: fix,
      asks: decide.length + lines.length,
      total: state.scenes.length,
    };
  }

  function voiceName() {
    var v = state.brief.voice;
    return v === 'talking'
      ? 'Talking'
      : v === 'voiceover'
        ? 'Voiceover'
        : v === 'silent'
          ? 'Silent'
          : 'Let Vicino decide';
  }

  function linesCount() {
    return state.scenes.filter(function (s) {
      return s.line;
    }).length;
  }

  function reasonLabel(s) {
    if (s.preview && s.preview.state === 'refused') return 'Refused by the content check';
    return (s.preview && s.preview.reason) || 'Words changed';
  }

  function isEditing() {
    return !!state.edit || state.unsaved;
  }

  // the todo list behind ③ and the confirm dialog
  function todos() {
    var list = [];
    if (state.stale) {
      list.push({
        kind: 'fix',
        id: 'stale',
        html: '<b>Storyboard out of date: the look changed.</b> No preview is in use until it is updated. Scenes whose words don’t change keep your edits.',
        acts: [
          { label: 'Update storyboard', act: 'update-storyboard', primary: true },
          { label: 'Restore the previous look', act: 'restore-look' },
        ],
      });
    }
    if (state.edit) {
      list.push({
        kind: 'fix',
        id: 'unsaved',
        html: '<b>Unsaved edits</b> block your approval until they are saved or cancelled.',
        acts: [],
      });
    }
    var c = counts();
    (state.ownAsset ? [] : c.fix).forEach(function (i) {
      var s = state.scenes[i];
      list.push({
        kind: 'fix',
        id: 'pic-' + s.id,
        short: 'Scene ' + sceneNo(i) + '\u2019s picture can\u2019t be read',
        why: 'Replace it or remove it. Approving can\u2019t skip this.',
        html:
          '<b>Scene ' +
          sceneNo(i) +
          '\u2019s picture can\u2019t be read</b> (' +
          esc(s.userImage) +
          '). Replace it or remove it; approving can\u2019t skip this.',
        acts: [{ label: 'Open scene', act: 'open-scene', arg: String(i), primary: true }],
      });
    });
    // while the look is out of date, updating the storyboard answers every scene at once
    (state.stale || state.ownAsset ? [] : c.lines).forEach(function (i) {
      var s = state.scenes[i];
      list.push({
        kind: 'decide',
        id: 'line-' + s.id,
        short: 'Vicino placed a line in Scene ' + sceneNo(i),
        why: 'Keep it there or move it on the storyboard.',
        html:
          '<b>Vicino placed a line in Scene ' +
          sceneNo(i) +
          '.</b> Keep it there or move it on the storyboard.',
        acts: [
          { label: 'Keep it here', act: 'line-keep', arg: String(i) },
          { label: 'Open storyboard', act: 'tab-storyboard' },
        ],
      });
    });
    (state.stale || state.ownAsset ? [] : c.decide).forEach(function (i) {
      var s = state.scenes[i];
      list.push({
        kind: 'decide',
        id: 'scene-' + s.id,
        html:
          '<b>Scene ' +
          sceneNo(i) +
          '’s preview isn’t used</b> (' +
          esc(reasonLabel(s).toLowerCase()) +
          '). Make the scene from its description' +
          (s.userImage ? ' and ' + esc(s.userImage) : '') +
          ', or regenerate the preview (credits).',
        acts: [
          { label: 'Draw it again', act: 'regen', arg: String(i), primary: true },
          { label: 'Use the words only', act: 'decide-desc', arg: s.id },
        ],
      });
    });
    if (state.planned && !state.ownAsset) {
      if (!state.product && state.decided.product) {
        list.push({
          kind: 'done',
          id: 'product-desc',
          html: 'Product drawn from its description',
          acts: [],
        });
      } else if (!state.product) {
        list.push({
          kind: 'decide',
          id: 'product',
          html: '<b>No product photo.</b> The boxed product is drawn from its description and may not match the real one.',
          acts: [{ label: 'Choose photo', act: 'choose-photo' }],
        });
      } else {
        list.push({
          kind: 'done',
          id: 'product-done',
          html: 'Product photo: <b>' + esc(state.product) + '</b>',
          acts: [{ label: 'Change', act: 'choose-photo' }],
        });
      }
    }
    // the prototype's To confirm switch: when nothing real is open, two
    // sample notices so the card's look can be judged
    var hasOpen = list.some(function (t) {
      return t.kind === 'fix' || t.kind === 'decide';
    });
    if (state.showTodo && !hasOpen) {
      if (!state.samplesDone.cta)
        list.push({
          kind: 'fix',
          id: 'sample-cta',
          short: 'The call to action runs long',
          why: 'X cuts the caption after its first line, so the ask may not be seen.',
          html: '<b>Call to action runs long.</b> On X it is cut after the caption’s first line, so the ask may not be seen.',
          acts: [{ label: 'Shorten it', act: 'sample-done', arg: 'cta', primary: true }],
        });
      if (!state.samplesDone.logo)
        list.push({
          kind: 'decide',
          id: 'sample-logo',
          short: 'The logo reference has no role yet',
          why: 'Say whether it is the product or a mark to keep out of the shots.',
          html: '<b>The logo reference has no role yet.</b> Say whether it is the product or only a mark to keep out of the shots.',
          acts: [{ label: 'Decide', act: 'sample-done', arg: 'logo' }],
        });
    }
    list.push({
      kind: 'note',
      id: 'notes',
      html: '<b>2 notes about references</b> — no photo of the person on camera; Verified Catalog instructions missing. Nothing blocks.',
      acts: [{ label: 'Show', act: 'open-notes' }],
    });
    list.push({
      kind: 'done',
      id: 'time',
      html: 'Posting window: <b>' + esc(state.when) + '</b>',
      acts: [],
    });
    return list;
  }

  // ------------------------------------------------------------------ mount
  var root = document.createElement('div');
  root.id = 'cd-root';
  document.body.appendChild(root);
  var sw = document.createElement('div');
  sw.className = 'cd-sw pulse-ds';
  document.body.appendChild(sw);

  function render() {
    var scrollTop = 0;
    var body = root.querySelector('.cd-body');
    if (body) scrollTop = body.scrollTop;
    var paneBody = root.querySelector('.cd-pane__body');
    var paneScroll = paneBody ? paneBody.scrollTop : 0;
    // the two picture cards trade places: note where each was (round 137)
    var swapFrom = null;
    if (state.swapAnim) {
      swapFrom = {};
      root.querySelectorAll('[data-swap]').forEach(function (e) {
        swapFrom[e.dataset.swap] = e.getBoundingClientRect().top;
      });
    }

    if (!state.open) {
      // the Calendar page is what is left behind a closed drawer (round 147)
      root.innerHTML = '';
      renderSwitcher();
      return;
    }

    root.innerHTML =
      '<div class="pulse-ds cd post-drawer' +
      (state.entered ? ' is-settled' : '') +
      '" data-primary="' +
      state.primary +
      '" data-surface="' +
      state.surface +
      '" data-chrome="' +
      state.chrome +
      '">' +
      '<div class="post-drawer__scrim" data-act="close-drawer"></div>' +
      '<div class="post-drawer__panel" role="dialog" aria-label="Post detail — ' +
      esc(state.post.title) +
      '">' +
      '<div class="cd-top">' +
      renderHead() +
      renderPath() +
      '</div>' +
      '<div class="cd-body">' +
      (state.scene !== null ? renderScenePage() : missedNotice() + renderTab()) +
      '</div>' +
      renderFoot() +
      (state.toast ? renderToast() : '') +
      '</div>' +
      (state.pop ? renderPop() : '') +
      (state.vchat ? renderVchat() : '') +
      // dialogs sit over the whole page, outside the drawer's panel
      (state.modal ? renderModal() : '') +
      '</div>';

    body = root.querySelector('.cd-body');
    if (body && state.scene === null) body.scrollTop = state.scrollReset ? 0 : scrollTop;
    if (body) body.classList.toggle('is-scrolled', body.scrollTop > 2);
    state.scrollReset = false;
    paneBody = root.querySelector('.cd-pane__body');
    if (paneBody) paneBody.scrollTop = paneScroll;
    renderSwitcher();
    if (swapFrom) swapCards(swapFrom);
    state.swapAnim = false;
    afterRender();
    state.entered = true;
  }

  // ------------------------------------------------------------------- head
  function renderHead() {
    var st = stage();
    var status =
      state.gen === 'running'
        ? '<span class="cd-state cd-state--live">Producing</span>'
        : state.gen === 'stopped'
          ? '<span class="cd-state">' + (state.failed ? 'Failed' : 'Stopped') + '</span>'
          : st === 'review'
            ? '<span class="cd-state cd-state--live">Needs content approval</span>'
            : st === 'scheduled'
              ? '<span class="cd-state cd-state--ok">' +
                (state.published ? 'Published' : 'Scheduled') +
                '</span>'
              : state.drawing
                ? '<span class="cd-state cd-state--draft">Draft</span>'
                : '<span class="cd-state cd-state--draft">Draft</span>';
    return (
      '<div class="cd-head">' +
      '<div class="cd-head__id"><div class="cd-head__titlerow"><h2 class="cd-head__title">' +
      esc(state.post.title) +
      '</h2>' +
      status +
      '</div>' +
      '<div class="cd-head__meta">' +
      '<span class="cd-head__facts"><span class="cd-head__ch"><span class="cd-chan" title="X" aria-label="X">' +
      ic('x', 10) +
      '</span></span><i></i><span>' +
      esc(state.post.format) +
      '</span><i></i><span>' +
      esc(state.when) +
      '</span></span>' +
      '<span class="cd-head__tags">' +
      tagChips() +
      '</span>' +
      '</div></div>' +
      '<div class="cd-head__acts">' +
      // a published post is out: archiving wouldn't take it back
      (state.published
        ? ''
        : '<button type="button" class="cd-ibtn" title="Archive this post" aria-label="Archive this post" data-act="archive-post">' +
          ic('archive', 16) +
          '</button>') +
      '<button type="button" class="cd-ibtn" title="Close" aria-label="Close post detail" data-act="close-drawer">' +
      ic('close', 16) +
      '</button>' +
      '</div></div>'
    );
  }

  // a post's tags: the dot and name, Remove on hover, then Add
  function tagChips() {
    return (
      state.tags
        .map(function (t) {
          return (
            '<span class="cd-htag"><svg class="cd-htag__mark" width="11" height="11" viewBox="0 0 24 24" fill="' +
            esc(t.c) +
            '" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42zM7.5 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>' +
            esc(t.name) +
            '<button type="button" class="cd-htag__x" data-act="tag-remove" data-arg="' +
            esc(t.id) +
            '" title="Remove this tag" aria-label="Remove ' +
            esc(t.name) +
            '">' +
            ic('close', 9) +
            '</button></span>'
          );
        })
        .join('') +
      '<button type="button" class="cd-htag cd-htag--add" data-act="tag-add" title="Add a tag" aria-label="Add a tag">' +
      ic('plus', 10) +
      (state.tags.length ? '' : 'Tag') +
      '</button>'
    );
  }

  function tagNames() {
    return state.tags
      .map(function (t) {
        return t.name;
      })
      .join(' · ');
  }

  // ------------------------------------------------------------------- path
  function nextStep() {
    var st = stage();
    if (state.gen === 'running') return { title: '', say: '' };
    if (state.gen === 'stopped')
      return { title: 'Generate again', say: 'Starts from the beginning. Uses credits.' };
    if (st === 'review')
      return { title: 'Approve & schedule', say: 'Content approval sends it to its channel.' };
    if (st === 'scheduled') return { title: '', say: '' };
    if (isEditing())
      return { title: 'Save or cancel your edits', say: 'Nothing else moves until then.' };
    if (!isVideo()) return { title: 'Approve & generate', say: 'Uses credits.' };
    if (!state.planned)
      return {
        title: 'Plan the storyboard',
        say: 'Vicino lays out the scenes from the plan. Uses credits.',
      };
    if (state.stale)
      return {
        title: 'Update the storyboard',
        say: 'The look changed. No preview is in use until it is updated.',
        warn: true,
      };
    var c = counts();
    if (state.tab === 'brief')
      return {
        title: 'Review the storyboard',
        say:
          c.used +
          ' of ' +
          c.total +
          ' scenes start from their preview' +
          (c.fromDesc.length
            ? ' · Scene ' + c.fromDesc.map(sceneNo).join(', ') + ' from description'
            : '') +
          ' · Voice ' +
          voiceName() +
          '.',
      };
    return {
      title: 'Approve & generate',
      say: c.fix.length
        ? 'Fix the scene picture first. Approval is off until then.'
        : c.asks
          ? c.asks + ' question' + (c.asks > 1 ? 's' : '') + ' to answer first. Uses credits.'
          : 'Everything on the list is settled. Uses credits.',
    };
  }

  // ------------------------------------------------------------- step bar
  // Three drawings of Brief → Storyboard → Review (switcher row "Step bar",
  // ?sb=): Track (a segmented control), Rail (dots on a line that fills),
  // Cards (one small card per step with its status). All read stepModel().
  //   progress: done | now | warn | live | later — where the post is
  //   active:   the tab being looked at (separate from progress)
  function stepModel() {
    var st = stage();
    var after = st !== 'brief';
    var c = counts();
    var list = [];
    var briefDone = after || (isVideo() && state.planned && !state.stale && !state.edit);
    list.push({
      key: 'brief',
      label: 'Brief',
      progress: briefDone ? 'done' : 'now',
      sub: after
        ? 'Approved'
        : briefDone
          ? 'Checked'
          : state.edit
            ? 'Editing'
            : 'Check what it says',
    });
    if (isVideo()) {
      var sp, ss;
      if (after) {
        sp = 'done';
        ss = 'Locked with the approved brief';
      } else if (state.ownAsset) {
        sp = 'done';
        ss = 'Used as it is';
      } else if (state.planning) {
        sp = 'live';
        ss = 'Planning\u2026';
      } else if (!state.planned) {
        sp = 'later';
        ss = 'Not planned yet';
      } else if (state.drawing) {
        sp = 'live';
        ss = 'Drawing previews ' + drawnCount() + '/' + state.scenes.length;
      } else if (state.stale) {
        sp = 'warn';
        ss = 'Out of date';
      } else {
        sp = 'now';
        ss = c.fix.length
          ? c.fix.length + ' to fix'
          : c.asks
            ? c.asks + ' to decide'
            : 'Ready to approve';
      }
      list.push({
        key: 'storyboard',
        // your own video needs no storyboard, so the step names what it holds
        label: state.ownAsset ? 'Your video' : 'Storyboard',
        progress: sp,
        sub: ss,
        locked: !state.planned && !state.ownAsset,
      });
    }
    var rp, rs, rl;
    if (state.gen === 'running') {
      rp = 'live';
      rl = 'Generating';
      rs = '<span data-gen-pct-text>' + Math.round(state.genPct) + '%</span> made';
    } else if (state.gen === 'stopped') {
      rp = 'warn';
      rl = state.failed ? 'Failed' : 'Stopped';
      rs = rl + ' at ' + Math.round(state.genPct) + '%';
    } else if (st === 'review') {
      rp = 'now';
      rl = 'Review';
      rs = 'Needs your approval';
    } else if (st === 'scheduled') {
      rp = 'done';
      rl = state.published ? 'Published' : 'Scheduled';
      rs = esc(state.when);
    } else {
      rp = 'later';
      rl = 'Review';
      rs = 'After approval';
    }
    list.push({ key: 'result', label: rl, progress: rp, sub: rs, locked: !after });
    list.forEach(function (x, i) {
      x.no = i + 1;
      x.active = state.tab === x.key && state.scene === null;
      if (x.key === 'storyboard' && state.scene !== null) x.active = true;
    });
    return list;
  }

  function stepMark(x) {
    if (x.progress === 'done') return ic('check', 10);
    if (x.progress === 'live') return '<i class="cd-path__spin"></i>';
    if (x.progress === 'warn') return '!';
    return String(x.no);
  }

  // a step is a tab: progress on its mark, status in its tooltip
  function stepBtn(x, cls, inner) {
    var tip = x.locked
      ? x.key === 'result'
        ? 'The result appears here once it is generated'
        : 'Plan the storyboard first'
      : x.label + ' — ' + x.sub.replace(/<[^>]+>/g, '');
    return (
      '<button type="button" class="' +
      cls +
      ' is-' +
      x.progress +
      (x.active ? ' is-active' : '') +
      (x.locked ? ' is-locked' : '') +
      '" data-act="tab" data-tab="' +
      x.key +
      '" role="tab" aria-selected="' +
      x.active +
      '" title="' +
      esc(tip) +
      '">' +
      inner +
      '</button>'
    );
  }

  function contextTab(cls) {
    return (
      '<button type="button" class="' +
      cls +
      ' cd-steps__ctx' +
      (state.tab === 'context' ? ' is-active' : '') +
      '" data-act="tab" data-tab="context" role="tab" aria-selected="' +
      (state.tab === 'context') +
      '">' +
      ic('layers', 12) +
      'Context</button>'
    );
  }

  // the glyph before a name: a cyan check when done, else the number, quietly
  function stepGlyph(x) {
    if (x.progress === 'done') return '<span class="cd-sg is-done">' + ic('check', 11) + '</span>';
    if (x.progress === 'live') return '<span class="cd-sg is-live"><i class="cd-path__spin"></i></span>';
    if (x.progress === 'warn') return '<span class="cd-sg is-warn">!</span>';
    return '<span class="cd-sg">' + x.no + '</span>';
  }

  // A · Tabs (round 17): text tabs, as in side-chats. The step you are on is
  // ink and semibold; a done step has a cyan check; small chevrons show the way.
  function stepsTabs(list) {
    return (
      '<div class="cd-steps cd-steps--tabs" role="tablist">' +
      list
        .map(function (x, i) {
          return (
            (i ? '<span class="cd-tabs__sep" aria-hidden="true">' + ic('chevR', 11) + '</span>' : '') +
            stepBtn(x, 'cd-tabs__tab', stepGlyph(x) + '<span class="cd-tabs__name">' + x.label + '</span>')
          );
        })
        .join('') +
      contextTab('cd-tabs__tab') +
      '</div>'
    );
  }

  // B · Glass (round 21): one frosted track; the step you are on is lifted out
  // of it in white. Each name carries its number, coloured by where the post
  // is: cyan when done, ink for the step to act on, faint for later.
  function stepsGlass(list) {
    return (
      '<div class="cd-steps cd-steps--glass" role="tablist"><span class="cd-glass__track">' +
      list
        .map(function (x) {
          return stepBtn(
            x,
            'cd-glass__seg',
            '<span class="cd-gno">' + x.no + '</span><span class="cd-glass__name">' + x.label + '</span>'
          );
        })
        .join('') +
      '</span>' +
      contextTab('cd-glass__ctx') +
      '</div>'
    );
  }

  // C · Pager: only the step you are on is named, large enough to read at a
  // glance; a row of small marks beside it shows all three, the current one
  // drawn long. Each mark is a tab, and the neighbours are named on hover.
  function stepsPager(list) {
    var cur =
      list.filter(function (x) {
        return x.active;
      })[0] || list[0];
    var at = list.indexOf(cur) + 1;
    return (
      '<div class="cd-steps cd-steps--pager" role="tablist">' +
      '<span class="cd-pager__marks">' +
      list
        .map(function (x) {
          return stepBtn(x, 'cd-pager__mark', '<span class="cd-pager__lab">' + x.label + '</span>');
        })
        .join('') +
      '</span>' +
      '<span class="cd-pager__now"><b>' +
      cur.label +
      '</b><span>Step ' +
      at +
      ' of ' +
      list.length +
      ' · ' +
      cur.sub.replace(/<[^>]+>/g, '') +
      '</span></span>' +
      contextTab('cd-glass__ctx') +
      '</div>'
    );
  }

  function renderPath() {
    var list = stepModel();
    if (state.stepbar === 'glass') return stepsGlass(list);
    if (state.stepbar === 'pager') return stepsPager(list);
    return stepsTabs(list);
  }

  // ----------------------------------------------------------------- tabs
  // in the confirm bar's shape: a post past its time, and what to do about it
  function missedNotice() {
    if (!missedTime() || state.failed) return '';
    return (
      '<div class="cdb-cbar cd-missed" role="status"><div class="cdb-cbar__sum"><span class="cdb-cbar__ico">' +
      ic('warn', 12) +
      '</span><b>Missed its time</b><span class="cdb-cbar__list">Planned for ' +
      esc(state.when) +
      '. Nothing went out.</span><span class="cd-missed__acts">' +
      '<button type="button" class="cd-missed__act" data-act="retime">New time</button>' +
      '<button type="button" class="cd-missed__act" data-act="missed-pick">Let Vicino pick</button>' +
      '<button type="button" class="cd-missed__act is-quiet" data-act="archive-post">Archive</button>' +
      '</span></div></div>'
    );
  }

  function renderTab() {
    if (state.tab === 'result')
      return '<div class="cd-view cd-view--result">' + renderResult() + '</div>';
    if (state.tab === 'storyboard' && !isVideo()) state.tab = 'brief';
    if (state.tab === 'storyboard')
      return '<div class="cd-view cd-view--sb">' + renderStoryboard() + '</div>';
    if (state.tab === 'context')
      return '<div class="cd-view cd-view--ctx">' + renderContext() + '</div>';
    return '<div class="cd-view cd-view--brief">' + renderBrief() + '</div>';
  }

  // ---------------------------------------------------------------- brief
  // Three layouts for the Brief tab (switcher row "Brief layout", ?b=):
  //   post  - the brief beside a mock of the post it is for
  //   paper - the brief written on a ruled sheet, the rest as slips beside it
  //   clean - no mock: one statement, four facts, everything else folded
  // All three read the same data and share the edit forms below.
  function qbtn(label, act, extra, icon) {
    if (locked() && /^(edit-|rewrite-open|sb-rewrite|ref-)/.test(act)) return '';
    return (
      '<button type="button" class="cd-qbtn' +
      (extra || '') +
      '" data-act="' +
      act +
      '">' +
      (icon ? ic(icon, 12) : '') +
      esc(label) +
      '</button>'
    );
  }

  function renderBrief() {
    var l = state.layout;
    if (l === 'paper') return renderBriefPaper();
    if (l === 'clean') return renderBriefClean();
    if (l === 'split') return renderBriefSplit();
    return renderBriefPost();
  }

  function firstLine() {
    for (var i = 0; i < state.scenes.length; i++)
      if (state.scenes[i].line) return { line: state.scenes[i].line, i: i };
    return null;
  }

  function sceneLink(i, label) {
    if (!state.planned || !isVideo()) return '';
    return (
      '<button type="button" class="cdb-jump" data-act="open-scene" data-arg="' +
      i +
      '">' +
      esc(label || 'Scene ' + sceneNo(i)) +
      ic('arrowR', 10) +
      '</button>'
    );
  }

  // the brief's own facts, in reading order
  function briefFacts() {
    var b = state.brief;
    var fl = firstLine();
    var list = [
      { k: 'speaks', label: 'Target audience', html: esc(b.audience) },
      {
        k: 'proof',
        label: 'Proof points',
        html:
          '<span class="cdb-proofs">' +
          (b.proofs || [])
            .map(function (x) {
              return '<span>' + esc(x) + '</span>';
            })
            .join('') +
          '</span>',
      },
      { k: 'cta', label: 'Call to action', html: esc(b.cta) },
      { k: 'tone', label: 'Tone', html: esc(b.tone) },
    ];
    if (state.format === 'text')
      list.push({ k: 'opens', label: 'Opening line', html: '\u201c' + esc(b.hook) + '.\u201d' });
    else
      list.push({
        k: 'opens',
        label: isVideo() ? 'Opening scene' : 'First image',
        html:
          esc(b.hook) +
          '.' +
          (isVideo()
            ? sceneLink(0, 'Scene 1 \u00b7 0:00')
            : '<span class="cdb-where">Slide 1</span>'),
      });
    if (fl && state.brief.voice !== 'silent')
      list.push({
        k: 'line',
        label: 'First spoken line',
        html:
          '\u201c' +
          esc(fl.line) +
          '\u201d' +
          sceneLink(fl.i, 'Scene ' + sceneNo(fl.i) + ' \u00b7 ' + fmtTime(sceneStart(fl.i))),
      });
    return list;
  }

  // the three or four facts a layout shows up front; the rest lives in Brief details
  var FACT_ICON = { speaks: 'user', proof: 'badge', cta: 'target', tone: 'wave', opens: 'film' };

  // a plain explanation for the labels that need one, opened from a small (i)
  function factHelpText(k) {
    if (k === 'plan')
      return [
        'The video plan',
        'The plan for the video Vicino will make for this post: the idea in one line, then each scene in the order it plays. Planning the storyboard turns it into scenes with lengths and previews, and generating makes the video from those.',
      ];
    if (k === 'sp-what')
      return [
        'What happens in the scene',
        'Describe what we see in this scene: who is in it, what they do, and where. Vicino draws the preview and makes this part of the video from it. Viewers never read these words; what people hear is the spoken line below.',
      ];
    if (k === 'sb-used')
      return [
        'Previews in use',
        'A preview is a picture Vicino draws to show how a scene will look.<br><br><b>In use:</b> the preview still matches the scene. When the video is made, that scene starts from this picture, so it comes out looking like it.<br><br><span class="sb2-tag is-decide is-inline"><i></i>Out of date · words changed</span> the scene changed after its preview was drawn (its words, the look, the voice, who speaks, or its picture), so the preview still shows the old version. The video won’t use it: it makes that scene from its new words alone, so it may look different from the picture. On the storyboard these frames are faded and carry this label, with what changed after the dot.<br><br>More previews in use means fewer surprises in the video. Nothing breaks when one is out of date, and drawing it again uses credits.',
      ];
    if (k === 'sb-version')
      return [
        'Version',
        'Every saved change makes a new version. Approval is for one version: if anything changes after you approve, it needs approving again.',
      ];
    if (k === 'sb-mode')
      return [
        'How previews are made',
        'The same choice as on the Brief. Automatically: whenever Vicino plans the scenes, it draws a preview picture of each one, which uses credits. When I ask: the scenes show their words until you ask for a preview. Changing a scene yourself never draws one.',
      ];
    if (k === 'proof')
      return [
        'Proof points',
        'The facts that back up the main message. The post shows or says them so the message is believable. Keep each one short and true.',
      ];
    if (k === 'opens') {
      if (isVideo())
        return [
          'Opening scene',
          'What people see in the first second or two. It decides whether they stop scrolling, so it should show the problem straight away. It becomes Scene 1 of the storyboard.',
        ];
      if (state.format === 'carousel')
        return [
          'First image',
          'The first slide people see in their feed. It decides whether they swipe on, so it should show the subject straight away.',
        ];
      return [
        'Opening line',
        'The first line people read. On X it is often all they see before deciding to read on, so it carries the hook.',
      ];
    }
    return null;
  }

  function factHelp(k) {
    var h = factHelpText(k);
    if (!h) return '';
    var open = state.factHelp === k;
    return (
      '<button type="button" class="cdb-help' +
      (open ? ' is-open' : '') +
      '" data-act="fact-help" data-arg="' +
      k +
      '" aria-expanded="' +
      open +
      '" aria-label="What is ' +
      h[0].toLowerCase() +
      '?">' +
      ic('info', 11) +
      '</button>' +
      (open
        ? '<span class="cdb-helppop" role="dialog" aria-label="' +
          h[0] +
          '"><span class="cd-tip__ico">' +
          ic('info', 12) +
          '</span><span class="cd-tip__txt"><b>' +
          h[0] +
          '</b><span>' +
          h[1] +
          '</span></span></span>'
        : '')
    );
  }

  function keyFacts(withTone) {
    var fl = firstLine();
    return briefFacts()
      .filter(function (f) {
        return f.k !== 'line' && (withTone || f.k !== 'tone');
      })
      .map(function (f) {
        var icon = FACT_ICON[f.k];
        if (f.k === 'opens')
          icon = isVideo() ? 'film' : state.format === 'carousel' ? 'image' : 'text';
        var quote =
          f.k === 'opens' && fl && state.brief.voice !== 'silent'
            ? '<span class="cdb-quote">' +
              ic('quote', 10) +
              '\u201c' +
              esc(fl.line) +
              '\u201d</span>'
            : '';
        var help = factHelp(f.k);
        return {
          k: f.k,
          label: help ? '<span class="cdb-hl">' + f.label + help + '</span>' : f.label,
          html: f.html,
          icon: icon,
          quote: quote,
        };
      });
  }

  function factIcon(f) {
    return '<span class="cdb-fico cdb-fico--' + f.k + '">' + ic(f.icon, 13) + '</span>';
  }

  function todoShort(t) {
    if (t.id === 'stale') return 'Storyboard out of date — the look changed';
    if (t.id === 'unsaved') return 'Unsaved edits';
    if (t.id.indexOf('scene-') === 0) {
      var i = state.scenes.findIndex(function (s) {
        return 'scene-' + s.id === t.id;
      });
      return 'Scene ' + sceneNo(i) + '’s preview isn’t used';
    }
    if (t.id === 'product') return 'No product photo';
    if (t.id === 'product-done') return 'Product photo set';
    if (t.id === 'product-desc') return 'Product drawn from its description';
    if (t.id === 'notes') return '2 reference details are missing';
    if (t.id === 'time') return 'Posting window ' + state.when;
    return t.short || '';
  }

  function openTodos() {
    return todos().filter(function (t) {
      return t.kind === 'fix' || t.kind === 'decide';
    });
  }

  function compactTodos(withNotes) {
    var list = todos().filter(function (t) {
      return t.kind === 'fix' || t.kind === 'decide' || (withNotes && t.kind === 'note');
    });
    if (!list.length) return '<p class="cdb-none">' + ic('check', 12) + 'Nothing to confirm</p>';
    return (
      '<ul class="cdb-todos">' +
      list
        .map(function (t) {
          var a = t.acts[0];
          return (
            '<li class="cdb-todo cdb-todo--' +
            t.kind +
            '"><i class="cdb-todo__dot"></i><span class="cdb-todo__say">' +
            esc(todoShort(t)) +
            '</span>' +
            (a
              ? '<button type="button" class="cdb-todo__act" data-act="' +
                a.act +
                '"' +
                (a.arg != null ? ' data-arg="' + a.arg + '"' : '') +
                '>' +
                esc(a.label) +
                '</button>'
              : '') +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  // C's confirm bar: one slim line near the top of the brief that stays in
  // view as you scroll; it opens into the list, and speaks for the whole post
  function confirmBar(sb) {
    var open = openTodos();
    if (sb && !state.showTodo) return '';
    if (sb && !open.length) return notesBar();
    if ((!state.showTodo && !sb) || !open.length || state.edit === 'who') return '';
    var on = !!state.todoOpen;
    // the bar sits in a band that pins to the top as you scroll; pinned, the
    // band frosts what passes under it (round 58)
    return (
      '<div class="cdb-cbarwrap"><div class="cdb-cbar' +
      (on ? ' is-open' : '') +
      '"><button type="button" class="cdb-cbar__sum" data-act="toggle-todo" aria-expanded="' +
      on +
      '"><span class="cdb-cbar__ico">' +
      ic('warn', 12) +
      '</span><b>' +
      open.length +
      (open.length === 1 ? ' thing' : ' things') +
      ' to confirm for this post</b><span class="cdb-cbar__list">' +
      open
        .map(function (t) {
          return esc(todoShort(t));
        })
        .join(' \u00b7 ') +
      '</span><span class="cdb-cbar__go">' +
      (on ? 'Hide' : 'Review') +
      ic(on ? 'chevU' : 'chevD', 11) +
      '</span></button>' +
      (on ? '<div class="cdb-cbar__panel">' + todoList(false) + '</div>' : '') +
      '</div></div>'
    );
  }

  // the storyboard's bar when nothing needs you: the notes on references, in
  // the confirm bar's shape and a calm grey
  function notesBar() {
    var notes = todos().filter(function (t) {
      return t.kind === 'note';
    });
    if (!notes.length) return '';
    var on = !!state.todoOpen;
    return (
      '<div class="cdb-cbarwrap"><div class="cdb-cbar is-calm' +
      (on ? ' is-open' : '') +
      '"><button type="button" class="cdb-cbar__sum" data-act="toggle-todo" aria-expanded="' +
      on +
      '"><span class="cdb-cbar__ico">' +
      ic('info', 12) +
      '</span><b>Nothing to confirm</b><span class="cdb-cbar__list">' +
      notes
        .map(function (t) {
          return esc(todoShort(t));
        })
        .join(' \u00b7 ') +
      ' \u00b7 nothing blocks</span><span class="cdb-cbar__go">' +
      (on ? 'Hide' : 'See') +
      ic(on ? 'chevU' : 'chevD', 11) +
      '</span></button>' +
      (on ? '<div class="cdb-cbar__panel">' + todoList(false) + '</div>' : '') +
      '</div></div>'
    );
  }

  // inert: plain tiles, for use inside another button
  function thumbs(max, inert) {
    if (state.format === 'text')
      return (
        '<span class="cdb-thumbs"><span class="cdb-thumb cdb-thumb--text">' +
        ic('text', 13) +
        '</span></span>'
      );
    if (state.format === 'carousel')
      return (
        '<span class="cdb-thumbs">' +
        state.slides
          .map(function (x, i) {
            return '<span class="cdb-thumb cdb-thumb--slide"><i>' + (i + 1) + '</i></span>';
          })
          .join('') +
        '</span>'
      );
    return (
      '<span class="cdb-thumbs">' +
      state.scenes
        .slice(0, max || 6)
        .map(function (s, i) {
          var u = previewUse(s);
          var cls =
            'cdb-thumb' +
            (u === 'unused' ? ' is-stale' : '') +
            (u === 'drawing' ? ' is-drawing' : '');
          var inner =
            s.img && state.planned
              ? '<img src="' + s.img + '" alt="">'
              : '<i>' + sceneNo(i) + '</i>';
          if (inert) return '<span class="' + cls + '">' + inner + '</span>';
          return (
            '<button type="button" class="' +
            cls +
            '" data-act="open-scene" data-arg="' +
            i +
            '" aria-label="Scene ' +
            sceneNo(i) +
            '">' +
            inner +
            '</button>'
          );
        })
        .join('') +
      '</span>'
    );
  }

  function planHead() {
    return isVideo() ? 'Storyboard' : state.format === 'carousel' ? 'Slides' : 'The post';
  }

  function drawnCount() {
    return state.scenes.filter(function (s) {
      return s.preview && s.preview.state === 'ready';
    }).length;
  }

  function planLine() {
    if (state.format === 'carousel')
      return state.slides.length + ' slides \u00b7 images drawn at generation';
    if (state.format === 'text') return 'One post \u00b7 under 280 characters';
    var c = counts();
    if (!state.planned) return state.scenes.length + ' scenes written \u00b7 not planned yet';
    if (state.drawing)
      return (
        state.scenes.length +
        ' scenes \u00b7 ' +
        totalDur() +
        's \u00b7 <em class="is-live">drawing previews ' +
        drawnCount() +
        ' of ' +
        state.scenes.length +
        '</em>'
      );
    if (state.stale)
      return state.scenes.length + ' scenes \u00b7 ' + totalDur() + 's \u00b7 <em>out of date</em>';
    return (
      state.scenes.length +
      ' scenes \u00b7 ' +
      totalDur() +
      's \u00b7 ' +
      c.used +
      ' of ' +
      c.total +
      ' from a preview'
    );
  }

  function planSub() {
    var b = state.brief;
    if (isVideo()) return 'Voice ' + esc(voiceName()) + ' \u00b7 ' + esc(b.look.split(/[,.]/)[0]);
    if (state.format === 'carousel') return esc(b.look.split(/[,.]/)[0]);
    return esc(b.plan);
  }

  function purpose() {
    var say;
    var next = isVideo() ? 'review the storyboard next.' : 'approve and generate.';
    if (locked())
      return (
        '<p class="cdb-purpose cdb-purpose--locked"><span class="cdb-purpose__step">' +
        ic('check', 10) +
        'Approved</span><b>' +
        (stage() === 'generating'
          ? 'The brief is being made into the post.'
          : stage() === 'scheduled'
            ? 'The brief is approved and the post is scheduled.'
            : 'The brief was made into the post.') +
        '</b> <span>The brief is read-only now.</span><button type="button" class="cdb-jump" data-act="reopen-edit">Reopen for edit' +
        ic('arrowR', 10) +
        '</button></p>'
      );
    if (isEditing()) say = ['Editing the brief.', 'Save or cancel to move on.'];
    else if (state.ownAsset && state.format !== 'text')
      say = [
        'Check what this post says.',
        'Your own ' + ownWord() + ' is used as it is; approve when the words are right.',
      ];
    else if (isVideo() && !state.planned)
      say = ['Check what this post says.', 'If it reads right, plan the storyboard next.'];
    else if (isVideo() && state.stale)
      say = [
        'The look changed.',
        'Update the storyboard next \u2014 no preview is in use until then.',
      ];
    else if (state.drawing)
      say = [
        'The storyboard is being drawn.',
        'Read the brief meanwhile \u2014 previews land in about a minute.',
      ];
    else say = ['Check what this post says.', 'If it reads right, ' + next];
    return '<p class="cdb-purpose"><b>' + say[0] + '</b> <span>' + say[1] + '</span></p>';
  }

  function rewriteBox() {
    if (!state.rewrite) return '';
    return (
      '<div class="cd-rewrite cdb-rewrite"><span class="cd-lab">' +
      ic('wand', 12) +
      ' Rewrite with Vicino</span>' +
      '<textarea class="cd-ta" rows="2" data-draft="rewrite" placeholder="e.g. Make the boxed product the hero of scene 3 and warm up scene 2.">' +
      esc(state.draft.rewrite || '') +
      '</textarea>' +
      '<div class="cd-rewrite__foot">' +
      '<button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="rewrite-go">' +
      (state.planned ? 'Update storyboard' : 'Rewrite the plan') +
      '</button>' +
      '<button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="rewrite-close">Cancel</button>' +
      '<span>' +
      (state.planned
        ? 'Replans the scenes. Uses credits. Nothing is replaced until you review the result.'
        : 'Rewrites the plan. Uses credits. Nothing is planned yet, so nothing else changes.') +
      '</span></div></div>'
    );
  }

  function editing() {
    if (state.edit === 'who') return renderWhoCard();
    if (state.edit === 'plan') return renderPlanCard();
    return '';
  }

  function factsDl(cls) {
    return (
      '<dl class="' +
      cls +
      '">' +
      briefFacts()
        .map(function (f) {
          return (
            '<div class="' +
            cls +
            '__row" data-k="' +
            f.k +
            '"><dt>' +
            f.label +
            '</dt><dd>' +
            f.html +
            '</dd></div>'
          );
        })
        .join('') +
      '</dl>'
    );
  }

  function lookVoice() {
    var b = state.brief;
    return (
      '<dl class="cdb-lv">' +
      (b.look ? '<div><dt>Look</dt><dd>' + esc(b.look) + '</dd></div>' : '') +
      (isVideo()
        ? '<div><dt>Voice</dt><dd>' +
          esc(voiceName()) +
          (b.voice === fmtSrc().brief.voice ? ' \u00b7 picked by Vicino' : '') +
          '</dd></div>'
        : '') +
      '</dl>'
    );
  }

  // ======================================================== round 14 · Brief
  // Shared pieces every layout draws in its own shell: the three facts, the
  // Look-tone-voice fold, the Full brief text link, the edit forms, and the
  // Storyboard and To confirm cards in each of their states.

  // the rest of the brief opens inside the card, under the facts
  function fullBriefLink() {
    return (
      '<button type="button" class="cdb-fulllink" data-act="full-brief" aria-expanded="' +
      !!state.moreBrief +
      '">' +
      ic('doc', 12) +
      (state.moreBrief ? 'Fewer brief details' : 'More brief details') +
      ic(state.moreBrief ? 'chevU' : 'chevD', 11) +
      '</button>'
    );
  }

  // what the card doesn't already show, each under a plain title
  function moreBriefList() {
    var b = state.brief;
    var list = [];
    list.push(['Tags', '<p>' + (state.tags.length ? esc(tagNames()) : 'No tags yet.') + '</p>']);
    list.push([
      'Channel and timing',
      '<p>On X, as ' +
        (isVideo()
          ? 'a vertical video of about ' + totalDur() + ' seconds'
          : state.format === 'carousel'
            ? 'a carousel of ' + state.slides.length + ' images'
            : 'a text post of under 280 characters') +
        (whenParts() ? '. Planned for ' + esc(state.when) + ', New York time.</p>' : '. No date yet.</p>'),
    ]);
    var beats = (b.story || '')
      .split('\n')
      .map(function (l) {
        var m = l.match(/^([^:]+):\s*(.*)$/);
        return m ? { k: m[1].trim(), v: m[2].trim() } : null;
      })
      .filter(function (x) {
        return x && !/^(cta|hook)$/i.test(x.k);
      });
    if (beats.length)
      list.push([
        'Story',
        '<ol class="cdb-full__beats">' +
          beats
            .map(function (x) {
              var v = esc(x.v);
              if (/^caption$/i.test(x.k)) v = 'The caption reads: \u201c' + v + '\u201d';
              return '<li><b>' + esc(x.k) + '</b><span>' + v + '</span></li>';
            })
            .join('') +
          '</ol>',
      ]);
    list.push([
      'Guardrails',
      '<p>' +
        (b.guardrails
          ? b.guardrails
              .split(' \u00b7 ')
              .map(function (g) {
                return esc(g.trim());
              })
              .join(' ')
          : 'None set. Add one if something must never appear in this post.') +
        '</p>',
    ]);
    list.push([
      'Requirements',
      '<p>None yet. Scenes and on-screen words are set on the storyboard, not here.</p>',
    ]);
    return list;
  }

  // as label-and-value rows (A, C, D) or as ruled lines in the margin (B)
  function moreBrief(asLines) {
    if (!state.moreBrief) return '';
    var list = moreBriefList();
    if (asLines)
      return (
        '<dl class="cdb-lines cdb-lines--more">' +
        list
          .map(function (x) {
            return '<div class="cdb-line"><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>';
          })
          .join('') +
        '</dl>'
      );
    return (
      '<div class="cdb-more"><dl class="cdb-st">' +
      list
        .map(function (x) {
          return '<div class="cdb-st__row"><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>';
        })
        .join('') +
      '</dl></div>'
    );
  }

  // a form field with its label (and a plain hint) above the box
  function bfield(label, key, value, rows, hint) {
    return (
      '<label class="cdb-f"><span class="cdb-f__lab">' +
      esc(label) +
      (hint ? '<small>' + esc(hint) + '</small>' : '') +
      '</span><textarea class="cd-ta cdb-f__ta" rows="' +
      (rows || 2) +
      '" data-draft="' +
      key +
      '">' +
      esc(value == null ? '' : value) +
      '</textarea></label>'
    );
  }

  function editFoot(act) {
    // Save and Cancel live in the footer while editing (round 34)
    if (act) return '';
    return (
      '<div class="cdb-editfoot">' +
      '<button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="' +
      act +
      '">Save</button>' +
      '<button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="cancel-edit">Cancel</button>' +
      '<span>Saves to the brief · <b>Free</b></span></div>'
    );
  }

  // ---- edit in place (round 20): the read view stays, its values turn editable
  function ie(key, kind, ph) {
    var v = state.draft[key];
    return (
      '<textarea class="cd-ta cdb-ie cdb-ie--' +
      kind +
      '" rows="1" data-draft="' +
      key +
      '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : '') +
      '>' +
      esc(v == null ? '' : v) +
      '</textarea>'
    );
  }

  // proof points stay labels while edited: each is a small field, x removes it
  function proofEditor() {
    var d = state.draft;
    var n = d.proofN || 0;
    var html = '<span class="cdb-proofs cdb-pe">';
    for (var i = 0; i < n; i++)
      html +=
        '<span class="cdb-pe__chip"><input class="cdb-pe__in" data-draft="proof' +
        i +
        '" value="' +
        esc(d['proof' + i] || '') +
        '" placeholder="A proof point" aria-label="Proof point ' +
        (i + 1) +
        '"><button type="button" class="cdb-pe__x" data-act="proof-del" data-arg="' +
        i +
        '" aria-label="Remove this proof point">' +
        ic('close', 9) +
        '</button></span>';
    html +=
      '<button type="button" class="cdb-pe__add" data-act="proof-add">' +
      ic('plus', 10) +
      'Add</button></span>';
    return html;
  }

  // the value of one fact, as its editor
  function factEditor(f) {
    if (f.k === 'speaks') return ie('audience', 'val', 'Who the post is written for');
    if (f.k === 'cta') return ie('cta', 'val', 'What we ask them to do next');
    if (f.k === 'proof') return proofEditor();
    // the opening is the first scene: it is edited on the storyboard
    return (
      '<span class="cdb-ie__ro">' +
      f.html +
      '</span><span class="cdb-ie__note">' +
      (isVideo() ? 'Edited on Scene 1 of the storyboard' : 'Edited with the slides') +
      '</span>'
    );
  }

  // the main message and its three facts, as a form
  function whoForm() {
    var d = state.draft;
    return (
      '<div class="cdb-form">' +
      bfield('The main message', 'coreIdea', d.coreIdea, 3, 'What people should take away') +
      bfield('Target audience', 'audience', d.audience, 2, 'Who the post is written for') +
      bfield('Proof points', 'proofs', d.proofs, 3, 'What backs the message up \u00b7 one per line') +
      bfield('Call to action', 'cta', d.cta, 2, 'What we ask them to do next') +
      '</div>' +
      editFoot('save-who')
    );
  }

  // look, tone and voice (and, for a carousel, the slides), as a form
  function styleForm() {
    var d = state.draft;
    var b = state.brief;
    var html = '<div class="cdb-form">';
    if (state.format === 'text') html += bfield('The shape', 'plan', d.plan, 2, 'How the post is built');
    if (state.format === 'carousel')
      state.slides.forEach(function (x, i) {
        html += bfield('Slide ' + (i + 1), 'slide' + i, d['slide' + i], 2);
      });
    if (isVideo()) {
      html += bfield('The plan', 'plan', d.plan, 2, 'The whole video in one line');
      html +=
        '<div class="cdb-f cdb-f--beats"><span class="cdb-f__lab">Scenes<small>One sentence each, in the order they play</small></span>' +
        (state.brief.beats || [])
          .map(function (t, i) {
            return (
              '<label class="cdb-beatf"><span class="cdb-plan__n">' +
              pad(i + 1) +
              '</span><textarea class="cd-ta cdb-f__ta" rows="1" data-draft="beat' +
              i +
              '">' +
              esc(d['beat' + i] == null ? t : d['beat' + i]) +
              '</textarea></label>'
            );
          })
          .join('') +
        '</div>';
    }
    if (state.format !== 'text')
      html += bfield('Look', 'look', d.look, 2, 'Light, setting, what the pictures feel like');
    html += bfield('Tone', 'tone', d.tone, 2, 'How the words should sound');
    if (isVideo()) {
      var lookChanged = state.planned && (d.look || '').trim() !== b.look.trim();
      var voiceChanged = state.planned && d.voice !== b.voice;
      if (lookChanged)
        html +=
          '<div class="cd-warnbox">' +
          ic('warn', 14) +
          '<div><b>A new look puts the whole storyboard out of date.</b> Update it next (uses credits); scenes whose words don’t change keep your edits. Saving here is free.</div></div>';
      html +=
        '<div class="cdb-f"><span class="cdb-f__lab">Voice<small>Who speaks in the video</small></span>' +
        voiceSeg(d.voice, 'draft-voice') +
        '</div>';
      if (voiceChanged)
        html +=
          '<div class="cd-warnbox">' +
          ic('warn', 14) +
          '<div><b>A different voice puts every preview out of date.</b> Each scene with a preview becomes a question before approval. Saving is free; new previews use credits.</div></div>';
    }
    if (state.format !== 'text')
      html +=
        '<div class="cdb-f cdb-f--refs"><span class="cdb-f__lab">References<small>Pictures that guide the look</small></span>' +
        refTiles() +
        '</div>';
    return html + '</div>' + editFoot('save-plan');
  }

  function styleTitle() {
    return isVideo() ? 'Look, tone and voice' : state.format === 'carousel' ? 'Look and tone' : 'Tone and shape';
  }

  function styleSummary() {
    var b = state.brief;
    var bits = [];
    if (b.look) bits.push(esc(b.look.split(/[,.]/)[0]));
    else bits.push(esc(b.tone.split(/[,.:]/)[0]));
    if (isVideo()) bits.push('Voice: ' + esc(voiceName()));
    bits.push(state.refs.length + ' references');
    return '<span>' + bits.join('</span><span>') + '</span>';
  }

  // what a reference is, as the product asks it (round 29)
  var REF_ROLES = [
    ['Product', 'The thing being sold. Vicino uses it as the reference for that object in every shot.'],
    ['Person', 'Someone wearing or using it. Vicino keeps the same person and clothes across the video.'],
    ['Other', 'A place, a texture, a screen — nothing the video has to hold to one object or person.'],
  ];

  function refRoleName(w) {
    return w === 'Person' ? 'Person / model' : w;
  }

  // a reference's name, shown on the picture while you point at it; its
  // note sits under the picture instead (round 46)
  function refName(r) {
    return r.name || r.title;
  }

  function refHover(r) {
    return '<span class="cdb-ref__hover"><b>' + esc(refName(r)) + '</b></span>';
  }

  function refMine(r) {
    return r.by === 'Added by you';
  }

  // where it came from: matched by Vicino, or added by you
  function refSource(r, long) {
    var mine = refMine(r);
    return (
      '<span class="cdb-ref__src' +
      (mine ? ' is-mine' : '') +
      '">' +
      ic(mine ? 'user' : 'spark', 10) +
      '<span>' +
      (long
        ? mine
          ? 'Added by you \u00b7 from your Library'
          : 'Matched by Vicino \u00b7 from your website'
        : mine
          ? 'You'
          : 'Vicino') +
      '</span></span>'
    );
  }

  // the note: yours when you wrote one, otherwise what Vicino read in it
  function refNote(r, i) {
    var t = r.notes || (refMine(r) ? '' : r.title);
    if (!t)
      return locked()
        ? ''
        : '<button type="button" class="cdb-ref__noteadd" data-act="ref-notes" data-arg="' +
            i +
            '">' +
            ic('plus', 10) +
            'Add a note</button>';
    return (
      '<p class="cdb-ref__note' +
      (r.notes ? ' is-yours' : '') +
      '" title="' +
      esc(t) +
      '">' +
      esc(t) +
      '</p>'
    );
  }

  function refRole(r, i) {
    var open = state.refMenu === i;
    if (locked())
      return r.what ? '<span class="cdb-ref__role is-set">' + esc(refRoleName(r.what)) + '</span>' : '';
    return (
      '<span class="cdb-ref__rolewrap"><button type="button" class="cdb-ref__role' +
      (r.what ? '' : ' is-unset') +
      '" data-act="ref-role" data-arg="' +
      i +
      '" aria-expanded="' +
      open +
      '">' +
      esc(r.what ? refRoleName(r.what) : 'What is this?') +
      ic(open ? 'chevU' : 'chevD', 9) +
      '</button>' +
      (open
        ? '<span class="cdb-refmenu" role="menu">' +
          REF_ROLES.map(function (o) {
            var on = r.what === o[0];
            return (
              '<button type="button" class="cdb-refmenu__opt' +
              (on ? ' is-on' : '') +
              '" role="menuitemradio" aria-checked="' +
              on +
              '" data-act="ref-set" data-arg="' +
              i +
              ':' +
              o[0] +
              '"><i class="cd-slot__radio"></i><span><b>' +
              refRoleName(o[0]) +
              '</b><small>' +
              o[1] +
              '</small></span></button>'
            );
          }).join('') +
          '</span>'
        : '') +
      '</span>'
    );
  }

  function refTools(i) {
    if (locked()) return '';
    return (
      '<span class="cdb-ref__tools"><button type="button" class="cdb-ref__tool" data-act="ref-notes" data-arg="' +
      i +
      '" aria-label="Notes for this reference" title="Notes">' +
      ic('pencil', 11) +
      '</button><button type="button" class="cdb-ref__tool" data-act="ref-remove" data-arg="' +
      i +
      '" aria-label="Remove this reference" title="Remove">' +
      ic('close', 10) +
      '</button></span>'
    );
  }

  function refPic(r, withSrc) {
    return (
      '<span class="cdb-ref__img' +
      (r.dark ? ' is-dark' : '') +
      '"><img src="' +
      r.img +
      '" alt="' +
      esc(refName(r)) +
      '">' +
      (withSrc ? refSource(r) : '') +
      refHover(r) +
      '</span>'
    );
  }

  // A · cards   a bigger picture, its source on it, the role and the note under it
  // B · list    a row each: thumbnail, name, source and note, then the actions
  // C · wide    two to a row: the picture at the left, everything else beside it
  function refItem(r, i) {
    var ui = state.refUi;
    var open = state.refMenu === i;
    var cls =
      'cdb-ref cdb-ref--' + ui + (open ? ' is-menu' : '') + (open && state.refMenuUp ? ' is-up' : '');
    if (ui === 'list')
      return (
        '<figure class="' +
        cls +
        '">' +
        refPic(r, false) +
        '<span class="cdb-ref__info"><b class="cdb-ref__name">' +
        esc(refName(r)) +
        '</b>' +
        refSource(r, true) +
        refNote(r, i) +
        '</span><span class="cdb-ref__acts">' +
        (locked()
          ? ''
          : '<button type="button" class="cdb-ref__textbtn" data-act="ref-notes" data-arg="' +
            i +
            '">Edit notes</button>') +
        refRole(r, i) +
        (locked()
          ? ''
          : '<button type="button" class="cdb-ref__x" data-act="ref-remove" data-arg="' +
            i +
            '" aria-label="Remove this reference">' +
            ic('close', 11) +
            '</button>') +
        '</span></figure>'
      );
    if (ui === 'wide')
      return (
        '<figure class="' +
        cls +
        '"><span class="cdb-ref__picwrap">' +
        refPic(r, false) +
        refTools(i) +
        '</span><span class="cdb-ref__info"><span class="cdb-ref__top"><b class="cdb-ref__name">' +
        esc(refName(r)) +
        '</b>' +
        refSource(r) +
        '</span>' +
        refNote(r, i) +
        refRole(r, i) +
        '</span></figure>'
      );
    return (
      '<figure class="' +
      cls +
      '"><span class="cdb-ref__picwrap">' +
      refPic(r, true) +
      refTools(i) +
      '</span>' +
      refRole(r, i) +
      refNote(r, i) +
      '</figure>'
    );
  }

  // one place to add more references, after the last tile (round 40):
  // A · split   the tile in two, Upload over Library
  // B · menu    one Add tile; it opens the two ways beside it
  // C · wide    a wide tile filling the row, its two ways side by side
  function refAdd() {
    var up = '<button type="button" class="cdb-ref__addbtn" data-act="ref-upload">' + ic('upload', 13);
    var lib = '<button type="button" class="cdb-ref__addbtn" data-act="ref-library">' + ic('library', 13);
    if (state.refAdd === 'menu')
      return (
        '<span class="cdb-ref cdb-ref--add cdb-ref--addmenu' +
        (state.refAddMenu ? ' is-open' : '') +
        '"><button type="button" class="cdb-ref__addone" data-act="ref-add-menu" aria-expanded="' +
        !!state.refAddMenu +
        '">' +
        ic('plus', 15) +
        '<span>Add</span></button>' +
        (state.refAddMenu
          ? '<span class="cdb-addmenu" role="menu">' +
            up +
            '<span><b>Upload</b><small>From your computer</small></span></button>' +
            lib +
            '<span><b>From Library</b><small>Images and videos you have</small></span></button></span>'
          : '') +
        '</span>'
      );
    if (state.refAdd === 'wide')
      return (
        '<span class="cdb-ref cdb-ref--add cdb-ref--addwide"><span class="cdb-ref__addsay"><b>Add references</b><small>Images or videos</small></span>' +
        '<span class="cdb-ref__addacts">' +
        up +
        '<span>Upload</span></button>' +
        lib +
        '<span>From Library</span></button></span></span>'
      );
    return (
      '<span class="cdb-ref cdb-ref--add" role="group" aria-label="Add a reference">' +
      up +
      '<span>Upload</span></button>' +
      lib +
      '<span>Library</span></button></span>'
    );
  }

  // references: a tile per picture, its tools on the picture, what it is below
  function refTiles() {
    var items = state.refs
      .map(function (r, i) {
        return refItem(r, i);
      })
      .join('');
    var list = '<div class="cdb-refs cdb-refs--' + state.refUi + '">' + items + (locked() ? '' : refAdd()) + '</div>';
    if (locked()) return list;
    return (
      '<div class="cdb-refsec">' +
      '<div class="cdb-refsec__head"><span>Pictures that guide the look. Remove any that shouldn’t guide this post, and say what each one is.</span></div>' +
      list +
      '</div>'
    );
  }

  // what each voice means, in a whole sentence
  function voiceSay(v) {
    return {
      talking: 'Someone in the video says the lines on camera.',
      voiceover: 'The lines are heard over the pictures; no one speaks on camera.',
      silent: 'No one speaks. On-screen words and the pictures carry the post.',
      auto: 'Vicino chooses, scene by scene, between talking, voiceover and silence.',
    }[v || 'auto'];
  }

  function styleRows() {
    var b = state.brief;
    var rows = [];

    // look and tone read as one description: the pictures, then the words
    if (b.look)
      rows.push([
        'Look and tone',
        '<p>' + esc(b.look) + '</p><p class="cdb-st__then">' + esc(b.tone) + '</p>',
      ]);
    else rows.push(['Tone', '<p>' + esc(b.tone) + '</p>']);
    if (state.format === 'text') rows.push(['Shape', '<p>' + esc(b.plan) + '</p>']);
    if (isVideo())
      rows.push([
        'Voice',
        '<p><b>' +
          esc(voiceName()) +
          '</b> \u2014 ' +
          esc(voiceSay(b.voice)) +
          '<span class="cdb-st__why">' +
          (b.voice === fmtSrc().brief.voice && b.voiceWhy
            ? 'Picked by Vicino, because ' + esc(lower(b.voiceWhy))
            : 'Picked by you') +
          '</span></p>',
      ]);
    rows.push(['References', refTiles()]);
    return (
      '<dl class="cdb-st">' +
      rows
        .map(function (r) {
          return '<div class="cdb-st__row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
        })
        .join('') +
      '</dl>'
    );
  }

  // ---- the video's plan, scene by scene (round 51): one line for the
  // whole, then a sentence for each scene, numbered, with no lengths. Lengths
  // and previews come when the storyboard is planned.
  function planBeats() {
    return state.brief.beats || [];
  }

  function planFoot() {
    return state.planned
      ? '<p class="cdb-plan__foot">Lengths and previews are on the storyboard. <button type="button" class="cdb-plan__go" data-act="tab" data-tab="storyboard">Open it' +
          ic('arrowR', 10) +
          '</button></p>'
      : '<p class="cdb-plan__foot">Scene lengths and previews come with planning.</p>';
  }

  // the scenes as steps: a number on a thread that runs down through them
  function planSteps() {
    return (
      '<ol class="cdb-plan__steps">' +
      planBeats()
        .map(function (t, i) {
          return (
            '<li><span class="cdb-plan__dot">' + (i + 1) + '</span><span class="cdb-plan__st">' + esc(t) + '</span></li>'
          );
        })
        .join('') +
      '</ol>'
    );
  }

  // the plan on a card of its own, never folded (round 53). tail: what goes
  // at its foot (B · One card puts the Look fold there)
  function planCard(tail) {
    if (state.edit === 'plan') return '';
    var n = planBeats().length;
    return (
      '<section class="cdb-plancard cdb-hoverable' +
      (tail ? ' has-look' : '') +
      '"><header class="cdb-plancard__head"><span class="cdb-plancard__ico">' +
      ic('film', 14) +
      '</span><span class="cdb-plancard__title"><b>The video plan</b>' +
      factHelp('plan') +
      '</span><span class="cdb-plancard__sub">' +
      n +
      ' scenes</span>' +
      '</header><div class="cdb-plan__body"><div class="cdb-plan__idea"><span class="cdb-plan__k">In one line</span><p class="cdb-plan__line">' +
      esc(state.brief.plan) +
      '</p></div><div class="cdb-plan__scenes"><span class="cdb-plan__k">Scene by scene</span>' +
      planSteps() +
      '</div>' +
      // the foot, as on the other cards: the note at the left, the two ways
      // to change it at the bottom right
      '<div class="cdb-plan__footrow">' +
      planFoot() +
      (locked()
        ? ''
        : '<span class="cdb-editacts">' +
          qbtn('Rewrite with Vicino', 'vchat-open', ' cd-qbtn--ai', 'wand') +
          qbtn('Edit', 'edit-plan', '', 'pencil') +
          '</span>') +
      '</div></div>' +
      (tail || '') +
      '</section>'
    );
  }

  // Look, tone and voice: one fold, the same in every layout. With a video,
  // the plan comes first: A · on two cards, B · the fold inside the plan's card
  function styleFold(extra) {
    if (!isVideo()) return styleFoldInner(extra);
    if (state.planUi === 'merged' && state.edit !== 'plan')
      return planCard(styleFoldInner((extra ? extra + ' ' : '') + 'cdb-style--inplan'));
    return planCard() + styleFoldInner(extra);
  }

  // the references as small pictures on the folded card (round 73)
  function refPeek() {
    if (!state.refs.length) return '';
    var more = state.refs.length - 4;
    return (
      '<span class="cdb-style__peek" aria-hidden="true">' +
      state.refs
        .slice(0, 4)
        .map(function (r) {
          return '<span class="cdb-style__pk' + (r.dark ? ' is-dark' : '') + '"><img src="' + r.img + '" alt=""></span>';
        })
        .join('') +
      (more > 0 ? '<span class="cdb-style__pk is-more">+' + more + '</span>' : '') +
      '</span>'
    );
  }

  function styleFoldInner(extra) {
    var editingIt = state.edit === 'plan';
    var open = editingIt || state.lookOpen;
    return (
      '<section class="cdb-style cdb-hoverable' +
      (open ? ' is-open' : '') +
      (extra ? ' ' + extra : '') +
      '">' +
      '<button type="button" class="cdb-style__sum" data-act="' +
      (editingIt ? 'noop' : 'toggle-look') +
      '" aria-expanded="' +
      open +
      '"><span class="cdb-style__ico">' +
      ic('sliders', 14) +
      '</span><b>' +
      styleTitle() +
      '</b><span class="cdb-style__sub">' +
      (editingIt ? 'Editing' : styleSummary()) +
      '</span>' +
      (open ? '' : refPeek()) +
      '<span class="cdb-style__chev">' +
      ic('chevD', 13) +
      '</span></button>' +
      (open
        ? '<div class="cdb-style__body">' +
          (editingIt
            ? styleForm()
            : styleRows() +
              '<div class="cdb-style__acts">' +
              qbtn('Rewrite with Vicino', 'rewrite-open', ' cd-qbtn--ai', 'wand') +
              qbtn('Edit', 'edit-plan', '', 'pencil') +
              '</div>') +
          '</div>'
        : '') +
      '</section>'
    );
  }

  // ---- the storyboard card, in each of its states
  function sbState() {
    if (state.ownAsset && stage() === 'brief' && state.format !== 'text') return 'own';
    if (state.format === 'carousel') return 'slides';
    if (state.format === 'text') return 'text';
    if (!state.planned) return 'unplanned';
    if (state.drawing) return 'drawing';
    if (state.stale) return 'stale';
    return 'planned';
  }

  function sbCardInner(slim) {
    var k = sbState();
    var c = counts();
    var n = state.scenes.length;
    var pill = {
      unplanned: ['Not planned', ''],
      drawing: ['Drawing previews', 'is-live'],
      stale: ['Out of date', 'is-warn'],
      planned: ['Planned', 'is-ok'],
      slides: ['Drawn at generation', ''],
      own: ['Your own ' + ownWord(), 'is-ok'],
      text: ['Written at generation', ''],
    }[k];
    var head =
      '<header class="cdb-c__head"><span class="cdb-k">' +
      planHead() +
      '</span><span class="cdb-pill ' +
      pill[1] +
      '">' +
      pill[0] +
      '</span></header>';
    var body = '';
    if (k === 'own') {
      body =
        '<div class="cdb-c__row' +
        (slim ? ' cdb-c__row--stack' : '') +
        '"><span class="cdb-thumbs"><span class="cdb-thumb cdb-thumb--own"><img src="' +
        state.ownAsset.img +
        '" alt=""></span></span><span class="cdb-c__facts"><b>' +
        esc(state.ownAsset.name) +
        '</b><span>Used as it is \u00b7 ' +
        (isVideo() ? 'no storyboard needed' : 'nothing is drawn') +
        '</span></span></div>' +
        '<div class="cdb-c__acts"><button type="button" class="cdb-cbtn" data-act="own-open">' +
        ic('image', 11) +
        'Change</button><button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-clear">Let Vicino make it</button></div>';
    } else if (k === 'unplanned') {
      body =
        '<p class="cdb-c__lead">' +
        n +
        ' scenes in the plan</p>' +
        '<p class="cdb-c__say">Vicino lays out the scenes from this brief: what the camera sees, how long each lasts, the lines. You review them before anything is made.</p>' +
        '<div class="cdb-c__acts"><button type="button" class="cdb-cbtn cdb-cbtn--main" data-act="plan">' +
        ic('wand', 12) +
        'Plan the storyboard</button>' +
        '<button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-open">Or use my own video</button></div>';
    } else if (k === 'drawing') {
      var pct = Math.round((drawnCount() / n) * 100);
      body =
        '<div class="cdb-c__row' +
        (slim ? ' cdb-c__row--stack' : '') +
        '">' +
        thumbs(slim ? 4 : 5) +
        '<span class="cdb-c__facts"><b>' +
        n +
        ' scenes · ' +
        totalDur() +
        's</b><span>' +
        drawnCount() +
        ' of ' +
        n +
        ' previews ready</span></span></div>' +
        '<span class="cdb-c__bar"><i style="width:' +
        Math.max(6, pct) +
        '%"></i></span>';
    } else if (k === 'stale') {
      body =
        '<div class="cdb-c__row' +
        (slim ? ' cdb-c__row--stack' : '') +
        '">' +
        thumbs(slim ? 4 : 5) +
        '<span class="cdb-c__facts"><b>' +
        n +
        ' scenes · ' +
        totalDur() +
        's</b><span>The look changed, so no preview is in use.</span></span></div>' +
        '<div class="cdb-c__acts"><button type="button" class="cdb-cbtn cdb-cbtn--main" data-act="update-storyboard">Update storyboard</button>' +
        '<button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="restore-look">Restore the previous look</button>' +
        '<button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-open">Use my own video</button></div>';
    } else if (k === 'planned') {
      body =
        '<div class="cdb-c__row' +
        (slim ? ' cdb-c__row--stack' : '') +
        '">' +
        thumbs(slim ? 4 : 5) +
        '<span class="cdb-c__facts"><b>' +
        n +
        ' scenes · ' +
        totalDur() +
        's</b><span>' +
        (c.used
          ? c.used + ' of ' + n + ' scenes have a preview'
          : 'No previews yet · draw them on the storyboard') +
        '</span></span></div>' +
        '<div class="cdb-c__acts"><button type="button" class="cdb-cbtn" data-act="tab" data-tab="storyboard">Review the storyboard' +
        ic('arrowR', 11) +
        '</button><button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-open">Use my own video instead</button></div>';
    } else if (k === 'slides') {
      body =
        '<div class="cdb-c__row">' +
        thumbs(4) +
        '<span class="cdb-c__facts"><b>' +
        state.slides.length +
        ' slides</b><span>The images are drawn when the post is generated.</span></span></div>' +
        '<div class="cdb-c__acts"><button type="button" class="cdb-cbtn" data-act="edit-plan">' +
        ic('pencil', 11) +
        'Edit the slides</button><button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-open">Use my own images</button></div>';
    } else {
      body =
        '<div class="cdb-c__row">' +
        thumbs(1) +
        '<span class="cdb-c__facts"><b>One post · under 280 characters</b><span>The words are written when the post is generated.</span></span></div>';
    }
    return head + body;
  }

  // ---- to confirm: a tile per item, the thing on the left, its button on the right
  function todoWhy(t) {
    if (t.id === 'stale') return 'No preview is in use until the storyboard is updated.';
    if (t.id === 'unsaved') return 'Save or cancel them to move on.';
    if (t.id.indexOf('scene-') === 0) return 'Its words changed after the preview was drawn.';
    if (t.id === 'product') return 'The boxed product is drawn from its description.';
    if (t.id === 'notes')
      return 'No photo of the person on camera, and no Verified Catalog instructions. Neither blocks approval.';
    return t.why || '';
  }

  function todoAct(t) {
    if (t.id === 'stale') return { label: 'Update', act: 'update-storyboard' };
    if (t.id.indexOf('scene-') === 0) {
      var i = state.scenes.findIndex(function (s) {
        return 'scene-' + s.id === t.id;
      });
      return { label: 'Decide', act: 'open-scene', arg: String(i), pane: 'preview' };
    }
    return t.acts[0] || null;
  }

  function todoList(slim) {
    var list = todos().filter(function (t) {
      return t.kind === 'fix' || t.kind === 'decide' || t.kind === 'note';
    });
    var open = list.filter(function (t) {
      return t.kind !== 'note';
    });
    if (!open.length && !list.length)
      return (
        '<div class="cdb-empty"><span class="cdb-empty__ico">' +
        ic('check', 12) +
        '</span><span><b>Nothing to confirm</b><small>Everything this post needs is settled.</small></span></div>'
      );
    var html = '';
    if (!open.length)
      html +=
        '<div class="cdb-empty"><span class="cdb-empty__ico">' +
        ic('check', 12) +
        '</span><span><b>Nothing to confirm</b><small>Only notes are left; none of them blocks.</small></span></div>';
    return (
      html +
      '<div class="cdb-tlwrap"><ul class="cdb-tl' +
      (slim ? ' is-slim' : '') +
      '">' +
      list
        .map(function (t) {
          var a = todoAct(t);
          return (
            // the whole item answers to a click, as its button does
            '<li class="cdb-ti cdb-ti--' +
            t.kind +
            (a ? ' is-go' : '') +
            '"' +
            (a
              ? ' data-act="' +
                a.act +
                '"' +
                (a.arg != null ? ' data-arg="' + a.arg + '"' : '') +
                (a.pane ? ' data-pane="' + a.pane + '"' : '')
              : '') +
            '><span class="cdb-ti__ico">' +
            ic(t.kind === 'note' ? 'info' : 'warn', 13) +
            '</span><span class="cdb-ti__txt"><b>' +
            esc(todoShort(t)) +
            '</b><small>' +
            esc(todoWhy(t)) +
            '</small></span>' +
            (a
              ? '<button type="button" class="cdb-ti__btn" data-act="' +
                a.act +
                '"' +
                (a.arg != null ? ' data-arg="' + a.arg + '"' : '') +
                (a.pane ? ' data-pane="' + a.pane + '"' : '') +
                '>' +
                esc(a.label) +
                ic('arrowR', 10) +
                '</button>'
              : '') +
            '</li>'
          );
        })
        .join('') +
      '</ul></div>'
    );
  }

  function todoCardInner(slim) {
    var n = openTodos().length;
    return (
      '<header class="cdb-c__head"><span class="cdb-k">To confirm</span><span class="cdb-count' +
      (n ? ' is-open' : ' is-done') +
      '">' +
      (n || ic('check', 9)) +
      '</span></header>' +
      todoList(slim)
    );
  }

  // the three facts, as rows (A), ruled lines (B) or a grid (C, D)
  function factRows(edit) {
    return (
      '<ul class="cdb-keys' +
      (edit ? ' is-editing' : '') +
      '">' +
      keyFacts(false)
        .map(function (f) {
          return (
            '<li class="cdb-keys__row">' +
            factIcon(f) +
            '<span class="cdb-keys__txt"><span class="cdb-keys__lab">' +
            f.label +
            '</span><span class="cdb-keys__val">' +
            (edit ? factEditor(f) : f.html + f.quote) +
            '</span></span></li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function factGrid(edit) {
    var order = { speaks: 0, cta: 1, proof: 2, opens: 3 };
    return (
      '<dl class="cdb-grid' +
      (edit ? ' is-editing' : '') +
      '">' +
      keyFacts(false)
        .slice()
        .sort(function (a, b) {
          return order[a.k] - order[b.k];
        })
        .map(function (f) {
          return (
            '<div class="cdb-grid__cell' +

            '">' +
            factIcon(f) +
            '<div class="cdb-grid__txt"><dt>' +
            f.label +
            '</dt><dd>' +
            (edit
              ? factEditor(f)
              : f.html + (f.quote ? '<span class="cdb-grid__sub">' + f.quote + '</span>' : '')) +
            '</dd></div></div>'
          );
        })
        .join('') +
      '</dl>'
    );
  }

  // ---- A · Post: the brief inside an abstract draft frame
  function renderBriefPost() {
    var b = state.brief;
    var who = state.edit === 'who';
    var frame =
      '<div class="cdb-draft">' +
      '<i class="cdb-draft__c cdb-draft__c--tl"></i><i class="cdb-draft__c cdb-draft__c--tr"></i><i class="cdb-draft__c cdb-draft__c--bl"></i><i class="cdb-draft__c cdb-draft__c--br"></i>' +
      '<p class="cdb-draft__tag"><i></i>Post draft<span>' +
      esc(state.post.format) +
      (isVideo() ? ' · 0:' + pad(totalDur()) : '') +
      ' · X · ' +
      esc(state.when) +
      '</span></p>' +
      '<section class="cdb-sheet cdb-sheet--post cdb-hoverable' +
      (who ? ' is-editing' : '') +
      '">' +
      '<header class="cdb-sheet__head"><span class="cdb-k">The main message</span>' +
      (who
        ? '<span class="cdb-editing">Editing</span>'
        : '<span class="cdb-editacts">' +
          qbtn('Rewrite with Vicino', 'vchat-open', ' cd-qbtn--ai', 'wand') +
          qbtn('Edit', 'edit-who', '', 'pencil') +
          '</span>') +
      '</header>' +
      (who
        ? '<div class="cdb-lead cdb-lead--xl">' +
          ie('coreIdea', 'lead', 'What people should take away') +
          '</div>' +
          factRows(true) +
          editFoot('save-who')
        : '<p class="cdb-lead cdb-lead--xl">' +
          esc(b.coreIdea) +
          '</p>' +
          factRows() +
          moreBrief(false) +
          '<div class="cdb-sheet__foot">' +
          fullBriefLink() +
          '</div>') +
      '</section></div>';
    return (
      '<div class="cdb cdb--post">' +
      purpose() +
      '<div class="cdb-post__main">' +
      frame +
      rewriteBox() +
      (state.showTodo
        ? '<div class="cdb-pair is-single"><section class="cdb-mini cdb-c">' +
          todoCardInner(false) +
          '</section></div>'
        : '') +
      styleFold() +
      '</div></div>'
    );
  }

  // ---- B · Paper: the brief on a ruled sheet, the rest as slips beside it
  function renderBriefPaper() {
    var b = state.brief;
    var who = state.edit === 'who';
    var lines = [{ label: 'Main message', html: esc(b.coreIdea), lead: true }].concat(
      keyFacts(false).map(function (f) {
        return { label: f.label, html: f.html + (f.quote ? ' ' + f.quote : '') };
      })
    );
    var page =
      '<article class="cdb-page' +
      (who ? ' is-editing' : '') +
      '">' +
      '<header class="cdb-page__head"><span class="cdb-page__kick">Post brief</span><span class="cdb-page__stamp">' +
      esc(state.post.format) +
      ' \u00b7 X</span>' +
      (who
        ? '<span class="cdb-editing">Editing</span>'
        : '<span class="cdb-editacts">' +
          qbtn('Rewrite with Vicino', 'vchat-open', ' cd-qbtn--ai', 'wand') +
          qbtn('Edit', 'edit-who', '', 'pencil') +
          '</span>') +
      '</header>' +
      (who
        ? '<dl class="cdb-lines is-editing">' +
          '<div class="cdb-line cdb-line--lead"><dt>Main message</dt><dd>' +
          ie('coreIdea', 'lead') +
          '</dd></div>' +
          keyFacts(false)
            .map(function (f) {
              return '<div class="cdb-line"><dt>' + f.label + '</dt><dd>' + factEditor(f) + '</dd></div>';
            })
            .join('') +
          '</dl>' +
          '<div class="cdb-page__editfoot">' +
          editFoot('save-who') +
          '</div>'
        : '<dl class="cdb-lines">' +
          lines
            .map(function (l) {
              return (
                '<div class="cdb-line' +
                (l.lead ? ' cdb-line--lead' : '') +
                '"><dt>' +
                l.label +
                '</dt><dd>' +
                l.html +
                '</dd></div>'
              );
            })
            .join('') +
          '</dl>' +
          moreBrief(true)) +
      styleFold('cdb-style--sheet') +
      (who ? '' : '<div class="cdb-page__foot">' + fullBriefLink() + '</div>') +
      '</article>';
    var slips =
      (state.showTodo
        ? '<aside class="cdb-slips"><section class="cdb-slip cdb-slip--todo cdb-c">' +
          todoCardInner(true) +
          '</section></aside>'
        : '');
    return (
      '<div class="cdb cdb--paper">' +
      purpose() +
      '<div class="cdb-paper' +
      (state.showTodo ? '' : ' is-solo') +
      '">' +
      '<div class="cdb-paper__main">' +
      page +
      rewriteBox() +
      '</div>' +
      slips +
      '</div></div>'
    );
  }

  // the main card of C and D: the message, the facts, the link; or the form
  function cleanCard(withArt, tail) {
    var b = state.brief;
    var editActs =
      '<span class="cdb-editacts">' +
      qbtn('Rewrite with Vicino', 'vchat-open', ' cd-qbtn--ai', 'wand') +
      qbtn('Edit', 'edit-who', '', 'pencil') +
      '</span>';
    if (state.edit === 'who')
      return (
        '<section class="cdb-clean is-editing' +
        (withArt ? '' : ' cdb-clean--split') +
        (withArt && state.artOut ? ' is-artout' : '') +
        '">' +
        (withArt ? '<div class="cdb-clean__top"><div class="cdb-clean__say">' : '') +
        '<header class="cdb-clean__head"><span class="cdb-k">The main message</span><span class="cdb-editing">Editing</span></header>' +
        '<div class="cdb-statement">' +
        ie('coreIdea', 'statement', 'What people should take away') +
        '</div>' +
        (withArt ? '</div>' + draftArt() + '</div>' : '') +
        factGrid(true) +
        '<div class="cdb-clean__editfoot">' +
        editFoot('save-who') +
        '</div></section>'
      );
    return (
      '<section class="cdb-clean cdb-hoverable' +
      (withArt ? '' : ' cdb-clean--split') +
      (withArt && state.artOut ? ' is-artout' : '') +
      '">' +
      (withArt ? '<div class="cdb-clean__top"><div class="cdb-clean__say">' : '') +
      '<header class="cdb-clean__head"><span class="cdb-k">The main message</span>' +
      (withArt ? '' : editActs) +
      '</header>' +
      '<p class="cdb-statement">' +
      esc(b.coreIdea) +
      '</p>' +
      (withArt ? '</div>' + draftArt() + '</div>' : '') +
      factGrid() +
      moreBrief(false) +
      '<div class="cdb-clean__foot">' +
      fullBriefLink() +
      (withArt ? editActs : '') +
      '</div>' +
      (tail || '') +
      '</section>'
    );
  }

  // ---- D · Split: C's card, with the storyboard and To confirm beside it
  function renderBriefSplit() {
    var side = state.showTodo && openTodos().length > 0;
    return (
      '<div class="cdb cdb--split">' +
      purpose() +
      '<div class="cdb-split' +
      (side ? '' : ' is-solo') +
      '">' +
      '<div class="cdb-split__main">' +
      cleanCard(false) +
      rewriteBox() +
      styleFold() +
      '</div>' +
      (side
        ? '<aside class="cdb-side"><section class="cdb-sidecard cdb-c">' +
          todoCardInner(true) +
          '</section></aside>'
        : '') +
      '</div></div>'
    );
  }

  // the text draft's quill (round 48, after Zi's reference): a filled
  // feather with notches along its edges and a split down its spine, the
  // shaft running down to a nib. It lives in the lines' own drawing, so it is
  // their colour and its nib ends the second line.
  var QUILL =
    '<g class="cdb-art__quill" transform="translate(82 46) rotate(-22) scale(1.6) translate(-2.4 -22.6)">' +
    '<path class="is-vane" d="M7.2 16.4C6.4 14.6 6.3 13.2 6.6 12.1L8.5 10.9C8.4 10 8.5 9.2 8.9 8.3L11.2 7.1C11.4 6.3 11.7 5.6 12.2 4.9L14.9 3.8C17.2 2.8 19.6 2.3 21.8 2.2 21.2 3.9 20.4 5.3 19.4 6.4L17.7 7.3C17.6 8.1 17.4 8.8 17.1 9.5L14.8 11.2C14.5 12 14.1 12.7 13.6 13.4 11.9 15.2 10.2 16.4 8.4 17.2Z"/>' +
    '<path class="is-spine" d="M8.6 16.4 19.2 4.9"/>' +
    '<path class="is-shaft" d="M8 16.8 4.4 20.4"/>' +
    '<path class="is-nib" d="M4.7 19.9 5.4 20.6 3.1 22.5 2.4 22.6 2.5 21.9Z"/>' +
    '</g>';

  // a small picture of the post this brief will become: a draft card, not a mock
  // the draft card (round 24): one style for every post, no copy and no
  // platform. Only the picture in it changes with the post format.
  function draftArt() {
    var s1 = state.scenes[0];
    var media;
    if (isVideo()) {
      media =
        state.planned && s1 && s1.img
          ? '<span class="cdb-art__media"><img src="' +
            s1.img +
            '" alt=""><b>0:' +
            pad(totalDur()) +
            '</b></span>'
          : '<span class="cdb-art__media cdb-art__media--video"><b>0:' +
            pad(totalDur()) +
            '</b><span class="cdb-art__play">' +
            ic('play', 9) +
            '</span><span class="cdb-art__ticks">' +
            state.scenes
              .map(function () {
                return '<i></i>';
              })
              .join('') +
            '</span></span>';
    } else if (state.format === 'carousel') {
      // one picture, arrows either side, a dot per slide
      media =
        '<span class="cdb-art__media cdb-art__media--carousel"><span class="cdb-art__pic">' +
        ic('image', 14) +
        '</span><span class="cdb-art__arrow is-l">' +
        ic('chevL', 9) +
        '</span><span class="cdb-art__arrow is-r">' +
        ic('chevR', 9) +
        '</span><span class="cdb-art__dots">' +
        state.slides
          .map(function (x, i) {
            return '<i' + (i === 0 ? ' class="is-on"' : '') + '></i>';
          })
          .join('') +
        '</span></span>';
    } else {
      // a text post: hand-drawn strokes, and the pen that drew them
      media =
        '<span class="cdb-art__media cdb-art__media--text"><svg viewBox="0 0 130 74" aria-hidden="true">' +
        '<path d="M10 26c14-6 26-6 40 0s28 6 42 0 18-4 26-2"/>' +
        '<path d="M10 46c14-5 26-5 38 0s22 4 34 0"/>' +
        QUILL +
        '</svg></span>';
    }
    return (
      '<div class="cdb-art cdb-art--' +
      state.format +
      '" aria-hidden="true">' +
      '<span class="cdb-art__card">' +
      '<span class="cdb-art__who"><i></i><b></b></span>' +
      '<span class="cdb-art__lines"><b></b><b></b></span>' +
      media +
      '</span>' +
      '</div>'
    );
  }

  // ---- C · Clean: one statement, three facts, a status band, the rest folded
  function renderBriefClean() {
    var k = sbState();
    var sbSay =
      k === 'own'
        ? esc(state.ownAsset.name) + ' \u00b7 used as it is'
        : k === 'unplanned'
        ? 'Not planned yet'
        : k === 'drawing'
          ? 'Drawing previews · ' + drawnCount() + ' of ' + state.scenes.length
          : k === 'stale'
            ? '<em>Out of date</em> · the look changed'
            : planLine();
    var band =
      state.edit === 'who'
        ? ''
        : '<div class="cdb-band">' +
          '<button type="button" class="cdb-band__sb" data-act="' +
          (k === 'own'
            ? 'own-open'
            : k === 'unplanned'
              ? 'plan'
              : k === 'stale'
                ? 'update-storyboard'
                : isVideo()
                  ? 'tab" data-tab="storyboard'
                  : 'edit-plan') +
          '">' +
          (k === 'own'
            ? '<span class="cdb-thumbs"><span class="cdb-thumb cdb-thumb--own"><img src="' +
              state.ownAsset.img +
              '" alt=""></span></span>'
            : k === 'unplanned'
              ? '<span class="cdb-band__ico">' + ic('wand', 13) + '</span>'
              : thumbs(5, true)) +
          '<span class="cdb-band__say"><b>' +
          (k === 'own'
            ? 'Your own ' + ownWord()
            : k === 'unplanned'
              ? 'Plan the storyboard'
              : k === 'stale'
                ? 'Update the storyboard'
                : planHead()) +
          '</b><span>' +
          sbSay +
          '</span></span>' +
          '<span class="cdb-band__go">' +
          ic('arrowR', 12) +
          '</span>' +
          '</button></div>';
    return (
      '<div class="cdb cdb--clean">' +
      // what needs confirming comes first, before "Check what this post says"
      confirmBar() +
      purpose() +
      cleanCard(true) +
      rewriteBox() +
      styleFold() +
      '</div>'
    );
  }

  function renderWhoCard() {
    var b = state.brief;
    if (state.edit === 'who') {
      var d = state.draft;
      return (
        '<section class="cd-card cd-brief__card" data-card="who"><div class="cd-card__head"><span class="cd-card__no">1</span><h3 class="cd-card__title">The main message, and who it\u2019s for</h3></div>' +
        '<div class="cd-rows" style="box-shadow:none;padding-top:0">' +
        field('Target audience', 'audience', d.audience, 1) +
        field('Main message', 'coreIdea', d.coreIdea, 3) +
        field('Call to action', 'cta', d.cta, 1) +
        field('Tone', 'tone', d.tone, 2) +
        '</div>' +
        '<div class="cd-edit__foot">' +
        '<button type="button" class="cd-btn cd-btn--primary" data-act="save-who">Save</button>' +
        '<button type="button" class="cd-btn cd-btn--ghost" data-act="cancel-edit">Cancel</button>' +
        '<span class="cd-edit__note">Saves to the brief · <b>Free</b></span>' +
        '</div></section>'
      );
    }
    var firstLine = null,
      firstIdx = -1;
    state.scenes.some(function (s, i) {
      if (s.line) {
        firstLine = s.line;
        firstIdx = i;
        return true;
      }
      return false;
    });
    return (
      '<section class="cd-card cd-brief__card" data-card="who"><div class="cd-card__head"><span class="cd-card__no">1</span><h3 class="cd-card__title">The main message, and who it\u2019s for</h3>' +
      '<div class="cd-card__acts">' +
      qbtn('Edit', 'edit-who', '', 'pencil') +
      '</div></div>' +
      '<p class="cd-lead">' +
      esc(b.coreIdea) +
      '</p>' +
      '<dl class="cd-rows">' +
      '<div class="cd-row"><dt>Call to action</dt><dd>' +
      esc(b.cta) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Tone</dt><dd>' +
      esc(b.tone) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Opens with</dt><dd>' +
      (firstLine ? '<b>“' + esc(firstLine) + '”</b> over ' : '') +
      esc(lower(b.hook)) +
      (state.planned
        ? '<button type="button" class="cd-link" data-act="open-scene" data-arg="' +
          (firstIdx >= 0 ? firstIdx : 0) +
          '">Edit in Scene ' +
          (firstIdx >= 0 ? sceneNo(firstIdx) : 1) +
          ' ' +
          ic('arrowR', 11) +
          '</button>'
        : '') +
      '</dd></div>' +
      '</dl></section>'
    );
  }

  function lower(s) {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : '';
  }

  function field(label, key, value, rows) {
    return (
      '<div class="cd-field"><span class="cd-lab">' +
      esc(label) +
      '</span><textarea class="cd-ta" rows="' +
      (rows || 2) +
      '" data-draft="' +
      key +
      '">' +
      esc(value) +
      '</textarea></div>'
    );
  }

  // the voice picker (round 40): four small cards, each with a line saying
  // what it means; the chosen one white with a tick (B, kept in round 135;
  // A · words and C · icons dropped)
  var VOICES = [
    ['auto', 'Let Vicino decide', 'Chosen scene by scene', 'wand'],
    ['silent', 'Silent', 'No one speaks', 'text'],
    ['talking', 'Talking', 'Said on camera', 'user'],
    ['voiceover', 'Voiceover', 'Heard over the pictures', 'mic'],
  ];

  function voiceSeg(current, act) {
    return (
      '<div class="cd-vpick cd-vpick--lines" role="radiogroup" aria-label="Voice">' +
      VOICES.map(function (o) {
        var on = current === o[0];
        return (
          '<button type="button" class="cd-vpick__opt' +
          (on ? ' is-on' : '') +
          '" data-act="' +
          act +
          '" data-arg="' +
          o[0] +
          '" role="radio" aria-checked="' +
          on +
          '">' +
          '<b>' +
          o[1] +
          '</b><small>' +
          o[2] +
          '</small>' +
          (on ? '<i class="cd-vpick__tick">' + ic('check', 10) + '</i>' : '') +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function renderPlanCard() {
    var b = state.brief;
    var head =
      '<div class="cd-card__head"><span class="cd-card__no">2</span><h3 class="cd-card__title">The plan for this video</h3>';
    if (state.edit === 'plan' && !isVideo()) {
      var dn = state.draft;
      var fields =
        field(state.format === 'carousel' ? 'The plan' : 'The shape', 'plan', dn.plan, 2) +
        state.slides
          .map(function (x, i) {
            return field('Slide ' + (i + 1), 'slide' + i, dn['slide' + i], 2);
          })
          .join('') +
        (state.format === 'carousel' ? field('Look', 'look', dn.look, 2) : '');
      return (
        '<section class="cd-card cd-brief__card" data-card="plan"><div class="cd-card__head"><span class="cd-card__no">2</span><h3 class="cd-card__title">' +
        (state.format === 'carousel' ? 'The slides' : 'The post') +
        '</h3></div><div class="cd-rows" style="box-shadow:none;padding-top:0;gap:14px">' +
        fields +
        '</div><div class="cd-edit__foot"><button type="button" class="cd-btn cd-btn--primary" data-act="save-plan">Save</button><button type="button" class="cd-btn cd-btn--ghost" data-act="cancel-edit">Cancel</button><span class="cd-edit__note">Saves to the brief \u00b7 <b>Free</b></span></div></section>'
      );
    }
    if (state.edit === 'plan') {
      var d = state.draft;
      var lookChanged = state.planned && d.look.trim() !== b.look.trim();
      var voiceChanged = state.planned && d.voice !== b.voice;
      var inner = '';
      if (!state.planned) {
        inner +=
          '<div class="cd-field"><span class="cd-lab">Scenes</span><div class="cd-strip">' +
          state.scenes
            .map(function (s, i) {
              return (
                '<div class="cd-strip__row" style="grid-template-columns:22px minmax(0,1fr)"><span class="cd-strip__no">' +
                pad(sceneNo(i)) +
                '</span><textarea class="cd-ta" rows="2" data-draft="scene' +
                i +
                '">' +
                esc(d['scene' + i]) +
                '</textarea></div>'
              );
            })
            .join('') +
          '</div></div>';
      } else {
        inner +=
          '<p class="cd-plan-note">Scenes, lengths and lines are edited on the storyboard.</p>';
      }
      inner += field('Look and tone', 'look', d.look, 2);
      if (lookChanged)
        inner +=
          '<div class="cd-warnbox">' +
          ic('warn', 14) +
          '<div><b>A new look makes the whole storyboard out of date.</b> Required next: Update storyboard (uses credits); scenes whose words don’t change keep your edits. Optional after that: regenerate previews. Saving here is free.</div></div>';
      inner +=
        '<div class="cd-field"><span class="cd-lab">Voice</span>' +
        voiceSeg(d.voice, 'draft-voice') +
        (voiceChanged
          ? '<div class="cd-warnbox">' +
            ic('warn', 14) +
            '<div><b>A different voice puts every preview out of date.</b> Each scene with a preview becomes a question to answer before approval. Saving is free; new previews use credits.</div></div>'
          : '') +
        '</div>';
      return (
        '<section class="cd-card cd-brief__card" data-card="plan">' +
        head +
        '</div><div class="cd-rows" style="box-shadow:none;padding-top:0;gap:14px">' +
        inner +
        '</div>' +
        '<div class="cd-edit__foot">' +
        '<button type="button" class="cd-btn cd-btn--primary" data-act="save-plan">Save</button>' +
        '<button type="button" class="cd-btn cd-btn--ghost" data-act="cancel-edit">Cancel</button>' +
        '<span class="cd-edit__note">Saves to the brief · <b>Free</b></span>' +
        '</div></section>'
      );
    }

    var c = counts();
    var bodyHtml = '';
    if (state.rewrite) {
      bodyHtml +=
        '<div class="cd-rewrite"><span class="cd-lab">' +
        ic('wand', 12) +
        ' Rewrite with Vicino</span>' +
        '<textarea class="cd-ta" rows="2" data-draft="rewrite" placeholder="e.g. Make the boxed product the hero of scene 3 and warm up scene 2.">' +
        esc(state.draft.rewrite || '') +
        '</textarea>' +
        '<div class="cd-rewrite__foot">' +
        '<button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="rewrite-go">' +
        (state.planned ? 'Update storyboard' : 'Rewrite the plan') +
        '</button>' +
        '<button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="rewrite-close">Cancel</button>' +
        '<span>' +
        (state.planned
          ? 'Replans the scenes. Uses credits. Nothing is replaced until you review the result.'
          : 'Rewrites the plan above. Uses credits. Nothing is planned yet, so nothing else changes.') +
        '</span></div></div>';
    }
    if (state.planned) {
      bodyHtml +=
        '<div class="cd-plan"><div><div class="cd-plan__big">' +
        (state.stale
          ? '<b>0</b> previews in use'
          : '<b>' + c.used + '</b> of ' + c.total + ' scenes start from a preview') +
        '</div><div class="cd-plan__facts">' +
        c.total +
        ' scenes · ' +
        totalDur() +
        's' +
        (state.stale
          ? ' · <em>out of date — the look changed</em>'
          : (c.fromDesc.length
              ? ' · Scene ' + c.fromDesc.map(sceneNo).join(', ') + ' from description'
              : '') + (c.asks ? ' · <em>' + c.asks + ' to decide</em>' : '')) +
        '</div></div>' +
        '<button type="button" class="cd-btn cd-btn--white cd-btn--sm" data-act="tab" data-tab="storyboard">Open the storyboard ' +
        ic('arrowR', 12) +
        '</button></div>';
      bodyHtml +=
        '<div class="cd-strip">' +
        state.scenes
          .map(function (s, i) {
            return (
              '<button type="button" class="cd-strip__row" data-act="open-scene" data-arg="' +
              i +
              '"><span class="cd-strip__no">' +
              pad(sceneNo(i)) +
              '</span>' +
              (s.img
                ? '<img class="cd-strip__thumb" src="' + s.img + '" alt="">'
                : '<span class="cd-strip__thumb"></span>') +
              '<span class="cd-strip__text">' +
              esc(s.text || 'New scene — describe what the camera sees') +
              '</span><span class="cd-strip__dur">' +
              s.dur +
              's</span></button>'
            );
          })
          .join('') +
        '</div>';
    } else {
      bodyHtml +=
        '<p class="cd-lead" style="font-size:var(--fs-5)">' +
        esc(b.plan) +
        '</p>' +
        '<div class="cd-strip">' +
        state.scenes
          .map(function (s, i) {
            return (
              '<div class="cd-strip__row" style="grid-template-columns:22px minmax(0,1fr)"><span class="cd-strip__no">' +
              pad(sceneNo(i)) +
              '</span><span style="white-space:normal">' +
              esc(s.text) +
              '</span></div>'
            );
          })
          .join('') +
        '</div><p class="cd-plan-note">Scene lengths and previews come with planning.</p>';
    }
    bodyHtml +=
      '<dl class="cd-rows">' +
      '<div class="cd-row"><dt>Look and tone</dt><dd>' +
      esc(b.look) +
      (state.stale
        ? ' <span class="cd-tag cd-tag--decide" style="vertical-align:middle;margin-left:6px">New</span>'
        : '') +
      '</dd></div>' +
      '<div class="cd-row"><dt>Voice</dt><dd><b>' +
      esc(voiceName()) +
      '</b>' +
      (b.voice === fmtSrc().brief.voice
        ? ' · picked by Vicino: ' + esc(lower(b.voiceWhy))
        : ' · picked by you') +
      '</dd></div>' +
      '</dl>';
    return (
      '<section class="cd-card cd-brief__card" data-card="plan">' +
      head +
      '<div class="cd-card__acts">' +
      qbtn('Rewrite with Vicino', 'rewrite-open', ' cd-qbtn--ai', 'wand') +
      qbtn('Edit', 'edit-plan', '', 'pencil') +
      '</div></div>' +
      bodyHtml +
      '</section>'
    );
  }

  function renderTodoCard() {
    var list = todos();
    var open = list.filter(function (t) {
      return t.kind !== 'done';
    });
    var tagName = { fix: 'Fix', decide: 'Decide', note: 'Note', done: 'Done' };
    return (
      '<section class="cd-card cd-brief__card" data-card="todo"><div class="cd-card__head"><span class="cd-card__no">3</span><h3 class="cd-card__title">What you still need to confirm</h3>' +
      '<div class="cd-card__acts"><span class="cd-hint">' +
      (open.filter(function (t) {
        return t.kind !== 'note';
      }).length || 'Nothing') +
      ' open</span></div></div>' +
      '<div class="cd-todo">' +
      list
        .map(function (t) {
          return (
            '<div class="cd-todo__item' +
            (t.kind === 'done' ? ' is-done' : '') +
            '"><span class="cd-tag cd-tag--' +
            t.kind +
            '">' +
            tagName[t.kind] +
            '</span><div class="cd-todo__say">' +
            t.html +
            '</div><div class="cd-todo__acts">' +
            t.acts
              .map(function (a) {
                return (
                  '<button type="button" class="cd-btn cd-btn--sm' +
                  (a.primary ? ' cd-btn--primary' : '') +
                  '" data-act="' +
                  a.act +
                  '"' +
                  (a.arg != null ? ' data-arg="' + a.arg + '"' : '') +
                  '>' +
                  esc(a.label) +
                  '</button>'
                );
              })
              .join('') +
            '</div></div>'
          );
        })
        .join('') +
      '</div></section>'
    );
  }

  function renderDetailsFold(label) {
    var b = state.brief;
    var cleanish = state.layout === 'clean' || state.layout === 'split';
    return (
      '<section class="cd-card cd-fold' +
      (state.details ? ' is-open' : '') +
      '"><button type="button" class="cd-fold__sum" data-act="toggle-details" aria-expanded="' +
      state.details +
      '"><span class="cdb-fico">' +
      ic('doc', 13) +
      '</span><b>' +
      (label || 'Brief details') +
      '</b><span class="cd-fold__list">' +
      (!cleanish ? '<i>Tone</i>' + (isVideo() ? '<i>Look and voice</i>' : '') : '') +
      '<i>Guardrails</i><i>Story</i><i>' +
      state.refs.length +
      ' references</i></span><span class="cd-fold__chev">' +
      ic('chevD', 14) +
      '</span></button>' +
      '<div class="cd-fold__body">' +
      (!cleanish
        ? '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">Tone</span></div><p class="cd-fold__text">' +
          esc(b.tone) +
          '</p></div>' +
          (b.look || isVideo()
            ? '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">' +
              (isVideo() ? 'Look and voice' : 'Look') +
              '</span>' +
              qbtn('Edit', 'edit-plan', '', 'pencil') +
              '</div>' +
              lookVoice() +
              '</div>'
            : '')
        : '') +
      '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">Requirements</span>' +
      qbtn('Add a requirement', 'noop', '', 'plus') +
      '</div><p class="cd-fold__text"><span class="cd-empty">None yet. Rules every generated post follows — scenes and on-screen words live in the storyboard.</span></p></div>' +
      '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">Guardrails</span>' +
      qbtn('Edit', 'noop', '', 'pencil') +
      '</div><p class="cd-fold__text">' +
      (b.guardrails ? esc(b.guardrails) : '<span class="cd-empty">Not set</span>') +
      '</p></div>' +
      '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">Story structure · X, vertical video</span></div><p class="cd-fold__text">' +
      esc(b.story) +
      '</p></div>' +
      '<div class="cd-fold__sec"><div class="cd-fold__sec-head"><span class="cd-lab">References · ' +
      state.refs.length +
      '</span>' +
      qbtn('Upload', 'noop', '', 'upload') +
      qbtn('From Library', 'noop', '', 'library') +
      '</div>' +
      '<div class="cd-refs">' +
      state.refs
        .map(function (r, i) {
          return (
            '<div class="cd-ref' +
            (r.dark ? ' cd-ref--dark' : '') +
            '"><img src="' +
            r.img +
            '" alt="' +
            esc(r.title) +
            '"><span class="cd-ref__role">' +
            esc(r.what || r.role) +
            '</span><div class="cd-ref__veil"><span class="cd-ref__name">' +
            esc(r.title) +
            '</span><div class="cd-ref__acts">' +
            '<button type="button" class="cd-btn" data-act="ref-what" data-arg="' +
            i +
            '">' +
            (r.what ? 'Change role' : 'What is this?') +
            '</button>' +
            '<button type="button" class="cd-btn" data-act="ref-remove" data-arg="' +
            i +
            '">Remove</button>' +
            '</div></div></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="cd-refs__foot">Matched by Vicino from your website. Remove any that shouldn’t guide this post; say what a picture shows so Vicino uses it right.</div>' +
      '</div>' +
      '</div></section>'
    );
  }

  function renderRail() {
    var n = nextStep();
    var c = counts();
    var btn = '';
    if (!isEditing() && !state.gen) {
      if (!state.planned)
        btn =
          '<button type="button" class="cd-btn cd-btn--white" data-act="plan">Plan the storyboard</button><div class="cd-next__cost">' +
          ic('clock', 11) +
          ' Uses credits · then previews, uses credits</div>';
      else if (state.stale)
        btn =
          '<button type="button" class="cd-btn cd-btn--white" data-act="update-storyboard">Update storyboard</button><div class="cd-next__sub"><button type="button" class="cd-link cd-link--quiet" data-act="restore-look">Restore the previous look</button></div>';
      else
        btn =
          '<button type="button" class="cd-btn cd-btn--white" data-act="tab" data-tab="storyboard">Open the storyboard ' +
          ic('arrowR', 12) +
          '</button>';
    }
    return (
      '<aside class="cd-rail">' +
      '<div class="cd-card cd-next' +
      (n.warn ? ' cd-next--warn' : '') +
      '"><div class="cd-next__eyebrow"><span class="cd-dot"></span>Next</div>' +
      '<div class="cd-next__title">' +
      esc(n.title) +
      '</div><p class="cd-next__say">' +
      esc(n.say) +
      '</p>' +
      btn +
      '</div>' +
      '<div class="cd-card cd-rail__card"><span class="cd-lab">Approval</span>' +
      (state.planned
        ? '<p><b>Approve &amp; generate</b> on the Storyboard tab starts generation. Edits after approving need a new approval.</p>'
        : '<p>Approvers see this brief once the storyboard is planned.</p>') +
      '<p>' +
      (state.comments ? state.comments + ' comments stay open.' : 'No comments yet.') +
      '</p>' +
      '<div class="cd-rail__who"><span class="cd-avatar"><img src="assets/approver.png" alt=""></span>Generate · you · no brief approval needed</div>' +
      '</div>' +
      '</aside>'
    );
  }

  // ------------------------------------------------------------ storyboard
  // Round 10. A summary bar over the frames in three drawings (?sm=), the
  // notices moved to where they apply (a decision on its frame, the reference
  // notes in a popover off the bar), and three light layouts (?sl=):
  // Sequence (white cards in order), Sheet (one storyboard sheet in columns)
  // and Script (one row per scene). Frames and line bubbles keep one size.
  // ---- the storyboard (rounds 71-73). On top, one bar: four plain facts,
  // each with its label (Length, Scenes, Previews in use, Version), the
  // preview setting as a small menu, and the three main tools at its right
  // (Add a scene, Rewrite with Vicino, Use my own video). Under it the same
  // confirm bar as the Brief's, then the scenes as a gallery of four frame
  // cards a row, in one of four versions (switcher row "Storyboard", ?sl=);
  // each scene's line sits under its own scene.
  // Your video (round 115): the video large on a dark stage, playable, with
  // what it is and what you can do with it beside it. The prototype has no
  // video file, so playing runs the clock and the bar over the poster, with
  // a slow push-in to show it moving
  function vidLen() {
    var d = (state.ownAsset && state.ownAsset.dur) || '0:12';
    var p = d.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function vidClock(t) {
    var m = Math.floor(t / 60),
      sec = Math.floor(t % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function renderOwnVideo() {
    var a = state.ownAsset;
    var v = state.vid || (state.vid = { on: false, t: 0, muted: false });
    var len = vidLen();
    var ended = !v.on && v.t >= len;
    return (
      '<div class="cds-own2"><div class="cds-player' +
      (v.on ? ' is-on' : '') +
      (v.t > 0 ? ' is-started' : '') +
      '" data-act="vid-toggle" aria-label="' +
      (v.on ? 'Pause' : 'Play') +
      ' the video"><img class="cds-player__bg" src="' +
      a.img +
      '" alt=""><span class="cds-player__frame"><img class="cds-player__vid" src="' +
      a.img +
      '" alt="' +
      esc(a.name) +
      '"></span>' +
      (v.on
        ? ''
        : '<span class="cds-player__big" aria-hidden="true">' + ic(ended ? 'replay' : 'play', ended ? 22 : 26) + '</span>') +
      '<div class="cds-player__bar" data-act="vid-bar"><button type="button" class="cds-player__ib" data-act="vid-toggle" aria-label="' +
      (v.on ? 'Pause' : 'Play') +
      '">' +
      ic(v.on ? 'pause' : 'play', 14) +
      '</button><span class="cds-player__time"><b data-vid-t>' +
      vidClock(Math.min(v.t, len)) +
      '</b> / ' +
      vidClock(len) +
      '</span><span class="cds-player__track" data-act="vid-seek"><i data-vid-fill style="width:' +
      Math.min(100, (v.t / len) * 100) +
      '%"></i></span><button type="button" class="cds-player__ib" data-act="vid-mute" aria-label="' +
      (v.muted ? 'Sound on' : 'Mute') +
      '">' +
      ic(v.muted ? 'mute' : 'volume', 15) +
      '</button></div></div>' +
      '<div class="cds-own2__info"><span class="cdb-k">Your own video</span><b class="cds-own2__name">' +
      esc(a.name) +
      '</b><dl class="cds-own2__facts"><div><dt>Length</dt><dd>' +
      vidClock(len) +
      '</dd></div><div><dt>Shape</dt><dd>Vertical 9:16</dd></div><div><dt>From</dt><dd>Your Library' +
      (a.date ? ' \u00b7 ' + esc(a.date) : '') +
      '</dd></div>' +
      (a.size ? '<div><dt>Size</dt><dd>' + esc(a.size) + '</dd></div>' : '') +
      '</dl><p>This post uses your video as it is, so there is no storyboard to plan. Vicino writes the caption and the post text from the brief.</p>' +
      // Change the video under the words; switching back to Vicino at the
      // card's foot, set apart by a divider (round 120)
      '<button type="button" class="cds-own2__change" data-act="own-open">' +
      ic('upload', 13) +
      'Change the video</button>' +
      '<button type="button" class="cds-own2__back" data-act="own-clear"><span class="cds-own2__backico">' +
      ic('swap', 13) +
      '</span><span><b>Let Vicino make it</b><small>Go back to a storyboard Vicino plans from the brief.</small></span>' +
      ic('chevR', 13) +
      '</button></div></div>'
    );
  }

  // the clock: while a video plays, move its time and bar without a render
  setInterval(function () {
    var v = state.vid;
    if (!v || !v.on) return;
    var t = root.querySelector('[data-vid-t]');
    if (!t) {
      v.on = false;
      return;
    }
    var len = vidLen();
    v.t = Math.min(len, v.t + 0.1);
    t.textContent = vidClock(v.t);
    var f = root.querySelector('[data-vid-fill]');
    if (f) f.style.width = (v.t / len) * 100 + '%';
    if (v.t >= len) {
      v.on = false;
      render();
    }
  }, 100);

  function renderStoryboard() {
    if (state.ownAsset) return renderOwnVideo();
    if (!state.planned) {
      return '<div class="cd-card" style="padding:40px;text-align:center"><div class="cd-next__title">No storyboard yet</div><p class="cd-next__say" style="margin:8px auto 16px;max-width:40ch">Vicino lays out the scenes from the brief. You choose next whether previews are made right away or only when you ask.</p><button type="button" class="cd-btn cd-btn--primary" data-act="plan">Plan the storyboard</button></div>';
    }
    var v = state.sblayout;
    return (
      '<div class="sb2 sb2--' +
      v +
      (locked() ? ' is-locked' : '') +
      '">' +
      confirmBar(true) +
      sbBar() +
      sbExtras() +
      sbGal(v) +
      '</div>'
    );
  }

  // a designed tooltip: an icon, a title, one or two plain sentences
  function tip(icon, title, say) {
    return (
      '<span class="cd-tip" role="tooltip"><span class="cd-tip__ico">' +
      ic(icon, 12) +
      '</span><span class="cd-tip__txt"><b>' +
      title +
      '</b><span>' +
      say +
      '</span></span></span>'
    );
  }

  // ---- the bar
  function sbFactBox(label, value, help) {
    return (
      '<div class="sb2-fact"><span class="sb2-fact__k">' +
      label +
      (help ? factHelp(help) : '') +
      '</span><span class="sb2-fact__v">' +
      value +
      '</span></div>'
    );
  }

  // how previews are made: the Brief's menu, small, with the Brief's words
  function sbModeMenu() {
    var auto = state.previewMode === 'auto';
    var opts = modeOptionsAll().filter(function (o) {
      return o[0] !== 'own';
    });
    return (
      '<div class="sb2-mode' +
      (state.sbMode ? ' is-open' : '') +
      '"><button type="button" class="sb2-mode__btn" data-act="sb-mode" aria-expanded="' +
      !!state.sbMode +
      '">' +
      (auto ? 'Previews automatically' : 'Previews when I ask') +
      (auto ? creditTag('Uses credits') : '<em class="is-free">Free</em>') +
      ic(state.sbMode ? 'chevU' : 'chevD', 11) +
      '</button>' +
      (state.sbMode
        ? '<div class="sb2-mode__pop" role="radiogroup" aria-label="How previews are made">' +
          '<p class="cd-nextpop__k">How previews are made</p><div class="cd-modes is-menu">' +
          opts
            .map(function (o) {
              var on = state.previewMode === o[0];
              return (
                '<button type="button" class="cd-mode' +
                (on ? ' is-on' : '') +
                '" data-act="pv-policy" data-arg="' +
                o[0] +
                '" role="radio" aria-checked="' +
                on +
                '"><span class="cd-mode__ico">' +
                ic(o[4], 13) +
                '</span><span class="cd-mode__say"><b>' +
                o[1] +
                '</b><small>' +
                o[2] +
                '</small></span>' +
                (o[3] === 'Free'
                  ? '<span class="cd-mode__cost is-free">Free</span>'
                  : creditTag(o[3])) +
                (on ? '<span class="cd-mode__tick">' + ic('check', 12) + '</span>' : '') +
                '</button>'
              );
            })
            .join('') +
          '</div></div>'
        : '') +
      '</div>'
    );
  }

  // the three main tools, round and lit: Add a scene in ink (the send
  // button's look in side-chats), Rewrite with Vicino in the product's ring,
  // Use my own video in cyan
  // drawing every missing preview at once: a fourth round button with the
  // bar's tools, its count on it and a faint cyan ring. Now and then it hops
  // (as Plan the storyboard does) and a small bubble over it says what it is
  // for; hovering it opens the card, which says it uses credits (round 99)
  function sbDrawTool() {
    var miss = missingPreviews().length;
    if (!miss || state.drawing) return '';
    return (
      '<span class="sb2-tool sb2-drawtool cd-has-tip"><span class="sb2-drawhint" aria-hidden="true">Draw ' +
      (miss === 1 ? 'the missing preview' : miss + ' previews') +
      '</span><button type="button" class="sb2-tool__btn is-draw" data-act="draw-missing" aria-label="Draw the missing previews">' +
      ic('image', 15) +
      '<b class="sb2-tool__n">' +
      miss +
      '</b></button>' +
      '<span class="cd-tip sb2-drawtip" role="tooltip"><span class="sb2-drawtip__head"><span class="cd-tip__ico">' +
      ic('image', 12) +
      '</span><b>Draw the missing previews</b></span><span class="sb2-drawtip__say">Vicino draws a preview for each scene that has none yet (' +
      miss +
      ').</span>' +
      creditTag('Uses credits') +
      '</span></span>'
    );
  }

  function sbTools() {
    if (locked()) return '';
    return (
      '<div class="sb2-tools">' +
      sbDrawTool() +
      '<span class="sb2-tool cd-has-tip"><button type="button" class="sb2-tool__btn is-own" data-act="own-open" aria-label="Use my own video">' +
      ic('upload', 15) +
      '</button>' +
      tip(
        'upload',
        'Use my own video',
        'Upload a video or pick one from your Library. It replaces this storyboard; Vicino then writes only the post text. Free.'
      ) +
      '</span>' +
      '<span class="sb2-tool cd-has-tip"><button type="button" class="sb2-tool__btn is-ai' +
      (state.sbRewrite ? ' is-on' : '') +
      '" data-act="sb-rewrite" aria-label="Rewrite with Vicino" aria-expanded="' +
      !!state.sbRewrite +
      '"><span>' +
      ic('wand', 15) +
      '</span></button>' +
      tip(
        'wand',
        'Rewrite with Vicino',
        'Say what should change and Vicino plans the scenes again. You see the new storyboard before anything is replaced. Uses credits.'
      ) +
      '</span>' +
      '<span class="sb2-tool cd-has-tip"><button type="button" class="sb2-tool__btn is-add" data-act="add-scene" aria-label="Add a scene">' +
      ic('plus', 16) +
      '</button>' +
      tip(
        'plus',
        'Add a scene',
        'Adds Scene ' +
          (state.scenes.length + 1) +
          ' at the end, 4 seconds long. Free; it has no preview until you draw one.'
      ) +
      '</span></div>'
    );
  }

  function sbBar() {
    var c = counts();
    var miss = missingPreviews().length;
    return (
      '<section class="sb2-bar is-' +
      state.barUi +
      '"><div class="sb2-bar__card"><div class="sb2-bar__facts">' +
      sbFactBox('Length', totalDur() + 's') +
      sbFactBox('Scenes', String(state.scenes.length)) +
      sbFactBox(
        'Previews in use',
        '<b>' + (state.stale ? 0 : c.used) + '</b> of ' + c.total + ' scenes',
        'sb-used'
      ) +
      sbFactBox('Version', 'v' + state.version, 'sb-version') +
      '<div class="sb2-fact sb2-fact--mode"><span class="sb2-fact__k">How previews are made' +
      factHelp('sb-mode') +
      '</span>' +
      (locked()
        ? '<span class="sb2-fact__v">' +
          (state.previewMode === 'auto' ? 'Previews automatically' : 'Previews when I ask') +
          '</span>'
        : sbModeMenu()) +
      '</div></div>' +
      '</div>' +
      sbTools() +
      '</section>'
    );
  }

  // Rewrite with Vicino for the whole storyboard: the side-chats composer
  function sbExtras() {
    if (!state.sbRewrite || locked()) return '';
    return (
      '<section class="sb2-rw">' +
      composer({
        draft: 'rewrite',
        label: 'Rewrite the storyboard with Vicino',
        placeholder: 'What should change? e.g. Open on the boxed product, not the phone.',
        act: 'rewrite-go',
        send: 'Plan it again',
        note: 'Vicino plans the scenes again and shows you the result first. Uses credits.',
        chips: ['Open on the product', 'Shorter, 3 scenes', 'More hands, less face'],
        chipAct: 'rw-chip',
        close: 'rewrite-close',
      }) +
      '</section>'
    );
  }

  // the composer, as in side-chats: a soft grey field, suggestions over it,
  // the round ink send button at its bottom right
  function composer(o) {
    var val = state.draft[o.draft] || '';
    return (
      '<div class="sp-compose' +
      (o.card ? ' sp-card' : '') +
      '"><div class="sp-compose__head"><span class="sp-compose__ico">' +
      ic('wand', 12) +
      '</span><b>' +
      o.label +
      '</b>' +
      (o.close
        ? '<button type="button" class="sp-compose__x" data-act="' +
          o.close +
          '" aria-label="Close">' +
          ic('close', 12) +
          '</button>'
        : '') +
      '</div>' +
      (o.chips
        ? '<div class="sp-compose__chips">' +
          o.chips
            .map(function (c) {
              return (
                '<button type="button" class="sp-sugg" data-act="' +
                o.chipAct +
                '" data-arg="' +
                esc(c) +
                '">' +
                esc(c) +
                '</button>'
              );
            })
            .join('') +
          '</div>'
        : '') +
      '<div class="sp-compose__box"><textarea class="sp-compose__ta" rows="2" data-draft="' +
      o.draft +
      '" placeholder="' +
      esc(o.placeholder) +
      '">' +
      esc(val) +
      '</textarea><button type="button" class="sp-send" data-act="' +
      o.act +
      '"' +
      (o.arg != null ? ' data-arg="' + o.arg + '"' : '') +
      ' aria-label="' +
      o.send +
      '" title="' +
      o.send +
      '"' +
      (val.trim() ? '' : ' disabled') +
      '>' +
      ic('arrowUp', 15) +
      '</button></div><p class="sp-compose__note">' +
      // a note that opens on the credits label needs no coins icon of its own
      (o.note.indexOf('cd-credit') > -1 ? '' : ic('coins', 11)) +
      '<span>' +
      o.note +
      '</span></p></div>'
    );
  }

  // ---- the frame card's parts

  // a picture's label (round 78): the words on it, and on hover a card that
  // says what it means and, when something is wrong, the button that fixes
  // it. stage: the scene page's big picture, which also says when all is well
  function tagInfo(s, i, stage) {
    var u = previewUse(s);
    var n = 'Scene ' + sceneNo(i);
    var own = s.userImage && !s.imageBad;
    if (u === 'broken')
      return {
        text: 'Picture can’t be read',
        tone: 'fix',
        title: 'Your picture can’t be opened',
        say:
          'The picture you uploaded for ' +
          n +
          ' can’t be read, so it can’t go into the video. Approval stays off until you replace it or remove it.',
        acts: [
          { label: 'Use a different image', act: 'use-image-new', arg: i, ink: true },
          { label: 'Remove it', act: 'remove-image', arg: i },
        ],
      };
    if (own)
      return stage
        ? {
            text: 'Your picture',
            tone: 'ok',
            title: 'You uploaded this picture',
            say: 'It is yours, not drawn by Vicino. It goes into the video as it is.',
          }
        : null;
    if (u === 'unused') {
      if (state.stale)
        return {
          text: 'Out of date · look changed',
          // out of date is amber everywhere, even when it must be fixed;
          // red is kept for a picture that can't be read (round 139)
          tone: 'decide',
          title: 'Out of date: the look changed',
          say:
            'The look changed in the Brief after this preview was drawn, so no preview is used until the storyboard is updated. Approval stays off until then.',
          acts: [{ label: 'Update storyboard', act: 'update-storyboard', ink: true }],
        };
      if (state.decided[s.id])
        return {
          text: 'Words only',
          tone: 'note',
          title: 'Made from its words',
          say: 'You chose to make ' + n + ' from its words alone, so this preview isn’t used.',
          acts: [{ label: 'Draw it again', act: 'regen', arg: i, cost: true }],
        };
      if (s.preview && s.preview.state === 'refused')
        return {
          text: 'Refused by the check',
          tone: 'decide',
          title: 'Refused by the content check',
          say:
            'The content check turned this preview down, so ' +
            n +
            ' is made from its words alone. The same words get the same answer, so change what the scene shows first.',
          acts: [
            { label: 'Change the scene', act: 'open-scene', arg: i, pane: 'desc', ink: true },
            { label: 'Use the words only', act: 'decide-desc', arg: s.id },
          ],
        };
      return {
        text: 'Out of date · ' + reasonLabel(s).toLowerCase(),
        tone: 'decide',
        title: 'Out of date: ' + reasonLabel(s).toLowerCase(),
        say:
          n +
          ' changed after this preview was drawn, so the video won’t use it and makes the scene from its words alone. It may look different from this picture.',
        acts: [
          { label: 'Draw it again', act: 'regen', arg: i, ink: true, cost: true },
          { label: 'Use the words only', act: 'decide-desc', arg: s.id },
        ],
      };
    }
    if (u === 'used' && s.preview && s.preview.unsaved)
      return {
        text: 'New one not saved',
        tone: 'note',
        title: 'The new preview wasn’t saved',
        say: 'A new preview was drawn and charged, but it couldn’t be saved. The earlier preview is still in use.',
        acts: [
          { label: 'Keep the earlier one', act: 'keep-prev', arg: i, ink: true },
          { label: 'Try again', act: 'regen', arg: i, cost: true },
        ],
      };
    if (!stage) return null;
    if (u === 'used')
      return {
        text: 'Preview in use',
        tone: 'ok',
        title: 'This preview is in use',
        say: 'It matches the scene, so when the video is made ' + n + ' starts from this picture.',
      };
    if (u === 'drawing' || u === 'checking')
      return {
        text: u === 'checking' ? 'Checking…' : 'Drawing…',
        tone: 'live',
        title: u === 'checking' ? 'Checking the new preview' : 'Drawing a preview',
        say:
          u === 'checking'
            ? 'This one took longer than usual. Vicino is checking whether it was made.'
            : 'Vicino is drawing a preview from the scene’s words. About 20 seconds.',
      };
    return {
      text: 'Words only',
      tone: 'note',
      title: 'No preview yet',
      say: n + ' is made from its words alone. Draw a preview to see how it will look first.',
      acts: [{ label: 'Draw a preview', act: 'regen', arg: i, ink: true, cost: true }],
    };
  }

  function tagHtml(t, cls) {
    if (!t) return '';
    var acts = locked() ? [] : t.acts || [];
    return (
      '<span class="sb2-tagwrap' +
      (cls ? ' ' + cls : '') +
      '"><span class="sb2-tag is-' +
      t.tone +
      '"><i></i><span class="sb2-tag__vp"><span class="sb2-tag__t">' +
      esc(t.text) +
      '</span></span></span><span class="sb2-tagtip is-' +
      t.tone +
      '" role="tooltip"><span class="sb2-tagtip__in"><b>' +
      (t.tone === 'decide' || t.tone === 'fix' ? ic('warn', 13) : '') +
      t.title +
      '</b><span>' +
      t.say +
      '</span>' +
      (acts.length
        ? '<span class="sb2-tagtip__acts">' +
          acts
            .map(function (a) {
              return (
                '<button type="button" class="sb2-tagtip__btn' +
                (a.ink ? ' is-ink' : '') +
                '" data-act="' +
                a.act +
                '"' +
                (a.arg != null ? ' data-arg="' + a.arg + '"' : '') +
                (a.pane ? ' data-pane="' + a.pane + '"' : '') +
                '>' +
                a.label +
                (a.cost ? creditTag('Uses credits') : '') +
                '</button>'
              );
            })
            .join('') +
          '</span>'
        : '') +
      '</span></span></span>'
    );
  }

  // no picture: say what the scene is made from instead
  // scenes nobody has drawn a preview for yet (your own picture counts as one)
  function missingPreviews() {
    return state.scenes.filter(function (s) {
      return previewUse(s) === 'none' && !(s.userImage && !s.imageBad);
    });
  }

  // a preview on its way: the soft light sweeping over a blank frame (round
  // 124), and over it a sparkle in the theme's cyan twinkling over a quiet
  // caption (C · Mark, picked from three in round 138)
  function sbLive(u) {
    var check = u === 'checking';
    return (
      '<span class="sb2-live is-a is-lw-c' +
      (check ? ' is-check' : '') +
      '" role="status"><i class="sb2-live__sweep"></i><span class="sb2-lw-mark" aria-hidden="true"></span><span class="sb2-lw-cap">' +
      (check ? 'Checking' : 'Drawing') +
      '<small>' +
      (check ? 'the new preview' : 'the new preview \u00b7 about 20s') +
      '</small></span></span>'
    );
  }

  function sbFrameEmpty(s, u, i) {
    if (u === 'drawing' || u === 'checking') return sbLive(u);
    if (s.preview && s.preview.state === 'refused')
      return (
        '<span class="sb2-frame__none">' +
        ic('shield', 16) +
        '<b>No preview</b><small>Refused by the content check</small></span>'
      );
    return (
      '<span class="sb2-frame__none">' +
      ic('image', 16) +
      '<b>Words only</b><small>No preview drawn</small>' +
      (locked()
        ? ''
        : '<button type="button" class="sb2-drawbtn" data-act="regen" data-arg="' +
          i +
          '">' +
          ic('wand', 11) +
          'Draw a preview' +
          creditTag('Uses credits') +
          '</button>') +
      '</span>'
    );
  }

  // the frame: the portrait preview whole (A: on grey bars, as in the product;
  // B, C, D: on a soft blur of itself); the time at the top left
  // a scene's own picture (a sample here, as the prototype has no upload)
  var OWN_IMG = 'assets/ref-3.jpg';

  // who made the picture on the frame, at its bottom right (round 76): a
  // small glass disc with the icon cut out of it, cyan for a picture you
  // uploaded (as the Use my own video button), white with a faint shimmer for
  // one Vicino drew (as the Rewrite with Vicino button); a card on hover
  function sbSource(s, own, img) {
    var kind, title, say;
    if (s.userImage && s.imageBad) {
      kind = 'is-you is-bad';
      title = 'Your picture can’t be opened';
      say = 'You uploaded a picture for this scene, but it can’t be read. Replace it or remove it before you approve.';
    } else if (own) {
      kind = 'is-you';
      title = 'You uploaded this picture';
      say = 'It is yours, not drawn by Vicino. It goes into the video as it is.';
    } else if (img) {
      var inUse = previewUse(s) === 'used';
      kind = 'is-ai' + (inUse ? '' : ' is-off');
      title = 'Vicino drew this preview';
      say = inUse
        ? 'It was drawn from the scene’s words, and it is in use: the video starts this scene from this picture.'
        : 'It was drawn from the scene’s words, but it isn’t used: the scene changed after it was drawn, so the video makes this scene from its words alone.';
    } else return '';
    return (
      '<span class="sb2-srcwrap"><span class="sb2-src ' +
      kind +
      '" role="img" aria-label="' +
      title +
      '"></span><span class="sb2-srctip" role="tooltip"><b>' +
      title +
      '</b><span>' +
      say +
      '</span></span></span>'
    );
  }

  function sbFrame(s, i, opts) {
    opts = opts || {};
    var u = previewUse(s);
    var own = !!(s.userImage && !s.imageBad);
    var img = own ? OWN_IMG : s.img && u !== 'drawing' && u !== 'checking' ? s.img : null;
    var st = sceneStart(i);
    return (
      '<div class="sb2-framewrap"><div class="sb2-frame' +
      (!own && (u === 'unused' || u === 'broken') ? ' is-off' : '') +
      (u === 'broken' ? ' is-broken' : '') +
      (img ? '' : ' is-empty') +
      '">' +
      (img
        ? '<span class="sb2-frame__wash" style="background-image:url(' +
          img +
          ')"></span><img src="' +
          img +
          '" alt="Scene ' +
          sceneNo(i) +
          ' preview">'
        : sbFrameEmpty(s, u, i)) +
      '<span class="sb2-frame__time">' +
      fmtTime(st) +
      '<i></i>' +
      s.dur +
      's</span>' +
      '<span class="sb2-frame__tr">' +
      (opts.edit || '') +
      '</span>' +
      (opts.over || '') +
      '</div>' +
      // outside the frame's clip, so their cards can show whole
      tagHtml(tagInfo(s, i)) +
      sbSource(s, own, img) +
      '</div>'
    );
  }

  function sbTitle(s, i, tail) {
    return (
      '<span class="sb2-title"><i>' +
      pad(sceneNo(i)) +
      '</i><b>Scene ' +
      sceneNo(i) +
      '</b>' +
      (tail || '') +
      '</span>'
    );
  }

  function sbSpan(s, i) {
    var st = sceneStart(i);
    return '<span class="sb2-title__t">' + fmtTime(st) + '–' + fmtTime(st + s.dur) + '</span>';
  }

  function sbDesc(s) {
    return '<p class="sb2-desc">' + esc(s.text || 'Describe what the camera sees.') + '</p>';
  }

  // Edit comes with the pointer, at the scene's bottom right
  function sbEdit(i) {
    if (locked()) return '';
    return (
      '<button type="button" class="sb2-edit" data-act="open-scene" data-arg="' +
      i +
      '" aria-label="Edit Scene ' +
      sceneNo(i) +
      '">' +
      ic('pencil', 10) +
      'Edit</button>'
    );
  }

  // ---- the spoken line
  function lineWord() {
    return state.brief.voice === 'voiceover' ? 'Heard here' : 'Spoken here';
  }

  function lineFit(s) {
    var w = wordCount(s.line),
      fit = wordsFit(s.dur);
    return { w: w, fit: fit, over: w > fit };
  }

  function editingLine(i) {
    return state.lineEdit && state.lineEdit.i === i;
  }

  // the line edited where it is (round 74): click the card, type, Enter to
  // keep it (or click anywhere else); Esc puts it back. The count of words is
  // in the field; when they don't fit, the two ways out are right there. To
  // move a line, drag its card onto another scene.
  function lineEditor() {
    var e = state.lineEdit;
    var s = state.scenes[e.i];
    var w = wordCount(e.text),
      fit = wordsFit(s.dur);
    return (
      '<div class="sb2-le"><div class="sb2-le__box"><textarea class="sb2-le__ta" rows="2" data-le placeholder="' +
      (state.brief.voice === 'voiceover'
        ? 'What is heard over this scene'
        : 'What is said to camera, word for word') +
      '">' +
      esc(e.text) +
      '</textarea><span class="sb2-le__fit' +
      (w > fit ? ' is-over' : '') +
      '" title="About ' +
      fit +
      ' words fit in ' +
      s.dur +
      ' seconds.">' +
      w +
      '/' +
      fit +
      ' words</span></div>' +
      leOver(e, s, w, fit) +
      '<p class="sb2-le__keys"><kbd>Enter</kbd>save<kbd>Esc</kbd>cancel</p></div>'
    );
  }

  // what to do when the words don't fit, shown while editing
  function leOver(e, s, w, fit) {
    return (
      '<p class="sb2-le__over' +
      (w > fit ? ' is-on' : '') +
      '">' +
      ic('warn', 11) +
      '<span>More words than ' +
      s.dur +
      ' seconds hold. ' +
      (s.dur < 8
        ? '<button type="button" class="sb2-link" data-act="le-longer" title="Gives Scene ' +
          sceneNo(e.i) +
          ' more seconds, so the whole line fits.">Give the scene 8s</button>'
        : '<button type="button" class="sb2-link" data-act="le-split" title="Turns Scene ' +
          sceneNo(e.i) +
          ' into two scenes and shares the line between them.">Split the scene in two</button>') +
      ' or shorten the line.</span></p>'
    );
  }

  function editingLine(i) {
    return state.lineEdit && state.lineEdit.i === i;
  }

  function silentNote() {
    return (
      '<p class="sb2-silent">' +
      ic('mic', 12) +
      '<span><b>Silent.</b> No one speaks in this video.</span>' +
      (locked()
        ? ''
        : '<button type="button" class="sb2-link" data-act="tab" data-tab="brief">Change the voice in the Brief</button>') +
      '</p>'
    );
  }

  // the line's foot, one row: how many words fit, or what to do when they
  // don't, and the question when Vicino placed it
  function sbLineFoot(s, i) {
    var f = lineFit(s);
    var keep =
      s.lineBy && !state.decided['line-' + s.id] && !locked()
        ? '<button type="button" class="sb2-lbtn" data-act="line-keep" data-arg="' +
          i +
          '">' +
          ic('check', 10) +
          'Keep it here</button>'
        : '';
    var left =
      '<span class="sb2-fit' +
      (f.over ? ' is-over' : '') +
      '" title="About ' +
      f.fit +
      ' words fit in ' +
      s.dur +
      ' seconds.">' +
      (f.over ? ic('warn', 10) : '') +
      f.w +
      '/' +
      f.fit +
      ' words</span>';
    if (f.over && !locked())
      left +=
        s.dur < 8
          ? '<button type="button" class="sb2-link" data-act="line-longer" data-arg="' +
            i +
            '" title="Gives Scene ' +
            sceneNo(i) +
            ' more seconds, so the whole line fits.">Give the scene 8s</button>'
          : '<button type="button" class="sb2-link" data-act="split-scene" data-arg="' +
            i +
            '" title="Turns Scene ' +
            sceneNo(i) +
            ' into two scenes and shares the line between them.">Split in two</button>';
    return '<span class="sb2-lc__foot">' + left + keep + '</span>';
  }

  // C: the bubble itself is the field while its line is edited, as the
  // subtitle is in D: the count on its top row, the words, then the keys
  // (round 97)
  function bubbleEditor(s) {
    var e = state.lineEdit;
    var w = wordCount(e.text),
      fit = wordsFit(s.dur);
    return (
      '<div class="sb2-lc is-editing is-box sb2-le" data-act="le-stay"><span class="sb2-lc__k">' +
      ic(state.brief.voice === 'voiceover' ? 'mic' : 'quote', 10) +
      '<span>' +
      lineWord() +
      '</span><span class="sb2-le__fit' +
      (w > fit ? ' is-over' : '') +
      '" title="About ' +
      fit +
      ' words fit in ' +
      s.dur +
      ' seconds.">' +
      w +
      '/' +
      fit +
      ' words</span></span><textarea class="sb2-le__ta" rows="1" data-le placeholder="' +
      (state.brief.voice === 'voiceover' ? 'What is heard over this scene' : 'What is said to camera, word for word') +
      '">' +
      esc(e.text) +
      '</textarea>' +
      leOver(e, s, w, fit) +
      '<p class="sb2-le__keys"><kbd>Enter</kbd>save<kbd>Esc</kbd>cancel</p></div>'
    );
  }

  // A, B and C: the line on a card of one size under its scene
  function sbLineCard(s, i) {
    if (state.brief.voice === 'silent') return '';
    var drag = !locked() && s.line && !state.lineEdit;
    var k =
      '<span class="sb2-lc__k">' +
      ic(state.brief.voice === 'voiceover' ? 'mic' : 'quote', 10) +
      '<span>' +
      lineWord() +
      '</span>' +
      (s.lineBy ? '<em class="sb2-placed">By Vicino</em>' : '') +
      (drag
        ? '<i class="sb2-lc__grip" title="Drag this card onto another scene to move the line there.">' +
          ic('grip', 11) +
          '</i>'
        : '') +
      '</span>';
    if (editingLine(i)) return state.sblayout === 'bubble' ? bubbleEditor(s) : '<div class="sb2-lc is-editing">' + k + lineEditor() + '</div>';
    if (!s.line)
      return (
        '<div class="sb2-lc is-empty"' +
        (locked() || state.lineEdit ? '' : ' data-act="line-edit" data-arg="' + i + '"') +
        '>' +
        k +
        '<p class="sb2-lc__q">No one speaks here</p>' +
        (locked() || state.lineEdit
          ? ''
          : '<span class="sb2-lc__foot"><span class="sb2-link">' +
            ic('plus', 10) +
            'Add a line</span></span>') +
        '</div>'
      );
    return (
      '<div class="sb2-lc' +
      (lineFit(s).over ? ' is-over' : '') +
      '"' +
      (locked() ? '' : ' data-act="line-edit" data-arg="' + i + '"') +
      (drag ? ' draggable="true" data-drag-line="' + i + '"' : '') +
      ' title="Click to change the words. Drag the card onto another scene to move the line.">' +
      k +
      '<p class="sb2-lc__q">' +
      esc(s.line) +
      '</p>' +
      sbLineFoot(s, i) +
      '</div>'
    );
  }

  // D: the line on its frame as a subtitle, Spoken here small at its top left
  // D: the line on its frame as a subtitle. Its top row is Spoken here and
  // how many words fit, so the count reads as the line's; a fix, when the
  // words don't fit, sits under the words. Clicking it edits it right there,
  // in the same dark box (round 94).
  function sbSubFit(w, fit, cls) {
    return (
      '<span class="sb2-sub__fit' +
      (cls ? ' ' + cls : '') +
      (w > fit ? ' is-over' : '') +
      '" title="About ' +
      fit +
      ' words fit in this scene.">' +
      w +
      '/' +
      fit +
      ' words</span>'
    );
  }

  function sbSubEditor(s, i) {
    var e = state.lineEdit;
    var w = wordCount(e.text),
      fit = wordsFit(s.dur);
    return (
      '<div class="sb2-sub is-editing sb2-le" data-act="le-stay"><span class="sb2-sub__k">' +
      ic(state.brief.voice === 'voiceover' ? 'mic' : 'quote', 9) +
      '<span>' +
      lineWord() +
      '</span>' +
      sbSubFit(w, fit, 'sb2-le__fit') +
      '</span><textarea class="sb2-le__ta sb2-sub__ta" rows="1" data-le placeholder="' +
      (state.brief.voice === 'voiceover' ? 'What is heard over this scene' : 'What is said to camera, word for word') +
      '">' +
      esc(e.text) +
      '</textarea>' +
      leOver(e, s, w, fit) +
      '<p class="sb2-le__keys"><kbd>Enter</kbd>save<kbd>Esc</kbd>cancel</p></div>'
    );
  }

  function sbSub(s, i) {
    if (state.brief.voice === 'silent') return '';
    if (editingLine(i)) return sbSubEditor(s, i);
    if (!s.line)
      return locked() || state.lineEdit
        ? ''
        : '<button type="button" class="sb2-sub is-empty" data-act="line-edit" data-arg="' +
            i +
            '">' +
            ic('plus', 10) +
            'Add a line</button>';
    var f = lineFit(s);
    var fix =
      f.over && !locked()
        ? s.dur < 8
          ? '<button type="button" class="sb2-link" data-act="line-longer" data-arg="' +
            i +
            '" title="Gives Scene ' +
            sceneNo(i) +
            ' more seconds, so the whole line fits.">Give the scene 8s</button>'
          : '<button type="button" class="sb2-link" data-act="split-scene" data-arg="' +
            i +
            '" title="Turns Scene ' +
            sceneNo(i) +
            ' into two scenes and shares the line between them.">Split in two</button>'
        : '';
    var keep =
      s.lineBy && !state.decided['line-' + s.id] && !locked()
        ? '<button type="button" class="sb2-lbtn" data-act="line-keep" data-arg="' +
          i +
          '">' +
          ic('check', 10) +
          'Keep it here</button>'
        : '';
    var edit = !locked() && !state.lineEdit;
    return (
      '<div class="sb2-sub' +
      (f.over ? ' is-over' : '') +
      '"' +
      (edit
        ? ' role="button" tabindex="0" data-act="line-edit" data-arg="' +
          i +
          '" draggable="true" data-drag-line="' +
          i +
          '" title="Click to change the words. Drag it onto another scene to move the line."'
        : '') +
      '><span class="sb2-sub__k">' +
      ic(state.brief.voice === 'voiceover' ? 'mic' : 'quote', 9) +
      '<span>' +
      lineWord() +
      '</span>' +
      (s.lineBy ? '<em class="sb2-placed">By Vicino</em>' : '') +
      sbSubFit(f.w, f.fit) +
      '</span><span class="sb2-sub__q">' +
      esc(s.line) +
      '</span>' +
      (fix || keep
        ? '<span class="sb2-sub__acts">' + (fix ? ic('warn', 10) + '<span>Too long.</span>' + fix : '') + keep + '</span>'
        : '') +
      '</div>'
    );
  }

  function sbGal(v) {
    var sub = v === 'subtitle';
    return (
      '<div class="sb2-gal">' +
      state.scenes
        .map(function (s, i) {
          return (
            '<article class="sb2-tile" data-sc="' +
            i +
            '"><div class="sb2-tile__scene" data-act="open-scene" data-arg="' +
            i +
            '">' +
            sbFrame(s, i, { over: sub ? sbSub(s, i) : '', edit: sbEdit(i) }) +
            '<div class="sb2-tile__copy">' +
            sbTitle(s, i, sub ? sbSpan(s, i) : '') +
            sbDesc(s) +
            '</div></div>' +
            (sub ? '' : sbLineCard(s, i)) +
            '</article>'
          );
        })
        .join('') +
      '</div>' +
      (state.brief.voice === 'silent' ? silentNote() : '')
    );
  }

  function stateLabel(s) {
    var u = previewUse(s);
    if (u === 'used') return '<span class="cd-scene__state">Preview in use</span>';
    if (u === 'broken')
      return '<span class="cd-scene__state cd-scene__state--stale">Picture can\u2019t be read</span>';
    if (u === 'drawing' || u === 'checking')
      return (
        '<span class="cd-scene__state cd-scene__state--desc">' +
        (u === 'checking' ? 'Checking\u2026' : 'Drawing\u2026') +
        '</span>'
      );
    if (u === 'unused')
      return (
        '<span class="cd-scene__state cd-scene__state--stale">' +
        (state.stale ? 'Out of date · Look changed' : 'Out of date · ' + esc(reasonLabel(s))) +
        '</span>'
      );
    return '<span class="cd-scene__state cd-scene__state--desc">From description</span>';
  }

  function renderSceneCard(s, i) {
    var u = previewUse(s);
    var lineHtml;
    var voice = state.brief.voice;
    var lab = voice === 'voiceover' ? 'Heard here' : 'Spoken here';
    if (voice === 'silent') {
      lineHtml = '';
    } else if (s.line) {
      lineHtml =
        '<button type="button" class="cd-line" data-act="open-scene" data-arg="' +
        i +
        '" data-focus="line"><span class="cd-line__ico">' +
        ic(voice === 'voiceover' ? 'mic' : 'quote', 10) +
        '</span><span><span class="cd-line__lab">' +
        lab +
        (s.lineBy ? '<span class="cd-line__by">placed by Vicino</span>' : '') +
        '</span><span class="cd-line__q">“' +
        esc(s.line) +
        '”</span></span></button>';
    } else {
      lineHtml =
        '<button type="button" class="cd-line cd-line--empty" data-act="open-scene" data-arg="' +
        i +
        '" data-focus="line"><span class="cd-line__ico">' +
        ic('plus', 10) +
        '</span><span><span class="cd-line__q">No one speaks here · add a line</span></span></button>';
    }
    return (
      '<article class="cd-scene' +
      (u === 'unused' ? ' cd-scene--stale' : '') +
      '" data-scene="' +
      i +
      '">' +
      '<button type="button" class="cd-scene__frame' +
      (s.img ? '' : ' cd-scene__frame--empty') +
      (u === 'drawing' && !s.img ? ' is-drawing' : '') +
      '" data-act="open-scene" data-arg="' +
      i +
      '" aria-label="Open Scene ' +
      sceneNo(i) +
      '">' +
      (s.img
        ? '<img src="' + s.img + '" alt="">'
        : u === 'drawing'
          ? '<span class="cd-scene__drawing"><i class="cdg-dot"></i>Drawing the preview\u2026</span>'
          : '<span>No preview yet</span>') +
      stateLabel(s) +
      '<span class="cd-scene__time">' +
      fmtTime(sceneStart(i)) +
      ' · ' +
      s.dur +
      's</span>' +
      '<span class="cd-scene__open">' +
      ic('expand', 13) +
      '</span>' +
      '</button>' +
      '<div class="cd-scene__body"><div class="cd-scene__name"><i>' +
      pad(sceneNo(i)) +
      '</i>Scene ' +
      sceneNo(i) +
      '<span class="cd-scene__grip" title="Drag to reorder">' +
      ic('grip', 12) +
      '</span></div>' +
      '<p class="cd-scene__text">' +
      esc(s.text || 'Describe what the camera sees.') +
      '</p></div>' +
      lineHtml +
      '</article>'
    );
  }

  // ------------------------------------------------------------ scene page
  function sceneDraft(i) {
    var s = state.scenes[i];
    return { text: s.text, dur: s.dur, line: s.line || '', lineTo: i, ai: '', pv: '' };
  }

  function openScene(i, focus) {
    if (i < 0 || i >= state.scenes.length) return;
    if (state.unsaved && state.scene !== null && state.scene !== i) {
      // keep it simple: leaving a scene with edits saves them
      saveScene(true);
    }
    state.scene = i;
    state.tab = 'storyboard';
    state.lineEdit = null;
    state.glOpen = false;
    state.histOpen = false;
    state.lineToMenu = false;
    state.draft = sceneDraft(i);
    state.unsaved = false;
    state.paneTab = 'desc';
    state.focusLine = focus === 'line';
    render();
  }

  function renderScenePage() {
    var i = state.scene;
    var s = state.scenes[i];
    var d = state.draft;
    var u = previewUse(s);
    var stage =
      '<div class="cd-stage' +
      (u === 'unused' && !(s.userImage && !s.imageBad) ? ' cd-stage--stale' : '') +
      (u === 'broken' ? ' cd-stage--stale' : '') +
      '"><div class="cd-stage__frame">' +
      (s.userImage && !s.imageBad
        ? '<img src="' + OWN_IMG + '" alt="Your picture for Scene ' + sceneNo(i) + '">'
        : s.img
          ? '<img src="' + s.img + '" alt="Scene ' + sceneNo(i) + ' preview">'
          : '<div class="cd-stage__frame--desc"><b>No preview yet</b>This scene is made from its words during generation.</div>') +
      tagHtml(tagInfo(s, i, true), 'is-stage') +
      stageHistory(s, i) +
      '<span class="cd-scene__time">' +
      fmtTime(sceneStart(i)) +
      ' · ' +
      d.dur +
      's</span>' +
      '<button type="button" class="cd-stage__arrow cd-stage__arrow--prev" data-act="scene-prev" aria-label="Previous scene"' +
      (i === 0 ? ' disabled' : '') +
      '>' +
      ic('chevL', 18) +
      '</button>' +
      '<button type="button" class="cd-stage__arrow cd-stage__arrow--next" data-act="scene-next" aria-label="Next scene"' +
      (i === state.scenes.length - 1 ? ' disabled' : '') +
      '>' +
      ic('chevR', 18) +
      '</button>' +
      '</div><div class="cd-film">' +
      state.scenes
        .map(function (x, k) {
          return (
            '<button type="button" class="cd-film__t' +
            (k === i ? ' is-on' : '') +
            '" data-act="open-scene" data-arg="' +
            k +
            '" aria-label="Scene ' +
            sceneNo(k) +
            '">' +
            (x.img ? '<img src="' + x.img + '" alt="">' : '') +
            '<i>' +
            pad(sceneNo(k)) +
            '</i></button>'
          );
        })
        .join('') +
      '</div></div>';

    var pane =
      '<div class="cd-pane"><div class="cd-pane__tabs">' +
      paneTabs(s, i) +
      '</div><div class="cd-pane__sheet">' +
      '<div class="cd-pane__body">' +
      (state.paneTab === 'desc' ? renderDescPane(s, i) : renderPreviewPane(s, i)) +
      '</div>' +
      '<div class="cd-pane__foot">' +
      (locked()
        ? '<span class="cd-hint">Read-only \u2014 the brief is approved</span><button type="button" class="cd-btn cd-btn--ghost" data-act="close-scene" style="margin-left:auto">Done</button>'
        : qbtn('Delete scene', 'delete-scene', ' cd-qbtn--danger', 'trash')) +
      '</div></div></div>';

    return (
      '<div class="cd-view cd-view--scene"><div class="cd-scenehead">' +
      '<button type="button" class="cd-scenehead__back" data-act="close-scene">' +
      ic('arrowL', 14) +
      'Storyboard</button>' +
      '<span class="cd-scenehead__crumb">Scene <b>' +
      sceneNo(i) +
      '</b> of ' +
      state.scenes.length +
      '</span>' +
      (locked() ? '' : '<span class="cdb-editing">Editing</span>') +
      // no Unsaved label: on this page you are editing, and Save leaves it
      '<div class="cd-scenehead__nav">' +
      '<button type="button" class="cd-ibtn" data-act="scene-prev" aria-label="Previous scene"' +
      (i === 0 ? ' disabled' : '') +
      '>' +
      ic('chevL', 15) +
      '</button><span class="cd-scenehead__count">' +
      sceneNo(i) +
      ' / ' +
      state.scenes.length +
      '</span><button type="button" class="cd-ibtn" data-act="scene-next" aria-label="Next scene"' +
      (i === state.scenes.length - 1 ? ' disabled' : '') +
      '>' +
      ic('chevR', 15) +
      '</button>' +
      '<span class="cd-scenehead__keys"><kbd>←</kbd><kbd>→</kbd> scenes · <kbd>Esc</kbd> back</span>' +
      // Add a scene at the far right, the arrows' size (round 103; the strip's
      // + tile was tried and dropped in round 127)
      (locked()
        ? ''
        : '<span class="cd-scenehead__add cd-has-tip"><button type="button" class="cd-ibtn is-add" data-act="add-scene" aria-label="Add a scene">' +
          ic('plus', 15) +
          '</button>' +
          tip('plus', 'Add a scene', 'A new scene at the end, 4 seconds long. It opens here. Free.') +
          '</span>') +
      '</div></div>' +
      '<div class="cd-scenepage">' +
      stage +
      pane +
      '</div></div>'
    );
  }

  // ---- the scene page's two panes (round 73), in side-chats' language:
  // white cards with a small icon tile, a title and a chip; plain sentences;
  // ghost buttons and one ink button at the card's foot; and the composer
  // for Rewrite with Vicino.
  // each part has its own icon colour, from the Brief's palette (round 88)
  var SP_ICO = { film: 'indigo', quote: 'cyan', mic: 'cyan', image: 'violet', upload: 'sky' };

  function spCard(icon, title, chip, body, tone) {
    return (
      '<section class="sp-card' +
      (tone ? ' is-' + tone : '') +
      '"><header class="sp-card__head"><span class="sp-card__ico is-' +
      (SP_ICO[icon] || 'cyan') +
      '">' +
      ic(icon, 13) +
      '</span><b>' +
      title +
      '</b>' +
      (chip || '') +
      '</header>' +
      body +
      '</section>'
    );
  }

  function spChip(text, tone) {
    return (
      '<span class="sp-chip' +
      (tone ? ' is-' + tone : '') +
      '">' +
      (tone === 'live' ? '<i class="sp-chip__spin"></i>' : tone === 'ok' ? ic('check', 10) : '') +
      text +
      '</span>'
    );
  }

  // the length: a thin slider with three stops, 4, 6 and 8 seconds
  function lenSlider(dur) {
    var v = [4, 6, 8].indexOf(dur) > -1 ? dur : dur < 6 ? 4 : dur < 8 ? 6 : 8;
    return (
      '<div class="sp-len" style="--p:' +
      ((v - 4) / 4) * 100 +
      '%"><input type="range" class="sp-len__range" min="4" max="8" step="2" value="' +
      v +
      '" data-dur-range aria-label="Scene length in seconds"><span class="sp-len__ticks" aria-hidden="true"><i>4s</i><i>6s</i><i>8s</i></span></div>'
    );
  }

  function lenNote(dur) {
    return (
      'At ' +
      dur +
      ' seconds, about ' +
      wordsFit(dur) +
      ' spoken words fit in this scene.' +
      ([4, 6, 8].indexOf(dur) < 0 ? ' Scenes are 4, 6 or 8 seconds long; pick one.' : '')
    );
  }

  function lineCountNote(words, dur) {
    var fit = wordsFit(dur);
    if (!words) return 'No words yet. About ' + fit + ' spoken words fit in this ' + dur + '-second scene.';
    return (
      'This line has ' +
      words +
      ' word' +
      (words === 1 ? '' : 's') +
      '. About ' +
      fit +
      ' fit in this ' +
      dur +
      '-second scene.'
    );
  }

  // earlier previews of a scene (round 79): the ones drawn before the current
  // one, kept so you can go back. (The prototype shows the other scenes'
  // pictures in their place.)
  // every earlier take of a scene's preview, newest first (round 101: all
  // of them, not the last two). Each take is numbered in the order it was
  // drawn, so the one in use is the highest
  function earlierPreviews(s) {
    var p = s.preview || {};
    var n = Math.max(0, (p.attempts || 0) - 1);
    var pool = ['assets/scene-1.jpg', 'assets/scene-2.jpg', 'assets/scene-3.jpg', 'assets/scene-4.jpg'].filter(
      function (x) {
        return x !== s.img;
      }
    );
    var out = [];
    for (var k = 0; k < n; k++) out.push(pool[k % pool.length]);
    return out;
  }

  // the big picture's Earlier previews: a glass button at its bottom left,
  // and a card in two parts, the take in use and every earlier take
  function stageHistory(s, i) {
    var list = s.img ? earlierPreviews(s) : [];
    if (!list.length) return '';
    var open = state.histOpen;
    var now = list.length + 1;
    // the take in use is the latest unless an earlier one was picked again
    var inUse = (s.preview && s.preview.take) || now;
    var takes = [];
    for (var t = now; t >= 1; t--) if (t !== inUse) takes.push(t);
    return (
      '<div class="sp-hist' +
      (open ? ' is-open' : '') +
      '"><button type="button" class="sp-hist__btn" data-act="hist-toggle" aria-expanded="' +
      open +
      '" title="Earlier previews of this scene: see them and go back to one.">' +
      ic('history', 13) +
      '<span>Earlier previews</span><b>' +
      list.length +
      '</b></button>' +
      (open
        ? '<div class="sp-hist__pop"><header class="sp-hist__head"><b>Earlier previews</b><span>Scene ' +
          sceneNo(i) +
          ' · ' +
          now +
          ' takes</span></header>' +
          '<section class="sp-hist__sec"><p class="sp-hist__k">In use</p><div class="sp-hist__now"><img src="' +
          s.img +
          '" alt=""><span><b>Take ' +
          inUse +
          '</b><small>' +
          (inUse === now ? 'The latest one drawn. ' : 'Picked again from earlier. ') +
          'The video starts from it.</small></span></div></section>' +
          '<section class="sp-hist__sec"><p class="sp-hist__k">Earlier<span>Pick one to use it again.</span><em class="is-free">Free</em></p><div class="sp-hist__list">' +
          list
            .map(function (x, k) {
              return (
                '<button type="button" class="sp-hist__it" data-act="hist-pick" data-arg="' +
                k +
                '" aria-label="Use take ' +
                takes[k] +
                ' again"><span class="sp-hist__pic"><img src="' +
                x +
                '" alt=""><em>Use this</em></span><small>Take ' +
                takes[k] +
                '</small></button>'
              );
            })
            .join('') +
          '</div></section></div>'
        : '') +
      '</div>'
    );
  }

  // the scene page's two tabs (round 79): folder tabs, words only (round
  // 81), the open one white and joined to the white sheet under it
  function paneTabs(s, i) {
    // the Preview image tab carries a small orange dot while its picture
    // needs something done: out of date and not yet answered, or unreadable
    var u = previewUse(s);
    var needs = (u === 'unused' && !state.decided[s.id]) || u === 'broken';
    var tabs = [
      ['desc', 'film', 'Scene description'],
      ['preview', 'image', 'Preview image'],
    ];
    return (
      '<div class="sp-ftabs" role="tablist">' +
      tabs
        .map(function (x) {
          var on = state.paneTab === x[0];
          return (
            '<button type="button" class="sp-ftab' +
            (on ? ' is-on' : '') +
            '" data-act="pane" data-arg="' +
            x[0] +
            '" role="tab" aria-selected="' +
            on +
            '">' +
            x[2] +
            (x[0] === 'preview' && needs && !on
              ? '<i class="sp-ftab__dot" title="Something to do here"></i>'
              : '') +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  // Said in: our own menu, not the system's (round 111). The button shows
  // the scene the line is in; the menu lists every scene with its picture,
  // the one in use ticked
  function linePick(i) {
    var d = state.draft;
    var name = function (k) {
      return k === i ? 'This scene' : 'Scene ' + sceneNo(k);
    };
    var open = !!state.lineToMenu;
    return (
      '<span class="sp-pick' +
      (open ? ' is-open' : '') +
      '"><button type="button" class="sp-pick__btn" data-act="lineto-menu" aria-haspopup="listbox" aria-expanded="' +
      open +
      '" aria-label="Which scene says this line">' +
      '<span>' +
      name(d.lineTo) +
      '</span>' +
      ic(open ? 'chevU' : 'chevD', 12) +
      '</button>' +
      (open
        ? '<span class="sp-pick__menu" role="listbox">' +
          state.scenes
            .map(function (x, k) {
              var on = k === d.lineTo;
              return (
                '<button type="button" class="sp-pick__opt' +
                (on ? ' is-on' : '') +
                '" role="option" aria-selected="' +
                on +
                '" data-act="lineto-set" data-arg="' +
                k +
                '"><span class="sp-pick__pic">' +
                (x.img ? '<img src="' + x.img + '" alt="">' : '') +
                '</span><span class="sp-pick__name"><b>' +
                pad(sceneNo(k)) +
                '</b>' +
                name(k) +
                '</span>' +
                (on ? ic('check', 13) : '') +
                '</button>'
              );
            })
            .join('') +
          '</span>'
        : '') +
      '</span>'
    );
  }

  function renderDescPane(s, i) {
    var d = state.draft;
    var voice = state.brief.voice;
    var words = wordCount(d.line);
    var fit = wordsFit(d.dur);
    var over = words > fit;
    var textChanged = d.text.trim() !== s.text.trim();
    var lineChanged = (d.line || '').trim() !== (s.line || '').trim() || d.lineTo !== i;
    var impact = '';
    if (state.unsaved) {
      var bits = [];
      if (textChanged && previewUse(s) === 'used')
        bits.push('Scene ' + sceneNo(i) + '’s preview goes out of date, because it was drawn for the old words');
      if (d.lineTo !== i && voice === 'talking' && previewUse(state.scenes[d.lineTo]) === 'used')
        bits.push('Scene ' + sceneNo(d.lineTo) + '’s preview goes out of date, because someone speaks there now');
      if (lineChanged && !bits.length) bits.push('the line is written to the brief and the storyboard');
      impact =
        '<p class="sp-impact' +
        (bits.length && bits[0].indexOf('out of date') > -1 ? ' is-warn' : '') +
        '">' +
        ic('info', 12) +
        '<span><b>When you save,</b> ' +
        (bits.length ? bits.join('; ') : 'only the scene’s length changes') +
        '. Saving is free.</span></p>';
    }
    var lineCard = '';
    if (voice !== 'silent') {
      lineCard = spCard(
        voice === 'voiceover' ? 'mic' : 'quote',
        lineWord(),
        '',
        '<div class="sp-sec"><textarea class="sp-field" rows="1" data-draft="line" data-autofocus="' +
          (state.focusLine ? '1' : '0') +
          '" placeholder="' +
          (voice === 'voiceover' ? 'What is heard over this scene' : 'What is said to camera, word for word') +
          '">' +
          esc(d.line) +
          '</textarea><p class="sp-under sp-linefit' +
          (over ? ' is-over' : '') +
          '">' +
          lineCountNote(words, d.dur) +
          '</p>' +
          (over
            ? '<p class="sp-impact is-warn">' +
              ic('warn', 12) +
              '<span>' +
              (d.dur < 8
                ? 'This line has more words than a ' +
                  d.dur +
                  '-second scene can say. <button type="button" class="sb2-link" data-act="dur" data-arg="8">Make the scene 8 seconds long</button>, or shorten the line.'
                : 'This line has more words than an 8-second scene can say. Shorten it, or split the scene in two on the storyboard.') +
              '</span></p>'
            : '') +
          '</div>' +
          (d.line.trim()
            ? '<div class="sp-sec"><div class="sp-sec__head"><span class="sp-sec__k">Said in</span>' +
              linePick(i) +
              '</div><p class="sp-under">Pick another scene to move this line there.</p></div>'
            : '')
      );
    }
    return (
      '<div class="sp">' +
      spCard(
        'film',
        'What happens in the scene' + factHelp('sp-what'),
        '',
        '<div class="sp-sec"><textarea class="sp-field" rows="1" data-draft="text" placeholder="e.g. The founder turns the box in their hands, then looks straight at the camera.">' +
          esc(d.text) +
          '</textarea><p class="sp-under">Vicino uses this to make the scene. It is not shown in the video.</p></div>' +
          '<div class="sp-sec"><div class="sp-sec__head"><span class="sp-sec__k">Length</span><b class="sp-len__v">' +
          d.dur +
          ' seconds</b></div>' +
          lenSlider(d.dur) +
          '<p class="sp-under sp-len__note">' +
          lenNote(d.dur) +
          '</p></div>'
      ) +
      lineCard +
      impact +
      composer({
        draft: 'ai',
        label: 'Rewrite with Vicino',
        placeholder: 'What should change about this scene? e.g. Open on the box, not the phone.',
        act: 'ai-scene',
        send: 'Rewrite the scene',
        note: 'Vicino rewrites what the camera sees. You can undo it until you save. This uses credits.',
        chips: ['Shorter', 'Open on the product', 'More natural'],
        chipAct: 'ai-chip',
        card: true,
      }) +
      '</div>'
    );
  }

  // the Preview picture pane: what the picture is doing now in a sentence,
  // then its buttons, with what the main one costs beside it (round 79); the
  // scene's own picture; Rewrite with Vicino. Earlier previews live on the
  // picture itself, at the left
  function cost(free) {
    return (
      '<span class="sp-cost">' + (free ? '<em class="is-free">Free</em>' : creditTag('Uses credits')) + '</span>'
    );
  }

  function renderPreviewPane(s, i) {
    var u = previewUse(s);
    var p = s.preview || {};
    var n = 'Scene ' + sceneNo(i);
    var btn = function (label, act, primary, extra) {
      return (
        '<button type="button" class="sp-btn' +
        (primary ? ' is-ink' : '') +
        '" data-act="' +
        act +
        '" data-arg="' +
        i +
        '"' +
        (extra || '') +
        '>' +
        label +
        '</button>'
      );
    };
    var wordsOnly = state.decided[s.id]
      ? '<span class="sp-done">' + ic('check', 11) + 'Made from its words</span>'
      : '<button type="button" class="sp-btn" data-act="decide-desc" data-arg="' +
        s.id +
        '">Use the words only</button>';
    var chip, say, acts;
    var tone = '';
    // your own picture and Vicino's preview are one choice (round 137): with
    // yours in use, Vicino's is set aside, neither in use nor out of date
    var mine = !!(s.userImage && !s.imageBad);
    var hasPic = !!s.img && u !== 'drawing' && u !== 'checking';
    if (mine) {
      chip = spChip('Not in use');
      say =
        'Your picture is used instead, so this preview isn\u2019t. Use this one again, or have Vicino draw a new one; either puts your picture aside.';
      acts =
        (hasPic && p.state !== 'refused' ? btn('Use this preview', 'use-vicino') : '') +
        cost(false) +
        btn(hasPic ? 'Draw a new one' : 'Draw a preview', 'regen', true);
    } else if (u === 'broken') {
      chip = spChip('Can’t be read', 'fix');
      tone = 'fix';
      say =
        '<b>' +
        esc(s.userImage) +
        '</b> can’t be opened, so it can’t go into the video. Replace it or remove it. Approving can’t skip this.';
      acts = btn('Remove it', 'remove-image') + cost(true) + btn('Use a different image', 'use-image-new', true);
    } else if (u === 'drawing') {
      chip = spChip('Drawing', 'live');
      say = 'Vicino is drawing a new preview from the current words. About 20 seconds.';
      acts = '<div class="sp-skel"><i></i><i></i><i></i></div>';
    } else if (u === 'checking') {
      chip = spChip('Checking', 'live');
      say =
        'This one took longer than usual. Vicino is checking whether it was made. Until then ' +
        n +
        ' is made from its words.';
      acts = cost(false) + btn('Draw it again', 'regen', true, ' disabled');
    } else if (state.stale) {
      chip = spChip('Out of date', 'warn');
      say = 'The look changed in the Brief, so no preview is in use until the storyboard is updated.';
      acts =
        cost(false) +
        '<button type="button" class="sp-btn is-ink" data-act="update-storyboard">Update storyboard</button>';
    } else if (p.state === 'refused') {
      chip = spChip('Refused', 'warn');
      tone = 'warn';
      say =
        'The content check turned this preview down, so ' +
        n +
        ' is made from its words alone. The same words get the same answer: change what the scene shows first.';
      acts =
        wordsOnly +
        cost(true) +
        '<button type="button" class="sp-btn is-ink" data-act="pane" data-arg="desc">Change what the scene shows</button>';
    } else if (u === 'unused') {
      chip = spChip('Out of date', 'warn');
      tone = 'warn';
      say =
        '<b>Out of date.</b> ' +
        n +
        ' changed after this preview was drawn (' +
        esc(reasonLabel(s).toLowerCase()) +
        '), so the video makes the scene from its words alone and it may look different from this picture. Draw it again to bring the picture up to date, or keep using the words only.';
      acts = wordsOnly + cost(false) + btn('Draw it again', 'regen', true);
    } else if (u === 'used' && p.unsaved) {
      chip = spChip('In use · the earlier one', 'ok');
      say = 'A new preview was drawn but couldn’t be saved. It was charged. The earlier preview is still in use.';
      acts =
        cost(false) + btn('Try again', 'regen') + cost(true) + btn('Keep the earlier one', 'keep-prev', true);
    } else if (u === 'used') {
      chip = spChip('In use', 'ok');
      say =
        '<b>In use.</b> This preview matches the scene, so when the video is made, ' +
        n +
        ' starts from this picture and comes out looking like it.';
      acts = cost(false) + btn('Draw it again', 'regen', true);
    } else {
      chip = spChip('No preview');
      say = n + ' is made from its words alone. Draw a preview to see how it will look first.';
      acts = cost(false) + btn('Draw a preview', 'regen', true);
    }
    var own = spCard(
      'upload',
      mine ? 'Your own picture' : 'Use your own picture instead',
      mine ? spChip('In use', 'ok') : '',
      mine
        ? '<div class="sp-own"><span class="sp-own__img"><img src="' + OWN_IMG + '" alt=""></span><span class="sp-own__say"><b>' +
            esc(s.userImage) +
            '</b><small>Goes into the video as it is, in place of Vicino\u2019s preview.</small></span>' +
            btn('Replace', 'use-image') +
            btn('Remove', 'remove-image') +
            '</div>'
        : '<button type="button" class="sp-drop" data-act="use-image" data-arg="' +
            i +
            '"' +
            (u === 'broken' ? ' disabled' : '') +
            '><span class="sp-tile__pic sp-drop__ico"><i>' +
            ic('upload', 16) +
            '</i></span><span class="sp-tile__body"><b>Use an image</b><small>A photo of the real product, say. It goes into this scene as it is, in place of Vicino\u2019s preview.</small><span class="sp-drop__go">Choose a picture<em class="is-free">Free</em></span></span></button>'
    );
    // Rewrite works on the picture in use, Vicino's or yours (round 140)
    var rewrite = mine
      ? composer({
          draft: 'pv',
          label: 'Rewrite your picture with Vicino',
          placeholder: 'What should change in your picture? The framing stays; one thing changes.',
          act: 'ai-own',
          arg: i,
          send: 'Change my picture',
          note: creditTag('Uses credits') + ' Your original picture is kept, so you can go back to it.',
          chips: ['Warmer light', 'Cleaner background', 'Tighter crop'],
          chipAct: 'pv-chip',
          card: true,
        })
      : u === 'used'
        ? composer({
            draft: 'pv',
            label: 'Rewrite the preview with Vicino',
            placeholder: 'What should change in this picture? The framing stays; one thing changes.',
            act: 'ai-preview',
            arg: i,
            send: 'Draw the change',
            note: creditTag('Uses credits') + ' The current preview is kept in Earlier previews.',
            chips: ['Warmer light', 'Product bigger', 'Tighter crop'],
            chipAct: 'pv-chip',
            card: true,
          })
        : '<p class="sp-off">' +
          ic('wand', 12) +
          'Rewrite with Vicino works on a preview in use.</p>';
    var vic = spCard(
        'image',
        'Preview by Vicino',
        chip,
        // a tile like Your own picture's: the picture at the left, what it
        // is doing beside it, the buttons under the words (round 83)
        // the tall layout, picked from three (round 126)
        '<div class="sp-tile sp-pv is-c' +
          (mine ? ' is-aside' : u === 'unused' || u === 'broken' ? ' is-off' : '') +
          '"><span class="sp-tile__pic">' +
          (s.img && u !== 'drawing' && u !== 'checking'
            ? '<img src="' + s.img + '" alt="">'
            : '<i>' + ic(u === 'drawing' || u === 'checking' ? 'wand' : 'image', 16) + '</i>') +
          '</span><div class="sp-tile__body"><p class="sp-say">' +
          say +
          '</p><div class="sp-acts">' +
          costInside(acts) +
          '</div></div></div>',
        tone
      )
      .replace('<section class="sp-card', '<section data-swap="vicino" class="sp-card' + (mine ? ' is-aside' : ''));
    own = own.replace('<section class="sp-card', '<section data-swap="own" class="sp-card');
    // the one in use comes first; the two trade places when you switch
    return '<div class="sp">' + (mine ? own + vic : vic + own) + rewrite + '</div>';
  }

  // what a button costs goes inside it, after its label, as on the frame's
  // Draw a preview (round 99): a cost written before a button moves into it
  function costInside(html) {
    return html.replace(
      /<span class="sp-cost">([\s\S]*?)<\/span><button ([^>]*)>([\s\S]*?)<\/button>/g,
      function (m, c, attrs, label) {
        return '<button ' + attrs + '>' + label + c + '</button>';
      }
    );
  }

  // --------------------------------------------------------------- context
  function renderContext() {
    var c = D.context,
      k = D.details;
    return (
      '<div class="cd-ctx">' +
      '<section class="cd-card cd-ctx__card cd-ctx__card--chan cdb-hoverable"><div class="cd-card__head"><h3 class="cd-card__title">Channels</h3><small>1 channel · connections ready</small></div>' +
      '<div class="cd-ctx__chan"><span class="cd-chan">' +
      ic('x', 10) +
      '</span><b>X</b><span>' +
      esc(state.post.format) +
      '</span><span class="cd-state cd-state--ok">' +
      esc(c.channel.connection) +
      '</span><button type="button" class="cd-ctx__edit" data-act="noop" aria-label="Edit the X channel" title="Edit channel">' +
      ic('pencil', 12) +
      '</button></div>' +
      '<dl class="cd-rows"><div class="cd-row"><dt>Planned time</dt><dd>' +
      esc(state.when) +
      (missedTime()
        ? ' <span class="cd-tag cd-tag--decide" style="vertical-align:middle;margin-left:6px">Missed its time</span>'
        : '') +
      '</dd></div>' +
      '<div class="cd-row"><dt>Publishing</dt><dd>' +
      (state.published
        ? 'Published from Vicino'
        : missedTime() || !whenParts()
          ? 'Publishes from Vicino once a new time is set'
          : 'Publishes from Vicino at its planned time') +
      '</dd></div>' +
      '<div class="cd-row"><dt>Account</dt><dd>@shopify \u00b7 posts as the brand</dd></div>' +
      '<div class="cd-row"><dt>Format</dt><dd>' +
      (isVideo()
        ? 'Vertical video, 9:16, up to 2 minutes 20 seconds'
        : state.format === 'carousel'
          ? 'Up to 4 images in one post'
          : 'Text, up to 280 characters') +
      '</dd></div></dl>' +
      '<button type="button" class="cd-ctx__add" data-act="noop">' +
      ic('plus', 12) +
      'Add another channel</button></section>' +
      '<section class="cd-card cd-ctx__card"><div class="cd-card__head"><h3 class="cd-card__title">Tags</h3><small>Keep related posts together</small></div><div class="cd-ctx__tags">' +
      tagChips() +
      '</div></section>' +
      '<section class="cd-card cd-ctx__card"><div class="cd-card__head"><h3 class="cd-card__title">Brief details</h3></div><dl class="cd-rows">' +
      '<div class="cd-row"><dt>Content pillar</dt><dd>' +
      esc(k.pillar) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Objective</dt><dd>' +
      esc(k.objective) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Audience</dt><dd>' +
      esc(k.audience) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Theme</dt><dd>' +
      esc(k.theme) +
      '</dd></div>' +
      '<div class="cd-row"><dt>Audience segment</dt><dd>' +
      esc(k.segment) +
      '</dd></div></dl></section>' +
      '<section class="cd-card cd-ctx__card"><div class="cd-card__head"><h3 class="cd-card__title">Content checks</h3><small><span class="cd-state cd-state--ok">' +
      esc(c.checks) +
      '</span></small></div><dl class="cd-rows"><div class="cd-row"><dt>Catalog</dt><dd><span class="cd-empty">' +
      esc(c.catalog) +
      '</span> <button type="button" class="cd-link" data-act="noop">Add an entry</button></dd></div></dl></section>' +
      '</div>'
    );
  }

  // ---------------------------------------------------------------- result
  // The third tab: Generating while it runs, Review once it is made, then
  // Scheduled. One preview of the real post on the left, one narrow column of
  // facts and choices on the right, one button in the footer.
  var SLOTS = [
    { when: 'Nov 3 · 7:15 PM', note: 'Vicino’s pick · when your X audience is most active' },
    { when: 'Nov 4 · 9:00 AM', note: 'Next morning slot' },
    { when: 'Nov 5 · 12:30 PM', note: 'Same time as your other posts' },
  ];

  // the prototype's today, the same as the Calendar page's: Nov 2 2026
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var NOW_M = 10;
  var NOW_D = 2;

  function whenParts() {
    var m = /^([A-Z][a-z]{2}) (\d+) · (.*)$/.exec(state.when);
    return m ? { m: MON.indexOf(m[1]), d: parseInt(m[2], 10), time: m[3] } : null;
  }

  function missedTime() {
    var w = whenParts();
    return !state.scheduled && !!w && (w.m < NOW_M || (w.m === NOW_M && w.d < NOW_D));
  }

  function mediaKind() {
    return isVideo() ? 'Video' : state.format === 'carousel' ? 'Images' : '';
  }

  function renderResult() {
    var st = stage();
    if (st === 'brief')
      return (
        '<div class="cd-card cdr-empty"><span class="cdb-k">Step ' +
        steps() +
        ' of ' +
        steps() +
        '</span><p>The result appears here once it is generated.</p></div>'
      );
    if (st === 'generating') return renderGenerating();
    return renderReview();
  }

  // ---- generating
  var GEN_STEPS = ['Planning', 'Generating', 'Assembling', 'Finishing'];

  function genModel() {
    var p = state.genPct;
    var step = p < 12 ? 0 : p < 78 ? 1 : p < 92 ? 2 : 3;
    var list = isVideo()
      ? state.scenes
      : state.format === 'carousel'
        ? state.slides
        : [{ text: 'copy' }];
    var n = list.length || 1;
    var items = list.map(function (x, i) {
      var a = 12 + (i * 66) / n,
        b = 12 + ((i + 1) * 66) / n;
      return p >= b ? 'done' : p >= a ? 'making' : 'queued';
    });
    var making = items.indexOf('making');
    var unit = isVideo() ? 'Scene' : state.format === 'carousel' ? 'Slide' : '';
    var sub = [
      'Reading the approved brief' + (isVideo() ? ' and storyboard' : ''),
      unit
        ? unit +
          ' ' +
          (making > -1 ? making + 1 : Math.min(n, items.lastIndexOf('done') + 2)) +
          ' of ' +
          n
        : 'Writing the post',
      isVideo()
        ? 'Putting the scenes and lines together'
        : state.format === 'carousel'
          ? 'Laying out the slides'
          : 'Checking length and tags',
      'Final checks',
    ][step];
    return {
      step: step,
      items: items,
      sub: sub,
      key: step + ':' + items.join(',') + ':' + state.gen,
    };
  }

  function typedCopy() {
    var r = Math.max(0, Math.min(1, (state.genPct - 12) / 66));
    return state.copy.slice(0, Math.round(state.copy.length * r));
  }

  function genTile(img, label, st, square) {
    return (
      '<figure class="cdg-tile is-' +
      st +
      (square ? ' cdg-tile--square' : '') +
      '"><span class="cdg-tile__img">' +
      (img ? '<img src="' + img + '" alt="">' : '') +
      '</span><span class="cdg-tile__veil"></span>' +
      '<figcaption><b>' +
      label +
      '</b><span>' +
      (st === 'done'
        ? ic('check', 11) + 'Done'
        : st === 'making'
          ? state.failed
            ? ic('warn', 11) + 'Failed'
            : '<i class="cdg-dot"></i>Making…'
          : state.failed
            ? 'Not made'
            : 'Queued') +
      '</span></figcaption></figure>'
    );
  }

  function renderGenerating() {
    var g = genModel();
    var stopped = state.gen === 'stopped';
    var stopWord = state.failed ? 'Failed' : 'Stopped';
    var pct = Math.round(state.genPct);
    var made;
    if (isVideo())
      made =
        '<div class="cdg-frames">' +
        state.scenes
          .map(function (s, i) {
            return genTile(
              s.img || 'assets/scene-' + ((i % 3) + 1) + '.jpg',
              'Scene ' + sceneNo(i) + ' · ' + s.dur + 's',
              g.items[i]
            );
          })
          .join('') +
        '</div>';
    else if (state.format === 'carousel')
      made =
        '<div class="cdg-frames cdg-frames--square">' +
        state.slides
          .map(function (s, i) {
            return genTile(s.img, 'Slide ' + (i + 1), g.items[i], true);
          })
          .join('') +
        '</div>';
    else
      made =
        '<article class="cdg-tweet"><header class="cdr-x__head"><span class="cdb-av">S</span><span class="cdr-x__who"><b>Shopify</b><small>@vicinozi</small></span></header><p class="cdg-type"><span data-gen-type>' +
        esc(typedCopy()) +
        '</span><i class="cdg-caret"></i></p></article>';
    var stepsHtml =
      '<ol class="cdg-steps">' +
      GEN_STEPS.map(function (l, i) {
        var cls =
          i < g.step ? 'is-done' : i === g.step ? (stopped ? 'is-stopped' : 'is-now') : 'is-next';
        return (
          '<li class="' +
          cls +
          '"><i>' +
          (i < g.step ? ic('check', 10) : '') +
          '</i><span><b>' +
          l +
          '</b>' +
          (i === g.step ? '<small>' + esc(stopped ? stopWord + ' here' : g.sub) + '</small>' : '') +
          '</span></li>'
        );
      }).join('') +
      '</ol>';
    var check = D.result[state.format].check;
    return (
      '<div class="cdg">' +
      '<section class="cdg-stage"><header class="cdg-stage__head"><span class="cdb-k">' +
      (stopped ? stopWord : 'Being made') +
      '</span><span class="cdg-stage__say">' +
      (isVideo()
        ? state.scenes.length + ' scenes · ' + totalDur() + 's'
        : state.format === 'carousel'
          ? state.slides.length + ' slides'
          : 'One post') +
      ' · from the approved brief</span></header>' +
      made +
      '</section>' +
      '<aside class="cdg-side">' +
      '<section class="cdg-status' +
      (stopped ? ' is-stopped' : '') +
      '"><div class="cdg-status__top"><span class="cdg-orb"></span><span class="cdg-status__say"><b>' +
      (stopped ? stopWord + ' at ' + pct + '%' : 'Generating') +
      '</b><span>' +
      (state.failed
        ? 'Vicino couldn’t finish this post.'
        : stopped
          ? 'Finished parts are charged.'
          : 'Started under a minute ago · about 2 min') +
      '</span></span><span class="cdg-status__pct" data-gen-pct-text>' +
      pct +
      '%</span></div>' +
      '<div class="cdg-bar"><i data-gen-pct style="width:' +
      pct +
      '%"></i></div>' +
      stepsHtml +
      '<div class="cdg-status__foot">' +
      (stopped
        ? '<span>Generate again starts over. Cancel generation to edit the brief or storyboard first.</span>'
        : '<span>You can close this — it keeps going.</span>') +
      '</div></section>' +
      '<section class="cdb-mini"><header class="cdb-mini__head"><span class="cdb-k">Made from the brief</span></header><ul class="cdr-made">' +
      madeFrom()
        .map(function (m) {
          return '<li>' + ic('check', 11) + esc(m) + '</li>';
        })
        .join('') +
      '</ul><button type="button" class="cdb-slip__link" data-act="tab" data-tab="brief">See the brief' +
      ic('arrowR', 11) +
      '</button></section>' +
      (check
        ? '<section class="cdr-fold' +
          (state.checksOpen ? ' is-open' : '') +
          '"><button type="button" class="cdr-fold__sum" data-act="toggle-checks"><i class="cdr-dot cdr-dot--warn"></i><b>1 suggestion</b><span>from content checks</span>' +
          ic(state.checksOpen ? 'chevU' : 'chevD', 12) +
          '</button>' +
          (state.checksOpen ? '<p class="cdr-fold__body">' + esc(check) + '</p>' : '') +
          '</section>'
        : '') +
      '</aside></div>'
    );
  }

  function updateGenDom() {
    var pct = Math.round(state.genPct);
    root.querySelectorAll('[data-gen-pct]').forEach(function (el) {
      el.style.width = pct + '%';
    });
    root.querySelectorAll('[data-gen-pct-text]').forEach(function (el) {
      el.textContent = pct + '%';
    });
    root.querySelectorAll('[data-gen-ring]').forEach(function (el) {
      el.style.setProperty('--p', pct);
    });
    var t = root.querySelector('[data-gen-type]');
    if (t) t.textContent = typedCopy();
  }

  // ---- review and scheduled
  function hashtags(text) {
    return esc(text)
      .replace(/(#\w+)/g, '<span class="cdr-tag">$1</span>')
      .replace(/\n/g, '<br>');
  }

  function renderPlayer(editable) {
    var first = state.scenes[0];
    var total = totalDur();
    return (
      '<div class="cdr-media cdr-player" data-player>' +
      '<img data-player-img src="' +
      ((state.ownAsset && state.ownAsset.img) || first.img || 'assets/scene-1.jpg') +
      '" alt="">' +
      '<span class="cdr-player__sub" data-player-sub hidden></span>' +
      '<button type="button" class="cdr-player__play" data-act="play" aria-label="Play">' +
      ic('play', 18) +
      '</button>' +
      '<div class="cdr-player__bar">' +
      state.scenes
        .map(function (s, i) {
          return '<span style="flex:' + s.dur + ' 1 0"><i data-seg="' + i + '"></i></span>';
        })
        .join('') +
      '</div>' +
      '<span class="cdr-player__time" data-player-time>0:00 / ' +
      fmtTime(total) +
      '</span>' +
      (state.changed != null
        ? '<span class="cdr-new">Scene ' + sceneNo(state.changed) + ' changed</span>'
        : '') +
      mediaHover(editable) +
      reqVeil() +
      '</div>'
    );
  }

  function renderCollage(editable) {
    return (
      '<div class="cdr-media cdr-collage">' +
      state.slides
        .map(function (s, i) {
          return (
            '<button type="button" class="cdr-collage__tile" data-act="lightbox" data-arg="' +
            i +
            '" aria-label="Open image ' +
            (i + 1) +
            ' of ' +
            state.slides.length +
            '"><img src="' +
            (state.ownAsset && i === 0 ? state.ownAsset.img : s.img) +
            '" alt="">' +
            (state.changed === i ? '<span class="cdr-new">Changed</span>' : '') +
            '</button>'
          );
        })
        .join('') +
      mediaHover(editable) +
      reqVeil() +
      '</div>'
    );
  }

  function mediaHover(editable) {
    if (!editable) return '';
    return (
      '<button type="button" class="cdr-hover cdr-hover--media" data-act="req-open">' +
      ic('wand', 11) +
      'Request changes</button>'
    );
  }

  function reqVeil() {
    if (!state.req || state.req.step !== 'running') return '';
    return '<span class="cdr-veil"><i class="cdg-dot"></i>Making the change…</span>';
  }

  function xPost(editable) {
    var copy;
    if (state.copyEdit)
      copy =
        '<div class="cdr-edit"><textarea class="cd-ta" rows="6" data-draft="copy">' +
        esc(state.draft.copy != null ? state.draft.copy : state.copy) +
        '</textarea><div class="cdr-edit__foot"><button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="save-copy">Save</button><button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="cancel-copy">Cancel</button><span>Free · a new version needs approval</span></div></div>';
    else
      copy =
        '<div class="cdr-x__copy' +
        (editable ? ' is-editable' : '') +
        '"' +
        (editable ? ' data-act="edit-copy" role="button" tabindex="0"' : '') +
        '>' +
        hashtags(state.copy) +
        (editable
          ? '<span class="cdr-hover cdr-hover--copy">' + ic('pencil', 11) + 'Edit text</span>'
          : '') +
        '</div>';
    var media = isVideo()
      ? renderPlayer(editable)
      : state.format === 'carousel'
        ? renderCollage(editable)
        : '';
    return (
      '<article class="cdr-x"><span class="cdb-av cdr-x__av">S</span><div class="cdr-x__main">' +
      '<header class="cdr-x__head"><b>Shopify</b><small>@vicinozi · ' +
      (state.published ? esc(state.when.split(' · ')[0]) : 'now') +
      '</small><span class="cdr-x__more">•••</span></header>' +
      copy +
      media +
      '<footer class="cdr-x__acts"><i></i><i></i><i></i><i></i></footer>' +
      '</div></article>'
    );
  }

  function dateTile(when, ink) {
    var m = /^(\w+) (\d+) · (.*)$/.exec(when) || ['', '\u2014', '\u2014', when];
    return {
      tile:
        '<span class="cdr-date' +
        (ink ? ' cdr-date--ink' : '') +
        '"><small>' +
        m[1].toUpperCase() +
        '</small><b>' +
        m[2] +
        '</b></span>',
      time: m[3],
    };
  }

  function renderReview() {
    var st = stage();
    var editable = st === 'review' && !(state.req && state.req.step === 'running');
    var stageHtml =
      '<section class="cdr-stage"><header class="cdr-stage__head"><span class="cdr-chan">' +
      ic('x', 9) +
      'X preview</span><span class="cdr-badge' +
      (st === 'scheduled' ? ' cdr-badge--ok' : '') +
      '">' +
      (st === 'scheduled'
        ? ic('check', 10) + (state.published ? 'Published' : 'Approved')
        : 'Draft · awaiting your approval') +
      '</span></header>' +
      xPost(editable) +
      (editable
        ? '<p class="cdr-stage__hint">Hover the text or the ' +
          (mediaKind() || 'post').toLowerCase() +
          ' to change it.</p>'
        : '') +
      '</section>';
    return (
      '<div class="cdr">' +
      stageHtml +
      '<aside class="cdr-side">' +
      (st !== 'scheduled' ? reviewSide() : state.published ? publishedSide() : scheduledSide()) +
      '</aside>' +
      (state.lightbox != null ? renderLightbox() : '') +
      '</div>'
    );
  }

  function madeFrom() {
    var list = D.result[state.format].madeFrom.slice();
    if (state.ownAsset && state.format !== 'text')
      return ['Your own ' + ownWord() + ': ' + state.ownAsset.name].concat(
        list.filter(function (m) {
          return !/preview|description|scene|slide|image/i.test(m);
        })
      );
    return list;
  }

  function madeCard() {
    return (
      '<section class="cdr-card"><header class="cdr-card__head"><span class="cdb-k">Made from the brief</span><button type="button" class="cdb-jump" data-act="tab" data-tab="brief">Brief' +
      ic('arrowR', 10) +
      '</button></header><ul class="cdr-made">' +
      madeFrom()
        .map(function (m) {
          return '<li>' + ic('check', 11) + esc(m) + '</li>';
        })
        .join('') +
      '</ul></section>'
    );
  }

  function reviewSide() {
    var d = dateTile(state.when);
    var req = '';
    if (state.req) {
      if (state.req.step === 'ask')
        req =
          '<div class="cdr-req"><textarea class="cd-ta" rows="2" data-draft="req" placeholder="' +
          (isVideo()
            ? 'e.g. End on the general question, not Catalog.'
            : 'e.g. Bigger text on slide 2.') +
          '">' +
          esc(state.draft.req || '') +
          '</textarea><div class="cd-chips">' +
          (isVideo()
            ? ['End on the general question', 'Brighter light', 'Product closer']
            : ['Bigger text on slide 2', 'Warmer light', 'Tighter crop']
          )
            .map(function (c) {
              return (
                '<button type="button" class="cd-chip" data-act="req-chip" data-arg="' +
                esc(c) +
                '">' +
                c +
                '</button>'
              );
            })
            .join('') +
          '</div><div class="cdr-req__foot"><button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="req-plan">Show me first</button><button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="req-cancel">Cancel</button><span>Free until you run it</span></div></div>';
      else if (state.req.step === 'plan')
        req =
          '<div class="cdr-req cdr-req--plan"><span class="cdb-k">Vicino will</span><p>' +
          esc(state.req.plan) +
          '</p><div class="cdr-req__foot"><button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="req-run">Run it</button><button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="req-back">Change the request</button><span>Uses credits</span></div></div>';
      else
        req =
          '<div class="cdr-req"><p class="cdr-req__run"><i class="cdg-dot"></i>Making the change — the post stays as it is until it lands.</p></div>';
    }
    var check = D.result[state.format].check;
    return (
      madeCard() +
      '<section class="cdr-card"><header class="cdr-card__head"><span class="cdb-k">Goes out</span>' +
      '<button type="button" class="cd-qbtn" data-act="retime">' +
      ic('calendar', 12) +
      'Change</button></header>' +
      '<div class="cdr-when">' +
      d.tile +
      '<span class="cdr-when__say"><b>' +
      esc(d.time) +
      '</b><small>X · @vicinozi · New York</small></span></div>' +
      '</section>' +
      '<section class="cdr-card"><header class="cdr-card__head"><span class="cdb-k">Change something</span></header>' +
      '<button type="button" class="cdr-row" data-act="edit-copy"><span class="cdr-row__ico">' +
      ic('text', 13) +
      '</span><span class="cdr-row__say"><b>Post text</b><small>Caption, hashtags and link</small></span><span class="cdr-row__go">Edit</span></button>' +
      (mediaKind()
        ? '<button type="button" class="cdr-row" data-act="req-open"><span class="cdr-row__ico">' +
          ic(isVideo() ? 'layers' : 'image', 13) +
          '</span><span class="cdr-row__say"><b>' +
          mediaKind() +
          '</b><small>Describe it — see the plan before it runs</small></span><span class="cdr-row__go">Request</span></button>' +
          '<button type="button" class="cdr-row" data-act="own-open"><span class="cdr-row__ico">' +
          ic('upload', 13) +
          '</span><span class="cdr-row__say"><b>' +
          (state.ownAsset ? 'Your own ' + ownWord() : 'Use your own ' + ownWord()) +
          '</b><small>' +
          (state.ownAsset
            ? esc(state.ownAsset.name) + ' replaces what Vicino made'
            : 'Replace what Vicino made with yours, free') +
          '</small></span><span class="cdr-row__go">' +
          (state.ownAsset ? 'Change' : 'Choose') +
          '</span></button>' +
          (state.ownAsset
            ? '<button type="button" class="cdr-row cdr-row--quiet" data-act="own-clear"><span class="cdr-row__ico">' +
              ic('undo', 13) +
              '</span><span class="cdr-row__say"><b>Use what Vicino made</b><small>Switch back to the generated ' +
              ownWord() +
              '</small></span></button>'
            : '')
        : '') +
      req +
      '</section>' +
      '<section class="cdr-fold' +
      (state.checksOpen ? ' is-open' : '') +
      '"><button type="button" class="cdr-fold__sum" data-act="toggle-checks"><i class="cdr-dot' +
      (check ? ' cdr-dot--warn' : '') +
      '"></i><b>Checks &amp; context</b><span>' +
      (check ? '1 suggestion' : 'Content checks: not checked') +
      '</span>' +
      ic(state.checksOpen ? 'chevU' : 'chevD', 12) +
      '</button>' +
      (state.checksOpen
        ? '<div class="cdr-fold__body">' +
          (check
            ? '<p><b>Content checks</b> — ' + esc(check) + '</p>'
            : '<p><b>Content checks</b> — not checked yet.</p>') +
          '<p><b>Tags</b> — ' +
          (state.tags.length ? esc(tagNames()) : 'none yet') +
          '</p><button type="button" class="cdb-slip__link" data-act="noop">' +
          ic('eye', 11) +
          'Compare with the last approved version</button></div>'
        : '') +
      '</section>'
    );
  }

  // Scheduled's card once it is out: nothing left to change or undo
  function publishedSide() {
    var d = dateTile(state.when, true);
    return (
      '<section class="cdr-card cdr-card--sched"><header class="cdr-card__head"><span class="cdb-k">Published</span></header>' +
      '<div class="cdr-when cdr-when--big">' +
      d.tile +
      '<span class="cdr-when__say"><b>' +
      esc(d.time) +
      '</b><small>X · @vicinozi · New York</small></span></div>' +
      '<p class="cdr-flag cdr-flag--ok"><i></i>It went out on X.</p>' +
      '<div class="cdr-card__acts"><button type="button" class="cd-qbtn" data-act="see-on-x">' +
      ic('eye', 12) +
      'See it on X</button></div>' +
      '</section>' +
      madeCard()
    );
  }

  function scheduledSide() {
    var d = dateTile(state.when, true);
    return (
      '<section class="cdr-card cdr-card--sched"><header class="cdr-card__head"><span class="cdb-k">Scheduled</span>' +
      '<button type="button" class="cd-qbtn" data-act="retime">' +
      ic('calendar', 12) +
      'Change</button></header>' +
      '<div class="cdr-when cdr-when--big">' +
      d.tile +
      '<span class="cdr-when__say"><b>' +
      esc(d.time) +
      '</b><small>X · @vicinozi · New York</small></span></div>' +
      '<p class="cdr-flag cdr-flag--ok"><i></i>It goes out on its own.</p>' +
      '<div class="cdr-card__acts"><button type="button" class="cd-qbtn" data-act="publish-now">' +
      ic('upload', 12) +
      'Publish now</button></div>' +
      '</section>' +
      madeCard() +
      '<section class="cdr-fold' +
      (state.postedOpen ? ' is-open' : '') +
      '"><button type="button" class="cdr-fold__sum" data-act="toggle-posted"><i class="cdr-dot"></i><b>Posted it yourself?</b><span>Link the post so Vicino won’t publish it</span>' +
      ic(state.postedOpen ? 'chevU' : 'chevD', 12) +
      '</button>' +
      (state.postedOpen
        ? '<div class="cdr-fold__body"><p>If you published this on X yourself, tell Vicino which post it was. Its results count here, and Vicino won’t publish it again.</p><button type="button" class="cd-btn cd-btn--sm" data-act="mark-posted">Mark as posted</button></div>'
        : '') +
      '</section>' +
      '<button type="button" class="cdr-reopen" data-act="reopen-edit">' +
      ic('undo', 12) +
      'Reopen for edit</button>'
    );
  }

  function renderLightbox() {
    var i = state.lightbox;
    var n = state.slides.length;
    return (
      '<div class="cdr-lb" data-act="lb-close"><img src="' +
      state.slides[i].img +
      '" alt="Image ' +
      (i + 1) +
      '"><button type="button" class="cd-stage__arrow cd-stage__arrow--prev" data-act="lb-step" data-arg="-1"' +
      (i === 0 ? ' disabled' : '') +
      '>' +
      ic('chevL', 18) +
      '</button><button type="button" class="cd-stage__arrow cd-stage__arrow--next" data-act="lb-step" data-arg="1"' +
      (i === n - 1 ? ' disabled' : '') +
      '>' +
      ic('chevR', 18) +
      '</button><span class="cdr-lb__n">' +
      (i + 1) +
      ' / ' +
      n +
      '</span></div>'
    );
  }

  // the video preview plays the scenes in time, with each line as a subtitle
  var playTimer = null;
  function play() {
    var el = root.querySelector('[data-player]');
    if (!el) return;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
      el.classList.remove('is-playing');
      return;
    }
    el.classList.add('is-playing');
    var t = 0;
    var total = totalDur();
    playTimer = setInterval(function () {
      var p = root.querySelector('[data-player]');
      if (!p) {
        clearInterval(playTimer);
        playTimer = null;
        return;
      }
      t += 0.1;
      if (t >= total) {
        clearInterval(playTimer);
        playTimer = null;
        p.classList.remove('is-playing');
        t = 0;
      }
      var acc = 0,
        cur = 0;
      for (var i = 0; i < state.scenes.length; i++) {
        if (t < acc + state.scenes[i].dur) {
          cur = i;
          break;
        }
        acc += state.scenes[i].dur;
      }
      var s = state.scenes[cur];
      var img = p.querySelector('[data-player-img]');
      var src = s.img || 'assets/scene-' + ((cur % 3) + 1) + '.jpg';
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      var sub = p.querySelector('[data-player-sub]');
      sub.hidden = !s.line;
      sub.textContent = s.line || '';
      var a2 = 0;
      state.scenes.forEach(function (x, k) {
        var f = p.querySelector('[data-seg="' + k + '"]');
        var w = Math.max(0, Math.min(1, (t - a2) / x.dur));
        if (f) f.style.width = w * 100 + '%';
        a2 += x.dur;
      });
      p.querySelector('[data-player-time]').textContent =
        fmtTime(Math.floor(t)) + ' / ' + fmtTime(total);
    }, 100);
  }

  // ------------------------------------------------------------------ foot
  // The footer's main button is the page's one next step: a kicker that says
  // so, what it costs, and the button itself with a forward arrow.
  // ---- the next step's choices (round 32): Vicino makes it, with or without
  // previews, or you use your own. Side by side, or under the button on hover.
  // the three ways to go on, as one list (two for a carousel)
  function modeOptions() {
    if (state.nextUi === 'split')
      return modeOptionsAll().filter(function (o) {
        return o[0] !== 'own';
      });
    return modeOptionsAll();
  }

  function modeOptionsAll() {
    if (isVideo())
      return [
        [
          'auto',
          'Image previews made automatically',
          'A preview picture of each scene, right after planning',
          'Uses credits',
          'wand',
        ],
        [
          'ask',
          'Image previews only when I ask',
          'Scenes show their description until you ask',
          'Free',
          'image',
        ],
        ['own', 'Use my own video', 'Upload or pick from your Library', 'Free', 'upload'],
      ];
    return [
      ['vicino', 'Vicino draws the images', 'When the post is generated', 'Uses credits', 'wand'],
      ['own', 'Use my own images', 'Upload or pick from your Library', 'Free', 'upload'],
    ];
  }

  function modeNow() {
    if (state.planChoice === 'own' && state.nextUi !== 'split') return 'own';
    return isVideo() ? state.previewMode : 'vicino';
  }

  function modeRows(cls) {
    var cur = modeNow();
    return (
      '<div class="cd-modes ' +
      cls +
      '" role="radiogroup" aria-label="How this post is made">' +
      modeOptions()
        .map(function (o) {
          var on = cur === o[0];
          return (
            '<button type="button" class="cd-mode' +
            (on ? ' is-on' : '') +
            (o[0] === 'own' ? ' is-own' : '') +
            '" data-act="pick-mode" data-arg="' +
            o[0] +
            '" role="radio" aria-checked="' +
            on +
            '"><span class="cd-mode__ico">' +
            ic(o[4], 13) +
            '</span><span class="cd-mode__say"><b>' +
            o[1] +
            '</b><small>' +
            o[2] +
            '</small></span>' +
            (o[3] === 'Free' ? '<span class="cd-mode__cost is-free">Free</span>' : creditTag(o[3])) +
            (on ? '<span class="cd-mode__tick">' + ic('check', 11) + '</span>' : '<span class="cd-mode__tick"></span>') +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  // the first-visit tip: points at the menu, says your own video is there
  function coachCard() {
    return (
      '<div class="cd-coach" role="dialog" aria-label="Tip"><span class="cd-coach__ico">' +
      ic('upload', 14) +
      '</span><span class="cd-coach__say"><b>Have your own ' +
      ownWord() +
      '?</b><small>' +
      (state.nextUi === 'split'
        ? 'Use it here instead: upload it or pick it from your Library, and skip the storyboard.'
        : 'Switch here to upload it or pick it from your Library, instead of Vicino making one.') +
      '</small></span>' +
      // with the round button beside it the button itself is the way in, so
      // Show me only stays where the tip points at the menu (round 112)
      '<span class="cd-coach__acts">' +
      (state.nextUi === 'split'
        ? ''
        : '<button type="button" class="cd-coach__try" data-act="coach-try">Show me</button>') +
      '<button type="button" class="cd-coach__ok" data-act="coach-done">Got it</button></span>' +
      '<i class="cd-coach__arrow"></i></div>'
    );
  }

  // the prototype shows the tip again on every load (Zi, round 46)
  var coachDone = false;
  function coachSeen(v) {
    if (v === undefined) return coachDone;
    coachDone = !!v;
  }

  var coachTimer = null;
  function showCoach(delay) {
    clearTimeout(coachTimer);
    coachTimer = setTimeout(function () {
      // not behind a closed drawer: try again when a post opens
      if (!state.open) {
        coachTimer = null;
        return;
      }
      if (!choosing() || state.modal || state.modeMenu) return;
      state.coach = true;
      render();
      var el = root.querySelector('.cd-coach');
      if (el && gsapOk && !reduced)
        gsap.from(el, { y: 8, opacity: 0, scale: 0.97, duration: 0.45, ease: 'power3.out', transformOrigin: '80% 100%' });
    }, delay);
  }

  function dropCoach() {
    if (!state.coach) return;
    state.coach = false;
    coachSeen(true);
  }

  // A · beside the button: a small menu that names the choice and its cost
  function modeMenu() {
    var cur = modeOptions().filter(function (o) {
      return o[0] === modeNow();
    })[0];
    var short = {
      auto: 'Previews automatically',
      ask: 'Previews when I ask',
      own: 'My own ' + ownWord(),
      vicino: 'Vicino draws them',
    }[cur[0]];
    return (
      '<div class="cd-modemenu' +
      (state.modeMenu ? ' is-open' : '') +
      (state.coach && state.nextUi !== 'split' ? ' is-coached' : '') +
      '"><button type="button" class="cd-modemenu__btn" data-act="mode-menu" aria-expanded="' +
      !!state.modeMenu +
      '" title="How this post is made">' +
      ic(cur[4], 12) +
      '<span>' +
      short +
      '</span>' +
      (cur[3] === 'Free' ? '<em class="is-free">Free</em>' : creditTag(cur[3])) +
      ic(state.modeMenu ? 'chevD' : 'chevU', 11) +
      '</button>' +
      (state.modeMenu
        ? '<div class="cd-modemenu__pop"><p class="cd-nextpop__k">How this post is made</p>' +
          modeRows('is-menu') +
          '</div>'
        : state.coach && state.nextUi !== 'split'
          ? coachCard()
          : '') +
      '</div>'
    );
  }

  // B: Use my own video as a round button after the next step, "or" between
  // them; it opens the picker straight away, and says what it does on hover
  function ownPick() {
    return (
      '<span class="cd-ownpick' +
      (state.coach ? ' is-coached' : '') +
      '"><span class="cd-ownpick__or" aria-hidden="true">or</span><span class="cd-ownpick__wrap cd-has-tip"><button type="button" class="cd-ownpick__btn" data-act="own-open" aria-label="Use my own ' +
      ownWord() +
      '">' +
      ic('upload', 15) +
      '</button>' +
      (state.coach
        ? ''
        : tip(
            'upload',
            'Use my own ' + ownWord(),
            'Instead of ' +
              (isVideo() ? 'planning a storyboard' : 'Vicino drawing them') +
              ': upload ' +
              (isVideo() ? 'a video' : 'images') +
              ' or pick from your Library. Vicino then writes only the post text. Free.'
          )) +
      (state.coach ? coachCard() : '') +
      '</span></span>'
    );
  }

  function choosing() {
    return (
      !state.planning &&
      stage() === 'brief' &&
      !isEditing() &&
      !state.ownAsset &&
      state.scene === null &&
      ((isVideo() && !state.planned && !state.drawing) || state.format === 'carousel')
    );
  }

  function ownRibbon() {
    return (
      '<div class="cd-ownbar"><span class="cd-ownbar__img"><img src="' +
      state.ownAsset.img +
      '" alt=""></span><span class="cd-ownbar__say"><b>Your own ' +
      ownWord() +
      '</b><small>' +
      esc(state.ownAsset.name) +
      ' \u00b7 used as it is</small></span>' +
      '<button type="button" class="cdb-cbtn" data-act="own-open">Change</button>' +
      '<button type="button" class="cdb-cbtn cdb-cbtn--text" data-act="own-clear">Let Vicino make it</button></div>'
    );
  }

  function creditTag(text) {
    return '<span class="cd-credit"><i class="cd-credit__ico">' + ic('coins', 10) + '</i>' + text + '</span>';
  }

  // the next step: one quiet line of what it costs, then the button
  function cta(label, attrs, cost, opts) {
    opts = opts || {};
    cost = String(cost || '').replace(/^Uses credits/, function () {
      return creditTag('Uses credits');
    });
    return (
      '<div class="cd-cta' +
      (opts.disabled ? ' is-off' : '') +
      (opts.loading ? ' is-loading' : '') +
      '">' +
      (opts.lead || '') +
      (cost ? '<span class="cd-cta__cost">' + cost + '</span>' : '') +
      (opts.alt || '') +
      '<button type="button" class="cd-btn cd-btn--primary cd-cta__btn' +
      (opts.blocked ? ' is-blocked' : '') +
      (opts.beat && !reduced ? ' is-beat' : '') +
      (state.nudge && !opts.disabled && !opts.blocked ? ' is-nudging' : '') +
      '" ' +
      attrs +
      (opts.disabled ? ' disabled' : '') +
      '>' +
      label +
      (opts.loading
        ? '<span class="cd-cta__arrow is-loading"><i class="cd-cta__spin"></i></span>'
        : '<span class="cd-cta__arrow">' + ic('arrowR', 12) + '</span>') +
      '</button>' +
      (opts.after || '') +
      '</div>'
    );
  }

  function primaryButton() {
    var editing = isEditing();
    var st = stage();
    if (state.gen === 'running')
      return (
        '<div class="cd-genfoot"><span class="cd-genfoot__ring" style="--p:' +
        Math.round(state.genPct) +
        '" data-gen-ring></span><span class="cd-genfoot__say"><b>Generating \u00b7 <span data-gen-pct-text>' +
        Math.round(state.genPct) +
        '%</span></b><span>Keeps going if you close this</span></span>' +
        // the footer's button is Stop while it runs (round 79)
        '<button type="button" class="cd-btn cd-btn--white cd-genfoot__stop" data-act="stop">' +
        ic('stop', 12) +
        'Stop</button></div>'
      );
    if (state.gen === 'stopped')
      return cta('Generate again', 'data-act="approve"', 'Uses credits \u00b7 starts over', {
        kicker: 'Next step',
        // or leave generating and go back to change the brief or storyboard
        alt: '<button type="button" class="cd-btn cd-btn--ghost cd-cta__cancel" data-act="gen-cancel">Cancel generation</button>',
      });
    if (st === 'review') {
      if (state.req && state.req.step === 'running')
        return cta('Approve &amp; schedule', '', 'Wait for the change to finish', {
          disabled: true,
        });
      return cta(
        'Approve &amp; schedule',
        'data-act="approve-schedule"',
        missedTime()
          ? 'X needs a new time \u2014 you pick it next'
          : whenParts()
            ? 'Goes out ' + esc(state.when)
            : 'No date yet \u2014 you pick it next',
        { kicker: 'Step ' + steps() + ' of ' + steps() }
      );
    }
    if (st === 'scheduled') {
      return (
        '<div class="cd-done">' +
        ic('check', 14) +
        '<span><b>' +
        (state.published ? 'Published' : 'Scheduled') +
        '</b> \u00b7 ' +
        (state.published ? 'went out ' : 'goes out ') +
        esc(state.when) +
        '</span></div>'
      );
    }
    if (choosing() && state.nextUi === 'split') {
      var leadB = modeMenu();
      if (isVideo())
        return cta('Plan the storyboard', 'data-act="plan"', '', { lead: leadB, after: ownPick(), beat: true });
      return cta('Approve &amp; generate', 'data-act="approve"', '', { lead: leadB, after: ownPick(), beat: true });
    }
    if (choosing()) {
      var lead = modeMenu();
      if (state.planChoice === 'own')
        return cta('Choose my ' + ownWord(), 'data-act="own-open"', '', { lead: lead, beat: true });
      if (isVideo()) return cta('Plan the storyboard', 'data-act="plan"', '', { lead: lead, beat: true });
      return cta('Approve &amp; generate', 'data-act="approve"', '', { lead: lead, beat: true });
    }
    if (!isVideo() && !editing) {
      var dq = openTodos().filter(function (t) {
        return t.kind === 'decide';
      }).length;
      return cta(
        'Approve &amp; generate',
        'data-act="approve"',
        'Uses credits \u00b7 ' +
          (dq ? dq + ' question' + (dq > 1 ? 's' : '') + ' first' : 'starts generation'),
        { kicker: 'Step 1 of 2' }
      );
    }
    // editing the brief: Save and Cancel take the next step's place
    if (state.edit === 'who' || state.edit === 'plan')
      return (
        '<div class="cd-cta cd-cta--edit"><span class="cd-cta__cost">Saves to the brief \u00b7 <b>Free</b></span>' +
        '<button type="button" class="cd-btn cd-btn--ghost cd-cta__cancel" data-act="cancel-edit">Cancel</button>' +
        '<button type="button" class="cd-btn cd-btn--primary cd-cta__btn" data-act="' +
        (state.edit === 'who' ? 'save-who' : 'save-plan') +
        '">Save changes</button></div>'
      );
    // editing a scene is the same: Save and Cancel where the next step was
    if (state.scene !== null && !locked())
      return (
        '<div class="cd-cta cd-cta--edit"><span class="cd-cta__cost">' +
        (state.unsaved ? 'Saves to the storyboard \u00b7 <b>Free</b>' : 'No changes yet') +
        '</span>' +
        '<button type="button" class="cd-btn cd-btn--ghost cd-cta__cancel" data-act="scene-cancel">Cancel</button>' +
        '<button type="button" class="cd-btn cd-btn--primary cd-cta__btn" data-act="scene-save">Save changes</button></div>'
      );
    if (state.planning)
      return cta('Review storyboard', '', 'Planning the storyboard\u2026', {
        disabled: true,
        loading: true,
      });
    if (state.drawing && state.tab === 'brief' && state.scene === null)
      return cta('Review storyboard', 'data-act="tab" data-tab="storyboard"', 'Previews are still drawing', {
        loading: true,
      });
    if (state.drawing && !editing)
      return cta('Approve &amp; generate', '', 'Wait for the previews to land', {
        loading: true,
        disabled: true,
        kicker: 'Step 3 of 3',
      });
    // while editing the button stays where it is; trying it explains why it waits
    if (editing)
      return cta(
        state.tab === 'brief' && state.scene === null
          ? isVideo()
            ? state.planned
              ? 'Review storyboard'
              : 'Plan the storyboard'
            : 'Approve &amp; generate'
          : 'Approve &amp; generate',
        'data-act="blocked-next"',
        state.tab === 'brief' && state.scene === null && isVideo() && state.planned
          ? 'Free \u00b7 nothing is generated yet'
          : 'Uses credits',
        { blocked: true }
      );
    if (state.ownAsset && state.format !== 'text')
      return cta(
        'Approve &amp; generate',
        'data-act="approve"',
        'Uses credits \u00b7 the post text only; your ' + ownWord() + ' as it is'
      );
    if (!state.planned)
      return cta('Plan the storyboard', 'data-act="plan"', 'Uses credits \u00b7 you choose previews next');
    if (state.stale)
      return cta(
        'Update storyboard',
        'data-act="update-storyboard"',
        'Uses credits \u00b7 approval is off until then'
      );
    if (state.tab === 'brief' && state.scene === null)
      return cta(
        'Review storyboard',
        'data-act="tab" data-tab="storyboard"',
        'Free \u00b7 nothing is generated yet'
      );
    if (state.tab === 'context' && state.scene === null)
      return cta('Back to the storyboard', 'data-act="tab" data-tab="storyboard"', 'Free');
    var c = counts();
    // a picture that can't be read blocks approval: no confirm can skip it
    if (c.fix.length)
      return cta(
        'Approve &amp; generate',
        'data-act="blocked-fix"',
        'Fix Scene ' + c.fix.map(sceneNo).join(', ') + '\u2019s picture first',
        { kicker: 'Step 3 of 3', blocked: true }
      );
    return cta(
      'Approve &amp; generate',
      'data-act="approve"',
      'Uses credits \u00b7 ' +
        (c.asks ? c.asks + ' question' + (c.asks > 1 ? 's' : '') + ' first' : 'starts generation'),
      { kicker: 'Step 3 of 3' }
    );
  }

  // ---- Rewrite with Vicino: a chat docked beside the drawer, as in the product
  var VCHAT_ASKS = [
    [
      'Make the main message sharper',
      'coreIdea',
      'The main message',
      'Before you chase AI shopping results, check what your own product needs to be found.',
      'Here\u2019s a sharper main message: shorter, and it names the action.',
    ],
    [
      'Speak to larger commerce teams',
      'audience',
      'Target audience',
      'Commerce teams checking whether their catalog is ready for AI discovery.',
      'Here\u2019s the audience widened from founders to commerce teams.',
    ],
    [
      'A lighter call to action',
      'cta',
      'Call to action',
      'Tell us the one product you\u2019d check first.',
      'Here\u2019s a lighter call to action, one small ask.',
    ],
  ];

  function vchatSend(text, k) {
    text = (text || '').trim();
    if (!text || !state.vchat) return;
    var ask = k != null ? VCHAT_ASKS[parseInt(k, 10)] : VCHAT_ASKS[0];
    state.vchat.msgs.push({ who: 'u', text: esc(text) });
    state.vchat.msgs.push({ who: 'v', typing: true });
    state.draft.vchat = '';
    render();
    setTimeout(function () {
      if (!state.vchat) return;
      state.vchat.msgs.pop();
      state.vchat.msgs.push({
        who: 'v',
        text:
          ask[4] +
          (k == null ? ' I read your note as a sharper message.' : '') +
          ' Nothing changes until you apply it.',
        proposal: { field: ask[1], label: ask[2], from: state.brief[ask[1]], to: ask[3], state: 'open' },
      });
      render();
    }, 1100);
  }

  function vchatApply(i) {
    var m = state.vchat.msgs[i];
    state.brief[m.proposal.field] = m.proposal.to;
    m.proposal.state = 'applied';
    bump('who');
    toast('<b>Brief updated.</b> ' + esc(m.proposal.label) + ' changed \u00b7 free.');
    render();
  }

  function renderVchat() {
    var v = state.vchat;
    var asked = v.msgs.some(function (m) {
      return m.who === 'u';
    });
    return (
      '<aside class="cd-vchat" role="dialog" aria-label="Edit the brief with Vicino">' +
      '<header class="cd-vchat__head"><span class="cd-vchat__orb"></span><span class="cd-vchat__who"><b>Vicino</b><small>Edit the brief</small></span>' +
      '<button type="button" class="cd-ibtn" data-act="vchat-close" aria-label="Close">' +
      ic('close', 14) +
      '</button></header>' +
      '<div class="cd-vchat__log">' +
      v.msgs
        .map(function (m, i) {
          if (m.typing)
            return '<div class="cd-vmsg is-v is-typing"><i></i><i></i><i></i></div>';
          var p = m.proposal;
          return (
            '<div class="cd-vmsg is-' +
            m.who +
            '"><p>' +
            m.text +
            '</p>' +
            (p
              ? '<div class="cd-vprop is-' +
                p.state +
                '"><span class="cd-vprop__k">' +
                esc(p.label) +
                '</span><p class="cd-vprop__from">' +
                esc(p.from) +
                '</p><p class="cd-vprop__to">' +
                esc(p.to) +
                '</p>' +
                (p.state === 'open'
                  ? '<div class="cd-vprop__acts"><button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="vchat-apply" data-arg="' +
                    i +
                    '">Apply to the brief</button><button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="vchat-keep" data-arg="' +
                    i +
                    '">Keep current</button></div>'
                  : '<span class="cd-vprop__done">' +
                    (p.state === 'applied' ? ic('check', 11) + 'Applied to the brief' : 'Kept the current one') +
                    '</span>') +
                '</div>'
              : '') +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="cd-vchat__foot">' +
      (asked
        ? ''
        : '<div class="cd-vchat__asks">' +
          VCHAT_ASKS.map(function (a, i) {
            return (
              '<button type="button" class="cd-vchat__ask" data-act="vchat-send" data-arg="' +
              i +
              '">' +
              a[0] +
              '</button>'
            );
          }).join('') +
          '</div>') +
      // the composer as in draft/side-chats (Paper): what is being edited as
      // a small glass card, the words, then the send disc at the right
      '<div class="cd-vchat__form' +
      (v.noCtx ? '' : ' has-tg') +
      '">' +
      (v.noCtx
        ? ''
        : '<span class="cd-vchat__tg"><span class="cd-vchat__tile" style="background-image:url(' +
          ((state.scenes[0] && state.scenes[0].img) || 'assets/scene-1.jpg') +
          ')"></span><span class="cd-vchat__tgtext"><span class="cd-vchat__kicker">Editing a brief</span><span class="cd-vchat__name">' +
          esc(state.post.title) +
          '</span></span><button type="button" class="cd-vchat__tgx" data-act="vchat-ctx-clear" aria-label="Stop editing this brief">' +
          ic('close', 10) +
          '</button></span>') +
      '<div class="cd-vchat__box"><textarea class="cd-ta" rows="1" data-draft="vchat" placeholder="Tell Vicino what to change\u2026">' +
      esc(state.draft.vchat || '') +
      '</textarea><span class="cd-vchat__row"><button type="button" class="cd-vchat__send" data-act="vchat-send" aria-label="Send">' +
      ic('arrowUp', 13) +
      '</button></span></div></div>' +
      '</div></aside>'
    );
  }

  // a short notice floating at the top of the drawer; on a click it also takes
  // you to the Save button and makes it glow
  var flashTimer = null;
  function blockedNext(go) {
    var panel = root.querySelector('.post-drawer__panel');
    if (!panel) return;
    var f = panel.querySelector('.cd-flash');
    if (!f) {
      f = document.createElement('div');
      f.className = 'cd-flash';
      f.setAttribute('role', 'status');
      f.innerHTML =
        '<span class="cd-flash__ico">' +
        ic('pencil', 12) +
        '</span><span><b>Save or cancel your edits first</b><small>' +
        (state.scene !== null
          ? 'This scene has changes that aren\u2019t saved yet.'
          : 'Your changes to the brief aren\u2019t saved yet.') +
        '</small></span>';
      panel.appendChild(f);
      requestAnimationFrame(function () {
        f.classList.add('is-in');
      });
    }
    clearTimeout(flashTimer);
    flashTimer = setTimeout(
      function () {
        f.classList.remove('is-in');
        setTimeout(function () {
          if (f.parentNode) f.parentNode.removeChild(f);
        }, 260);
      },
      go ? 2800 : 2000
    );
    if (!go) return;
    var save = root.querySelector(
      '[data-act="save-who"], [data-act="save-plan"], [data-act="save-scene"]'
    );
    if (!save) return;
    save.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    var row = save.closest('.cdb-editfoot') || save;
    row.classList.remove('is-attn');
    void row.offsetWidth;
    row.classList.add('is-attn');
    setTimeout(function () {
      row.classList.remove('is-attn');
    }, 1800);
  }

  function renderFoot() {
    var st = stage();
    var ribbon = '';
    if (st === 'brief' && state.tab === 'storyboard' && state.planned && state.scene === null && !state.ownAsset)
      ribbon = renderTimeline();
    // the Your video page already shows it, so the strip is for the other tabs
    else if (
      st === 'brief' &&
      state.ownAsset &&
      state.format !== 'text' &&
      state.scene === null &&
      !(isVideo() && state.tab === 'storyboard')
    )
      ribbon = ownRibbon();
    var gate =
      st === 'review'
        ? {
            lab: 'Content approval',
            b: 'Ready for your approval',
            sub: 'Once approved, it goes out at its time',
            dot: true,
          }
        : st === 'scheduled'
          ? {
              lab: 'Content approval',
              b: 'Approved',
              sub: 'Scheduled for ' + state.when,
              dot: false,
            }
          : state.gen
            ? {
                lab: 'Brief approval',
                b: 'Approved',
                sub: 'Generation authorised',
                dot: false,
              }
            : {
                lab: 'Brief approval',
                b: 'Waiting on you',
                sub: 'One approval starts generation',
                dot: true,
              };
    // one row: who approves and where it stands, comment, when it goes out,
    // then what the next step costs and the button
    return (
      '<div class="cd-foot"><div class="cd-foot__ribbon">' +
      ribbon +
      '</div><div class="cd-foot__bar">' +
      // who approves and Comment share one pill (round 113)
      '<span class="cd-fpair"><button type="button" class="cd-fchip" data-act="gate" title="' +
      esc(gate.sub) +
      '"><span class="cd-gate__avatar"><img src="assets/approver.png" alt="">' +
      (gate.dot ? '<i></i>' : '') +
      '</span><span class="cd-fchip__txt"><span>' +
      gate.lab +
      '</span><b>' +
      gate.b +
      '</b></span></button>' +
      '<button type="button" class="cd-ibtn cd-fchip__ib" data-act="comment" title="Comment" aria-label="Comment">' +
      ic('comment', 14) +
      '</button></span>' +
      (st === 'brief'
        ? '<button type="button" class="cd-fchip cd-fchip--when" data-act="when" title="Change when it goes out">' +
          ic('calendar', 14) +
          '<span class="cd-fchip__txt"><b>' +
          esc(state.when) +
          '</b></span>' +
          ic('chevD', 12) +
          '</button>'
        : '') +
      '<span class="cd-foot__grow"></span>' +
      '<div class="cd-foot__acts">' +
      primaryButton() +
      '</div></div></div>'
    );
  }

  function renderTimeline() {
    var total = totalDur();
    var ticks = [];
    for (var t = 0; t <= total; t += 5)
      ticks.push('<span style="left:' + (t / total) * 100 + '%">' + t + 's</span>');
    return (
      '<div class="cd-tl' +
      (state.tl ? ' is-open' : '') +
      '">' +
      '<div class="cd-tl__strip"><div class="cd-tl__mini"><b>Timeline</b><span>' +
      total +
      's video · ' +
      state.scenes.length +
      ' scenes · ' +
      counts().used +
      ' of ' +
      state.scenes.length +
      ' previews in use' +
      (state.captions.length ? ' · ' + state.captions.length + ' caption' : '') +
      '</span><button type="button" class="cd-ibtn" data-act="toggle-tl" aria-label="' +
      (state.tl ? 'Fold the timeline' : 'Open the timeline') +
      '">' +
      ic(state.tl ? 'chevD' : 'chevU', 14) +
      '</button></div>' +
      '<div class="cd-tl__body"><div class="cd-tl__ticks">' +
      ticks.join('') +
      '</div>' +
      '<div class="cd-tl__lane"><span class="cd-tl__lab">Scenes</span><div class="cd-tl__blocks">' +
      state.scenes
        .map(function (s, i) {
          return (
            '<button type="button" class="cd-tl__block' +
            (previewUse(s) === 'unused' ? ' cd-tl__block--stale' : '') +
            '" style="flex:' +
            s.dur +
            ' 1 0" data-act="open-scene" data-arg="' +
            i +
            '">' +
            (s.img ? '<img src="' + s.img + '" alt="">' : '') +
            '<span>Scene ' +
            sceneNo(i) +
            '</span><small>' +
            s.dur +
            's</small></button>'
          );
        })
        .join('') +
      '</div></div>' +
      '<div class="cd-tl__lane"><span class="cd-tl__lab">Captions</span><div class="cd-tl__blocks">' +
      (state.captions.length
        ? '<span style="flex:' +
          (total - state.captions[0].dur) +
          ' 1 0"></span><span class="cd-tl__cap" style="flex:' +
          state.captions[0].dur +
          ' 1 0" title="' +
          esc(state.captions[0].note) +
          '">' +
          esc(state.captions[0].text) +
          '</span>'
        : '') +
      (locked()
        ? ''
        : '<button type="button" class="cd-tl__addcap" data-act="add-caption">' +
          ic('plus', 11) +
          'Caption</button>') +
      '</div></div>' +
      '</div></div></div>'
    );
  }

  function renderGenRibbon() {
    var c = counts();
    var made =
      c.used +
      ' preview' +
      (c.used === 1 ? '' : 's') +
      (c.fromDesc.length
        ? ' · Scene ' + c.fromDesc.map(sceneNo).join(', ') + ' from description'
        : '') +
      ' · Voice ' +
      voiceName();
    if (state.gen === 'running')
      return (
        '<div class="cd-gen"><span class="cd-gen__orb"></span><div class="cd-gen__say"><b>Generating from the approved brief</b><span>' +
        made +
        '</span><div class="cd-gen__bar"><div class="cd-gen__fill" style="width:' +
        state.genPct +
        '%"></div></div></div><button type="button" class="cd-btn cd-btn--sm" data-act="stop">' +
        ic('stop', 12) +
        'Stop</button></div>'
      );
    if (state.gen === 'stopped')
      return (
        '<div class="cd-gen cd-gen--stopped"><span class="cd-gen__orb"></span><div class="cd-gen__say"><b>' +
        (state.failed ? 'Failed' : 'Stopped') +
        ' at ' +
        Math.round(state.genPct) +
        '%</b><span>' +
        (state.failed ? 'Vicino couldn’t finish this post.' : 'The finished part is charged.') +
        ' Generate again starts from the beginning, or cancel generation to edit the brief and storyboard.</span></div></div>'
      );
    return (
      '<div class="cd-gen cd-gen--stopped"><span class="cd-gen__orb" style="background:#5cc98d"></span><div class="cd-gen__say"><b>Made from the approved brief</b><span>' +
      made +
      '</span></div></div>'
    );
  }

  // ---------------------------------------------------------------- modals
  // ---- your own asset (round 31): instead of what Vicino makes, at any point
  function ownWord() {
    return isVideo() ? 'video' : state.format === 'carousel' ? 'images' : 'image';
  }

  function ownLabel() {
    return 'Use my own ' + ownWord();
  }

  // the Library, as the picker shows it
  // the Library: what it holds, how big, when it came in; `dur` is how long
  // the clip runs when it is used as your own video
  var LIBRARY = [
    { img: 'assets/scene-1.jpg', name: 'Worktable, phone and box', size: '4.2 MB', date: 'Oct 2', dur: '0:12' },
    { img: 'assets/scene-2.jpg', name: 'Storefront on a laptop', size: '3.8 MB', date: 'Oct 2', dur: '0:09' },
    { img: 'assets/scene-3.jpg', name: 'Founder with the box', size: '5.1 MB', date: 'Sep 28', dur: '0:15' },
    { img: 'assets/slide-1.jpg', name: 'Workshop, product and page', size: '2.6 MB', date: 'Sep 24', dur: '0:08' },
    { img: 'assets/slide-2.jpg', name: 'Catalog guidance', size: '1.9 MB', date: 'Sep 24', dur: '0:06' },
    { img: 'assets/ref-3.jpg', name: 'Mugs on storefronts', size: '864 KB', date: 'Sep 19', dur: '0:10' },
    { doc: true, name: 'Review notes.pdf', size: '312 KB', date: 'Sep 18' },
  ];

  // a Library tile (round 65): the picture alone; its name, size and date
  // come with the pointer, as on the references; the pick circle shows on
  // hover and stays once picked; a clip carries a play mark and its length
  function libTile(x, i, o) {
    return (
      '<button type="button" class="cdb-lib__item' +
      (o.on ? ' is-on' : '') +
      (o.used ? ' is-used' : '') +
      (o.video ? ' is-video' : '') +
      '" data-act="' +
      o.act +
      '" data-arg="' +
      i +
      '"' +
      (o.used ? ' disabled' : '') +
      ' aria-pressed="' +
      !!o.on +
      '" aria-label="' +
      esc(x.name) +
      '"><span class="cdb-lib__img"><img src="' +
      x.img +
      '" alt="">' +
      (o.video
        ? '<span class="cdb-lib__play">' + ic('play', 13) + '</span><span class="cdb-lib__dur">' + x.dur + '</span>'
        : '') +
      (o.used ? '<em>In use</em>' : '<i class="cdb-lib__tick">' + ic('check', 10) + '</i>') +
      '<span class="cdb-lib__hover"><b>' +
      esc(x.name) +
      '</b><small>' +
      x.size +
      ' \u00b7 ' +
      x.date +
      '</small></span></span></button>'
    );
  }

  // each dialog's mark: an icon and its colour
  var MODAL_ICONS = {
    schedule: ['calendar', 'cyan'],
    retime: ['calendar', 'cyan'],
    confirm: ['check', 'cyan'],
    update: ['wand', 'violet'],
    planning: ['wand', 'violet'],
    review: ['layers', 'violet'],
    delete: ['trash', 'red'],
    'plan-setup': ['film', 'violet'],
    own: ['upload', 'cyan'],
    refnote: ['doc', 'cyan'],
    library: ['library', 'cyan'],
    gate: ['badge', 'cyan'],
  };

  function renderModal() {
    var m = state.modal;
    var html = '';
    if (m.type === 'schedule' || m.type === 'retime') {
      var sched = m.type === 'schedule';
      html =
        '<h3 class="cd-modal__title">' +
        (sched ? 'Approve and schedule' : 'Change when it goes out') +
        '</h3><p class="cd-modal__say">' +
        (sched && missedTime()
          ? 'X missed its planned time (' + esc(state.when) + '). Pick when it goes out instead.'
          : 'Pick when it goes out on X. Times are New York time.') +
        '</p><div class="cd-slots" role="radiogroup">' +
        SLOTS.map(function (o, i) {
          var d = dateTile(o.when);
          return (
            '<button type="button" class="cd-slot' +
            (state.pickTime === i ? ' is-on' : '') +
            '" data-act="pick-slot" data-arg="' +
            i +
            '" role="radio" aria-checked="' +
            (state.pickTime === i) +
            '">' +
            d.tile +
            '<span class="cd-slot__say"><b>' +
            esc(d.time) +
            '</b><small>' +
            esc(o.note) +
            '</small></span><i class="cd-slot__radio"></i></button>'
          );
        }).join('') +
        '</div><div class="cd-modal__foot"><span class="cd-modal__cost">' +
        (sched ? 'Free \u00b7 goes out on its own' : 'Free') +
        '</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="' +
        (sched ? 'schedule-go' : 'retime-go') +
        '">' +
        (sched ? 'Approve &amp; schedule' : 'Save time') +
        '</button></div>';
    } else if (m.type === 'confirm') {
      var c = counts();
      var items = c.decide.map(function (i) {
        var s = state.scenes[i];
        return (
          '<li>' +
          ic('warn', 13) +
          '<span><b>Scene ' +
          sceneNo(i) +
          '’s preview isn’t used</b> (' +
          esc(reasonLabel(s).toLowerCase()) +
          ') → made from its description' +
          (s.userImage ? ' and ' + esc(s.userImage) : '') +
          '.</span></li>'
        );
      });
      c.lines.forEach(function (i) {
        items.push(
          '<li>' +
            ic('warn', 13) +
            '<span><b>The line in Scene ' +
            sceneNo(i) +
            ' was placed by Vicino</b> \u2192 it is said there.</span></li>'
        );
      });
      if (!state.product)
        items.push(
          '<li>' +
            ic('warn', 13) +
            '<span><b>No product photo</b> → the product is drawn from its description.</span></li>'
        );
      html =
        '<h3 class="cd-modal__title">' +
        (items.length
          ? 'Approve with ' +
            items.length +
            ' thing' +
            (items.length > 1 ? 's' : '') +
            ' to accept?'
          : 'Approve &amp; generate?') +
        '</h3><p class="cd-modal__say">Approving starts generation. This is what it uses: ' +
        (isVideo()
          ? '<b>' +
            c.used +
            ' of ' +
            c.total +
            ' scenes start from a preview</b> · Voice ' +
            esc(voiceName()) +
            ' · ' +
            linesCount() +
            ' spoken lines'
          : '<b>' + esc(madeFrom().join(' · ')) + '</b>') +
        '.</p>' +
        (items.length ? '<ul class="cd-modal__list">' + items.join('') + '</ul>' : '') +
        '<p class="cd-modal__say" style="font-size:var(--fs-3);color:var(--text-3)">' +
        (state.comments
          ? state.comments + ' comments stay open; the author sees them on the result.'
          : 'No comments are open.') +
        ' Pressing approve accepts each item above until its inputs change again.</p>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">Uses credits</span><button type="button" class="cd-btn" data-act="modal-close">Keep reviewing</button><button type="button" class="cd-btn cd-btn--primary" data-act="approve-go">Approve &amp; generate</button></div>';
    } else if (m.type === 'update') {
      html =
        '<h3 class="cd-modal__title">Update the storyboard?</h3><p class="cd-modal__say">Replans ' +
        state.scenes.length +
        ' scenes for the new look and tone' +
        (m.ask ? ' and your request: “' + esc(m.ask) + '”' : '') +
        '. Uses credits. Nothing is replaced until you review the result.</p>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">Uses credits · candidate only, no previews</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="plan-go">Plan</button></div>';
    } else if (m.type === 'planning') {
      html =
        '<h3 class="cd-modal__title">' +
        (m.first ? 'Planning the storyboard…' : 'Replanning…') +
        '</h3><p class="cd-modal__say">Vicino lays out the scenes from the plan. A few seconds.</p><div class="cd-gen__bar" style="margin-top:16px;background:var(--surface-2)"><div class="cd-gen__fill" style="width:' +
        m.pct +
        '%;background:var(--ink-900)"></div></div>';
    } else if (m.type === 'review') {
      html =
        '<h3 class="cd-modal__title">Review the new storyboard</h3><p class="cd-modal__say">Compared with the one in use.</p><ul class="cd-modal__list">' +
        '<li class="is-ok">' +
        ic('check', 13) +
        '<span><b>Kept</b> — Scene 2 and Scene 3 keep their words, lengths and lines.</span></li>' +
        '<li>' +
        ic('pencil', 13) +
        '<span><b>Changed</b> — Scene 1 opens on the boxed product; the phone comes second.' +
        (m.ask ? ' Your request is in.' : '') +
        '</span></li>' +
        '<li class="is-lost">' +
        ic('minus', 13) +
        '<span><b>Lost</b> — nothing.</span></li>' +
        '<li>' +
        ic('image', 13) +
        '<span><b>Previews</b> — ' +
        (state.stale
          ? 'drawn again for Scene 1, 2, 3 after you use it · uses credits'
          : 'drawn again for Scene 1 after you use it · uses credits') +
        '.</span></li></ul>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">Use the new one → then previews, uses credits</span><button type="button" class="cd-btn" data-act="modal-close">Keep current</button><button type="button" class="cd-btn cd-btn--primary" data-act="use-new">Use the new one</button></div>';
    } else if (m.type === 'delete') {
      html =
        '<h3 class="cd-modal__title">Delete Scene ' +
        sceneNo(m.i) +
        '?</h3><p class="cd-modal__say">The video gets ' +
        state.scenes[m.i].dur +
        's shorter.' +
        (state.scenes[m.i].line
          ? ' Its line is placed by Vicino in the next scene — a question to answer before approval.'
          : '') +
        ' Undo restores it.</p><div class="cd-modal__foot"><span class="cd-modal__cost">Free</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="delete-go">Delete scene</button></div>';
    } else if (m.type === 'plan-setup') {
      var pmOpt = function (key, title, say, cost) {
        var on = state.previewMode === key;
        return (
          '<button type="button" class="cdb-pm__opt' +
          (on ? ' is-on' : '') +
          '" data-act="pick-pm" data-arg="' +
          key +
          '" role="radio" aria-checked="' +
          on +
          '"><i class="cd-slot__radio"></i><span class="cdb-pm__say"><b>' +
          title +
          '</b><small>' +
          say +
          '</small></span><span class="cdb-pm__cost">' +
          cost +
          '</span></button>'
        );
      };
      html =
        '<h3 class="cd-modal__title">Plan the storyboard</h3>' +
        '<p class="cd-modal__say">Vicino lays out the scenes from the brief: what the camera sees, how long each scene lasts, and the lines. You review them before anything is made. Planning uses credits.</p>' +
        '<p class="cdb-pm__lab">Scene previews</p>' +
        '<div class="cdb-pm" role="radiogroup" aria-label="Scene previews">' +
        pmOpt(
          'auto',
          'Made automatically after planning',
          'A preview picture of each scene is made right after planning, so you see the video before approving it.',
          'Uses credits'
        ) +
        pmOpt(
          'ask',
          'Only when I ask',
          'No preview is made until you ask for one on a scene. Scenes show their description until then.',
          'Free until then'
        ) +
        '</div>' +
        '<button type="button" class="cdb-pm__own" data-act="own-open">' +
        ic('upload', 12) +
        'Or skip the storyboard and use my own video</button>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">' +
        (state.previewMode === 'auto'
          ? 'Planning and ' + state.scenes.length + ' previews use credits'
          : 'Only planning uses credits') +
        '</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="plan-go-first">Plan the storyboard</button></div>';
    } else if (m.type === 'own') {
      var after = stage() === 'review' || stage() === 'scheduled';
      html =
        '<h3 class="cd-modal__title">Use your own ' +
        ownWord() +
        '</h3>' +
        '<p class="cd-modal__say">' +
        (after
          ? 'Yours replaces the ' + ownWord() + ' Vicino made. The post text stays as it is. You can switch back at any time.'
          : 'Vicino skips planning and drawing and uses yours as it is. The caption and post text are still written from the brief.') +
        '</p>' +
        '<div class="cdb-lib">' +
        '<button type="button" class="cdb-lib__item cdb-lib__item--up" data-act="own-upload"><span class="cdb-lib__doc">' +
        ic('upload', 16) +
        '<b>Upload</b><small>From your computer</small></span></button>' +
        LIBRARY.map(function (x, i) {
          if (x.doc) return '';
          return libTile(x, i, { act: 'own-pick', on: m.pick === i, video: ownWord() === 'video' });
        }).join('') +
        '</div>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">' +
        (after ? 'Free \u00b7 nothing is regenerated' : 'Saves the credits for drawing it') +
        '</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="own-use"' +
        (m.pick == null ? ' disabled' : '') +
        '>Use this ' +
        (ownWord() === 'images' ? 'picture' : ownWord()) +
        '</button></div>';
    } else if (m.type === 'refnote') {
      var rn = state.refs[m.i];
      html =
        '<h3 class="cd-modal__title">Notes for this reference</h3>' +
        '<p class="cd-modal__say">Say how this picture should guide the visual. Vicino reads it every time it draws this post.</p>' +
        '<div class="cdb-rnote"><img src="' +
        rn.img +
        '" alt=""><span><b>' +
        esc(rn.title) +
        '</b><small>' +
        esc(rn.by || 'Matched by Vicino') +
        ' \u00b7 ' +
        esc(rn.source || 'From your website') +
        '</small></span></div>' +
        '<textarea class="cd-ta cdb-rnote__ta" rows="4" data-draft="refnote" placeholder="e.g. Use the mug as the product; ignore the marketplace logos.">' +
        esc(state.draft.refnote || '') +
        '</textarea>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">Free</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="ref-note-save">Save notes</button></div>';
    } else if (m.type === 'library') {
      var libN = Object.keys(m.sel).filter(function (k) {
        return m.sel[k];
      }).length;
      html =
        '<h3 class="cd-modal__title">Add from your Library</h3>' +
        '<p class="cd-modal__say">Pick images or videos to guide this post. Only images and videos can be references.</p>' +
        '<div class="cdb-lib">' +
        LIBRARY.map(function (x, i) {
          var on = !!m.sel[i];
          var used = state.refs.some(function (r) {
            return r.img === x.img;
          });
          if (x.doc)
            return (
              '<span class="cdb-lib__item is-off"><span class="cdb-lib__doc">' +
              ic('doc', 16) +
              '<b>' +
              esc(x.name) +
              '</b><small>Not an image or video</small></span></span>'
            );
          return libTile(x, i, { act: 'lib-pick', on: on, used: used });
        }).join('') +
        '</div>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">' +
        (libN ? libN + ' selected' : 'Nothing selected') +
        '</span><button type="button" class="cd-btn" data-act="modal-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary" data-act="lib-add"' +
        (libN ? '' : ' disabled') +
        '>Add ' +
        (libN ? libN + ' ' : '') +
        'to references</button></div>';
    } else if (m.type === 'gate') {
      html =
        '<h3 class="cd-modal__title">One approval starts generation</h3>' +
        '<p class="cd-modal__say">Review the brief, then the storyboard. Approve &amp; generate on the Storyboard tab starts the video.</p>' +
        '<div class="cd-gate"><span class="cd-avatar"><img src="assets/approver.png" alt=""></span><span class="cd-gate__say"><b>Generate</b><small>You \u00b7 starts generation</small></span><span class="cd-gate__state">Waiting</span></div>' +
        '<p class="cd-gate__note">' +
        ic('info', 12) +
        '<span>No brief approval needed for this post.</span></p>' +
        '<div class="cd-modal__foot"><span class="cd-modal__cost">0 of 1 approvals cleared</span><button type="button" class="cd-btn" data-act="modal-close">Close</button></div>';
    }
    var mark = MODAL_ICONS[m.type] || ['info', 'cyan'];
    if (m.type === 'confirm' && html.indexOf('cd-modal__list') > -1) mark = ['warn', 'amber'];
    html = html.replace(
      /^<h3 class="cd-modal__title">([\s\S]*?)<\/h3>(<p class="cd-modal__say">[\s\S]*?<\/p>)?/,
      function (all, title, say) {
        return (
          '<header class="cd-modal__head"><span class="cd-modal__ico is-' +
          mark[1] +
          '">' +
          ic(mark[0], 16) +
          '</span><span class="cd-modal__titles"><h3 class="cd-modal__title">' +
          title +
          '</h3>' +
          (say || '') +
          '</span></header>'
        );
      }
    );
    return (
      '<div class="cd-modal" data-act="modal-scrim"><div class="cd-modal__card' +
      (m.type === 'plan-setup' || m.type === 'library' || m.type === 'own' ? ' cd-modal__card--wide' : '') +
      '" role="dialog">' +
      html +
      '</div></div>'
    );
  }

  function renderPop() {
    var p = state.pop;
    if (p.type === 'add')
      return (
        '<div class="cd-pop pulse-ds" style="left:' +
        p.x +
        'px;top:' +
        p.y +
        'px;transform:translateY(-100%)">' +
        '<button type="button" class="cd-pop__item" data-act="add-scene">' +
        ic('layers', 16) +
        '<span>Add a scene<small>Another shot on the clock</small></span></button>' +
        '<button type="button" class="cd-pop__item" data-act="add-caption">' +
        ic('text', 16) +
        '<span>Add a caption<small>Text laid over the video</small></span></button></div>'
      );
    if (p.type === 'when') {
      var days = '';
      var first = new Date(2026, p.month, 1).getDay();
      var inMonth = new Date(2026, p.month + 1, 0).getDate();
      for (var b = 0; b < first; b++) days += '<button disabled></button>';
      for (var d = 1; d <= inMonth; d++)
        days +=
          '<button type="button" data-act="pick-day" data-arg="' +
          d +
          '"' +
          (d === p.day ? ' class="is-on"' : '') +
          (p.month === NOW_M && d < NOW_D && d !== p.day ? ' disabled' : '') +
          '>' +
          d +
          '</button>';
      return (
        '<div class="cd-pop cd-pop--when pulse-ds" style="left:' +
        p.x +
        'px;top:' +
        p.y +
        'px;transform:translate(-50%,-100%)"><div class="cd-cal__head"><span>' +
        new Date(2026, p.month, 1).toLocaleString('en-US', { month: 'long' }) +
        ' 2026</span><span style="color:var(--text-4);font-weight:400">New York</span></div>' +
        '<div class="cd-cal__grid">' +
        ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          .map(function (x) {
            return '<span>' + x + '</span>';
          })
          .join('') +
        days +
        '</div><div class="cd-cal__foot"><span>' +
        MON[p.month] +
        ' ' +
        p.day +
        ' · ' +
        p.time +
        '</span><button type="button" class="cd-btn cd-btn--ghost cd-btn--sm" data-act="pop-close">Cancel</button><button type="button" class="cd-btn cd-btn--primary cd-btn--sm" data-act="save-when" style="margin-left:0">Save time</button></div></div>'
      );
    }
    return '';
  }

  function renderToast() {
    var t = state.toast;
    return (
      '<div class="cd-toast" role="status"><span class="cd-toast__ico">' +
      ic('check', 11) +
      '</span>' +
      '<span>' +
      // a headline that ends a sentence ("Saved to the brief.") stands a
      // little apart from what follows it ("Free.")
      t.html.replace(/^(<b>[^<]*[.!?]<\/b>)\s*/, '$1<i class="cd-toast__gap"></i>') +
      '</span>' +
      (t.go != null
        ? '<button type="button" class="cd-link" data-act="open-scene" data-arg="' +
          t.go +
          '">Go to Scene ' +
          sceneNo(t.go) +
          '</button>'
        : '') +
      (t.undo ? '<button type="button" class="cd-link" data-act="undo">Undo</button>' : '') +
      '<button type="button" class="cd-link cd-link--quiet" data-act="toast-close">' +
      ic('close', 12) +
      '</button></div>'
    );
  }

  var toastTimer;
  function toast(html, opts) {
    opts = opts || {};
    state.toast = { html: html, go: opts.go, undo: !!opts.undo };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      state.toast = null;
      render();
    }, opts.ms || 6000);
  }

  // --------------------------------------------------------------- actions
  function bump(reason) {
    state.version += 1;
    state.approved = null;
    if (reason) state.lastChange = reason;
  }

  function saveWho() {
    var d = state.draft;
    state.brief.audience = d.audience.trim() || state.brief.audience;
    state.brief.coreIdea = d.coreIdea.trim() || state.brief.coreIdea;
    state.brief.cta = d.cta.trim();
    if (d.proofN != null) {
      var pl = [];
      for (var pi = 0; pi < d.proofN; pi++) {
        var pv = (d['proof' + pi] || '').trim();
        if (pv) pl.push(pv);
      }
      state.brief.proofs = pl;
    }
    var changed =
      d.coreIdea.trim() !== fmtSrc().brief.coreIdea || d.cta.trim() !== fmtSrc().brief.cta;
    state.edit = null;
    state.draft = {};
    if (changed) bump('who');
    toast('<b>Saved to the brief.</b> Nothing on the storyboard changes.');
    render();
  }

  function savePlan() {
    var d = state.draft;
    var b = state.brief;
    var toneChanged = d.tone != null && d.tone.trim() && d.tone.trim() !== b.tone;
    if (toneChanged) b.tone = d.tone.trim();
    if (!isVideo()) {
      b.plan = (d.plan || '').trim() || b.plan;
      if (d.look != null) b.look = d.look.trim();
      state.slides.forEach(function (x, i) {
        if (d['slide' + i] != null && d['slide' + i].trim()) x.text = d['slide' + i].trim();
      });
      state.edit = null;
      state.draft = {};
      bump('plan');
      toast('<b>Saved to the brief.</b> Free.');
      render();
      return;
    }
    var lookChanged = d.look.trim() !== b.look.trim();
    var voiceChanged = d.voice !== b.voice;
    var any = lookChanged || voiceChanged || toneChanged;
    // the plan line and the scene sentences are words in the brief: free to change
    if (d.plan != null && d.plan.trim() && d.plan.trim() !== b.plan) {
      b.plan = d.plan.trim();
      any = true;
    }
    (b.beats || []).forEach(function (t, i) {
      var v = d['beat' + i];
      if (v != null && v.trim() && v.trim() !== t) {
        b.beats[i] = v.trim();
        any = true;
      }
    });
    if (!state.planned) {
      state.scenes.forEach(function (s, i) {
        if (d['scene' + i] != null && d['scene' + i].trim() !== s.text.trim()) {
          s.text = d['scene' + i].trim();
          any = true;
        }
      });
    }
    if (lookChanged) {
      state.lookPrev = b.look;
      b.look = d.look.trim();
      if (state.planned) state.stale = true;
    }
    if (voiceChanged) {
      b.voice = d.voice;
      if (state.planned)
        state.scenes.forEach(function (s) {
          if (s.preview && s.preview.state === 'ready') {
            s.preview.state = 'stale';
            s.preview.reason = 'Made for a different voice';
            delete state.decided[s.id];
          }
        });
    }
    state.edit = null;
    state.draft = {};
    if (any) bump('plan');
    if (lookChanged && state.planned)
      toast('<b>Saved.</b> The storyboard is out of date — update it from the Next card.', {
        undo: true,
      });
    else if (voiceChanged && state.planned)
      toast('<b>Saved.</b> Every preview is out of date for the new voice.', { undo: true });
    else toast('<b>Saved to the brief.</b> Free.');
    if (lookChanged || voiceChanged)
      state.undo = {
        type: 'plan',
        look: state.lookPrev,
        voice: voiceChanged ? fmtSrc().brief.voice : null,
      };
    render();
  }

  function restoreLook() {
    if (state.lookPrev != null) state.brief.look = state.lookPrev;
    state.lookPrev = null;
    state.stale = false;
    bump('restore');
    toast(
      '<b>Previous look restored.</b> The storyboard is current again; previews are judged on the five keys.'
    );
    render();
  }

  function saveScene(quiet) {
    var i = state.scene;
    var s = state.scenes[i];
    var d = state.draft;
    var textChanged = d.text.trim() !== s.text.trim();
    var lineChanged = (d.line || '').trim() !== (s.line || '').trim();
    var moved = d.lineTo !== i && d.line.trim();
    var durChanged = d.dur !== s.dur;
    var affected = [];
    s.text = d.text.trim();
    s.dur = d.dur;
    if (moved) {
      var to = state.scenes[d.lineTo];
      to.line = d.line.trim();
      to.lineBy = false;
      s.line = null;
      if (state.brief.voice === 'talking' && to.preview && to.preview.state === 'ready') {
        to.preview.state = 'stale';
        to.preview.reason = 'Someone speaks here now';
        delete state.decided[to.id];
        affected.push(d.lineTo);
      }
    } else {
      s.line = d.line.trim() || null;
      if (lineChanged) s.lineBy = false;
    }
    if (textChanged && s.preview && s.preview.state === 'ready') {
      s.preview.state = 'stale';
      s.preview.reason = 'Words changed';
      delete state.decided[s.id];
      affected.push(i);
    }
    if (textChanged || lineChanged || moved || durChanged) bump('scene');
    state.unsaved = false;
    state.draft = sceneDraft(i);
    if (!quiet) {
      if (affected.length)
        toast(
          '<b>Saved.</b> Scene ' +
            affected.map(sceneNo).join(', ') +
            '’s preview is out of date, so the video won’t use it.',
          { go: affected[0] !== i ? affected[0] : undefined }
        );
      render();
    }
  }

  function regen(i) {
    var s = state.scenes[i];
    s.preview = s.preview || { attempts: 0 };
    s.preview.state = 'drawing';
    s.preview.attempts = (s.preview.attempts || 0) + 1;
    s.preview.charged = 'yes';
    render();
    setTimeout(function () {
      if (s.preview.state !== 'drawing') return;
      s.preview.state = 'ready';
      s.preview.reason = null;
      s.img = s.img || s._img || 'assets/scene-' + (((i % 3) + 1) | 0) + '.jpg';
      delete state.decided[s.id];
      toast('<b>Preview ready</b> for Scene ' + sceneNo(i) + ' · charged.');
      render();
    }, 2600);
  }

  function planStoryboard(first, ask) {
    if (first) {
      state.planning = true;
      render();
      setTimeout(function () {
        state.planning = false;
        state.planned = true;
        bump('planned');
        if (state.previewMode === 'auto') startDrawing();
        else
          state.scenes.forEach(function (s, k) {
            s._img = s._img || s.img || 'assets/scene-' + ((k % 3) + 1) + '.jpg';
            s.img = null;
            s.preview = { state: 'none', attempts: 0 };
          });
        render();
      }, 2200);
      return;
    }
    state.modal = { type: 'planning', pct: 0, first: first, ask: ask };
    render();
    var start = Date.now();
    var tick = setInterval(function () {
      var pct = Math.min(100, ((Date.now() - start) / 2200) * 100);
      state.modal.pct = pct;
      var fill = root.querySelector('.cd-modal .cd-gen__fill');
      if (fill) fill.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(tick);
        if (first) {
          state.planned = true;
          state.modal = null;
          bump('planned');
          if (state.previewMode === 'auto') {
            startDrawing();
            toast('<b>Storyboard planned.</b> Previews are being drawn \u2014 about a minute.');
          } else {
            state.scenes.forEach(function (s, k) {
              s._img = s._img || s.img || 'assets/scene-' + ((k % 3) + 1) + '.jpg';
              s.img = null;
              s.preview = { state: 'none', attempts: 0 };
            });
            toast(
              '<b>Storyboard planned.</b> No previews yet \u2014 draw one on any scene when you want it.'
            );
          }
        } else {
          state.modal = { type: 'review', ask: ask };
        }
        render();
      }
    }, 80);
  }

  function useNew() {
    var ask = state.modal && state.modal.ask;
    var s1 = state.scenes[0];
    var before = JSON.parse(JSON.stringify(state.scenes));
    s1.text =
      'At a worktable, a founder lifts a boxed product into frame, then checks an AI shopping conversation on a phone and looks from the phone to the box. Keep the conversation text unreadable.';
    var wasStale = state.stale;
    state.stale = false;
    state.lookPrev = null;
    state.scenes.forEach(function (s, k) {
      if (wasStale || k === 0) {
        s.preview = {
          state: 'drawing',
          attempts: (s.preview && s.preview.attempts) || 0,
          charged: 'yes',
        };
      }
    });
    state.modal = null;
    state.sbRewrite = false;
    state.rewrite = false;
    state.draft = {};
    bump('replan');
    state.undo = { type: 'scenes', scenes: before, stale: wasStale };
    toast('<b>Storyboard updated.</b> New previews are being drawn · uses credits.', {
      undo: true,
    });
    render();
    setTimeout(function () {
      state.scenes.forEach(function (s, k) {
        if (s.preview && s.preview.state === 'drawing') {
          s.preview.state = 'ready';
          s.preview.attempts += 1;
          s.img = s.img || 'assets/scene-' + (k + 1) + '.jpg';
        }
      });
      render();
    }, 2800);
  }

  function undo() {
    var u = state.undo;
    if (!u) return;
    if (u.type === 'plan') {
      if (u.look != null) state.brief.look = u.look;
      if (u.voice) state.brief.voice = u.voice;
      state.stale = false;
      state.lookPrev = null;
      state.scenes.forEach(function (s, k) {
        if (fmtSrc().scenes[k]) s.preview = clone(fmtSrc().scenes[k].preview);
      });
    } else if (u.type === 'scenes') {
      state.scenes = u.scenes;
      state.stale = u.stale;
      if (u.stale) state.lookPrev = state.brief.look;
    } else if (u.type === 'delete') {
      state.scenes.splice(u.i, 0, u.scene);
      if (u.lineTo != null && state.scenes[u.lineTo + 1]) {
        state.scenes[u.lineTo + 1].line = u.lineWas;
        state.scenes[u.lineTo + 1].lineBy = false;
      }
    }
    state.undo = null;
    bump('undo');
    toast('<b>Undone.</b>');
    render();
  }

  // a line saved in place writes the brief and the storyboard at once. With
  // Talking, moving a line changes who speaks in two scenes: both are judged
  function saveLine(quiet) {
    var e = state.lineEdit;
    var src = state.scenes[e.i];
    var to = state.scenes[e.to];
    var text = e.text.trim();
    var before = clone(state.scenes);
    var hit = [];
    var talking = state.brief.voice === 'talking';
    var mark = function (x, k, why) {
      if (talking && x.preview && x.preview.state === 'ready') {
        x.preview.state = 'stale';
        x.preview.reason = why;
        delete state.decided[x.id];
        hit.push(k);
      }
    };
    var changed = false;
    if (e.to !== e.i && text) {
      var hadSrc = !!src.line;
      var hadTo = !!to.line;
      to.line = to.line ? to.line + ' ' + text : text;
      to.lineBy = false;
      src.line = null;
      src.lineBy = false;
      if (!hadTo) mark(to, e.to, 'Someone speaks here now');
      if (hadSrc) mark(src, e.i, 'No one speaks here now');
      changed = true;
    } else if (text !== (src.line || '')) {
      var had = !!src.line;
      src.line = text || null;
      src.lineBy = false;
      if (had !== !!text)
        mark(src, e.i, text ? 'Someone speaks here now' : 'No one speaks here now');
      changed = true;
    }
    state.lineEdit = null;
    if (!changed) {
      if (!quiet) render();
      return;
    }
    bump('line');
    state.undo = { type: 'scenes', scenes: before, stale: state.stale };
    var head =
      e.to !== e.i ? '<b>Line moved to Scene ' + sceneNo(e.to) + '.</b>' : '<b>Line saved.</b>';
    toast(
      hit.length
        ? head + ' Scene ' +
            hit.map(sceneNo).join(' and ') +
            (hit.length > 1 ? '\u2019s previews are' : '\u2019s preview is') +
            ' out of date. Free.'
        : head + ' It is written to the brief and the storyboard. Free.',
      { go: hit.length ? hit[0] : e.to !== e.i ? e.to : undefined, undo: e.to !== e.i }
    );
    if (!quiet) render();
  }

  // at 8s a line still too long: the scene becomes two of 6s each, the line
  // cut at a sentence (or at its middle); the second scene has no preview yet
  function splitScene(i) {
    var s = state.scenes[i];
    var before = clone(state.scenes);
    var parts = (s.line || '').split(/(?<=[.?!,])\s+/);
    var a, b;
    if (parts.length > 1) {
      var half = Math.ceil(parts.length / 2);
      a = parts.slice(0, half).join(' ');
      b = parts.slice(half).join(' ');
    } else {
      var w = (s.line || '').split(/\s+/);
      a = w.slice(0, Math.ceil(w.length / 2)).join(' ');
      b = w.slice(Math.ceil(w.length / 2)).join(' ');
    }
    s.dur = 6;
    s.line = a;
    state.scenes.splice(i + 1, 0, {
      id: 's' + Date.now(),
      text: s.text,
      dur: 6,
      img: null,
      preview: { state: 'none', attempts: 0 },
      line: b,
    });
    bump('split');
    state.undo = { type: 'scenes', scenes: before, stale: state.stale };
    toast(
      '<b>Scene ' +
        sceneNo(i) +
        ' is two scenes now.</b> Scene ' +
        sceneNo(i) +
        ' and ' +
        sceneNo(i + 1) +
        ' are 6s each, the line split between them. Free.',
      { undo: true, go: i + 1 }
    );
    render();
  }

  function focusLineEdit() {
    var ta = root.querySelector('[data-le]');
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    autosize(ta);
  }

  function approveGo() {
    var ac = counts();
    ac.decide.forEach(function (i) {
      state.decided[state.scenes[i].id] = true;
    });
    ac.lines.forEach(function (i) {
      state.decided['line-' + state.scenes[i].id] = true;
    });
    state.decided.product = true;
    state.modal = null;
    state.approved = state.version;
    state.scene = null;
    state.tab = 'result';
    startGen(0);
  }

  // generation runs about 14s; the view re-renders only when a step or a
  // scene changes, the bars and the typed copy move in place
  function startGen(from) {
    clearInterval(state.genTimer);
    state.gen = 'running';
    state.failed = false;
    state.genPct = from || 0;
    state.scheduled = false;
    var key = genModel().key;
    render();
    var start = Date.now() - (state.genPct / 100) * 14000;
    state.genTimer = setInterval(function () {
      if (state.gen !== 'running') return clearInterval(state.genTimer);
      state.genPct = Math.min(100, ((Date.now() - start) / 14000) * 100);
      if (state.genPct >= 100) {
        clearInterval(state.genTimer);
        state.gen = 'done';
        state.nudge = true;
        toast('<b>Generated.</b> Review it, then approve.');
        render();
        return;
      }
      var k = genModel().key;
      if (k !== key) {
        key = k;
        render();
      } else updateGenDom();
    }, 120);
  }

  // first planning draws the previews one after another
  function startDrawing(onlyMissing) {
    clearInterval(state.drawTimer);
    state.drawing = true;
    var queue = [];
    state.scenes.forEach(function (s, k) {
      if (onlyMissing && (previewUse(s) !== 'none' || (s.userImage && !s.imageBad))) return;
      s._img = s._img || s.img || 'assets/scene-' + ((k % 3) + 1) + '.jpg';
      s.img = null;
      s.preview = { state: 'drawing', attempts: 0, charged: 'yes' };
      queue.push(s);
    });
    var i = 0;
    state.drawTimer = setInterval(function () {
      var s = queue[i];
      if (!s) {
        clearInterval(state.drawTimer);
        state.drawing = false;
        toast('<b>Previews ready.</b> Each scene you drew starts from its preview now.');
        render();
        return;
      }
      s.img = s._img;
      s.preview = { state: 'ready', attempts: 1, charged: 'yes' };
      i++;
      render();
    }, 1700);
  }

  function closeScene() {
    if (state.unsaved) saveScene(true);
    state.scene = null;
    state.focusLine = false;
    render();
    var el = root.querySelector('.cd-view--sb');
    if (gsapOk && !reduced && el)
      gsap.from(el, { x: -18, opacity: 0, duration: 0.3, ease: 'power3.out' });
  }

  // the role menu opens where it can be read whole: below the label if it
  // fits in the body, above it if that fits, otherwise below with the body
  // scrolled just enough to show it
  function placeRefMenu() {
    var menu = root.querySelector('.cdb-refmenu');
    var body = root.querySelector('.cd-body');
    if (!menu || !body) return;
    var m = menu.getBoundingClientRect();
    var b = body.getBoundingClientRect();
    var pad = 16;
    if (m.bottom <= b.bottom - pad) return;
    var item = menu.closest('.cdb-ref');
    var btn = menu.parentNode.getBoundingClientRect();
    if (btn.top - 8 - m.height >= b.top + pad) {
      state.refMenuUp = true;
      item.classList.add('is-up');
      return;
    }
    body.scrollBy({ top: m.bottom - b.bottom + pad + 24, behavior: reduced ? 'auto' : 'smooth' });
  }

  // ----------------------------------------------------------- dispatcher
  // every action passes the walkthrough first: a step can make it fail on
  // purpose, and doing what a step asks moves the walkthrough on
  function act(name, arg, el, ev) {
    var f = flowStep();
    var hit = f && flowHit(f, name, arg);
    if (hit && f.before) f.before();
    if (hit && f.intercept) {
      f.intercept(arg);
      return;
    }
    act0(name, arg, el, ev);
    if (hit && f.after) f.after();
    if (hit && state.flow === FLOW.indexOf(f)) flowGo(state.flow + 1);
  }

  function act0(name, arg, el, ev) {
    switch (name) {
      case 'noop':
        toast('Not in this prototype.', { ms: 2200 });
        render();
        break;
      case 'close-drawer':
        if (state.edit || state.unsaved) {
          toast('<b>Save or cancel your edits</b> before closing.', { ms: 3000 });
          render();
          break;
        }
        state.open = false;
        render();
        pageClosed();
        break;
      case 'reopen':
        state.open = true;
        state.entered = false;
        render();
        break;
      case 'tab':
        if (state.unsaved) saveScene(true);
        state.scene = null;
        state.lineEdit = null;
        state.tab = el.dataset.tab;
        state.pop = null;
        state.scrollReset = true;
        state.nudge = true;
        render();
        var v = root.querySelector('.cd-body > .cd-view');
        if (gsapOk && !reduced && v)
          gsap.from(v, { y: 8, opacity: 0, duration: 0.26, ease: 'power2.out' });
        break;
      case 'edit-who':
        state.edit = 'who';
        state.rewrite = false;
        state.draft = {
          audience: state.brief.audience,
          coreIdea: state.brief.coreIdea,
          cta: state.brief.cta,
          proofN: (state.brief.proofs || []).length,
        };
        (state.brief.proofs || []).forEach(function (x, i) {
          state.draft['proof' + i] = x;
        });
        render();
        break;
      case 'edit-plan':
        state.edit = 'plan';
        state.rewrite = false;
        state.draft = {
          look: state.brief.look,
          voice: state.brief.voice,
          plan: state.brief.plan,
          tone: state.brief.tone,
        };
        (state.brief.beats || []).forEach(function (t, i) {
          state.draft['beat' + i] = t;
        });
        state.lookOpen = true;
        state.refsBefore = clone(state.refs);
        state.scenes.forEach(function (s, i) {
          state.draft['scene' + i] = s.text;
        });
        state.slides.forEach(function (x, i) {
          state.draft['slide' + i] = x.text;
        });
        render();
        break;
      case 'cancel-edit':
        // Cancel also undoes what changed in the references while editing
        if (state.edit === 'plan' && state.refsBefore) state.refs = state.refsBefore;
        state.refsBefore = null;
        state.edit = null;
        state.draft = {};
        render();
        break;
      case 'save-who':
        saveWho();
        break;
      case 'save-plan':
        savePlan();
        break;
      case 'draft-voice':
        state.draft.voice = arg;
        render();
        break;
      case 'rewrite-open':
        state.rewrite = true;
        state.edit = null;
        render();
        setTimeout(function () {
          var ta = root.querySelector('[data-draft="rewrite"]');
          if (ta) ta.focus();
        }, 30);
        break;
      case 'sb-rewrite':
        state.sbRewrite = !state.sbRewrite;
        state.pop = null;
        render();
        if (state.sbRewrite)
          setTimeout(function () {
            var ta = root.querySelector('[data-draft="rewrite"]');
            if (ta) ta.focus();
          }, 30);
        break;
      case 'rewrite-close':
        state.rewrite = false;
        state.sbRewrite = false;
        render();
        break;
      case 'rewrite-go':
        var ask = (state.draft.rewrite || '').trim();
        if (state.planned) {
          state.modal = { type: 'update', ask: ask };
          render();
        } else {
          state.brief.plan =
            'Four worktable scenes, the boxed product first: a founder, a phone, a real store. About 20 seconds.';
          state.scenes[0].text =
            'At a worktable, a founder lifts a boxed product into frame, then checks an AI shopping conversation on a phone and looks from the phone to the box.';
          state.rewrite = false;
          state.draft = {};
          bump('rewrite');
          toast('<b>Plan rewritten.</b> Nothing is planned yet, so nothing else changes.');
          render();
        }
        break;
      case 'plan':
        if (state.planChoice === 'own') act('own-open');
        else planStoryboard(true);
        break;
      case 'pick-mode':
        if (arg === 'own') state.planChoice = 'own';
        else {
          state.planChoice = 'vicino';
          if (arg === 'auto' || arg === 'ask') state.previewMode = arg;
        }
        state.modeMenu = false;
        render();
        break;
      case 'mode-menu':
        dropCoach();
        state.modeMenu = !state.modeMenu;
        render();
        break;
      case 'coach-done':
        dropCoach();
        render();
        break;
      case 'coach-try':
        dropCoach();
        // B: the button itself is the way in, so Show me opens the picker
        if (state.nextUi === 'split') state.modal = { type: 'own', pick: null };
        else state.modeMenu = true;
        render();
        break;
      case 'pick-plan':
        state.planChoice = arg;
        render();
        break;
      case 'pick-pm':
        state.previewMode = arg;
        render();
        break;
      case 'plan-go-first':
        planStoryboard(true);
        break;
      case 'draw-missing':
        startDrawing(true);
        toast('<b>Drawing previews</b> for the scenes without one. This uses credits.');
        render();
        break;
      case 'proof-add':
        state.draft['proof' + (state.draft.proofN || 0)] = '';
        state.draft.proofN = (state.draft.proofN || 0) + 1;
        render();
        var pin = root.querySelectorAll('.cdb-pe__in');
        if (pin.length) pin[pin.length - 1].focus();
        break;
      case 'proof-del':
        var di = parseInt(arg, 10);
        for (var dj = di; dj < state.draft.proofN - 1; dj++)
          state.draft['proof' + dj] = state.draft['proof' + (dj + 1)];
        state.draft.proofN -= 1;
        delete state.draft['proof' + state.draft.proofN];
        render();
        break;
      case 'blocked-next':
        blockedNext(true);
        break;
      case 'fact-help':
        state.factHelp = state.factHelp === arg ? null : arg;
        render();
        break;
      case 'full-brief':
        state.moreBrief = !state.moreBrief;
        render();
        break;
      case 'update-storyboard':
        state.modal = { type: 'update' };
        state.scene = null;
        render();
        break;
      case 'plan-go':
        planStoryboard(false, state.modal && state.modal.ask);
        break;
      case 'use-new':
        useNew();
        break;
      case 'restore-look':
        restoreLook();
        break;
      case 'approve-schedule':
        state.pickTime = 0;
        state.modal = { type: 'schedule' };
        render();
        break;
      case 'retime':
        state.pickTime = 0;
        state.modal = { type: 'retime' };
        render();
        break;
      case 'pick-slot':
        state.pickTime = parseInt(arg, 10);
        render();
        break;
      case 'schedule-go':
        state.when = SLOTS[state.pickTime].when;
        state.scheduled = true;
        state.modal = null;
        state.copyEdit = false;
        state.req = null;
        state.nudge = true;
        toast('<b>Approved and scheduled</b> for ' + esc(state.when) + ' on X.');
        render();
        break;
      case 'retime-go':
        state.when = SLOTS[state.pickTime].when;
        state.modal = null;
        toast('<b>Time changed.</b> Goes out ' + esc(state.when) + '.');
        render();
        break;
      case 'missed-pick':
        state.when = SLOTS[0].when;
        toast('<b>Vicino picked ' + esc(state.when) + '.</b> Saving a time doesn’t approve the post.');
        render();
        break;
      case 'archive-post':
        if (state.edit || state.unsaved) {
          toast('<b>Save or cancel your edits</b> before archiving.', { ms: 3000 });
          render();
          break;
        }
        state.open = false;
        render();
        pageClosed(true);
        break;
      case 'tag-add':
        if (window.CD_API.onTagAdd) window.CD_API.onTagAdd(el);
        break;
      case 'tag-remove':
        if (window.CD_API.onTagRemove) window.CD_API.onTagRemove(arg);
        break;
      case 'see-on-x':
        toast('<b>Opens the post on X.</b>');
        render();
        break;
      case 'publish-now':
        toast('<b>Sent to X.</b> It publishes in the next minute.');
        render();
        break;
      case 'mark-posted':
        state.postedOpen = false;
        toast('<b>Marked as posted.</b> Vicino won\u2019t publish it again.');
        render();
        break;
      case 'reopen-edit':
        clearInterval(state.genTimer);
        state.gen = null;
        state.scheduled = false;
        state.tab = 'brief';
        bump('reopen');
        toast(
          '<b>Reopened.</b> The brief can be edited again; the result stays until you generate again.'
        );
        render();
        break;
      case 'edit-copy':
        if (stage() !== 'review') break;
        state.copyEdit = true;
        state.draft.copy = state.copy;
        render();
        setTimeout(function () {
          var ta = root.querySelector('[data-draft="copy"]');
          if (ta) {
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
          }
        }, 30);
        break;
      case 'save-copy':
        if ((state.draft.copy || '').trim() && state.draft.copy !== state.copy) {
          state.copy = state.draft.copy;
          bump('copy');
          state.approved = state.version;
          toast('<b>Post text saved.</b> Free.');
        }
        state.copyEdit = false;
        render();
        break;
      case 'cancel-copy':
        state.copyEdit = false;
        render();
        break;
      case 'req-open':
        if (stage() !== 'review') break;
        state.req = { step: 'ask' };
        state.draft.req = '';
        render();
        setTimeout(function () {
          var ta = root.querySelector('[data-draft="req"]');
          if (ta) ta.focus();
        }, 30);
        break;
      case 'req-chip':
        state.draft.req = arg;
        render();
        break;
      case 'req-cancel':
        state.req = null;
        render();
        break;
      case 'req-back':
        state.req = { step: 'ask' };
        render();
        break;
      case 'req-plan':
        var want =
          (state.draft.req || '').trim() ||
          (isVideo() ? 'End on the general question' : 'Bigger text on slide 2');
        state.req = {
          step: 'plan',
          plan: isVideo()
            ? 'Regenerate Scene 3 so it does this: \u201c' +
              want +
              '\u201d. Scenes 1 and 2 stay exactly as they are. The post text does not change.'
            : 'Redraw slide 2 so it does this: \u201c' +
              want +
              '\u201d. Slide 1 stays exactly as it is. The post text does not change.',
        };
        render();
        break;
      case 'req-run':
        state.req = { step: 'running' };
        render();
        setTimeout(function () {
          state.req = null;
          state.changed = isVideo() ? 2 : 1;
          bump('change');
          state.approved = state.version;
          toast('<b>Changed.</b> Review it, then approve.');
          render();
        }, 2600);
        break;
      case 'play':
        play();
        break;
      case 'lightbox':
        state.lightbox = parseInt(arg, 10);
        render();
        break;
      case 'lb-step':
        state.lightbox = Math.max(
          0,
          Math.min(state.slides.length - 1, state.lightbox + parseInt(arg, 10))
        );
        render();
        break;
      case 'lb-close':
        if (ev && ev.target !== el) break;
        state.lightbox = null;
        render();
        break;
      case 'toggle-checks':
        state.checksOpen = !state.checksOpen;
        render();
        break;
      case 'toggle-posted':
        state.postedOpen = !state.postedOpen;
        render();
        break;
      case 'toggle-todo':
        state.todoOpen = !state.todoOpen;
        render();
        break;
      case 'toggle-look':
        state.lookOpen = !state.lookOpen;
        render();
        break;
      case 'next':
        var nb = root.querySelector('.cd-cta__btn:not(:disabled)');
        if (nb) nb.click();
        else {
          state.nudge = true;
          render();
        }
        break;
      case 'toggle-details':
        state.details = !state.details;
        render();
        break;
      case 'toggle-notes':
        state.notes = !state.notes;
        render();
        break;
      case 'open-notes':
        state.tab = 'storyboard';
        state.todoOpen = true;
        state.scene = null;
        render();
        setTimeout(function () {
          var n = root.querySelector('.cd-notes');
          if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 40);
        break;
      case 'toggle-tl':
        state.tl = !state.tl;
        render();
        break;
      case 'gl-toggle':
        state.glOpen = !state.glOpen;
        state.notes = false;
        render();
        break;
      case 'line-edit':
        if (locked()) break;
        var lei = parseInt(arg, 10);
        state.lineEdit = { i: lei, text: state.scenes[lei].line || '', to: lei };
        render();
        focusLineEdit();
        break;
      case 'line-cancel':
        state.lineEdit = null;
        render();
        break;
      case 'line-drop':
        var lp = String(arg).split('>');
        var lf = parseInt(lp[0], 10),
          lt = parseInt(lp[1], 10);
        state.lineEdit = { i: lf, text: state.scenes[lf].line || '', to: lt };
        saveLine();
        break;
      case 'le-longer':
      case 'le-split':
        // keep what was typed, then make room for it
        var li = state.lineEdit.i;
        saveLine();
        if (name === 'le-split') splitScene(li);
        else act0('line-longer', String(li));
        break;
      case 'line-save':
        saveLine();
        break;
      case 'line-keep':
        var lk = state.scenes[parseInt(arg, 10)];
        state.decided['line-' + lk.id] = true;
        toast(
          '<b>Kept in Scene ' +
            sceneNo(parseInt(arg, 10)) +
            '.</b> Asked again only if the line or its scene changes.'
        );
        render();
        break;
      case 'line-longer':
        var lg = parseInt(arg, 10);
        var lgs = state.scenes[lg];
        var lgBefore = clone(state.scenes);
        var need = Math.ceil(wordCount(lgs.line) / 2.5);
        lgs.dur = need <= 6 ? 6 : 8;
        bump('dur');
        state.undo = { type: 'scenes', scenes: lgBefore, stale: state.stale };
        toast(
          '<b>Scene ' +
            sceneNo(lg) +
            ' is ' +
            lgs.dur +
            's now.</b>' +
            (lineFit(lgs).over ? ' The line still runs over: split the scene in two.' : ' Free.'),
          { undo: true }
        );
        render();
        break;
      case 'split-scene':
        splitScene(parseInt(arg, 10));
        break;
      case 'tab-storyboard':
        state.scene = null;
        state.tab = 'storyboard';
        render();
        break;
      case 'pv-policy':
        state.previewMode = arg;
        state.sbMode = false;
        toast(
          arg === 'auto'
            ? '<b>Previews are made automatically</b> after planning, from now on. Uses credits.'
            : '<b>Previews are made only when you ask</b>, from now on. Nothing is drawn by itself.'
        );
        render();
        break;
      case 'keep-prev':
        var kp = state.scenes[parseInt(arg, 10)];
        kp.preview.unsaved = false;
        toast('<b>Kept the previous preview.</b> Nothing else changes.');
        render();
        break;
      case 'use-image-new':
        var un = state.scenes[parseInt(arg, 10)];
        un.userImage = 'product-front.jpg';
        un.imageBad = false;
        // your picture and Vicino's preview are one choice: yours now, so
        // Vicino's is set aside (round 137)
        state.swapAnim = true;
        bump('image');
        toast(
          '<b>product-front.jpg is used for Scene ' +
            sceneNo(parseInt(arg, 10)) +
            '.</b> It goes into the video as it is, in place of Vicino\u2019s preview. Free.'
        );
        render();
        break;
      case 'remove-image':
        var rm = state.scenes[parseInt(arg, 10)];
        rm.userImage = null;
        rm.imageBad = false;
        state.swapAnim = true;
        bump('image');
        toast(
          rm.img && previewUse(rm) === 'used'
            ? '<b>Your picture is removed.</b> Vicino\u2019s preview is in use again. Free.'
            : '<b>Your picture is removed.</b> The scene is made from its description. Free.'
        );
        render();
        break;
      case 'blocked-fix':
        var bf = counts().fix;
        toast(
          '<b>Scene ' +
            bf.map(sceneNo).join(', ') +
            '\u2019s picture can\u2019t be read.</b> Replace it or remove it, then approve.',
          { go: bf[0] }
        );
        render();
        break;
      case 'open-scene':
        if (!state.planned) break;
        state.toast = null;
        openScene(parseInt(arg, 10), el.dataset.focus);
        if (el.dataset.pane) {
          state.paneTab = el.dataset.pane;
          render();
        }
        var pg = root.querySelector('.cd-view--scene');
        if (gsapOk && !reduced && pg) {
          gsap.from(pg.querySelector('.cd-stage'), {
            opacity: 0,
            scale: 0.985,
            duration: 0.32,
            ease: 'power3.out',
          });
          gsap.from(pg.querySelector('.cd-pane'), {
            x: 22,
            opacity: 0,
            duration: 0.32,
            ease: 'power3.out',
          });
        }
        break;
      case 'close-scene':
        closeScene();
        break;
      case 'scene-prev':
        if (state.scene > 0) openScene(state.scene - 1);
        break;
      case 'scene-next':
        if (state.scene < state.scenes.length - 1) openScene(state.scene + 1);
        break;
      case 'pane':
        state.paneTab = arg;
        render();
        break;
      case 'dur':
        state.draft.dur = parseInt(arg, 10);
        state.unsaved = true;
        render();
        break;
      case 'save-scene':
        saveScene();
        break;
      case 'scene-save':
        saveScene();
        closeScene();
        break;
      case 'scene-cancel':
        state.draft = sceneDraft(state.scene);
        state.unsaved = false;
        closeScene();
        break;
      case 'cancel-scene':
        state.draft = sceneDraft(state.scene);
        state.unsaved = false;
        render();
        break;
      case 'ai-scene':
        var want = state.draft.ai.trim();
        state.draft.text =
          state.draft.text.replace(
            /^At a worktable, /,
            'At a worktable — ' + want.replace(/\.$/, '') + ' — '
          ) || state.draft.text;
        state.draft.ai = '';
        state.unsaved = true;
        toast('<b>Rewritten by Vicino.</b> Undo restores the words until you save · uses credits.');
        render();
        break;
      case 'ai-preview':
        regen(state.scene);
        state.draft.pv = '';
        break;
      case 'ai-own':
        // Vicino reworks your own picture; it stays yours and in use
        var ao = state.scenes[state.scene];
        state.draft.pv = '';
        toast('<b>Vicino is changing your picture.</b> Your original is kept. This uses credits.');
        render();
        setTimeout(function () {
          if (!ao.userImage || ao.imageBad) return;
          ao.userImage = ao.userImage.replace(/(-edited)?\.(\w+)$/, '-edited.$2');
          bump('image');
          toast('<b>Your picture is changed.</b> ' + esc(ao.userImage) + ' is in use; the original is kept.');
          render();
        }, 1800);
        break;
      case 'pv-chip':
      case 'ai-chip':
      case 'rw-chip':
        var ck = { 'pv-chip': 'pv', 'ai-chip': 'ai', 'rw-chip': 'rewrite' }[name];
        state.draft[ck] = arg;
        render();
        var cta2 = root.querySelector('[data-draft="' + ck + '"]');
        if (cta2) {
          cta2.focus();
          cta2.setSelectionRange(cta2.value.length, cta2.value.length);
        }
        break;
      case 'lineto-menu':
        state.lineToMenu = !state.lineToMenu;
        render();
        break;
      case 'lineto-set':
        state.draft.lineTo = parseInt(arg, 10);
        state.unsaved = true;
        state.lineToMenu = false;
        render();
        break;
      case 'vid-toggle':
        var vv = state.vid || (state.vid = { on: false, t: 0, muted: false });
        if (!vv.on && vv.t >= vidLen()) vv.t = 0;
        vv.on = !vv.on;
        render();
        break;
      case 'vid-seek':
        var vs = state.vid;
        var tr = el.getBoundingClientRect();
        vs.t = Math.max(0, Math.min(1, (ev.clientX - tr.left) / tr.width)) * vidLen();
        render();
        break;
      case 'vid-mute':
        state.vid.muted = !state.vid.muted;
        render();
        break;
      case 'hist-toggle':
        state.histOpen = !state.histOpen;
        render();
        break;
      case 'hist-pick':
        var hs = state.scenes[state.scene];
        var hk = parseInt(arg, 10);
        var hp = earlierPreviews(hs)[hk];
        if (hp) {
          var hn = earlierPreviews(hs).length + 1;
          var hu = (hs.preview && hs.preview.take) || hn;
          var ht = [];
          for (var t = hn; t >= 1; t--) if (t !== hu) ht.push(t);
          hs.img = hp;
          hs.preview = {
            state: 'ready',
            attempts: (hs.preview && hs.preview.attempts) || 2,
            charged: 'no',
            take: ht[hk],
          };
          delete state.decided[hs.id];
          bump('preview');
          toast('<b>Earlier preview in use again.</b> The one before it stays in Earlier previews. Free.');
        }
        state.histOpen = false;
        render();
        break;
      case 'sb-mode':
        state.sbMode = !state.sbMode;
        render();
        break;
      case 'regen':
        // drawing a new preview puts your own picture aside
        var rgs = state.scenes[parseInt(arg, 10)];
        if (rgs && rgs.userImage && !rgs.imageBad) {
          rgs.userImage = null;
          state.swapAnim = true;
        }
        regen(parseInt(arg, 10));
        break;
      case 'use-vicino':
        // Vicino's preview back in use; your picture is put aside
        var uv = state.scenes[parseInt(arg, 10)];
        uv.userImage = null;
        uv.imageBad = false;
        state.swapAnim = true;
        bump('image');
        toast(
          '<b>Vicino\u2019s preview is in use again</b> for Scene ' +
            sceneNo(parseInt(arg, 10)) +
            '. Your picture is set aside. Free.'
        );
        render();
        break;
      case 'decide-desc':
        state.decided[arg] = true;
        toast(
          '<b>Accepted.</b> The scene is made from its description. Asked again only if its inputs change.'
        );
        render();
        break;
      case 'use-image':
        var si = parseInt(arg, 10);
        var sc = state.scenes[si];
        sc.userImage = 'product-front.jpg';
        sc.imageBad = false;
        state.swapAnim = true;
        bump('image');
        toast(
          '<b>product-front.jpg is used for Scene ' +
            sceneNo(si) +
            '.</b> It goes into the video as it is, in place of Vicino\u2019s preview. Free.'
        );
        render();
        break;
      case 'choose-photo':
        state.product = 'product-front.jpg';
        state.decided.product = true;
        bump('photo');
        toast('<b>Product photo set.</b> The boxed product is drawn from product-front.jpg.');
        render();
        break;
      case 'delete-scene':
        state.modal = { type: 'delete', i: state.scene };
        render();
        break;
      case 'delete-go':
        var di = state.modal.i;
        var gone = state.scenes[di];
        var lineTo = null,
          lineWas = null;
        state.scenes.splice(di, 1);
        if (gone.line && state.scenes.length) {
          var tgt = Math.min(di, state.scenes.length - 1);
          lineTo = tgt;
          lineWas = state.scenes[tgt].line;
          state.scenes[tgt].line = state.scenes[tgt].line
            ? state.scenes[tgt].line + ' ' + gone.line
            : gone.line;
          state.scenes[tgt].lineBy = true;
        }
        state.modal = null;
        state.scene = null;
        state.unsaved = false;
        bump('delete');
        state.undo = { type: 'delete', i: di, scene: gone, lineTo: lineTo, lineWas: lineWas };
        toast(
          '<b>Scene ' +
            sceneNo(di) +
            ' deleted.</b> ' +
            (lineTo != null
              ? 'Its line was placed in Scene ' + sceneNo(lineTo) + ' by Vicino.'
              : ''),
          {
            undo: true,
          }
        );
        render();
        break;
      case 'add-menu':
        var r = el.getBoundingClientRect();
        state.pop =
          state.pop && state.pop.type === 'add' ? null : { type: 'add', x: r.left, y: r.top - 8 };
        render();
        break;
      case 'add-scene':
        state.pop = null;
        state.scenes.push({
          id: 's' + Date.now(),
          text: '',
          dur: 4,
          img: null,
          preview: { state: 'none', attempts: 0 },
          line: null,
        });
        bump('add');
        openScene(state.scenes.length - 1);
        break;
      case 'add-caption':
        state.pop = null;
        state.captions.push({ text: 'CAPTION', note: 'Text laid over the video', from: 0, dur: 3 });
        bump('caption');
        toast('<b>Caption added</b> over the first 3s. Edit it on the timeline.');
        render();
        break;
      case 'when':
        var wr = el.getBoundingClientRect();
        // it opens on the post's own month, or on this month if that has passed
        var wp = whenParts() || { m: NOW_M, d: NOW_D, time: '12:30 PM' };
        var wPast = wp.m < NOW_M || (wp.m === NOW_M && wp.d < NOW_D);
        state.pop =
          state.pop && state.pop.type === 'when'
            ? null
            : {
                type: 'when',
                x: wr.left + wr.width / 2,
                y: wr.top - 10,
                month: wPast ? NOW_M : wp.m,
                day: wPast ? NOW_D : wp.d,
                time: wp.time,
              };
        render();
        break;
      case 'pick-day':
        state.pop.day = parseInt(arg, 10);
        render();
        break;
      case 'save-when':
        state.when = MON[state.pop.month] + ' ' + state.pop.day + ' · ' + state.pop.time;
        state.pop = null;
        toast('<b>Planned time saved.</b> ' + state.when + '.');
        render();
        break;
      case 'pop-close':
        state.pop = null;
        render();
        break;
      case 'gate':
        state.modal = { type: 'gate' };
        render();
        break;
      case 'comment':
        state.comments += 1;
        toast('<b>Comment added.</b> Comments stay open through approval.');
        render();
        break;
      case 'approve':
        if (state.gen === 'stopped') {
          state.tab = 'result';
          startGen(0);
          break;
        }
        if (state.unsaved) saveScene(true);
        state.scene = null;
        state.modal = { type: 'confirm' };
        render();
        break;
      case 'approve-go':
        approveGo();
        break;
      case 'gen-cancel':
        // out of generating: the brief and storyboard open for edits again
        clearInterval(state.genTimer);
        state.gen = null;
        state.failed = false;
        state.genPct = 0;
        state.scheduled = false;
        state.tab = 'brief';
        state.scene = null;
        bump('reopen');
        toast(
          '<b>Generation cancelled.</b> Edit the brief or storyboard, then generate when ready.'
        );
        render();
        break;
      case 'stop':
        state.gen = 'stopped';
        clearInterval(state.genTimer);
        render();
        break;
      case 'modal-close':
        state.modal = null;
        render();
        break;
      case 'modal-scrim':
        if (ev && ev.target === el && state.modal && state.modal.type !== 'planning') {
          state.modal = null;
          render();
        }
        break;
      case 'toast-close':
        state.toast = null;
        render();
        break;
      case 'undo':
        state.toast = null;
        undo();
        break;
      case 'ref-remove':
        state.refs.splice(parseInt(arg, 10), 1);
        bump('refs');
        toast('<b>Reference removed.</b> It no longer guides the visual.');
        render();
        break;
      case 'own-open':
        state.modal = { type: 'own', pick: null };
        render();
        break;
      case 'own-pick':
        // a second click on the picked one lets it go
        var op = parseInt(arg, 10);
        state.modal.pick = state.modal.pick === op ? null : op;
        render();
        break;
      case 'own-upload':
        state.modal.pick = 1;
        toast('<b>Upload</b> opens your files in the product. Picked a sample instead.');
        render();
        break;
      case 'own-use':
        var ow = LIBRARY[state.modal.pick];
        state.planChoice = 'own';
        var wasAfter = stage() === 'review' || stage() === 'scheduled';
        state.ownAsset = { img: ow.img, name: ow.name, dur: ow.dur, size: ow.size, date: ow.date };
        state.vid = { on: false, t: 0, muted: false };
        state.modal = null;
        state.scene = null;
        // a video of your own goes straight to step 2, now called Your video
        // (round 114); other formats stay where they were
        if (!wasAfter) state.tab = isVideo() ? 'storyboard' : 'brief';
        bump('own');
        toast(
          wasAfter
            ? '<b>Your ' + ownWord() + ' is in the post.</b> The text stays as it is.'
            : '<b>Using your own ' + ownWord() + '.</b> No storyboard is needed.',
          { undo: false }
        );
        render();
        break;
      case 'own-clear':
        state.ownAsset = null;
        state.planChoice = 'vicino';
        bump('own');
        toast(
          stage() === 'review' || stage() === 'scheduled'
            ? '<b>Back to the ' + ownWord() + ' Vicino made.</b>'
            : '<b>Vicino makes the ' + ownWord() + ' again.</b>'
        );
        render();
        break;
      case 'ref-role':
        var ri = parseInt(arg, 10);
        state.refMenu = state.refMenu === ri ? null : ri;
        state.refMenuUp = false;
        render();
        if (state.refMenu !== null) placeRefMenu();
        break;
      case 'ref-set':
        var rs = arg.split(':');
        state.refs[parseInt(rs[0], 10)].what = rs[1];
        state.refMenu = null;
        bump('refs');
        toast('<b>' + esc(refRoleName(rs[1])) + '.</b> Vicino uses this picture that way.');
        render();
        break;
      case 'ref-notes':
        state.draft.refnote = state.refs[parseInt(arg, 10)].notes || '';
        state.modal = { type: 'refnote', i: parseInt(arg, 10) };
        render();
        setTimeout(function () {
          var ta = root.querySelector('[data-draft="refnote"]');
          if (ta) ta.focus();
        }, 30);
        break;
      case 'ref-note-save':
        state.refs[state.modal.i].notes = (state.draft.refnote || '').trim();
        state.modal = null;
        bump('refs');
        toast('<b>Notes saved.</b> Free.');
        render();
        break;
      case 'sample-done':
        state.samplesDone[arg] = true;
        render();
        break;
      case 'ref-add-menu':
        state.refAddMenu = !state.refAddMenu;
        render();
        break;
      case 'ref-library':
        state.refAddMenu = false;
        state.modal = { type: 'library', sel: {} };
        render();
        break;
      case 'lib-pick':
        state.modal.sel[arg] = !state.modal.sel[arg];
        render();
        break;
      case 'lib-add':
        var added = 0;
        Object.keys(state.modal.sel).forEach(function (k) {
          if (!state.modal.sel[k]) return;
          var x = LIBRARY[parseInt(k, 10)];
          state.refs.push({
            img: x.img,
            name: x.name,
            title: x.name,
            role: 'From Library',
            by: 'Added by you',
            source: 'From your Library',
            what: '',
          });
          added++;
        });
        state.modal = null;
        bump('refs');
        toast('<b>' + added + ' added.</b> Say what each one is so Vicino uses it right.');
        render();
        break;
      case 'ref-upload':
        state.refAddMenu = false;
        toast('<b>Upload</b> opens your files in the product: pick images or videos.');
        render();
        break;
      case 'vchat-ctx-clear':
        state.vchat.noCtx = true;
        render();
        break;
      case 'vchat-open':
        state.vchat = state.vchat || {
          msgs: [
            {
              who: 'v',
              text:
                'You\u2019re looking at \u201c' +
                esc(state.post.title) +
                '\u201d. Tell me what to change in the brief \u2014 the main message, who it\u2019s for, the proof points or the call to action.',
            },
          ],
        };
        render();
        setTimeout(function () {
          var ta = root.querySelector('[data-draft="vchat"]');
          if (ta) ta.focus();
        }, 40);
        break;
      case 'vchat-close':
        state.vchat = null;
        render();
        break;
      case 'vchat-send':
        vchatSend(arg != null ? VCHAT_ASKS[parseInt(arg, 10)][0] : state.draft.vchat, arg);
        break;
      case 'vchat-apply':
        vchatApply(parseInt(arg, 10));
        break;
      case 'vchat-keep':
        state.vchat.msgs[parseInt(arg, 10)].proposal.state = 'kept';
        render();
        break;
      case 'ref-what':
        var rr = state.refs[parseInt(arg, 10)];
        var roles = ['Product', 'Person', 'Place', 'Style'];
        rr.what = roles[(roles.indexOf(rr.what) + 1) % roles.length];
        toast(
          '<b>' +
            esc(rr.what) +
            '.</b> Vicino uses this picture as the ' +
            rr.what.toLowerCase() +
            '.'
        );
        render();
        break;
      default:
        break;
    }
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (state.modeMenu && !e.target.closest('.cd-modemenu')) {
      state.modeMenu = false;
      if (!el || !root.contains(el)) {
        render();
        return;
      }
    }
    if (state.refMenu != null && !e.target.closest('.cdb-ref__role, .cdb-refmenu')) {
      state.refMenu = null;
      if (!el || !root.contains(el)) {
        render();
        return;
      }
    }
    if (state.lineToMenu && !e.target.closest('.sp-pick')) {
      state.lineToMenu = false;
      if (!el || !root.contains(el)) {
        render();
        return;
      }
    }
    if (state.factHelp && !e.target.closest('.cdb-help, .cdb-helppop')) {
      state.factHelp = null;
      if (!el || !root.contains(el)) {
        render();
        return;
      }
    }
    if (!el || !root.contains(el)) return;
    if (el.dataset.now) return;
    // the modal scrim: only when the click is on the scrim itself
    if (el.dataset.act === 'modal-scrim' && e.target !== el) {
      var inner = e.target.closest('[data-act]');
      if (inner === el) return;
    }
    act(el.dataset.act, el.dataset.arg, el, e);
  });

  root.addEventListener('mouseover', function (e) {
    var hl = e.target.closest('[data-hl], .sb2 [data-sc]');
    var k = hl ? hl.getAttribute('data-hl') || hl.getAttribute('data-sc') : null;
    root.querySelectorAll('.sb2 .is-hl').forEach(function (x) {
      if (x.getAttribute('data-hl') !== k && x.getAttribute('data-sc') !== k)
        x.classList.remove('is-hl');
    });
    if (k != null)
      root
        .querySelectorAll('.sb2 [data-sc="' + k + '"], .sb2 [data-hl="' + k + '"]')
        .forEach(function (x) {
          x.classList.add('is-hl');
        });
    var b = e.target.closest('.cd-cta__btn.is-blocked');
    if (b && !b.contains(e.relatedTarget)) blockedNext(false);
  });

  root.addEventListener('input', function (e) {
    var rg = e.target.closest('[data-dur-range]');
    if (rg) {
      var dv = parseInt(rg.value, 10);
      var lw = rg.closest('.sp-sec');
      rg.parentElement.style.setProperty('--p', ((dv - 4) / 4) * 100 + '%');
      if (lw) {
        lw.querySelector('.sp-len__v').textContent = dv + ' seconds';
        lw.querySelector('.sp-len__note').textContent = lenNote(dv);
      }
      return;
    }
    var le = e.target.closest('[data-le]');
    if (le && state.lineEdit) {
      state.lineEdit.text = le.value;
      var to = state.scenes[state.lineEdit.to];
      var w = wordCount(le.value),
        fit = wordsFit(to.dur);
      var hint = root.querySelector('.sb2-le__fit');
      if (hint) {
        hint.textContent = w + '/' + fit + ' words';
        hint.classList.toggle('is-over', w > fit);
      }
      var overRow = root.querySelector('.sb2-le__over');
      if (overRow) overRow.classList.toggle('is-on', w > fit);
      autosize(le);
      return;
    }
    var ta = e.target.closest('[data-draft]');
    if (ta) {
      state.draft[ta.dataset.draft] = ta.value;
      if (state.scene !== null && ['text', 'line'].indexOf(ta.dataset.draft) > -1) {
        if (!state.unsaved) {
          state.unsaved = true;
          render();
          var again = root.querySelector('[data-draft="' + ta.dataset.draft + '"]');
          if (again) {
            again.focus();
            again.setSelectionRange(again.value.length, again.value.length);
          }
        } else {
          updateLiveHints();
        }
      }
      if (ta.dataset.draft === 'ai' || ta.dataset.draft === 'pv') {
        var send = ta.parentElement.querySelector('.cd-ai__send');
        if (send) send.disabled = !ta.value.trim();
      }
      if (ta.closest('.sp-compose__box')) {
        var send2 = ta.closest('.sp-compose__box').querySelector('.sp-send');
        ta.closest('.sp-compose__box').classList.toggle('has-text', !!ta.value.trim());
        if (send2) send2.disabled = !ta.value.trim();
      }
      if (state.edit === 'plan' && ta.dataset.draft === 'look') {
        // show the consequence box as soon as the look differs
        var changed = ta.value.trim() !== state.brief.look.trim();
        var box = ta.closest('.cd-field').nextElementSibling;
        var has = box && box.classList.contains('cd-warnbox');
        if (changed !== !!has) {
          render();
          var again2 = root.querySelector('[data-draft="look"]');
          if (again2) {
            again2.focus();
            again2.setSelectionRange(again2.value.length, again2.value.length);
          }
        }
      }
      autosize(ta);
    }
  });

  // a click anywhere else keeps the line, then goes on to what was clicked
  document.addEventListener(
    'click',
    function (e) {
      if (!state.lineEdit || e.target.closest('.sb2-le, .cd-sw')) return;
      saveLine(true);
      setTimeout(render, 0);
    },
    true
  );

  var dragLine = null;
  root.addEventListener('dragstart', function (e) {
    var d = e.target.closest && e.target.closest('[data-drag-line]');
    if (!d) return;
    dragLine = d.getAttribute('data-drag-line');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragLine);
    d.classList.add('is-dragging');
    root.querySelector('.sb2-gal') && root.querySelector('.sb2-gal').classList.add('is-dragging');
  });
  root.addEventListener('dragover', function (e) {
    if (dragLine == null) return;
    var t = e.target.closest('.sb2-tile');
    if (!t || t.getAttribute('data-sc') === dragLine) return;
    e.preventDefault();
    root.querySelectorAll('.sb2-tile.is-drop').forEach(function (x) {
      if (x !== t) x.classList.remove('is-drop');
    });
    t.classList.add('is-drop');
  });
  root.addEventListener('drop', function (e) {
    if (dragLine == null) return;
    var t = e.target.closest('.sb2-tile');
    e.preventDefault();
    var from = dragLine;
    dragLine = null;
    if (t && t.getAttribute('data-sc') !== from) act('line-drop', from + '>' + t.getAttribute('data-sc'));
    else render();
  });
  root.addEventListener('dragend', function () {
    if (dragLine == null) return;
    dragLine = null;
    render();
  });

  root.addEventListener('change', function (e) {
    var rg2 = e.target.closest('[data-dur-range]');
    if (rg2) {
      act('dur', rg2.value);
      return;
    }
    var lt = e.target.closest('[data-le-to]');
    if (lt && state.lineEdit) {
      state.lineEdit.to = parseInt(lt.value, 10);
      render();
      focusLineEdit();
      return;
    }
    var sel = e.target.closest('[data-draft-select]');
    if (sel) {
      state.draft[sel.dataset.draftSelect] = parseInt(sel.value, 10);
      state.unsaved = true;
      render();
    }
  });

  function updateLiveHints() {
    var d = state.draft;
    var hint = root.querySelector('.sp-linefit');
    if (hint) {
      var words = wordCount(d.line);
      hint.textContent = lineCountNote(words, d.dur);
      hint.classList.toggle('is-over', words > wordsFit(d.dur));
    }
  }

  function autosize(ta) {
    if (ta.tagName !== 'TEXTAREA') return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 2 + 'px';
  }

  document.addEventListener('keydown', function (e) {
    if (e.target.matches('[data-le]') && state.lineEdit) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        act('line-save');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        act('line-cancel');
      }
      return;
    }
    if (e.target.matches('[data-draft="vchat"]') && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      state.draft.vchat = e.target.value;
      vchatSend(e.target.value);
      return;
    }
    if (e.target.matches('textarea, input, select')) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('#cal-layer .cal-pop, #cal-layer .cal-modal')) return;
    if (state.design === 'new' && state.open) {
      if (state.lightbox != null) {
        if (e.key === 'Escape') state.lightbox = null;
        else if (e.key === 'ArrowLeft') state.lightbox = Math.max(0, state.lightbox - 1);
        else if (e.key === 'ArrowRight')
          state.lightbox = Math.min(state.slides.length - 1, state.lightbox + 1);
        else return;
        render();
        return;
      }
      if (state.modal) {
        if (e.key === 'Escape' && state.modal.type !== 'planning') {
          state.modal = null;
          render();
        }
        return;
      }
      if (state.pop && e.key === 'Escape') {
        state.pop = null;
        render();
        return;
      }
      if (state.factHelp && e.key === 'Escape') {
        state.factHelp = null;
        render();
        return;
      }
      if (state.scene !== null) {
        if (e.key === 'ArrowLeft') act('scene-prev');
        else if (e.key === 'ArrowRight') act('scene-next');
        else if (e.key === 'Escape') closeScene();
        if (['ArrowLeft', 'ArrowRight', 'Escape'].indexOf(e.key) > -1) return;
      } else if (e.key === 'Escape') {
        act('close-drawer');
        return;
      }
    }
    var k = e.key.toLowerCase();
    if (k === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      state.showTodo = !state.showTodo;
      syncUrl();
      render();
      return;
    }
    if (k === 'v') {
      swOpen = !swOpen;
      renderSwitcher();
    } else if (k === 'h') {
      swHidden = !swHidden;
      renderSwitcher();
    }
  });

  // the confirm bar knows when it is pinned to the top of the body, so it can
  // lift itself off the content scrolling under it (round 57)
  function markStuck() {
    var band = root.querySelector('.cdb-cbarwrap');
    var body = root.querySelector('.cd-body');
    if (!band || !body) return;
    var stuck = body.scrollTop > 0 && band.getBoundingClientRect().top - body.getBoundingClientRect().top <= 1;
    band.classList.toggle('is-stuck', stuck);
  }
  root.addEventListener(
    'scroll',
    function (e) {
      if (e.target.classList && e.target.classList.contains('cd-body')) markStuck();
    },
    true
  );

  // the open confirm list shows three items whole; a fourth or more peeks in
  // under them and fades, the rest a scroll away (round 62)
  function fitConfirmList() {
    root.querySelectorAll('.cdb-cbar__panel .cdb-tlwrap').forEach(function (w) {
      var items = w.querySelectorAll('.cdb-ti');
      var more = items.length > 3;
      w.classList.toggle('is-more', more);
      w.style.maxHeight = more
        ? Math.round(items[3].getBoundingClientRect().top - w.getBoundingClientRect().top + 26) + 'px'
        : '';
    });
  }

  // a label too long for its frame scrolls slowly to its end and back, so
  // the whole of it can be read; hovering it stops the scroll (round 91)
  function fitTags() {
    root.querySelectorAll('.sb2-tag__vp').forEach(function (vp) {
      var over = vp.scrollWidth - vp.clientWidth;
      if (over < 2) return;
      vp.parentNode.classList.add('is-marquee');
      vp.style.setProperty('--mq', -(over + 12) + 'px');
      vp.style.setProperty('--mqd', Math.max(6, (over + 12) / 14 + 4).toFixed(1) + 's');
    });
  }

  // the Earlier previews card is fixed, so the picture's frame and the
  // scrolling body don't cut it: it opens over its button, as tall as the
  // drawer allows, and its takes scroll inside when there are many (round 106)
  function placeHist() {
    var pop = root.querySelector('.sp-hist__pop');
    var btn = root.querySelector('.sp-hist__btn');
    var panel = root.querySelector('.post-drawer__panel');
    if (!pop || !btn || !panel) return;
    // the body's edge fade (a mask) would still cut it; the next render,
    // which closes the card, brings the fade back
    var body = root.querySelector('.cd-body');
    if (body) body.style.webkitMaskImage = body.style.maskImage = 'none';
    pop.style.left = '0px';
    pop.style.top = '0px';
    pop.style.maxHeight = '';
    var o = pop.getBoundingClientRect();
    var b = btn.getBoundingClientRect();
    var pr = panel.getBoundingClientRect();
    var room = b.top - 8 - (pr.top + 12);
    pop.style.maxHeight = Math.max(160, Math.min(460, room)) + 'px';
    var h = pop.getBoundingClientRect().height;
    pop.style.left = b.left - o.left + 'px';
    pop.style.top = Math.max(pr.top + 12, b.top - 8 - h) - o.top + 'px';
  }

  document.addEventListener(
    'scroll',
    function (e) {
      if (state.histOpen) placeHist();
      // the body's top fade only once something has scrolled under it, so
      // what sits at its very top (Draw previews' bubble) is never faded
      if (e.target.classList && e.target.classList.contains('cd-body'))
        e.target.classList.toggle('is-scrolled', e.target.scrollTop > 2);
    },
    true
  );
  window.addEventListener('resize', function () {
    if (state.histOpen) placeHist();
  });

  // our own small tooltip in place of the browser's (round 143): any
  // element in the drawer with a title shows it in a dark glass bubble,
  // under it (over it near the bottom), after a short wait
  var ttip = null,
    ttipTimer = null,
    ttipFor = null;
  function ttipHide() {
    clearTimeout(ttipTimer);
    ttipFor = null;
    if (ttip) ttip.classList.remove('is-on');
  }
  function ttipShow(el) {
    if (!ttip) {
      ttip = document.createElement('div');
      ttip.className = 'pulse-ds cd-ttip';
      ttip.setAttribute('role', 'tooltip');
      document.body.appendChild(ttip);
    }
    ttip.textContent = el.dataset.ttip;
    ttip.classList.remove('is-up');
    ttip.style.left = '0px';
    ttip.style.top = '0px';
    var r = el.getBoundingClientRect();
    var w = ttip.offsetWidth,
      h = ttip.offsetHeight;
    var up = r.bottom + h + 14 > window.innerHeight;
    var x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    ttip.style.left = x + 'px';
    ttip.style.top = (up ? r.top - h - 8 : r.bottom + 8) + 'px';
    ttip.style.setProperty('--nx', r.left + r.width / 2 - x + 'px');
    ttip.classList.toggle('is-up', up);
    ttip.classList.add('is-on');
  }
  document.addEventListener(
    'mouseover',
    function (e) {
      var el = e.target.closest && e.target.closest('[title], [data-ttip]');
      if (!el || !(root.contains(el) || el.closest('#cal-root, #cal-layer, .cal-hover'))) {
        if (ttipFor && !(e.target.closest && e.target.closest('[data-ttip]') === ttipFor)) ttipHide();
        return;
      }
      if (el.hasAttribute('title')) {
        var t = el.getAttribute('title');
        el.removeAttribute('title');
        if (!t) return;
        el.dataset.ttip = t;
        if (!el.hasAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', t);
      }
      if (el === ttipFor) return;
      ttipHide();
      ttipFor = el;
      ttipTimer = setTimeout(function () {
        if (ttipFor === el && document.contains(el)) ttipShow(el);
      }, 350);
    },
    true
  );
  document.addEventListener('mousedown', ttipHide, true);
  document.addEventListener('scroll', ttipHide, true);

  // each card slides from where it was to where it is now
  function swapCards(from) {
    root.querySelectorAll('[data-swap]').forEach(function (e) {
      var was = from[e.dataset.swap];
      if (was == null || !e.animate) return;
      var d = was - e.getBoundingClientRect().top;
      if (Math.abs(d) < 2) return;
      e.animate(
        [
          { transform: 'translateY(' + d + 'px)', opacity: 0.6 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    });
  }

  function afterRender() {
    state.nudge = false;
    fitTags();
    placeHist();
    var ff = flowStep();
    if (ff && ff.target && Date.now() < flowGlowUntil) {
      var tg = root.querySelector(ff.target);
      if (tg) tg.classList.add('is-flowhint');
    }
    markStuck();
    fitConfirmList();
    if (state.coach && !choosing()) dropCoach();
    if (!state.coach && !coachTimer && choosing() && !coachSeen()) showCoach(1100);
    var auto = root.querySelector('[data-autofocus="1"]');
    root
      .querySelectorAll('textarea.cd-ta, textarea.sp-field, textarea.sp-compose__ta, textarea.sb2-le__ta')
      .forEach(autosize);
    if (
      auto &&
      !state.toast &&
      document.activeElement &&
      !document.activeElement.matches('textarea')
    ) {
      // focus only when the page was just opened, not on every re-render
      if (state.focusOnce) {
        auto.focus();
        auto.setSelectionRange(auto.value.length, auto.value.length);
        state.focusOnce = false;
      }
    }
    var t = root.querySelector('.cd-toast');
    if (t && gsapOk && !reduced && !t.dataset.shown) {
      t.dataset.shown = '1';
      gsap.from(t, { y: 10, opacity: 0, duration: 0.28, ease: 'power3.out' });
    }
    var modal = root.querySelector('.cd-modal__card');
    if (modal && gsapOk && !reduced && !state.modalShown) {
      gsap.from(modal, { y: 10, scale: 0.98, opacity: 0, duration: 0.26, ease: 'power3.out' });
    }
    state.modalShown = !!modal;
  }

  var _openScene = openScene;
  openScene = function (i, focus) {
    state.focusOnce = true;
    _openScene(i, focus);
  };

  // ------------------------------------------------------------- switcher
  function syncUrl(v) {
    var p = new URLSearchParams();
    if (state.format !== 'video') p.set('f', state.format);
    var st = v || briefState();
    // the default is a post whose video isn't planned yet
    if (st && st !== (isVideo() ? 'unplanned' : 'planned')) p.set('s', st);
    if (state.sbCase !== 'words' && (st === 'planned' || st === 'stale')) p.set('sc', state.sbCase);
    if (state.sumbar !== 'facts') p.set('sm', state.sumbar);
    if (state.showTodo) p.set('tc', '1');
    var q = p.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
  }

  function seg(opts, cur, key) {
    return (
      '<div class="cd-sw__seg" role="group">' +
      opts
        .map(function (o) {
          return (
            '<button type="button" class="cd-sw__opt' +
            (o[0] === cur ? ' is-on' : '') +
            '" data-sw="' +
            key +
            '" data-val="' +
            o[0] +
            '">' +
            o[1] +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function briefState() {
    if (state.failed) return 'failed';
    if (state.published) return 'published';
    var st = stage();
    if (st !== 'brief') return st;
    if (!isVideo()) return 'planned';
    return !state.planned
      ? 'unplanned'
      : state.stale
        ? 'stale'
        : state.drawing
          ? 'drawing'
          : 'planned';
  }

  var swScroll = 0;
  sw.addEventListener(
    'scroll',
    function (e) {
      if (e.target.classList && e.target.classList.contains('cd-sw__panel') && swOpen)
        swScroll = e.target.scrollTop;
    },
    true
  );

  function renderSwitcher() {
    sw.className = 'cd-sw pulse-ds' + (swHidden ? ' is-hidden' : '');
    sw.innerHTML =
      '<button type="button" class="cd-sw__tab" aria-expanded="' +
      swOpen +
      '">' +
      ic('layers', 15) +
      '<span>Prototype</span>' +
      (window.CD_API && window.CD_API.panelTag ? '<b>' + window.CD_API.panelTag() + '</b>' : '') +
      '<b>' +
      {
        unplanned: 'Not planned',
        stale: 'Look changed',
        planned: isVideo() ? 'Planned' : 'Brief',
        drawing: 'Drawing',
        generating: 'Generating',
        failed: 'Failed',
        review: 'Review',
        scheduled: 'Scheduled',
        published: 'Published',
      }[briefState()] +
      '</b><b>' +
      { video: 'Video', carousel: 'Carousel', text: 'Text' }[state.format] +
      '</b>' +
      (state.flow != null ? '<b class="is-flow">Walkthrough ' + (state.flow + 1) + '/' + FLOW.length + '</b>' : '') +
      ic(swOpen ? 'chevD' : 'chevU', 14) +
      '</button>' +
      '<div class="cd-sw__panel"' +
      (swOpen ? '' : ' hidden') +
      '><p class="cd-sw__title">Prototype controls</p>' +
      (window.CD_API && window.CD_API.panelRows ? window.CD_API.panelRows() : '') +
      (isVideo()
        ? '<div class="cd-sw__row cd-sw__row--flow"><span class="cd-sw__label">Storyboard walkthrough</span>' +
          (state.flow == null
            ? '<p class="cd-sw__desc">The storyboard\u2019s cases strung into one flow: a scene changes, its redraw times out and is refused, another is drawn but not saved, a picture can\u2019t be read, a line moves, then approve, generate and stop. Each step says where to click next.</p>' +
              seg([['start', 'Start the walkthrough']], '', 'flow')
            : flowHint(false)) +
          '</div>'
        : '') +
      '<p class="cd-sw__hint">The post drawer, redrawn: the Brief as three numbered cards and a Next card, one generation list over the storyboard, lines on the scenes they are said in, and a scene page inside the drawer.</p>' +
      '<div class="cd-sw__row"><span class="cd-sw__label">Post format</span>' +
      seg(
        [
          ['video', 'Video'],
          ['carousel', 'Carousel'],
          ['text', 'Text post'],
        ],
        state.format,
        'format'
      ) +
      '<p class="cd-sw__desc">' +
      {
        video:
          'A vertical video: Brief \u2192 Storyboard \u2192 Review. Only a video has a storyboard.',
        carousel:
          'The captured carousel (2 images): Brief \u2192 Review. The slides are planned in the brief and drawn at generation.',
        text: 'A text post: Brief \u2192 Review. The post is written at generation.',
      }[state.format] +
      '</p></div>' +
      '<div class="cd-sw__row"><span class="cd-sw__label">Where the post is</span>' +
      seg(
        (isVideo()
          ? [
              ['unplanned', 'Not planned'],
              ['drawing', 'Drawing'],
              ['planned', 'Planned'],
              ['stale', 'Look changed'],
            ]
          : [['planned', 'Brief']]
        ).concat([
          ['generating', 'Generating'],
          ['failed', 'Failed'],
          ['review', 'Review'],
          ['scheduled', 'Scheduled'],
          ['published', 'Published'],
        ]),
        briefState(),
        'state'
      ) +
      '<p class="cd-sw__desc">' +
      {
        planned: isVideo()
          ? 'Storyboard in use; Scene 1\u2019s preview is out of date (words changed), one question to answer before approval.'
          : 'The brief, with its slides or shape planned in place. Next is Approve & generate.',
        drawing:
          'Just planned: the previews are being drawn one by one. The brief shows them landing.',
        unplanned:
          'A new brief: the plan is text, Next is Plan the storyboard, the Storyboard tab is empty.',
        stale:
          'The look and tone changed after planning: no preview is in use, approval is off, Next is Update storyboard.',
        generating: 'Approved: the post is being made. Steps, what is being made, Stop.',
        review:
          'Made and waiting for content approval: the post as it will read, edit the text, request changes, Approve & schedule.',
        failed: 'Generation broke partway. What was made so far stays; Generate again starts over.',
        scheduled: 'Approved and scheduled. It goes out on its own at its time.',
        published: 'It went out. Nothing about the post can change now; tags still can.',
      }[briefState()] +

      '</p>' +
      '<p class="cd-sw__links"><button type="button" data-go="brief">Brief</button>' +
      (isVideo()
        ? '<button type="button" data-go="storyboard">Storyboard</button><button type="button" data-go="scene">Scene 2 page</button>'
        : '') +
      '<button type="button" data-go="approve">Approve flow</button><button type="button" data-go="reset">Reset</button></p></div>' +
      (isVideo() && state.planned && stage() === 'brief'
        ? '<div class="cd-sw__row"><span class="cd-sw__label">Storyboard case</span>' +
          seg(SB_CASES, state.stale ? 'look' : state.sbCase, 'sbcase') +
          '<p class="cd-sw__desc">' +
          SB_CASE_SAY[state.stale ? 'look' : state.sbCase] +
          '</p></div>'
        : '') +
      '<div class="cd-sw__row"><span class="cd-sw__label">First-visit guide</span>' +
      seg([['show', 'Show it again']], '', 'coach') +
      '<p class="cd-sw__desc">Each time the page loads and a post\u2019s video isn\u2019t planned yet, a tip points at the round own-video button beside the next step: your own video can be used instead. The next-step button hops now and then as the main action.</p></div>' +
      '<div class="cd-sw__row"><span class="cd-sw__label">To confirm</span>' +
      seg(
        [
          ['off', 'Hidden'],
          ['on', 'Shown'],
        ],
        state.showTodo ? 'on' : 'off',
        'todo'
      ) +
      '<p class="cd-sw__desc">' +
      (state.showTodo
        ? 'The To confirm card is on the page (in C, the confirm bar near the top).'
        : 'The post has nothing to confirm. Show the To confirm state here, or press C.') +
      '</p></div>' +
      '<p class="cd-sw__keys"><kbd>C</kbd> to confirm · in a scene: <kbd>←</kbd> <kbd>→</kbd> scenes, <kbd>Esc</kbd> back · <kbd>V</kbd> folds this panel · <kbd>H</kbd> takes the tab off the screen</p>' +
      '</div>';
    if (state.flow != null && !swOpen) sw.insertAdjacentHTML('beforeend', flowHint(true));
    var pn = sw.querySelector('.cd-sw__panel');
    if (pn && swOpen) pn.scrollTop = swScroll;
  }

  sw.addEventListener('click', function (e) {
    if (e.target.closest('.cd-sw__tab')) {
      swOpen = !swOpen;
      renderSwitcher();
      return;
    }
    var o = e.target.closest('[data-sw]');
    if (o) {
      var k = o.dataset.sw,
        v = o.dataset.val;
      if (k === 'primary') {
        state.primary = v;
        syncUrl();
        render();
      } else if (k === 'format') {
        state.design = state.design || 'new';
        setFormat(v);
      } else if (k === 'sumbar') {
        state.sumbar = v;
        if (stage() === 'brief') state.tab = 'storyboard';
        state.scene = null;
        syncUrl();
        render();
      } else if (k === 'sbcase') {
        state.flow = null;
        applyCase(v);
      } else if (k === 'flow') {
        if (v === 'start') {
          state.design = 'new';
          if (state.format !== 'video') setFormat('video');
          flowGo(0);
        } else if (v === 'skip') flowSkip();
        else {
          clearTimeout(flowTimer);
          state.flow = null;
          render();
        }
      } else if (k === 'coach') {
        coachSeen(false);
        if (!choosing()) {
          state.design = 'new';
          resetTo('unplanned');
        }
        state.tab = 'brief';
        state.scene = null;
        state.modeMenu = false;
        state.open = true;
        showCoach(400);
      } else if (k === 'todo') {
        state.showTodo = v === 'on';
        syncUrl();
        render();
      } else if (k === 'state') {
        resetTo(v);
      }
      return;
    }
    var go = e.target.closest('[data-go]');
    if (go) {
      var g = go.dataset.go;
      state.design = 'new';
      state.open = true;
      if (g === 'reset') resetTo('unplanned');
      else if (g === 'scene') {
        state.planned = true;
        openScene(1);
      } else if (g === 'approve') {
        if (stage() !== 'brief') resetTo('planned');
        state.planned = true;
        state.stale = false;
        state.tab = isVideo() ? 'storyboard' : 'brief';
        state.scene = null;
        state.modal = { type: 'confirm' };
        render();
      } else {
        state.tab = g;
        state.scene = null;
        render();
      }
    }
  });

  // ---- the storyboard's cases (switcher row "Storyboard case", ?sc=): each
  // puts the planned post into one of the states the rules describe, on the
  // storyboard tab. All start from every preview in use, except Words changed
  // (the post as it comes) and Look changed (the stale storyboard).
  var SB_CASES = [
    ['words', 'Words changed'],
    ['ready', 'All in use'],
    ['picture', 'Picture changed'],
    ['voice', 'Voice changed'],
    ['moved', 'Line moved'],
    ['placed', 'Placed by Vicino'],
    ['long', 'Line too long'],
    ['refused', 'Refused'],
    ['broken', 'Picture unreadable'],
    ['unsaved', 'Not saved'],
    ['checking', 'Checking'],
    ['desc', 'From description'],
    ['silent', 'Silent'],
    ['look', 'Look changed'],
    ['review', 'Rewrite review'],
    ['confirm', 'Confirm dialog'],
  ];
  var SB_CASE_SAY = {
    words:
      'Scene 1\u2019s words changed after its preview was drawn: Out of date \u00b7 Words changed. A question to answer; approval asks first.',
    ready: 'Every preview in use, nothing to decide: Ready to approve.',
    picture:
      'Scene 2 uses your own picture (product-front.jpg): it goes into the video as it is, and Vicino\u2019s preview is set aside. Nothing to answer.',
    voice:
      'The voice changed to Voiceover: every preview was made for a different voice. One question per scene.',
    moved:
      'Talking: Scene 3\u2019s line moved to Scene 1. Someone speaks there now, so Scene 1\u2019s preview is out of date, and Scene 3\u2019s too, as no one speaks there now.',
    placed:
      'A scene was deleted and Vicino placed its line in Scene 3. A question: keep it there, or move it.',
    long: 'Scene 3\u2019s line has more words than 6s holds. Make the scene longer; at 8s it still runs over, so split it in two.',
    refused:
      'The content check refused Scene 2\u2019s preview. Charged: no; the same words get the same answer, so the way on is changing what the scene shows.',
    broken:
      'Scene 2\u2019s own picture can\u2019t be read. Must fix: approval is off, and no confirm can skip it. Use a different image, or remove it.',
    unsaved:
      'Scene 1 was redrawn and charged, but the new preview couldn\u2019t be saved. The earlier one stays in use; keep it, or try again.',
    checking:
      'Redrawing Scene 2 timed out. Checking\u2026: no Charged or Free yet, and Try again waits until the check is done.',
    desc: 'Previews only when asked, and none drawn: every scene is made from its description. Only a note, nothing to decide.',
    silent: 'Voice Silent: no one speaks, so the lines fold into one line.',
    look: 'The look changed after planning: the whole storyboard is out of date. Must fix: Update storyboard, or restore the look.',
    review:
      'Rewrite with Vicino planned a candidate: what is kept, changed, lost, and the previews, before Use the new one or Keep current.',
    confirm:
      'Approve & generate with questions open: the dialog lists each one, and pressing approve accepts them.',
  };

  function applyCase(k) {
    var look = k === 'look';
    resetTo(look ? 'stale' : 'planned');
    state.sbCase = k;
    state.tab = 'storyboard';
    var sc = state.scenes;
    var ready = function (x) {
      x.preview = { state: 'ready', attempts: 1, charged: 'yes' };
    };
    if (!look && k !== 'words' && k !== 'confirm') ready(sc[0]);
    if (k === 'picture') {
      // your picture in use; Vicino's preview set aside, not asked about
      sc[1].userImage = 'product-front.jpg';
    } else if (k === 'voice') {
      state.brief.voice = 'voiceover';
      sc.forEach(function (x) {
        x.preview.state = 'stale';
        x.preview.reason = 'Made for a different voice';
      });
    } else if (k === 'moved') {
      sc[0].line = sc[2].line;
      sc[2].line = null;
      sc[0].preview = {
        state: 'stale',
        reason: 'Someone speaks here now',
        attempts: 1,
        charged: 'yes',
      };
      sc[2].preview = {
        state: 'stale',
        reason: 'No one speaks here now',
        attempts: 1,
        charged: 'yes',
      };
    } else if (k === 'placed' || k === 'confirm') {
      sc[2].lineBy = true;
    } else if (k === 'long') {
      sc[2].line =
        'What do I need to check before adding it to Catalog, and which details will an AI shopping assistant read first when someone asks about it?';
    } else if (k === 'refused') {
      sc[1]._img = sc[1].img;
      sc[1].img = null;
      sc[1].preview = { state: 'refused', attempts: 3, charged: 'no' };
    } else if (k === 'broken') {
      sc[1].userImage = 'product-front.heic';
      sc[1].imageBad = true;
    } else if (k === 'unsaved') {
      sc[0].preview = { state: 'ready', attempts: 2, charged: 'yes', unsaved: true };
    } else if (k === 'checking') {
      sc[1].preview = { state: 'checking', attempts: 2, charged: 'yes' };
    } else if (k === 'desc') {
      state.previewMode = 'ask';
      sc.forEach(function (x) {
        x._img = x._img || x.img;
        x.img = null;
        x.preview = { state: 'none', attempts: 0 };
      });
    } else if (k === 'silent') {
      state.brief.voice = 'silent';
    }
    if (k === 'review') state.modal = { type: 'review' };
    if (k === 'confirm') state.modal = { type: 'confirm' };
    syncUrl();
    render();
  }

  // ---- the storyboard walkthrough (round 73): the cases strung into one
  // flow, as side-chats strings write → review → apply with its failures.
  // Each step says what you see and where to click next; the thing to click
  // glows, and the step moves on when you do it. A few steps make the next
  // failure happen (a redraw that times out and is refused, one that is drawn
  // but not saved, a picture that can't be read).
  function sc(i) {
    return state.scenes[i];
  }

  var FLOW = [
    {
      t: 'Every preview in use',
      see: 'The storyboard as planned: four scenes, each starting from its preview. Nothing to confirm.',
      next: 'Click Scene 2 to open it.',
      target: '.sb2-tile[data-sc="1"] .sb2-tile__scene',
      on: ['open-scene', '1'],
      enter: function () {
        applyCase('ready');
      },
    },
    {
      t: 'Change what the camera sees',
      see: 'Scene 2 opens beside its picture. Its words decide what its preview shows.',
      next: 'Change the words under What the camera sees, then press Save changes in the footer.',
      target: '.sp [data-draft="text"]',
      on: ['scene-save'],
      before: function () {
        if (state.scene === null) openScene(1);
        if (state.draft.text.trim() === sc(1).text.trim()) {
          state.draft.text = state.draft.text.trim() + ' The box stays in focus.';
          state.unsaved = true;
        }
      },
    },
    {
      t: 'Its preview is out of date',
      see: 'Scene 2 now says Out of date · words changed, and the bar at the top asks about it. Until you answer, Scene 2 is made from its words alone.',
      next: 'Open the bar at the top, press Decide on Scene 2, then Draw it again.',
      target: '.sb2 .cdb-cbar__sum',
      on: ['regen', '1'],
      // this redraw times out: Checking…, then the content check refuses it
      intercept: function () {
        var s = sc(1);
        s.preview = { state: 'checking', attempts: (s.preview.attempts || 1) + 1, charged: 'yes' };
        state.todoOpen = false;
        flowGo(3);
      },
    },
    {
      t: 'Taking longer than usual',
      see: 'Checking: nobody knows yet whether the picture was made, so Charged isn’t shown and Draw it again waits.',
      next: 'Wait a few seconds.',
      auto: [
        3400,
        function () {
          var s = sc(1);
          s._img = s.img;
          s.img = null;
          s.preview = { state: 'refused', attempts: s.preview.attempts, charged: 'no' };
          toast('<b>Scene 2’s preview was refused</b> by the content check. Not charged.');
          flowGo(4);
        },
      ],
    },
    {
      t: 'Refused by the content check',
      see: 'Not charged. Asking again with the same words gets the same answer, so Draw it again gives way to changing the words.',
      next: 'Open Scene 2. On its Preview picture tab press Change what the scene shows, change the words and press Save changes.',
      target: '.sb2-tile[data-sc="1"] .sb2-tile__scene',
      on: ['scene-save'],
      before: function () {
        if (state.scene === null) openScene(1);
        if (state.draft.text.trim() === sc(1).text.trim()) {
          state.draft.text = 'The same founder sets the boxed product beside a laptop and looks at the box, not the screen.';
          state.unsaved = true;
        }
      },
      after: function () {
        sc(1).preview = { state: 'none', attempts: 3, charged: 'no' };
      },
      skip: function () {
        sc(1).text = 'The same founder sets the boxed product beside a laptop and looks at the box, not the screen.';
        sc(1).preview = { state: 'none', attempts: 3, charged: 'no' };
        bump('scene');
      },
    },
    {
      t: 'Words only, for now',
      see: 'The new words have no preview yet, so Scene 2 says Words only. That is only a note: nothing to decide.',
      next: 'Open Scene 2, go to its Preview picture tab and press Draw a preview.',
      target: '.sb2-tile[data-sc="1"] .sb2-tile__scene',
      on: ['regen', '1'],
    },
    {
      t: 'Drawing',
      see: 'Vicino draws it from the new words; the card shows it in progress, then it lands.',
      next: 'When it lands, go back with ← Storyboard and open Scene 3.',
      target: '.cd-scenehead__back',
      on: ['open-scene', '2'],
    },
    {
      t: 'Another take of Scene 3',
      see: 'Scene 3’s preview is in use. Say you want another take of it.',
      next: 'On Scene 3’s Preview picture tab, press Draw it again.',
      target: '.sp-acts [data-act="regen"]',
      on: ['regen', '2'],
      // this one is drawn and charged, but can't be saved
      intercept: function () {
        var s = sc(2);
        s.preview = { state: 'drawing', attempts: 1, charged: 'yes' };
        render();
        setTimeout(function () {
          if (state.flow !== 7) return;
          s.preview = { state: 'ready', attempts: 2, charged: 'yes', unsaved: true };
          toast('<b>Scene 3’s new preview couldn’t be saved.</b> The earlier one stays in use.');
          flowGo(8);
        }, 2200);
      },
    },
    {
      t: 'Drawn, but not saved',
      see: 'Charged: yes. The new one couldn’t be saved, so the earlier preview is still in use.',
      next: 'Press Keep the earlier one.',
      target: '[data-act="keep-prev"]',
      on: ['keep-prev', '2'],
    },
    {
      t: 'Use your own picture',
      see: 'A real product photo can go into a scene as it is.',
      next: 'On the same tab, under Your own picture, press Use an image.',
      target: '.sp-drop',
      on: ['use-image', '2'],
      // the picture picked here can't be read
      intercept: function () {
        var s = sc(2);
        s.userImage = 'product-front.heic';
        s.imageBad = true;
        bump('image');
        toast('<b>product-front.heic can’t be read.</b> Replace it or remove it before approving.');
        flowGo(10);
      },
    },
    {
      t: 'The picture can’t be read',
      see: 'This one must be fixed: back on the storyboard Approve & generate is off, and no dialog can skip it.',
      next: 'Press Use a different image.',
      target: '[data-act="use-image-new"]',
      on: ['use-image-new', '2'],
    },
    {
      t: 'Move a spoken line',
      see: 'Your new picture is in use for Scene 3 now; Vicino’s preview is set aside until you pick it again or draw a new one. Lines can move between scenes too.',
      next: 'Go back with ← Storyboard and drag Scene 2’s spoken line onto Scene 1.',
      target: '.sb2-tile[data-sc="1"] .sb2-lc, .sb2-tile[data-sc="1"] .sb2-sub',
      on: ['line-drop'],
      skip: function () {
        state.scene = null;
        state.lineEdit = { i: 1, text: sc(1).line || '', to: 0 };
        saveLine();
      },
    },
    {
      t: 'Approve with questions open',
      see: 'Someone speaks in Scene 1 now and no one in Scene 2, so their previews are out of date. Approval stays open: it asks first.',
      next: 'Press Approve & generate in the footer, read the list, then Approve & generate in the dialog.',
      target: '.cd-foot .cd-cta__btn',
      on: ['approve-go'],
    },
    {
      t: 'Generating',
      see: 'The post is being made from this version, with each accepted answer.',
      next: 'Press Stop in the footer.',
      target: '[data-act="stop"]',
      on: ['stop'],
    },
    {
      t: 'Stopped',
      see: 'What was finished is charged. Generate again starts from the beginning.',
      next: 'Press Cancel generation to go back and edit.',
      target: '[data-act="gen-cancel"]',
      on: ['gen-cancel'],
    },
    {
      t: 'Done',
      see: 'A draft again, ready to edit. The cases not in this walk (Look changed, Rewrite review, Placed by Vicino, Line too long, Silent) are under Storyboard case.',
      next: 'End the walkthrough, or start again.',
      end: true,
    },
  ];

  function flowStep() {
    return state.flow == null ? null : FLOW[state.flow];
  }

  function flowHit(f, name, arg) {
    if (!f.on || f.on[0] !== name) return false;
    return f.on[1] == null || String(arg) === f.on[1];
  }

  var flowTimer = null;
  var flowGlowUntil = 0;
  function flowGo(i) {
    clearTimeout(flowTimer);
    state.flow = i;
    flowGlowUntil = Date.now() + 1300;
    if (i === 0) state.showTodo = true;
    var f = FLOW[i];
    if (f.enter) f.enter();
    if (f.auto)
      flowTimer = setTimeout(function () {
        if (state.flow === i) f.auto[1]();
      }, f.auto[0]);
    swOpen = false;
    render();
  }

  // skipping a step does what it asks
  function flowSkip() {
    var f = flowStep();
    if (!f || f.end) return;
    if (f.skip) {
      f.skip();
      flowGo(state.flow + 1);
    } else if (f.on) act(f.on[0], f.on[1] != null ? f.on[1] : String(state.scene || 1));
    else if (f.auto) f.auto[1]();
  }

  function flowHint(compact) {
    var f = flowStep();
    if (!f) return '';
    return (
      '<div class="cd-flow' +
      (compact ? ' is-compact' : '') +
      '"><span class="cd-flow__n">Step ' +
      (state.flow + 1) +
      ' of ' +
      FLOW.length +
      '</span><b class="cd-flow__t">' +
      f.t +
      '</b>' +
      (compact ? '' : '<p class="cd-flow__see">' + f.see + '</p>') +
      '<p class="cd-flow__next"><span>' +
      (f.end ? 'Done' : f.auto ? 'Wait' : 'Next') +
      '</span>' +
      f.next +
      '</p><span class="cd-flow__acts">' +
      (f.end
        ? '<button type="button" data-sw="flow" data-val="start">Start again</button>'
        : '<button type="button" data-sw="flow" data-val="skip">Do it for me</button>') +
      '<button type="button" data-sw="flow" data-val="end">End</button></span></div>'
    );
  }

  function setFormat(f) {
    state.format = f;
    state.post = clone(fmtSrc(f).post);
    state.slides = clone(fmtSrc(f).slides);
    state.copy = D.result[f].copy;
    // the default: a video not planned yet (other formats fall back to planned)
    resetTo('unplanned');
  }

  // v: planned | drawing | unplanned | stale (video only) | generating | review | scheduled
  function resetTo(v) {
    clearInterval(state.genTimer);
    clearInterval(state.drawTimer);
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    var src = fmtSrc();
    var video = isVideo();
    if (!video && ['drawing', 'unplanned', 'stale'].indexOf(v) > -1) v = 'planned';
    state.planned = v !== 'unplanned';
    state.stale = v === 'stale';
    state.drawing = false;
    state.lookPrev = v === 'stale' ? src.brief.look : null;
    state.post = clone(src.post);
    state.scenes = clone(src.scenes);
    state.slides = clone(src.slides);
    state.brief = clone(src.brief);
    state.copy = D.result[state.format].copy;
    state.refs = clone(D.references);
    state.captions = video ? clone(D.captions) : [];
    state.decided = {};
    state.product = null;
    state.ownAsset = null;
    state.gen = null;
    state.genPct = 0;
    state.failed = false;
    state.published = false;
    state.scheduled = false;
    state.copyEdit = false;
    state.req = null;
    state.changed = null;
    state.lightbox = null;
    state.checksOpen = false;
    state.postedOpen = false;
    state.edit = null;
    state.draft = {};
    state.scene = null;
    state.modal = null;
    state.pop = null;
    state.toast = null;
    state.rewrite = false;
    state.sbRewrite = false;
    state.unsaved = false;
    state.lineEdit = null;
    state.sbCase = 'words';
    state.version = src.post.version;
    state.approved = null;
    state.when = src.post.when;
    state.tab = 'brief';
    state.open = true;
    state.nudge = true;
    if (v === 'stale') {
      state.brief.look =
        'Cool blue morning light, handheld, slight grain. Keep the product sharp against the store.';
      state.version += 1;
    }
    if (v === 'unplanned')
      state.scenes.forEach(function (s) {
        s.img = null;
        s.preview = { state: 'none', attempts: 0 };
      });
    syncUrl(v);
    if (v === 'drawing') {
      state.tab = 'brief';
      startDrawing();
      render();
      return;
    }
    if (['generating', 'failed', 'review', 'scheduled', 'published'].indexOf(v) > -1) {
      state.approved = state.version;
      state.decided.product = true;
      var rc = counts();
      rc.decide.forEach(function (i) {
        state.decided[state.scenes[i].id] = true;
      });
      rc.lines.forEach(function (i) {
        state.decided['line-' + state.scenes[i].id] = true;
      });
      state.tab = 'result';
      if (v === 'generating') {
        startGen(34);
        return;
      }
      if (v === 'failed') {
        state.gen = 'stopped';
        state.genPct = 34;
        state.failed = true;
        render();
        return;
      }
      state.gen = 'done';
      if (v === 'scheduled' || v === 'published') {
        state.scheduled = true;
        state.published = v === 'published';
        state.when = SLOTS[0].when;
      }
    }
    render();
  }

  // ------------------------------------------------------------- the page
  // The Calendar page (src/calendar.js) opens a post here and hears when the
  // drawer closes. It passes data only: the drawer draws as it always has.
  function pageSnapshot() {
    return { brief: briefState(), gen: state.gen, scheduled: state.scheduled, when: state.when };
  }

  function pageClosed(archived) {
    if (location.search) history.replaceState(null, '', location.pathname + location.hash);
    var snap = pageSnapshot();
    snap.archived = !!archived;
    if (window.CD_API.onClose) window.CD_API.onClose(snap);
  }

  window.CD_API = {
    onClose: null,
    // the page's rows in the Prototype panel, drawn again when they change
    refreshPanel: function () {
      renderSwitcher();
    },
    // the page's tags for the open post, whenever they change
    setTags: function (t) {
      state.tags = t;
      if (state.open) render();
    },
    // p: { title, format, where, when, stopped, slots, tags }
    open: function (p) {
      SLOTS = p.slots;
      state.format = p.format;
      state.slides = clone(fmtSrc(p.format).slides);
      resetTo(p.where);
      if (p.stopped) {
        clearInterval(state.genTimer);
        state.gen = 'stopped';
      }
      state.post.title = p.title;
      state.when = p.when;
      state.tags = p.tags;
      state.entered = false;
      state.open = true;
      render();
      syncUrl();
      history.replaceState(null, '', location.pathname + location.hash);
      return pageSnapshot();
    },
  };

  // ------------------------------------------------------------------ boot
  var bootClosed = !(params.get('s') || params.get('sc') || params.get('f') || params.get('tc'));
  var bootStage = params.get('s') || (initFormat === 'video' ? 'unplanned' : '');
  var bootCase = params.get('sc');
  if (
    isVideo() &&
    bootCase &&
    SB_CASES.some(function (o) {
      return o[0] === bootCase;
    })
  )
    applyCase(bootCase);
  else if (
    ['stale', 'unplanned', 'drawing', 'generating', 'failed', 'review', 'scheduled', 'published'].indexOf(bootStage) > -1
  )
    resetTo(bootStage);
  else render();
  // the page opens on the Calendar; a post's drawer opens from it
  if (bootClosed) {
    state.open = false;
    state.entered = false;
    render();
  }
})();
