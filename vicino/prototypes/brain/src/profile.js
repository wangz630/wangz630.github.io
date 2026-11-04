/* Brand profile - the synthesized profile page, captured from
   dev.pulse.vicino.ai/brands/…/brand-profile (2026-09-18) and rebuilt here so it
   can live inside Brain's Report tab. Wording is the capture's; the visual
   identity's logo and imagery are the captured files in `assets/brand/`. */
window.BRAIN_PROFILE = {
  brand: 'HomeCourt',
  site: 'https://www.homecourt.ai/',
  lede: 'HomeCourt operates in AI-powered basketball training and sports technology.',
  updated: 'Sep 18, 2026',
  note: 'Synthesized from available brand sources',

  sections: [
    {
      id: 'snapshot',
      n: '01',
      title: 'Brand snapshot',
      sub: 'The essentials in one screen - who you are and what you sell.',
      icon: 'camera',
      overview: [
        {
          label: 'Summary',
          value:
            'HomeCourt is an interactive basketball app that captures player performance and provides guided feedback, drills, analytics, and virtual competition.',
          conf: 'supported',
        },
        {
          label: 'Industry',
          value: 'HomeCourt operates in AI-powered basketball training and sports technology.',
          conf: 'supported',
        },
        {
          label: 'Audience',
          value:
            'HomeCourt serves basketball players of all ages and skill levels, along with coaches, teams, clubs, camps, schools, and families supporting player development.',
          conf: 'supported',
        },
        {
          label: 'Positioning',
          value:
            'HomeCourt is positioned as an AI-powered platform for smarter basketball practice.',
          conf: 'supported',
        },
        {
          label: 'Tone',
          value:
            'HomeCourt uses an energetic, motivational, game-like coaching tone focused on progress, competition, and enjoyment.',
          conf: 'unconfirmed',
        },
        {
          label: 'Products',
          value:
            'HomeCourt is an interactive AI-powered basketball app offering real-time performance feedback and analysis, drills and workouts, virtual competitions and teams, skill tracking, and HomeCourt+ personalized training memberships.',
          conf: 'supported',
        },
      ],
      features: [
        'Real-time AI performance feedback',
        'Shot, movement, and skill tracking',
        'Interactive basketball drills and workouts',
        'Personalized daily training routines',
        'Virtual challenges and team leaderboards',
        'Progress analytics and skill ratings',
      ],
    },

    {
      id: 'visual',
      n: '02',
      title: 'Visual identity',
      sub: 'A first look at the brand, brought to life.',
      icon: 'image',
    },

    {
      id: 'identity',
      n: '03',
      title: 'Brand identity',
      sub: 'Who the brand is, and how the market actually reads it.',
      icon: 'id-card',
      says: [
        'Train smarter with real-time feedback.',
        'Make every practice feel like play.',
        'Get better together, anytime and anywhere.',
      ],
      hears: [
        'Users see it as a motivating, game-like practice tool for young players and youth teams.',
        'Users also flag tracking accuracy and camera setup as frustrating.',
        'Some basketball community posts describe it as functional but stale or inactive.',
      ],
      problem:
        'HomeCourt helps basketball players overcome unclear, unstructured practice by showing what to work on next through guided drills, real-time feedback, and progress tracking.',
      competitors: [
        {
          name: 'Noah Basketball',
          site: 'noahbasketball.com',
          note: 'Direct competitor providing basketball shooting-metrics capture, analysis, interactive shot tracking, games, and leaderboards through its HOOPS iPhone app.',
        },
        {
          name: 'Dribbleup',
          site: 'dribbleup.com',
          note: 'Direct competitor offering AI camera-tracked basketball drills, real-time coaching feedback, performance dashboards, challenges, and progress tracking for young players and families; it requires a Dribbleup Smart Basketball.',
        },
        {
          name: 'ShotTracker',
          site: 'shottracker.com',
          note: 'Direct competitor for basketball teams and coaches needing AI-driven video, automated stat tracking, scouting, and real-time performance insights.',
        },
        {
          name: 'Pure Sweat Basketball',
          site: 'puresweatbasketball.com',
          note: 'Close substitute offering personalized, coach-led basketball workout programs and skill-development plans through mobile apps rather than camera-based performance tracking.',
        },
      ],
      swot: {
        Strengths: [
          'Real-time feedback turns captured shots, moves, and stats into next-step practice guidance.',
          'No sensors or smart basketball required; basic use needs an iPhone or iPad and a basketball.',
          'Interactive workouts, virtual challenges, and team tools connect individual practice with social play.',
        ],
        Weaknesses: [
          'Directional user feedback flags tracking accuracy and camera setup frustration.',
          'The stated iPhone/iPad requirement excludes Android-first households and organizations.',
          'Some basketball-community posts perceive the product as stale or inactive.',
        ],
        Opportunities: [
          'Deepen coach, club, camp, and school workflows around assignments, messaging, and progress review.',
          'Improve leaderboard segmentation for age, rim height, and shooting distance.',
          'Strengthen individualized coaching guidance beyond tracking and drill measurement.',
        ],
        Threats: [
          'Overlapping basketball-training offers from Noah Basketball, DribbleUp, ShotTracker, and Pure Sweat.',
          'Rising expectations for more individualized AI coaching beyond automated measurement.',
        ],
      },
    },

    {
      id: 'conviction',
      n: '04',
      title: 'Conviction',
      sub: "What the brand stands for - and the lines it won't cross.",
      icon: 'flag',
      stands: [
        {
          for: 'Smarter practice through real-time feedback.',
          against: 'Practice that leaves players guessing what to improve.',
        },
        {
          for: 'Making skill development engaging and game-like.',
          against: 'Training that feels like a chore.',
        },
        {
          for: 'Helping players and communities improve together.',
          against: 'Skill development limited by location or training alone.',
        },
      ],
      nonNegotiables: [
        'Make every practice session clear, guided, and actionable.',
        'Keep skill development engaging enough to sustain the grind.',
        'Enable players to train, compete, and improve together from anywhere.',
      ],
      rules: [
        {
          if: 'A player finishes a workout or records performance,',
          then: 'give clear, real-time feedback and a specific next skill to work on.',
        },
        {
          if: 'A training experience risks feeling repetitive or like homework,',
          then: 'make it interactive, game-like, and motivating enough to keep players practicing.',
        },
        {
          if: 'A player, coach, or community needs to develop beyond the gym or scheduled practice,',
          then: 'enable accessible training, progress tracking, and constructive competition from anywhere.',
        },
      ],
    },

    {
      id: 'community',
      n: '05',
      title: 'Community',
      sub: 'Who buys, what moves them, and the audience you could win next.',
      icon: 'users',
      segments: [
        {
          label: 'Core demographic',
          conf: 'supported',
          value:
            'Committed individual basketball players who train beyond team practice, using an iPhone or iPad.',
        },
        {
          label: 'Psychographic profile',
          conf: 'unconfirmed',
          value:
            'Growth-minded competitors who enjoy the grind and seek measurable improvement and an edge over peers.',
        },
        {
          label: 'Knowledge level',
          conf: 'supported',
          value:
            'Beginners through advanced players; guidance and drills adapt to individual skill level and progression.',
        },
        {
          label: 'Category behavior',
          conf: 'supported',
          value:
            'Practice anytime at home or on court, track progress, and use drills, challenges, and daily routines to improve.',
        },
      ],
      persona: {
        initials: 'CB',
        name: 'Committed Basketball Players Building Skills Anywhere',
        body: 'Basketball players who want a more consistent, measurable way to improve their game beyond scheduled practices. They value guided drills, instant performance feedback, progress tracking, and personalized routines that clarify what to work on next. They are motivated by visible improvement, enjoyable repetition, and friendly competition with teammates, friends, or the wider basketball community. The strongest-fit member is a committed “grinder” seeking an edge; the experience must also remain approachable for players across ages and skill levels. Coaches, team leaders, camps, schools, and families are key enabling audiences that use HomeCourt to keep players engaged, assign development activities, and follow progress.',
      },
      triggers: [
        'A committed player wants a clear, consistent practice plan beyond team sessions and does not want to guess what to work on next. HomeCourt+ daily routines and trainer-built sessions make an upgrade relevant.',
        'A player wants to see whether practice is producing improvement over time. Access to workout history, in-depth analytics, and skill ratings creates a reason to subscribe for a fuller picture of progress.',
        'A player, coach, or team organizer wants practice to feel more engaging and connected—through challenges, virtual teams, leaderboards, and competition with friends, teammates, or family.',
      ],
      seeds: [
        {
          n: '01',
          title: 'Fair-play development leagues for youth players',
          body: 'Create age-, hoop-height-, distance-, and skill-band challenges for youth programs, with coach-approved leaderboards and progress milestones. Position the experience around personal improvement and comparable peer cohorts rather than one global ranking, so younger and recreational players can participate without distorted benchmarks.',
        },
        {
          n: '02',
          title: 'Coach-light practice plans for community basketball programs',
          body: 'Package short, assignable practice tracks for volunteer coaches, after-school programs, clubs, and camps: a weekly skill focus, simple setup instructions, player tasks, and a concise progress view. This can help programs extend structured development beyond limited court time without requiring every coach to be a technical training specialist.',
        },
        {
          n: '03',
          title: 'A dependable at-home setup and feedback confidence program',
          body: 'Turn setup and tracking friction into an adoption program: drill-specific camera-placement guides, quick calibration checks, confidence cues when tracking may be unreliable, and simple ways to review or correct sessions. Prioritize households and programs that lack dedicated equipment or staff support, helping them get value from practice before introducing premium analytics.',
        },
      ],
    },

    {
      id: 'expression',
      n: '06',
      title: 'Expression',
      sub: 'How the brand sounds and looks - made consistent and repeatable.',
      icon: 'message',
      voice: [
        {
          label: 'Tone',
          value:
            'Punchy, second-person locker-room motivation with clipped rallying phrases and aspirational basketball vernacular.',
        },
        {
          label: 'Contractions',
          value: 'Use contractions naturally to keep coaching clear, friendly, and motivational.',
        },
        {
          label: 'Reading level',
          value: 'General · grade 6.8 · 11.7 words per sentence',
        },
      ],
      vocabulary: {
        signature: [
          'Take your game further',
          'Get better together',
          'Develop your complete game',
          'Anytime, anywhere',
        ],
        preferred: [
          'Train smarter',
          'Instant feedback',
          'Interactive workouts',
          'Level up',
          'Every shot counts',
        ],
        banned: 'None established',
      },
      dos: [
        'Lead with real-time feedback and the next skill to improve.',
        'Make practice sound active, fun, and game-like.',
        'Invite players to train, compete, and improve together.',
      ],
      donts: [
        "Don't leave players guessing what to work on next.",
        "Don't frame practice as a chore or a solitary routine.",
        "Don't use flat, passive language that drains competitive energy.",
      ],
      sample:
        'Train smarter with instant feedback that pinpoints the next skill you need to sharpen. Dive into interactive workouts, challenge your crew, and level up every rep. Get better together as you take your game further.',
      core: 'HomeCourt turns basketball practice into an interactive path to measurable progress, with real-time feedback, immersive workouts, and virtual competition.',
    },

    {
      id: 'insights',
      n: '07',
      title: 'Key insights',
      sub: 'A few things we noticed that you might not have said out loud.',
      icon: 'lightbulb',
      insights: [
        {
          n: '01',
          title: 'Turn every tracked session into a clearer next move',
          lede: 'HomeCourt’s strongest job is not simply measuring shots or movements; it is reducing the uncertainty that makes solo practice inefficient.',
          body: 'Lead with the moment after a rep: show the player what happened, why it matters, and which skill to sharpen next. This makes feedback feel like coaching, not a dashboard.',
          conf: 'supported',
        },
        {
          n: '02',
          title: 'Make progress feel earned, visible, and fun enough to repeat',
          lede: 'Committed players may value the grind, but they are more likely to sustain it when practice feels like play and improvement is easy to see.',
          body: 'Interactive workouts, challenges, skill ratings, and progress history can turn repetition into an engaging loop: practice, see a gain, chase the next one. The brand should celebrate development and consistency over empty gamification.',
          conf: 'supported',
        },
        {
          n: '03',
          title:
            'For youth communities, fair competition is more motivating than one-size-fits-all rankings',
          lede: 'Leaderboards can build energy, but comparisons may feel less credible when players differ in age, rim height, shooting distance, or ability.',
          body: 'HomeCourt could make competition more inclusive and trusted by grouping challenges into relevant cohorts and emphasizing personal milestones alongside rankings. This would give coaches, families, and younger players a clearer reason to participate.',
          conf: 'inferred',
        },
      ],
    },
  ],

  /* 02 Visual identity - the captured logo, palette, imagery and typography */
  visual: {
    logo: {
      src: 'assets/brand/logo.webp',
      note: 'Picked from an image on the site that names the brand',
    },
    colors: [
      {
        name: 'Deep Neutral gray',
        hex: '#272727',
        role: 'Background',
        from: "From your site's CSS",
      },
      { name: 'White', hex: '#FFFFFF', role: 'Text', from: "From your site's CSS" },
      { name: 'Bright Orange', hex: '#FF4000', role: 'Text', from: "From your site's CSS" },
      { name: 'Black', hex: '#000000', role: 'Background', from: "From your site's CSS" },
      { name: 'Black', hex: '#131313', role: 'Accent', from: "From your site's CSS" },
      {
        name: 'Bright Green',
        hex: '#7DBB00',
        role: 'Accent',
        from: "From your site's CSS · Low confidence",
        low: true,
      },
    ],
    contrast: {
      note: 'Contrast measured against WCAG AA thresholds (4.5:1 normal text, 3:1 large) — 4 of 15 pairs',
      pairs: [
        { fg: '#272727', bg: '#FFFFFF', ratio: '14.94:1', verdict: 'meets AA for normal text' },
        { fg: '#272727', bg: '#FF4000', ratio: '4.26:1', verdict: 'meets AA for large text only' },
        { fg: '#FFFFFF', bg: '#000000', ratio: '21.00:1', verdict: 'meets AA for normal text' },
        { fg: '#FFFFFF', bg: '#131313', ratio: '18.58:1', verdict: 'meets AA for normal text' },
      ],
    },
    imagery: [
      { src: 'assets/brand/img-01.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-02.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-03.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-04.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-05.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-06.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-07.jpg', from: 'homecourt.ai' },
      { src: 'assets/brand/img-08.jpg', from: 'homecourt.ai' },
    ],
    type: [
      { role: 'Display', family: 'Helvetica Neue', rules: '1 rule', conf: 'Medium confidence' },
      { role: 'Display', family: 'din-2014', rules: '1 rule', conf: 'Medium confidence' },
      { role: 'UI', family: 'Helvetica Neue', rules: '18 rules', conf: 'Medium confidence' },
    ],
  },

  /* the profile's own footer: how well each section is grounded */
  grounding: {
    sources: '52 web sources',
    note: 'Grounding is the share of a section’s evidence resting on external facts rather than our own inference chain. A low number is not a mistake — it means the material didn’t say, and anything built on that section should be read accordingly.',
    rows: [
      { section: 'Brand snapshot', grounding: 'No classified references', weakest: 'Unconfirmed' },
      { section: 'Brand identity', grounding: '100%', weakest: 'Unconfirmed' },
      { section: 'Conviction', grounding: '63%', weakest: 'Unconfirmed' },
      { section: 'Community', grounding: '85%', weakest: 'Unconfirmed' },
      { section: 'Expression', grounding: '77%', weakest: 'Unconfirmed' },
      { section: 'Key insights', grounding: '67%', weakest: 'Unconfirmed' },
    ],
    disagree:
      'HomeCourt’s official materials present an active, feature-rich training, membership, team, and camp platform, while Reddit users in late 2025 and early 2026 characterize the app as functional but insufficiently updated and increasingly stale.',
  },
};
