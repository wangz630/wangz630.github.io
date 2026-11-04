// The post behind the drawer - everything the three captures showed, as data.
// Read off the captures of 2026-10-26 (campaignDrawer_1Brief / 2Storyboard /
// 3Context.mhtml) and the live page; the wording of the proposed cards is the
// prototype's own.
window.CD_DATA = {
  post: {
    title: 'Could Your Product Be Ready for AI Discovery?',
    status: 'Not generated yet',
    format: 'Vertical video',
    when: 'Oct 5 · 12:30 PM',
    whenLong: 'Oct 5, 2026, 12:30 PM EDT',
    channel: 'X',
    version: 7,
  },

  details: {
    pillar: 'Get your products ready for AI discovery',
    objective:
      'Help merchants prepare products for AI discovery and assess relevant selling channels.',
    audience: 'Founders, independent retailers, and larger commerce teams exploring AI selling.',
    theme: 'Commerce for the Agentic Era',
    segment: 'Founders checking whether their products are ready for AI discovery.',
  },

  brief: {
    // ① who this speaks to, and what it says
    audience: 'Founders checking whether their products are ready for AI discovery.',
    coreIdea:
      'Before thinking about AI shopping results, a founder wants to know what their own product needs to be ready for discovery.',
    cta: "Reply with the product you'd check first.",
    proofs: ['Clear product titles', 'Complete product details', 'Real photos of the product'],
    tone: 'Sharp and builder-to-builder: a quick observation followed by one practical question, without promising a sales result.',
    hook: 'A founder scrolls an AI shopping conversation on their phone, then stops beside a boxed product on the worktable and looks back at it',
    // ② the plan for this video
    plan: 'Four worktable scenes in a real store: a founder, a phone, a boxed product. About 20 seconds.',
    // the plan, scene by scene: one plain sentence each, no lengths yet
    beats: [
      'A founder scrolls an AI shopping chat on a phone, then stops at the boxed product.',
      'The boxed product sits beside the storefront, open on a laptop.',
      'The founder turns the box over and looks into the camera.',
      'Close on the boxed product beside its product page on the laptop.',
    ],
    look: 'Tangible merchandise and a recognizable storefront, with clear separation between products and interfaces. Keep the light energetic and the details easy to read.',
    voice: 'talking',
    voiceWhy: 'A founder can own the question in their own words.',
    voiceBy: 'Vicino',
    labels: 'None',
    guardrails: '',
    requirements: [],
    story:
      'Hook: At a worktable, a founder scrolls an AI shopping conversation on a phone, stops mid-scroll beside a boxed product, and looks from the phone to the box. Keep the conversation text unreadable.\nBeat 1: The same founder sets the boxed product beside their storefront on a laptop and studies the product view. Keep interface text unreadable.\nBeat 2: The founder turns the box in their hands, then looks directly at the camera.\nCaption: An AI shopping conversation can make you look at your own product differently. Start with the question that matters for your store.\nCTA: Reply with the product you’d check first.',
    caption:
      'An AI shopping conversation can make you look at your own product differently. Start with the question that matters for your store.',
  },

  // The storyboard. `preview` is what Vicino drew; `line` is what is said
  // there (Voice = Talking → "Spoken here"). Scene 1's preview was drawn for
  // an earlier wording, so it is out of date and not used.
  scenes: [
    {
      id: 's1',
      text: 'At a worktable, a founder scrolls an AI shopping conversation on a phone, stops mid-scroll beside a boxed product, and looks from the phone to the box. Keep the conversation text unreadable.',
      dur: 6,
      img: 'assets/scene-1.jpg',
      preview: { state: 'stale', reason: 'Words changed', attempts: 1, charged: 'no' },
      line: null,
    },
    {
      id: 's2',
      text: 'The same founder sets the boxed product beside their storefront on a laptop and studies the product view. Keep interface text unreadable.',
      dur: 4,
      img: 'assets/scene-2.jpg',
      preview: { state: 'ready', attempts: 2, charged: 'yes' },
      line: 'What about my product?',
    },
    {
      id: 's3',
      text: 'The founder turns the box in their hands, then looks directly at the camera.',
      dur: 6,
      img: 'assets/scene-3.jpg',
      preview: { state: 'ready', attempts: 6, charged: 'yes' },
      line: 'What do I need to check before adding it to Catalog?',
    },
    {
      id: 's4',
      text: 'Close on the boxed product beside the laptop, its product page open on screen. Keep interface text unreadable.',
      dur: 4,
      img: 'assets/scene-4.jpg',
      preview: { state: 'ready', attempts: 1, charged: 'yes' },
      line: null,
    },
  ],

  captions: [{ text: 'CTA', note: 'Call to action · over the last 2s', from: 18, dur: 2 }],

  // One list of references: what was "References" (image notes) and "Current
  // references" (the same four, with Remove and What is this?) in the capture.
  references: [
    {
      img: 'assets/ref-1.jpg',
      name: 'Shopify Balance on a phone',
      title: 'A seller checks their sales and expenses using Shopify Balance',
      role: 'Lifestyle',
      by: 'Matched by Vicino',
      source: 'From your website',
      what: '',
    },
    {
      img: 'assets/ref-2.png',
      dark: true,
      name: 'Shop Pay logo',
      title: 'The Shop Pay mark, white on black. Keep it out of the shots unless checkout is shown.',
      role: 'Logo',
      by: 'Matched by Vicino',
      source: 'From your website',
      what: '',
    },
    {
      img: 'assets/ref-3.jpg',
      name: 'Mugs on storefronts',
      title: 'A Shopify merchant lists ceramic mugs on social storefronts and marketplaces',
      role: 'Screenshot',
      by: 'Matched by Vicino',
      source: 'From your website',
      what: '',
    },
    {
      img: 'assets/ref-4.jpg',
      name: 'POS terminal',
      title: 'A Shopify point-of-sale terminal on a counter, screen lit.',
      role: 'Product',
      by: 'Matched by Vicino',
      source: 'From your website',
      what: '',
    },
  ],

  // What the capture showed as three amber bands above the scenes.
  notes: [
    {
      id: 'product',
      short: 'No product photo',
      text: 'The product is drawn from its description and may not match. Add a product photo.',
      fix: 'Choose photo',
    },
    {
      id: 'person',
      short: 'No photo of the person on camera',
      text: 'The same face and outfit are kept across scenes, but they are invented. Add a model or try-on photo to control them.',
      fix: 'Add a reference',
    },
    {
      id: 'catalog',
      short: 'Verified Catalog instructions missing',
      text: 'Without the Catalog instructions and eligibility for the depicted store, this scene is generated and may not match the real thing.',
      fix: 'Add a reference',
    },
  ],

  context: {
    channel: {
      name: 'X',
      connection: 'Connected',
    },
    checks: 'Passed',
    catalog: 'Nothing recorded yet',
  },
};

