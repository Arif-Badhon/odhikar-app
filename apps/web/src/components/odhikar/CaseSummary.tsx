import { AlertTriangle, HelpCircle } from "lucide-react";
import { FieldValue, ProvenanceBadge } from "./FieldValue";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { fmtBDT } from "@/lib/odhikar/engine";
import { CATEGORY_BN, type CaseRecord } from "@/lib/odhikar/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function CaseSummary({
  record,
  editable = false,
  onChange,
}: {
  record: CaseRecord;
  editable?: boolean;
  onChange?: (c: CaseRecord) => void;
}) {
  const c = record;
  const edit = (patch: Partial<CaseRecord>) => onChange?.({ ...c, ...patch });

  return (
    <div className="surface-panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Case ID</div>
          <div className="text-xl font-semibold tracking-tight">{c.id}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {c.safetyFlag ? (
            <Badge className="bg-urgent text-urgent-foreground hover:bg-urgent">URGENT — SAFETY</Badge>
          ) : c.urgency === "Time-sensitive" ? (
            <Badge className="bg-draft text-draft-foreground hover:bg-draft">Time-sensitive</Badge>
          ) : null}
          <Badge variant="secondary">{c.status}</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-secondary/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            {c.classification.primary}
          </Badge>
          {c.classification.secondary ? (
            <Badge variant="outline">+ {c.classification.secondary}</Badge>
          ) : null}
          <span className="bn text-sm text-muted-foreground">
            {CATEGORY_BN[c.classification.primary]}
          </span>
          <span className="ml-auto text-xs font-semibold text-muted-foreground">
            Confidence {(c.classification.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{c.classification.rationale}</p>
      </div>

      <div className="mt-4 grid gap-x-8 md:grid-cols-2">
        <div>
          <Section title="Applicant(s)">
            {c.applicants.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center text-sm">
                <span className={p.name.value ? "" : "italic text-muted-foreground"}>
                  {p.name.value ?? "— name not established —"}
                </span>
                <ProvenanceBadge p={p.name.provenance} note={p.name.note ?? ""} />
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-muted-foreground">{p.relationship.value ?? "—"}</span>
              </div>
            ))}
          </Section>

          <Section title="Respondent(s)">
            {c.respondents.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center text-sm">
                <span className={p.name.value ? "" : "italic text-muted-foreground"}>
                  {p.name.value ?? "— name not established —"}
                </span>
                <ProvenanceBadge p={p.name.provenance} note={p.name.note ?? ""} />
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-muted-foreground">{p.relationship.value ?? "—"}</span>
                {p.detail?.value ? (
                  <span className="ml-2 text-xs text-muted-foreground">({p.detail.value})</span>
                ) : null}
              </div>
            ))}
          </Section>

          <Section title="Key dates">
            {c.keyDates.map((d) => (
              <FieldValue key={d.id} label={d.label} field={d.value} />
            ))}
          </Section>

          <Section title="Amounts">
            <FieldValue label="Dower (denmohor)" field={c.amounts.dower} format={(v) => fmtBDT(Number(v))} />
            <FieldValue label="Dowry paid" field={c.amounts.dowryPaid} format={(v) => fmtBDT(Number(v))} />
            <FieldValue label="Wages earned" field={c.amounts.wagesTotal} format={(v) => fmtBDT(Number(v))} />
            <FieldValue label="Wages paid" field={c.amounts.wagesPaid} format={(v) => fmtBDT(Number(v))} />
            <FieldValue label="Outstanding" field={c.amounts.outstanding} format={(v) => fmtBDT(Number(v))} />
          </Section>
        </div>

        <div>
          <Section title="Chronology">
            {c.timeline.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No chronology could be built.</p>
            ) : (
              <ol className="space-y-2">
                {c.timeline.map((t) => (
                  <li key={t.id} className="flex gap-3 text-sm">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <span className="font-medium">{t.when.value ?? "Date unknown"}</span>
                      <ProvenanceBadge p={t.when.provenance} note={t.when.note ?? ""} />
                      <span className="block text-muted-foreground">{t.what}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <Section title="Claimed harm & current situation">
            {editable ? (
              <>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Claimed harm
                </label>
                <Textarea
                  className="mt-1"
                  value={c.claimedHarm.value ?? ""}
                  onChange={(e) =>
                    edit({ claimedHarm: { provenance: "explicit", value: e.target.value } })
                  }
                />
                <label className="mt-3 block text-xs uppercase tracking-wide text-muted-foreground">
                  Current situation
                </label>
                <Textarea
                  className="mt-1"
                  value={c.currentSituation.value ?? ""}
                  onChange={(e) =>
                    edit({ currentSituation: { provenance: "explicit", value: e.target.value } })
                  }
                />
              </>
            ) : (
              <>
                <FieldValue label="Claimed harm" field={c.claimedHarm} />
                <FieldValue label="Current situation" field={c.currentSituation} />
              </>
            )}
            <FieldValue label="Children / dependants" field={c.dependants} />
          </Section>

          <Section title="Evidence">
            {c.evidence.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No evidence identified.</p>
            ) : (
              <ul className="space-y-1.5">
                {c.evidence.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span>{e.item.value}</span>
                    <ProvenanceBadge p={e.item.provenance} note={e.item.note ?? ""} />
                    <span className="block text-xs text-muted-foreground">
                      Location: {e.location.value ?? "not established"}
                      {e.location.provenance === "unknown" ? " (unknown)" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <FieldValue label="Previous attempts" field={c.previousActions} />
          </Section>

          <Section title="Gaps the system could not fill">
            {c.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outstanding gaps.</p>
            ) : (
              <ul className="space-y-1.5">
                {c.missing.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-foreground">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-draft" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>

      {c.safetyFlag ? (
        <div className="mt-2 flex items-start gap-3 rounded-xl border border-urgent/30 bg-urgent-soft p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-urgent" />
          <div>
            <div className="text-sm font-semibold text-urgent">Safety flag raised</div>
            <p className="text-sm text-foreground/80">{c.safetyNote}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
