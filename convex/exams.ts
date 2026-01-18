import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const isValidDateString = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// List exams for authenticated user
export const listExams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return ctx.db
      .query("exams")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// Create a new exam
export const createExam = mutation({
  args: {
    subject: v.string(),
    dateTime: v.string(), // ISO 8601
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const subject = args.subject.trim();
    if (!subject) throw new Error("Subject cannot be empty");
    if (!isValidDateString(args.dateTime)) {
      throw new Error("Invalid dateTime; expected ISO 8601 string");
    }

    return ctx.db.insert("exams", {
      userId: identity.subject,
      subject,
      dateTime: args.dateTime,
      location: args.location?.trim() || undefined,
    });
  },
});

// Update an existing exam
export const updateExam = mutation({
  args: {
    examId: v.id("exams"),
    subject: v.optional(v.string()),
    dateTime: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.examId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Exam not found or access denied");
    }

    const updates: Record<string, unknown> = {};

    if (args.subject !== undefined) {
      const subject = args.subject.trim();
      if (!subject) throw new Error("Subject cannot be empty");
      updates.subject = subject;
    }

    if (args.dateTime !== undefined) {
      if (!isValidDateString(args.dateTime)) {
        throw new Error("Invalid dateTime; expected ISO 8601 string");
      }
      updates.dateTime = args.dateTime;
    }

    if (args.location !== undefined) {
      updates.location = args.location.trim() || undefined;
    }

    await ctx.db.patch(args.examId, updates);
    return args.examId;
  },
});

// Delete an exam
export const deleteExam = mutation({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.examId);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Exam not found or access denied");
    }

    await ctx.db.delete(args.examId);
    return args.examId;
  },
});
