"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Info, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PublicShell } from "@/components/public/PublicShell";
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from "@/lib/odhikar/knowledge";


export default function KnowledgeIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KNOWLEDGE_ARTICLES.filter((a) => {
      if (category && a.categoryId !== category) return false;
      if (!q) return true;
      return (
        a.titleBn.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.summaryBn.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <PublicShell>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
            <BookOpen className="size-3.5" /> <span className="bn">আইন জানুন</span>
          </span>
          <h1 className="bn mt-4 text-3xl font-bold leading-snug md:text-4xl">
            সহজ ভাষায় আইন বিষয়ক তথ্য
          </h1>
          <p className="bn mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            বাংলাদেশের প্রেক্ষাপটে সাধারণ আইনি তথ্য — কোন কাগজ লাগে, কোথায় যেতে হয় এবং কখন মানুষের
            সহায়তা নেওয়া দরকার।
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="খুঁজুন — দেনমোহর, যৌতুক, জমি, মজুরি…"
              aria-label="Search legal knowledge"
              className="bn h-12 pl-10 pr-10 text-base"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === null} onClick={() => setCategory(null)} label="সব বিষয়" />
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(category === c.id ? null : c.id)}
              label={c.nameBn}
            />
          ))}
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          {results.length} <span className="bn">টি বিষয় পাওয়া গেছে</span>
        </p>

        {results.length === 0 ? (
          <div className="surface-panel mt-4 p-10 text-center">
            <p className="bn text-base font-medium">এই শব্দে কিছু পাওয়া যায়নি</p>
            <p className="bn mt-2 text-sm text-muted-foreground">
              অন্য শব্দে খুঁজুন, অথবা উপরের বিষয়গুলো থেকে বেছে নিন।
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => {
              const cat = KNOWLEDGE_CATEGORIES.find((c) => c.id === a.categoryId);
              return (
                <Link
                  key={a.id}
                  to="/knowledge/$slug"
                  params={{ slug: a.slug }}
                  className="surface-panel flex flex-col p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="bn w-fit rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-primary">
                    {cat?.nameBn}
                  </span>
                  <h2 className="bn mt-3 text-lg font-semibold leading-snug">{a.titleBn}</h2>
                  <p className="bn mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {a.summaryBn}
                  </p>
                  <span className="bn mt-4 text-sm font-medium text-primary">বিস্তারিত পড়ুন →</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-draft/40 bg-draft-soft p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-draft-foreground" />
          <p className="bn text-sm leading-relaxed text-draft-foreground">
            এখানকার তথ্য সাধারণ আইনি তথ্য, কারও ব্যক্তিগত আইনি পরামর্শ নয়। আপনার নিজের বিষয়ে
            সিদ্ধান্ত নেওয়ার আগে একজন প্যারালিগ্যাল বা আইনজীবীর সঙ্গে কথা বলুন।
          </p>
        </div>
      </section>
    </PublicShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`bn rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
