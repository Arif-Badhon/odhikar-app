import { createServerFn } from "@tanstack/react-start";

const DEMO = {
  nasrin: { email: "nasrin@odhikar.demo", password: "odhikar2026", name: "Nasrin Akter", role: "paralegal" },
  coordinator: { email: "coordinator@odhikar.demo", password: "odhikar2026", name: "Shahin Rahman", role: "coordinator" },
} as const;

/** Creates only the two documented synthetic demo staff accounts, never arbitrary users. */
export const ensureDemoStaff = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => ({
    username: String(input?.username ?? "").trim().toLowerCase(),
    password: String(input?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    const demo = DEMO[data.username as keyof typeof DEMO];
    if (!demo || demo.password !== data.password) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users = await supabaseAdmin.auth.admin.listUsers();
    let user = users.data.users.find((item) => item.email === demo.email);
    if (!user) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { display_name: demo.name },
      });
      if (created.error || !created.data.user) return { ok: false as const };
      user = created.data.user;
    }
    // Remove an initial placeholder profile, if present, before binding the real Auth identity.
    const placeholder = await supabaseAdmin.from("staff_profiles").select("id").eq("email", demo.email).neq("id", user.id).maybeSingle();
    if (placeholder.data) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", placeholder.data.id);
      await supabaseAdmin.from("staff_profiles").delete().eq("id", placeholder.data.id);
    }
    await supabaseAdmin.from("staff_profiles").upsert({
      id: user.id,
      email: demo.email,
      display_name: demo.name,
      clinic_name: demo.role === "paralegal" ? "Manikganj Legal Aid Clinic" : "Odhikar Coordination Desk",
      active: true,
    });
    await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: demo.role }, { onConflict: "user_id,role" });
    return { ok: true as const, email: demo.email };
  });