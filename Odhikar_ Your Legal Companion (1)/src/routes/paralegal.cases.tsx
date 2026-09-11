import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseStore } from "@/lib/odhikar/store";
import type { CaseRecord } from "@/lib/odhikar/types";

export const Route = createFileRoute("/paralegal/cases")({
  head: () => ({
    meta: [
      { title: "Case queue — Odhikar paralegal" },
      {
        name: "description",
        content:
          "Urgency-first legal aid case queue with category, received time and status for paralegal review.",
      },
      { property: "og:title", content: "Case queue — Odhikar paralegal" },
      {
        property: "og:description",
        content: "Incoming legal aid referrals sorted by urgency, not arrival time.",
      },
    ],
  }),
  component: Queue,
});

const FILTERS = ["All", "New", "Assigned", "Booked", "Urgent"] as const;

const rank = (c: CaseRecord) =>
  c.safetyFlag || c.urgency === "Urgent" ? 0 : c.urgency === "Time-sensitive" ? 1 : 2;

function Queue() {
  const { cases, loading, refresh, syncError } = useCaseStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => {
    const f = cases.filter((c) => {
      if (filter === "All") return true;
      if (filter === "Urgent") return c.safetyFlag || c.urgency === "Urgent";
      return c.status === filter;
    });
    return [...f].sort((a, b) => rank(a) - rank(b));
  }, [cases, filter]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incoming case queue</h1>
          <p className="text-sm text-muted-foreground">
            Sorted by urgency first, then arrival time. {rows.length} case(s) shown.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()}>
          Refresh secure queue
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="surface-panel mt-5 overflow-hidden">
        {syncError ? <p className="border-b border-urgent/30 bg-urgent-soft px-5 py-3 text-sm text-urgent">{syncError}</p> : null}
        <table className="w-full text-sm">
          <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Category</th>
              <th className="hidden px-5 py-3 sm:table-cell">Received</th>
              <th className="px-5 py-3">Status / urgency</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const urgent = c.safetyFlag || c.urgency === "Urgent";
              return (
                <tr
                  key={c.id}
                  className={`border-t border-border ${urgent ? "bg-urgent-soft/60" : ""}`}
                >
                  <td className="px-5 py-4 font-semibold tabular-nums">{c.id.slice(-4)}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium">
                       {c.safetyFlag
                        ? "Family — violence disclosed"
                        : c.classification.primary +
                          (c.classification.secondary ? ` / ${c.classification.secondary}` : "")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence {(c.classification.confidence * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                    {c.receivedLabel}
                  </td>
                  <td className="px-5 py-4">
                    {urgent ? (
                      <Badge className="gap-1 bg-urgent text-urgent-foreground hover:bg-urgent">
                        <AlertTriangle className="size-3" /> URGENT
                      </Badge>
                    ) : c.urgency === "Time-sensitive" ? (
                      <Badge className="gap-1 bg-draft text-draft-foreground hover:bg-draft">
                        <Clock className="size-3" /> Time-sensitive
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{c.status}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/paralegal/$caseId" params={{ caseId: c.id }}>
                        Open
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading secure case records…</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  No cases match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
