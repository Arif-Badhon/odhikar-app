// Reviewed, per-category complaint templates. No free-form legal generation.
import { fmtBDT } from "./engine";
import type { CaseRecord, Field } from "./types";

const P = (label: string) => `[${label} — not established]`;

function val(f?: Field<string | number>, placeholder = "not established"): string {
  if (!f || f.value === undefined || f.provenance === "unknown") return P(placeholder);
  return typeof f.value === "number" ? fmtBDT(f.value) : String(f.value);
}

function partyLine(c: CaseRecord, role: "applicants" | "respondents"): string {
  const list = c[role];
  if (!list.length) return P("Party details");
  return list
    .map((p, i) => {
      const name = p.name.value ?? P("Name");
      const rel = p.relationship.value ?? P("Relationship");
      return `${i + 1}. ${name} — ${rel}`;
    })
    .join("\n");
}

function timelineBlock(c: CaseRecord): string {
  if (!c.timeline.length) return P("Chronology of events");
  return c.timeline.map((t) => `• ${t.when.value ?? P("Date")} — ${t.what}`).join("\n");
}

function evidenceBlock(c: CaseRecord): string {
  if (!c.evidence.length) return P("Evidence");
  return c.evidence
    .map((e) => `• ${e.item.value ?? P("Item")} (location: ${e.location.value ?? P("Location")})`)
    .join("\n");
}

export function buildComplaintDraft(c: CaseRecord): string {
  const header = `IN THE MATTER OF A LEGAL AID APPLICATION
Case reference: ${c.id}
Category: ${c.classification.primary}${c.classification.secondary ? ` + ${c.classification.secondary}` : ""}
Prepared by: Odhikar automated intake (template ${templateId(c)})

APPLICANT(S)
${partyLine(c, "applicants")}
Address: ${P("Applicant address")}

RESPONDENT(S)
${partyLine(c, "respondents")}
Address: ${P("Respondent address")}
`;

  const body = categoryBody(c);

  const footer = `
CHRONOLOGY OF EVENTS
${timelineBlock(c)}

EVIDENCE RELIED UPON
${evidenceBlock(c)}

PREVIOUS ATTEMPTS AT RECOVERY / RESOLUTION
${val(c.previousActions, "Previous attempts")}

RELIEF SOUGHT
The applicant seeks the assistance of the legal aid clinic in recovering the amounts and
entitlements set out above and, where appropriate, in mediation or the filing of a formal
complaint before the competent authority.

Signature of applicant: ${P("Signature")}
Date: ${P("Date of signing")}
Verified by paralegal: ${P("Paralegal name")}
`;

  return `${header}${body}${footer}`;
}

function templateId(c: CaseRecord): string {
  switch (c.classification.primary) {
    case "Dowry":
      return "TPL-DOWRY-v3";
    case "Dower & Maintenance":
      return "TPL-DOWER-v4";
    case "Unpaid Wages":
      return "TPL-WAGES-v2";
    case "Land Dispute":
      return "TPL-LAND-v2";
    default:
      return "TPL-REFERRAL-v1";
  }
}

function categoryBody(c: CaseRecord): string {
  const a = c.amounts;
  switch (c.classification.primary) {
    case "Dowry":
    case "Dower & Maintenance":
      return `
STATEMENT OF FACTS
1. The marriage between the applicant and respondent no. 1 was solemnised on ${val(
        c.keyDates.find((d) => d.label.toLowerCase().includes("marriage"))?.value,
        "Date of marriage",
      )} at ${P("Place of marriage")}.
2. The dower (denmohor) recorded in the kabinnama is ${val(a.dower, "Dower amount")}, of which
   ${val(a.outstanding, "Outstanding dower")} remains unpaid.
3. Following the marriage, the respondent(s) made repeated demands for money from the applicant's
   family. An amount of ${val(a.dowryPaid, "Amount paid as dowry")} was paid.
4. The applicant states: ${val(c.claimedHarm, "Claimed harm")}.
5. Present situation: ${val(c.currentSituation, "Current situation")}.
6. Children / dependants: ${val(c.dependants, "Children or dependants")}.
`;
    case "Unpaid Wages":
      return `
STATEMENT OF FACTS
1. The applicant was engaged by the respondent as a day labourer at ${P("Workplace address")}.
2. The agreed rate of wages was ${P("Agreed daily rate confirmed in writing")}; the total wages
   earned amount to ${val(a.wagesTotal, "Total wages")} (calculated from the days worked).
3. The respondent has paid ${val(a.wagesPaid, "Amount paid")}, leaving ${val(
        a.outstanding,
        "Outstanding wages",
      )} outstanding.
4. The applicant states: ${val(c.claimedHarm, "Claimed harm")}.
5. Present situation: ${val(c.currentSituation, "Current situation")}.
`;
    case "Land Dispute":
      return `
STATEMENT OF FACTS
1. The applicant claims an inheritance share in land situated at ${P("Mouza / dag number")}.
2. The land in dispute measures ${P("Area confirmed from records")}.
3. The respondent(s) have taken possession and hold the title documents.
4. The applicant states: ${val(c.claimedHarm, "Claimed harm")}.
5. Present situation: ${val(c.currentSituation, "Current situation")}.
`;
    default:
      return `
STATEMENT OF FACTS
1. The matter described by the applicant does not fall within the four categories handled by the
   automated intake service. No complaint has been drafted.
2. Summary of what the applicant described: ${val(c.claimedHarm, "Described issue")}.
3. This record is referred to a paralegal for human assessment.
`;
  }
}
