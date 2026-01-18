import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  events: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('class'), v.literal('deadline')),
    startDate: v.string(), // ISO 8601 date string
    endDate: v.optional(v.string()), // ISO 8601 date string
    color: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  }).index('by_user', ['userId']),
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(), // ISO 8601 date string
    status: v.union(
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('done'),
    ),
  }).index('by_user', ['userId']),
  focusSessions: defineTable({
    userId: v.string(),
    duration: v.number(), // in minutes
    completedAt: v.string(), // ISO 8601 timestamp
  }).index('by_user', ['userId']),
});