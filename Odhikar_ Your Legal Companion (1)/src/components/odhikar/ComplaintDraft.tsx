import { useMemo, useState } from "react";
import { Check, Download, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { buildComplaintDraft } from "@/lib/odhikar/templates";
import type { CaseRecord } from "@/lib/odhikar/types";

export function ComplaintDraft({
  record,
  editable = false,
  onChange,
}: {
  record: CaseRecord;
  editable?: boolean;
  onChange?: (c: CaseRecord) => void;
}) {
  const generated = useMemo(() => buildComplaintDraft(record), [record]);
  const text = record.draftEdited ?? generated;
  const [editing, setEditing] = useState(false);

  const exportDoc = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${record.id} — Draft complaint</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.6;color:#111}
.banner{border:2px solid #b3261e;color:#b3261e;padding:10px 14px;font-weight:700;margin-bottom:24px;letter-spacing:.03em}
pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:14px}</style></head>
<body><div class="banner">DRAFT — not for use without paralegal review</div><pre>${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>
<script>window.onload=()=>window.print()<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${record.id}-draft-complaint.html`;
      a.click();
    }
  };

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-urgent/40 bg-urgent-soft px-5 py-3">
        <FileText className="size-4 text-urgent" />
        <span className="text-sm font-bold uppercase tracking-wide text-urgent">
          Draft — not for use without paralegal review
        </span>
        {record.draftApproved ? (
          <Badge className="ml-auto bg-shared text-shared-foreground hover:bg-shared">
            Approved by paralegal
          </Badge>
        ) : null}
      </div>

      <div className="p-5">
        {editing ? (
          <Textarea
            className="min-h-[420px] font-mono text-xs leading-relaxed"
            value={text}
            onChange={(e) => onChange?.({ ...record, draftEdited: e.target.value })}
          />
        ) : (
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/50 p-4 text-xs leading-relaxed text-foreground">
            {text}
          </pre>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Generated from reviewed template. Values in square brackets were not established during
          intake and must be completed by a paralegal.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportDoc}>
            <Download className="size-4" /> Export / Print PDF
          </Button>
          {editable ? (
            <>
              <Button variant={editing ? "default" : "outline"} onClick={() => setEditing((e) => !e)}>
                <Pencil className="size-4" /> {editing ? "Done editing" : "Edit draft"}
              </Button>
              <Button
                className="bg-shared text-shared-foreground hover:bg-shared/90"
                disabled={record.draftApproved === true}
                onClick={() => onChange?.({ ...record, draftApproved: true, status: "Assigned" })}
              >
                <Check className="size-4" />
                {record.draftApproved ? "Approved" : "Approve draft"}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
