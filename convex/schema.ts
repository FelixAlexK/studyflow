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
    type: v.union(v.literal('vorlesung'), v.literal('übung'), v.literal('praktikum'), v.literal('sonstiges')),
    startDate: v.string(), // ISO 8601 date string
    endDate: v.optional(v.string()), // ISO 8601 date string
    color: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
    // Recurring event fields
    isRecurring: v.optional(v.boolean()), // default false
    recurrenceFrequency: v.optional(v.union(v.literal('weekly'))), // future: daily, monthly
    recurrenceEndDate: v.optional(v.string()), // ISO 8601 date string - null means infinite
    parentEventId: v.optional(v.id('events')), // Reference to parent recurring event
  }).index('by_user', ['userId'])
    .index('by_parent', ['parentEventId']),
  exams: defineTable({
    userId: v.string(),
    subject: v.string(),
    // ISO 8601 datetime string representing exam start
    dateTime: v.string(),
    // Optional location/room
    location: v.optional(v.string()),
    learningGoal: v.optional(v.string()),
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
    reminderEnabled: v.optional(v.boolean()), // default false
    reminderMinutesBefore: v.optional(v.number()), // e.g. 1440 for 1 day before
    reminderLastNotifiedAt: v.optional(v.string()), // ISO 8601 timestamp of last notification
  }).index('by_user', ['userId']),
  submissions: defineTable({
    userId: v.string(),
    title: v.string(),
    subject: v.string(),
    dueDate: v.string(), // ISO 8601 datetime string
    status: v.union(v.literal('open'), v.literal('done')),
  }).index('by_user', ['userId'])
    .index('by_subject', ['userId', 'subject']),
  focusSessions: defineTable({
    userId: v.string(),
    duration: v.number(), // in minutes
    completedAt: v.string(), // ISO 8601 timestamp
  }).index('by_user', ['userId']),
  learningCheckIns: defineTable({
    userId: v.string(),
    date: v.string(), // ISO 8601 date string (YYYY-MM-DD) - one per day max
  }).index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'date']),
  learningProgress: defineTable({
    userId: v.string(),
    totalSessions: v.number(), // cumulative learning sessions
    lastUpdated: v.string(), // ISO 8601 timestamp
  }).index('by_user', ['userId']),
});