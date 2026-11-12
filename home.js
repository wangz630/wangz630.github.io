/* =====================================================================
   Shared by the homepage and the About page:
   · PF   — the portfolio content
   · PF.* — small helpers (scroll reveal, project tile, nav / footer)
   Pages in sub-folders load it with data-root="../".
   ===================================================================== */
(function () {
  var ROOT = (document.currentScript && document.currentScript.getAttribute('data-root')) || '';
  function url(h) { return !h ? null : (/^https?:/.test(h) ? h : ROOT + h); }
  function img(f) { return ROOT + 'project-image/' + f; }

  var P = function (cat, title, image, href, desc, tags, pos) {
    return { pos: pos || '', cat: cat, title: title, desc: desc || '', tags: tags || [], tag: (tags || [''])[0], sub: desc || '', img: img(image), href: url(href), ext: /^https?:/.test(href || '') };
  };

  window.PF = {
    url: url,
    me: {
      name: 'Zi Wang',
      line: 'A visual designer and UI & UX designer',
      email: 'zi.wang1207@gmail.com',
      about: ROOT + 'about/about.html',
      home: ROOT + 'index.html',
      logo: img('logozi.png')
    },
    featured: {
      badge: 'Currently Working On',
      title: 'Vicino',
      sub: 'AI Product · AI Creative Workflow',
      desc: 'As a Product Designer at an AI startup, I design node-based creative-workflow features and the Pulse content-lifecycle platform — from chatbot and image-editor nodes to onboarding, Brain, side-chats, and campaign tools.',
      img: img('Vicino Cover Image.png'),
      href: url('vicino/index.html')
    },
    cats: [
      { id: 'wa', name: 'Website & Application', short: 'Web & App' },
      { id: 'typo', name: 'Typography & Graphics', short: 'Type & Graphics' },
      { id: 'vga', name: 'VR & Game & Animation', short: 'VR · Game · Animation' },
      { id: 'wc', name: 'Website Coding', short: 'Web Coding' }
    ],
    projects: [
      P('wa', 'Vicino', 'Vicino Cover Image.png', 'vicino/index.html', 'Node-based AI creative workflows and the Pulse content-lifecycle platform.', ['AI Product', 'Product Design', 'UI/UX']),
      P('wa', 'RouteApp', 'route-app.png', 'route-app/index.html', 'A mobile navigation app shaped by UX research and usability testing.', ['Mobile App', 'UX Research', 'Accessibility']),
      P('wa', 'Artisk', 'artisk-cover.jpg', 'artisk/index.html', 'Landing page redesign and marketing visuals for an AI brand-kit generator.', ['Web', 'Landing Page', 'AI Visuals']),
      P('wa', 'SideBySIDE', 'work21.jpeg', 'side-by-side/index.html', 'An app and companion products supporting residents through the Shanghai lockdown.', ['Mobile App', 'Service Design'], '25% 50%'),
      P('wa', 'Empower@Home', 'empower.png', 'empwer/index.html', 'Website redesign, accessibility audit, dashboard UI and book design.', ['Website', 'Dashboard', 'Book Design']),
      P('wa', 'NOAA: Great Lakes Water Life', 'greatlake.png', 'https://fifth-yacht-d4d.notion.site/NOAA-Great-Lakes-Water-Life-1df26e9cb532800992fcf9f36f4e2e63', 'High-fidelity website redesign for NOAA’s Great Lakes Water Life database.', ['Website', 'Redesign']),
      P('wa', 'Puzzle', 'puzzle.png', 'puzzle/index.html', 'A generative-AI design tool that lowers the barrier for non-designers.', ['App', 'AI Tool', 'Team Project']),
      P('wa', 'Black Space Art Fashion', 'scene07.jpg', 'bsaf/index.html', 'Web redesign and a community app for artists, for a New York art startup.', ['App', 'Web', 'Graphics']),
      P('wa', 'Another Side of Me', 'work4.jpeg', 'another-side-of-me/index.html', 'A VR space and mobile app for exploring and celebrating digital identities.', ['App', 'VR', 'Thesis']),
      P('wa', 'Atomo Startup Studio', 'atomo.gif', 'atomo/index.html', 'A matching platform for in-game item designers, built with Cornell Tech.', ['Web', 'App', 'Startup Studio']),
      P('wa', 'Connected', 'work12.jpg', 'connected/index.html', 'Asynchronous, private family communication across time zones.', ['Mobile App', 'UI/UX']),
      P('wa', 'Indoor Activities', 'work13.jpg', 'indoor-acitivity/index.html', 'An event identity carried from print to web and app.', ['Web', 'App', 'Visual Identity']),
      P('wa', 'Kindle app for kids', 'kindle.png', 'kindle-app/index.html', 'A reading app concept designed for young readers.', ['Mobile App', 'Concept']),
      P('wa', 'Dating app', 'dating.png', 'Dating-app/index.html', 'A mobile dating app concept and prototype.', ['Mobile App', 'Concept']),

      P('typo', 'sun·a·wear', 'sunawear1.jpg', 'sun-a-wear/index.html', 'Visual design for a Swiss startup helping people handle UV exposure safely.', ['Graphics', 'Branding']),
      P('typo', 'From Print To Digital', 'work16.jpg', 'from-print-to-digital/index.html', 'A book on the shift from printed media to digital reading.', ['Book', 'Editorial']),
      P('typo', 'Marine Life', 'work17.jpg', 'marine-life/index.html', 'An illustrated book introducing creatures of the underwater world.', ['Book', 'Editorial']),
      P('typo', 'Experimental Typeface', 'work19.jpg', null, 'An exploratory display typeface.', ['Typography']),

      P('vga', 'Journalist Training', 'XRtraining.png', 'journalist-trainingXR/index.html', 'XR safety training for journalists covering extreme weather.', ['XR', 'Unity', 'Group Project']),
      P('vga', 'Deep Voice From Sea', 'voice.jpg', 'https://seasoned-hexagonal-booklet.glitch.me/', 'An immersive web VR experience set under the sea.', ['VR', 'WebXR']),
      P('vga', 'Dream Chaser', 'work23.jpg', 'https://vimeo.com/770869657', 'A short game project.', ['Game']),
      P('vga', 'Drop', 'sloth.gif', 'https://vimeo.com/770867648', 'A short animated film.', ['Animation']),
      P('vga', 'Welcome to Heaven', 'heaven.jpg', 'https://vimeo.com/770939098', 'A short game project.', ['Game']),
      P('vga', 'My World', 'world.jpg', 'https://hubs.mozilla.com/scenes/d9zhHgu', 'A personal virtual world built for social VR.', ['VR']),

      P('wc', '256 Images', '256.jpg', '256-images/index.html', 'A site that visualises my brainstorming process with 256 collected images.', ['Experimental Web', 'API']),
      P('wc', 'World Trip', 'work14.jpg', 'website-map/index.html', '100 maps from around the world, sortable three ways.', ['Experimental Web', 'API']),
      P('wc', 'Music Visualizer', 'work15.jpg', 'website-music/index.html', 'Keys trigger sounds and shapes — the music becomes a painting.', ['Experimental Web', 'Interaction']),
      P('wc', 'Pet Adoption', 'pet.jpg', 'Pet Adoption/index.html', 'A coded pet-adoption website.', ['Experimental Web', 'JavaScript']),
      P('wc', 'NFT Gallery', 'nft.jpg', 'NFT-gallery/index.html', 'A coded gallery site for NFT artwork.', ['Web', 'Front-end']),
      P('wc', 'In Praise of Shadow', 'shadow.jpg', 'project-2/index.html', 'A typographic web adaptation of Tanizaki’s essay.', ['Web', 'Typography'])
    ],
    experiments: [
      ['Experiment — clock', 'clock2/index.html'],
      ['Experiment — Information Overload', 'information-overload/index.html'],
      ['living-collection', 'core-1-interaction/living-collection'],
      ['Studio project 1 — Cross-platform Story', 'core-2-studio-project1'],
      ['Experiment 3 — Recipes', 'assignment-5/'],
      ['Experiment 2 — Airtable Demo', 'assignment-4/'],
      ['Experiment 1 — digital zine', 'digital-zine'],
      ['Exercise 4 — Media Queries + CSS Animation', 'exercise-4'],
      ['Exercise 3 — Multimedia Story', 'exercise-3'],
      ['Exercise 2 — Printed Media to Web Format', 'exercise-2'],
      ['Exercise 1 — embedded content', 'exercise-1-embedded-content'],
      ['core 1 skills test', 'core-1-skills-test'],
      ['toy', 'core-1-interaction/toy'],
      ['abstracted-text-pt2', 'core-1-interaction/abstracted-text-pt2'],
      ['abstracted-text-pt1', 'core-1-interaction/abstracted-text-pt1'],
      ['nametag', 'core-1-interaction/nametag'],
      ['expressive-text', 'core-1-interaction/expressive-text'],
      ['all-html', 'core-1-interaction/all-html'],
      ['interview', 'core-1-interaction/interview']
    ].map(function (e) { return { title: e[0], href: url(e[1]) }; })
  };

  /* covers used purely as hero imagery (static images only, never links) */
  PF.covers = function (n) {
    var c = PF.projects.filter(function (p) { return !/\.gif$/.test(p.img); });
    return n ? c.slice(0, n) : c;
  };
  /* style attribute for a project's focal point, e.g. keep the left side of a wide cover in frame */
  PF.pos = function (p) { return p && p.pos ? ' style="object-position:' + p.pos + '"' : ''; };
  PF.byCat = function (id) { return PF.projects.filter(function (p) { return p.cat === id; }); };
  PF.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  /* <a> attributes for a project (opens external links in a new tab; no href = not a link) */
  PF.link = function (p) { return p.href ? ' href="' + p.href + '"' + (p.ext ? ' target="_blank" rel="noopener"' : '') : ''; };

  /* add .in when an element scrolls into view (optionally staggered via --d) */
  PF.reveal = function (selector, opts) {
    var els = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, Object.assign({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }, opts || {}));
    els.forEach(function (e) { io.observe(e); });
  };
  /* wrap each word (or char) in a span with --i for staggered CSS animation */
  PF.split = function (el, byChar) {
    var parts = byChar ? el.textContent.split('') : el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = parts.map(function (w, i) {
      return '<span class="sp" aria-hidden="true"><span style="--i:' + i + '">' + (w === ' ' ? '&nbsp;' : PF.esc(w)) + '</span></span>';
    }).join(byChar ? '' : ' ');
  };
  PF.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var IDS = { 'vicino': 'p-vicino', 'route-app': 'p-route-app', 'artisk': 'p-artisk', 'empwer': 'p-empwer', 'puzzle': 'p-puzzle', 'side-by-side': 'p-side-by-side', 'bsaf': 'p-bsaf',
    'another-side-of-me': 'p-another', 'atomo': 'p-atomo', 'connected': 'p-connected', 'indoor-acitivity': 'p-indoor', 'sun-a-wear': 'p-sunawear', 'from-print-to-digital': 'p-fromprint',
    'marine-life': 'p-marine', 'journalist-trainingXR': 'p-journalist' };
  PF.anchor = function (p) { var m = p.href && !p.ext && p.href.slice(ROOT.length).split('/')[0]; return m && IDS[m] ? ' id="' + IDS[m] + '"' : ''; };

  /* one project tile — identical markup in every version (CSS decides the layout) */
  PF.item = function (p, i, extra) {
    return '<a class="item rv ' + (extra || '') + '"' + PF.anchor(p) + PF.link(p) + ' style="--d:' + ((i || 0) * 80) + 'ms">' +
      '<div class="ph"><img loading="lazy" src="' + p.img + '"' + PF.pos(p) + ' alt="' + PF.esc(p.title) + '">' +
      (p.href ? '<span class="view">' + (p.ext ? 'Visit' : 'View project') + ' <b>→</b></span>' : '') + '</div>' +
      '<div class="cap"><h4>' + PF.esc(p.title) + '</h4><p class="desc">' + PF.esc(p.desc) + '</p>' +
      '<div class="tags">' + p.tags.map(function (t) { return '<span>' + PF.esc(t) + '</span>'; }).join('') + '</div></div></a>';
  };
  /* shared chrome: fills #nav, #exp and #footer if the page has them */
  PF.chrome = function (opts) {
    opts = opts || {};
    var n = document.getElementById('nav'), e = document.getElementById('exp'), f = document.getElementById('footer'), m = PF.me;
    var home = opts.home || '';                       /* on sub-pages: link back to the homepage */
    if (n) {
      n.innerHTML = '<a class="brand" aria-label="Zi Wang — home" href="' + (home || '#') + '"><img src="' + m.logo + '" alt="Zi Wang — home"></a>' +
        '<nav><a href="' + home + '#work">Projects</a><a href="' + m.about + '"' + (opts.active === 'about' ? ' class="on"' : '') + '>About</a></nav>';
      addEventListener('scroll', function () { n.classList.toggle('stuck', scrollY > 8); }, { passive: true });
    }
    if (e) e.innerHTML = '<details class="exp"><summary>Experiments &amp; exercises <span>' + PF.experiments.length + '</span><i>+</i></summary><div class="exp-list">' +
      PF.experiments.map(function (x) { return '<a href="' + x.href + '">' + PF.esc(x.title) + '</a>'; }).join('') + '</div></details>';
    if (f) f.innerHTML = '<div class="wrap"><div class="lbl">Get in touch</div><a class="mail" href="mailto:' + m.email + '">' + m.email + '</a>' +
      '<div class="end"><span>© Zi Wang</span><a class="ul" href="#">Back to top ↑</a></div></div>';
  };
})();
