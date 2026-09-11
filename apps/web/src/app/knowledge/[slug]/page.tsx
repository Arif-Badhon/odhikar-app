"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, ExternalLink, Info, Library, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public/PublicShell";
import { KNOWLEDGE_ARTICLES, getArticle, getCategory, getSourcesForArticle } from "@/lib/odhikar/knowledge";

import { notFound } from "next/navigation";

import React from "react";

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const article = KNOWLEDGE_ARTICLES.find((a) => a.slug === slug);
  if (!article) return <ArticleNotFound />;

  const category = getCategory(article.categoryId);
  const related = article.related
    .map((slug) => KNOWLEDGE_ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is (typeof KNOWLEDGE_ARTICLES)[number] => Boolean(a));
  const sources = getSourcesForArticle(article);

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <Link href="/knowledge"
          className="bn inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> তথ্যভাণ্ডার
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="bn rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
            {category?.nameBn}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-shared-soft px-3 py-1 text-xs font-medium text-shared">
            <BadgeCheck className="size-3.5" />
            <span className="bn">পর্যালোচিত টেমপ্লেট</span>
          </span>
        </div>

        <h1 className="bn mt-4 text-3xl font-bold leading-snug md:text-4xl">{article.titleBn}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{article.titleEn}</p>
        <p className="bn mt-4 text-base leading-relaxed text-foreground/90">{article.summaryBn}</p>

        <div className="mt-8 space-y-5">
          {article.sections.map((s) => (
            <section key={s.kind} className="surface-panel p-6">
              <h2 className="bn text-lg font-semibold">{s.titleBn}</h2>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.titleEn}</p>
              <ul className="mt-4 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="bn flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="surface-panel mt-6 p-6">
          <h2 className="bn text-lg font-semibold">সহায়তার নম্বর</h2>
          <ul className="mt-3 space-y-2">
            {article.contacts.map((c) => (
              <li key={c.value} className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-primary" />
                <span className="bn">{c.labelBn}</span>
                <span className="ml-auto font-semibold tabular-nums">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <section className="surface-panel mt-6 p-6" aria-labelledby="legal-sources">
          <h2 id="legal-sources" className="bn flex items-center gap-2 text-lg font-semibold"><Library className="size-5 text-primary" /> আইনি উৎস ও রেফারেন্স</h2>
          <p className="bn mt-2 text-sm text-muted-foreground">এই সাধারণ তথ্য প্রস্তুতের সময় নিচের সরকারি আইন বা সেবার উৎস বিবেচনা করা হয়েছে। নির্দিষ্ট ধারা প্রয়োগের আগে মানব পর্যালোচনা প্রয়োজন।</p>
          <ul className="mt-4 space-y-3">{sources.map(source=><li key={source.titleEn} className="rounded-lg border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="bn font-medium">{source.titleBn}</p><p className="text-xs text-muted-foreground">{source.titleEn} · {source.authority}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${source.status==='verified-official'?'bg-shared-soft text-shared':'bg-draft-soft text-draft-foreground'}`}>{source.status==='verified-official'?'Official source':'Source verification required'}</span></div>{source.officialUrl?<a className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary" href={source.officialUrl} target="_blank" rel="noreferrer">সরকারি উৎস দেখুন <ExternalLink className="size-3"/></a>:null}</li>)}</ul>
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-draft/40 bg-draft-soft p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-draft-foreground" />
          <p className="bn text-sm leading-relaxed text-draft-foreground">
            এটি সাধারণ আইনি তথ্য, ব্যক্তিগত আইনি পরামর্শ নয়। আপনার পরিস্থিতি অনুযায়ী করণীয় জানতে
            একজন প্যারালিগ্যাল বা আইনজীবীর সঙ্গে কথা বলুন।
          </p>
        </div>

        {related.length ? (
          <div className="mt-10">
            <h2 className="bn text-lg font-semibold">সম্পর্কিত বিষয়</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/knowledge/${r.slug}`}
                  className="surface-panel p-4 transition-shadow hover:shadow-md"
                >
                  <p className="bn font-medium leading-snug">{r.titleBn}</p>
                  <p className="bn mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summaryBn}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 rounded-2xl bg-primary p-6 text-primary-foreground">
          <h2 className="bn text-xl font-semibold leading-snug">
            আপনার নিজের বিষয়ে সহায়তা দরকার?
          </h2>
          <p className="bn mt-2 text-sm text-primary-foreground/80">
            আপনার কথা শুনে আমরা বিষয়টি গুছিয়ে আইন সহায়তা কেন্দ্রে পৌঁছে দিই।
          </p>
          <Button asChild variant="secondary" className="mt-5 h-12">
            <Link href="/intake">
              <span className="bn">সহায়তা শুরু করুন</span>
            </Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}

function ArticleNotFound() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
        <h1 className="bn text-2xl font-semibold">এই বিষয়টি পাওয়া যায়নি</h1>
        <p className="bn mt-2 text-sm text-muted-foreground">
          লিংকটি হয়তো পুরোনো। তথ্যভাণ্ডার থেকে আবার খুঁজে দেখুন।
        </p>
        <Button asChild className="mt-6 h-12">
          <Link href="/knowledge">
            <span className="bn">তথ্যভাণ্ডারে ফিরুন</span>
          </Link>
        </Button>
      </section>
    </PublicShell>
  );
}

