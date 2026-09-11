"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SCENARIOS, type Scenario } from "@/lib/odhikar/fixtures";
import { analysisService } from "@/lib/odhikar/services/analysis";
import { buildCaseRecord } from "@/lib/odhikar/services/caseBuilder";
import { nextQuestion } from "@/lib/odhikar/services/questions";
import { generateCaseId } from "@/lib/odhikar/repository";
import type { AnalysisResult } from "@/lib/odhikar/services/types";


interface RunState {
  loading: boolean;
  result?: AnalysisResult;
  caseId?: string;
  nextQ?: string;
}

export default function Lab() {
  const [runs, setRuns] = useState<Record<string, RunState>>({});

  const run = async (s: Scenario) => {
    setRuns((r) => ({ ...r, [s.id]: { loading: true } }));
    const analysis = await analysisService.analyse({ transcript: s.transcriptBn });
    const id = generateCaseId();
    const record = buildCaseRecord({
      id,
      transcript: s.transcriptBn,
      analysis,
      answers: {},
      audioDurationSec: s.audioDurationSec,
      transcriptSource: "fixture",
    });
    const q = nextQuestion(analysis.missing, {});
    setRuns((r) => ({
      ...r,
      [s.id]: { loading: false, result: analysis, caseId: id, ...(q ? { nextQ: q.en } : {}) },
    }));
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
          <FlaskConical className="size-5" />
          <div>
            <div className="text-base font-semibold tracking-tight">Test Scenario Lab</div>
            <div className="text-xs text-primary-foreground/70">
              Developer / demo validation only — synthetic narratives, never used by client intake
            </div>
          </div>
          <div className="ml-auto flex gap-4 text-sm">
            <Link href="/" className="opacity-80 hover:opacity-100">
              Home
            </Link>
            <Link href="/paralegal" className="opacity-80 hover:opacity-100">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Run a seeded narrative</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Each run feeds the fixture transcript into the same safety, extraction and classification
           services that ordinary client intake uses. Lab runs stay isolated and never enter the
           staff queue. Nothing here shortcuts the analysis pipeline.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SCENARIOS.map((s) => {
            const st = runs[s.id];
            const r = st?.result;
            return (
              <div key={s.id} className="surface-panel flex flex-col p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Scenario {s.letter}</Badge>
                  {r?.safety.triggered ? (
                    <Badge className="gap-1 bg-urgent text-urgent-foreground hover:bg-urgent">
                      <ShieldAlert className="size-3" /> Safety
                    </Badge>
                  ) : null}
                  {r ? (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {r.engine}
                    </Badge>
                  ) : null}
                </div>
                <h2 className="bn mt-3 text-base font-semibold">{s.titleBn}</h2>
                <p className="text-sm text-muted-foreground">{s.titleEn}</p>
                <p className="bn mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {s.transcriptBn}
                </p>

                <div className="mt-4 space-y-1.5 text-xs">
                  <Chip ok={Boolean(r)} label="Transcript accepted" />
                  <Chip
                    ok={Boolean(r && !r.classification.outOfScope)}
                    label={r ? `Category: ${r.classification.primary} (${Math.round(r.classification.confidence * 100)}%)` : "Category"}
                    neutral={Boolean(r?.classification.outOfScope)}
                  />
                  <Chip
                    ok={Boolean(r && (r.extraction.respondents.length > 0 || Object.keys(r.extraction.amounts).length > 0))}
                    label={r ? `${r.extraction.respondents.length} respondent(s), ${Object.keys(r.extraction.amounts).length} amount(s)` : "Fields extracted"}
                  />
                  <Chip
                    ok={Boolean(r)}
                    label={r ? (r.safety.triggered ? `Safety escalation: ${r.safety.reasons.join(", ")}` : "No safety trigger") : "Safety check"}
                  />
                  {st?.nextQ ? (
                    <div className="rounded-md bg-secondary/70 px-2 py-1.5 text-muted-foreground">
                      Next question: {st.nextQ}
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto flex gap-2 pt-5">
                  <Button size="sm" onClick={() => void run(s)} disabled={st?.loading}>
                    {st?.loading ? <Loader2 className="size-4 animate-spin" /> : null}
                    {st?.result ? "Run again" : "Run analysis"}
                  </Button>
                  {st?.caseId ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/paralegal/$caseId" params={{ caseId: st.caseId }}>
                        Open case
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Chip({ ok, label, neutral }: { ok: boolean; label: string; neutral?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      {neutral ? (
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-draft" />
      ) : ok ? (
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-shared" />
      ) : (
        <XCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className={ok || neutral ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
