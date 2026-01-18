import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: get tasks with due reminders (not yet notified)
export const getUpcomingReminders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = new Date();
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const reminders = tasks.filter((task) => {
      // Skip if reminders disabled or task completed
      if (!task.reminderEnabled || task.status === "done") return false;

      const dueDate = new Date(task.dueDate);
      const minutesBefore = task.reminderMinutesBefore ?? 1440; // Default: 24 hours
      const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);

      // Check if reminder time has passed and we haven't notified yet
      const hasNotified = task.reminderLastNotifiedAt
        ? new Date(task.reminderLastNotifiedAt) >= reminderTime
        : false;

      return reminderTime <= now && !hasNotified;
    });

    return reminders;
  },
});

// Mutation: mark reminder as notified
export const markReminderNotified = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.patch(args.taskId, {
      reminderLastNotifiedAt: new Date().toISOString(),
    });

    return args.taskId;
  },
});

// Mutation: update reminder settings for a task
export const updateTaskReminder = mutation({
  args: {
    taskId: v.id("tasks"),
    reminderEnabled: v.optional(v.boolean()),
    reminderMinutesBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    const updates: Record<string, unknown> = {};

    if (args.reminderEnabled !== undefined) {
      updates.reminderEnabled = args.reminderEnabled;
    }

    if (args.reminderMinutesBefore !== undefined) {
      if (args.reminderMinutesBefore < 0) {
        throw new Error("Reminder time must be positive");
      }
      updates.reminderMinutesBefore = args.reminderMinutesBefore;
    }

    await ctx.db.patch(args.taskId, updates);
    return args.taskId;
  },
});