// ---------------------------------------------------------------- formats
// Only a video has a storyboard. A carousel and a text post go Brief → Review.
// The carousel is the post in the result captures ("Find Your Catalog Starting
// Point", 2 images); the text post is the campaign's "Which Channel Fits This
// Product?", its words written for the prototype.
(function (D) {
  D.post.kind = 'video';
  D.post.status = 'Not generated yet';
  D.result = {
    video: {
      copy: 'An AI shopping conversation can make you look at your own product differently. Start with the question that matters for your store.\nReply with the product you’d check first.\n\n#Shopify #AIcommerce #ecommerce',
      madeFrom: [
        '3 of 4 scenes from their preview',
        'Scene 1 from its description',
        'Voice Talking · 2 spoken lines',
      ],
      check:
        'The last spoken line points at Catalog setup, which the brief rules out. Consider ending on the general question instead.',
    },
    carousel: {
      copy: "Start with the product you're already selling. Then check the current Shopify Catalog guidance for the steps that apply to your store.\nVisit Shopify's profile to find Catalog guidance.\n\n#ShopifyCatalog #Shopify #ecommerce",
      madeFrom: ['2 slides from the brief', 'Brand images as reference'],
      check: '',
    },
    text: {
      copy: "Your best channel is the one your buyers already ask questions in.\n\nBefore listing everywhere, pick one: where do people already ask about products like yours? Start there, learn what they ask, then grow.\n\nWhich product, which channel? Reply and we'll compare notes.\n\n#Shopify #ecommerce",
      madeFrom: ['One post from the brief', 'Under 280 characters'],
      check: '',
    },
  };
  D.formats = {
    carousel: {
      post: {
        title: 'Find Your Catalog Starting Point',
        status: 'Not generated yet',
        format: 'Carousel',
        kind: 'carousel',
        when: 'Oct 12 · 12:30 PM',
        channel: 'X',
        version: 4,
      },
      brief: {
        audience: 'Merchants preparing an existing product for AI discovery.',
        coreIdea:
          'Before adding a product to Shopify Catalog, find the guidance that applies to your store. Start with the product you already sell.',
        cta: "Visit Shopify's profile to find Catalog guidance.",
        proofs: ['Current Catalog guidance', 'Steps that apply to your store', 'Products you already sell'],
        tone: "Direct and builder-to-builder, with the merchant's next decision doing the work.",
        hook: 'A packaged product sits beside its storefront page on a laptop as the merchant taps to open Shopify Catalog guidance',
        plan: 'Two photographic slides in a real workshop; the second carries the call to action as text.',
        look: 'Warm workshop light, real merchandise, the product and its storefront page visible together.',
        voice: 'silent',
        voiceWhy: '',
        labels: 'Slide 2: the call to action',
        guardrails:
          'Confirm the profile link reaches current Catalog guidance before publishing. · Do not depict invented Catalog screens, setup steps or eligibility requirements.',
        requirements: [],
        story:
          'Frame 1: A merchant sets a packaged product beside its storefront page on a laptop and taps to open Shopify Catalog guidance. Keep the product and storefront visible together; show no invented interface details.\nFrame 2: The same merchant looks between the packaged product and the open guidance page, ready to check which instructions apply to the store. Keep page text unreadable rather than inventing requirements.\nCaption: Start with the product you’re already selling. Then check the current Shopify Catalog guidance for the steps that apply to your store.\nCTA: Visit Shopify’s profile to find Catalog guidance.',
        caption:
          "Start with the product you're already selling. Then check the current Shopify Catalog guidance for the steps that apply to your store.",
      },
      slides: [
        {
          text: 'A merchant sets a packaged product beside its storefront page on a laptop and taps to open Shopify Catalog guidance.',
          img: 'assets/slide-1.jpg',
        },
        {
          text: 'The same merchant looks between the product and the open guidance page. Overlay: “Visit Shopify’s profile to find Catalog guidance.”',
          img: 'assets/slide-2.jpg',
        },
      ],
    },
    text: {
      post: {
        title: 'Which Channel Fits This Product?',
        status: 'Not generated yet',
        format: 'Text post',
        kind: 'text',
        when: 'Oct 19 · 9:00 AM',
        channel: 'X',
        version: 2,
      },
      brief: {
        audience: 'Merchants deciding where to sell a product first.',
        coreIdea:
          'Not every channel suits every product. Pick the first one by where your buyers already ask questions.',
        cta: "Reply with the product and the channel you'd try first.",
        proofs: ['Where buyers already ask', 'One channel to start', 'No promised results'],
        tone: 'Plain and practical, one idea per line, no promises about sales.',
        hook: 'Your best channel is the one your buyers already ask questions in',
        plan: 'One short post: the observation, one way to choose, then the question back.',
        look: '',
        voice: 'silent',
        voiceWhy: '',
        labels: '',
        guardrails: 'Do not rank channels or promise results.',
        requirements: [],
        story:
          'Line 1: the observation.\nLines 2–3: how to pick the first channel.\nLast line: the question back to the reader.',
        caption: '',
      },
      slides: [],
    },
  };
})(window.CD_DATA);
