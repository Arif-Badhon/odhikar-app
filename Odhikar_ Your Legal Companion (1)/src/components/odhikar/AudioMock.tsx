import { useEffect, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function AudioMock({
  src,
  durationSec,
  label = "Original recording (simulated)",
}: {
  src: string;
  durationSec: number;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1 >= durationSec) {
          setPlaying(false);
          return durationSec;
        }
        return p + 1;
      });
    }, 250);
    return () => clearInterval(t);
  }, [playing, durationSec]);

  return (
    <div className="rounded-xl border border-border bg-secondary/60 p-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="default"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (pos >= durationSec) setPos(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="size-3.5" />
            <span className="truncate">{label}</span>
          </div>
          <Progress value={(pos / durationSec) * 100} className="mt-2 h-1.5" />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span className="truncate">{src}</span>
            <span>
              {fmt(pos)} / {fmt(durationSec)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
