// Core domain types for Odhikar — AI Paralegal prototype (synthetic data only).

export type Provenance = "explicit" | "inferred" | "calculated" | "unknown";

export interface Field<T = string> {
  value?: T | undefined;
  provenance: Provenance;
  note?: string | undefined;
}

export const ex = <T,>(value: T, note?: string): Field<T> => ({
  value,
  provenance: "explicit",
  note,
});
export const inf = <T,>(value: T, note?: string): Field<T> => ({
  value,
  provenance: "inferred",
  note,
});
export const calc = <T,>(value: T, note?: string): Field<T> => ({
  value,
  provenance: "calculated",
  note,
});
export const unk = <T,>(note?: string): Field<T> => ({ provenance: "unknown", note });

export type PartyRole = "applicant" | "respondent";

export interface Party {
  id: string;
  role: PartyRole;
  name: Field;
  relationship: Field;
  detail?: Field;
}

export interface EvidenceItem {
  id: string;
  item: Field;
  location: Field;
}

export interface TimelineEntry {
  id: string;
  when: Field;
  what: string;
}

export type LegalCategory =
  | "Dower & Maintenance"
  | "Dowry"
  | "Land Dispute"
  | "Unpaid Wages"
  | "Cyber Crime Report"
  | "Crime Report"
  | "Out of scope";

export const CATEGORY_BN: Record<LegalCategory, string> = {
  "Dower & Maintenance": "দেনমোহর ও ভরণপোষণ",
  Dowry: "যৌতুক",
  "Land Dispute": "জমি-জমা বিরোধ",
  "Unpaid Wages": "বকেয়া মজুরি",
  "Cyber Crime Report": "সাইবার অপরাধ রিপোর্ট",
  "Crime Report": "অপরাধ রিপোর্ট",
  "Out of scope": "সহায়তার আওতার বাইরে",
};

export interface Classification {
  primary: LegalCategory;
  secondary?: LegalCategory | undefined;
  confidence: number; // 0..1
  rationale: string;
  outOfScope?: boolean | undefined;
}

export interface Amounts {
  dower?: Field<number>;
  dowryPaid?: Field<number>;
  wagesTotal?: Field<number>;
  wagesPaid?: Field<number>;
  outstanding?: Field<number>;
}

export type CaseStatus = "New" | "Assigned" | "Booked" | "Closed";
export type Urgency = "Urgent" | "Time-sensitive" | "Normal";

export interface FollowUpQuestion {
  id: string;
  field: string;
  bn: string;
  en: string;
  options?: { bn: string; en: string; value: string }[];
}

export interface Appointment {
  id: string;
  clinicId: string;
  dateLabelBn: string;
  dateLabelEn: string;
  time: string;
  taken?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  nameBn: string;
  address: string;
  addressBn: string;
  phone: string;
  distanceKm: number;
}

export interface CaseRecord {
  id: string;
  createdAt: string;
  receivedLabel: string;
  status: CaseStatus;
  urgency: Urgency;
  classification: Classification;
  applicants: Party[];
  respondents: Party[];
  keyDates: { id: string; label: string; value: Field }[];
  amounts: Amounts;
  timeline: TimelineEntry[];
  claimedHarm: Field;
  currentSituation: Field;
  dependants: Field;
  evidence: EvidenceItem[];
  previousActions: Field;
  safetyFlag: boolean;
  safetyNote?: string;
  missing: string[];
  transcriptBn: string;
  transcriptEn?: string;
  audioRef: string;
  audioDurationSec: number;
  /** Real recorded audio captured in the browser (data URL), when available. */
  audioDataUrl?: string | undefined;
  /** Which analysis engine produced this record. */
  analysisEngine?: string | undefined;
  analysisNote?: string | undefined;
  transcriptSource?: "speech-to-text" | "typed" | "fixture" | undefined;
  draftApproved?: boolean;
  draftEdited?: string;
  generatedReport?: string;
  appointment?: { clinicId: string; slotId: string; label: string };
  scenarioId?: string;
  answers?: Record<string, string>;
  /** Present when the case came from the crime / witness reporting path. */
  report?: import("./report").ReportDetails;
}
