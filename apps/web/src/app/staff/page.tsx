"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, BriefcaseBusiness, CalendarCheck2, Clock3, ShieldAlert } from "lucide-react";
import { useCaseStore } from "@/lib/odhikar/store";
import { Button } from "@/components/ui/button";


export default function Dashboard() {
  const { cases, loading, syncError } = useCaseStore();
  const urgent = cases.filter((c) => c.safetyFlag || c.urgency === "Urgent");
  const fresh = cases.filter((c) => c.status === "New");
  const booked = cases.filter((c) => c.status === "Booked");
  const review = cases.filter((c) => !c.draftApproved && c.status !== "Closed");
  const cards = [
    ["New intakes", fresh.length, BriefcaseBusiness, "text-primary", "bg-accent"],
    ["Urgent safety", urgent.length, ShieldAlert, "text-urgent", "bg-urgent-soft"],
    ["Drafts to review", review.length, Clock3, "text-draft-foreground", "bg-draft-soft"],
    ["Appointments", booked.length, CalendarCheck2, "text-shared", "bg-shared-soft"],
  ] as const;
  return <main className="mx-auto max-w-7xl px-5 py-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Staff workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning</h1><p className="mt-1 text-sm text-muted-foreground">A secure overview of victim legal-aid intake requiring human review.</p></div>
      <Button asChild><Link href="/paralegal/cases">Open case queue <ArrowRight className="size-4" /></Link></Button>
    </div>
    {syncError ? <div className="mt-5 flex gap-2 rounded-xl border border-urgent/30 bg-urgent-soft p-4 text-sm text-urgent"><AlertTriangle className="size-4" />{syncError}</div> : null}
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Queue overview">
      {cards.map(([label, value, Icon, color, bg]) => <div className="surface-panel p-5" key={label}><span className={`flex size-10 items-center justify-center rounded-xl ${bg}`}><Icon className={`size-5 ${color}`} /></span><div className="mt-5 text-3xl font-semibold tabular-nums">{loading ? "—" : value}</div><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}
    </section>
    <section className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="surface-panel p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Priority cases</h2><p className="text-sm text-muted-foreground">Urgent and time-sensitive records appear first.</p></div><Link href="/paralegal/cases" className="text-sm font-medium text-primary">View all</Link></div><div className="mt-4 divide-y divide-border">{[...cases].sort((a,b)=>(a.safetyFlag?-1:0)-(b.safetyFlag?-1:0)).slice(0,5).map(c=><Link key={c.id} to="/paralegal/$caseId" params={{caseId:c.id}} className="flex items-center gap-4 py-4 hover:bg-secondary/30"><span className={`size-2 rounded-full ${c.safetyFlag?'bg-urgent':c.urgency==='Time-sensitive'?'bg-draft':'bg-shared'}`} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{c.classification.primary}</p><p className="text-xs text-muted-foreground">{c.id} · {c.receivedLabel}</p></div><span className="text-xs text-muted-foreground">{c.status}</span></Link>)}</div></div>
      <div className="surface-panel p-5"><h2 className="font-semibold">Human review safeguards</h2><ul className="mt-4 space-y-3 text-sm text-muted-foreground"><li>• Client statements remain distinct from inferred facts.</li><li>• Unknown information stays visibly marked.</li><li>• Safety disclosures interrupt automation.</li><li>• Nothing is filed or final without approval.</li></ul></div>
    </section>
  </main>;
}