import type { SupabaseClient } from "@supabase/supabase-js";

// The quota resets on the subscription's own billing cycle, not the
// calendar month — someone who upgraded on the 20th shouldn't have their
// quota reset again 10 days later on the 1st. Free users (no subscription,
// no current_period_end) fall back to the calendar month.
function periodStart(currentPeriodEnd: string | null): Date {
  if (currentPeriodEnd) {
    const end = new Date(currentPeriodEnd);
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthlyShareSeconds(
  supabase: SupabaseClient,
  userId: string,
  currentPeriodEnd: string | null,
): Promise<number> {
  const since = periodStart(currentPeriodEnd).toISOString();
  const { data } = await supabase
    .from("room_sessions")
    .select("share_seconds")
    .eq("user_id", userId)
    .gte("started_at", since);

  return (data ?? []).reduce((sum, row) => sum + row.share_seconds, 0);
}
