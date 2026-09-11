// Client-side facade over the analysis boundary: Lovable AI first, transparent
// rule-based fallback second. Never fixture matching.
import { analyseNarrative, transcribeAudio } from "../ai.functions";
import { analyseWithRules, detectMissing, detectSafetyRules } from "./heuristics";
import type {
  AIAnalysisService,
  AnalysisResult,
  ClassificationResult,
  ExtractionResult,
  MissingField,
  SafetyResult,
  TranscriptionService,
} from "./types";
import type { LegalCategory } from "../types";

const CATEGORIES: LegalCategory[] = [
  "Dower & Maintenance",
  "Dowry",
  "Land Dispute",
  "Unpaid Wages",
  "Out of scope",
];

const asCategory = (v: unknown): LegalCategory =>
  CATEGORIES.includes(v as LegalCategory) ? (v as LegalCategory) : "Out of scope";

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Could not read the recording"));
    fr.onload = () => resolve(String(fr.result).split(",")[1] ?? "");
    fr.readAsDataURL(blob);
  });

export const transcriptionService: TranscriptionService = {
  async transcribe(blob) {
    try {
      const base64 = await blobToBase64(blob);
      return await transcribeAudio({ data: { base64, mimeType: blob.type || "audio/webm" } });
    } catch (e) {
      return { ok: false, reason: String(e), provider: "lovable-ai" };
    }
  },
};

export const analysisService: AIAnalysisService = {
  async analyse({ transcript, answers = {} }): Promise<AnalysisResult> {
    try {
      const res = await analyseNarrative({ data: { transcript, answers } });
      if (!res.ok) return analyseWithRules(transcript, answers, res.reason);

      const classification: ClassificationResult = {
        primary: asCategory(res.classification?.primary),
        ...(res.classification?.secondary
          ? { secondary: asCategory(res.classification.secondary) }
          : {}),
        confidence: Number(res.classification?.confidence ?? 0.5),
        rationale: res.classification?.rationale ?? "Classified from the client's narrative.",
        ...(res.classification?.outOfScope ? { outOfScope: true } : {}),
      };

      const e = res.extraction ?? ({} as ExtractionResult);
      // The model may emit explicit nulls for values it could not ground.
      const cleanAmounts = Object.fromEntries(
        Object.entries(e.amounts ?? {}).filter(
          ([, v]) => typeof v === "number" && Number.isFinite(v),
        ),
      );
      const extraction: ExtractionResult = {
        applicants: (e.applicants ?? []).filter(Boolean),
        respondents: (e.respondents ?? []).filter(Boolean),
        keyDates: e.keyDates ?? [],
        amounts: cleanAmounts,
        timeline: e.timeline ?? [],
        evidence: e.evidence ?? [],
        claimedHarm: e.claimedHarm ?? undefined,
        currentSituation: e.currentSituation ?? undefined,
        dependants: e.dependants ?? undefined,
        previousActions: e.previousActions ?? undefined,
      };

      // Never trust the model alone on safety: rules run on every turn too.
      const rules = detectSafetyRules([transcript, ...Object.values(answers)].join(" \n "));
      const safety: SafetyResult = {
        triggered: Boolean(res.safety?.triggered) || rules.triggered,
        severity:
          res.safety?.severity === "immediate" || rules.severity === "immediate"
            ? "immediate"
            : res.safety?.severity === "elevated" || rules.severity === "elevated"
              ? "elevated"
              : "none",
        reasons: Array.from(new Set([...(res.safety?.reasons ?? []), ...rules.reasons])),
      };

      const missing: MissingField[] =
        res.missing && res.missing.length > 0
          ? res.missing.filter((m) => m?.key && m?.labelEn && m?.labelBn)
          : detectMissing(classification, extraction, answers);

      return { engine: "lovable-ai", safety, classification, extraction, missing };
    } catch (err) {
      return analyseWithRules(transcript, answers, `Analysis service error: ${String(err)}`);
    }
  },
};
