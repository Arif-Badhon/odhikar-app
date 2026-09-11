import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Home,
  Keyboard,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SafetyScreen } from "@/components/odhikar/SafetyScreen";
import { useRecorder } from "@/hooks/useRecorder";
import { CLINICS, SLOTS } from "@/lib/odhikar/fixtures";
import { analysisService, transcriptionService } from "@/lib/odhikar/services/analysis";
import { buildCaseRecord } from "@/lib/odhikar/services/caseBuilder";
import { MAX_FOLLOW_UPS, nextQuestion } from "@/lib/odhikar/services/questions";
import { generateCaseId } from "@/lib/odhikar/repository";
import { useCaseStore } from "@/lib/odhikar/store";
import { CATEGORY_BN, type CaseRecord, type LegalCategory } from "@/lib/odhikar/types";
import type { AnalysisResult, FollowUpQuestion } from "@/lib/odhikar/services/types";
import { fmtBDT } from "@/lib/odhikar/engine";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "আপনার কথা বলুন — অধিকার | Odhikar client intake" },
      {
        name: "description",
        content:
          "Bangla voice-first legal aid intake: consent, real microphone recording, transcript review, follow-up questions, rights and clinic referral.",
      },
      { property: "og:title", content: "অধিকার — Bangla legal aid intake" },
      {
        property: "og:description",
        content: "Speak in your own words; a paralegal reviews everything before anything is final.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientIntake,
});

type Step =
  | "consent"
  | "record"
  | "review-audio"
  | "transcribing"
  | "transcript"
  | "analysing"
  | "followup"
  | "rights"
  | "summary"
  | "referral"
  | "done"
  | "safety";

