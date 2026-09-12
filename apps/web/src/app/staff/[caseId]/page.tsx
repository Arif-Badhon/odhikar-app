"use client";

import { use } from "react";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarClock, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseSummary } from "@/components/odhikar/CaseSummary";
import { ComplaintDraft } from "@/components/odhikar/ComplaintDraft";
import { AudioPlayer } from "@/components/odhikar/AudioPlayer";
import { useCaseStore } from "@/lib/odhikar/store";
import { CLINICS } from "@/lib/odhikar/fixtures";
import type { CaseRecord } from "@/lib/odhikar/types";


export default function CaseDetail({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const { getCase, upsert, loading } = useCaseStore();
  const record = getCase(caseId);

  if (loading && !record)
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-semibold">Loading secure case records...</h1>
      </main>
    );

  if (!record)
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-semibold">Case {caseId} not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been reset. Return to the queue.
        </p>
        <Button asChild className="mt-6">
          <Link href="/staff/cases">Back to queue</Link>
        </Button>
      </main>
    );

  const save = (c: CaseRecord) => upsert(c);
  const clinic = record.appointment
    ? CLINICS.find((c) => c.id === record.appointment!.clinicId)
    : undefined;

  return (
    <main className="mx-auto max-w-7xl px-5 py-6">
      <Link href="/staff/cases"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Case queue
      </Link>

      {record.safetyFlag ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-urgent bg-urgent-soft p-4">
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-urgent" />
          <div>
            <div className="font-semibold text-urgent">
              URGENT — safety indicators disclosed during intake
            </div>
            <p className="text-sm text-foreground/80">{record.safetyNote}</p>
            <p className="mt-1 text-sm font-medium">
              Client was shown the national helpline 16430 and the automated flow was stopped.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <CaseSummary record={record} editable onChange={save} />
          
          {record.generatedReport && (
            <div className="surface-panel p-5 border-l-4 border-l-primary">
              <h2 className="text-sm font-semibold mb-3">AI Paralegal Report</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {record.generatedReport}
              </div>
            </div>
          )}

          <ComplaintDraft record={record} editable onChange={save} />
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-5">
            <h2 className="text-sm font-semibold">Original audio & transcript</h2>
            <div className="mt-3">
              <AudioPlayer src={record.audioDataUrl} label={record.audioRef} durationSec={record.audioDurationSec} />
            </div>
            <div className="mt-4 grid gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Bangla transcript (ASR)
                </div>
                <p className="bn mt-1 max-h-64 overflow-auto rounded-lg bg-secondary/60 p-3 text-sm">
                  {record.transcriptBn}
                </p>
              </div>
              {record.transcriptEn ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Working English rendering (for reviewers)
                  </div>
                  <p className="mt-1 max-h-56 overflow-auto rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">
                    {record.transcriptEn}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="surface-panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4" /> Appointment
            </h2>
            {record.appointment && clinic ? (
              <div className="mt-3 rounded-lg bg-shared-soft p-3 text-sm">
                <div className="font-medium">{clinic.name}</div>
                <div className="text-muted-foreground">{clinic.address}</div>
                <div className="text-muted-foreground">📞 {clinic.phone}</div>
                <div className="mt-2 font-semibold">{record.appointment.label}</div>
              </div>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground">
                No appointment booked yet.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  save({ ...record, status: "Assigned" });
                  toast.success("Reassigned to Arif (demo)");
                }}
              >
                <UserCog className="size-4" /> Reassign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  save({ ...record, status: "Booked" });
                  toast.success("Marked as booked");
                }}
              >
                Mark booked
              </Button>
              <Badge variant="secondary" className="self-center">
                Status: {record.status}
              </Badge>
            </div>
          </div>

          {record.answers && Object.keys(record.answers).length > 0 ? (
            <div className="surface-panel p-5">
              <h2 className="text-sm font-semibold">Follow-up answers from the client</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {Object.entries(record.answers).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
