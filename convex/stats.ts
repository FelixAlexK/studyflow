import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: get completed tasks count for authenticated user
export const getCompletedTasksCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return tasks.filter((t) => t.status === "done").length;
  },
});

// Query: get focus sessions count for authenticated user
export const getFocusSessionsCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return sessions.length;
  },
});

// Query: get total focus time in minutes
export const getTotalFocusMinutes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const sessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return sessions.reduce((sum, s) => sum + s.duration, 0);
  },
});

// Mutation: log a completed focus session
export const logFocusSession = mutation({
  args: {
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (args.duration <= 0) {
      throw new Error("Duration must be positive");
    }

    return ctx.db.insert("focusSessions", {
      userId: identity.subject,
      duration: args.duration,
      completedAt: new Date().toISOString(),
    });
  },
});
