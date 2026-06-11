import type { LeadInput, ReadinessResult } from "@/lib/types";

const reviewCategories = [
  "health",
  "medical",
  "doctor",
  "clinic",
  "law",
  "legal",
  "attorney",
  "finance",
  "loan",
  "credit",
  "insurance",
  "gambling",
  "casino",
  "alcohol",
  "tobacco",
  "vape",
  "dating",
  "political",
  "weapon",
  "cannabis",
  "crypto",
];

const strongLocalCategories = [
  "roof",
  "plumb",
  "hvac",
  "landscap",
  "clean",
  "remodel",
  "electric",
  "dent",
  "spa",
  "gym",
  "fitness",
  "restaurant",
  "retail",
  "school",
  "tutor",
  "agency",
  "consult",
  "real estate",
];

export function scoreLead(input: LeadInput): ReadinessResult {
  const text = [
    input.businessType,
    input.primaryOffer,
    input.targetCustomers,
    input.currentChannels.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const policyReviewRequired = reviewCategories.some((term) => text.includes(term));
  const categoryFit = strongLocalCategories.some((term) => text.includes(term)) ? 22 : 12;
  const hasWebsite = input.websiteUrl ? 12 : 4;
  const budgetScore = budgetToScore(input.monthlyAdBudgetRange);
  const channelScore = input.currentChannels.length >= 2 ? 14 : input.currentChannels.length === 1 ? 9 : 4;
  const urgencyScore = /now|asap|this month|30|soon|immediate|ready/i.test(input.urgency) ? 12 : 7;
  const offerScore = input.primaryOffer.length > 80 ? 10 : 7;
  const consentScore = input.consentToContact ? 8 : 0;

  const rawScore =
    categoryFit + hasWebsite + budgetScore + channelScore + urgencyScore + offerScore + consentScore;
  const readinessScore = Math.max(10, Math.min(96, policyReviewRequired ? rawScore - 10 : rawScore));

  const fitLevel = policyReviewRequired
    ? "needs_human_review"
    : readinessScore >= 76
      ? "high"
      : readinessScore >= 55
        ? "medium"
        : "low";

  const opportunities = [
    "Package your strongest local offer around high-intent research and comparison moments.",
    "Prepare context hints that describe the customer problems your business solves.",
    input.websiteUrl
      ? "Audit your landing page for speed, clarity, tracking, and conversion readiness."
      : "Create or improve a landing page before spending on ChatGPT Ads.",
  ];

  const risks = [
    policyReviewRequired
      ? "Your category or claims may require manual policy review before any campaign work."
      : "Delivery, review, pricing, and availability are controlled by OpenAI and can change.",
    budgetScore < 14
      ? "Budget may limit useful test volume; start with readiness and tracking before scaling."
      : "Budget appears workable for a structured launch test, subject to platform availability.",
  ];

  return {
    fitLevel,
    readinessScore,
    opportunities,
    risks,
    recommendedNextStep:
      fitLevel === "low"
        ? "Start with the readiness audit and landing-page cleanup before booking a launch call."
        : "Book a launch-readiness call so we can review category eligibility, tracking, and first campaign angles.",
    bookingRecommended: fitLevel === "high" || fitLevel === "medium" || fitLevel === "needs_human_review",
    policyReviewRequired,
  };
}

function budgetToScore(range: string) {
  const normalized = range.toLowerCase();
  if (normalized.includes("10000") || normalized.includes("10k") || normalized.includes("5k")) return 18;
  if (normalized.includes("2500") || normalized.includes("2,500") || normalized.includes("3k")) return 15;
  if (normalized.includes("1000") || normalized.includes("1,000")) return 11;
  if (normalized.includes("500")) return 7;
  return 9;
}
