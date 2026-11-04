/* Everything the page shows, read off dev.pulse on 2026-11-02 (Shopify brand):
   the two captures plus what the live page opens to. One source for all four
   designs. `short` is the one field the product doesn't have: a headline of a few
   words for the long findings, written here to show what the redesigns need. */
window.SG_DATA = (function () {
  var findings = [
    {
      id: 'f1',
      kind: 'market',
      found: 'Sep 28',
      title: 'WooCommerce reinforces open-source leadership messaging',
      claim:
        "Multiple web posts on Sep 28 repeat product-positioning copy for WooCommerce, including that it is the 'leading ecommerce platform' and the open-source platform for WordPress, indicating an ongoing top-of-funnel education and SEO push.",
      discussion: 'started 24 days ago',
      sources: [
        {
          src: 'Web search',
          title:
            'WooCommerce is the leading ecommerce platform, powering millions of online stores. WooCommerce empowers anyone, anywhere, to sell anything with unlimited extensibility and flexibility.',
          href: 'https://www.trustpilot.com/review/woocommerce.com'
        }
      ]
    },
    {
      id: 'f2',
      kind: 'market',
      found: 'Sep 28',
      title: 'Adobe Commerce and Magento face high-severity security attention',
      claim:
        'A security post about Adobe Commerce/Magento reports a critical CVE-2026-71362 issue with 44 views and 1 comment on Sun Sep 27, followed by a separate CISA KEV warning with 3 views on Mon Sep 28 highlighting unauthenticated privilege escalation (CVSS 9.1).',
      sources: [
        {
          src: 'X',
          title:
            "CISA KEV: Adobe Commerce / Magento CVE-2026-71362. Due was Sep 27. Unauth privilege escalation (CVSS 9.1). No click, no admin session. Update to your line's 2026-aug patch (2.4.9-2026-aug or matching branch). https://t....",
          href: 'https://x.com/snypet86/status/2104679655752045028'
        }
      ]
    },
    {
      id: 'f3',
      kind: 'competitor',
      entity: 'Wix eCommerce',
      found: 'Sep 28',
      title: 'Wix eCommerce emphasizes all-in-one simplicity and cross-solution integration',
      short: 'Wix eCommerce emphasizes all-in-one simplicity',
      claim:
        'On 2026-09-28, Wix eCommerce is described as an all-in-one ecommerce platform with a free website entry point and upgrade path to selling everywhere, while another snippet says it supports standard and specialized needs and integrates with Wix business solutions like Stores, Bookings, and Restaurants Orders.',
      sources: [
        {
          src: 'Web search',
          title:
            'Wix eCommerce is your all-in-one eCommerce platform. Create a fully customizable free eCommerce website & upgrade to start selling everywhere.',
          href: 'https://www.wix.com/ecommerce/website'
        }
      ]
    },
    {
      id: 'f4',
      kind: 'market',
      found: 'Sep 28',
      title: 'WooCommerce pushes mobile store management as a core feature',
      claim:
        'A WooCommerce mobile-app promo on Sep 28 says merchants can manage stores on the go, add products, create orders, and track sales in real time; the post functions as a feature-led product message rather than a generic mention.',
      sources: [
        {
          src: 'Web search',
          title:
            'Run your store from anywhere Manage your business on the go with the WooCommerce Mobile App. Add products, create orders, take quick payments, and keep an eye on new sales and key stats in real time. Add and edit produc...',
          href: 'https://play.google.com/store/apps/details?id=com.woocommerce.android&hl=en_US'
        }
      ]
    },
    {
      id: 'f5',
      kind: 'competitor',
      entity: 'WooCommerce',
      found: 'Sep 28',
      title: 'WooCommerce continues reinforcing open-source WordPress dominance',
      claim:
        'On 2026-09-28, WooCommerce reiterates its open-source WordPress-based ecommerce positioning across multiple web snippets, including the claim that it is the most popular ecommerce solution for WordPress and that it launched on September 27, 2011.',
      sources: [
        {
          src: 'Web search',
          title: 'WooCommerce is the most popular ecommerce solution for WordPress by some margin.',
          href: 'https://kinsta.com/blog/woocommerce-tutorial/'
        }
      ]
    },
    {
      id: 'f6',
      kind: 'competitor',
      entity: 'Adobe Commerce',
      found: 'Sep 28',
      title: 'Adobe Commerce leans into AI-powered personalization for B2B and B2C',
      claim:
        'On 2026-09-28, Adobe Commerce is promoted as an AI-optimized modular ecommerce platform for B2B and B2C, with claims about hyper-personalized commerce experiences, improved engagement, and increased sales. The same date includes a second French-language description emphasizing AI-powered global personalization at scale.',
      sources: [
        {
          src: 'Web search',
          title:
            "Stimulez la croissance et les conversions avec Adobe Commerce, une plateforme e-commerce modulaire optimisée par l'IA pour le B2B et B2C qui offre des expériences personnalisées à l'échelle mondiale.",
          href: 'https://business.adobe.com/fr/products/commerce.html'
        }
      ]
    },
    {
      id: 'f7',
      kind: 'competitor',
      entity: 'BigCommerce',
      found: 'Sep 28',
      title: 'BigCommerce pushes mobile-first growth positioning alongside published tiered pricing',
      short: 'BigCommerce pushes mobile-first growth and tiered pricing',
      claim:
        'On 2026-09-28, BigCommerce’s web page prominently advertises a mobile-accessible growth platform and publishes pricing tiers in Italian, listing Core at $39/month, Growth at $105/month, Scale at $399/month, and Performance starting at $1,499/month. The page copy is paired with a LinkedIn-facing claim of 152,042 followers, reinforcing active enterprise positioning.',
      sources: [
        {
          src: 'Web search',
          title:
            'BigCommerce è la piattaforma e-commerce più versatile per la crescita, ed è ora accessibile anche da dispositivo mobile.',
          href: 'https://play.google.com/store/apps/details?id=com.bigcommerce.mobile&hl=it'
        }
      ]
    },
    {
      id: 'f8',
      kind: 'market',
      found: 'Sep 28',
      posted: 'Sep 21',
      postedOrder: 21,
      dir: 'watch',
      dirNote: 'Possible opportunity',
      dirTone: 'opportunity',
      watchTitle: 'Watch: a possible opportunity, with one source so far',
      rel: 78,
      title: 'Shopify has announced a partnership with Muse for agentic checkout using Shop Pay.',
      short: 'Shopify partners with Muse on agentic checkout',
      read: "This is a direct development in Shopify's Shop Pay and AI-commerce offering, both central to its unified commerce platform positioning.",
      direction: 'Review merchant-facing guidance for the announced Muse and Shop Pay agentic-checkout partnership.',
      sources: [
        {
          src: 'hackernews',
          title: 'Shopify partners with Muse for agentic checkout with Shop Pay',
          href: 'https://twitter.com/tobi/status/2102090718546198790'
        }
      ]
    },
    {
      id: 'f9',
      kind: 'audience',
      found: 'Sep 28',
      posted: 'Sep 25',
      postedOrder: 25,
      dir: 'opportunity',
      rel: 74,
      title:
        'Checkout abandonment is associated with unexpected or hidden costs, complex checkout flows, technical problems, forced account creation, and limited payment options.',
      short: 'Hidden costs and friction drive checkout abandonment',
      read: "These stated abandonment drivers directly concern Shopify's checkout, payments, and store-management capabilities for merchants seeking to convert online shoppers.",
      direction:
        'Review checkout guidance and product controls that help merchants surface total costs early and reduce payment and account-creation friction.',
      sources: [
        {
          src: 'grounding',
          title: 'Abandoned Cart: 8 Reasons for Low E-commerce Conversion Rates | wCs',
          href: 'https://webcode.solutions/en/blog/abandoned-cart-8-reasons-for-low-e-commerce-conversion-rates'
        },
        {
          src: 'grounding',
          title: 'Cart Abandonment: The Real Causes and How to Reduce It',
          href: 'https://avanahub.com/blog/cart-abandonment'
        },
        {
          src: 'grounding',
          title: 'Reduce Shopping Cart Abandonment: Reasons & Solutions (2026)',
          href: 'https://www.omnisend.com/blog/shopping-cart-abandonment'
        }
      ]
    },
    {
      id: 'f10',
      kind: 'market',
      found: 'Sep 28',
      posted: 'Sep 9',
      postedOrder: 9,
      dir: 'watch',
      dirNote: 'Possible risk',
      dirTone: 'risk',
      watchTitle: 'Watch: a possible risk, with one source so far',
      rel: 64,
      title:
        'One report says some merchants that migrated to Shopify in countries without Shopify Payments saw checkout completion fall at the payment step despite stable traffic and add-to-cart activity.',
      short: 'Checkout completion falls where Shopify Payments isn’t available',
      read: "This is a direct early risk signal for Shopify's payment and checkout experience in markets where Shopify Payments is unavailable.",
      direction:
        'Review migration and payment-provider guidance for the countries identified in the report, including available payment options at checkout.',
      sources: [
        {
          src: 'Reddit',
          title: "migrated to shopify, checkout completion dropped from ~70% to ~30%. the checkout wasn't the problem",
          href: 'https://www.reddit.com/r/shopify_geeks/comments/1wbfykr/migrated_to_shopify_checkout_completion_dropped'
        }
      ]
    },
    {
      id: 'f11',
      kind: 'market',
      found: 'Sep 28',
      posted: 'Sep 8',
      postedOrder: 8,
      dir: 'opportunity',
      rel: 61,
      title:
        "Retailers may consider replatforming when growth exposes performance, integration, B2B, omnichannel, catalog, inventory, or international-pricing limitations; one source specifically presents Wix-to-Shopify migration as relevant when Wix's commerce model is outgrown.",
      short: 'Growth limits push retailers to replatform',
      read: "Replatforming demand and the cited Wix limitations are directly relevant to Shopify's platform offering and a named competitor.",
      direction:
        'Review migration materials against the stated triggers, particularly complex catalogs, multichannel inventory, international pricing, and integration requirements.',
      sources: [
        {
          src: 'grounding',
          title: 'Ecommerce Migration & Replatforming: The Complete Guide',
          href: 'https://innovadeltech.com/ecommerce-migration-and-replatforming-the-complete-guide-for-2026'
        },
        {
          src: 'grounding',
          title: 'Signs You Need a New eCommerce Platform & How to Choose the Right One | Shop Eat Surf Outdoor',
          href: 'https://shop-eat-surf-outdoor.com/resource/signs-you-need-a-new-ecommerce-platform-how-to-choose-the-right-one/622358'
        },
        {
          src: 'grounding',
          title: 'Wix to Shopify: When SMBs Outgrow the Platform… | 1Digital®',
          href: 'https://www.1digitalagency.com/blog/wix-to-shopify-when-smbs-outgrow-the-platform'
        }
      ]
    },
    {
      id: 'f12',
      kind: 'market',
      found: 'Sep 28',
      dir: 'opportunity',
      rel: 57,
      title:
        'Product feeds may miss qualified AI-shopping traffic when they lack specific product attributes, while inconsistent catalog data across ERP, PIM, storefront, marketplace, and support systems can undermine product information accuracy.',
      short: 'Thin product feeds miss AI-shopping traffic',
      read: "This is an adjacent commerce-data opportunity for Shopify's product, multichannel, and AI selling capabilities, where merchants need accurate catalog information across channels.",
      direction: 'Review how product attributes and source-of-truth data can be kept consistent for merchant storefronts and AI-shopping feeds.',
      sources: [
        {
          src: 'grounding',
          title: 'Product Feed Errors That Kill AI Shopping Visibility',
          href: 'https://venue.cloud/news/insights/product-feed-errors-that-kill-ai-shopping-visibility'
        },
        {
          src: 'grounding',
          title: 'eCommerce Product Catalog Management Services | 2026 Guide',
          href: 'https://mascallnet.ai/ecommerce-product-catalog-management-services-2026-scale-multi-channel-retail-with-accurate-product-data'
        }
      ]
    }
  ];

  /* Which of the plan's research topics each finding sits under (Signal settings lists
     the three), who it's about when that isn't a named competitor, and the competitors'
     sites, for their logos. Assigned by hand here; the product doesn't tag findings. */
  var TOPIC = { f1: 'store', f2: 'other', f3: 'store', f4: 'store', f5: 'store', f6: 'ai', f7: 'store', f8: 'checkout', f9: 'checkout', f10: 'checkout', f11: 'store', f12: 'ai' };
  var ABOUT = { f1: ['WooCommerce', 'woocommerce.com'], f2: ['Adobe Commerce', 'adobe.com'], f4: ['WooCommerce', 'woocommerce.com'] };
  var ENTITY_DOMAIN = { 'Wix eCommerce': 'wix.com', WooCommerce: 'woocommerce.com', 'Adobe Commerce': 'adobe.com', BigCommerce: 'bigcommerce.com' };
  findings.forEach(function (f) {
    f.topic = TOPIC[f.id];
    if (ABOUT[f.id]) f.about = { name: ABOUT[f.id][0], domain: ABOUT[f.id][1] };
    if (f.entity) f.about = { name: f.entity, domain: ENTITY_DOMAIN[f.entity] };
    /* where it sits on the 30-day research window, Aug 30 = day 0 */
    f.day = +(f.posted || f.found).replace('Sep ', '') + 1;
  });

  var market = {
    topics: [
      { id: 'checkout', name: 'Checkout and payment processing', hue: 'var(--sg-market)' },
      { id: 'ai', name: 'Built-in AI commerce tools', hue: 'var(--sg-violet)' },
      { id: 'store', name: 'Online store creation and customization', hue: 'var(--sg-audience)' },
      { id: 'other', name: 'Outside your topics', hue: 'var(--text-3)' }
    ],
    leadShort: 'Checkout is where things are moving.',
    leadRest: '3 of the 5 findings with a direction point at it.',
    eyebrow: 'Recent market findings',
    question: 'What’s worth responding to right now?',
    sub: 'Findings from recent research, read against your positioning, audience and current goal.',
    ran: '35 days ago',
    /* the one line Brief leads with. The product has no such summary today. */
    lead: 'Checkout is where things are moving: 3 of the 5 findings with a direction point at it.',
    runLine: 'Research for this brand runs when you start it.',
    attention: { title: '1 answer to confirm', line: 'ICP segments', move: 'Confirm them now' },
    context: {
      goal: 'Make the return visit worth choosing',
      audience:
        'Shopify serves entrepreneurs, retailers, and global brands that want to start, run, manage, and grow commerce businesses online and in person.',
      positioning:
        'Shopify positions itself as a unified commerce platform for businesses ranging from first-time founders to global brands.',
      foot: 'Audience from Brand profile · positioning from your decision · goal from the Roadmap'
    },
    scope: {
      chips: [
        'Last 30 days',
        'Public web',
        'Community threads',
        'Video',
        'Developer sources',
        'Research papers',
        'Tech press',
        'Prediction markets'
      ],
      stamp: 'Finished Sep 28 · 5:45 PM Eastern Time'
    },
    runs: [{ id: 'r1', when: 'Sep 28, 5:45 PM', window: '30 days', result: 'Complete', findings: 5, by: 'Setup' }],
    report: {
      kicker: '30-day research window',
      title: 'Trend report · Aug 30 – Sep 28, 2026',
      created: 'Created Sep 28, 2026, 9:43 PM · Minimum 35% relevance',
      desc: 'The report is grounded in the selected evidence.',
      metrics: [
        { icon: 'search', label: 'Queries completed', value: '8/8', sub: '100% successful' },
        { icon: 'filter', label: 'Evidence selected', value: '100', sub: 'from 176 collected' },
        { icon: 'spark', label: 'Trend findings', value: '5', sub: 'at or above 35% relevance' },
        { icon: 'check', label: 'Research window', value: '30d', sub: 'Aug 30 – Sep 28, 2026' }
      ],
      items: [
        {
          id: 'f8',
          rank: '01',
          src: 'hackernews',
          date: 'Sep 20, 2026',
          evidence: [
            {
              src: 'hackernews',
              date: 'Sep 20, 2026',
              fit: 36,
              title: 'Shopify partners with Muse for agentic checkout with Shop Pay',
              body: 'Shopify partners with Muse for agentic checkout with Shop Pay',
              href: 'https://twitter.com/tobi/status/2102090718546198790'
            }
          ]
        },
        {
          id: 'f9',
          rank: '02',
          src: 'grounding',
          date: 'Sep 24, 2026',
          evidence: [
            {
              src: 'grounding',
              date: 'Sep 24, 2026',
              fit: 36,
              title: 'Abandoned Cart: 8 Reasons for Low E-commerce Conversion Rates | wCs',
              body: 'In e-commerce, an abandoned cart occurs when a shopper adds items to their online cart but leaves the site before completing the purchase. The primary drivers behind this low conversion rate include hidden fees, a friction-heavy checkout process, and forced account creation.',
              href: 'https://webcode.solutions/en/blog/abandoned-cart-8-reasons-for-low-e-commerce-conversion-rates'
            },
            {
              src: 'grounding',
              date: 'Sep 8, 2026',
              fit: 29,
              title: 'Cart Abandonment: The Real Causes and How to Reduce It',
              body: 'Unexpected costs are one of the biggest reasons shoppers abandon carts. These costs may include <strong>shipping, taxes, service fees, handling fees, customs duties, payment fees, or packaging charges that appear late in the checkout flow</strong>.',
              href: 'https://avanahub.com/blog/cart-abandonment'
            },
            {
              src: 'grounding',
              date: 'Sep 7, 2026',
              fit: 28,
              title: 'Reduce Shopping Cart Abandonment: Reasons & Solutions (2026)',
              body: 'This includes unexpected costs ... complicated checkout processes (22%). <strong>Hidden fees (21%), technical issues (17%), and limited payment options (13%)</strong> also contribute significantly to abandonment during the final checkout stages.',
              href: 'https://www.omnisend.com/blog/shopping-cart-abandonment'
            }
          ]
        },
        {
          id: 'f10',
          rank: '03',
          src: 'reddit',
          date: 'Sep 8, 2026',
          evidence: [
            {
              src: 'reddit',
              date: 'Sep 8, 2026',
              fit: 0,
              title: "migrated to shopify, checkout completion dropped from ~70% to ~30%. the checkout wasn't the problem",
              body: "seeing this pattern a lot lately with stores in countries where shopify payments isn't available (turkey, israel, most of the middle east, big chunks of asia and LATAM). owner migrates, traffic is fine, add to cart is fine, sometimes even better than the old platform, and then the payment step bleeds. the reflex is to blame the checkout. it's almost never the checkout, for two reasons. fir",
              href: 'https://www.reddit.com/r/shopify_geeks/comments/1wbfykr/migrated_to_shopify_checkout_completion_dropped'
            }
          ]
        },
        {
          id: 'f11',
          rank: '04',
          src: 'grounding',
          date: 'Sep 7, 2026',
          evidence: [
            {
              src: 'grounding',
              date: 'Sep 7, 2026',
              fit: 33,
              title: 'Ecommerce Migration & Replatforming: The Complete Guide',
              body: 'When should a growing business migrate ecommerce platforms? <strong>When the current platform is capping growth rather than supporting it</strong>: recurring performance issues under normal traffic, integrations you can’t build, or B2B and omnichannel features it simply doesn’t support.',
              href: 'https://innovadeltech.com/ecommerce-migration-and-replatforming-the-complete-guide-for-2026'
            },
            {
              src: 'grounding',
              date: 'Aug 31, 2026',
              fit: 25,
              title: 'Signs You Need a New eCommerce Platform & How to Choose the Right One | Shop Eat Surf Outdoor',
              body: 'Growing retailers often find their current eCommerce platform becomes a constraint rather than an enabler limiting the customer experiences they can deliver and draining time and budget through manual processes and technical limitations. This whitepaper walks you through the key warning signs that it’s time to replatform, from inability to implement modern features like BOPIS and BNPL to performance breakdowns during peak seasons and catalog complexity that outgrows your platform’s capabilities.',
              href: 'https://shop-eat-surf-outdoor.com/resource/signs-you-need-a-new-ecommerce-platform-how-to-choose-the-right-one/622358'
            },
            {
              src: 'grounding',
              date: 'Sep 7, 2026',
              fit: 0,
              title: 'Wix to Shopify: When SMBs Outgrow the Platform… | 1Digital®',
              body: "<strong>Wix-to-Shopify migrations make sense when a business outgrows Wix's commerce model</strong>: catalog complexity past roughly 500 SKUs with variants, multi-channel inventory sync requirements, missing niche integrations, international pricing needs, or ...",
              href: 'https://www.1digitalagency.com/blog/wix-to-shopify-when-smbs-outgrow-the-platform'
            }
          ]
        },
        {
          id: 'f12',
          rank: '05',
          src: 'grounding',
          date: 'Sep 27, 2026',
          evidence: [
            {
              src: 'grounding',
              date: 'Sep 27, 2026',
              fit: 38,
              title: 'Product Feed Errors That Kill AI Shopping Visibility',
              body: 'Shoppers ask specific questions ... <strong>If your feed doesn\'t state "fragrance-free," "works with 1/2-inch drill chuck," or "compatible with Nintendo Switch OLED," your product can miss highly qualified traffic</strong>...',
              href: 'https://venue.cloud/news/insights/product-feed-errors-that-kill-ai-shopping-visibility'
            },
            {
              src: 'grounding',
              date: 'Aug 31, 2026',
              fit: 36,
              title: 'eCommerce Product Catalog Management Services | 2026 Guide',
              body: 'What everyone says: “We need better product descriptions and cleaner images.” · What most articles miss: Catalog accuracy isn’t a content quality problem — it’s a data governance problem. The description is the symptom; the absence of a single source of truth across ERP, PIM, storefront, marketplace, and support systems is the disease. What actually happens: Teams hire copywriters or AI tools to “fix descriptions” while the underlying attribute data in five different systems still disagrees with itself.',
              href: 'https://mascallnet.ai/ecommerce-product-catalog-management-services-2026-scale-multi-channel-retail-with-accurate-product-data'
            }
          ]
        }
      ]
    }
  };

  /* -------------------------------------------------------------- sentiment */

  var period = {
    posts: 195,
    postsNote: 'posts about Shopify since the last report (Oct 14)',
    alerts: 13,
    platforms: '0 of 1',
    platformsNote: 'platform collecting',
    coverage: 'Not collecting from X since Oct 16. Posts from that stretch aren’t counted here.',
    risks: [
      {
        id: 'p1',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 16',
        text: 'Looks like there’s a phishing attack, and checkout pages are being replaced with fake ones.',
        says: 'Check your shopify store if you’re using the Swym Wishlist app or any app from Hulk. Looks like there’s a phishing attack, and checkout pages are being replaced with fake ones.',
        href: 'https://x.com/toyosxyz/status/2110775138253967782',
        discussion: 'started 14 days ago'
      },
      {
        id: 'p2',
        sev: 'info',
        label: 'Risk',
        date: 'Oct 16',
        text: 'They scam any chance they get',
        says: '@Lodedrg @ShopifySupport @Shopify Shopify is Israeli owned, i dont expect any better. They scam any chance they get',
        href: 'https://x.com/Skpticalilusion/status/2110889820826247339'
      },
      {
        id: 'p3',
        sev: 'warning',
        label: 'Warning',
        date: 'Oct 16',
        text: 'Shopify Payments disabled, and all pending payouts held for 120 days.',
        says: 'Please help @ShopifySupport @Shopify @tobi @harleyf All of our Shopify stores were shut down at once with zero warning. Shopify Payments disabled, and all pending payouts held for 120 days. The reason given is "suspected merchant misrepresentation." Here\'s what actually happened. We switched the legal entity on one of our existing stores to another company we own. That verification failed, and right after that every account connected to us was disabled. Nothing about our business changed. Same o',
        href: 'https://x.com/LucasSchreuder2/status/2110780825868644704'
      },
      {
        id: 'p4',
        sev: 'warning',
        label: 'Warning',
        date: 'Oct 16',
        text: 'The reason shopify payments is horrible for a subscription store Is they don’t own their subscriptions',
        says: 'I do a lot of breakdowns on why stores go from 0 to 100k plus monthly visitors on twitter here on X But almost always they have the same mistake that could bring them back to zero in an instance I am talking about them still being on shopify payments There are two categories here: - brands that run subscriptions - and stores that do regular one time payments The reason shopify payments is horrible for a subscription store Is they don’t own their subscriptions If you dont know what I am talking a',
        href: 'https://x.com/ecomrudolfs/status/2110782933288038813'
      },
      {
        id: 'p5',
        sev: 'info',
        label: 'Risk',
        date: 'Oct 16',
        text: 'Yall are a scam',
        says: 'Yall are a scam I been trying to contact someone about fraud and no one has reached out @Shopify',
        href: 'https://x.com/cuddlebear410/status/2110886330397864124'
      },
      {
        id: 'p6',
        sev: 'warning',
        label: 'Warning',
        date: 'Oct 16',
        text: 'A $2M a month brand got every Shopify store they own shut down in one minute',
        says: 'A $2M a month brand got every Shopify store they own shut down in one minute For changing the company name on one of them The new company was theirs too, same owners and same products But the check on the new name failed Every store went down at 00:31 and payouts got held for 120 days "Suspected merchant misrepresentation" If you ever moved your store from your own name into an LLC, it can happen to you too A store did exactly that in August, because support told him to Shopify filed the LLC as',
        href: 'https://x.com/DreadfulDust1/status/2110865748251770936'
      },
      {
        id: 'p7',
        sev: 'warning',
        label: 'Warning',
        date: 'Oct 15',
        text: "I don't treat a dashboard grade as proof the charge is good.",
        says: '@harrisonbevins @Shopify "Low risk" from fraud detection is a label, not a receipt. I don\'t treat a dashboard grade as proof the charge is good. Keep the risk flag separate from settled money, and ask which exact fields get checked before anything captures.',
        href: 'https://x.com/77systems_ai/status/2110485756972253573'
      },
      {
        id: 'p8',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 15',
        text: '@Shopify \'s own fraud detection is marking it as "low risk"...',
        says: '🚨 We\'re seeing a huge uptick in fraudulent charge attempts on our store over the last few weeks and @Shopify \'s own fraud detection is marking it as "low risk"... Anyone know of a good app to catch this shit?',
        href: 'https://x.com/harrisonbevins/status/2110436404371091863'
      },
      {
        id: 'p9',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 15',
        text: 'the scamming online store @Pokeunlimited, these guys have done this to many. sending a empty box',
        says: 'I only hope no one is experiencing what I am experiencing with fraudulent online Store that was on @shop @Shopify ... the scamming online store @Pokeunlimited, these guys have done this to many. sending a empty box and just tell your credit card company oh yeah we sent it',
        href: 'https://x.com/rocksar223/status/2110536084807651678'
      },
      {
        id: 'p10',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 15',
        text: "A friend's Shopify store had a card skimmer hidden in it.",
        says: 'A friend\'s Shopify store had a card skimmer hidden in it. Not in the theme. It was pasted into an SEO app\'s "Google site verification" field, where a short code should go. Instead it held live JS. On any checkout click it killed the real checkout, grabbed the cart from /cart.js, and redirected the shopper to a fake checkout at 6bn[.]my with the shop host, cart token and full order base64\'d in the URL. The "n" in the domain was hex-escaped (\\x6e) to dodge scanners. Sat there for weeks. Same campa',
        href: 'https://x.com/Egzeyo/status/2110483865827729912'
      },
      {
        id: 'p11',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 15',
        text: 'Shopify takes order without the option to be refunded , they’re stealing from US CITIZENS!',
        says: '@bbbgreatermd I NEED TO FILE A COMPLAINT AGAINST @Shopify they’re advertising for website that don’t exist le-tigra is a closed website yet Shopify takes order without the option to be refunded , they’re stealing from US CITIZENS!',
        href: 'https://x.com/moediddy1576/status/2110499444508749918'
      },
      {
        id: 'p12',
        sev: 'critical',
        label: 'Critical',
        date: 'Oct 15',
        text: 'host CYBERCRIMINALS; all committing fraud using my business info are SHOPIFY websites!',
        says: '@tvacanti @ShopifySupport @Shopify Flee Shopify. They are plagued with problems and host CYBERCRIMINALS; all committing fraud using my business info are SHOPIFY websites! Run as fast as you can before they destroy your business too!',
        href: 'https://x.com/imagesip/status/2110431022680829982'
      },
      {
        id: 'p13',
        sev: 'warning',
        label: 'Warning',
        date: 'Oct 15',
        text: 'Shopify is silently killing third-party scripts.',
        says: 'what a week :( google is cloaking, Amazon is blocking bots and Shopify is silently killing third-party scripts. First Shopify that deprecates script tags. It stops every 3rd party app that injects Javascript to the storefront starting next March. It will affect review widgets, upsell popups, chatbots, that analytics script many merchants forgot about, everything will be swiped in silence. Amazon is second in line with a blocking move. They decided to block 3rd party AI shopping agents from its c',
        href: 'https://x.com/MarkoCvijic/status/2110419161860001878'
      }
    ]
  };

  function q(text, who, date, eng, lean, n, href) {
    return { text: text, who: who, date: date, eng: eng, lean: lean, n: n, href: href };
  }
  var rrCount = 0;
  function rr(sev, text, who, date, eng, href) {
    rrCount += 1;
    return { id: 'rp' + rrCount, sev: sev, text: text, who: who, date: date, eng: eng, href: href };
  }

  var latest = {
    id: 'latest',
    window: 'Oct 7 – Oct 14',
    label: 'Latest report · Oct 7 – Oct 14',
    verdict: '38% positive · 156 posts',
    updated: 'Shopify · 170 mentions from 388 sources · updated Oct 14, 8:06 AM',
    range: 'Oct 7 – Oct 14, 2026 · times in Eastern Time',
    headline:
      'This is a partial read of the period, and the analyzed feedback leans negative overall, with selected examples centering on access, payment-processing, support, and fee concerns.',
    short: 'Feedback leans negative, centering on access, payments, support and fees',
    receipt: 'Read 170 mentions from 156 collected posts on 1 platform.',
    attentionHead: '20 risk posts this period, the most severe about access in Pakistan',
    themesHead: 'Complaints about performance and service, praise for innovation',
    sayShort: 'Innovation and AI-related feedback is a notable positive area.',
    sub: 'At the same time, innovation and AI-related feedback is a notable positive area in the supplied examples.',
    cites: [1, 2, 8, 11, 13, 14],
    why: '156 posts collected · 170 mentions read · 1 platform',
    stats: [
      { value: '156', label: 'posts collected' },
      { value: '38%', label: 'of mentions positive' },
      { value: '20', label: 'risk posts' }
    ],
    delta: 'no comparable period before this one',
    riskTotal: 20,
    riskFine: 'The 10 most severe of 20 risk posts, newest first within each severity.',
    risks: [
      rr('high', '“Shopify is down in Pakistan only working with vpn. Shopify not working in Pakistan. Across Pakistan.”', 'GoharAliKhp2nh', 'Oct 8', '0 likes · 0 replies', 'https://x.com/GoharAliKhp2nh/status/2108067629026152735'),
      rr('high', '“Shopify not working in Pakistan only accessable with vpn.”', 'GoharAliKhp2nh', 'Oct 8', '0 likes · 0 replies', 'https://x.com/GoharAliKhp2nh/status/2108065981985882177'),
      rr('high', '“Shopify down in Pakistan only working with vpn.”', 'GoharAliKhp2nh', 'Oct 8', '0 likes · 0 replies', 'https://x.com/GoharAliKhp2nh/status/2108065160732516733'),
      rr('high', '“Shopify down in Pakistan!!!”', 'ElliJadoon', 'Oct 8', '0 likes · 0 replies', 'https://x.com/ElliJadoon/status/2108059540252192943'),
      rr('medium', '“the private rates are all a scam.”', 'Marilketh', 'Oct 13', '0 likes · 0 replies', 'https://x.com/Marilketh/status/2110157477690192085'),
      rr('medium', '“Many such cases”', 'PrepperSaratoga', 'Oct 13', '0 likes · 1 reply', 'https://x.com/PrepperSaratoga/status/2110154781377356249'),
      rr('medium', '“This bites a lot of stores.”', 'elghorfimed', 'Oct 13', '1 like · 1 reply', 'https://x.com/elghorfimed/status/2110103919867117576'),
      rr('medium', '“Better surface, same auth problem.”', 'usehiveai', 'Oct 13', '0 likes · 0 replies', 'https://x.com/usehiveai/status/2109880079006216301'),
      rr('medium', '“a Leap of Faith @Shopify domain should not be associated with a Fort Wayne, Indiana, business address without verification”', 'kristinekonrad', 'Oct 12', '0 likes · 1 reply', 'https://x.com/kristinekonrad/status/2109815040660693420'),
      rr('medium', '“Sounds great until you get a chargeback”', 'DreadfulDust1', 'Oct 11', '2 likes · 1 reply', 'https://x.com/DreadfulDust1/status/2109419191182787060')
    ],
    themes: [
      {
        id: 't1',
        name: 'Product performance',
        summary:
          'Feedback leans negative, with selected reports describing Shopify access issues in Pakistan that reportedly required a VPN and payment-processing problems that users said were obstructing growth.',
        mentions: 61,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 18,
        neu: 0,
        neg: 43,
        voices: '61 mentions from 50 authors',
        quotes: [
          q('“Shopify is down in Pakistan only working with vpn. Shopify not working in Pakistan. Across Pakistan.”', 'GoharAliKhp2nh', 'Oct 8', '0 likes · 0 replies', 'negative', 1, 'https://x.com/GoharAliKhp2nh/status/2108067629026152735'),
          q('“payment processing issues are becoming a major headache and holding back my growth”', 'Aminullahecom', 'Oct 10', '1 like · 2 replies', 'negative', 2, 'https://x.com/Aminullahecom/status/2108982322678976944'),
          q('“Shopify down in Pakistan only working with vpn.”', 'GoharAliKhp2nh', 'Oct 8', '0 likes · 0 replies', 'negative', 3, 'https://x.com/GoharAliKhp2nh/status/2108065160732516733')
        ]
      },
      {
        id: 't2',
        name: 'Ease of use',
        summary:
          'Feedback is mixed, with selected negative examples criticizing the lack of native multi-currency checkout in India and being directed to the mobile app rather than receiving a UPS tracking number.',
        mentions: 29,
        lean: 'mixed',
        leanLabel: 'Mixed',
        pos: 14,
        neu: 1,
        neg: 14,
        voices: '29 mentions from 28 authors',
        quotes: [
          q('“Shopify markets is useless in India without native multi-currency checkout”', 'thatdarkcoffee', 'Oct 12', '1 like · 1 reply', 'negative', 4, 'https://x.com/thatdarkcoffee/status/2109499667902009819'),
          q('“Shopify gets things wrong and this is one of those times you all are getting it wrong.”', 'ChrisHantis', 'Oct 11', '0 likes · 0 replies', 'negative', 5, 'https://x.com/ChrisHantis/status/2109428794444431606'),
          q('“it only leads you to Shopify insisting you use the mobile app instead of giving you the UPS ground tracking number.”', 'nduley', 'Oct 13', '4 likes · 1 reply', 'negative', 6, 'https://x.com/nduley/status/2110152767398707238')
        ]
      },
      {
        id: 't3',
        name: 'Customer service',
        summary:
          'Feedback leans negative, with examples citing paused payouts despite no chargebacks and unresolved App Review inquiries after multiple tickets.',
        mentions: 21,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 3,
        neu: 0,
        neg: 18,
        voices: '21 mentions from 14 authors',
        quotes: [
          q('“0/10 experience, would not advise.”', 'TooEuro', 'Oct 13', '0 likes · 0 replies', 'negative', 7, 'https://x.com/TooEuro/status/2110056571673653515'),
          q('“Zero chargebacks and payouts still paused is one of the most frustrating things Shopify does.”', 'MerchantRiskDsk', 'Oct 7', '1 like · 1 reply', 'negative', 8, 'https://x.com/MerchantRiskDsk/status/2107976180641202549'),
          q('“8 tickets in, App Review still can\'t say.”', 'ReitsHylkema', 'Oct 9', '0 likes · 1 reply', 'negative', 9, 'https://x.com/ReitsHylkema/status/2108610695726334398')
        ]
      },
      {
        id: 't4',
        name: 'Price and value',
        summary:
          'Feedback leans negative, with selected comments objecting to charges associated with growth, unexpected or usage-based fees, and third-party transaction fees.',
        mentions: 18,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 2,
        neu: 0,
        neg: 16,
        voices: '18 mentions from 16 authors',
        quotes: [
          q('“the merchant pays more just for growing, and the app did nothing extra”', 'oderajoseph', 'Oct 10', '0 likes · 0 replies', 'negative', 10, 'https://x.com/oderajoseph/status/2109083053473599870'),
          q('“7.7% mention being charged for something they didn\'t expect. 329 name usage-based or hidden fees.”', 'AjayCodeWiz', 'Oct 11', '0 likes · 1 reply', 'negative', 11, 'https://x.com/AjayCodeWiz/status/2109305622902489319'),
          q('“Shopify 3rd-party transaction fee (+2.0%)”', 'aniuaj_', 'Oct 11', '0 likes · 0 replies', 'negative', 12, 'https://x.com/aniuaj_/status/2109455449364001206')
        ]
      },
      {
        id: 't5',
        name: 'Innovation',
        summary:
          "Feedback leans positive, with examples praising Shopify's AI-friendly positioning and describing natural-language building as a game changer.",
        mentions: 14,
        lean: 'positive',
        leanLabel: 'Leans positive',
        pos: 12,
        neu: 1,
        neg: 1,
        voices: '14 mentions from 13 authors',
        quotes: [
          q('“@Shopify is capitalizing on one of the greatest market opportunities in recent history by being AI-friendly”', 'danielfoch', 'Oct 12', '24 likes · 14 replies', 'positive', 13, 'https://x.com/danielfoch/status/2109817203398717926'),
          q('“the shift from tweaking settings to building with natural language is a game changer.”', 'kamhossieny', 'Oct 13', '1 like · 0 replies', 'positive', 14, 'https://x.com/kamhossieny/status/2110069127649857585'),
          q('“made a price testing app that\'s free and works with non Shopify plus”', 'austriker27', 'Oct 12', '4 likes · 0 replies', 'positive', 15, 'https://x.com/austriker27/status/2109791929198383550')
        ]
      }
    ],
    themeFine: '27 more mentions sit in smaller or unclear topics and aren’t listed.',
    threadsLead: { n: 3, pct: '9%', total: 170 },
    threads: [
      { title: 'Untitled conversation', meta: 'X · 2 authors', items: 7, share: 4, lean: 'negative', leanLabel: 'Leans negative', href: 'https://x.com/i/status/2109305618578149587' },
      {
        title:
          'I think Amazon is making huge mistake and @Shopify is capitalizing on one of the greatest market opportunities in recent history by being AI-friendly where Amazon is not.',
        short: 'Amazon’s mistake, Shopify’s AI-friendly opportunity',
        meta: 'X · 4 authors',
        items: 5,
        share: 3,
        lean: 'positive',
        leanLabel: 'Leans positive',
        href: 'https://x.com/danielfoch/status/2109817203398717926'
      },
      {
        title:
          'these mfers at @whop are fucking insane 😭 After I tweeted about payment processing, they DM me. Instant video call. 4 people working on my store. 30 minutes later, they had rep…',
        short: 'Whop steps in on a payment-processing complaint',
        meta: 'X · 4 authors',
        items: 4,
        share: 2,
        lean: 'negative',
        leanLabel: 'Leans negative',
        href: 'https://x.com/HamzaLamoudni/status/2108962116015431986'
      }
    ],
    mix: { mentions: 170, posts: 156, pos: 38, neu: 1, neg: 61, posN: 64, neuN: 2, negN: 104 },
    mixFine: '170 mentions from 156 posts, rounded. One post can yield several mentions. Under 20 mentions the report shows “not enough data” instead of a split.',
    comp: 'Of 156 posts: 53% replies · 47% original posts',
    platform: { name: 'X', mentions: 170 },
    dims: {
      sum: 'Product 63% · Commercial 24% · Communication 8% · Brand 5%',
      rows: [
        { pct: 63, name: 'Product', n: 105 },
        { pct: 24, name: 'Commercial', n: 40 },
        { pct: 8, name: 'Communication', n: 13 },
        { pct: 5, name: 'Brand', n: 9 }
      ],
      fine: 'Product = the thing itself; Commercial = price, plans, buying; Brand = who we are; Communication = our posts and campaigns. Shares are of the mentions with a clear subject; 3 mentions had none and are left out.'
    },
    coverage: {
      head: 'as of report generation · 8 of 8 scheduled collections delivered (7 only partly)',
      line: 'No platform had a collection gap in this period.',
      fine: 'Scheduled collections are counted as jobs, not as the share of posts they reached.'
    }
  };

  var past = {
    id: 'past',
    window: 'Sep 7 – Oct 7',
    label: 'Past report · Sep 7 – Oct 7',
    verdict: '22% positive · 73 posts',
    updated: 'Shopify · 91 mentions · past report',
    range: 'Sep 7 – Oct 7, 2026 · times in Eastern Time',
    headline:
      'This is a partial read of the period’s analysed feedback, which leans negative overall; the selected examples center on operational and payments-related problems, including conversion tracking, outages, payment shutdowns, and locked funds.',
    short: 'Feedback leans negative, centering on outages, payment shutdowns and locked funds',
    receipt: 'Read 91 mentions from 73 collected posts on 1 platform.',
    attentionHead: '16 risk posts this period, most about held payouts and shutdowns',
    themesHead: 'Complaints about performance, service and price, mixed on ease of use',
    sayShort: 'Usability is the notable mixed theme, praised for the Admin and getting started.',
    sub: 'Usability is the notable mixed theme, with selected feedback praising the Admin experience and ease of getting started, while the broader theme counts contain both positive and negative feedback. Cost and payment-access concerns also appear in selected examples.',
    cites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 15],
    why: '73 posts collected · 91 mentions read · 1 platform',
    stats: [
      { value: '73', label: 'posts collected' },
      { value: '22%', label: 'of mentions positive' },
      { value: '16', label: 'risk posts' }
    ],
    delta: 'no comparable period before this one',
    riskTotal: 16,
    riskFine: 'The 10 most severe of 16 risk posts, newest first within each severity.',
    risks: [
      rr('high', '“Merchants are being disabled at 0.29%. At 0.58%. At 0.5%.”', 'MerchantRiskDsk', 'Sep 24', '4 likes · 3 replies', 'https://x.com/MerchantRiskDsk/status/2103252605107425611'),
      rr('high', '“Running $400K/mo at 0.58% CBR and still getting cut off is the Shopify Payments trap.”', 'MerchantRiskDsk', 'Sep 24', '2 likes · 1 reply', 'https://x.com/MerchantRiskDsk/status/2103240823559115121'),
      rr('high', '“$110k held for 365 days + full store termination.”', 'eduster27', 'Sep 11', '15 likes · 16 replies', 'https://x.com/eduster27/status/2098460611541627143'),
      rr('high', '“The store https://t.co/nAGo5qzzm7 has been selling highly illegal content for 10 days using Shopify Payments.”', 'budapestcaster', 'Sep 7', '4 likes · 2 replies', 'https://x.com/budapestcaster/status/2097081571735924738'),
      rr('medium', '“Shopify silently kills legacy tracking scripts on October 1.”', 'KyryloBndr', 'Sep 25', '2 likes · 4 replies', 'https://x.com/KyryloBndr/status/2103428412832432221'),
      rr('medium', '“A processing issue can turn into a 100% surprise hold”', 'dougpayments', 'Sep 24', '2 likes · 0 replies', 'https://x.com/dougpayments/status/2103289709388571002'),
      rr('medium', '“Using shopify payments as your only processor and being at risk to shutdowns”', 'ecomrudolfs', 'Sep 24', '9 likes · 2 replies', 'https://x.com/ecomrudolfs/status/2103158491279929614'),
      rr('medium', '“get held by shopify payments for 90 days right as your best product goes viral”', 'alexpagepilot', 'Sep 23', '12 likes · 2 replies', 'https://x.com/alexpagepilot/status/2102788077588766897'),
      rr('medium', '“If this sounds familiar, it\'s because it happens constantly, and @Shopify still hasn\'t fixed it!”', 'Ecomvikings', 'Sep 21', '204 likes · 40 replies', 'https://x.com/Ecomvikings/status/2102240306259464381'),
      rr('medium', '“Funds held. Payouts frozen. No real explanation. Support loops that always go nowhere.”', 'ArmandasPuckus', 'Sep 21', '133 likes · 35 replies', 'https://x.com/ArmandasPuckus/status/2102124968414990404')
    ],
    themes: [
      {
        id: 'o1',
        name: 'Product performance',
        summary:
          'Feedback in this theme leans negative, with examples describing conversion-tracking issues, an admin outage, and a payments shutdown affecting subscriptions and payouts.',
        mentions: 49,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 6,
        neu: 0,
        neg: 43,
        voices: '49 mentions from 33 authors',
        quotes: [
          q('“There’s something wrong with Shopify checkout not tracking conversions but revenue / orders coming through.”', 'jordanhill11', 'Sep 10', '8 likes · 4 replies', 'negative', 1, 'https://x.com/jordanhill11/status/2098108388785705422'),
          q('“Shopify admin is down again.”', 'yannis1kiefer', 'Sep 15', '3 likes · 1 reply', 'negative', 2, 'https://x.com/yannis1kiefer/status/2099825216562065714'),
          q('“My Shopify payments got shut down today. All my MRR subscriptions, payouts, payments, gone.”', 'eliblaxx', 'Sep 18', '132 likes · 42 replies', 'negative', 3, 'https://x.com/eliblaxx/status/2101068705002336431')
        ]
      },
      {
        id: 'o2',
        name: 'Ease of use',
        summary:
          'Feedback is mixed but leans positive, with examples praising the Admin experience, ease of launching, and the speed of starting payment processing.',
        mentions: 15,
        lean: 'mixed',
        leanLabel: 'Mixed',
        pos: 8,
        neu: 0,
        neg: 7,
        voices: '15 mentions from 12 authors',
        quotes: [
          q('“it\'s unreal how amazing the @Shopify Admin feels now.”', 'mcfazeli', 'Sep 24', '24 likes · 3 replies', 'positive', 4, 'https://x.com/mcfazeli/status/2103285790294085736'),
          q('“Shopify makes it easy to launch”', 'dreamzsop', 'Sep 14', '8 likes · 6 replies', 'positive', 5, 'https://x.com/dreamzsop/status/2099553106099057132'),
          q('“Shopify Payments and Stripe are great for getting started. They\'re easy and you can be processing almost immediately.”', 'dougpayments', 'Sep 22', '14 likes · 3 replies', 'positive', 6, 'https://x.com/dougpayments/status/2102369992985428165')
        ]
      },
      {
        id: 'o3',
        name: 'Customer service',
        summary:
          'Feedback in this theme is negative, with examples alleging held funds, frozen payouts, store termination, and support interactions that did not provide resolution or explanation.',
        mentions: 7,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 0,
        neu: 0,
        neg: 7,
        voices: '7 mentions from 7 authors',
        quotes: [
          q('“$110k held for 365 days + full store termination.”', 'eduster27', 'Sep 11', '15 likes · 16 replies', 'negative', 7, 'https://x.com/eduster27/status/2098460611541627143'),
          q('“Funds held. Payouts frozen. No real explanation. Support loops that always go nowhere.”', 'ArmandasPuckus', 'Sep 21', '133 likes · 35 replies', 'negative', 8, 'https://x.com/ArmandasPuckus/status/2102124968414990404'),
          q('“Payouts gone. Funds locked. Zero explanation. Support that loops in circles and goes nowhere.”', 'Ecomvikings', 'Sep 21', '204 likes · 40 replies', 'negative', 9, 'https://x.com/Ecomvikings/status/2102240306259464381')
        ]
      },
      {
        id: 'o4',
        name: 'Against competitors',
        summary:
          'Feedback in this theme is negative, with examples questioning Shopify’s differentiation, citing a perceived hit to Shop Pay’s conversion benefit, and raising concerns about dependence on payment-provider account access.',
        mentions: 6,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 0,
        neu: 0,
        neg: 6,
        voices: '6 mentions from 4 authors',
        quotes: [
          q('“Shopify can remain important merchant infrastructure while becoming invisible, increasingly interchangeable plumbing”', 'JerryCap', 'Sep 9', '129 likes · 27 replies', 'negative', 10, 'https://x.com/JerryCap/status/2097778937938292763'),
          q('“The conversion benefit ShopPay provides takes a hit.”', 'hobie_tweets', 'Sep 9', '3 likes · 4 replies', 'negative', 11, 'https://x.com/hobie_tweets/status/2097782009984598212'),
          q('“If Stripe, Shopify Payments or whatever PSP you use controls the only access to those cards, you can end up stuck when they close your account.”', 'PTeixeiraPS', 'Sep 16', '5 likes · 2 replies', 'negative', 12, 'https://x.com/PTeixeiraPS/status/2100189884765876362')
        ]
      },
      {
        id: 'o5',
        name: 'Price and value',
        summary:
          'Feedback in this theme leans negative, with examples citing transaction surcharges, payment availability limitations in Nigeria alongside third-party fees, and an additional Instant Checkout charge.',
        mentions: 6,
        lean: 'negative',
        leanLabel: 'Leans negative',
        pos: 1,
        neu: 0,
        neg: 5,
        voices: '6 mentions from 6 authors',
        quotes: [
          q('“Shopify surcharges every sale. 2% on Basic, 0.2% on Plus, on top of your processor\'s own fees. Ouch!”', 'joecanwrite', 'Sep 11', '3 likes · 1 reply', 'negative', 13, 'https://x.com/joecanwrite/status/2098366201521177033'),
          q('“Shopify Payments does not work in Nigeria, then Paystack takes its cut.”', 'getzappie', 'Sep 16', '2 likes · 0 replies', 'negative', 14, 'https://x.com/getzappie/status/2100253125852446966'),
          q('“An order that walks in through ChatGPT Instant Checkout costs a Shopify merchant 4% on top of the usual Shopify Payments cut.”', 'LiveTechProof', 'Sep 24', '18 likes · 2 replies', 'negative', 15, 'https://x.com/LiveTechProof/status/2103145123177504880')
        ]
      }
    ],
    themeFine: '8 more mentions sit in smaller or unclear topics and aren’t listed.',
    threadsLead: { n: 3, pct: '12%', total: 91 },
    threads: [
      {
        title:
          'maybe 🌶️ take: i really like new Shopify admin. it feels fresh and refined. makes apps look great too. getting it perfect takes a bit of time because things like spacing, heading size usage weren\'t l…',
        short: 'A take on the new Shopify admin',
        meta: 'X · 1 author',
        items: 5,
        share: 6,
        lean: 'negative',
        leanLabel: 'Leans negative',
        href: 'https://x.com/heysandy801/status/2103598868571308416'
      },
      {
        title:
          'I don’t think you misunderstand how agents shop. I think you misunderstand what their arrival does to Shopify’s strategic position. Shopify is irrelevant to whether a merchant is available to a gener…',
        short: 'What shopping agents do to Shopify’s position',
        meta: 'X · 1 author',
        items: 3,
        share: 3,
        lean: 'negative',
        leanLabel: 'Leans negative',
        href: 'https://x.com/JerryCap/status/2097778937938292763'
      },
      {
        title:
          'GO TO SETTINGS > CHECKOUT IN YOUR SHOPIFY ADMIN SWITCH FROM 3-PAGE CHECKOUT TO ONE-PAGE CHECKOUT. 3 PAGES = 3 CHANCES TO ABANDON. 1 PAGE = 1. 7.5-20% CONVERSION LIFT FROM 2 CLICKS. 10 SECONDS NOW GO…',
        short: 'Switching to one-page checkout',
        meta: 'X · 1 author',
        items: 3,
        share: 3,
        lean: 'positive',
        leanLabel: 'Leans positive',
        href: 'https://x.com/alexpagepilot/status/2101714252776280457'
      }
    ],
    mix: { mentions: 91, posts: 73, pos: 22, neu: 0, neg: 78, posN: 20, neuN: 0, negN: 71 },
    mixFine: '91 mentions from 73 posts, rounded. One post can yield several mentions. Under 20 mentions the report shows “not enough data” instead of a split.',
    comp: 'Of 73 posts: 81% original posts · 19% replies',
    platform: { name: 'X', mentions: 91 },
    dims: {
      sum: 'Product 76% · Commercial 15% · Communication 7% · Brand 2%',
      rows: [
        { pct: 76, name: 'Product', n: 69 },
        { pct: 15, name: 'Commercial', n: 14 },
        { pct: 7, name: 'Communication', n: 6 },
        { pct: 2, name: 'Brand', n: 2 }
      ],
      fine: 'Product = the thing itself; Commercial = price, plans, buying; Brand = who we are; Communication = our posts and campaigns.'
    },
    coverage: {
      head: 'as of report generation · 1 of 1 scheduled collection delivered (1 only partly)',
      line: 'No platform had a collection gap in this period.',
      fine: 'Scheduled collections are counted as jobs, not as the share of posts they reached.'
    }
  };

  var runs = [
    { id: 'c1', status: 'Complete', when: 'Oct 16, 2:01 AM', ago: '18 days ago', trigger: 'Schedule', took: '21m 39s', mentions: 53, window: 'Oct 15 – Oct 16, 2026', day: 'Oct 16' },
    { id: 'c2', status: 'Complete', when: 'Oct 15, 2:01 AM', ago: '19 days ago', trigger: 'Schedule', took: '13m 07s', mentions: 65, window: 'Oct 14 – Oct 15, 2026', day: 'Oct 15' },
    { id: 'c3', status: 'Complete', when: 'Oct 14, 8:06 AM', ago: '19 days ago', trigger: 'Schedule', took: '0m 00s', mentions: null, window: 'Oct 7 – Oct 14, 2026', day: 'Oct 14', report: 'latest' },
    { id: 'c4', status: 'Complete', when: 'Oct 14, 2:01 AM', ago: '20 days ago', trigger: 'Schedule', took: '15m 06s', mentions: 51, window: 'Oct 13 – Oct 14, 2026', day: 'Oct 14' },
    { id: 'c5', status: 'Partial', when: 'Oct 13, 2:01 AM', ago: '21 days ago', trigger: 'Schedule', took: '12m 05s', mentions: 27, window: 'Oct 12 – Oct 13, 2026', day: 'Oct 13' },
    { id: 'c6', status: 'Partial', when: 'Oct 12, 2:01 AM', ago: '22 days ago', trigger: 'Schedule', took: '10m 39s', mentions: 33, window: 'Oct 11 – Oct 12, 2026', day: 'Oct 12' },
    { id: 'c7', status: 'Partial', when: 'Oct 11, 2:01 AM', ago: '23 days ago', trigger: 'Schedule', took: '9m 17s', mentions: 10, window: 'Oct 10 – Oct 11, 2026', day: 'Oct 11' },
    { id: 'c8', status: 'Partial', when: 'Oct 10, 2:01 AM', ago: '24 days ago', trigger: 'Schedule', took: '11m 27s', mentions: 28, window: 'Oct 9 – Oct 10, 2026', day: 'Oct 10' },
    { id: 'c9', status: 'Partial', when: 'Oct 9, 2:01 AM', ago: '25 days ago', trigger: 'Schedule', took: '1m 44s', mentions: 0, window: 'Oct 8 – Oct 9, 2026', day: 'Oct 9' },
    { id: 'c10', status: 'Partial', when: 'Oct 8, 2:01 AM', ago: '26 days ago', trigger: 'Schedule', took: '7m 03s', mentions: 21, window: 'Oct 7 – Oct 8, 2026', day: 'Oct 8' },
    { id: 'c11', status: 'Partial', when: 'Oct 7, 4:46 PM', ago: '26 days ago', trigger: 'Manual', took: '19m 11s', mentions: 91, window: 'Sep 7 – Oct 7, 2026', day: 'Oct 7', report: 'past' }
  ];

  var collection = {
    sub: 'What each platform is doing now. Everything here takes effect when you press it.',
    platformsSub:
      'What each one is doing now. Check now reads the most recent day (a platform’s first check, the last 7); earlier missed days stay listed as gaps.',
    platform: {
      name: 'X',
      outcome: '170 mentions · 388 sources last report',
      queries: '10 queries · discovery on',
      schedule: 'Scheduled collection reads the last 1 day, up to 100 sources · Collects daily at 02:00',
      list: [
        'Shopify',
        'Shopify (experience OR quality OR reliable OR frustrating OR easy OR difficult)',
        'Shopify (support OR customer service OR help OR response)',
        'Shopify (login OR account OR verification OR payment OR billing)',
        'Shopify (price OR pricing OR expensive OR affordable OR value OR worth)',
        'Shopify (love OR recommend OR recommendation OR favorite OR success)',
        'Shopify (complaint OR issue OR problem OR unhappy OR disappointed OR cancel)',
        'Shopify (switching OR switched OR leave OR leaving OR alternative)'
      ],
      more: '+2 more',
      when: 'Collects daily at 02:00 · Eastern Time',
      limits: 'Replies on · Quotes on · Max posts 100'
    },
    excluded: [
      { why: 'Not enough evidence · x: The post is about checkout tools but does not identify Shopify itself.', text: '@EcomSapo Are you using checkoutchamp or funnelish?' },
      { why: 'Not enough evidence · x: The reply is meta conversation and does not itself identify a brand-linked subject.', text: '@KatieKeithBarn2 @TheAwesomeTuvia Responded to @TheAwesomeTuvia, not you, sorry for hijacking the thread' }
    ],
    excludedSub: 'These posts were not included in sentiment analysis. This does not establish an absence of negative feedback.',
    requests: [
      'Logical requests: 75 · HTTP attempts: 75 · blocked before sending: 0.',
      'Requests with HTTP attempts: 75 · additional HTTP attempts: 0. Restoring saved results does not count as a new HTTP attempt.',
      'Requests that waited for budget: 0 · currently waiting: 0 · final failures: 0.'
    ],
    watches: {
      sub: 'Edited in Signal settings, along with competitors, exclusions, the sources this plan follows, and when each report and platform runs.',
      terms: ['Shopify'],
      topics: ['Online store creation and customization', 'Checkout and payment processing', 'Built-in AI commerce tools'],
      triggers: 'None yet'
    },
    inactive: 'Not configured · Amazon, Facebook, Google Maps, Instagram, Reddit, Threads, TikTok, Yelp, YouTube'
  };

  /* The Sentiment page v2 proposal's states. Normal and Failure read Shopify's real
     numbers; Failure is how the plan stands today. Thin is a sample state: its counts
     are made up to show the layout, its posts are real ones from the latest report. */
  var v2 = {
    meta: 'Times in Eastern Time',
    subline: 'Shopify · updated Oct 14, 8:06 AM · next report Oct 21',
    trend: [
      { label: 'S7', window: 'Sep 7 – Oct 7', value: 91 },
      { label: 'O7', window: 'Oct 7 – Oct 14', value: 170 }
    ],
    since: {
      posts: 195,
      counted: 'Counted since Oct 14 · in the Oct 21 report',
      explain: 'What came in after the Oct 14 report. It goes into the Oct 21 report.',
      thinNote: 'Neither reads as a risk. They will be in the next report.'
    },
    attentionSub: 'As they stood when this report was generated. Handling is recorded here; it doesn’t change the report’s count.',
    failureAttentionSub: 'As they stood when this report was generated. The new posts above are this period’s, not the report’s.',
    themesSub: 'This period’s focus, with a representative post under each. One period is not a lasting shift.',
    uncertainSub: 'Not included in confirmed totals unless you confirm. No deadline.',
    uncertain: [
      { id: 'u1', platform: 'X', text: '“@EcomSapo Are you using checkoutchamp or funnelish?”', meta: 'The post is about checkout tools but doesn’t name Shopify', href: 'https://x.com' },
      { id: 'u2', platform: 'X', text: '“@KatieKeithBarn2 @TheAwesomeTuvia Responded to @TheAwesomeTuvia, not you, sorry for hijacking the thread”', meta: 'A reply about the conversation, with no brand-linked subject', href: 'https://x.com' }
    ],
    basis: {
      from: 'X 170',
      coverage: 'X: every day. 8 of 8 scheduled collections ran, 7 only partly.',
      coverageFail: 'Report: no platform had a gap. This period: X stopped on Oct 16 (see below).',
      watches: '“Shopify” + 2 topics + 6 competitors',
      summary: '1 platform · 8 of 8 scheduled collections ran',
      fine: 'Sentiment mix: 38% positive · 1% neutral · 61% negative, by mention. 156 posts were collected; 170 mentions were read from them, since one post can yield several.'
    },
    footer: 'Collecting daily on X · next report Oct 21',
    failure: {
      title: 'X stopped collecting on Oct 16 · the scheduled collection didn’t run',
      detail: 'Oct 21’s report reads X as a gap for the days missed; nothing is backfilled.',
      note: 'Uses credits',
      footer: 'Next report Oct 21'
    },
    /* Thin's chart: the sample's mentions per day, for the same seven days */
    thinDaily: [1, 0, 1, 0, 2, 1, 1],
    thin: {
      thin: true,
      id: 'thin',
      window: 'Oct 7 – Oct 14',
      label: 'Latest report · Oct 7 – Oct 14',
      verdict: '6 mentions · 1 post',
      short: '6 mentions this period, too few to say how people feel overall',
      sub: 'Under 20 independent mentions, so there is no sentiment split or score for this period. The six posts are below, to read one by one. One of them is a risk and is treated as one regardless of the sample size.',
      sayShort: 'No split or score under 20 independent mentions. The six posts are below, to read one by one.',
      receipt: 'Read 6 mentions from 41 collected posts on 1 platform.',
      cites: [],
      stats: [
        { value: '6', label: 'mentions · 5 authors' },
        { value: '1', label: 'risk post' }
      ],
      riskTotal: 1,
      attentionHead: 'One risk post this period',
      attentionSub: 'A small sample limits the overall read, never a specific post.',
      riskFine: '',
      risks: [],
      themes: [],
      themesHead: 'The 6 mentions, to read one by one',
      postsSub: 'Too few to stand for how people see the brand overall, so there are no themes this period.',
      trend: [
        { label: 'S7', window: 'Sep 7 – Oct 7', value: 9, thin: true },
        { label: 'O7', window: 'Oct 7 – Oct 14', value: 6, thin: true }
      ],
      sinceText: '2 new posts · no new risks',
      sincePosts: 2,
      basis: {
        from: 'X 6',
        coverage: 'X: every day.',
        watches: '“Shopify” + 2 topics + 6 competitors',
        summary: '1 platform · every scheduled collection ran',
        fine: '41 posts were collected; 6 were read as mentions of the brand. A quiet brand gets fewer searches per day, so adding a product name or another distinguishing term in Settings widens what is found.'
      }
    }
  };
  /* the thin state's posts and its one risk come from the latest report */
  v2.thin.risks = [latest.risks[0]];
  v2.thin.posts = [latest.themes[0].quotes[1], latest.themes[4].quotes[1], latest.themes[1].quotes[0], latest.themes[2].quotes[0], latest.themes[3].quotes[0], latest.themes[4].quotes[2]];

  return {
    v2: v2,
    findings: findings,
    market: market,
    period: period,
    reports: { latest: latest, past: past },
    runs: runs,
    collection: collection,
    sentiment: {
      question: 'This period, how are you being heard?',
      sub: 'Start with this period’s posts and any risks, then use the latest report to understand the themes behind them.',
      cadence: 'Reports every week at 08:00',
      next: 'Automatic collection · next report Oct 21',
      addLinkHint: 'Signal reads the page once and, if it is about Shopify, adds what it finds to this period’s posts. Reading it uses credits.'
    }
  };
})();
