// Simulated AI layer: safety detection, keyword classification and field extraction.
// Deterministic and offline — no model calls. Scenario fixtures drive the demo.
import { SCENARIOS, getScenario, type Scenario } from "./fixtures";
import type { CaseRecord, Classification, LegalCategory } from "./types";

export const CONFIDENCE_THRESHOLD = 0.6;

const SAFETY_PATTERNS: { bn: string[]; label: string }[] = [
  { bn: ["মারধর", "মেরেছে", "মারে", "হাত তুলেছে", "আঘাত"], label: "physical violence" },
  { bn: ["বাঁচব না", "মেরে ফেলবে", "খুন", "জানে মেরে"], label: "threat to life" },
  { bn: ["ডাক্তারের কাছে যেতে দেয়নি", "চিকিৎসা করতে দেয়নি"], label: "denial of medical care" },
  { bn: ["আটকে রেখেছে", "বের হতে দেয় না"], label: "confinement" },
];

export interface SafetySignal {
  triggered: boolean;
  reasons: string[];
}

export function detectSafety(text: string): SafetySignal {
  const reasons: string[] = [];
  for (const p of SAFETY_PATTERNS) {
    if (p.bn.some((k) => text.includes(k))) reasons.push(p.label);
  }
  return { triggered: reasons.length > 0, reasons };
}

const CATEGORY_KEYWORDS: { cat: LegalCategory; keys: string[] }[] = [
  { cat: "Dowry", keys: ["যৌতুক", "টাকা চাইতে", "জমি বিক্রি করে", "dowry"] },
  { cat: "Dower & Maintenance", keys: ["দেনমোহর", "কাবিন", "ভরণপোষণ", "dower"] },
  { cat: "Unpaid Wages", keys: ["মজুরি", "বেতন", "কাজ করেছি", "ইটভাটা", "wages"] },
  { cat: "Land Dispute", keys: ["জমি", "দলিল", "পর্চা", "উত্তরাধিকার", "land"] },
];

export function classify(text: string): Classification {
  const hits = CATEGORY_KEYWORDS.map((c) => ({
    cat: c.cat,
    score: c.keys.filter((k) => text.includes(k)).length,
  }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);

  if (hits.length === 0) {
    return {
      primary: "Out of scope",
      confidence: 0.3,
      rationale:
        "The narrative does not match any of the four supported categories. Routed to a human instead of forcing a category.",
      outOfScope: true,
    };
  }
  const top = hits[0]!;
  const confidence = Math.min(0.95, 0.45 + top.score * 0.18);
  const second = hits[1];
  return {
    primary: top.cat,
    ...(second && second.score > 1 ? { secondary: second.cat } : {}),
    confidence,
    rationale: `Matched ${top.score} indicator(s) for ${top.cat} in the narrative.`,
  };
}

let counter = 420;
export function nextCaseId(): string {
  counter += 1;
  return `ODH-2026-0${counter}`;
}

/** Simulated end-to-end analysis of an intake, built from a seeded scenario. */
export function analyseScenario(scenarioId: string, caseId: string): CaseRecord {
  const scenario = getScenario(scenarioId) ?? SCENARIOS[0]!;
  return scenario.build(caseId);
}

/** Best-effort scenario match for a freely typed narrative (text fallback path). */
export function matchScenario(text: string): Scenario {
  const cls = classify(text);
  const byCat: Record<string, string> = {
    Dowry: "A",
    "Dower & Maintenance": "A",
    "Unpaid Wages": "B",
    "Land Dispute": "F",
    "Out of scope": "D",
  };
  if (detectSafety(text).triggered) return getScenario("C")!;
  if (text.trim().length < 60) return getScenario("E")!;
  return getScenario(byCat[cls.primary] ?? "E")!;
}

export const fmtBDT = (n?: number | null) =>
  typeof n === "number" && Number.isFinite(n) ? `BDT ${n.toLocaleString("en-US")}` : "";
