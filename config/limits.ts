// The actual call-length cap now comes from the user's plan (config/plans.ts,
// maxCallMinutes) and is enforced server-side as the LiveKit token's TTL —
// this is just how early the in-call countdown badge turns red.
export const WARNING_AT_SECONDS_LEFT = 120;
