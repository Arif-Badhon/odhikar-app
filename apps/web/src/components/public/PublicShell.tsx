"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Languages, Lock, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/odhikar/language";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-border p-0.5 ${className}`}
      role="group"
      aria-label="Language / ভাষা"
    >
      <Languages className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {(["bn", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "bn" ? "বাংলা" : "EN"}
        </button>
      ))}
    </div>
  );
}

const NAV = [
  { to: "/intake", bn: "সহায়তা নিন", en: "Get help" },
  { to: "/report", bn: "রিপোর্ট করুন", en: "Report" },
  { to: "/knowledge", bn: "আইন জানুন", en: "Legal knowledge" },
  { to: "/about", bn: "আমাদের সম্পর্কে", en: "About" },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="bn block text-base font-semibold tracking-tight">অধিকার</span>
            <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Odhikar
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const isActive = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                href={n.to}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <span className={lang === "bn" ? "bn" : ""}>{t(n.bn, n.en)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <Link
            href="/paralegal/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="size-3.5" /> Staff login
          </Link>
          <Button asChild size="sm" className="h-10">
            <Link href="/intake">
              <span className={lang === "bn" ? "bn" : ""}>
                {t("সহায়তা শুরু করুন", "Start getting help")}
              </span>
            </Link>
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg border border-border"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((n) => {
              const isActive = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-base ${lang === "bn" ? "bn" : ""} ${isActive ? "bg-accent font-medium" : ""}`}
                >
                  {t(n.bn, n.en)}{" "}
                  <span className="text-xs text-muted-foreground">· {t(n.en, n.bn)}</span>
                </Link>
              );
            })}
            <Link
              href="/paralegal/login"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-muted-foreground"
            >
              <Lock className="size-4" /> Staff / Paralegal login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="bn text-base font-semibold">অধিকার · Odhikar</span>
          </div>
          <p className="bn mt-3 text-sm leading-relaxed text-muted-foreground">
            আইন সহায়তা পেতে আপনার বিষয়টি গুছিয়ে নিতে সাহায্য করে। এটি কোনো আইনজীবী নয়।
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            <span className="bn">জরুরি নম্বর</span>
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-3.5" /> <span className="bn">জাতীয় জরুরি সেবা</span> — 999
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-3.5" /> <span className="bn">আইন সহায়তা</span> — 16430
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-3.5" /> <span className="bn">নারী ও শিশু সহায়তা</span> — 109
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            <span className="bn">দরকারি লিংক</span>
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/intake" className="bn hover:text-foreground">
                সহায়তা শুরু করুন
              </Link>
            </li>
            <li>
              <Link href="/knowledge" className="bn hover:text-foreground">
                আইন বিষয়ক তথ্যভাণ্ডার
              </Link>
            </li>
            <li>
              <Link href="/report" className="bn hover:text-foreground">
                অপরাধ রিপোর্ট
              </Link>
            </li>
            <li>
              <Link href="/about" className="bn hover:text-foreground">
                সেবা ও সীমাবদ্ধতা
              </Link>
            </li>
            <li>
              <Link href="/paralegal/login" className="hover:text-foreground">
                Staff / Paralegal login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            <span className="bn">গোপনীয়তা ও দায়মুক্তি</span>
          </h3>
          <p className="bn mt-3 text-sm leading-relaxed text-muted-foreground">
            আপনার বলা কথা কেবল আইন সহায়তার জন্য ব্যবহার হয়। কোনো কিছু আদালত বা থানায় স্বয়ংক্রিয়ভাবে
            দাখিল হয় কাম। একজন প্যারালিগ্যাল সব কিছু দেখে অনুমোদন না দেওয়া পর্যন্ত কিছুই চূড়ান্ত নয়।
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Prototype for BRAC IT CodeSprint 2026 — demo uses synthetic data only.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </LanguageProvider>
  );
}
