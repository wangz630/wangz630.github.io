/* Brain prototype - runtime core.

   Owns: derived data, UI state (persisted to the URL + localStorage), the view
   registry, the render pipeline, cross-tab links and the shared motion helpers.
   Every design version registers renderers through `Brain.register(kind, version,
   impl)`; `kind` is one of page / report / knowledge. Ask and Index map are shared
   views that inherit whichever page version is active.

   Round 2 versions: Current (live), D (the round-1 picks - page C, report C,
   knowledge B - rebuilt from feedback), E and F (database directions). Round 1's
   A / B / C are frozen in ../round-1/. */
(function () {
  'use strict';

  const D = window.BRAIN_DATA;
  const R = window.BRAIN_ROADMAP;
  const REAL_TODAY = '2026-10-11';

  /* ---------------------------------------------------------------- helpers */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const toDate = (iso) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };
  const isoOf = (dt) => dt.toISOString().slice(0, 10);
  const addDays = (iso, n) => {
    const dt = toDate(iso);
    dt.setUTCDate(dt.getUTCDate() + n);
    return isoOf(dt);
  };
  const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
  // a plan that nobody has approved has no approval date, so an absent one prints
  // as nothing rather than throwing
  const fmtShort = (iso) => {
    if (!iso) return '';
    const dt = toDate(iso);
    return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
  };
  const fmtLong = (iso) => `${fmtShort(iso)}, ${toDate(iso).getUTCFullYear()}`;
  const fmtNumeric = (iso) => {
    const dt = toDate(iso);
    return `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}/${dt.getUTCFullYear()}`;
  };
  // Learned timestamps are UTC; the product prints them in the reader's zone
  // (01:21 UTC on Sep 16 reads "Sep 15" in New York), so these go through locale.
  const fmtStamp = (ts) =>
    new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  const fmtTsShort = (ts) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const relDays = (iso, today) => {
    const n = diffDays(iso, today);
    if (n === 0) return 'today';
    if (n === 1) return 'yesterday';
    if (n > 1) return `${n} days ago`;
    return `in ${-n} days`;
  };

  /* Evidence strings carry the located wording between ⟦ ⟧. */
  const evidenceHtml = (text, cls = 'bx-mark') =>
    esc(text).replace(/⟦([\s\S]*?)⟧/g, `<mark class="${cls}">$1</mark>`);
  const evidencePlain = (text) => String(text || '').replace(/[⟦⟧]/g, '');
  const locatedWording = (text) => {
    const m = String(text || '').match(/⟦([\s\S]*?)⟧/);
    return m ? m[1] : null;
  };

  /* ------------------------------------------------------------------ icons */

  const ICON_PATHS = {
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    trash:
      '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-up-down':
      '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    external:
      '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    refresh:
      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    page: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    fact: '<path d="M12 3 4 7v5c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V7Z"/><path d="m9 12 2 2 4-4"/>',
    globe:
      '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    target:
      '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'list-checks':
      '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    exit: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    calendar:
      '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    sparkles:
      '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
    sliders:
      '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    layers:
      '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    // a control that asks something rather than doing it
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    // a plain arrow turning back on itself - it reads at 13px, a broken ring does not
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a5.5 5.5 0 0 1 0 11h-4"/>',
    /* the sidebar's own Brain mark, drawn on a 23 grid - a reminder about Brain
       should wear the glyph the product already uses for it */
    brain:
      '<path d="M9.00833 4.8875C8.53917 4.65922 8.01951 4.55442 7.49854 4.58301C6.97757 4.6116 6.4725 4.77264 6.03113 5.05089C5.58977 5.32915 5.22669 5.71541 4.97626 6.17314C4.72583 6.63087 4.59633 7.14492 4.6 7.66667V7.95417C3.91606 8.11976 3.29911 8.49054 2.83191 9.01677C2.3647 9.543 2.0696 10.1995 1.98616 10.8983C1.90273 11.597 2.03497 12.3045 2.36514 12.926C2.6953 13.5474 3.20761 14.053 3.83333 14.375C3.83296 15.1974 4.15296 15.9876 4.72547 16.578C5.29799 17.1684 6.07797 17.5126 6.9 17.5375H7.1875C7.19812 18.0398 7.33593 18.5311 7.58806 18.9657C7.84019 19.4002 8.1984 19.7637 8.62919 20.0222C9.05998 20.2807 9.54928 20.4257 10.0513 20.4436C10.5534 20.4616 11.0518 20.352 11.5 20.125V3.54583C11.0042 3.5356 10.5143 3.65378 10.0777 3.88887C9.64106 4.12396 9.27269 4.46798 9.00833 4.8875Z"/><path d="M13.9917 4.8875C14.4608 4.65922 14.9805 4.55442 15.5015 4.58301C16.0224 4.6116 16.5275 4.77264 16.9689 5.05089C17.4102 5.32915 17.7733 5.71541 18.0237 6.17314C18.2742 6.63087 18.4037 7.14492 18.4 7.66667V7.95417C19.0839 8.11976 19.7009 8.49054 20.1681 9.01677C20.6353 9.543 20.9304 10.1995 21.0138 10.8983C21.0973 11.597 20.965 12.3045 20.6349 12.926C20.3047 13.5474 19.7924 14.053 19.1667 14.375C19.167 15.1974 18.847 15.9876 18.2745 16.578C17.702 17.1684 16.922 17.5126 16.1 17.5375H15.8125C15.8019 18.0398 15.6641 18.5311 15.4119 18.9657C15.1598 19.4002 14.8016 19.7637 14.3708 20.0222C13.94 20.2807 13.4507 20.4257 12.9487 20.4436C12.4466 20.4616 11.9482 20.352 11.5 20.125M8.05 8.9125C8.54765 9.28574 9.15294 9.4875 9.775 9.4875C10.3971 9.4875 11.0023 9.28574 11.5 8.9125C11.9977 9.28574 12.6029 9.4875 13.225 9.4875C13.8471 9.4875 14.4523 9.28574 14.95 8.9125M7.66667 14.375C8.3573 14.1822 9.08948 14.1976 9.77141 14.4192C10.4533 14.6408 11.0547 15.0588 11.5 15.6208C11.9453 15.0588 12.5467 14.6408 13.2286 14.4192C13.9105 14.1976 14.6427 14.1822 15.3333 14.375"/>',
    alert:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    pencil:
      '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'eye-off':
      '<path d="M10.73 5.08a10.74 10.74 0 0 1 11.21 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"/><path d="M14.08 14.16a3 3 0 0 1-4.24-4.24"/><path d="M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"/><path d="m2 2 20 20"/>',
    quote:
      '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    ask: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    map: '<circle cx="7.5" cy="7.5" r="1.2"/><circle cx="17.5" cy="6" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="7.5" cy="16.5" r="1.2"/><circle cx="17" cy="15" r="1.2"/><path d="M3 3v16a2 2 0 0 0 2 2h16"/>',
    table:
      '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    database:
      '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    route:
      '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    'panel-right': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    gap: '<path d="M10.1 2.18a10 10 0 0 1 3.8 0"/><path d="M13.9 21.82a10 10 0 0 1-3.8 0"/><path d="M17.61 3.72a10 10 0 0 1 2.69 2.7"/><path d="M2.18 13.9a10 10 0 0 1 0-3.8"/><path d="M20.28 17.61a10 10 0 0 1-2.7 2.69"/><path d="M21.82 10.1a10 10 0 0 1 0 3.8"/><path d="M3.72 6.39a10 10 0 0 1 2.7-2.69"/><path d="M6.39 20.28a10 10 0 0 1-2.69-2.7"/>',
    upload:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    history:
      '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    'search-x':
      '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    located:
      '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    rows: '<path d="M3 5h18"/><path d="M3 12h18"/><path d="M3 19h18"/>',
    'corner-down-right': '<path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
    camera:
      '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'id-card':
      '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    milestone:
      '<path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"/><path d="M12 13v8"/><path d="M12 3v3"/>',
    // fact kinds and database column types (Knowledge tables)
    package:
      '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="m16 3-2 18"/>',
    type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    play: '<path d="M6 4.5v15l13-7.5z"/>',
    spark:
      '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m5.6 5.6 2.8 2.8"/><path d="m15.6 15.6 2.8 2.8"/><path d="m18.4 5.6-2.8 2.8"/><path d="m8.4 15.6-2.8 2.8"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    // "the brand has none of this" - a closed circle, never a cross, which reads
    // as throwing the field away
    none: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    pointer:
      '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.04 9.69a.5.5 0 0 1 .65-.65l11 4.5a.5.5 0 0 1-.07.95l-4.35 1.04a1 1 0 0 0-.74.74l-1.04 4.35a.5.5 0 0 1-.95.07z"/>',
    phone:
      '<rect width="14" height="20" x="5" y="2" rx="2.5"/><path d="M11 18.5h2"/><path d="M9.5 5h5"/>',
    palette:
      '<path d="M12 2a10 10 0 1 0 0 20 1.7 1.7 0 0 0 1.2-2.9 1.6 1.6 0 0 1 1.2-2.8H17a5 5 0 0 0 5-5c0-4.4-4.5-7.3-10-7.3Z"/><circle cx="8.5" cy="9" r="1"/><circle cx="12.5" cy="6.5" r="1"/><circle cx="16.5" cy="9.5" r="1"/>',
  };
  const icon = (name, size = 16, cls = '') =>
    `<svg class="bx-icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;

  /* ----------------------------------------------------------- derived data */

  const FAMILY = { Facts: 'Fact', Documents: 'Page text', Captions: 'Image caption' };

  function splitLede(paragraphs) {
    const tokens = [];
    paragraphs.forEach((p, i) => {
      if (i > 0) tokens.push(['t', ' ']);
      p.forEach((t) => tokens.push(t));
    });
    const lede = [];
    const rest = [];
    let done = false;
    for (let i = 0; i < tokens.length; i++) {
      const [type, value] = tokens[i];
      if (done) {
        rest.push(tokens[i]);
        continue;
      }
      if (type === 'q') {
        lede.push(tokens[i]);
        // a quoted sentence that closes the lede: “…everywhere.” [1] Its …
        const next = tokens[i + 1];
        if (/[.!?]\s*$/.test(value) && (!next || next[0] === 'c' || /^\s/.test(next[1]))) {
          let j = i + 1;
          while (j < tokens.length && tokens[j][0] === 'c') lede.push(tokens[j++]);
          i = j - 1;
          done = true;
        }
        continue;
      }
      if (type !== 't') {
        lede.push(tokens[i]);
        continue;
      }
      const m = value.match(/[.!?](?=\s|$)/);
      if (!m) {
        lede.push(tokens[i]);
        continue;
      }
      const cut = m.index + 1;
      lede.push(['t', value.slice(0, cut)]);
      const tail = value.slice(cut);
      // cites that follow the full stop still belong to the lede sentence
      let j = i + 1;
      if (!tail.trim()) {
        while (j < tokens.length && tokens[j][0] === 'c') lede.push(tokens[j++]);
        i = j - 1;
      } else {
        rest.push(['t', tail]);
      }
      done = true;
    }
    // a sentence that closes after its cites ("…next [4][11]. It also…")
    if (rest.length && rest[0][0] === 't' && /^\s*[.!?]/.test(rest[0][1])) {
      const v = rest[0][1];
      const dot = v.search(/[.!?]/);
      lede.push(['t', v.slice(0, dot + 1)]);
      rest[0] = ['t', v.slice(dot + 1)];
    }
    return { lede, rest };
  }

  const tokensText = (tokens) =>
    tokens
      .filter((t) => t[0] !== 'c')
      .map((t) => (t[0] === 'q' ? `“${t[1]}”` : t[1]))
      .join('')
      .replace(/\s+/g, ' ')
      .replace(/\s([.,;:])/g, '$1')
      .trim();

  const fields = D.report.fields.map((f, index) => {
    const sources = (f.sections.find((s) => s.label === 'Sources') || {}).sources || [];
    const gaps = (f.sections.find((s) => s.label === 'Not in the index') || {}).items || [];
    const { lede, rest } = splitLede(f.paragraphs);
    const cites = {};
    sources.forEach((src, si) => {
      src.key = `${f.id}:${si}`;
      src.kind = src.family === 'Captions' ? 'image' : 'page';
      src.familyLabel = FAMILY[src.family] || src.family;
      src.excerpts.forEach((e) => {
        cites[e.n] = src;
      });
    });
    return {
      ...f,
      index,
      sources,
      gaps,
      lede,
      rest,
      cites,
      takeaway: tokensText(lede),
      excerptCount: sources.reduce((n, s) => n + s.excerpts.length, 0),
    };
  });
  const fieldById = Object.fromEntries(fields.map((f) => [f.id, f]));

  const CONFIDENCE = {
    direct: { label: 'Direct from source', short: 'Direct', tone: 'direct' },
    supported: { label: 'Supported by evidence', short: 'Supported', tone: 'supported' },
    inferred: { label: 'Inferred', short: 'Inferred', tone: 'inferred' },
    unconfirmed: { label: 'Unconfirmed', short: 'Unconfirmed', tone: 'unconfirmed' },
  };

  const sources = D.knowledge.sources.map((s) => ({ ...s }));
  const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
  const facts = D.knowledge.facts.map((f, i) => ({
    ...f,
    n: i + 1,
    src: sourceById[f.source],
    located: f.unlocated ? null : locatedWording(f.evidence),
    band: f.confidence >= 0.9 ? 'high' : f.confidence >= 0.85 ? 'medium' : 'low',
  }));
  const factById = Object.fromEntries(facts.map((f) => [f.id, f]));
  const KINDS = D.knowledge.kinds.map((k) => k.key);
  const BANDS = [
    { key: 'high', label: '0.90 and above' },
    { key: 'medium', label: '0.85 – 0.89' },
    { key: 'low', label: 'Below 0.85' },
  ];
  const EVIDENCE = [
    { key: 'located', label: 'Wording located' },
    { key: 'unlocated', label: 'Wording not found' },
    { key: 'replaced', label: 'Replaced' },
  ];

  // which report fields cite each fact (exact snippet match, built in data.js)
  const factUses = {};
  fields.forEach((f) =>
    f.sources.forEach((src) =>
      src.excerpts.forEach((e) => {
        if (!e.fact) return;
        (factUses[e.fact] = factUses[e.fact] || []).push({ field: f, n: e.n });
      })
    )
  );

  const reportStats = (() => {
    const byConf = {};
    fields.forEach((f) => (byConf[f.confidence] = (byConf[f.confidence] || 0) + 1));
    const distinct = new Set();
    fields.forEach((f) => f.sources.forEach((s) => distinct.add(`${s.title}|${s.family}`)));
    return {
      answered: fields.length,
      total: fields.length,
      byConf,
      gaps: fields.reduce((n, f) => n + f.gaps.length, 0),
      gapFields: fields.filter((f) => f.gaps.length).length,
      sources: distinct.size,
      pages: [...distinct].filter((k) => !k.endsWith('|Captions')).length,
      images: [...distinct].filter((k) => k.endsWith('|Captions')).length,
      citations: fields.reduce((n, f) => n + f.excerptCount, 0),
    };
  })();

  /* ---------------------------------------------------------------- roadmap */

  /* how long the plan runs. A 90-day strategy is the product's default, not a rule -
     the plan's own head can set another length, and the phases stretch with it. */
  const HORIZONS = [30, 60, 90, 180];
  const horizonOf = () => ui.rp.horizon || R.horizon;

  /* The plan the report runs on is one of a run of them. `rmCycles()` is that run
     in time order - every cycle that has ended, the one running, the one drafted
     ahead - and `rmCycle()` is the one being read. Everything that draws a plan
     goes through `roadmapAt`, so switching which cycle is read switches all of
     them at once.

     A cycle is not a version. There is only ever one cycle running and one drafted
     ahead of it; what grows without limit is the run behind, so the picker pins
     those two and lets the rest scroll. Versions live INSIDE a cycle - each cycle's
     strategy counts from v1 - which is why no version number is printed beside a
     cycle's name. */
  function rmCycles() {
    const past = (R.cycles || []).filter((c) => c.state === 'done');
    const ahead = (R.cycles || []).filter((c) => c.state !== 'done');
    const now = {
      key: 'now',
      state: 'running',
      label: R.label,
      start: R.start,
      horizon: horizonOf(),
      strategy: R.strategy,
      marketing: R.marketing,
    };
    return [...past, now, ...ahead].map((c, i) => {
      const o = c.outcome || null;
      return {
        key: c.key,
        /* which ninety days this is since the brand started - a cycle has an order
           even though it has no version number. It counts from the first plan Brain
           ever drew, so it only ever goes up. */
        n: i + 1,
        state: c.state,
        label: c.label,
        start: c.start,
        end: addDays(c.start, (c.key === 'now' ? horizonOf() : c.horizon) - 1),
        goal: (c.marketing || {}).goal,
        approvedBy: (c.strategy || {}).approvedBy || (ui.rp.rmOk[c.key] || {}).by || null,
        // what it came to, for a cycle that has ended - the one thing worth
        // scanning a long run of them for
        met: o ? !!o.met : null,
        pct: o && o.of ? Math.round((Number(o.figure) / Number(o.of)) * 100) : null,
      };
    });
  }

  /* The last stretch of the running cycle. The next ninety days have to be approved
     before this ninety ends, or the plan runs out with nothing behind it - so once
     the running plan is inside its last phase, the report says so, both on the plan
     and on the overview. `days` is how many are left, `next` the cycle drafted ahead
     (null where nothing has been drafted at all, which is the louder case). */
  function rmDue(today) {
    const cs = rmCycles();
    const now = cs.find((c) => c.key === 'now');
    if (!now) return null;
    const days = diffDays(today || state.today, now.end) + 1;
    const window = Math.max(14, Math.round(horizonOf() / 3));
    if (days > window || days < 0) return null;
    const next = cs.find((c) => c.state === 'draft') || null;
    // a next cycle whose strategy somebody has approved is not waiting on anyone
    if (next && next.approvedBy) return null;
    return { days, window, next, end: now.end, label: now.label };
  }

  const rmCycle = () => ui.rp.rmCycle || 'now';

  /* Finding a plan by its name asks the brand to remember what Brain called a
     ninety-day stretch two years ago. Nobody does. What they remember is WHEN -
     "the winter we held the autumn teams" - so the find box takes dates as well,
     in every shape somebody might type one:

       2025            a year the plan ran through
       nov / november  a month it ran through, in any year
       nov 2025        that month of that year
       nov 30          that day, in any year the plan covers
       2026-01-15      that exact day
       1/15/2026       the same, written the way the product writes dates

     A day is matched against the plan's whole SPAN, not against its start - the
     useful question is "which plan was running then", not "which plan began then". */
  const MONTH_FULL = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const pad2 = (n) => String(n).padStart(2, '0');

  // every word a plan can be found by: its name, its dates, and every month and
  // year it ran through
  function rmHay(c) {
    const out = [
      (c.label || '').toLowerCase(),
      fmtShort(c.start).toLowerCase(),
      fmtShort(c.end).toLowerCase(),
    ];
    const e = toDate(c.end);
    const d = toDate(c.start);
    d.setUTCDate(1);
    while (d <= e) {
      const m = d.getUTCMonth();
      const y = d.getUTCFullYear();
      const s = MONTHS[m].toLowerCase();
      const f = MONTH_FULL[m].toLowerCase();
      out.push(s, f, `${s} ${y}`, `${f} ${y}`, `${y}-${pad2(m + 1)}`, String(y));
      d.setUTCMonth(m + 1);
    }
    return out.join(' ');
  }

  /* the days a query could mean. A month name with no year is tried in every year
     the plan covers, so "nov 30" finds the winter plan without anyone typing 2025 */
  function rmQueryDays(q, years) {
    const t = q.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const mo = (name) => {
      const i = MONTHS.findIndex((x) => x.toLowerCase() === name.slice(0, 3));
      return i < 0 ? null : i + 1;
    };
    let m;
    if ((m = t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)))
      return [`${m[1]}-${pad2(m[2])}-${pad2(m[3])}`];
    // the product writes dates month first, so a bare numeric date is read that way
    if ((m = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)))
      return [`${m[3]}-${pad2(m[1])}-${pad2(m[2])}`];
    if ((m = t.match(/^([a-z]{3,9}) (\d{1,2})(?: (\d{4}))?$/))) {
      const n = mo(m[1]);
      if (!n) return [];
      return m[3]
        ? [`${m[3]}-${pad2(n)}-${pad2(m[2])}`]
        : years.map((y) => `${y}-${pad2(n)}-${pad2(m[2])}`);
    }
    if ((m = t.match(/^(\d{1,2}) ([a-z]{3,9})(?: (\d{4}))?$/))) {
      const n = mo(m[2]);
      if (!n) return [];
      return m[3]
        ? [`${m[3]}-${pad2(n)}-${pad2(m[1])}`]
        : years.map((y) => `${y}-${pad2(n)}-${pad2(m[1])}`);
    }
    return [];
  }

  function rmMatches(c, q) {
    const t = (q || '').trim().toLowerCase();
    if (!t) return true;
    if (rmHay(c).includes(t)) return true;
    const years = [];
    for (let y = Number(c.start.slice(0, 4)); y <= Number(c.end.slice(0, 4)); y += 1) years.push(y);
    // ISO dates sort as text, so the span test is a plain comparison
    return rmQueryDays(t, years).some((d) => d >= c.start && d <= c.end);
  }

  /* Approving a strategy is what writes a plan, so the cycle drafted ahead is
     approved from the plan itself rather than only in Strategy. What the record
     holds is the first signature; what this session approves sits over it. */
  const rmCycleData = (key) =>
    key === 'now' ? R : (R.cycles || []).find((x) => x.key === key) || null;

  function rmApproval(key) {
    const st = (rmCycleData(key) || {}).strategy || {};
    if (st.approvedBy) return { by: st.approvedBy, at: st.approvedAt, avatar: st.approverAvatar };
    return ui.rp.rmOk[key] || null;
  }

  function rmApprove(key, by) {
    ui.rp.rmOk[key] = {
      by,
      at: REAL_TODAY,
      avatar: by === 'You' ? 'assets/avatars/you.png' : R.strategy.approverAvatar,
    };
  }

  const rmSource = () => {
    const key = rmCycle();
    const c = rmCycleData(key);
    if (!c) return R;
    const base = key === 'now' ? R : { ...R, ...c };
    const ok = ui.rp.rmOk[key];
    if (!ok) return base;
    return {
      ...base,
      strategy: {
        ...base.strategy,
        approvedBy: ok.by,
        approvedAt: ok.at,
        approverAvatar: ok.avatar,
      },
    };
  };

  /* Who signed the running plan off, and when. Approving the strategy wrote the
     plan; confirming it is a second, separate act - somebody has to read what Brain
     drew and say it is right. Changing the plan afterwards takes that away again,
     because a plan nobody has read since it changed is not a confirmed one. */
  function rmSigned() {
    return ui.rp.rmSign || null;
  }

  function rmSignOff(by) {
    ui.rp.rmSign = { by, at: REAL_TODAY };
  }

  /* what took the signature away, said in the plan's own log */
  function rmUnsign(what, by) {
    ui.rp.rmSign = null;
    rmLogAdd({ kind: 'edited', by: by || 'You', what });
  }

  function rmLogAdd(entry) {
    // versions count inside a cycle, so a cycle's log follows its own
    const cycle = entry.cycle || 'now';
    const base = (R.versions || []).find((v) => v.cycle === cycle);
    const n = ui.rp.rmLog.length + 1;
    ui.rp.rmLog.unshift({
      v: `${(base && base.v) || 'v1'}.${n}`,
      cycle,
      at: REAL_TODAY,
      by: 'You',
      ...entry,
    });
  }

  // every version of the plan, newest first: this session's on top of the record's
  const rmVersions = () => [...ui.rp.rmLog, ...(R.versions || [])];

  function roadmapAt(today) {
    const S = rmSource();
    const live = S === R;
    const start = S.start;
    const horizon = live ? horizonOf() : S.horizon;
    const scale = horizon / S.horizon;
    const end = addDays(start, horizon - 1);
    const dayRaw = diffDays(start, today) + 1;
    const day = Math.max(0, Math.min(horizon, dayRaw));
    const before = dayRaw < 1;
    const after = dayRaw > horizon;
    const kpiByKey = Object.fromEntries(S.kpis.map((k) => [k.key, k]));
    const phases = S.phases.map((p0, i) => {
      // the phases keep their share of the plan whatever its length
      const p =
        scale === 1
          ? p0
          : {
              ...p0,
              days: [
                i === 0 ? 1 : Math.round((p0.days[0] - 1) * scale) + 1,
                i === S.phases.length - 1 ? horizon : Math.round(p0.days[1] * scale),
              ],
            };
      const pStart = addDays(start, p.days[0] - 1);
      const pEnd = addDays(start, p.days[1] - 1);
      let state = 'upcoming';
      if (dayRaw > p.days[1]) state = 'done';
      else if (dayRaw >= p.days[0]) state = 'current';
      const len = p.days[1] - p.days[0] + 1;
      const elapsed = state === 'done' ? len : state === 'current' ? dayRaw - p.days[0] + 1 : 0;
      return {
        ...p,
        index: i,
        start: pStart,
        end: pEnd,
        state,
        len,
        elapsed,
        left: Math.max(0, len - elapsed),
        lead: kpiByKey[p.lead],
        statusLabel:
          state === 'done' ? 'Completed' : state === 'current' ? 'In progress' : 'Upcoming',
        statusTone: state === 'done' ? 'done' : state === 'current' ? 'building' : 'queued',
      };
    });
    const current = phases.find((p) => p.state === 'current') || null;
    return {
      ...S,
      // the one the report runs on, or one being read beside it
      cycle: rmCycle(),
      live,
      today,
      start,
      end,
      day,
      dayRaw,
      before,
      after,
      horizon,
      pct: Math.round((day / horizon) * 100),
      phases,
      current,
      next: phases.find((p) => p.state === 'upcoming') || null,
      // the phase a view should lead with: the running one, else the next, else the last
      focus: current || phases.find((p) => p.state === 'upcoming') || phases[phases.length - 1],
      kpiByKey,
    };
  }

  /* ------------------------------------------------------------------ state */

  // Knowledge keeps two designs, D and F (the E designs were retired); the roadmap
  // has three of its own, all built around the plan's dates
  const RM_VERSIONS = ['current', '1', '2', '3', '4'];
  const TRI = ['1', '2', '3'];
  // Settled and no longer switched: the page and the report (F), the answer
  // (Panels), the field's content (its Brain fields) and layout (Folds), the way
  // into the brand profile (Compact) and the captured page (Hero)
  const FIXED = {
    page: 'f',
    report: 'f',
    answer: '3',
    fcontent: '2',
    flayout: '2',
    psize: 's',
    capture: '2',
    ask: '2',
    fdesign: '1',
    review: '2',
    reads: '3',
    fdrawer: '2',
    sdesign: '1',
    rmcard: '2',
    roadmap: '1',
    askbtn: '1',
    filterbar: '1',
    revcard: '2',
    secicon: '1',
    movebtn: '2',
    knowledge: 'f',
  };
  const DIMS = [];
  const DIM_VERSIONS = {};
  const TABS = ['report', 'library', 'knowledge', 'map'];
  const STORE_KEY = 'brain-prototype:v2';

  const defaults = {
    ...FIXED,
    tab: 'report',
    /* The report has two lives. **first**: onboarding is done, Brain has read the
       sources but has not written its report, so the brand profile it wrote during
       onboarding is the page - the first take everything downstream reads from, with
       the plan beside it on its first day. **brain**: Brain has written the report,
       which takes over, and the profile becomes legacy. S switches between them. */
    stage: 'brain',
    // the footer that says what has read this version is off unless it is asked for
    showReads: false,
    // how Signal's research basis carries the cue
    basis: 'alert',
    // how Home's own setup reminder is drawn
    setup: 'plain',
    // how the run through Brain counts the answers off
    home: 'float',
    // how the three Not-relevant reasons are offered
    reason: 'rows',
    // how the campaign's blocked checks are laid out
    pub: 'split',
    /* how the plan's own record reads. A phase names the KPI it leads with, so
       the two lists are one mapping - these are three ways of showing it. */
    /* how the sections read while Brain is writing them: 1 the plan beside a belt
       of them, 2 the plan across the row with them wrapped underneath */
    today: REAL_TODAY,
    switcherOpen: true,
  };

  /* how the campaign's blocked checks are laid out - the modal a post stops at */
  const PUBS = ['split', 'gate', 'board'];

  function loadState() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (e) {
      saved = {};
    }
    const q = new URLSearchParams(location.search);
    const pick = (k, list) =>
      list.includes(q.get(k)) ? q.get(k) : list.includes(saved[k]) ? saved[k] : defaults[k];
    return {
      ...defaults,
      switcherOpen:
        typeof saved.switcherOpen === 'boolean' ? saved.switcherOpen : defaults.switcherOpen,
      today: /^\d{4}-\d{2}-\d{2}$/.test(saved.today || '') ? saved.today : defaults.today,
      pub: PUBS.includes(q.get('pub'))
        ? q.get('pub')
        : PUBS.includes(saved.pub)
          ? saved.pub
          : defaults.pub,
      ...FIXED,
      ...Object.fromEntries(DIMS.map((k) => [k, pick(k, DIM_VERSIONS[k])])),
      tab: pick('tab', TABS),
    };
  }

  const state = loadState();

  // UI state that lives for the session only; shared by every version so a
  // filter survives a version switch.
  const ui = {
    kn: {
      q: '',
      source: '',
      sources: [],
      kinds: [],
      bands: [],
      evidence: [],
      sort: 'learned',
      dir: 'desc',
      open: null,
      page: 1,
      group: 'source',
      collapsed: {},
      expanded: {},
      limit: 12,
      cell: null,
      // set by cross-links; the knowledge view that renders next reads and clears
      // them to position itself (page, drill-down, open row)
      jump: null,
      intent: null,
    },
    rp: {
      selected: 'snapshot',
      expanded: {},
      openSource: {},
      clamp: {},
      excluded: {},
      confirm: null,
      notes: {},
      noteOpen: {},
      running: {},
      regenerated: {},
      allConfirm: false,
      tab: {},
      phase: null,
      horizon: null,
      // the phase whose card is open beside the plan: undefined means "the one
      // running", null means the card is put away
      rmPick: undefined,
      // sections the brand adds itself, for the session
      newSecs: [],
      ovAdd: false,
      secPage: 0,
      // the section whose removal is being asked about, and the ones taken out
      secDel: null,
      gone: [],
      /* which of the plan's cycles is being read: 'now' is the one the report runs
         on, the others are read-only - one behind it and one drafted ahead */
      rmCycle: 'now',
      // who signed the running plan off, and when. Nobody has yet; changing the
      // plan after a sign-off clears it again.
      rmSign: null,
      // versions of the plan written in this session, newest first
      rmLog: [],
      rmPlansOpen: false,
      // what is typed into the plan picker's find box - a name or a date
      rmFind: null,
      // how the run of plans is read: as a list, or on a calendar of the years
      rmView: 'list',
      // the year the ribbon is turned to; null follows the plan that is running
      rmYear: null,
      /* the calendar is navigated by picking a date rather than by typing one:
         which month has been jumped to, and whether the picker is open */
      rmJump: null,
      rmJumpMon: null,
      rmJumpOpen: false,
      // strategies approved in this session, by cycle key - over what the record holds
      rmOk: {},
    },
    ask: { q: '', result: null, pending: false },
    map: { space: 'text', hover: null },
  };

  function saveState() {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          ...Object.fromEntries(DIMS.map((k) => [k, state[k]])),
          today: state.today,
          stage: state.stage,
          basis: state.basis,
          reason: state.reason,
          pub: state.pub,
          home: state.home,
          setup: state.setup,
          showReads: state.showReads,
          switcherOpen: state.switcherOpen,
        })
      );
    } catch (e) {
      /* storage can be unavailable (private window); the URL still carries it */
    }
    const q = new URLSearchParams(location.search);
    [...DIMS, 'tab'].forEach((k) => q.set(k, state[k]));
    /* a question that is settled leaves the URL - every one of them is, now, so all
       that is left in it is the tab (and the retired names, swept with them) */
    [
      ...Object.keys(FIXED),
      'conf',
      'upc',
      'emore',
      'cov',
      'track',
      'count',
      'record',
      'covpal',
    ].forEach((k) => q.delete(k));
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
  }

  /* ------------------------------------------------------- knowledge queries */

  function filterFacts(opts = ui.kn, except) {
    const q = (opts.q || '').trim().toLowerCase();
    return facts.filter((f) => {
      if (q && !`${f.statement} ${f.kind} ${f.src.title}`.toLowerCase().includes(q)) return false;
      if (except !== 'source' && opts.source && f.source !== opts.source) return false;
      if (
        except !== 'source' &&
        opts.sources &&
        opts.sources.length &&
        !opts.sources.includes(f.source)
      )
        return false;
      if (except !== 'kinds' && opts.kinds.length && !opts.kinds.includes(f.kind)) return false;
      if (except !== 'bands' && opts.bands.length && !opts.bands.includes(f.band)) return false;
      if (except !== 'evidence' && opts.evidence.length) {
        const ev = f.replaced ? 'replaced' : f.unlocated ? 'unlocated' : 'located';
        if (!opts.evidence.includes(ev)) return false;
      }
      return true;
    });
  }

  function sortFacts(list, key = ui.kn.sort, dir = ui.kn.dir) {
    const mul = dir === 'asc' ? 1 : -1;
    const val = {
      statement: (f) => f.statement.toLowerCase(),
      kind: (f) => f.kind,
      source: (f) => f.src.short.toLowerCase(),
      confidence: (f) => f.confidence,
      learned: (f) => f.learnedAt,
    }[key];
    return list
      .map((f, i) => ({ f, i }))
      .sort((a, b) => {
        const va = val(a.f);
        const vb = val(b.f);
        if (va < vb) return -1 * mul;
        if (va > vb) return 1 * mul;
        return a.i - b.i;
      })
      .map((x) => x.f);
  }

  const countBy = (list, fn) =>
    list.reduce((acc, x) => {
      const k = fn(x);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const activeFilterCount = () =>
    (ui.kn.q ? 1 : 0) +
    (ui.kn.source ? 1 : 0) +
    (ui.kn.sources || []).length +
    ui.kn.kinds.length +
    ui.kn.bands.length +
    ui.kn.evidence.length;

  function clearFilters() {
    Object.assign(ui.kn, {
      q: '',
      source: '',
      sources: [],
      kinds: [],
      bands: [],
      evidence: [],
      page: 1,
      cell: null,
      limit: 12,
    });
  }

  /* ----------------------------------------------------------------- motion */

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = () => typeof window.gsap !== 'undefined';
  const motion = {
    fadeIn(el, opts = {}) {
      if (!el || !hasGsap() || reduceMotion()) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: opts.duration || 0.24,
          ease: 'power1.out',
          clearProps: 'opacity,visibility',
        }
      );
    },
    rise(el, opts = {}) {
      if (!el || !hasGsap() || reduceMotion()) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: opts.y == null ? 8 : opts.y },
        {
          autoAlpha: 1,
          y: 0,
          duration: opts.duration || 0.32,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
        }
      );
    },
    slideIn(el, opts = {}) {
      if (!el || !hasGsap() || reduceMotion()) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: opts.x == null ? 24 : opts.x },
        {
          autoAlpha: 1,
          x: 0,
          duration: opts.duration || 0.34,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
        }
      );
    },
    countUp(els) {
      if (!hasGsap() || reduceMotion()) return;
      els.forEach((el) => {
        const end = Number(el.dataset.count);
        if (!Number.isFinite(end)) return;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('en-US')),
        });
      });
    },
    // one-time reveals keyed by identity, so re-renders never replay them
    seen: new Set(),
    once(key, fn) {
      if (motion.seen.has(key)) return;
      motion.seen.add(key);
      fn();
    },
  };

  /* --------------------------------------------------------------- registry */

  const views = { page: {}, report: {}, roadmap: {}, knowledge: {}, library: null, map: null };
  // Roadmap is a design dimension of its own, hosted by whichever report is showing;
  // "Current" means the shipped report, which has no roadmap
  const roadmapView = () =>
    state.roadmap === 'current' ? null : views.roadmap[state.roadmap] || null;
  const register = (kind, version, impl) => {
    if (kind === 'library' || kind === 'map') views[kind] = impl;
    else views[kind][version] = impl;
  };

  const TAB_META = {
    report: { label: 'Report', icon: 'book' },
    library: { label: 'Library', icon: 'image' },
    knowledge: { label: 'Knowledge', icon: 'database' },
    map: { label: 'Index', icon: 'map' },
  };

  /* ----------------------------------------------------------------- render */

  let root;
  let mainEl;
  let lastVersions = null;

  function ctx() {
    return { state, ui, Brain };
  }

  function render(opts = {}) {
    const P = views.page[state.page] || views.page.f;
    const versionsKey = DIMS.map((k) => state[k]).join('|');
    const scroll = mainEl.scrollTop;
    mainEl.className = `v4-section brain-main brain-main--${state.page}`;
    mainEl.setAttribute('data-page-version', state.page);
    root.innerHTML = P.render(ctx());
    if (P.mount) P.mount(root, ctx());
    renderPanel({ keepScroll: true });
    if (opts.keepScroll !== false) mainEl.scrollTop = scroll;
    const versionChanged = lastVersions !== null && lastVersions !== versionsKey;
    lastVersions = versionsKey;
    if (versionChanged && opts.animate !== false) motion.fadeIn(root, { duration: 0.22 });
    renderSwitcher();
    // the dock lives outside the page, so it listens for the version to change
    document.dispatchEvent(new CustomEvent('brain:render'));
  }

  function panelView() {
    if (state.tab === 'report') return views.report[state.report] || views.report.f;
    if (state.tab === 'knowledge') return views.knowledge[state.knowledge] || views.knowledge.d;
    return views[state.tab];
  }

  function renderPanel(opts = {}) {
    const old = root.querySelector('[data-slot="panel"]');
    if (!old) return;
    const scroll = mainEl.scrollTop;
    // overlays a view mounted into the shell leave with that view
    document.querySelectorAll('.bx-drawer').forEach((el) => el.remove());
    // a fresh node per render: views bind listeners in mount(), and reusing the
    // element would stack a second set on every tab switch. The old node keeps
    // its height until the new content is in, so the scroller never clamps.
    const slot = old.cloneNode(false);
    slot.style.minHeight = `${old.offsetHeight}px`;
    old.replaceWith(slot);
    const V = panelView();
    const version =
      state.tab === 'report'
        ? state.report
        : state.tab === 'knowledge'
          ? state.knowledge
          : state.page;
    slot.setAttribute('data-view', `${state.tab}-${version}`);
    slot.innerHTML = V ? V.render(ctx()) : '';
    if (V && V.mount) V.mount(slot, ctx());
    if (opts.keepScroll) mainEl.scrollTop = scroll;
    slot.style.minHeight = '';
    if (opts.keepScroll) mainEl.scrollTop = Math.min(scroll, mainEl.scrollHeight);
    const P = views.page[state.page];
    if (P && P.sync) P.sync(root, ctx());
  }

  // Every row is its own question: the roadmap's three designs no longer pair with
  // Knowledge's D and F, so nothing follows anything else
  function setVersion(kind, version) {
    state[kind] = version;
    saveState();
    render();
  }

  function go(tab, opts = {}) {
    if (!TABS.includes(tab)) return;
    const changed = state.tab !== tab;
    state.tab = tab;
    saveState();
    const P = views.page[state.page];
    if (P && P.syncTabs) P.syncTabs(root, ctx());
    renderPanel();
    if (opts.focusFact) {
      setTimeout(() => focusFact(opts.focusFact), 40);
    } else if (changed && opts.scrollTop !== false) {
      const top = root.querySelector('[data-scroll-anchor]');
      if (top && top.getBoundingClientRect().top < 0)
        top.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  function goField(id) {
    if (!fieldById[id]) return;
    ui.rp.selected = id;
    ui.rp.expanded[id] = true;
    go('report');
    setTimeout(() => {
      const el = root.querySelector(`[data-field="${id}"]`);
      if (el) el.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
    }, 40);
  }

  function openFact(id) {
    const f = factById[id];
    if (!f) return;
    clearFilters();
    ui.kn.open = id;
    ui.kn.jump = id;
    ui.kn.q = '';
    ui.kn.source = '';
    ui.kn.collapsed = {};
    ui.kn.expanded[f.source] = true;
    ui.kn.expanded[`src:${f.source}`] = true;
    ui.kn.expanded[`kind:${f.kind}`] = true;
    ui.kn.limit = Math.max(ui.kn.limit, 200);
    const ordered = sortFacts(filterFacts());
    ui.kn.page = Math.floor(ordered.findIndex((x) => x.id === id) / 20) + 1;
    go('knowledge', { focusFact: id });
  }

  function focusFact(id) {
    const el = root.querySelector(`[data-fact="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
    el.classList.add('is-flash');
    setTimeout(() => el.classList.remove('is-flash'), 1600);
  }

  /* ---------------------------------------------- report actions (shared) */

  function regenerate(fieldIds, done) {
    fieldIds.forEach((id) => (ui.rp.running[id] = 0));
    const started = performance.now();
    const duration = 2400;
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / duration);
      fieldIds.forEach((id) => (ui.rp.running[id] = p));
      document.dispatchEvent(new CustomEvent('brain:progress', { detail: { fieldIds, p } }));
      if (p < 1) setTimeout(tick, 60);
      else {
        fieldIds.forEach((id) => {
          delete ui.rp.running[id];
          ui.rp.regenerated[id] = Date.now();
        });
        if (done) done();
        // views keep what was open (a drawer) through this re-render
        ui.rp.keepOpen = 'regen';
        renderPanel({ keepScroll: true });
        ui.rp.keepOpen = false;
        toast(
          fieldIds.length > 1
            ? `${fieldIds.length} fields regenerated`
            : `${fieldById[fieldIds[0]].title} regenerated`
        );
      }
    };
    setTimeout(tick, 60);
  }

  const isExcluded = (src) => !!ui.rp.excluded[src.key];

  /* ------------------------------------------------------------------ toast */

  let toastTimer;
  /* A flow that already reports itself where the reader is looking does not
     want a bubble reporting it again at the foot of the screen - the run
     through Brain is one: its bar names the answer, counts it and ticks it. */
  let quiet = false;
  const setQuiet = (on) => {
    quiet = !!on;
  };

  function toast(text) {
    if (quiet) return;
    let el = document.getElementById('bx-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bx-toast';
      el.className = 'bx-toast';
      el.setAttribute('role', 'status');
      // tokens live on .pulse-ds, so overlays mount inside the shell
      (document.querySelector('.app-shell') || document.body).appendChild(el);
    }
    el.innerHTML = `${icon('check', 14)}<span>${esc(text)}</span>`;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  let askEl = null;
  let askGo = null;
  let askFrom = null;

  function closeAsk() {
    if (!askEl) return;
    askEl.classList.remove('is-on');
    askGo = null;
    if (askFrom && document.contains(askFrom)) askFrom.focus();
    askFrom = null;
  }

  function ask(o) {
    if (!askEl) {
      askEl = document.createElement('div');
      askEl.id = 'bx-ask';
      askEl.className = 'bx-ask';
      (document.querySelector('.app-shell') || document.body).appendChild(askEl);
      askEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-ask-go]')) {
          const fn = askGo;
          closeAsk();
          if (fn) fn();
          return;
        }
        if (e.target.closest('[data-ask-no]') || e.target === askEl) closeAsk();
      });
      /* while it is up it owns Esc: it is caught on the way down and goes no
         further, so the page behind does not also step back */
      document.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Escape' && askEl.classList.contains('is-on')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            closeAsk();
          }
        },
        true
      );
    }
    askGo = o.onGo || null;
    askFrom = document.activeElement;
    askEl.innerHTML = `
      <div class="bx-ask__box ${o.tone === 'danger' ? 'is-danger' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="bx-ask-t">
        <span class="bx-ask__mark" aria-hidden="true">${icon(o.icon || 'check', 18)}</span>
        <h2 class="bx-ask__t" id="bx-ask-t">${esc(o.title)}</h2>
        ${o.panel || ''}
        ${o.body ? `<p class="bx-ask__b">${o.body}</p>` : ''}
        <div class="bx-ask__acts">
          <button type="button" class="bx-btn bx-btn--ghost bx-btn--sm" data-ask-no>${esc(o.no || 'Cancel')}</button>
          <button type="button" class="bx-btn ${o.tone === 'danger' ? 'bx-btn--danger' : 'bx-btn--primary'} bx-btn--sm" data-ask-go>${esc(o.go || 'Yes')}</button>
        </div>
      </div>`;
    askEl.classList.add('is-on');
    motion.rise(askEl.firstElementChild, { y: 12, duration: 0.26 });
    const go = askEl.querySelector('[data-ask-go]');
    if (go) go.focus();
  }

  /* --------------------------------------------------------------- switcher */

  // H takes the whole switcher off the screen and back (for clean screenshots); J
  // does the same for the key-word marks in the Knowledge tables and the icons in
  // the report fields' heads. A reload brings both back
  let swGone = false;
  let marksOff = false;
  /* the key-word marks are on to start with; J and the small control beside the
     legend are the same switch, so either one moves both */
  function toggleMarks(on) {
    marksOff = on === undefined ? !marksOff : !on;
    document.documentElement.classList.toggle('bx-marks-off', marksOff);
    document
      .querySelectorAll('[data-marks-toggle]')
      .forEach((b) => b.setAttribute('aria-pressed', String(!marksOff)));
    toast(marksOff ? 'Key words hidden' : 'Key words back');
  }
  const marksAreOff = () => marksOff;

  /* The rails down the side of a launch check say whether it is in or in the
     way without a word. L takes them off, which is the way to see how much of
     the telling the words are doing on their own. */
  let railsOff = false;
  function toggleRails(on) {
    railsOff = on === undefined ? !railsOff : !on;
    document.documentElement.classList.toggle('bx-rails-off', railsOff);
    toast(railsOff ? 'Check rails hidden' : 'Check rails back');
  }

  /* Which life the report is in. Everything that reads it asks here rather than
     testing for the absence of something. */
  const firstTake = () => state.stage === 'first';
  const showReads = () => !!state.showReads;
  function setShowReads(on) {
    state.showReads = !!on;
    saveState();
    render();
    renderSwitcher();
  }

  /* Five of these were open questions and are now answered, so they are what
     the product does rather than something to switch between. They stay as
     functions because everything downstream asks for them by name. */
  const basisDesign = () => 'frost';
  const setupDesign = () => 'frost';
  const homeDesign = () => 'inside';
  const awayDesign = () => 'ink';
  const reasonDesign = () => 'split';

  const pubDesign = () => state.pub || 'split';
  function setPub(v) {
    state.pub = PUBS.includes(v) ? v : 'split';
    saveState();
    renderSwitcher();
    document.dispatchEvent(new CustomEvent('brain:reasons'));
  }

  function setStage(next) {
    state.stage = next === 'first' ? 'first' : 'brain';
    /* the plan is on its first day while Brain is still reading - onboarding has
       only just finished - and back to the day it really is once Brain is done */
    state.today = state.stage === 'first' ? R.start : REAL_TODAY;
    saveState();
    render();
    renderSwitcher();
    toast(
      state.stage === 'first'
        ? 'Brain is still reading - the first take is the report'
        : 'Brain has written its report - the first take is legacy'
    );
  }

  /* N leaves the bar of sections as names alone - no mark beside them. It is the
     same kind of switch J is, for the one row of the page J does not touch. */
  let navPlain = false;
  function toggleNavMarks(on) {
    navPlain = on === undefined ? !navPlain : !on;
    document.documentElement.classList.toggle('bx-nav-plain', navPlain);
    toast(navPlain ? 'Section marks hidden' : 'Section marks back');
  }
  const navMarksAreOff = () => navPlain;

  /* R takes the cycle's order off - which ninety days of the brand's a plan is. It
     is a mark of its own, on its own key: the section bar's glyphs say what kind of
     thing a section is, and this says where a plan sits in the run, so hiding one
     has nothing to do with hiding the other. */
  let rmPlain = false;
  function toggleRmOrder(on) {
    rmPlain = on === undefined ? !rmPlain : !on;
    document.documentElement.classList.toggle('bx-rm-plain', rmPlain);
    toast(rmPlain ? 'Cycle order hidden' : 'Cycle order back');
  }
  const rmOrderIsOff = () => rmPlain;

  /* where the panel's scroller was last seen open, kept outside the render */
  let panelAt = 0;

  function renderSwitcher() {
    const host = document.getElementById('bx-switcher');
    if (!host) return;
    const rm = roadmapAt(state.today);
    const min = addDays(R.start, -7);
    const max = addDays(R.start, R.horizon + 7);
    const span = diffDays(min, max);

    /* The whole panel is written again on every switch, so the scroller inside
       it goes back to the top and the row being worked in walks off the
       screen. Hold its place across the rewrite - and in a variable that
       outlives the panel, because a closed one is display:none and reports
       nothing, so reading it on the way back in would only ever find zero. */
    const live = host.querySelector('.bx-sw__panel');
    if (live && !live.hidden) panelAt = live.scrollTop;

    host.className = `bx-sw ${state.switcherOpen ? 'is-open' : ''} ${swGone ? 'is-gone' : ''}`;
    host.innerHTML = `
      <button type="button" class="bx-sw__tab" data-sw-toggle aria-expanded="${state.switcherOpen}" aria-controls="bx-sw-panel">
        ${icon('layers', 15)}
        <span class="bx-sw__tab-text">Prototype</span>
        <span class="bx-sw__tab-codes" aria-hidden="true"><b class="bx-num">${esc(fmtShort(state.today))}</b></span>
        ${icon(state.switcherOpen ? 'chevron-down' : 'chevron-up', 14)}
      </button>
      <div class="bx-sw__panel" id="bx-sw-panel" ${state.switcherOpen ? '' : 'hidden'}>
        <div class="bx-sw__head">
          <div>
            <p class="bx-sw__title">Prototype controls</p>
            <p class="bx-sw__hint">Four design questions are open - Home, two on Signal, one on Campaigns - and then the day the plan is read on</p>
          </div>
        </div>
        <div class="bx-sw__row">
          <div class="bx-sw__row-head">
            <span class="bx-sw__label">The checks that stop a post</span>
            <span class="bx-sw__where">Campaigns</span>
          </div>
          <div class="bx-sw__seg" role="radiogroup" aria-label="How the campaign's blocked checks are laid out">
            ${[
              ['split', 'Split'],
              ['gate', 'Gate'],
              ['board', 'Board'],
            ]
              .map(
                ([v, label]) =>
                  `<button type="button" role="radio" aria-checked="${pubDesign() === v}" class="bx-sw__opt ${pubDesign() === v ? 'is-on' : ''}" data-sw-pub="${v}">${label}</button>`
              )
              .join('')}
          </div>
          <p class="bx-sw__desc">${
            {
              split:
                'Two columns: a dark rail at the left carrying what is wrong and who is waited on, the checks themselves at the right',
              gate: 'Led by how far it has got - a meter and a count at the head, what is in the way under it, and what is already in folded to a line',
              board:
                'A board of tiles, two across, each check a card with its state - the whole thing read in one look',
            }[pubDesign()]
          } &middot; on Approve, in the campaign</p>
        </div>
        <div class="bx-sw__row">
          <div class="bx-sw__row-head">
            <span class="bx-sw__label">Where the report is</span>
          </div>
          <div class="bx-sw__seg" role="radiogroup" aria-label="Which life the report is in">
            ${[
              ['first', 'First take'],
              ['brain', 'Brain'],
            ]
              .map(
                ([v, label]) =>
                  `<button type="button" role="radio" aria-checked="${state.stage === v}" class="bx-sw__opt ${state.stage === v ? 'is-on' : ''}" data-sw-stage="${v}">${label}</button>`
              )
              .join('')}
          </div>
          <p class="bx-sw__desc">${
            state.stage === 'first'
              ? 'Onboarding is done and Brain has read the sources, but it has not written its report - the profile it wrote is the page, and the plan is on day 1'
              : 'Brain has written its report, so it is the page - the first take is kept as legacy'
          }</p>
        </div>
        <div class="bx-sw__row">
          <div class="bx-sw__row-head">
            <span class="bx-sw__label">Reading this version</span>
          </div>
          <div class="bx-sw__seg" role="radiogroup" aria-label="The footer that says what has read this version">
            ${[
              ['off', 'Off'],
              ['on', 'On'],
            ]
              .map(
                ([v, label]) =>
                  `<button type="button" role="radio" aria-checked="${state.showReads === (v === 'on')}" class="bx-sw__opt ${state.showReads === (v === 'on') ? 'is-on' : ''}" data-sw-reads="${v}">${label}</button>`
              )
              .join('')}
          </div>
          <p class="bx-sw__desc">The footer naming what the rest of Pulse has built on these answers${state.showReads ? '' : ' - put away for now'}</p>
        </div>
        <div class="bx-sw__row bx-sw__row--date">
          <div class="bx-sw__row-head">
            <span class="bx-sw__label">Roadmap date</span>
          </div>
          <div class="bx-sw__date">
            <input type="range" min="0" max="${span}" step="1" value="${diffDays(min, state.today)}" data-sw-date aria-label="Simulated date" style="--pct:${(diffDays(min, state.today) / span) * 100}%">
            <output>${fmtShort(state.today)}${state.today === REAL_TODAY ? ' · today' : ''}</output>
          </div>
          <p class="bx-sw__desc">${
            rm.before
              ? `Before the plan starts (${fmtShort(rm.start)})`
              : rm.after
                ? `After the plan ended (${fmtShort(rm.end)})`
                : `Day ${rm.day} of ${rm.horizon} · ${rm.current ? rm.current.name + ' phase' : ''}`
          }${state.today !== REAL_TODAY ? ' · <button type="button" class="bx-sw__reset" data-sw-today>Back to today</button>' : ''}</p>
        </div>
        <div class="bx-sw__foot">
          <p class="bx-sw__keys"><kbd>V</kbd> panel · <kbd>H</kbd> hide all · <kbd>J</kbd> key words \u00b7 <kbd>N</kbd> section marks \u00b7 <kbd>R</kbd> cycle order \u00b7 <kbd>S</kbd> stage \u00b7 <kbd>L</kbd> check rails</p>
          <a class="bx-sw__round" href="./round-1/">Round 1 · A / B / C${icon('arrow-right', 12)}</a>
        </div>
      </div>`;

    if (panelAt) {
      const panel = host.querySelector('.bx-sw__panel');
      if (panel && !panel.hidden) panel.scrollTop = panelAt;
    }
  }

  function bindSwitcher() {
    const host = document.getElementById('bx-switcher');
    const min = addDays(R.start, -7);
    host.addEventListener('click', (e) => {
      const opt = e.target.closest('[data-sw-version]');
      if (opt) {
        setVersion(opt.dataset.swKind, opt.dataset.swVersion);
        return;
      }
      const stage = e.target.closest('[data-sw-stage]');
      if (stage) {
        setStage(stage.dataset.swStage);
        return;
      }
      const reads = e.target.closest('[data-sw-reads]');
      if (reads) {
        setShowReads(reads.dataset.swReads === 'on');
        return;
      }
      const pub = e.target.closest('[data-sw-pub]');
      if (pub) {
        setPub(pub.dataset.swPub);
        return;
      }
      if (e.target.closest('[data-sw-toggle]')) {
        state.switcherOpen = !state.switcherOpen;
        saveState();
        renderSwitcher();
        if (state.switcherOpen) motion.rise($('.bx-sw__panel', host), { y: 6, duration: 0.24 });
        return;
      }
      if (e.target.closest('[data-sw-today]')) {
        state.today = REAL_TODAY;
        saveState();
        renderSwitcher();
        document.dispatchEvent(new CustomEvent('brain:date'));
      }
    });
    let dateFrame;
    host.addEventListener('input', (e) => {
      if (!e.target.matches('[data-sw-date]')) return;
      state.today = addDays(min, Number(e.target.value));
      e.target.style.setProperty(
        '--pct',
        `${(Number(e.target.value) / Number(e.target.max)) * 100}%`
      );
      const out = e.target.parentElement.querySelector('output');
      if (out)
        out.textContent = `${fmtShort(state.today)}${state.today === REAL_TODAY ? ' · today' : ''}`;
      cancelAnimationFrame(dateFrame);
      dateFrame = requestAnimationFrame(() =>
        document.dispatchEvent(new CustomEvent('brain:date'))
      );
    });
    host.addEventListener('pointerup', (e) => {
      if (e.target.matches('[data-sw-date]')) {
        saveState();
        renderSwitcher();
      }
    });
    host.addEventListener('keyup', (e) => {
      if (e.target.matches('[data-sw-date]')) {
        saveState();
        renderSwitcher();
      }
    });
    document.addEventListener('keydown', (e) => {
      // a key can be dispatched at the document itself, which has no closest()
      const on = e.target && e.target.closest ? e.target : null;
      if (on && on.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'v' || e.key === 'V') {
        state.switcherOpen = !state.switcherOpen;
        saveState();
        renderSwitcher();
      }
      if (e.key === 'h' || e.key === 'H') {
        swGone = !swGone;
        renderSwitcher();
      }
      // J takes the key-word marks off the statements and the answers, and back -
      // the icons in the page's own fields are part of it now, and stay
      if (e.key === 'j' || e.key === 'J') toggleMarks();
      // N takes the marks off the bar of sections, leaving their names alone
      if (e.key === 'n' || e.key === 'N') toggleNavMarks();
      // R takes the cycle's order off the plan - its own mark, its own key
      if (e.key === 'r' || e.key === 'R') toggleRmOrder();
      // S moves between the report's two lives - before Brain has written it, and after
      if (e.key === 's' || e.key === 'S') setStage(state.stage === 'first' ? 'brain' : 'first');
      // L takes the rails off the launch checks, so the rows are read on their words alone
      if (e.key === 'l' || e.key === 'L') toggleRails();
    });
  }

  /* ---------------------------------------------------------- global events */

  function bindGlobal() {
    root.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (tab && root.contains(tab)) {
        e.preventDefault();
        go(tab.dataset.tab);
        return;
      }
      const factLink = e.target.closest('[data-open-fact]');
      if (factLink) {
        e.preventDefault();
        openFact(factLink.dataset.openFact);
        return;
      }
      const kindLink = e.target.closest('[data-go-kind]');
      if (kindLink) {
        e.preventDefault();
        clearFilters();
        ui.kn.kinds = [kindLink.dataset.goKind];
        ui.kn.intent = 'kind';
        ui.kn.open = null;
        go('knowledge');
        return;
      }
      const fieldLink = e.target.closest('[data-go-field]');
      if (fieldLink) {
        e.preventDefault();
        goField(fieldLink.dataset.goField);
      }
    });
    document.addEventListener('brain:date', () => {
      if (state.tab !== 'report') return;
      const slot = root.querySelector('[data-slot="panel"]');
      if (!slot) return;
      if (window.BX) window.BX.roadmapDate(slot, ctx());
      const V = panelView();
      if (V && V.onDate) V.onDate(slot, ctx());
    });
  }

  /* -------------------------------------------------------- chat dock (min) */

  /* ------------------------------------------------------------------- boot */

  function boot() {
    root = document.getElementById('brain-root');
    mainEl = document.getElementById('brain-main');
    bindGlobal();
    bindSwitcher();
    saveState();
    render({ animate: false });
  }

  const Brain = {
    D,
    R,
    REAL_TODAY,
    esc,
    $,
    $$,
    plural,
    cap,
    icon,
    dates: {
      toDate,
      addDays,
      diffDays,
      fmtShort,
      fmtLong,
      fmtNumeric,
      fmtStamp,
      fmtTsShort,
      relDays,
    },
    evidenceHtml,
    evidencePlain,
    locatedWording,
    fields,
    fieldById,
    CONFIDENCE,
    sources,
    sourceById,
    facts,
    factById,
    factUses,
    KINDS,
    BANDS,
    EVIDENCE,
    reportStats,
    roadmapAt,
    HORIZONS,
    rmCycles,
    rmCycle,
    renderSwitcher,
    rmSigned,
    rmSignOff,
    rmUnsign,
    rmLogAdd,
    rmVersions,
    rmDue,
    rmApproval,
    rmApprove,
    rmMatches,
    basisDesign,
    setupDesign,
    awayDesign,
    setQuiet,
    reasonDesign,
    pubDesign,
    setPub,
    PUBS,
    homeDesign,
    state,
    ui,
    views,
    roadmapView,
    DIMS,
    DIM_VERSIONS,
    register,
    render,
    renderPanel,
    setVersion,
    go,
    goField,
    openFact,
    filterFacts,
    sortFacts,
    countBy,
    activeFilterCount,
    clearFilters,
    regenerate,
    isExcluded,
    toast,
    ask,
    closeAsk,
    toggleNavMarks,
    navMarksAreOff,
    toggleRmOrder,
    rmOrderIsOff,
    firstTake,
    setStage,
    showReads,
    setShowReads,
    toggleMarks,
    marksAreOff,
    motion,
    TAB_META,
    TABS,
    boot,
    get root() {
      return root;
    },
    get main() {
      return mainEl;
    },
  };
  window.Brain = Brain;
})();
