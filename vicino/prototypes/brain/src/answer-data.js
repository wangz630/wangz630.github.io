/* What each report field says, boiled down.

   The answers themselves are captured - full sentences with their citations. The
   two richer layouts need something shorter to set beside them, so each field
   gets three written-for-the-prototype extras:

     terms   the phrases worth marking when the answer is read as plain writing
     read    what the brand says (its own wording) next to what the index makes of it
     glance  the field in four blocks - a label, a short value, and a mark

   All three are written from the captured answer on this page and nowhere else:
   nothing here adds a fact the index does not already hold. */
window.BRAIN_ANSWER_EXTRA = {
  snapshot: {
    terms: [
      'interactive basketball app',
      'personal skills trainer',
      'real-time analysis',
      'free app',
      'HomeCourt+',
      'team/group plans',
      'San Jose, CA and Hong Kong',
    ],
    read: {
      left: 'What the brand says',
      right: 'What the index reads it as',
      rows: [
        {
          a: 'An interactive basketball app and personal skills trainer.',
          b: 'A training product first - capture and feedback, not media or shopping.',
        },
        {
          a: 'A free app, plus HomeCourt+ and team or group plans.',
          b: 'Free is the way in; membership and teams are where it earns.',
        },
        {
          a: 'Operates through Nex, in San Jose, CA and Hong Kong.',
          b: 'A US and Hong Kong company behind an NBA-partnered app.',
        },
      ],
    },
    glance: [
      {
        icon: 'package',
        label: 'What it is',
        value: 'Interactive basketball app and skills trainer',
        tone: 'a',
      },
      {
        icon: 'tag',
        label: 'What it sells',
        value: 'Free app · HomeCourt+ · team and group plans',
        tone: 'b',
      },
      {
        icon: 'users',
        label: 'Who it is for',
        value: 'Players, clubs, teams, schools, camps, communities',
        tone: 'c',
      },
      {
        icon: 'globe',
        label: 'Where it operates',
        value: 'Nex — San Jose, CA and Hong Kong',
        tone: 'd',
      },
    ],
  },

  brand_identity: {
    terms: [
      'digital community curation tools',
      'personal skills trainer',
      'virtual team',
      'community features',
      'train smarter',
      'get better together',
    ],
    read: {
      left: 'The promise, in its words',
      right: 'What the index reads it as',
      rows: [
        {
          a: '“The personal skills trainer that captures your performance.”',
          b: 'The mission is stated as a product role, not a slogan.',
        },
        {
          a: '“Digital community curation tools for clubs, teams, schools and camps.”',
          b: 'Positioning stretches from one player to a whole club.',
        },
        {
          a: '“Train smarter and know what to work on next.”',
          b: 'The promise is a better next session, not a season outcome.',
        },
      ],
    },
    glance: [
      {
        icon: 'target',
        label: 'Mission',
        value: 'Make community curation tools available to everyone',
        tone: 'a',
      },
      {
        icon: 'layers',
        label: 'Positioning',
        value: 'A personal skills trainer with team and community features',
        tone: 'b',
      },
      {
        icon: 'spark',
        label: 'Promise',
        value: 'Train smarter; know what to work on next',
        tone: 'c',
      },
      { icon: 'users', label: 'Reach', value: 'One player, or a whole club', tone: 'd' },
    ],
  },

  conviction: {
    terms: [
      'improve through motion-based',
      'guided, real-time feedback',
      'sports science',
      'pro athletes',
      'NBA partnership',
      'community-based connections',
    ],
    read: {
      left: 'What it stands for',
      right: 'What it puts behind it',
      rows: [
        {
          a: 'People improve by playing, with feedback as they play.',
          b: 'Motion capture and real-time feedback, in the free app.',
        },
        {
          a: 'Coaching should not stop at the people who can afford it.',
          b: 'Curation tools given to clubs, teams, schools and camps.',
        },
        {
          a: 'The training is serious, not a toy.',
          b: 'Sports science with pro athletes; an NBA partnership.',
        },
      ],
    },
    glance: [
      {
        icon: 'spark',
        label: 'The belief',
        value: 'Improvement comes from play plus feedback',
        tone: 'a',
      },
      {
        icon: 'users',
        label: 'The reach',
        value: 'Clubs, teams, schools and camps everywhere',
        tone: 'b',
      },
      {
        icon: 'check',
        label: 'The proof',
        value: 'Sports science built with pro athletes',
        tone: 'c',
      },
      {
        icon: 'gap',
        label: 'Not evidenced',
        value: '4 parts of the claim are not in the index',
        tone: 'gap',
      },
    ],
  },

  community: {
    terms: [
      'individual players',
      'parents, teams, clubs, leagues',
      'teachers, schools, camps',
      'instant feedback',
      'in-depth analytics',
      'personalized daily workouts',
      'remote practices',
    ],
    read: {
      left: 'Who is in the audience',
      right: 'What they are there for',
      rows: [
        {
          a: 'Players set on developing their craft.',
          b: 'Instant feedback, skill ratings, and what to work on next.',
        },
        {
          a: 'Parents, coaches, clubs and leagues.',
          b: 'Seeing progress, and drills they can hand to a player.',
        },
        {
          a: 'Teachers, schools and camps.',
          b: 'Easy team setup, remote practice, sessions with or without a ball.',
        },
      ],
    },
    glance: [
      { icon: 'user', label: 'Core audience', value: 'Players developing their craft', tone: 'a' },
      { icon: 'users', label: 'Around them', value: 'Parents, coaches, clubs, leagues', tone: 'b' },
      { icon: 'book', label: 'Institutions', value: 'Teachers, schools and camps', tone: 'c' },
      {
        icon: 'spark',
        label: 'What they need',
        value: 'Feedback, analytics, drills, a clear next step',
        tone: 'd',
      },
    ],
  },

  expression: {
    terms: [
      'energetic, motivational',
      'short imperatives',
      'second-person',
      'coach-like rather than formal',
      'athletes, grinders, and teammates',
      'leveling up',
    ],
    read: {
      left: 'How it speaks',
      right: 'What that does',
      rows: [
        {
          a: 'Short imperatives and encouragement.',
          b: 'Reads like a coach on the side of the court, not a brand.',
        },
        {
          a: 'Second person, always “you”.',
          b: 'Every line lands as personal instruction.',
        },
        {
          a: 'Athletes, grinders, teammates.',
          b: 'An address that includes rather than sorts.',
        },
      ],
    },
    glance: [
      {
        icon: 'message',
        label: 'Tone',
        value: 'Energetic, motivational, performance-focused',
        tone: 'a',
      },
      {
        icon: 'type',
        label: 'Sentence shape',
        value: 'Short imperatives, second person',
        tone: 'b',
      },
      { icon: 'quote', label: 'Recurring theme', value: 'Improve · compete · level up', tone: 'c' },
      {
        icon: 'gap',
        label: 'Not evidenced',
        value: '4 phrases could not be located on the page',
        tone: 'gap',
      },
    ],
  },

  insight: {
    terms: [
      'no sensors, special cameras',
      'official NBA partner',
      'Sue Bird, Steve Nash, and Al Horford Jr',
      'Apple Design Award',
      '$69.99 per year',
      '7-day free trial',
      '$1.50 per player per month',
      'creating a virtual Team is free',
    ],
    read: {
      left: 'What sets it apart',
      right: 'What it leans on',
      rows: [
        {
          a: 'Train anywhere with only a ball and an iPhone.',
          b: 'No sensors, no special cameras, no special basketballs.',
        },
        {
          a: 'The training carries authority.',
          b: 'Official NBA partner; Sue Bird, Steve Nash, Al Horford Jr.',
        },
        {
          a: 'The press has taken it seriously.',
          b: 'WSJ, CNBC, CNET, ABC, Time — and an Apple Design Award.',
        },
      ],
    },
    glance: [
      {
        icon: 'spark',
        label: 'Difference',
        value: 'Only a ball and an iPhone — no extra hardware',
        tone: 'a',
      },
      {
        icon: 'check',
        label: 'Proof',
        value: 'NBA partner · named pros · Apple Design Award',
        tone: 'b',
      },
      {
        icon: 'tag',
        label: 'Offer',
        value: 'Free core · HomeCourt+ $69.99/yr · 7-day trial',
        tone: 'c',
      },
      {
        icon: 'users',
        label: 'For teams',
        value: 'Team free to create · $1.50 per player per month',
        tone: 'd',
      },
    ],
  },

  visual_identity: {
    terms: [
      'polished wood floors',
      'lime green painted keys',
      'white-on-black logo',
      'orange rounded-square app icon',
      'black-and-white athlete photography',
      'live tracking overlays',
      'sporty realism with polished app UI',
    ],
    read: {
      left: 'What you see',
      right: 'What it is doing',
      rows: [
        {
          a: 'A bright indoor court, wood floors, lime green keys.',
          b: 'The setting says "real court", not studio.',
        },
        {
          a: 'Black-and-white athlete photography, drills, youth teams.',
          b: 'Effort is the subject; the app is the lens.',
        },
        {
          a: 'iPhone mockups with tracking overlays and shot metrics.',
          b: 'The product is shown working, not described.',
        },
      ],
    },
    glance: [
      {
        icon: 'image',
        label: 'Setting',
        value: 'Modern indoor court, wood floors, lime green keys',
        tone: 'a',
      },
      {
        icon: 'palette',
        label: 'Identity',
        value: 'Minimal, high contrast: white on black, orange icon',
        tone: 'b',
      },
      {
        icon: 'camera',
        label: 'Imagery',
        value: 'Black-and-white athletes, drills, youth teams',
        tone: 'c',
      },
      {
        icon: 'phone',
        label: 'Product shots',
        value: 'iPhone screens with live tracking overlays',
        tone: 'd',
      },
    ],
  },
};
