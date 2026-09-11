// Service boundary types for Odhikar. UI depends on these interfaces, never on
// a concrete adapter (Lovable AI, heuristics, localStorage, future backend).
import type { CaseRecord, LegalCategory } from "../types";

export type SafetySeverity = "none" | "elevated" | "immediate";

export interface SafetyResult {
  triggered: boolean;
  severity: SafetySeverity;
  reasons: string[];
}

export interface ExtractedParty {
  name?: string | undefined;
  relationship?: string | undefined;
  detail?: string | undefined;
}

export interface ExtractedAmounts {
  dower?: number | undefined;
  dowryPaid?: number | undefined;
  wagesTotal?: number | undefined;
  wagesPaid?: number | undefined;
  dailyRate?: number | undefined;
  daysWorked?: number | undefined;
  outstanding?: number | undefined;
}

export interface ExtractionResult {
  applicants: ExtractedParty[];
  respondents: ExtractedParty[];
  keyDates: { label: string; value: string; inferred?: boolean | undefined }[];
  amounts: ExtractedAmounts;
  timeline: { when: string; what: string; inferred?: boolean | undefined }[];
  claimedHarm?: string | undefined;
  currentSituation?: string | undefined;
  dependants?: string | undefined;
  evidence: { item: string; location?: string | undefined }[];
  previousActions?: string | undefined;
}

export interface ClassificationResult {
  primary: LegalCategory;
  secondary?: LegalCategory | undefined;
  confidence: number;
  rationale: string;
  outOfScope?: boolean | undefined;
}

export interface MissingField {
  key: string;
  labelEn: string;
  labelBn: string;
}

export interface FollowUpQuestion {
  id: string;
  field: string;
  bn: string;
  en: string;
  options?: { bn: string; en: string; value: string }[] | undefined;
}

export type AnalysisEngine = "lovable-ai" | "heuristic";

export interface AnalysisResult {
  engine: AnalysisEngine;
  engineNote?: string | undefined;
  safety: SafetyResult;
  extraction: ExtractionResult;
  classification: ClassificationResult;
  missing: MissingField[];
}

/** Turns spoken audio into text. */
export interface TranscriptionService {
  transcribe: (
    blob: Blob,
  ) => Promise<
    { ok: true; text: string; provider: string } | { ok: false; reason: string; provider: string }
  >;
}

/** Interprets an arbitrary narrative (plus any follow-up answers so far). */
export interface AIAnalysisService {
  analyse: (input: { transcript: string; answers?: Record<string, string> }) => Promise<AnalysisResult>;
}

/** Persistence boundary — swap localStorage for a database without UI changes. */
export interface CaseRepository {
  list: () => Promise<CaseRecord[]>;
  get: (id: string) => Promise<CaseRecord | undefined>;
  save: (record: CaseRecord) => Promise<CaseRecord>;
  reset: () => Promise<CaseRecord[]>;
}
