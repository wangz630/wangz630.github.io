/* The Brain fields each report field is made of (Versions → Field content: Fields).

   A report field is written from several Brain fields - `brand.positioning`,
   `products.catalog`, `audience.icp_segments`... - and the user needs to see which
   ones, what each holds, how Brain knows it, and to confirm, edit or set each one.
   The keys, names, statuses and what each needs follow the Brand Brain Console
   design review (its "Brain view"): every field is Confirmed, Partly known, Not set
   or Read from Strategy; some only the brand can answer ("You declare"), which take
   Set or None. `need`: B required for the first snapshot, E expected (the brand may
   say none), O optional.

   The values are written for the prototype from the captured facts on this page
   (`facts` lists the ones each rests on) or from what the brand profile read off the
   site (`from`); nothing here adds a fact the index does not hold. A field the index
   says nothing about stays Not set - its Generate finds nothing to write from.
   `draft` is what Generate writes for a Not set field when the index can.

   Brand basics is the worked example: it carries one field of every state a field
   can be in, so the whole vocabulary can be read on one screen - Direct, Supported,
   Inferred and Unconfirmed (all four are `partly`, told apart by the evidence
   behind them), Confirmed, You wrote this (`wrote`), You edited (`edited`, with
   `prev` holding what Brain read), You said none (`none`), Read from Strategy, the
   three empties (You declare / Brain can write it / Unknown) - and only Writing it…
   is missing, because that one lasts as long as Generate runs. */
