import type { PlanId } from "@/config/plans";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PRICE_BY_PLAN: Partial<Record<PlanId, string | undefined>> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC,
  pro: process.env.STRIPE_PRICE_ID_PRO,
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICE_BY_PLAN[plan as PlanId];
  if (!priceId) return new Response("unknown plan", { status: 400 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripe();
  let customerId = subscription?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    // service-role write: subscriptions is locked to everyone else, see schema.sql
    await createAdminClient()
      .from("subscriptions")
      .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/?upgrade=success`,
    cancel_url: `${origin}/?upgrade=cancelled`,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: { metadata: { supabase_user_id: user.id, plan } },
  });

  return Response.json({ url: session.url });
}
