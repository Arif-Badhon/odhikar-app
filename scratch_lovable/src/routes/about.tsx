import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public/PublicShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — অধিকার | About Odhikar" },
      {
        name: "description",
        content:
          "What Odhikar does, what it deliberately does not do, how information is handled, and how human paralegals review every case.",
      },
      { property: "og:title", content: "আমাদের সম্পর্কে — অধিকার" },
      {
        property: "og:description",
        content: "Odhikar prepares and informs; it never gives legal advice and never files anything.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const DOES = [
  "আপনার কথা শুনে বিষয়টি গুছিয়ে লিখে রাখে।",
  "কোন কাগজ ও তথ্য লাগতে পারে তা জানায়।",
  "সাধারণ আইনি তথ্য সহজ ভাষায় দেয়।",
  "আপনাকে নিকটস্থ আইন সহায়তা কেন্দ্রের সঙ্গে যুক্ত করে।",
  "একজন প্যারালিগ্যালের কাছে আপনার তথ্য পৌঁছে দেয়।",
];

const DOES_NOT = [
  "আদালত, থানা বা কোনো দপ্তরে কিছু দাখিল করে না।",
  "মামলার ফলাফল বা কে জিতবে তা বলে না।",
  "কী সমঝোতা করবেন সেই পরামর্শ দেয় না।",
  "আইনজীবীর ব্যক্তিগত পরামর্শের বিকল্প নয়।",
];

function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" /> <span className="bn">সেবা ও সীমাবদ্ধতা</span>
        </span>
        <h1 className="bn mt-5 text-3xl font-bold leading-snug md:text-4xl">
          অধিকার কী করে, আর কী করে না
        </h1>
        <p className="bn mt-3 text-base leading-relaxed text-muted-foreground">
          অধিকার একটি জনসেবামূলক প্ল্যাটফর্ম, যা আইন সহায়তা পাওয়ার পথটিকে সহজ করে। এটি তথ্য দেয় ও
          প্রস্তুতি নিতে সাহায্য করে — কিন্তু এটি আইনজীবী নয়।
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <div className="surface-panel p-6">
            <h2 className="bn flex items-center gap-2 text-lg font-semibold text-shared">
              <CheckCircle2 className="size-5" /> যা করে
            </h2>
            <ul className="mt-4 space-y-3">
              {DOES.map((d) => (
                <li key={d} className="bn text-sm leading-relaxed text-muted-foreground">
                  • {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-panel p-6">
            <h2 className="bn flex items-center gap-2 text-lg font-semibold text-urgent">
              <XCircle className="size-5" /> যা করে না
            </h2>
            <ul className="mt-4 space-y-3">
              {DOES_NOT.map((d) => (
                <li key={d} className="bn text-sm leading-relaxed text-muted-foreground">
                  • {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-panel mt-6 p-6">
          <h2 className="bn text-lg font-semibold">আপনার তথ্য কীভাবে ব্যবহৃত হয়</h2>
          <p className="bn mt-3 text-sm leading-relaxed text-muted-foreground">
            আপনার বলা কথা ও রেকর্ডিং কেবল আপনার বিষয়টি বোঝা ও আইন সহায়তা কেন্দ্রে পৌঁছে দেওয়ার
            জন্য ব্যবহার হয়। অনুমোদিত প্যারালিগ্যাল ছাড়া অন্য কেউ তা দেখেন না। কোনো তথ্য
            স্বয়ংক্রিয়ভাবে বাইরে পাঠানো হয় না।
          </p>
          <p className="bn mt-3 text-sm leading-relaxed text-muted-foreground">
            খসড়া অভিযোগপত্র পর্যালোচিত টেমপ্লেট থেকে তৈরি হয় এবং অজানা তথ্যের জায়গা ফাঁকা রাখা
            হয়। প্যারালিগ্যাল অনুমোদন না দেওয়া পর্যন্ত কোনো কিছুই চূড়ান্ত নয়।
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-draft/40 bg-draft-soft p-4 text-sm text-draft-foreground">
          <strong>Prototype notice.</strong> This is a BRAC IT CodeSprint 2026 prototype. Clinics,
          appointment slots and demo case records are synthetic.
        </div>

        <div className="mt-8">
          <Button asChild className="h-12">
            <Link to="/intake">
              <span className="bn">সহায়তা শুরু করুন</span>
            </Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
