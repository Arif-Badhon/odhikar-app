import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureDemoStaff } from "./auth.functions";

export interface StaffUser {
  username: string;
  name: string;
  role: string;
}

export function useParalegalSession() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !active) return setReady(true);
      const [profile, roles] = await Promise.all([
        supabase.from("staff_profiles").select("display_name,email,active").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", data.user.id).limit(1).maybeSingle(),
      ]);
      if (profile.data?.active && roles.data && active) {
        setUser({ username: profile.data.email, name: profile.data.display_name, role: roles.data.role });
      } else if (active) await supabase.auth.signOut();
      if (active) setReady(true);
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => void load());
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<string | null> => {
    let email = username.trim().toLowerCase();
    if (!email.includes("@")) {
      const provisioned = await ensureDemoStaff({ data: { username: email, password } });
      if (!provisioned.ok) return "Incorrect username or password.";
      email = provisioned.email;
    }
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return "Sign-in failed. Check your staff email and password.";
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, ready, signIn, signOut };
}
