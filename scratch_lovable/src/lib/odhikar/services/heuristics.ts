// Transparent development fallback used when the AI gateway is unreachable.
// Rules + arithmetic only — it never matches a seeded scenario, it only reads
// the text the user actually produced.
import type {
  AnalysisResult,
  ClassificationResult,
  ExtractionResult,
  MissingField,
  SafetyResult,
} from "./types";
import type { LegalCategory } from "../types";

const SAFETY_PATTERNS: { keys: string[]; label: string; severity: "elevated" | "immediate" }[] = [
  { keys: ["মারধর", "মেরেছে", "মারে", "হাত তুলেছে", "আঘাত", "beat", "hit me"], label: "physical violence", severity: "immediate" },
  { keys: ["বাঁচব না", "মেরে ফেলব", "মেরে ফেলবে", "খুন", "জানে মের", "kill"], label: "threat to life", severity: "immediate" },
  { keys: ["ডাক্তারের কাছে যেতে দেয়নি", "চিকিৎসা করতে দেয়নি", "denied medical"], label: "denial of medical care", severity: "immediate" },
  { keys: ["আটকে রেখেছে", "বের হতে দেয় না", "confine", "locked me"], label: "confinement", severity: "immediate" },
  { keys: ["ভয় দেখা", "হুমকি", "threat"], label: "threats / intimidation", severity: "elevated" },
];

export function detectSafetyRules(text: string): SafetyResult {
  const reasons: string[] = [];
  let severity: SafetyResult["severity"] = "none";
  for (const p of SAFETY_PATTERNS) {
    if (p.keys.some((k) => text.includes(k))) {
      reasons.push(p.label);
      if (p.severity === "immediate") severity = "immediate";
      else if (severity === "none") severity = "elevated";
    }
  }
  return { triggered: severity === "immediate", severity, reasons };
}

const CATEGORY_KEYWORDS: { cat: LegalCategory; keys: string[] }[] = [
  { cat: "Dowry", keys: ["যৌতুক", "টাকা চাই", "জমি বিক্রি করে", "দাবি কর", "dowry"] },
  { cat: "Dower & Maintenance", keys: ["দেনমোহর", "মোহর", "কাবিন", "ভরণপোষণ", "খোরপোষ", "dower", "maintenance"] },
  { cat: "Unpaid Wages", keys: ["মজুরি", "বেতন", "কাজ করেছি", "ইটভাটা", "শ্রমিক", "মালিক", "wage", "salary"] },
  { cat: "Land Dispute", keys: ["জমি", "দলিল", "পর্চা", "খতিয়ান", "উত্তরাধিকার", "শতাংশ", "land", "inheritance"] },
];

