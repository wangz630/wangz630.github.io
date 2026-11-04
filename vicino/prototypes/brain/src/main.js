/* Boot + the parts of the app shell this prototype does not own. */
(function () {
  'use strict';

  function bindShell() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    const collapse = sidebar.querySelector('.sidebar-logo-collapse');
    if (collapse) {
      collapse.addEventListener('click', () => {
        const on = sidebar.classList.toggle('is-collapsed');
        collapse.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
      });
    }
  }

  function start() {
    bindShell();
    window.Brain.boot();
    /* Brain is one tab of the product; Home, Signal and the campaign are three
       more, and the Brain touchpoints live on them. Both start after Brain has
       rendered, because they read the Brain fields. */
    if (window.AppPages) window.AppPages.start();
    if (window.BrainNotice) window.BrainNotice.start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
