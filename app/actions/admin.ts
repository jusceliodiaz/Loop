"use server";

import { revalidatePath } from "next/cache";
import type { PlanId } from "@/config/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? { supabase, adminId: user.id } : null;
}

export async function approveMember(userId: string) {
  const ctx = await requireAdmin();
  if (!ctx) return { error: "não autorizado" };

  const { error } = await ctx.supabase.from("profiles").update({ approved: true }).eq("id", userId);
  if (error) return { error: "não autorizado" };
  revalidatePath("/", "layout");
  return { error: null };
}

export async function setMemberRole(userId: string, role: "admin" | "member") {
  const ctx = await requireAdmin();
  if (!ctx) return { error: "não autorizado" };

  const { error } = await ctx.supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: "não autorizado" };
  revalidatePath("/", "layout");
  return { error: null };
}

// Comp a plan without going through Stripe — for testing or goodwill. Uses
// the service-role client because `subscriptions` and `profiles.plan` are
// both locked to service-role writes (see schema.sql); the admin check
// above is what stands in for RLS here, since bypassing RLS means nothing
// downstream of this function enforces who's allowed to call it.
export async function adminSetPlan(userId: string, plan: PlanId) {
  const ctx = await requireAdmin();
  if (!ctx) return { error: "não autorizado" };

  const admin = createAdminClient();

  // Read-then-write instead of a blind upsert: a comp must not clobber an
  // existing Stripe linkage (stripe_customer_id/stripe_subscription_id) —
  // otherwise a later webhook for that customer can no longer find the row.
  const { data: existing } = await admin.from("subscriptions").select("user_id").eq("user_id", userId).maybeSingle();
  const { error: subError } = existing
    ? await admin.from("subscriptions").update({ plan, status: "active" }).eq("user_id", userId)
    : await admin.from("subscriptions").insert({ user_id: userId, plan, status: "active" });
  if (subError) return { error: subError.message };

  const { error: profileError } = await admin.from("profiles").update({ plan }).eq("id", userId);
  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  return { error: null };
}
