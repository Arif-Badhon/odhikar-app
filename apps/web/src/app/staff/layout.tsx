"use client";

import Link from "next/link";
import { BarChart3, BriefcaseBusiness, ExternalLink, GraduationCap, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParalegalSession } from "@/lib/odhikar/auth";
import { useCaseStore } from "@/lib/odhikar/store";
import { useEffect } from "react";


export default function ParalegalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, ready, signOut } = useParalegalSession();
  const { refresh } = useCaseStore();
  useEffect(() => { if (user) void refresh(); }, [user, refresh]);

  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );

  if (!user) return <Navigate to="/paralegal/login" />;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            <span className="text-base font-semibold tracking-tight">অধিকার · Odhikar</span>
            <span className="rounded bg-primary-foreground/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">
              Internal
            </span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/paralegal" className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
              <BarChart3 className="size-3.5" /> Dashboard
            </Link>
            <Link href="/paralegal/cases" className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
              <BriefcaseBusiness className="size-3.5" /> Cases
            </Link>
            <Link href="/paralegal/training" className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
              <GraduationCap className="size-3.5" /> Training
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="hidden opacity-60 lg:inline">{pathname}</span>
            <Link href="/"
              className="hidden items-center gap-1.5 opacity-70 hover:opacity-100 sm:flex"
              target="_blank"
            >
              <ExternalLink className="size-3.5" /> Open public site
            </Link>
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1">
              {user.name} · {user.role}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-primary-foreground hover:bg-primary-foreground/15"
              onClick={signOut}
            >
              <LogOut className="size-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-border bg-card py-6">
        <p className="mx-auto max-w-7xl px-5 text-xs text-muted-foreground">
          Nothing in Odhikar is final until a paralegal reviews and approves it. Drafts are generated
          from reviewed templates and contain unverified placeholders. Synthetic demo data only.
        </p>
      </footer>
    </div>
  );
}
