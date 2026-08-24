import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, type PlanId } from "@/config/plans";

export type PlanState = {
  id: PlanId;
  plan: (typeof PLANS)[PlanId];
  status: "active" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
};

// No `subscriptions` row at all means "always been free" — most users. A
// canceled subscription also drops to free; `past_due` (a failed renewal
// still in Stripe's retry window) keeps the plan's access as a grace period,
// see LOOP_PLANOS_E_BILLING.md §6 — cutting access on the first failed
// charge is disproportionate for something as routine as a declined card.
export async function getPlanState(supabase: SupabaseClient, userId: string): Promise<PlanState> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const id: PlanId = !data || data.status === "canceled" ? "free" : (data.plan as PlanId);

  return {
    id,
    plan: PLANS[id],
    status: (data?.status as PlanState["status"]) ?? "active",
    currentPeriodEnd: data?.current_period_end ?? null,
    cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
    hasStripeCustomer: !!data?.stripe_customer_id,
  };
}
