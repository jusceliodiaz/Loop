import type Stripe from "stripe";
import type { PlanId } from "@/config/plans";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Public route — Stripe calls this with no Supabase session, so it's listed
// in PUBLIC_PATHS (lib/supabase/middleware.ts). Trust comes from the
// signature check below, not from auth.
//
// Every handler here is an upsert of the CURRENT state, never a delta —
// Stripe doesn't guarantee delivery order, so `subscription.updated` can
// arrive before `checkout.session.completed`. And every event is recorded
// in `processed_events` before it's acted on, so a retried delivery (Stripe
// resends on anything but a fast 200) is a no-op the second time.

function planFromPriceId(priceId: string | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ID_BASIC) return "basic";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return null;
}

// current_period_end lives on the subscription ITEM, not the subscription
// itself, as of the API version this SDK targets — every plan here has
// exactly one item, so [0] is always the one that matters.
function currentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const end = subscription.items.data[0]?.current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
}

function mapStatus(stripeStatus: Stripe.Subscription.Status): "active" | "past_due" | "canceled" {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled" || stripeStatus === "incomplete_expired") return "canceled";
  return "past_due"; // past_due, unpaid, incomplete — grace period, see LOOP_PLANOS_E_BILLING.md §6
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createAdminClient();

  const { error: dupeError } = await admin.from("processed_events").insert({ id: event.id });
  if (dupeError) return Response.json({ received: true, duplicate: true });

  async function upsertByCustomer(
    customerId: string,
    fields: {
      plan?: PlanId;
      status: "active" | "past_due" | "canceled";
      stripeSubscriptionId?: string | null;
      currentPeriodEnd?: string | null;
      cancelAtPeriodEnd?: boolean;
    },
  ) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("user_id, plan")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (!existing) return; // no user linked to this customer yet — nothing to update

    const effectivePlan = fields.status === "canceled" ? "free" : (fields.plan ?? (existing.plan as PlanId));

    await admin
      .from("subscriptions")
      .update({
        plan: effectivePlan,
        status: fields.status,
        stripe_subscription_id: fields.stripeSubscriptionId,
        current_period_end: fields.currentPeriodEnd,
        cancel_at_period_end: fields.cancelAtPeriodEnd ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", existing.user_id);

    await admin.from("profiles").update({ plan: effectivePlan }).eq("id", existing.user_id);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (!customerId || !subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = planFromPriceId(subscription.items.data[0]?.price.id);
      if (!plan) break;

      await upsertByCustomer(customerId, {
        plan,
        status: mapStatus(subscription.status),
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: currentPeriodEnd(subscription),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const plan = planFromPriceId(subscription.items.data[0]?.price.id);

      await upsertByCustomer(customerId, {
        plan: plan ?? undefined,
        status: event.type === "customer.subscription.deleted" ? "canceled" : mapStatus(subscription.status),
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: currentPeriodEnd(subscription),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;

      // Don't drop the plan — just flag it. The account keeps access during
      // Stripe's own retry window; a later subscription.updated/deleted
      // event is what actually resolves it (paid → active, exhausted → canceled).
      await upsertByCustomer(customerId, { status: "past_due" });
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
