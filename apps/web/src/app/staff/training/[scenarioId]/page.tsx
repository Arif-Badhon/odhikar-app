"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Session() {
  return (
    <main className="mx-auto flex h-[calc(100vh-64px)] max-w-5xl flex-col px-5 py-8">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/staff/training" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" /> Exit Session
        </Link>
      </header>
      <div className="flex-1 surface-panel flex items-center justify-center">
        <p className="text-muted-foreground">Training simulation is temporarily unavailable.</p>
      </div>
    </main>
  );
}