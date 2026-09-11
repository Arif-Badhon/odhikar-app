import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Ear,
  ExternalLink,
  LockKeyhole,
  Megaphone,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import landingImage from "@/assets/odhikar-landing.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/public/PublicShell";
import { LanguageProvider, useLanguage } from "@/lib/odhikar/language";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "অধিকার — আপনার পাশে, ন্যায়ের পথে" },
      {
        name: "description",
        content:
          "বাংলায় নিরাপদ আইন সহায়তা, অপরাধের জিডি খসড়া এবং নির্ভরযোগ্য আইনি তথ্য—এক জায়গায়।",
      },
      { property: "og:title", content: "অধিকার — আপনার পাশে, ন্যায়ের পথে" },
      {
        property: "og:description",
        content: "Bangla-first pathways to legal aid, crime documentation, and reliable legal information.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}

function HomeContent() {
  const [open, setOpen] = useState(true);
  const { lang, t } = useLanguage();
  const bn = lang === "bn" ? "bn" : "";

  return (
    <main className="relative isolate flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-primary text-primary-foreground">
      <img
        src={landingImage}
        alt="A legal-aid worker listening carefully to a client in Bangladesh"
        width={1920}
        height={1280}
        className="absolute inset-0 -z-30 size-full object-cover object-[64%_center]"
      />
      <div className="absolute inset-0 -z-20 bg-primary/78" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_86%,transparent)_42%,color-mix(in_oklab,var(--primary)_36%,transparent)_100%)]"
        aria-hidden="true"
      />

      <header className="relative z-10 flex w-full items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="Odhikar home">
          <span className="flex size-10 items-center justify-center rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 backdrop-blur-sm">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="bn block text-lg font-semibold leading-none">অধিকার</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground/65">
              Odhikar
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle className="border-primary-foreground/25 bg-primary/35 text-primary-foreground backdrop-blur-sm [&_svg]:text-primary-foreground/70 [&_button:not([aria-pressed=true])]:text-primary-foreground/70" />
          <Link
            to="/paralegal/login"
            className="hidden size-10 items-center justify-center rounded-lg border border-primary-foreground/20 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground sm:flex"
            aria-label={t("কর্মী প্রবেশ", "Staff sign in")}
            title={t("কর্মী প্রবেশ", "Staff sign in")}
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="relative z-0 flex flex-1 items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-3xl pb-14 pt-4 sm:pb-20">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground/70">
            <Sparkles className="size-4" aria-hidden="true" />
            <span className={bn}>{t("বাংলায় আইনি সহায়তার সহজ পথ", "A clearer path to legal support")}</span>
          </div>
          <h1 className={`${bn} max-w-3xl text-4xl font-semibold leading-[1.2] sm:text-5xl lg:text-7xl lg:leading-[1.08]`}>
            {t("আপনার কথা। আপনার অধিকার।", "Your voice. Your rights.")}
          </h1>
          <p className={`${bn} mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/76 sm:text-lg`}>
            {t(
              "সহায়তা নিন, কোনো অপরাধ লিপিবদ্ধ করুন, অথবা সহজ ভাষায় আইন জানুন।",
              "Get support, document a crime, or understand the law in plain language.",
            )}
          </p>

          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => setOpen(true)}
            className="mt-8 h-14 rounded-lg px-6 text-base shadow-xl transition-transform hover:-translate-y-0.5"
          >
            <span className={bn}>{t("আপনার পথ বেছে নিন", "Choose your path")}</span>
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col gap-3 border-t border-primary-foreground/15 px-5 py-4 text-xs text-primary-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className={`${bn} flex items-center gap-2`}>
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          {t("গোপনীয় · মানুষের পর্যালোচনা · স্বয়ংক্রিয়ভাবে দাখিল নয়", "Private · Human-reviewed · Never auto-filed")}
        </p>
        <div className="flex items-center gap-4">
          <a href="tel:999" className="inline-flex items-center gap-1.5 font-medium text-primary-foreground hover:underline">
            <Phone className="size-3.5" aria-hidden="true" />
            {t("জরুরি ৯৯৯", "Emergency 999")}
          </a>
          <a href="tel:16430" className="font-medium text-primary-foreground hover:underline">
            {t("আইন সহায়তা ১৬৪৩০", "Legal aid 16430")}
          </a>
          <Link to="/paralegal/login" className="sm:hidden">
            {t("কর্মী প্রবেশ", "Staff")}
          </Link>
        </div>
      </footer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92svh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto rounded-xl border-border/70 bg-background p-0 shadow-2xl sm:rounded-xl">
          <div className="border-b border-border px-5 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-8">
            <DialogHeader className="pr-8 text-left">
              <p className={`${bn} text-xs font-semibold uppercase tracking-[0.14em] text-primary`}>
                {t("অধিকার · Odhikar", "Odhikar · অধিকার")}
              </p>
              <DialogTitle className={`${bn} text-2xl leading-snug text-foreground sm:text-3xl`}>
                {t("আজ আপনি কী করতে চান?", "How can we help today?")}
              </DialogTitle>
              <DialogDescription className={`${bn} max-w-2xl text-sm leading-relaxed sm:text-base`}>
                {t(
                  "আপনার জন্য সবচেয়ে উপযুক্ত পথটি বেছে নিন। প্রতিটি ধাপে পরিষ্কার নির্দেশনা থাকবে।",
                  "Choose the path that best matches your needs. You’ll receive clear guidance at every step.",
                )}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-3 p-4 sm:p-6 md:grid-cols-3">
            <JourneyOption
              to="/intake"
              icon={<Ear className="size-6" />}
              title={t("আমি ভুক্তভোগী", "I am a victim")}
              eyebrow={t("সহায়তা ও রেফারেল", "Support & referral")}
              description={t(
                "আপনার কথা বলুন বা লিখুন। তথ্য গুছিয়ে একজন প্যারালিগ্যালের পর্যালোচনার জন্য পাঠান।",
                "Speak or type what happened. Organise your information for review by a paralegal.",
              )}
              cta={t("সহায়তা শুরু করুন", "Get support")}
              bnClass={bn}
              featured
            />
            <JourneyOption
              to="/report"
              icon={<Megaphone className="size-6" />}
              title={t("আমি অপরাধ দেখেছি", "I witnessed a crime")}
              eyebrow={t("জিডি খসড়া", "GD draft")}
              description={t(
                "ঘটনাটি নিরাপদে লিপিবদ্ধ করুন এবং নিজের জন্য ডাউনলোডযোগ্য জিডির খসড়া তৈরি করুন।",
                "Document what you witnessed and create a downloadable General Diary draft for yourself.",
              )}
              cta={t("ঘটনা লিপিবদ্ধ করুন", "Document an incident")}
              bnClass={bn}
            />
            <JourneyOption
              to="/knowledge"
              icon={<BookOpen className="size-6" />}
              title={t("আইন সম্পর্কে জানতে চাই", "Browse legal knowledge")}
              eyebrow={t("সহজ ভাষায় তথ্য", "Plain-language information")}
              description={t(
                "বাংলাদেশের আইনি বিষয়, প্রয়োজনীয় কাগজপত্র ও সহায়তার পথ সম্পর্কে জানুন।",
                "Explore Bangladesh legal topics, useful documents, and routes to further help.",
              )}
              cta={t("তথ্যভাণ্ডার দেখুন", "Open the library")}
              bnClass={bn}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-muted/55 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className={`${bn} flex items-start gap-2 leading-relaxed`}>
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {t(
                "অধিকার আইনজীবী নয়। কোনো তথ্য থানা বা আদালতে স্বয়ংক্রিয়ভাবে পাঠানো হয় না।",
                "Odhikar is not a lawyer. Nothing is automatically sent to police or court.",
              )}
            </p>
            <a href="tel:999" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-urgent hover:underline">
              <Phone className="size-3.5" aria-hidden="true" />
              {t("জরুরি সহায়তা: ৯৯৯", "Emergency: 999")}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function JourneyOption({
  to,
  icon,
  eyebrow,
  title,
  description,
  cta,
  bnClass,
  featured = false,
}: {
  to: "/intake" | "/report" | "/knowledge";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  bnClass: string;
  featured?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex min-h-64 flex-col rounded-lg border p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:hover:-translate-y-1 ${
        featured
          ? "border-primary/30 bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
          : "border-border bg-card text-card-foreground shadow-sm hover:border-primary/35 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex size-11 items-center justify-center rounded-lg ${
            featured ? "bg-primary-foreground/12" : "bg-accent text-primary"
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <ArrowRight
          className={`size-5 transition-transform group-hover:translate-x-1 ${
            featured ? "text-primary-foreground/65" : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
      </div>
      <p
        className={`${bnClass} mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
          featured ? "text-primary-foreground/65" : "text-muted-foreground"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className={`${bnClass} mt-1.5 text-xl font-semibold leading-snug`}>{title}</h2>
      <p
        className={`${bnClass} mt-3 flex-1 text-sm leading-relaxed ${
          featured ? "text-primary-foreground/76" : "text-muted-foreground"
        }`}
      >
        {description}
      </p>
      <span className={`${bnClass} mt-5 inline-flex items-center gap-1.5 text-sm font-semibold`}>
        {cta}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}