export function classifyRules(text: string): ClassificationResult {
  const hits = CATEGORY_KEYWORDS.map((c) => ({
    cat: c.cat,
    score: c.keys.filter((k) => text.includes(k)).length,
  }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);

  if (hits.length === 0 || text.trim().length < 25) {
    return {
      primary: "Out of scope",
      confidence: text.trim().length < 25 ? 0.25 : 0.35,
      rationale:
        "No indicator for the four supported categories was found in what the client said. Routed to a human rather than forcing a category.",
      outOfScope: true,
    };
  }
  const top = hits[0]!;
  const second = hits[1];
  return {
    primary: top.cat,
    ...(second && second.score > 1 ? { secondary: second.cat } : {}),
    confidence: Math.min(0.9, 0.4 + top.score * 0.15),
    rationale: `Matched ${top.score} lexical indicator(s) for ${top.cat} in the client's own words.`,
  };
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const normaliseDigits = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** Pull plain numbers out of the narrative — digits only, never invented. */
function numbers(text: string): number[] {
  const t = normaliseDigits(text);
  const out: number[] = [];
  for (const m of t.matchAll(/\d[\d,]*/g)) {
    const n = Number(m[0].replace(/,/g, ""));
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

export function extractRules(text: string, cls: ClassificationResult): ExtractionResult {
  const nums = numbers(text);
  const amounts: ExtractionResult["amounts"] = {};

  if (cls.primary === "Unpaid Wages") {
    const days = nums.find((n) => n > 0 && n <= 90);
    const rate = nums.find((n) => n >= 100 && n <= 5000);
    const paid = nums.find((n) => n >= 500 && n !== rate);
    if (days !== undefined) amounts.daysWorked = days;
    if (rate !== undefined) amounts.dailyRate = rate;
    if (paid !== undefined) amounts.wagesPaid = paid;
    if (days !== undefined && rate !== undefined) {
      amounts.wagesTotal = days * rate;
      amounts.outstanding = Math.max(0, days * rate - (paid ?? 0));
    }
  } else {
    const big = nums.filter((n) => n >= 1000).sort((a, b) => b - a);
    if (big[0] !== undefined) amounts.dower = big[0];
    if (big[1] !== undefined) amounts.dowryPaid = big[1];
  }

  const evidence: ExtractionResult["evidence"] = [];
  if (text.includes("কাবিন")) evidence.push({ item: "Kabinnama (marriage contract)" });
  if (text.includes("দলিল")) evidence.push({ item: "Land deed (dolil)" });
  if (text.includes("সাক্ষী")) evidence.push({ item: "Witness(es) named by the client" });
  if (text.includes("আইডি") || text.includes("এনআইডি")) evidence.push({ item: "National ID card" });

  const first = text.trim().split(/[।.\n]/).filter(Boolean);
  return {
    applicants: [{ relationship: "self (person making the statement)" }],
    respondents: [],
    keyDates: [],
    amounts,
    timeline: first.slice(0, 4).map((s) => ({ when: "", what: s.trim() })),
    claimedHarm: first[0]?.trim(),
    currentSituation: first.length > 1 ? first[first.length - 1]!.trim() : undefined,
    evidence,
  };
}

const REQUIRED: Record<string, MissingField[]> = {
  Dowry: [
    { key: "respondent", labelEn: "Who is being complained against", labelBn: "কার বিরুদ্ধে অভিযোগ" },
    { key: "marriageDate", labelEn: "Date of marriage", labelBn: "বিয়ের তারিখ" },
    { key: "dowryPaid", labelEn: "Amount paid as dowry", labelBn: "যৌতুক হিসেবে দেওয়া টাকার পরিমাণ" },
    { key: "evidenceLocation", labelEn: "Where the kabinnama is kept", labelBn: "কাবিননামা কোথায় আছে" },
  ],
  "Dower & Maintenance": [
    { key: "respondent", labelEn: "Who is being complained against", labelBn: "কার বিরুদ্ধে অভিযোগ" },
    { key: "dower", labelEn: "Dower amount in the kabinnama", labelBn: "কাবিননামায় লেখা দেনমোহরের অঙ্ক" },
    { key: "marriageDate", labelEn: "Date of marriage", labelBn: "বিয়ের তারিখ" },
    { key: "dependants", labelEn: "Children or dependants", labelBn: "সন্তান বা নির্ভরশীল কেউ" },
  ],
  "Unpaid Wages": [
    { key: "respondent", labelEn: "Employer's name", labelBn: "মালিকের নাম" },
    { key: "daysWorked", labelEn: "How many days were worked", labelBn: "কত দিন কাজ করেছেন" },
    { key: "dailyRate", labelEn: "Agreed daily rate", labelBn: "দিনে কত টাকা ঠিক হয়েছিল" },
    { key: "wagesPaid", labelEn: "How much has been paid so far", labelBn: "এ পর্যন্ত কত টাকা পেয়েছেন" },
    { key: "evidence", labelEn: "Witnesses or documents", labelBn: "সাক্ষী বা কাগজপত্র" },
  ],
  "Land Dispute": [
    { key: "respondent", labelEn: "Who is holding the land", labelBn: "জমি কার দখলে" },
    { key: "landArea", labelEn: "How much land is in dispute", labelBn: "কত জমি নিয়ে বিরোধ" },
    { key: "evidenceLocation", labelEn: "Where the documents are", labelBn: "দলিল-পর্চা কার কাছে" },
    { key: "saleRisk", labelEn: "Whether the land is being sold", labelBn: "জমি বিক্রির চেষ্টা চলছে কি না" },
  ],
  "Out of scope": [
    { key: "who", labelEn: "Who the other party is", labelBn: "অপর পক্ষ কারা" },
    { key: "what", labelEn: "What the dispute is about", labelBn: "বিষয়টি কী নিয়ে" },
    { key: "howLong", labelEn: "How long it has been going on", labelBn: "কতদিন ধরে চলছে" },
  ],
};

export function detectMissing(
  cls: ClassificationResult,
  ex: ExtractionResult,
  answers: Record<string, string>,
): MissingField[] {
  const req = REQUIRED[cls.primary] ?? REQUIRED["Out of scope"]!;
  const has = (key: string): boolean => {
    if (answers[key] !== undefined) return true;
    switch (key) {
      case "respondent":
        return ex.respondents.length > 0;
      case "marriageDate":
        return ex.keyDates.some((d) => /marriage|বিয়ে/i.test(d.label));
      case "dower":
        return ex.amounts.dower !== undefined;
      case "dowryPaid":
        return ex.amounts.dowryPaid !== undefined;
      case "daysWorked":
        return ex.amounts.daysWorked !== undefined;
      case "dailyRate":
        return ex.amounts.dailyRate !== undefined;
      case "wagesPaid":
        return ex.amounts.wagesPaid !== undefined;
      case "dependants":
        return ex.dependants !== undefined;
      case "evidence":
        return ex.evidence.length > 0;
      case "evidenceLocation":
        return ex.evidence.some((e) => e.location !== undefined);
      default:
        return false;
    }
  };
  return req.filter((f) => !has(f.key));
}

export function analyseWithRules(
  transcript: string,
  answers: Record<string, string> = {},
  note?: string,
): AnalysisResult {
  const joined = [transcript, ...Object.values(answers)].join(" \n ");
  const safety = detectSafetyRules(joined);
  const classification = classifyRules(joined);
  const extraction = extractRules(joined, classification);
  return {
    engine: "heuristic",
    engineNote: note ?? "Rule-based development fallback (no AI service response).",
    safety,
    classification,
    extraction,
    missing: detectMissing(classification, extraction, answers),
  };
}