const RIGHTS: Record<LegalCategory, { bn: string[]; routes: string[] }> = {
  Dowry: {
    bn: [
      "বিয়ের আগে বা পরে যৌতুক চাওয়া বাংলাদেশে আইনত নিষিদ্ধ।",
      "কে কত টাকা দিয়েছে এবং কারা সাক্ষী — এটি গুরুত্বপূর্ণ প্রমাণ।",
      "কাবিননামা আপনার সবচেয়ে জরুরি কাগজ — এটি নিরাপদে রাখুন।",
    ],
    routes: ["মধ্যস্থতা / সালিশ", "আনুষ্ঠানিক অভিযোগ", "আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
  "Dower & Maintenance": {
    bn: [
      "দেনমোহর আপনার নিজের অধিকার — এটি চাওয়ার জন্য কারো অনুমতি লাগে না।",
      "কাবিননামায় লেখা অঙ্ক এবং কত দেওয়া হয়েছে, দুটোই লিখে রাখা জরুরি।",
      "ভরণপোষণের দাবিও আলাদাভাবে করা যায়।",
    ],
    routes: ["মধ্যস্থতা / সালিশ", "আনুষ্ঠানিক অভিযোগ", "আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
  "Unpaid Wages": {
    bn: [
      "কাজ করলে মজুরি পাওয়া আপনার অধিকার, লিখিত চুক্তি না থাকলেও।",
      "কতদিন কাজ করেছেন ও দিনে কত টাকা — এই হিসাবই মূল ভিত্তি।",
      "সাক্ষীদের নাম ও মোবাইল নম্বর সংগ্রহ করে রাখুন।",
    ],
    routes: ["মালিকের সাথে মধ্যস্থতা", "শ্রম বিষয়ক আনুষ্ঠানিক অভিযোগ", "আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
  "Land Dispute": {
    bn: [
      "উত্তরাধিকার সূত্রে মেয়েরাও জমিতে অংশ পান।",
      "দলিল, পর্চা ও খতিয়ানের নকল ইউনিয়ন ভূমি অফিস থেকে তোলা যায়।",
      "জমি বিক্রির চেষ্টা চললে দ্রুত পদক্ষেপ নেওয়া জরুরি।",
    ],
    routes: ["পারিবারিক মধ্যস্থতা", "আনুষ্ঠানিক অভিযোগ", "আইন সহায়তা কেন্দ্রে জরুরি পরামর্শ"],
  },
  "Cyber Crime Report": {
    bn: [
      "অনলাইনে হয়রানি বা প্রতারণার ক্ষেত্রে প্রমাণ সংরক্ষণই সবচেয়ে জরুরি প্রথম কাজ।",
      "থানায় সাধারণ ডায়েরি (জিডি) করা আপনার অধিকার — এতে ফি লাগে না।",
    ],
    routes: ["থানায় জিডি", "পুলিশ সাইবার সাপোর্ট", "আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
  "Crime Report": {
    bn: [
      "ঘটনার বিবরণ, সময় ও সাক্ষীর নাম লিখে রাখা পরে অনেক কাজে লাগে।",
      "থানায় অভিযোগ বা জিডি করার আগে প্রমাণ গুছিয়ে নিন।",
    ],
    routes: ["থানায় অভিযোগ / জিডি", "আইন সহায়তা কেন্দ্রে পরামর্শ"],
  },
  "Out of scope": {
    bn: [
      "আপনার বিষয়টি এই স্বয়ংক্রিয় সেবার নির্ধারিত বিষয়গুলোর মধ্যে পড়ে না।",
      "আমরা কোনো অনুমান করছি না — একজন মানুষ আপনার কথা শুনবেন।",
    ],
    routes: ["আইন সহায়তা কেন্দ্রে সরাসরি পরামর্শ"],
  },
};

const ORDER: Step[] = ["consent", "record", "transcript", "followup", "rights", "summary", "referral", "done"];

function Shell({ children, step }: { children: React.ReactNode; step: Step }) {
  const idx = Math.max(0, ORDER.indexOf(step));
  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/40 to-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground"
            aria-label="Home"
          >
            <Home className="size-4" />
          </Link>
          <span className="bn text-lg font-bold tracking-tight">অধিকার</span>
          <span className="text-xs text-primary-foreground/70">আইন সহায়তা</span>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            নিরাপদ
          </Badge>
        </div>
        <div className="mx-auto max-w-lg px-4 pb-3">
          <Progress value={((idx + 1) / ORDER.length) * 100} className="h-1" />
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-6">{children}</div>
      <p className="bn mx-auto mt-6 max-w-lg px-6 text-center text-xs leading-relaxed text-muted-foreground">
        কোনো কিছু চূড়ান্ত হয় না, যতক্ষণ না একজন প্যারালিগ্যাল তা দেখে অনুমোদন করেন।
      </p>
    </main>
  );
}

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function ClientIntake() {
  const { upsert, syncError } = useCaseStore();
  const rec = useRecorder();

  const [step, setStep] = useState<Step>("consent");
  const [transcript, setTranscript] = useState("");
  const [transcriptSource, setTranscriptSource] =
    useState<"speech-to-text" | "typed">("speech-to-text");
  const [sttError, setSttError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [question, setQuestion] = useState<FollowUpQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askedCount, setAskedCount] = useState(0);
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [safetyReasons, setSafetyReasons] = useState<string[]>([]);
  const [clinicId, setClinicId] = useState(CLINICS[0]!.id);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const caseIdRef = useRef(generateCaseId());

  const restart = () => {
    caseIdRef.current = generateCaseId();
    rec.reset();
    setStep("consent");
    setTranscript("");
    setSttError(null);
    setAnalysis(null);
    setQuestion(null);
    setAnswers({});
    setAskedCount(0);
    setRecord(null);
    setSlotId(null);
    setAudioDataUrl(undefined);
  };

  const persist = useCallback(
    (a: AnalysisResult, ans: Record<string, string>, extra?: Partial<CaseRecord>) => {
      const built = buildCaseRecord({
        id: caseIdRef.current,
        transcript,
        analysis: a,
        answers: ans,
        audioDurationSec: rec.seconds,
        audioDataUrl,
        transcriptSource,
      });
      const merged = { ...built, ...extra } as CaseRecord;
      upsert(merged);
      setRecord(merged);
      return merged;
    },
    [transcript, rec.seconds, audioDataUrl, transcriptSource, upsert],
  );

  /* --------------------------- audio → transcript --------------------------- */
  const finishRecording = () => {
    rec.stop();
    setStep("review-audio");
  };

  const runTranscription = async () => {
    if (!rec.blob) return;
    setStep("transcribing");
    setSttError(null);
    const fr = new FileReader();
    fr.onload = () => setAudioDataUrl(String(fr.result));
    fr.readAsDataURL(rec.blob);

    const res = await transcriptionService.transcribe(rec.blob);
    if (res.ok) {
      setTranscript(res.text);
      setTranscriptSource("speech-to-text");
      setStep("transcript");
    } else {
      setSttError(res.reason);
      setTranscript("");
      setTranscriptSource("typed");
      setStep("transcript");
    }
  };

  /* ------------------------------- analysis -------------------------------- */
  const runAnalysis = async (text: string, ans: Record<string, string>) => {
    setStep("analysing");
    const a = await analysisService.analyse({ transcript: text, answers: ans });
    setAnalysis(a);

    if (a.safety.triggered) {
      const urgent = persist(a, ans, {
        urgency: "Urgent",
        safetyFlag: true,
        status: "New",
      });
      setRecord(urgent);
      setSafetyReasons(a.safety.reasons.length ? a.safety.reasons : ["safety indicators detected"]);
      setStep("safety");
      return;
    }

    persist(a, ans);
    const q = nextQuestion(a.missing, ans);
    if (q && askedCount < MAX_FOLLOW_UPS) {
      setQuestion(q);
      setStep("followup");
    } else {
      setQuestion(null);
      setStep("rights");
    }
  };

  const submitAnswer = async (value: string) => {
    if (!question) return;
    const ans = { ...answers, [question.field]: value };
    setAnswers(ans);
    setAskedCount((n) => n + 1);
    // Every answer re-runs safety, extraction and gap detection.
    await runAnalysis(transcript, ans);
  };

  const confirmBooking = () => {
    if (!record || !slotId) return;
    const clinic = CLINICS.find((c) => c.id === clinicId)!;
    const slot = SLOTS.find((x) => x.id === slotId)!;
    const booked: CaseRecord = {
      ...record,
      status: "Booked",
      appointment: {
        clinicId: clinic.id,
        slotId: slot.id,
        label: `${clinic.name} — ${slot.dateLabelEn} ${slot.time}`,
      },
    };
    upsert(booked);
    setRecord(booked);
    setStep("done");
  };

  if (step === "safety") return <SafetyScreen reasons={safetyReasons} onRestart={restart} />;

  /* -------------------------------- consent -------------------------------- */
  if (step === "consent")
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          <h1 className="bn text-2xl font-bold leading-snug">অধিকার-এ স্বাগতম</h1>
          <div className="bn mt-4 space-y-3 text-base leading-relaxed">
            <p>এটি একটি স্বয়ংক্রিয় সেবা। আমি আইনজীবী নই এবং আইনি পরামর্শ দিই না।</p>
            <p>আপনার কথা রেকর্ড করে লেখায় রূপান্তর করা হবে, যাতে একজন প্যারালিগ্যাল বিষয়টি বুঝতে পারেন।</p>
            <p>আপনি চাইলে রেকর্ড না করে লিখেও জানাতে পারেন।</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            English: automated service, not a lawyer. Your microphone is used only while you record.
            Nothing is filed or sent automatically.
          </p>
          <Button className="mt-6 h-14 w-full text-base" onClick={() => setStep("record")}>
            <span className="bn">শুরু করুন</span>
            <ArrowRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            className="mt-3 h-12 w-full"
            onClick={() => {
              setTranscriptSource("typed");
              setStep("transcript");
            }}
          >
            <Keyboard className="size-5" />
            <span className="bn">লিখে জানাতে চাই</span>
          </Button>
        </div>
      </Shell>
    );

  /* -------------------------------- record --------------------------------- */
  if (step === "record")
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 text-center shadow-sm">
          <h2 className="bn text-xl font-semibold leading-snug">
            আপনার সাথে যা হয়েছে, নিজের ভাষায় বলুন
          </h2>
          <p className="bn mt-2 text-sm text-muted-foreground">
            ধীরে ধীরে বলুন। শেষ হলে থামান বোতামে চাপ দিন।
          </p>

          {rec.state === "recording" || rec.state === "paused" ? (
            <>
              <div className="relative mx-auto mt-8 flex size-40 items-center justify-center">
                {rec.state === "recording" ? (
                  <span className="absolute size-40 animate-ping rounded-full bg-urgent/20" />
                ) : null}
                <button
                  type="button"
                  onClick={finishRecording}
                  aria-label="Stop recording"
                  className="relative flex size-40 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg transition-transform active:scale-95"
                >
                  <Square className="size-14 fill-current" />
                </button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-3xl font-semibold tabular-nums">
                <Mic className="size-6 text-urgent" />
                {clock(rec.seconds)}
              </div>
              <p className="bn mt-1 text-xs text-muted-foreground">
                {rec.state === "paused" ? "বিরতি দেওয়া হয়েছে" : "রেকর্ড হচ্ছে…"}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={rec.state === "paused" ? rec.resume : rec.pause}
                >
                  {rec.state === "paused" ? <Play className="size-5" /> : <Pause className="size-5" />}
                  <span className="bn">{rec.state === "paused" ? "আবার শুরু" : "বিরতি"}</span>
                </Button>
                <Button className="h-12" onClick={finishRecording}>
                  <span className="bn">শেষ করুন</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void rec.start()}
                aria-label="Start recording"
                className="mx-auto mt-8 flex size-40 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                {rec.state === "requesting" ? (
                  <Loader2 className="size-14 animate-spin" />
                ) : (
                  <Mic className="size-16" />
                )}
              </button>
              <p className="bn mt-6 text-base font-medium">বলা শুরু করতে চাপ দিন</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your browser will ask for microphone permission.
              </p>
            </>
          )}

          {rec.error ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-draft/50 bg-draft-soft/40 p-4 text-left">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-draft" />
              <div>
                <p className="bn text-sm font-medium">মাইক্রোফোন ব্যবহার করা যাচ্ছে না</p>
                <p className="mt-1 text-xs text-muted-foreground">{rec.error}</p>
              </div>
            </div>
          ) : null}

          <Button
            variant="outline"
            className="mt-6 h-12 w-full"
            onClick={() => {
              setTranscriptSource("typed");
              setStep("transcript");
            }}
          >
            <Keyboard className="size-5" />
            <span className="bn">বলার বদলে লিখব</span>
          </Button>
        </div>
      </Shell>
    );

  /* ---------------------------- review recording ---------------------------- */
  if (step === "review-audio")
    return (
      <Shell step="record">
        <div className="surface-panel p-6 shadow-sm">
          <h2 className="bn text-lg font-semibold">আপনার রেকর্ডিং শুনে দেখুন</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Recorded in this browser — {clock(rec.seconds)}
          </p>
          {rec.url ? (
            /* eslint-disable-next-line jsx-a11y/media-has-caption */
            <audio controls src={rec.url} className="mt-4 w-full" />
          ) : (
            <p className="bn mt-4 text-sm text-muted-foreground">রেকর্ডিং প্রস্তুত হচ্ছে…</p>
          )}
          <Button
            className="mt-5 h-14 w-full text-base"
            disabled={!rec.blob}
            onClick={() => void runTranscription()}
          >
            <span className="bn">এটি ব্যবহার করুন</span>
            <ArrowRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            className="mt-3 h-12 w-full"
            onClick={() => {
              rec.reset();
              setStep("record");
            }}
          >
            <RotateCcw className="size-5" />
            <span className="bn">আবার বলুন</span>
          </Button>
        </div>
      </Shell>
    );

  /* ------------------------------- loaders --------------------------------- */
  if (step === "transcribing" || step === "analysing")
    return (
      <Shell step={step === "transcribing" ? "record" : "followup"}>
        <div className="surface-panel flex flex-col items-center p-10 text-center shadow-sm">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="bn mt-5 text-lg font-medium">
            {step === "transcribing"
              ? "আপনার কথা লেখায় রূপান্তর করা হচ্ছে…"
              : "আপনার কথাগুলো গুছিয়ে নেওয়া হচ্ছে…"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "transcribing"
              ? "Bangla speech-to-text on your actual recording"
              : "Safety check, fact extraction and category analysis"}
          </p>
        </div>
      </Shell>
    );

  /* ------------------------------ transcript -------------------------------- */
  if (step === "transcript")
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          {sttError ? (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-draft/50 bg-draft-soft/40 p-4">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-draft" />
              <div>
                <p className="bn text-sm font-medium">কথা লেখায় রূপান্তর করা যায়নি</p>
                <p className="mt-1 text-xs text-muted-foreground">{sttError}</p>
                <p className="bn mt-2 text-sm">আপনি নিচে নিজের ভাষায় লিখতে পারেন।</p>
              </div>
            </div>
          ) : null}
          <h2 className="bn text-lg font-semibold">
            {transcriptSource === "typed" ? "নিজের ভাষায় লিখুন" : "আমরা এটি শুনেছি — ঠিক আছে কি?"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {transcriptSource === "typed"
              ? "Type what happened, in Bangla."
              : "Transcribed from your own recording — you can correct it."}
          </p>
          <Textarea
            className="bn mt-4 min-h-[220px] text-base leading-relaxed"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="এখানে লিখুন…"
          />
          <Button
            className="mt-5 h-14 w-full text-base"
            disabled={transcript.trim().length < 10}
            onClick={() => void runAnalysis(transcript, answers)}
          >
            <span className="bn">ঠিক আছে, এগিয়ে যান</span>
            <ArrowRight className="size-5" />
          </Button>
          {rec.blob ? (
            <Button
              variant="ghost"
              className="mt-2 h-11 w-full"
              onClick={() => {
                rec.reset();
                setStep("record");
              }}
            >
              <RotateCcw className="size-4" />
              <span className="bn">আবার রেকর্ড করি</span>
            </Button>
          ) : null}
        </div>
      </Shell>
    );

  /* ------------------------------- follow-up -------------------------------- */
  if (step === "followup" && question)
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="bn">প্রশ্ন {askedCount + 1}</span>
            <span>Filling a gap the system could not answer</span>
          </div>
          <Progress
            className="mt-2 h-1.5"
            value={((askedCount + 1) / (askedCount + 1 + (analysis?.missing.length ?? 1))) * 100}
          />
          <h2 className="bn mt-6 text-xl font-semibold leading-snug">{question.bn}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{question.en}</p>

          <div className="mt-6 space-y-3">
            {(question.options ?? []).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => void submitAnswer(o.value)}
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary hover:bg-accent"
              >
                <span className="bn block text-base font-medium">{o.bn}</span>
                <span className="block text-xs text-muted-foreground">{o.en}</span>
              </button>
            ))}
            <FreeAnswer key={question.id} onSubmit={(v) => void submitAnswer(v)} />
            <button
              type="button"
              onClick={() => void submitAnswer("Don't know")}
              className="w-full rounded-xl border-2 border-dashed border-border px-4 py-4 text-left text-muted-foreground transition-colors hover:bg-secondary"
            >
              <span className="bn block text-base font-medium">জানি না</span>
              <span className="block text-xs">I don&apos;t know — leave this blank</span>
            </button>
          </div>
        </div>
      </Shell>
    );

  /* --------------------------------- rights --------------------------------- */
  if (step === "rights" && analysis) {
    const cat = analysis.classification.primary;
    const content = RIGHTS[cat];
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            {CATEGORY_BN[cat]}
          </Badge>
          {analysis.classification.secondary ? (
            <Badge variant="outline" className="ml-2">
              {CATEGORY_BN[analysis.classification.secondary]}
            </Badge>
          ) : null}
          <h2 className="bn mt-4 text-xl font-semibold leading-snug">আপনার অধিকার ও সম্ভাব্য পথ</h2>
          <ul className="bn mt-4 space-y-3 text-base leading-relaxed">
            {content.bn.map((line) => (
              <li key={line} className="flex gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-shared" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-secondary/70 p-4">
            <div className="bn text-sm font-semibold">সম্ভাব্য পথ</div>
            <ul className="bn mt-2 space-y-1.5 text-sm text-muted-foreground">
              {content.routes.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
          <Button
            variant="outline"
            className="mt-5 h-12 w-full"
            onClick={() => {
              const u = new SpeechSynthesisUtterance(content.bn.join(" "));
              u.lang = "bn-BD";
              window.speechSynthesis?.speak(u);
            }}
          >
            <Volume2 className="size-5" />
            <span className="bn">শুনুন</span>
          </Button>
          <Button className="mt-3 h-14 w-full text-base" onClick={() => setStep("summary")}>
            <span className="bn">আমার তথ্য দেখুন</span>
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </Shell>
    );
  }

  /* -------------------------------- summary --------------------------------- */
  if (step === "summary" && record)
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          <h2 className="bn text-xl font-semibold">আমরা যা বুঝেছি</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A paralegal will check every line of this before anything happens.
          </p>
          <dl className="mt-4 divide-y divide-border text-sm">
            <Row label="বিষয় / Category" value={CATEGORY_BN[record.classification.primary]} />
            {record.respondents.length ? (
              <Row
                label="অভিযোগ কার বিরুদ্ধে"
                value={record.respondents
                  .map((r) => r.name.value ?? r.relationship.value ?? "—")
                  .join(", ")}
              />
            ) : null}
            {record.amounts.dower?.value !== undefined ? (
              <Row label="দেনমোহর" value={fmtBDT(record.amounts.dower.value)} />
            ) : null}
            {record.amounts.wagesTotal?.value !== undefined ? (
              <Row label="মোট মজুরি" value={fmtBDT(record.amounts.wagesTotal.value)} />
            ) : null}
            {record.amounts.outstanding?.value !== undefined ? (
              <Row label="বকেয়া" value={fmtBDT(record.amounts.outstanding.value)} />
            ) : null}
          </dl>
          {record.missing.length ? (
            <div className="mt-4 rounded-xl bg-draft-soft/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-draft">
                <AlertTriangle className="size-4" /> যেসব তথ্য এখনো জানা যায়নি
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {record.missing.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button className="mt-6 h-14 w-full text-base" onClick={() => setStep("referral")}>
            <span className="bn">আইন সহায়তা কেন্দ্রে যোগাযোগ</span>
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </Shell>
    );

  /* -------------------------------- referral -------------------------------- */
  if (step === "referral") {
    const clinic = CLINICS.find((c) => c.id === clinicId)!;
    const slots = SLOTS.filter((x) => x.clinicId === clinicId);
    return (
      <Shell step={step}>
        <div className="surface-panel p-6 shadow-sm">
          <h2 className="bn text-xl font-semibold">আপনার কাছের আইন সহায়তা কেন্দ্র</h2>
          <div className="mt-4 space-y-3">
            {CLINICS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setClinicId(c.id);
                  setSlotId(null);
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  c.id === clinicId ? "border-primary bg-accent" : "border-border hover:bg-secondary"
                }`}
              >
                <span className="bn block text-base font-semibold">{c.nameBn}</span>
                <span className="block text-xs text-muted-foreground">{c.name}</span>
                <span className="bn mt-1 block text-sm text-muted-foreground">{c.addressBn}</span>
                <span className="mt-1 block text-sm font-medium text-primary">
                  📞 {c.phone} · {c.distanceKm} km
                </span>
              </button>
            ))}
          </div>
          <h3 className="bn mt-6 text-base font-semibold">সময় বেছে নিন — {clinic.nameBn}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {slots.map((sl) => (
              <button
                key={sl.id}
                type="button"
                disabled={sl.taken === true}
                onClick={() => setSlotId(sl.id)}
                className={`rounded-xl border-2 px-3 py-3 text-left transition-colors disabled:opacity-40 ${
                  sl.id === slotId ? "border-primary bg-accent" : "border-border hover:bg-secondary"
                }`}
              >
                <span className="bn block text-sm font-semibold">{sl.dateLabelBn}</span>
                <span className="block text-lg font-bold tabular-nums">{sl.time}</span>
                {sl.taken ? <span className="text-[11px] text-muted-foreground">booked</span> : null}
              </button>
            ))}
          </div>
          <Button className="mt-6 h-14 w-full text-base" disabled={!slotId} onClick={confirmBooking}>
            <span className="bn">সময় নিশ্চিত করুন</span>
          </Button>
        </div>
      </Shell>
    );
  }

  /* ---------------------------------- done ---------------------------------- */
  if (step === "done" && record)
    return (
      <Shell step="done">
        <div className="surface-panel border-shared/40 p-6 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-shared-soft">
            <CheckCircle2 className="size-9 text-shared" />
          </div>
          <h2 className="bn mt-4 text-xl font-semibold">আপনার বিষয়টি পাঠানো হয়েছে</h2>
          <p className="bn mt-2 text-sm text-muted-foreground">
            {record.appointment?.label}. একজন প্যারালিগ্যাল আপনার সারসংক্ষেপ দেখে যোগাযোগ করবেন।
          </p>
          {syncError ? (
            <p role="alert" className="bn mt-4 rounded-lg border border-draft/40 bg-draft-soft p-3 text-sm text-draft-foreground">
              নিরাপদ সার্ভারে পাঠানো এখনো সম্পন্ন হয়নি। এই ডিভাইসে পুনরুদ্ধারযোগ্য কপি রাখা হয়েছে—ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।
            </p>
          ) : null}
          <div className="mt-4 rounded-lg bg-secondary/70 px-4 py-3 text-sm">
            <span className="text-muted-foreground">আপনার কেস নম্বর</span>
            <div className="text-lg font-semibold">{record.id}</div>
          </div>
          <Button variant="outline" className="mt-6 h-12 w-full" onClick={restart}>
            <span className="bn">নতুন করে শুরু করুন</span>
          </Button>
        </div>
      </Shell>
    );

  return (
    <Shell step="consent">
      <div className="surface-panel p-6 text-center">
        <p className="bn text-sm text-muted-foreground">প্রস্তুত হচ্ছে…</p>
        <Button className="mt-4" onClick={restart}>
          <span className="bn">আবার শুরু</span>
        </Button>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="bn text-muted-foreground">{label}</dt>
      <dd className="bn text-right font-medium">{value}</dd>
    </div>
  );
}

function FreeAnswer({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="rounded-xl border-2 border-border p-3">
      <Textarea
        className="bn min-h-[64px]"
        placeholder="নিজের ভাষায় লিখুন…"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <Button className="mt-2 w-full" disabled={v.trim().length === 0} onClick={() => onSubmit(v.trim())}>
        <span className="bn">উত্তর দিন</span>
      </Button>
    </div>
  );
}
