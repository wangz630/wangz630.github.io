/* Roadmap - the Report's time-based section.

   What Brain holds once a 90-day strategy is approved - touchpoint 3 of the Brand
   Brain product spec (Strategy): approving writes four records at once. Three
   objectives move from Suggested to Confirmed - the marketing goal, the KPI and the
   phases - and the approval itself is recorded. The person who approves is the
   person who confirms. The roadmap shows those four records; the date decides which
   phase is running and which KPI it leads with.

   The four fields are declared once in `fields`; every design version reads that
   list. The copy is ILLUSTRATIVE, written for HomeCourt - the field set is the
   contract's. */
window.BRAIN_ROADMAP = {
  illustrative: true,
  // what this cycle is called, for the run of plans either side of it
  label: 'Fall launch',
  start: '2026-08-27',
  horizon: 90,
  fields: [
    { key: 'marketing', path: 'objectives.marketing', label: 'Marketing goal' },
    { key: 'kpis', path: 'objectives.kpi_tree', label: 'KPI' },
    { key: 'phases', path: 'objectives.phases', label: 'Phases' },
    { key: 'strategy', path: 'decisions.strategy', label: 'Approved strategy' },
  ],

  // decisions.strategy - the approval is the confirmation
  strategy: {
    name: '90-day strategy',
    version: 'v1',
    approvedBy: 'Devin O.',
    approverAvatar: 'assets/avatars/approver.png',
    approvedAt: '2026-08-27',
    // objectives.business, answered in onboarding; the three objectives were
    // drafted from it as Suggested
    suggestedAt: '2026-08-20',
    answer: 'More coaches running their teams on HomeCourt before winter',
  },

  // objectives.marketing
  marketing: {
    goal: 'Get 300 new teams running on HomeCourt by Nov 24',
    figure: '300',
    unit: 'new teams',
    by: 'by Nov 24',
  },

  // objectives.kpi_tree - one KPI leads each phase
  kpis: [
    { key: 'teams', label: 'New teams created', target: '300', note: 'by Nov 24' },
    { key: 'players', label: 'Players per team', target: '12', note: 'on average' },
    { key: 'cost', label: 'Cost per new team', target: '$25', note: 'or less' },
  ],

  // objectives.phases - each phase has a milestone and the KPI it leads with;
  // `facts` are the Knowledge facts the phase rests on (its supporting sources)
  phases: [
    {
      key: 'launch',
      name: 'Launch',
      days: [1, 30],
      milestone: 100,
      milestoneLabel: '100 teams',
      lead: 'teams',
      facts: ['f067', 'f061', 'f036'],
    },
    {
      key: 'season',
      name: 'Fall season',
      days: [31, 60],
      milestone: 200,
      milestoneLabel: '200 teams',
      lead: 'players',
      facts: ['f093', 'f058'],
    },
    {
      key: 'winter',
      name: 'Winter push',
      days: [61, 90],
      milestone: 300,
      milestoneLabel: '300 teams',
      lead: 'cost',
      facts: ['f055', 'f063'],
    },
  ],

  /* The plan is one of a run of them. A 90-day strategy is approved, it runs, it
     ends, and the next one is drafted from what the last one learned - so Brain
     holds more than the plan in front of you. The ones behind are read-only and
     carry what they ended on; the one ahead is a draft until somebody approves
     it, and approving it is what makes it the report's plan. The copy here is
     ILLUSTRATIVE, written for HomeCourt. */
  cycles: [
    {
      key: 'launch25',
      state: 'done',
      label: 'First season',
      start: '2025-03-05',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2025-03-05',
        suggestedAt: '2025-02-26',
        answer: 'Find out which coaches will run a whole season on it',
      },
      marketing: {
        goal: 'Get 60 teams through a full season on HomeCourt',
        figure: '60',
        unit: 'teams',
        by: 'by Jun 2',
      },
      kpis: [
        { key: 'teams', label: 'Teams created', target: '60', note: 'by Jun 2' },
        {
          key: 'finished',
          label: 'Teams that finished the season',
          target: '40',
          note: 'of the 60',
        },
        { key: 'coaches', label: 'Coaches invited', target: '140', note: 'in all' },
      ],
      phases: [
        {
          key: 'invite',
          name: 'Invite',
          days: [1, 30],
          milestone: 20,
          milestoneLabel: '20 teams',
          lead: 'coaches',
          facts: ['f036', 'f067'],
        },
        {
          key: 'firstgames',
          name: 'First games',
          days: [31, 60],
          milestone: 45,
          milestoneLabel: '45 teams',
          lead: 'teams',
          facts: ['f061', 'f058'],
        },
        {
          key: 'seasonend',
          name: 'Season end',
          days: [61, 90],
          milestone: 60,
          milestoneLabel: '60 teams',
          lead: 'finished',
          facts: ['f093', 'f055'],
        },
      ],
      outcome: {
        figure: '58',
        of: '60',
        unit: 'teams',
        met: false,
        note: 'Two short of sixty - but forty-four of them finished the season, which was the number the product was really asking about. It is why every plan since counts teams that are still running, not teams that signed up.',
      },
    },
    {
      key: 'summer25',
      state: 'done',
      label: 'Summer camps',
      start: '2025-06-03',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2025-06-03',
        suggestedAt: '2025-05-27',
        answer: 'Be the app the summer camps hand out',
      },
      marketing: {
        goal: 'Get 180 camp teams onto HomeCourt over the summer',
        figure: '180',
        unit: 'camp teams',
        by: 'by Aug 31',
      },
      kpis: [
        { key: 'teams', label: 'Camp teams created', target: '180', note: 'by Aug 31' },
        { key: 'camps', label: 'Camps signed up', target: '45', note: 'in all' },
        { key: 'cost', label: 'Cost per camp team', target: '$18', note: 'or less' },
      ],
      phases: [
        {
          key: 'signcamps',
          name: 'Sign the camps',
          days: [1, 30],
          milestone: 45,
          milestoneLabel: '45 teams',
          lead: 'camps',
          facts: ['f036', 'f063'],
        },
        {
          key: 'campweeks',
          name: 'Camp weeks',
          days: [31, 60],
          milestone: 130,
          milestoneLabel: '130 teams',
          lead: 'teams',
          facts: ['f061', 'f067'],
        },
        {
          key: 'keepthem',
          name: 'Keep them',
          days: [61, 90],
          milestone: 180,
          milestoneLabel: '180 teams',
          lead: 'cost',
          facts: ['f055', 'f058'],
        },
      ],
      outcome: {
        figure: '196',
        of: '180',
        unit: 'camp teams',
        met: true,
        note: 'Sixteen over, at $14 a team - the cheapest the product has ever bought a team. Every plan since has kept a camps phase in it.',
      },
    },
    {
      key: 'autumn25',
      state: 'done',
      label: 'Autumn restart',
      start: '2025-09-01',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2025-09-01',
        suggestedAt: '2025-08-25',
        answer: 'Catch the teams that form at the start of the school year',
      },
      marketing: {
        goal: 'Win 240 new teams in the first weeks of the school year',
        figure: '240',
        unit: 'new teams',
        by: 'by Nov 29',
      },
      kpis: [
        { key: 'teams', label: 'New teams created', target: '240', note: 'by Nov 29' },
        { key: 'coaches', label: 'Coaches invited', target: '520', note: 'in all' },
        { key: 'cost', label: 'Cost per new team', target: '$24', note: 'or less' },
      ],
      phases: [
        {
          key: 'whistle',
          name: 'First whistle',
          days: [1, 30],
          milestone: 90,
          milestoneLabel: '90 teams',
          lead: 'coaches',
          facts: ['f067', 'f036'],
        },
        {
          key: 'league',
          name: 'League start',
          days: [31, 60],
          milestone: 170,
          milestoneLabel: '170 teams',
          lead: 'teams',
          facts: ['f061', 'f093'],
        },
        {
          key: 'settle',
          name: 'Settle',
          days: [61, 90],
          milestone: 240,
          milestoneLabel: '240 teams',
          lead: 'cost',
          facts: ['f055', 'f058'],
        },
      ],
      outcome: {
        figure: '232',
        of: '240',
        unit: 'new teams',
        met: false,
        note: 'Eight short, with the cost holding at $24. Close enough that the next plan kept the shape and spent the winter holding what it had won.',
      },
    },
    {
      key: 'holiday25',
      state: 'done',
      label: 'Holiday hold',
      start: '2025-11-30',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2025-11-30',
        suggestedAt: '2025-11-23',
        answer: 'Keep the autumn teams playing through the break',
      },
      marketing: {
        goal: 'Hold 200 teams through the winter break',
        figure: '200',
        unit: 'teams running',
        by: 'by Feb 27',
      },
      kpis: [
        { key: 'retained', label: 'Teams still running', target: '200', note: 'of the 232 won' },
        { key: 'sessions', label: 'Sessions logged a week', target: '3', note: 'a team' },
        { key: 'cost', label: 'Cost per held team', target: '$9', note: 'or less' },
      ],
      phases: [
        {
          key: 'break',
          name: 'The break',
          days: [1, 30],
          milestone: 215,
          milestoneLabel: '215 teams',
          lead: 'retained',
          facts: ['f067', 'f061'],
        },
        {
          key: 'indoor',
          name: 'Indoor season',
          days: [31, 60],
          milestone: 205,
          milestoneLabel: '205 teams',
          lead: 'sessions',
          facts: ['f058', 'f093'],
        },
        {
          key: 'outdoors',
          name: 'Back outdoors',
          days: [61, 90],
          milestone: 200,
          milestoneLabel: '200 teams',
          lead: 'cost',
          facts: ['f055', 'f063'],
        },
      ],
      outcome: {
        figure: '211',
        of: '200',
        unit: 'teams running',
        met: true,
        note: 'Eleven over. Indoor sessions held far better than anyone expected, so the next plan was written to win new teams rather than hold old ones.',
      },
    },
    {
      key: 'newyear26',
      state: 'done',
      label: 'New year push',
      start: '2026-02-28',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2026-02-28',
        suggestedAt: '2026-02-21',
        answer: 'Turn the winter trialists into teams that pay for a full season',
      },
      marketing: {
        goal: 'Get 120 trial teams onto a paid season before the summer',
        figure: '120',
        unit: 'paid teams',
        by: 'by May 28',
      },
      kpis: [
        { key: 'paid', label: 'Trials turned paid', target: '120', note: 'by May 28' },
        { key: 'coaches', label: 'Coaches invited', target: '260', note: 'in all' },
        { key: 'cost', label: 'Cost per paid team', target: '$28', note: 'or less' },
      ],
      phases: [
        {
          key: 'reachout',
          name: 'Reach out',
          days: [1, 30],
          milestone: 40,
          milestoneLabel: '40 teams',
          lead: 'coaches',
          facts: ['f036', 'f067'],
        },
        {
          key: 'trialweek',
          name: 'Trial week',
          days: [31, 60],
          milestone: 85,
          milestoneLabel: '85 teams',
          lead: 'paid',
          facts: ['f061', 'f058'],
        },
        {
          key: 'seasonstart',
          name: 'Season start',
          days: [61, 90],
          milestone: 120,
          milestoneLabel: '120 teams',
          lead: 'cost',
          facts: ['f093', 'f055'],
        },
      ],
      outcome: {
        figure: '102',
        of: '120',
        unit: 'paid teams',
        met: false,
        note: 'Eighteen short. The trial week landed in the school holidays and half the coaches never opened it, so the next plan moved its warm-up a month earlier.',
      },
    },
    {
      key: 'spring',
      state: 'done',
      label: 'Spring run-up',
      start: '2026-05-29',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1.1',
        approvedBy: 'Devin O.',
        approverAvatar: 'assets/avatars/approver.png',
        approvedAt: '2026-05-29',
        suggestedAt: '2026-05-22',
        answer: 'Get coaches set up before the summer break, so the autumn starts full',
      },
      marketing: {
        goal: 'Get 150 new teams onto HomeCourt before the summer break',
        figure: '150',
        unit: 'new teams',
        by: 'by Aug 26',
      },
      kpis: [
        { key: 'teams', label: 'New teams created', target: '150', note: 'by Aug 26' },
        { key: 'coaches', label: 'Coaches invited', target: '400', note: 'in all' },
        { key: 'cost', label: 'Cost per new team', target: '$25', note: 'or less' },
      ],
      phases: [
        {
          key: 'warmup',
          name: 'Warm-up',
          days: [1, 30],
          milestone: 50,
          milestoneLabel: '50 teams',
          lead: 'coaches',
          facts: ['f067', 'f036'],
        },
        {
          key: 'camps',
          name: 'Summer camps',
          days: [31, 60],
          milestone: 100,
          milestoneLabel: '100 teams',
          lead: 'teams',
          facts: ['f061', 'f058'],
        },
        {
          key: 'preseason',
          name: 'Pre-season',
          days: [61, 90],
          milestone: 150,
          milestoneLabel: '150 teams',
          lead: 'cost',
          facts: ['f093', 'f055'],
        },
      ],
      // what it ended on, which is what the next plan was drafted from
      outcome: {
        figure: '164',
        of: '150',
        unit: 'new teams',
        met: true,
        note: 'Fourteen teams over the goal, but each one cost $31 against the $25 it aimed at. The next plan leads with cost in its last phase because of it.',
      },
    },
    {
      key: 'winter',
      state: 'draft',
      label: 'Winter cycle',
      start: '2026-11-25',
      horizon: 90,
      strategy: {
        name: '90-day strategy',
        version: 'v1',
        approvedBy: null,
        approvedAt: null,
        suggestedAt: '2026-10-08',
        answer: 'Hold the teams that joined in the autumn, and open the spring season full',
      },
      marketing: {
        goal: 'Hold 300 teams through winter and open spring on 420',
        figure: '420',
        unit: 'teams running',
        by: 'by Feb 22',
      },
      kpis: [
        { key: 'retained', label: 'Teams still running', target: '300', note: 'of the 300 won' },
        { key: 'teams', label: 'New teams created', target: '120', note: 'on top' },
        { key: 'cost', label: 'Cost per new team', target: '$22', note: 'or less' },
      ],
      phases: [
        {
          key: 'holidays',
          name: 'Holiday hold',
          days: [1, 30],
          milestone: 320,
          milestoneLabel: '320 teams',
          lead: 'retained',
          facts: ['f067', 'f061'],
        },
        {
          key: 'newyear',
          name: 'New year',
          days: [31, 60],
          milestone: 370,
          milestoneLabel: '370 teams',
          lead: 'teams',
          facts: ['f093', 'f058'],
        },
        {
          key: 'spring',
          name: 'Spring sign-ups',
          days: [61, 90],
          milestone: 420,
          milestoneLabel: '420 teams',
          lead: 'cost',
          facts: ['f055', 'f063'],
        },
      ],
    },
  ],

  /* every version of the plan, newest first - what changed, who changed it and
     when. A version belongs to a cycle and counts from v1 inside it: the picker
     moves between cycles, this moves between versions of one. The prototype adds
     to this as you change things. */
  versions: [
    {
      v: 'v1',
      cycle: 'winter',
      at: '2026-10-08',
      by: 'Brain',
      kind: 'drafted',
      what: 'Drafted the next ninety days from what the Spring run-up ended on: hold the teams the autumn won, and open spring on 420.',
    },
    {
      v: 'v1',
      cycle: 'now',
      at: '2026-08-27',
      by: 'Devin O.',
      kind: 'approved',
      what: 'Approved the 90-day strategy. Brain wrote the marketing goal, the KPI tree and the three phases from it, and the approval confirmed all four.',
    },
    {
      v: 'v1.1',
      cycle: 'spring',
      at: '2026-07-14',
      by: 'Devin O.',
      kind: 'edited',
      what: 'Moved the Pre-season milestone from 140 to 150 teams after the summer camps ran ahead.',
    },
    {
      v: 'v1',
      cycle: 'spring',
      at: '2026-05-29',
      by: 'Devin O.',
      kind: 'approved',
      what: 'The first approved strategy: 150 new teams before the summer break, over a warm-up, the camps and a pre-season.',
    },
  ],
};
