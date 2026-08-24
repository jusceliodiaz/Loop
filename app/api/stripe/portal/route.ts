import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!subscription?.stripe_customer_id) return new Response("no billing account", { status: 400 });

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/`,
  });

  return Response.json({ url: session.url });
}
