import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Landmark,
  Phone,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicShell } from "@/components/public/PublicShell";
import { generateCaseId } from "@/lib/odhikar/repository";
import { detectSafetyRules } from "@/lib/odhikar/services/heuristics";
import {
  buildGdDraft,
  DISTRICTS,
  findIncident,
  INCIDENT_TYPES,
  REPORT_HELPLINES,
  type ReportInput,
  type ReporterRole,
} from "@/lib/odhikar/report";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "অপরাধ রিপোর্ট — অধিকার | Report a crime safely" },
      {
        name: "description",
        content:
          "Document a crime in Bangladesh, preserve evidence, and prepare and download a Thana-ready General Diary draft.",
      },
      { property: "og:title", content: "অপরাধ রিপোর্ট — অধিকার" },
      {
        property: "og:description",
        content:
          "Prepare and download a Thana-ready General Diary draft with evidence guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

const STEPS = [
  { bn: "ঘটনার ধরন", en: "Incident" },
  { bn: "স্থান", en: "Location" },
  { bn: "বিবরণ", en: "Details" },
  { bn: "জিডির খসড়া", en: "GD draft" },
];

const EVIDENCE_OPTIONS = [
  "স্ক্রিনশট",
  "মেসেজ / চ্যাট",
  "কল রেকর্ড",
  "ছবি বা ভিডিও",
  "লেনদেনের এসএমএস / রসিদ",
  "চিকিৎসার কাগজ",
  "প্রত্যক্ষদর্শীর নাম",
  "কিছুই নেই",
];

const emptyInput: ReportInput = {
  incidentTypeId: "",
  reporterRole: "victim",
  districtId: "",
  thana: "",
  whenLabel: "",
  narrative: "",
  suspectInfo: "",
  evidenceHeld: [],
  contact: "",
  anonymous: false,
};

function ReportPage() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ReportInput>(emptyInput);
  const [caseId, setCaseId] = useState<string | null>(null);

  const incident = findIncident(input.incidentTypeId);
  const district = DISTRICTS.find((d) => d.id === input.districtId);
  const set = <K extends keyof ReportInput>(k: K, v: ReportInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const safety = useMemo(
    () => detectSafetyRules(`${input.narrative} ${input.suspectInfo}`),
    [input.narrative, input.suspectInfo],
  );

  const canContinue =
    step === 0 ? Boolean(input.incidentTypeId) : step === 1 ? Boolean(input.districtId && input.thana) : step === 2 ? input.narrative.trim().length > 15 : true;

  const analyse = () => {
    const id = generateCaseId();
    setCaseId(id);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gdDraft = caseId ? buildGdDraft(input, caseId) : "";

  const downloadGdDraft = () => {
    if (!caseId || !gdDraft) return;
    const blob = new Blob([gdDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${caseId}-gd-draft.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("জিডির খসড়া ডাউনলোড হয়েছে");
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-medium text-primary">
            <ShieldCheck className="size-3.5" /> <span className="bn">গোপনীয় · আপনার নিয়ন্ত্রণে</span>
          </span>
          <span className="text-muted-foreground">Nothing is filed automatically</span>
        </div>

        <h1 className="bn mt-4 text-3xl font-bold leading-snug md:text-4xl">
          অপরাধ রিপোর্ট করুন — নিরাপদে ও গুছিয়ে
        </h1>
        <p className="bn mt-2 text-base leading-relaxed text-muted-foreground">
          আপনি ভুক্তভোগী হন বা প্রত্যক্ষদর্শী — কয়েকটি ধাপে ঘটনাটি লিপিবদ্ধ করুন। আমরা প্রমাণ সংরক্ষণের
          নির্দেশনা দেব এবং থানায় জমা দেওয়ার উপযোগী একটি <strong>জিডির খসড়া</strong> তৈরি করে দেব।
        </p>

        {/* Steps */}
        <ol className="mt-7 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.en} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i < step
                    ? "bg-shared text-shared-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="bn hidden text-xs text-muted-foreground sm:block">{s.bn}</span>
              {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
            </li>
          ))}
        </ol>

        {/* Step 1 — incident type */}
        {step === 0 ? (
          <div className="mt-7 space-y-6">
            <div className="surface-panel p-5">
              <p className="bn text-sm font-medium">আপনি কী হিসেবে জানাচ্ছেন?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { v: "victim", bn: "আমি নিজেই ভুক্তভোগী", en: "I am the victim" },
                    { v: "witness", bn: "আমি ঘটনাটি দেখেছি", en: "I witnessed it" },
                  ] as { v: ReporterRole; bn: string; en: string }[]
                ).map((r) => (
                  <button
                    key={r.v}
                    type="button"
                    onClick={() => set("reporterRole", r.v)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      input.reporterRole === r.v
                        ? "border-primary bg-accent"
                        : "border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    <div className="bn font-medium">{r.bn}</div>
                    <div className="text-xs text-muted-foreground">{r.en}</div>
                  </button>
                ))}
              </div>
            </div>

            {(["cyber", "general"] as const).map((g) => (
              <div key={g}>
                <h2 className="bn text-sm font-semibold text-muted-foreground">
                  {g === "cyber" ? "অনলাইন / সাইবার অপরাধ" : "অন্যান্য অপরাধ"}
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {INCIDENT_TYPES.filter((t) => t.group === g).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set("incidentTypeId", t.id)}
                      className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                        input.incidentTypeId === t.id
                          ? "border-primary bg-accent ring-1 ring-primary"
                          : "border-border bg-card hover:bg-secondary"
                      }`}
                    >
                      <div className="bn font-medium leading-snug">{t.titleBn}</div>
                      <div className="bn mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t.descBn}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{t.titleEn}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Step 2 — location */}
        {step === 1 ? (
          <div className="surface-panel mt-7 p-5">
            <h2 className="bn text-lg font-semibold">এটি কোথায় জমা দেওয়া হবে?</h2>
            <p className="bn mt-1 text-sm text-muted-foreground">
              আপনার জেলা ও নিকটস্থ থানা বেছে নিন। জিডির খসড়ায় এটি ব্যবহার হবে।
            </p>

            <label className="bn mt-5 block text-sm font-medium">জেলা</label>
            <select
              className="mt-2 h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
              value={input.districtId}
              onChange={(e) => {
                set("districtId", e.target.value);
                set("thana", "");
              }}
            >
              <option value="">— জেলা নির্বাচন করুন —</option>
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameBn} ({d.nameEn})
                </option>
              ))}
            </select>

            <label className="bn mt-5 block text-sm font-medium">নিকটস্থ থানা</label>
            <select
              className="mt-2 h-12 w-full rounded-lg border border-input bg-card px-3 text-base disabled:opacity-60"
              value={input.thana}
              disabled={!district}
              onChange={(e) => set("thana", e.target.value)}
            >
              <option value="">{district ? "— থানা নির্বাচন করুন —" : "আগে জেলা বেছে নিন"}</option>
              {(district?.thanas ?? []).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Step 3 — details */}
        {step === 2 ? (
          <div className="mt-7 space-y-5">
            <div className="surface-panel p-5">
              <label className="bn block text-sm font-medium">কী ঘটেছে? নিজের ভাষায় লিখুন</label>
              <Textarea
                value={input.narrative}
                onChange={(e) => set("narrative", e.target.value)}
                rows={7}
                className="bn mt-2 text-base"
                placeholder="যা ঘটেছে তা যতটা মনে আছে লিখুন — কে, কখন, কোথায়, কী করেছে।"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {input.narrative.trim().length} characters · at least 15 needed
              </p>
            </div>

            <div className="surface-panel grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className="bn block text-sm font-medium">কখন ঘটেছে?</label>
                <Input
                  className="bn mt-2 h-12 text-base"
                  value={input.whenLabel}
                  onChange={(e) => set("whenLabel", e.target.value)}
                  placeholder="যেমন: ১০ সেপ্টেম্বর, রাত ৯টা"
                />
              </div>
              <div>
                <label className="bn block text-sm font-medium">অভিযুক্ত সম্পর্কে জানা তথ্য</label>
                <Input
                  className="bn mt-2 h-12 text-base"
                  value={input.suspectInfo}
                  onChange={(e) => set("suspectInfo", e.target.value)}
                  placeholder="নাম, নম্বর বা প্রোফাইল — জানা না থাকলে খালি রাখুন"
                />
              </div>
            </div>

            <div className="surface-panel p-5">
              <p className="bn text-sm font-medium">আপনার কাছে কী কী প্রমাণ আছে?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {EVIDENCE_OPTIONS.map((o) => {
                  const checked = input.evidenceHeld.includes(o);
                  return (
                    <label
                      key={o}
                      className="bn flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm hover:bg-secondary"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          set(
                            "evidenceHeld",
                            checked
                              ? input.evidenceHeld.filter((x) => x !== o)
                              : [...input.evidenceHeld, o],
                          )
                        }
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="surface-panel p-5">
              <label className="bn block text-sm font-medium">যোগাযোগ (ঐচ্ছিক)</label>
              <Input
                className="bn mt-2 h-12 text-base"
                value={input.contact}
                disabled={input.anonymous}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="নাম ও মোবাইল নম্বর"
              />
              <label className="bn mt-3 flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={input.anonymous}
                  onCheckedChange={(v) => set("anonymous", Boolean(v))}
                />
                আমি পরিচয় গোপন রাখতে চাই
              </label>
              <p className="bn mt-2 text-xs leading-relaxed text-muted-foreground">
                পরিচয় গোপন রাখলে খসড়ায় আপনার নাম বা যোগাযোগ থাকবে না। থানায় জমা দেওয়ার আগে প্রয়োজনীয়
                পরিচয় নিজে যোগ করতে পারবেন।
              </p>
            </div>
          </div>
        ) : null}

        {/* Step 4 — result */}
        {step === 3 && incident ? (
          <div className="mt-7 space-y-5">
            {safety.triggered || incident.urgent ? (
              <div className="flex items-start gap-3 rounded-xl border-2 border-urgent bg-urgent-soft p-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-urgent" />
                <div>
                  <p className="bn font-semibold text-urgent">এখনই বিপদে আছেন? অপেক্ষা করবেন না।</p>
                  <p className="bn mt-1 text-sm leading-relaxed">
                    জাতীয় জরুরি সেবা <strong>999</strong> এ কল করুন। আইন সহায়তার জন্য{" "}
                    <strong>16430</strong>। এই সেবা কোথাও রিপোর্ট পাঠায় না—জরুরি সহায়তার জন্য সরাসরি কল করুন।
                  </p>
                </div>
              </div>
            ) : null}

            <div className="surface-panel p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Landmark className="size-4 text-primary" />
                <span className="bn">আইন কী বলে</span>
              </div>
              <p className="bn mt-1 text-sm text-muted-foreground">
                {incident.titleBn} · {district?.nameBn} · {input.thana}
              </p>
              <ul className="bn mt-3 space-y-2 text-sm leading-relaxed">
                {incident.lawsBn.map((l) => (
                  <li key={l} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {l}
                  </li>
                ))}
              </ul>
              <p className="bn mt-3 rounded-lg bg-draft-soft px-3 py-2 text-xs text-draft-foreground">
                এটি সাধারণ আইন তথ্য, ব্যক্তিগত আইনি পরামর্শ নয়। প্রয়োজনে 16430-এ আইন সহায়তা নিন।
              </p>
            </div>

            <div className="surface-panel p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ScrollText className="size-4 text-primary" />
                <span className="bn">প্রমাণ সংরক্ষণ করুন — এখনই</span>
              </div>
              <ul className="bn mt-3 space-y-2 text-sm leading-relaxed">
                {incident.evidenceBn.map((e) => (
                  <li key={e} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-shared" /> {e}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="size-4 text-draft-foreground" />
                  <span className="bn">জিডির খসড়া</span>
                  <span className="rounded-full bg-draft-soft px-2 py-0.5 text-[11px] text-draft-foreground">
                    খসড়া · Draft
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard?.writeText(gdDraft);
                      toast.success("খসড়া কপি হয়েছে");
                    }}
                  >
                    <ClipboardCopy className="size-4" /> Copy
                  </Button>
                  <Button size="sm" onClick={downloadGdDraft}>
                    <Download className="size-4" /> <span className="bn">ডাউনলোড</span>
                  </Button>
                </div>
              </div>
              <pre className="bn mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/60 p-4 text-sm leading-relaxed">
                {gdDraft}
              </pre>
              <p className="bn mt-2 text-xs text-muted-foreground">
                বর্গাকার বন্ধনীর অংশগুলো এখনো অজানা — থানায় যাওয়ার আগে তথ্য যাচাই করে সেগুলো পূরণ করুন।
                রেফারেন্স: {caseId}
              </p>
            </div>

            <div className="surface-panel p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="size-4 text-primary" />
                <span className="bn">জরুরি ও সহায়তা নম্বর</span>
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {REPORT_HELPLINES.map((h) => (
                  <li key={h.number} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="bn">{h.labelBn}</span>
                    <a className="font-semibold text-primary" href={`tel:${h.number}`}>
                      {h.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-shared/40 bg-shared-soft p-5">
              <p className="bn font-semibold">আপনার জিডির খসড়া প্রস্তুত</p>
              <p className="bn mt-1 text-sm leading-relaxed">
                রেফারেন্স নম্বর <strong>{caseId}</strong>। খসড়াটি ডাউনলোড বা কপি করে তথ্য যাচাই করুন,
                প্রয়োজনীয় ফাঁকা অংশ পূরণ করুন এবং চাইলে নিজে থানায় জমা দিন। এটি প্যারালিগ্যাল, থানা বা
                আদালতে পাঠানো হয়নি।
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={downloadGdDraft}>
                  <Download className="size-4" /> <span className="bn">জিডির খসড়া ডাউনলোড করুন</span>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/knowledge">
                    <span className="bn">আইন সম্পর্কে আরও জানুন</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/">
                    <span className="bn">হোমে ফিরুন</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Nav */}
        {step < 3 ? (
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="h-12"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" /> <span className="bn">পেছনে</span>
            </Button>
            <Button
              className="h-12"
              disabled={!canContinue}
              onClick={() => (step === 2 ? analyse() : setStep((s) => s + 1))}
            >
              <span className="bn">{step === 2 ? "জিডির খসড়া তৈরি করুন" : "পরবর্তী"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
