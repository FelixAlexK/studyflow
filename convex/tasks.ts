import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// Query: list tasks for the authenticated user
export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// Mutation: create a task linked to the authenticated user
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const title = args.title.trim();
    if (!title) {
      throw new Error("Title cannot be empty");
    }

    if (!isValidDateString(args.dueDate)) {
      throw new Error("Invalid due date; expected ISO 8601 string");
    }

    const status = args.status ?? "todo";

    return ctx.db.insert("tasks", {
      userId: identity.subject,
      title,
      description: args.description?.trim() || undefined,
      dueDate: args.dueDate,
      status,
    });
  },
});

// Mutation: update an existing task, enforcing ownership and validation
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    const updates: Record<string, unknown> = {};

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("Title cannot be empty");
      updates.title = title;
    }

    if (args.description !== undefined) {
      updates.description = args.description.trim() || undefined;
    }

    if (args.dueDate !== undefined) {
      if (!isValidDateString(args.dueDate)) {
        throw new Error("Invalid due date; expected ISO 8601 string");
      }
      updates.dueDate = args.dueDate;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.taskId, updates);
    return args.taskId;
  },
});

// Mutation: delete a task, enforcing ownership
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get(args.taskId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});
