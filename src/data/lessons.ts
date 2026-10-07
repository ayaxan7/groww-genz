/** 1 = Basics, 2 = Intermediate, 3 = Advanced */
export type LessonLevel = 1 | 2 | 3;

export const levelLabel: Record<LessonLevel, string> = { 1: "Basics", 2: "Intermediate", 3: "Advanced" };

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  category: string;
  durationSec: number;
  description: string;
  /** Conversational one-liner that sparks curiosity (discovery cards, lists). */
  hook: string;
  /** legacy cover from the first asset pack (reels now use the 3D character art) */
  cover?: string;
  /** Short captions shown one after another while the reel plays. */
  segments: string[];
  takeaways: string[];
  related: string[];
  cta: { label: string; href: string };
  accent: string;
}

export const lessons: Lesson[] = [
  {
    id: "sip",
    level: 1,
    title: "What is a SIP?",
    hook: "You keep hearing 'SIP'. Here's what it actually means.",
    category: "SIPs",
    durationSec: 30,
    description: "A simple way to invest a fixed amount regularly.",
    cover: "/reels/01-sip.svg",
    segments: [
      "SIP stands for Systematic Investment Plan.",
      "You pick an amount, say ₹500, and invest it every month automatically.",
      "No need to time the market. Some months you buy more units, some months fewer.",
      "Over years, small amounts can add up. Consistency matters more than size.",
    ],
    takeaways: [
      "A SIP means investing a fixed amount regularly",
      "It encourages consistency over timing the market",
      "It can support long-term goals",
      "You can start with as little as ₹100",
    ],
    related: ["Mutual Funds", "CAGR", "Diversification", "Long-term investing"],
    cta: { label: "Explore SIPs", href: "/explore?tab=sip" },
    accent: "#00D09C",
  },
  {
    id: "diversification",
    level: 1,
    title: "Why diversification matters",
    hook: "Why people say 'don't put all your eggs in one basket'",
    category: "Basics",
    durationSec: 30,
    description: "Don't let one investment decide your whole outcome.",
    cover: "/reels/02-diversification.svg",
    segments: [
      "Diversification means spreading money across different investments.",
      "If one company has a bad year, the others can balance it out.",
      "A single mutual fund or ETF can already hold 50+ companies.",
      "It doesn't remove risk, but it reduces the damage from any one mistake.",
    ],
    takeaways: [
      "Spread money across companies, sectors and asset types",
      "One bad investment hurts less",
      "Funds and ETFs give you diversification in one step",
      "Diversification reduces risk, it doesn't remove it",
    ],
    related: ["ETFs", "Mutual Funds", "Risk vs return", "Asset allocation"],
    cta: { label: "Explore diversified funds", href: "/explore?tab=mf" },
    accent: "#5B8DEF",
  },
  {
    id: "cagr",
    level: 2,
    title: "CAGR in 30 seconds",
    hook: "What does your return number actually mean?",
    category: "Concepts",
    durationSec: 30,
    description: "Understand how annualised growth is calculated.",
    cover: "/reels/03-cagr.svg",
    segments: [
      "CAGR = Compound Annual Growth Rate.",
      "Investments don't grow in a straight line. They go up and down.",
      "CAGR smooths that journey into one yearly growth number.",
      "₹10,000 growing to ₹16,105 in 5 years is a 10% CAGR. Past CAGR doesn't guarantee future returns.",
    ],
    takeaways: [
      "CAGR is the average yearly growth rate",
      "It smooths out ups and downs",
      "Useful for comparing investments over the same period",
      "Past returns are not a promise of future returns",
    ],
    related: ["Compounding", "Returns", "SIPs", "Comparing funds"],
    cta: { label: "Compare returns", href: "/compare" },
    accent: "#F59E0B",
  },
  {
    id: "risk-return",
    level: 1,
    title: "Risk vs return",
    hook: "Why bigger returns usually mean a bumpier ride",
    category: "Risk",
    durationSec: 30,
    description: "Higher potential return usually comes with higher uncertainty.",
    cover: "/reels/04-risk.svg",
    segments: [
      "Every investment sits somewhere between low risk and high risk.",
      "Low-risk options move slowly and steadily, like a liquid fund.",
      "Higher-risk options, like small companies, can grow faster but also fall harder.",
      "Match risk to your timeline: money you need soon shouldn't ride big swings.",
    ],
    takeaways: [
      "Higher potential return usually means higher risk",
      "Short-term money suits lower-risk options",
      "Long horizons can handle more ups and downs",
      "Your comfort with swings matters too",
    ],
    related: ["Diversification", "Timeline", "Debt funds", "Equity funds"],
    cta: { label: "See options by risk", href: "/explore?tab=foryou" },
    accent: "#EF4444",
  },
  {
    id: "etf",
    level: 2,
    title: "What is an ETF?",
    hook: "One buy, many companies. Here's how.",
    category: "ETFs",
    durationSec: 30,
    description: "One product can give you exposure to many assets.",
    cover: "/reels/05-etf.svg",
    segments: [
      "ETF stands for Exchange Traded Fund.",
      "It's a basket of investments, like the Nifty 50 companies, in one unit.",
      "You buy and sell it on the stock exchange, just like a share.",
      "ETFs are usually low-cost and simple ways to track an index or gold.",
    ],
    takeaways: [
      "An ETF is a basket of investments traded like a stock",
      "Often tracks an index like the Nifty 50",
      "Usually has very low costs",
      "Can cover stocks, gold or a sector",
    ],
    related: ["Index funds", "Diversification", "Gold", "Stocks"],
    cta: { label: "Explore ETFs", href: "/explore?tab=etf" },
    accent: "#8B5CF6",
  },
  {
    id: "goal",
    level: 1,
    title: "Investing for a goal",
    hook: "Turn 'someday' into an actual plan",
    category: "Goals",
    durationSec: 30,
    description: "Connect your time horizon and amount to a real-life goal.",
    cover: "/reels/06-goal.svg",
    segments: [
      "Investing is easier when it has a purpose: a laptop, a trip, a safety net.",
      "Start with three things: target amount, timeline and monthly amount.",
      "Short goals suit steadier options. Long goals can use equity for growth.",
      "Track progress regularly and adjust if life changes. Small steps count.",
    ],
    takeaways: ["Give your money a job", "Target + timeline = monthly amount", "Match the investment type to your timeline", "Review and adjust as you go"],
    related: ["SIPs", "Risk vs return", "Emergency fund", "Timeline"],
    cta: { label: "View your goals", href: "/goals" },
    accent: "#00D09C",
  },
  // ---------- Intermediate ----------
  {
    id: "sip-vs-lumpsum",
    title: "SIP vs lump sum",
    level: 2,
    hook: "Got a bonus? Here's how to think about investing it.",
    category: "SIPs",
    durationSec: 30,
    description: "Investing all at once vs. spreading it out over time.",
    segments: [
      "A lump sum invests everything today. A SIP spreads the same money over months.",
      "SIPs buy more units when prices dip and fewer when they rise. That's rupee-cost averaging.",
      "Lump sums can do better in steadily rising markets, but timing feels stressful.",
      "Many people split it: some now, the rest as a SIP. Comfort matters as much as maths.",
    ],
    takeaways: [
      "Lump sum: all money invested at once",
      "SIP: spread out, averages your buying price",
      "Neither wins every time",
      "Splitting the amount is a common middle path",
    ],
    related: ["SIPs", "CAGR", "Risk vs return", "Mutual Funds"],
    cta: { label: "Explore SIP-friendly funds", href: "/explore?tab=sip" },
    accent: "#14B8A6",
  },
  {
    id: "index-vs-active",
    title: "Index vs active funds",
    level: 2,
    hook: "Why low fees quietly matter more than you think.",
    category: "Mutual Funds",
    durationSec: 30,
    description: "Copying the market vs. trying to beat it, and what it costs.",
    segments: [
      "An index fund copies a market index, like the Nifty 50. No stock picking.",
      "An active fund has a manager choosing stocks to try to beat that index.",
      "Active funds charge more. A 1% yearly fee compounds into a big gap over 10+ years.",
      "Compare a fund's long-term returns after fees with its index, not just last year.",
    ],
    takeaways: [
      "Index funds track the market at low cost",
      "Active funds try to beat it, for a higher fee",
      "Fees compound just like returns",
      "Judge funds over many years, after fees",
    ],
    related: ["Mutual Funds", "ETFs", "Expense ratio", "CAGR"],
    cta: { label: "Compare funds", href: "/explore?tab=mf" },
    accent: "#6366F1",
  },
  // ---------- Advanced ----------
  {
    id: "pe-valuation",
    title: "Reading P/E like a pro",
    level: 3,
    hook: "A 'cheap' P/E can be a trap. Here's the context you need.",
    category: "Stocks",
    durationSec: 30,
    description: "What P/E tells you, and what it hides.",
    segments: [
      "P/E = share price ÷ yearly earnings per share. It's what you pay for ₹1 of profit.",
      "Compare P/E within the same industry and against the company's own history.",
      "Fast-growing companies often trade at high P/Es; shrinking ones can look 'cheap'.",
      "Pair P/E with growth, debt and profit quality before drawing conclusions.",
    ],
    takeaways: [
      "P/E is price relative to earnings",
      "Compare with peers and the company's own past",
      "Low P/E isn't automatically good value",
      "Always add growth and debt to the picture",
    ],
    related: ["Valuation", "Stocks", "Risk vs return", "Diversification"],
    cta: { label: "Research a stock", href: "/explore?tab=stocks" },
    accent: "#0EA5E9",
  },
  {
    id: "rebalancing",
    title: "Asset allocation & rebalancing",
    level: 3,
    hook: "Your mix drifts every year. Here's how to steer it back.",
    category: "Portfolio",
    durationSec: 30,
    description: "Choosing your mix of equity, debt and gold, and keeping it on track.",
    segments: [
      "Asset allocation is your mix, say 70% equity, 20% debt, 10% gold.",
      "Markets move, so the mix drifts. A great equity year might push you to 80%.",
      "Rebalancing trims what grew and tops up what lagged, back to your target.",
      "Once a year, or when the mix drifts 5%+, is a simple, calm rule of thumb.",
    ],
    takeaways: [
      "Your mix drives most of your ups and downs",
      "Mixes drift as markets move",
      "Rebalancing restores your chosen risk level",
      "A yearly check-in keeps it simple",
    ],
    related: ["Diversification", "Risk vs return", "Gold", "Debt funds"],
    cta: { label: "See where your money is", href: "/portfolio" },
    accent: "#8B5CF6",
  },
  {
    id: "capital-gains-tax",
    title: "How your gains are taxed",
    level: 3,
    hook: "Selling at a profit? How long you held changes the tax.",
    category: "Tax",
    durationSec: 30,
    description: "Short-term vs long-term gains, in plain English.",
    segments: [
      "When you sell an investment for more than you paid, the profit is a capital gain.",
      "For equity, holding over a year usually counts as long-term, under a year as short-term.",
      "Long-term gains are generally taxed at a lower rate, with a yearly exemption limit.",
      "Rates and limits change with budgets, so check the latest rules before selling.",
    ],
    takeaways: [
      "Profit on selling = capital gain",
      "Holding period decides short vs long term",
      "Long-term is usually taxed lower",
      "Tax rules change; always check the latest",
    ],
    related: ["ELSS", "Mutual Funds", "Stocks", "Investing for a goal"],
    cta: { label: "View your holdings", href: "/portfolio" },
    accent: "#F97316",
  },
  {
    id: "drawdowns",
    title: "Drawdowns & volatility",
    level: 3,
    hook: "Why a 50% fall needs a 100% gain to recover.",
    category: "Risk",
    durationSec: 30,
    description: "How deep falls work, and how to sit through them.",
    segments: [
      "A drawdown is how far an investment falls from its peak.",
      "Maths is uneven: lose 50% and you need +100% just to get back to where you were.",
      "Small and mid caps have historically had deeper drawdowns than large caps.",
      "Sizing positions and staying diversified helps you hold on instead of panic-selling.",
    ],
    takeaways: [
      "Drawdown = fall from the peak",
      "Recovering needs a bigger % gain than the fall",
      "Riskier assets tend to fall deeper",
      "Plan for drawdowns before they happen",
    ],
    related: ["Risk vs return", "Diversification", "Small caps", "Asset allocation"],
    cta: { label: "Check risk levels", href: "/explore?tab=foryou" },
    accent: "#EF4444",
  },
];

export const getLesson = (id: string | null | undefined) => lessons.find((l) => l.id === id);
