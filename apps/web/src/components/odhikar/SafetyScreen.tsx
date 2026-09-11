import { Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTACTS = [
  { bn: "জাতীয় হেল্পলাইন", en: "National helpline", num: "16430" },
  { bn: "জাতীয় জরুরি সেবা", en: "National emergency service", num: "999" },
  { bn: "মানিকগঞ্জ আইন সহায়তা কেন্দ্র", en: "Manikganj Legal Aid Clinic", num: "01711-000101" },
];

export function SafetyScreen({ reasons = [] as string[], onRestart }: { reasons?: string[]; onRestart?: () => void }) {
  return (
    <div className="min-h-screen bg-urgent-soft px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-2 border-urgent bg-card p-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-urgent">
            <ShieldAlert className="size-8 text-urgent-foreground" />
          </div>
          <h1 className="bn mt-5 text-2xl font-bold text-urgent">আপনার নিরাপত্তা সবচেয়ে জরুরি</h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-urgent">
            Your safety comes first
          </p>

          <p className="bn mt-5 text-base text-foreground">
            আপনি যা বলেছেন তাতে মনে হচ্ছে আপনি এখনই বিপদের মধ্যে থাকতে পারেন। আমরা স্বয়ংক্রিয় প্রশ্ন
            এখানেই বন্ধ করছি। এখন একজন মানুষের সাথে কথা বলা সবচেয়ে জরুরি।
          </p>

          <div className="mt-6 space-y-3 text-left">
            {CONTACTS.map((c) => (
              <a
                key={c.num}
                href={`tel:${c.num}`}
                className="flex items-center gap-4 rounded-xl border-2 border-urgent/30 bg-urgent-soft px-4 py-4 transition-colors hover:bg-urgent/10"
              >
                <Phone className="size-6 shrink-0 text-urgent" />
                <span className="min-w-0">
                  <span className="bn block text-base font-semibold text-foreground">{c.bn}</span>
                  <span className="block text-xs text-muted-foreground">{c.en}</span>
                </span>
                <span className="ml-auto text-xl font-bold text-urgent">{c.num}</span>
              </a>
            ))}
          </div>

          <p className="bn mt-6 text-sm text-muted-foreground">
            আপনার কথাগুলো একজন প্যারালিগ্যালের কাছে জরুরি হিসেবে পাঠানো হয়েছে। কেউ আপনার সাথে
            যোগাযোগ করবেন।
          </p>

          {reasons.length > 0 ? (
            <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
              Detected: {reasons.join(" · ")}
            </p>
          ) : null}

          {onRestart ? (
            <Button variant="outline" className="mt-6 w-full" onClick={onRestart}>
              Restart demo
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
