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

    // Create check-in
    await ctx.db.insert("learningCheckIns", {
      userId: identity.subject,
      date: today,
    });

    // Update progress - increment total sessions
    const progress = await ctx.db
      .query("learningProgress")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        totalSessions: progress.totalSessions + 1,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Create initial progress record
      await ctx.db.insert("learningProgress", {
        userId: identity.subject,
        totalSessions: 1,
        lastUpdated: new Date().toISOString(),
      });
    }

    return today;
  },
});

// Get learning progress
export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const progress = await ctx.db
      .query("learningProgress")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    // Goal: 10 sessions per week = 100%
    const weeklyGoal = 10;
    const totalSessions = progress?.totalSessions ?? 0;
    
    // Calculate progress percentage based on cumulative sessions
    // Each session is worth 10%, capped at 100%
    const percentage = Math.min((totalSessions / weeklyGoal) * 100, 100);

    return {
      totalSessions,
      percentage: Math.round(percentage),
      weeklyGoal,
    };
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
