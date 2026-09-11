"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParalegalSession } from "@/lib/odhikar/auth";


export default function StaffLogin() {
  const navigate = useNavigate();
  const { user, ready, signIn } = useParalegalSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) void navigate({ to: "/paralegal" });
  }, [ready, user, navigate]);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-6" />
          <span className="text-lg font-semibold tracking-tight">অধিকার · Odhikar</span>
          <span className="rounded bg-primary-foreground/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Internal
          </span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-snug">
            Case work that stays with people, not with a machine.
          </h2>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/75">
            Every intake is prepared for you — structured facts, provenance on each field, the
            client's own recording, and gaps clearly marked. Nothing is final until you approve it.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Authorised legal-aid staff only · Synthetic demo data
        </p>
      </section>

      <section className="flex items-center justify-center bg-secondary/40 px-5 py-12">
        <div className="w-full max-w-sm">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to public site
          </Link>

          <div className="surface-panel mt-5 p-7">
            <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
              <Lock className="size-5" />
            </span>
            <h1 className="mt-4 text-xl font-semibold">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Case records contain sensitive client statements. Sign in to continue.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                const err = await signIn(username, password);
                setError(err);
                setSubmitting(false);
                if (!err) void navigate({ to: "/paralegal" });
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="u">Username</Label>
                <Input
                  id="u"
                  className="h-11"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p">Password</Label>
                <Input
                  id="p"
                  type="password"
                  className="h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error ? <p className="text-sm text-urgent">{error}</p> : null}
              <Button type="submit" className="h-11 w-full" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>

            <p className="mt-5 rounded-lg bg-secondary/70 p-3 text-xs text-muted-foreground">
              Supabase Auth demo credentials — <strong>nasrin</strong> / <strong>odhikar2026</strong> (paralegal) or{" "}
              <strong>coordinator</strong> / <strong>odhikar2026</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
