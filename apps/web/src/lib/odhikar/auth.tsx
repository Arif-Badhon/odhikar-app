import { useCallback, useEffect, useState } from "react";

export interface StaffUser {
  username: string;
  name: string;
  role: string;
  clinic_name: string;
}

export function useParalegalSession() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const token = localStorage.getItem("odhikar_access_token");
      if (!token) {
        if (active) setReady(true);
        return;
      }
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${url}/auth/me?token=${token}`);
        if (!res.ok) {
          localStorage.removeItem("odhikar_access_token");
          if (active) setReady(true);
          return;
        }
        const profile = await res.json();
        if (active) {
          setUser({ username: profile.email, name: profile.name, role: profile.role, clinic_name: profile.clinic_name });
          setReady(true);
        }
      } catch (err) {
        localStorage.removeItem("odhikar_access_token");
        if (active) setReady(true);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return errorData.detail || "Incorrect username or password.";
      }
      const data = await res.json();
      localStorage.setItem("odhikar_access_token", data.access_token);
      
      // Load user profile
      const meRes = await fetch(`${url}/auth/me?token=${data.access_token}`);
      if (meRes.ok) {
        const profile = await meRes.json();
        setUser({ username: profile.email, name: profile.name, role: profile.role, clinic_name: profile.clinic_name });
      }
      return null;
    } catch (err) {
      return "Network error while connecting to authentication server.";
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem("odhikar_access_token");
    setUser(null);
  }, []);

  return { user, ready, signIn, signOut };
}