window.BRAIN_FIELDS = {
  snapshot: {
    section: 'Brand basics',
    fields: [
      {
        key: 'identity.official_names',
        label: 'Official names',
        need: 'B',
        status: 'partly',
        value:
          'HomeCourt (the app) · HomeCourt+ (the membership) · HomeCourt for Teams · made by Nex',
        facts: ['f113', 'f119', 'f099'],
      },
      {
        key: 'identity.category_model',
        label: 'Category & business model',
        need: 'E',
        status: 'partly',
        value:
          'A basketball training app for iPhone and iPad - the phone is the only hardware it needs. The app itself is free to use, and it earns from HomeCourt+ memberships at $7.99 a month or $69.99 a year, from group Team plans at $1.50 to $1.99 per player a month, and from a 3-month pass sold on Amazon. A 7-day free trial runs on new memberships.',
        facts: ['f113', 'f106', 'f053', 'f055'],
      },
      {
        key: 'identity.markets_locales',
        label: 'Markets & languages',
        need: 'B',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value:
          'Sold worldwide through the Apple App Store; the company is based in San Jose, CA and Hong Kong.',
        facts: ['f054', 'f096'],
      },
      {
        key: 'identity.brand_hierarchy',
        label: 'Brand hierarchy',
        need: 'B',
        status: 'partly',
        value:
          'Nex (the company) → HomeCourt (its first app) → HomeCourt+, HomeCourt for Teams and HomeCourt PE. Nex also makes Active Arcade.',
        facts: ['f099', 'f101', 'f027'],
      },
      {
        // Unconfirmed: a value with nothing behind it - it came in without a line,
        // so there is no fact and no profile read to show for it
        key: 'identity.tagline',
        label: 'Lead line',
        need: 'E',
        status: 'partly',
        value: 'Unlock the pro within.',
      },
      {
        // Unknown: nothing read so far says it, and the answer does not list it
        // either - so it reads "Nothing read says it" rather than "Not in the index"
        key: 'identity.founding_story',
        label: 'How it started',
        need: 'O',
        status: 'notset',
      },
      {
        key: 'identity.owned_entities',
        label: 'Aliases & owned handles',
        need: 'E',
        status: 'notset',
        draft: 'homecourt.ai · teams@homecourt.ai · inquiry@homecourt.ai',
        draftFacts: ['f081', 'f102'],
      },
      {
        key: 'identity.exclusions',
        label: 'Not us',
        need: 'E',
        you: true,
        status: 'wrote',
        value:
          'Not a wearable, a sensor or a smart-ball brand - HomeCourt needs no gear beyond the phone.',
        at: '2026-09-22T10:12:00',
      },
      {
        key: 'market.exclusions',
        label: 'Out-of-scope context',
        need: 'E',
        you: true,
        status: 'none',
        at: '2026-09-22T10:14:00',
      },
      {
        key: 'brand.positioning',
        label: 'Positioning',
        need: 'B',
        status: 'partly',
        value:
          "An interactive basketball app and personal skills trainer: the phone's camera captures every shot and gives real-time feedback, with no sensors, smart balls or special cameras. It is built for committed players training on their own, and for the teams, clubs, schools and camps around them - a coach can run a roster, set drills and see the same numbers the player sees. Its claims rest on sports science and on the pros who train with it.",
        facts: ['f113', 'f128', 'f121', 'f112'],
      },
      {
        key: 'products.catalog',
        label: 'Product catalog',
        need: 'B',
        status: 'edited',
        value:
          'HomeCourt (free) · HomeCourt+ $7.99 a month or $69.99 a year · Team plans $1.50–$1.99 per player a month · HomeCourt PE lesson plans · a 3-month pass on Amazon',
        prev: 'HomeCourt app (free) · HomeCourt+ ($7.99 a month, $69.99 a year) · Team plans ($1.50–$1.99 per player a month) · HomeCourt PE lesson plans · a 3-month pass on Amazon',
        at: '2026-09-23T16:40:00',
        facts: ['f106', 'f053', 'f055', 'f036', 'f057'],
      },
      {
        key: 'products.availability',
        label: 'Availability',
        need: 'E',
        status: 'notset',
        draft:
          'iPhone and iPad, from the Apple App Store; HomeCourt+ as an in-app purchase; a 3-month pass on Amazon.',
        draftFacts: ['f044', 'f054', 'f057'],
      },
      {
        key: 'products.use_cases',
        label: 'Use cases',
        need: 'E',
        status: 'partly',
        value:
          'Training alone at home - a living room, a patio, a driveway or a garage becomes a court. Team and academy practice, including remote practices a coach sets and watches from anywhere. PE classes at school or at home, with lesson plans written for teachers. And summer camps, where HomeCourt runs the drills and keeps the scores.',
        facts: ['f024', 'f122', 'f027', 'f042'],
      },
      {
        key: 'products.value_chain',
        label: 'Feature → benefit → outcome',
        need: 'E',
        status: 'partly',
        value:
          "The phone's camera tracks every shot, with no sensors → instant feedback and stats → players see what to work on next.",
        facts: ['f124', 'f105', 'f114', 'f126'],
      },
      {
        // Inferred: real evidence behind it, none of it sure enough to quote - the
        // value is worked out from what each help page covers
        key: 'products.support_channels',
        label: 'Help & support',
        need: 'O',
        status: 'partly',
        value:
          'A help forum, plus FAQs on Team setup, subscriptions, shot analysis, skill ratings and privacy.',
        facts: ['f022', 'f013', 'f014', 'f017', 'f019'],
      },
      {
        key: 'products.offers_ctas',
        label: 'Offers & CTAs',
        need: 'E',
        status: 'notset',
        draft:
          'A 7-day free trial on new memberships · free Team setup · 75% off for groups who buy now',
        draftFacts: ['f006', 'f061', 'f090'],
      },
      {
        key: 'objectives.current_priorities',
        label: "Right now: this quarter's focus",
        need: 'B',
        you: true,
        status: 'notset',
      },
    ],
  },

  /* The roadmap is a section like any other: the four records approving a 90-day
     strategy writes (touchpoint 3 of the Brain spec). The section page draws them
     as a plan first and as these fields under it - the values are read from
     `window.BRAIN_ROADMAP`, so both readings say the same thing. */
  roadmap: (() => {
    const R = window.BRAIN_ROADMAP || {};
    const day = (n) => {
      const d = new Date(`${R.start}T00:00:00`);
      d.setDate(d.getDate() + n - 1);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const S = R.strategy || {};
    return {
      section: 'Roadmap',
      fields: [
        {
          key: 'objectives.marketing',
          live: 'marketing',
          label: 'Marketing goal',
          need: 'B',
          status: 'strategy',
          confirmedAt: S.approvedAt,
          value: R.marketing ? R.marketing.goal : '',
        },
        {
          key: 'objectives.kpi_tree',
          live: 'kpis',
          label: 'KPI tree',
          need: 'B',
          status: 'strategy',
          confirmedAt: S.approvedAt,
          value: (R.kpis || []).map((k) => `${k.label} → ${k.target} ${k.note}`).join(' · '),
        },
        {
          key: 'objectives.phases',
          live: 'phases',
          label: 'Phases',
          need: 'B',
          status: 'strategy',
          confirmedAt: S.approvedAt,
          value: (R.phases || [])
            .map((p) => `${p.name} (${day(p.days[0])} – ${day(p.days[1])}) → ${p.milestoneLabel}`)
            .join(' · '),
        },
        {
          key: 'decisions.strategy',
          live: 'strategy',
          label: 'Approved strategy',
          need: 'B',
          status: 'strategy',
          confirmedAt: S.approvedAt,
          value: `${S.name} ${S.version}, approved by ${S.approvedBy} · written from what the brand answered in onboarding: “${S.answer}”`,
        },
      ],
    };
  })(),

  brand_identity: {
    section: 'Brand identity',
    fields: [
      {
        key: 'market.competitors',
        label: 'Competitor registry',
        need: 'E',
        you: true,
        status: 'notset',
      },
      {
        key: 'market.comparison_axes',
        label: 'Comparison axes',
        need: 'O',
        status: 'partly',
        value:
          'No sensors or special cameras · AI feedback from a phone · an official NBA partner · a free core app',
        facts: ['f105', 'f124', 'f108', 'f106'],
      },
      {
        key: 'market.categories',
        label: 'Market context',
        need: 'E',
        status: 'partly',
        value:
          'Basketball training and sports-tech apps, for players and for youth teams, clubs, schools and camps.',
        facts: ['f113', 'f112', 'f030'],
      },
      {
        key: 'brand.value_proposition',
        label: 'Value proposition by audience',
        need: 'E',
        status: 'partly',
        value:
          'Players: train smarter with instant feedback, anytime · Coaches and clubs: set up a team and its practices for free · Teachers: PE lessons with or without a basketball',
        facts: ['f114', 'f115', 'f064', 'f029'],
      },
    ],
  },

  conviction: {
    section: 'Conviction',
    fields: [
      {
        key: 'governance.content_rules',
        label: 'Content rules',
        need: 'E',
        status: 'partly',
        value:
          'Stands for play and getting better for everyone, on the devices people already have. Stands against needing sensors or special gear. Its claims rest on sports science and pro athletes.',
        facts: ['f098', 'f103', 'f105', 'f076'],
      },
      {
        key: 'brand.values_language',
        label: 'Values language',
        need: 'B',
        status: 'notset',
        gap: 'Specific brand values language',
      },
      {
        key: 'brand.mission',
        label: 'Mission statement',
        need: 'E',
        status: 'notset',
        gap: 'Formal mission statement',
      },
      {
        key: 'governance.evidence_policy',
        label: 'Evidence methodology',
        need: 'O',
        status: 'notset',
        gap: 'Published evidence methodology',
      },
    ],
  },

  community: {
    section: 'Community',
    fields: [
      {
        key: 'audience.triggers',
        label: 'Triggers & moments',
        need: 'O',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value: 'A new season or a summer camp · practice moving online · a free trial',
        facts: ['f085', 'f035', 'f006'],
      },
      {
        key: 'audience.icp_segments',
        label: 'ICP segments',
        need: 'B',
        status: 'partly',
        value:
          'Committed players who want to train between practices, and the families paying for them. Coaches, clubs and leagues who run a roster on Team plans. PE teachers and schools using the lesson plans, and summer camps that run their weeks on it.',
        facts: ['f119', 'f008', 'f058', 'f030', 'f042'],
      },
      {
        key: 'audience.buying_roles',
        label: 'Buying roles',
        need: 'O',
        status: 'partly',
        value:
          'A player or a parent buys HomeCourt+; a coach or a club buys Team plans; teachers set up classes for free.',
        facts: ['f053', 'f055', 'f058', 'f035'],
      },
      {
        key: 'audience.jobs_pains',
        label: 'Jobs, pains, outcomes',
        need: 'E',
        status: 'partly',
        value:
          'Get better without a coach, a court or gear · keep players engaged between practices · run PE from home',
        facts: ['f105', 'f091', 'f027'],
      },
      {
        key: 'audience.negative_fit',
        label: 'Negative fit',
        need: 'E',
        you: true,
        status: 'notset',
      },
      {
        key: 'audience.criteria_objections',
        label: 'Decision criteria & objections',
        need: 'O',
        you: true,
        status: 'notset',
      },
      {
        key: 'audience.journey',
        label: 'Journey stages',
        need: 'O',
        you: true,
        status: 'notset',
      },
    ],
  },

  expression: {
    section: 'Expression',
    fields: [
      {
        key: 'brand.voice_tone',
        label: 'Voice & tone',
        need: 'E',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value: 'Energetic, motivational and coach-like: short imperatives, spoken to "you".',
        from: ["Read from the brand's own copy on its pages"],
      },
      {
        key: 'brand.terminology',
        label: 'Terminology',
        need: 'E',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value: 'HomeCourt+ · Team · Battle Mode · skill ratings · committed players',
        facts: ['f074', 'f126', 'f119'],
      },
      {
        key: 'brand.examples',
        label: 'On/off-brand examples',
        need: 'O',
        status: 'partly',
        value:
          'On-brand: "Upgrade your game." "Train smarter." "Love the grind." "Get better together."',
        from: ["Quoted from the brand's own pages"],
      },
      {
        key: 'brand.message_hierarchy',
        label: 'Message hierarchy',
        need: 'B',
        status: 'strategy',
      },
      {
        key: 'brand.claim_policy',
        label: 'Claims policy',
        need: 'B',
        you: true,
        status: 'notset',
      },
      {
        key: 'products.claims',
        label: 'Approved claims',
        need: 'E',
        you: true,
        status: 'notset',
      },
      {
        key: 'market.competitive_claim_rules',
        label: 'Competitive claim rules',
        need: 'O',
        status: 'notset',
        gap: 'Approved recurring slogan list',
      },
      {
        key: 'brand.style_rules',
        label: 'Copy style rules',
        need: 'E',
        status: 'notset',
        gap: 'Customer-facing copy style rules',
      },
      {
        key: 'brand.tone_examples',
        label: 'Tone by channel',
        need: 'O',
        status: 'notset',
        gap: 'Tone-of-voice examples by channel',
      },
    ],
  },

  insight: {
    section: 'Key insights',
    fields: [
      {
        key: 'learning.observations',
        label: 'Observations',
        need: 'O',
        status: 'strategy',
      },
      {
        key: 'learning.learned_intelligence',
        label: 'Learned intelligence',
        need: 'O',
        you: true,
        status: 'notset',
      },
      {
        key: 'learning.injection_policy',
        label: 'Where learnings apply',
        need: 'E',
        you: true,
        status: 'notset',
      },
    ],
  },

  visual_identity: {
    section: 'Visual identity',
    fields: [
      {
        key: 'visual.color_tokens',
        label: 'Color tokens',
        need: 'E',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value:
          'Deep neutral #272727 · White #FFFFFF · Bright orange #FF4000 · Black #000000 and #131313 · Bright green #7DBB00 (low confidence)',
        from: ["Read from homecourt.ai's stylesheet"],
      },
      {
        key: 'visual.typography',
        label: 'Typography',
        need: 'O',
        status: 'confirmed',
        confirmedAt: '2026-09-18',
        value: 'Helvetica Neue for display and interface text; DIN 2014 for display',
        from: ["Read from homecourt.ai's stylesheet"],
      },
      {
        key: 'visual.logos',
        label: 'Logo system',
        need: 'E',
        status: 'partly',
        value: 'A white-on-black wordmark; an orange rounded-square app icon with a white symbol',
        from: ['The image on homecourt.ai that names the brand'],
      },
      {
        key: 'visual.imagery',
        label: 'Imagery rules',
        need: 'O',
        status: 'partly',
        value:
          'Action-led: black-and-white athlete photography, youth teams and drills, live tracking overlays; brightly lit indoor courts with lime green keys',
        from: ['8 images from homecourt.ai'],
      },
      {
        key: 'visual.motion',
        label: 'Motion rules',
        need: 'O',
        you: true,
        status: 'notset',
      },
      {
        key: 'visual.prohibited_use',
        label: 'Prohibited use',
        need: 'E',
        you: true,
        status: 'notset',
      },
      {
        key: 'visual.asset_rights',
        label: 'Asset rights & expiry',
        need: 'E',
        you: true,
        status: 'notset',
      },
    ],
  },
};

/* Every Brain field is its own question of the index - the report section's answer is
   these answers, not a paragraph over them (the Brand Brain Console review: "each
   field is a query of its own"). The wording is written for the prototype. */
window.BRAIN_FIELD_QUERIES = {
  'identity.official_names': 'What is the brand called, in full, and what does it call its parts?',
  'identity.category_model': 'What kind of thing is it, and how does it make money?',
  'identity.markets_locales': 'Where is it sold, and in what languages?',
  'identity.brand_hierarchy': 'What sits under what - company, app, memberships?',
  'identity.owned_entities': 'What else is the brand called, and which handles are its own?',
  'identity.exclusions': 'What is the brand not, that people might take it for?',
  'market.exclusions': 'Which contexts should never be read as this brand?',
  'objectives.current_priorities': 'What is the brand pushing this quarter?',
  'objectives.marketing': 'What is the brand driving at over this plan?',
  'objectives.kpi_tree': 'Which numbers say whether it is working?',
  'objectives.phases': 'How is the plan cut into phases, and what does each one carry?',
  'decisions.strategy': 'Which strategy was approved, by whom, and out of what?',
  'brand.positioning': 'In one sentence, what is it and who is it for?',
  'products.catalog': 'What can be bought, and at what price?',
  'products.availability': 'Where can it be got, and on what?',
  'identity.tagline': 'What line does the brand lead with?',
  'identity.founding_story': 'When did the brand start, and why?',
  'products.support_channels': 'Where do people get help?',
  'products.use_cases': 'What do people actually use it for?',
  'products.value_chain': 'Which feature leads to which benefit, and to what outcome?',
  'products.offers_ctas': 'What offers run, and what does the brand ask people to do?',
  'market.competitors': 'Who else is in this market, by name?',
  'market.comparison_axes': 'On what does the brand ask to be compared?',
  'market.categories': 'What is happening in the market it sits in?',
  'brand.value_proposition': 'What does it promise, to each audience?',
  'governance.content_rules': 'What must and must not appear in anything published?',
  'brand.values_language': 'In the brand’s own words, what does it stand for?',
  'brand.mission': 'What is the brand here to do?',
  'governance.evidence_policy': 'What counts as proof before a claim may be made?',
  'audience.triggers': 'What makes someone start looking?',
  'audience.icp_segments': 'Who is it for, in groups?',
  'audience.buying_roles': 'Who decides, who pays, who uses it?',
  'audience.jobs_pains': 'What are they trying to get done, and what gets in the way?',
  'audience.negative_fit': 'Who is it not for?',
  'audience.criteria_objections': 'What do they weigh up, and what holds them back?',
  'audience.journey': 'What are the stages from first hearing of it to using it?',
  'brand.voice_tone': 'How does the brand sound?',
  'brand.terminology': 'Which words does it use, and which does it avoid?',
  'brand.examples': 'What is on-brand, and what is off?',
  'brand.message_hierarchy': 'What is said first, and what supports it?',
  'brand.claim_policy': 'Which claims may never be made?',
  'products.claims': 'Which claims are approved, and what backs each one?',
  'market.competitive_claim_rules': 'What may be said about the competition?',
  'brand.style_rules': 'How is copy set - length, case, punctuation?',
  'brand.tone_examples': 'How does the voice change from channel to channel?',
  'learning.observations': 'What has been learned from what ran?',
  'learning.learned_intelligence': 'What patterns hold across campaigns?',
  'learning.injection_policy': 'Where should a learning be applied next?',
  'visual.color_tokens': 'What are the brand’s colours, and what is each for?',
  'visual.typography': 'Which typefaces, at what weights?',
  'visual.logos': 'Which marks are the brand’s, and which is primary?',
  'visual.imagery': 'What do the pictures look like?',
  'visual.motion': 'How does the brand move?',
  'visual.prohibited_use': 'What may never be done to the marks?',
  'visual.asset_rights': 'What may be used, and until when?',
};

/* The visual assets a brand's marks are held in, and the design rules read from its
   own pages - the Brand Brain Console review's visual-identity screen. The images are
   the brand's own (captured); which ones are held, and every rule below, are written
   for the prototype: the console holds an image whose alt text or path names someone
   else until the owner says it is theirs, and only a confirmed rule reaches a brief. */
window.BRAIN_VISUAL = {
  held: [
    {
      id: 'img-05',
      name: 'Team huddle',
      why: 'Alt text names a partner - “NBA coaches at work”',
      where: 'homecourt.ai/teams',
    },
    {
      id: 'img-07',
      name: 'Court floor',
      why: 'Sits in the “as seen in” row with logos that are not yours',
      where: 'homecourt.ai',
    },
  ],
  rules: [
    {
      id: 'r1',
      kind: 'prohibited',
      text: 'Never place the mark over a busy court photograph; it sits on white or ink only.',
      cite: 'homecourt.ai/press',
      quote: 'The HomeCourt wordmark sits on a flat white or ink field.',
      formats: ['image', 'carousel', 'video'],
      state: 'confirmed',
    },
    {
      id: 'r2',
      kind: 'layout',
      text: 'One drill, one number to a frame - no dashboards, at most one chart in a carousel.',
      cite: 'homecourt.ai/features',
      quote: 'Every session ends with one number that moved.',
      formats: ['image', 'carousel'],
      state: 'proposed',
    },
    {
      id: 'r3',
      kind: 'typography',
      text: 'Headlines in the brand face at 700; body never below a 15px equivalent on a 1080 frame.',
      cite: 'homecourt.ai',
      quote: 'Read from the live stylesheet.',
      formats: ['all formats'],
      state: 'proposed',
    },
    {
      id: 'r4',
      kind: 'imagery',
      text: 'Real players on real courts, phone on a tripod - never stock-glossy, never 3D-rendered.',
      cite: 'You added this · no source',
      quote: '',
      formats: ['image', 'video'],
      state: 'confirmed',
    },
    {
      id: 'r5',
      kind: 'prohibited',
      text: 'Never show a score or a rating that a session did not produce.',
      cite: 'homecourt.ai/faq',
      quote: 'Scores come from the session, not from us.',
      formats: ['all formats'],
      state: 'proposed',
    },
  ],
};
