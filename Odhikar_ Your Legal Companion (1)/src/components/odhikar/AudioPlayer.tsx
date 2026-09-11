import { AudioLines, MicOff } from "lucide-react";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Plays the real recording captured during intake, when it is available. */
export function AudioPlayer({
  src,
  label,
  durationSec,
}: {
  src?: string | undefined;
  label: string;
  durationSec?: number | undefined;
}) {
  if (!src)
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <MicOff className="mt-0.5 size-4 shrink-0" />
        <span>
          No audio available for this case ({label}). Recorded audio is kept for the browser session
          in which it was captured.
        </span>
      </div>
    );

  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AudioLines className="size-3.5" />
        <span className="truncate">{label}</span>
        {durationSec ? <span className="ml-auto tabular-nums">{fmt(durationSec)}</span> : null}
      </div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio controls src={src} className="mt-2 w-full" />
    </div>
  );
}
