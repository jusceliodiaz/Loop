// Source of truth for what each plan allows. No other file should contain
// the strings 'free' | 'basic' | 'pro' in a business-rule conditional —
// import PlanId/PLANS instead.
//
// monthlyShareHours and maxCallMinutes are cost controls, not just UX: they
// bound how much LiveKit bandwidth (screen share is the expensive part, not
// voice) a single account can consume in a month. Re-check these numbers
// against LiveKit Cloud's current pricing before launch — they were sized
// against the free/Build tier's ~50GB egress and are meant to keep even a
// maxed-out plan comfortably under 3x its own infra cost. Never ship
// "unlimited" without a number behind it.
export const PLANS = {
  free: {
    label: "Free",
    textRooms: true,
    voice: false,
    screenShare: false,
    maxShareProfile: null as "code" | "default" | "hq" | null,
    monthlyShareHours: 0,
    maxCallMinutes: 0,
    maxRoomsCreated: 3,
  },
  basic: {
    label: "Basic",
    textRooms: true,
    voice: true,
    screenShare: true,
    maxShareProfile: "default" as "code" | "default" | "hq" | null,
    monthlyShareHours: 10,
    maxCallMinutes: 60,
    maxRoomsCreated: 5,
  },
  pro: {
    label: "Pro",
    textRooms: true,
    voice: true,
    screenShare: true,
    maxShareProfile: "hq" as "code" | "default" | "hq" | null,
    monthlyShareHours: 100,
    maxCallMinutes: 240,
    maxRoomsCreated: 50,
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

export const PLAN_ORDER: PlanId[] = ["free", "basic", "pro"];
