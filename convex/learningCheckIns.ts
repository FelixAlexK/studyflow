import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get today's date as ISO string (YYYY-MM-DD)
const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// List all learning check-ins for the user
export const listCheckIns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return ctx.db
      .query("learningCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Check if user has already checked in today
export const hasCheckedInToday = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const today = getTodayDate();

    const existing = await ctx.db
      .query("learningCheckIns")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today),
      )
      .first();

    return !!existing;
  },
});

// Create a learning check-in for today
export const createCheckIn = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const today = getTodayDate();

    // Check if already checked in today
    const existing = await ctx.db
      .query("learningCheckIns")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today),
      )
      .first();

    if (existing) {
      throw new Error("Already checked in today");
    }

    return ctx.db.insert("learningCheckIns", {
      userId: identity.subject,
      date: today,
    });
  },
});

// Count check-ins for current streak or in a date range
export const getCheckInCount = query({
  args: { daysBack: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const checkIns = await ctx.db
      .query("learningCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter to last N days
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - args.daysBack);

    return checkIns.filter((checkIn) => {
      const checkInDate = new Date(checkIn.date);
      return checkInDate >= startDate;
    }).length;
  },
});
