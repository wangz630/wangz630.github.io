/* Wires the page up: one click handler, the keys, the first render. */
(function () {
  var S = window.SG;
  var state = S.state;
  S.load();

  var shell = document.querySelector('.app-shell');
  ['sg-overlay', 'sg-toast'].forEach(function (id) {
    var el = document.createElement('div');
    el.id = id;
    if (id === 'sg-toast') {
      el.setAttribute('role', 'status');
      el.classList.add('sg-ds');
    }
    shell.appendChild(el);
  });

  /* the captured sidebar's links go nowhere; the launcher opens the chat */
  document.addEventListener('click', function (e) {
    var target = e.target;

    if (!target.closest('[data-pop]') && !target.closest('[data-act="picker-toggle"]') && state.pickerOpen) {
      state.pickerOpen = false;
      S.render();
    }
    if (!target.closest('[data-pop-settings]') && !target.closest('[data-act="settings"]') && state.settings) {
      state.settings = false;
      S.render();
    }

    var el = target.closest('[data-act]');
    if (el) {
      if (el.tagName === 'A' || el.tagName === 'SUMMARY') e.preventDefault();
      /* a control inside a clickable card shouldn't also open the card */
      e.stopPropagation();
      S.act(el.dataset.act, el.dataset.id, el);
      return;
    }
    if (target.closest('.chat-dock__launcher')) {
      state.chat = { title: 'New chat', msgs: [] };
      S.render();
      return;
    }
    if (target.closest('.chat-dock__launcher-new')) {
      state.chat = { title: 'New chat', msgs: [] };
      S.render();
      return;
    }
    if (target.closest('.sidebar-logo-collapse')) {
      document.querySelector('.app-sidebar').classList.toggle('is-collapsed');
      return;
    }
    var a = target.closest('.app-sidebar a');
    if (a) {
      e.preventDefault();
      if (!a.classList.contains('active')) S.toast('That page isn’t part of this prototype.');
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-change]');
    if (el && el.dataset.change === 'sort') {
      state.sort = el.value;
      S.render();
    }
  });

  document.addEventListener('keydown', function (e) {
    /* whole-card targets answer the keyboard like the buttons they stand for */
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"][data-act]')) {
      e.preventDefault();
      e.target.click();
      return;
    }
    if (e.key === 'Escape') {
      if (state.modal) state.modal = null;
      else if (state.drawer) state.drawer = null;
      else if (state.settings) state.settings = false;
      else if (state.pickerOpen) state.pickerOpen = false;
      else if (state.chat) state.chat = null;
      else return;
      S.render();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
      if (e.key === 'Enter' && !e.shiftKey && t.dataset.chatInput !== undefined) {
        e.preventDefault();
        S.act('chat-send');
      }
      return;
    }
    var k = e.key.toLowerCase();
    if (k >= '1' && k <= '4') S.setDesign(S.DESIGNS[+k - 1]);
    else if (k === 'm') S.setPage('market');
    else if (k === 's') S.setPage('sentiment');
    else if (k === 'v') S.act('menu-toggle');
    else if (k === 'h') document.getElementById('sg-menu').classList.toggle('is-gone');
  });

  S.render({ animate: true });
})();
