"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function History() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <Link href="/staff/training" className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" />Training catalog
      </Link>
      <h1 className="mt-5 text-3xl font-semibold">Attempt history</h1>
      <p className="text-sm text-muted-foreground">Your private simulation practice record.</p>
      <div className="surface-panel mt-6 overflow-hidden">
        <p className="p-10 text-center text-sm text-muted-foreground">Training history is temporarily unavailable.</p>
      </div>
    </main>
  );
}