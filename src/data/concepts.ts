/**
 * Bite-sized concepts that can be explained visually anywhere in the app
 * (an "Explain simply" sheet), each optionally linked to a full 30-sec reel.
 */
export type ConceptId = "sip" | "compounding" | "diversification" | "risk" | "pe" | "returns" | "valuation" | "expense";

export interface Concept {
  id: ConceptId;
  question: string;
  title: string;
  takeaway: string;
  lessonId?: string;
}

export const concepts: Record<ConceptId, Concept> = {
  sip: { id: "sip", question: "What's a SIP?", title: "SIP, simply", takeaway: "That's a SIP: the same amount, every month.", lessonId: "sip" },
  compounding: {
    id: "compounding",
    question: "How could this grow?",
    title: "Growth on growth",
    takeaway: "Your money can grow on itself over time.",
    lessonId: "cagr",
  },
  diversification: {
    id: "diversification",
    question: "Why spread money out?",
    title: "Don't put it all in one place",
    takeaway: "If one bucket dips, the others can balance it out.",
    lessonId: "diversification",
  },
  risk: {
    id: "risk",
    question: "Not sure what risk means?",
    title: "Risk = how bumpy the ride is",
    takeaway: "More ups & downs can mean more growth, but a bumpier ride.",
    lessonId: "risk-return",
  },
  pe: {
    id: "pe",
    question: "What does P/E mean?",
    title: "P/E in one picture",
    takeaway: "P/E tells you how much you pay for each ₹1 a company earns in a year.",
    lessonId: "pe-valuation",
  },
  returns: {
    id: "returns",
    question: "What does this return number mean?",
    title: "Your return, simply",
    takeaway: "Return is what your money earned on top of what you put in.",
    lessonId: "cagr",
  },
  valuation: {
    id: "valuation",
    question: "What does valuation mean?",
    title: "Cheap, usual or pricey?",
    takeaway: "We compare today's price with what the company usually trades at. It's a hint, not a verdict.",
  },
  expense: {
    id: "expense",
    question: "What's an expense ratio?",
    title: "The yearly fee, simply",
    takeaway: "A small yearly fee the fund takes for managing your money.",
    lessonId: "index-vs-active",
  },
};
