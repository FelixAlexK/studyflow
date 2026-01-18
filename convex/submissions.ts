import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// List submissions for the authenticated user
export const listSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// List submissions for a specific subject
export const listBySubject = query({
  args: { subject: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return ctx.db
      .query("submissions")
      .withIndex("by_subject", (q) =>
        q.eq("userId", identity.subject).eq("subject", args.subject),
      )
      .collect();
  },
});

// Create a submission
export const createSubmission = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const title = args.title.trim();
    if (!title) throw new Error("Title cannot be empty");
    const subject = args.subject.trim();
    if (!subject) throw new Error("Subject cannot be empty");
    if (!isValidDateString(args.dueDate)) {
      throw new Error("Invalid dueDate; expected ISO 8601 string");
    }

    return ctx.db.insert("submissions", {
      userId: identity.subject,
      title,
      subject,
      dueDate: args.dueDate,
      status: "open",
    });
  },
});

// Update a submission
export const updateSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
    title: v.optional(v.string()),
    subject: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("open"), v.literal("done"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.submissionId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Submission not found or access denied");
    }

    const updates: Record<string, unknown> = {};

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new Error("Title cannot be empty");
      updates.title = title;
    }

    if (args.subject !== undefined) {
      const subject = args.subject.trim();
      if (!subject) throw new Error("Subject cannot be empty");
      updates.subject = subject;
    }

    if (args.dueDate !== undefined) {
      if (!isValidDateString(args.dueDate)) {
        throw new Error("Invalid dueDate; expected ISO 8601 string");
      }
      updates.dueDate = args.dueDate;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.submissionId, updates);
    return args.submissionId;
  },
});

// Mark submission as done
export const markDone = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.submissionId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Submission not found or access denied");
    }

    await ctx.db.patch(args.submissionId, { status: "done" });
    return args.submissionId;
  },
});

// Delete a submission
export const deleteSubmission = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.submissionId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Submission not found or access denied");
    }

    await ctx.db.delete(args.submissionId);
    return args.submissionId;
  },
});
