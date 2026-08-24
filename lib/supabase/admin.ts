import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Only for server code that isn't acting
// on behalf of a logged-in user's session — the Stripe checkout route (to
// stamp a customer id), the Stripe/LiveKit webhooks, and the admin plan-comp
// action. Never import this from client code or expose the key with a
// NEXT_PUBLIC_ prefix.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
