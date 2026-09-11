// Maps an AnalysisResult onto the structured CaseRecord, attaching provenance.
import { calc, ex, inf, unk, type CaseRecord, type Field, type Party } from "../types";
import type { AnalysisResult } from "./types";

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

const party = (
  role: Party["role"],
  p: { name?: string | undefined; relationship?: string | undefined },
): Party => ({
  id: uid(role),
  role,
  name: p.name ? ex(p.name) : unk<string>("Name not stated by the client"),
  relationship: p.relationship ? ex(p.relationship) : unk<string>("Relationship not stated"),
});

const num = (v: number | undefined, calculated = false): Field<number> | undefined =>
  v === undefined ? undefined : calculated ? calc(v, "Derived by arithmetic from stated values") : ex(v);

export interface BuildInput {
  id: string;
  transcript: string;
  analysis: AnalysisResult;
  answers: Record<string, string>;
  audioDurationSec: number;
  audioDataUrl?: string | undefined;
  transcriptSource: "speech-to-text" | "typed" | "fixture";
}

export function buildCaseRecord(input: BuildInput): CaseRecord {
  const { analysis: a } = input;
  const amt = a.extraction.amounts;
  const computedOutstanding =
    amt.outstanding ??
    (amt.daysWorked !== undefined && amt.dailyRate !== undefined
      ? amt.daysWorked * amt.dailyRate - (amt.wagesPaid ?? 0)
      : undefined);
  const computedTotal =
    amt.wagesTotal ??
    (amt.daysWorked !== undefined && amt.dailyRate !== undefined
      ? amt.daysWorked * amt.dailyRate
      : undefined);

  const urgency = a.safety.triggered
    ? "Urgent"
    : a.safety.severity === "elevated" || a.classification.primary === "Land Dispute"
      ? "Time-sensitive"
      : "Normal";

  return {
    id: input.id,
    createdAt: new Date().toISOString(),
    receivedLabel: "just now",
    status: "New",
    urgency,
    classification: a.classification,
    applicants:
      a.extraction.applicants.length > 0
        ? a.extraction.applicants.map((p) => party("applicant", p ?? {}))
        : [party("applicant", { relationship: "self (person making the statement)" })],
    respondents: a.extraction.respondents.map((p) => party("respondent", p ?? {})),
    keyDates: (a.extraction.keyDates ?? []).filter((d) => d?.label && d?.value).map((d) => ({
      id: uid("date"),
      label: d.label,
      value: d.inferred ? inf(d.value, "Inferred from a relative reference") : ex(d.value),
    })),
    amounts: {
      ...(num(amt.dower) ? { dower: num(amt.dower)! } : {}),
      ...(num(amt.dowryPaid) ? { dowryPaid: num(amt.dowryPaid)! } : {}),
      ...(computedTotal !== undefined
        ? { wagesTotal: num(computedTotal, amt.wagesTotal === undefined)! }
        : {}),
      ...(num(amt.wagesPaid) ? { wagesPaid: num(amt.wagesPaid)! } : {}),
      ...(computedOutstanding !== undefined
        ? { outstanding: num(computedOutstanding, amt.outstanding === undefined)! }
        : {}),
    },
    timeline: (a.extraction.timeline ?? []).filter((t) => t?.what).map((t) => ({
      id: uid("tl"),
      when: t.when ? (t.inferred ? inf(t.when) : ex(t.when)) : unk<string>("Date not stated"),
      what: t.what,
    })),
    claimedHarm: a.extraction.claimedHarm
      ? ex(a.extraction.claimedHarm)
      : unk<string>("Not clearly stated"),
    currentSituation: a.extraction.currentSituation
      ? ex(a.extraction.currentSituation)
      : unk<string>("Not clearly stated"),
    dependants: a.extraction.dependants
      ? ex(a.extraction.dependants)
      : unk<string>("Not established during intake"),
    evidence: (a.extraction.evidence ?? []).filter((v) => v?.item).map((v) => ({
      id: uid("ev"),
      item: ex(v.item),
      location: v.location ? ex(v.location) : unk<string>("Location not established"),
    })),
    previousActions: a.extraction.previousActions
      ? ex(a.extraction.previousActions)
      : unk<string>("No previous attempt described"),
    safetyFlag: a.safety.triggered,
    ...(a.safety.reasons.length
      ? {
          safetyNote: `Safety indicators detected during intake: ${a.safety.reasons.join(", ")}. The automated flow was stopped.`,
        }
      : {}),
    missing: (a.missing ?? []).filter((m) => m?.labelEn).map((m) => m.labelEn),
    transcriptBn: input.transcript,
    audioRef: input.audioDataUrl ? "browser recording (this session)" : "no audio — typed intake",
    audioDurationSec: input.audioDurationSec,
    ...(input.audioDataUrl ? { audioDataUrl: input.audioDataUrl } : {}),
    analysisEngine: a.engine,
    ...(a.engineNote ? { analysisNote: a.engineNote } : {}),
    transcriptSource: input.transcriptSource,
    answers: input.answers,
  };
}
