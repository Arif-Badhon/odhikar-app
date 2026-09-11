import { cn } from "@/lib/utils";
import type { Field } from "@/lib/odhikar/types";

export function ProvenanceBadge({ p, note }: { p: Field["provenance"]; note?: string }) {
  if (p === "explicit") return null;
  const map: Record<string, { label: string; cls: string }> = {
    inferred: { label: "Inferred", cls: "bg-inferred-soft text-inferred border-inferred/25" },
    calculated: { label: "Calculated", cls: "bg-shared-soft text-shared border-shared/25" },
    unknown: { label: "Unknown", cls: "bg-muted text-muted-foreground border-border" },
  };
  const m = map[p]!;
  return (
    <span
      title={note}
      className={cn(
        "ml-2 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

export function FieldValue({
  label,
  field,
  format,
  placeholder = "— not established —",
}: {
  label: string;
  field?: Field<string | number> | undefined;
  format?: (v: string | number) => string;
  placeholder?: string;
}) {
  const known = field && field.value !== undefined && field.provenance !== "unknown";
  return (
    <div className="py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-start text-sm text-foreground">
        <span className={cn(!known && "italic text-muted-foreground")}>
          {known
            ? format
              ? format(field!.value as string | number)
              : String(field!.value)
            : placeholder}
        </span>
        <ProvenanceBadge p={field?.provenance ?? "unknown"} note={field?.note ?? ""} />
      </div>
      {field?.note && field.provenance !== "explicit" ? (
        <div className="mt-0.5 text-xs text-muted-foreground">{field.note}</div>
      ) : null}
    </div>
  );
}
