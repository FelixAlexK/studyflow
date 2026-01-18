import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all events for a specific user
export const listEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return events;
  },
});

// Mutation to create a new event
export const createEvent = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("class"), v.literal("deadline")),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Set color based on event type
    const color = args.type === "class" ? "#3b82f6" : "#ef4444";
    
    const eventId = await ctx.db.insert("events", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      color,
      allDay: args.allDay ?? false,
    });
    
    return eventId;
  },
});

// Mutation to update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("class"), v.literal("deadline"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    
    // Get the existing event to check ownership
    const existingEvent = await ctx.db.get(eventId);
    if (!existingEvent) {
      throw new Error("Event not found");
    }
    
    // Update color if type changed
    const updateData: any = { ...updates };
    if (updates.type) {
      updateData.color = updates.type === "class" ? "#3b82f6" : "#ef4444";
    }
    
    await ctx.db.patch(eventId, updateData);
    return eventId;
  },
});

// Mutation to delete an event
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get the existing event to check ownership
    const existingEvent = await ctx.db.get(args.eventId);
    if (!existingEvent) {
      throw new Error("Event not found");
    }
    
    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});
