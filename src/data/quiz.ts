export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const QUIZ_POINTS = 20;
export const REEL_POINTS = 10;

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q-sip",
    lessonId: "sip",
    question: "A SIP (Systematic Investment Plan) is best described as:",
    options: ["A one-time stock trade", "Investing a fixed amount regularly", "A savings account", "A government scheme"],
    answer: 1,
    explanation: "A SIP lets you invest a fixed amount, like ₹500, at regular intervals, usually monthly, into a mutual fund.",
  },
  {
    id: "q-sip-2",
    lessonId: "sip",
    question: "What's the smallest monthly SIP you can typically start with?",
    options: ["₹100", "₹10,000", "₹50,000", "You need a lump sum first"],
    answer: 0,
    explanation: "Many mutual funds accept SIPs from ₹100. Starting small is completely normal.",
  },
  {
    id: "q-div",
    lessonId: "diversification",
    question: "Why do investors diversify?",
    options: ["To guarantee profits", "So one bad investment doesn't hurt too much", "To pay less tax", "Because it's mandatory"],
    answer: 1,
    explanation: "Spreading money across many investments reduces the impact of any single one doing badly. It lowers risk, but never removes it.",
  },
  {
    id: "q-cagr",
    lessonId: "cagr",
    question: "CAGR tells you…",
    options: [
      "The exact return you'll get next year",
      "The average yearly growth rate over a period",
      "The fees a fund charges",
      "How many companies a fund holds",
    ],
    answer: 1,
    explanation: "CAGR smooths the ups and downs into one yearly growth number for a past period. It isn't a prediction.",
  },
  {
    id: "q-risk",
    lessonId: "risk-return",
    question: "You need money in 8 months for a trip. Which fits better?",
    options: ["A small cap fund", "A liquid fund", "A single volatile stock", "Crypto"],
    answer: 1,
    explanation: "Money needed soon is better kept in steadier options like liquid funds, so a market dip doesn't derail your plan.",
  },
  {
    id: "q-etf",
    lessonId: "etf",
    question: "An ETF is…",
    options: ["A basket of investments that trades like a stock", "A type of bank deposit", "A loan", "A single company's share"],
    answer: 0,
    explanation: "ETFs hold many assets, like the Nifty 50 companies or gold, and you can buy or sell units on the exchange.",
  },
  {
    id: "q-goal",
    lessonId: "goal",
    question: "Which three things define an investing goal?",
    options: ["Brand, colour, size", "Target amount, timeline, monthly amount", "Stock tips, news, luck", "Only the target amount"],
    answer: 1,
    explanation: "Knowing how much you need, by when, and how much you can put aside regularly turns a wish into a plan.",
  },
  {
    id: "q-lumpsum",
    lessonId: "sip-vs-lumpsum",
    question: "What does a SIP do that a lump sum doesn't?",
    options: ["Guarantees higher returns", "Averages your buying price over time", "Avoids all market risk", "Removes fund fees"],
    answer: 1,
    explanation:
      "Investing a fixed amount regularly buys more units when prices are low and fewer when high, averaging your cost. It doesn't guarantee better returns.",
  },
  {
    id: "q-index",
    lessonId: "index-vs-active",
    question: "Why do fees matter so much over 10+ years?",
    options: ["They're charged only once", "They compound, just like returns", "They're refunded if returns are low", "They don't affect returns"],
    answer: 1,
    explanation: "A yearly fee is taken every year, so its effect compounds. A 1% difference can add up to a large gap over a decade.",
  },
  {
    id: "q-pe",
    lessonId: "pe-valuation",
    question: "A stock has a much lower P/E than its peers. What's the best next step?",
    options: ["Buy it, it's cheap", "Check growth, debt and why it's priced low", "Ignore P/E completely", "Sell all other stocks"],
    answer: 1,
    explanation: "A low P/E can signal value or a problem, like shrinking profits or heavy debt. Context comes first.",
  },
  {
    id: "q-rebalance",
    lessonId: "rebalancing",
    question: "Your 70/30 equity/debt mix drifted to 80/20 after a strong year. Rebalancing means…",
    options: ["Moving everything to equity", "Trimming equity and topping up debt back to 70/30", "Waiting for a crash", "Selling everything"],
    answer: 1,
    explanation: "Rebalancing brings your mix back to the risk level you chose, by trimming what grew and adding to what lagged.",
  },
  {
    id: "q-tax",
    lessonId: "capital-gains-tax",
    question: "For equity investments, what usually decides short-term vs long-term gains?",
    options: ["How much profit you made", "How long you held before selling", "Which app you used", "The company's size"],
    answer: 1,
    explanation: "The holding period decides it; for equity, over a year is usually long-term. Rates change with budgets, so check the latest rules.",
  },
  {
    id: "q-drawdown",
    lessonId: "drawdowns",
    question: "An investment falls 50%. What gain does it need to get back to where it was?",
    options: ["+50%", "+75%", "+100%", "+25%"],
    answer: 2,
    explanation: "From ₹100, a 50% fall leaves ₹50. Getting back to ₹100 needs your ₹50 to double, a 100% gain.",
  },
];
