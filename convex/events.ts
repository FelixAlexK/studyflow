import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to get color based on event type
const getEventColor = (
  type: "vorlesung" | "übung" | "praktikum" | "sonstiges",
): string => {
  const colors: Record<string, string> = {
    vorlesung: "#3b82f6",  // Blue
    übung: "#10b981",      // Green
    praktikum: "#f59e0b",  // Amber
    sonstiges: "#8b5cf6",  // Purple
  };
  return colors[type] || "#6b7280"; // Default gray
};

// Helper function to add weeks to a date
const addWeeks = (dateStr: string, weeks: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString();
};

// Helper function to generate recurring event instances
const generateRecurringInstances = (
  startDate: string,
  _endDate: string | undefined,
  recurrenceFrequency: "weekly",
  recurrenceEndDate: string | undefined,
): string[] => {
  const instances: string[] = [startDate];
  let currentDate = startDate;
  
  // Determine the end date for generation (use recurrenceEndDate or 1 year from start)
  const generationEndDate = recurrenceEndDate 
    ? new Date(recurrenceEndDate)
    : new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000);
  
  while (true) {
    if (recurrenceFrequency === "weekly") {
      currentDate = addWeeks(currentDate, 1);
    }
    
    if (new Date(currentDate) > generationEndDate) {
      break;
    }
    
    instances.push(currentDate);
  }
  
  return instances;
};

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

// Mutation to create a new event (with optional recurrence)
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("vorlesung"), v.literal("übung"), v.literal("praktikum"), v.literal("sonstiges")),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
    isRecurring: v.optional(v.boolean()),
    recurrenceFrequency: v.optional(v.union(v.literal("weekly"))),
    recurrenceEndDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Set color based on event type
    const color = getEventColor(args.type as "vorlesung" | "übung" | "praktikum" | "sonstiges");
    
    // Create the parent event
    const parentEventId = await ctx.db.insert("events", {
      userId: identity.subject,
      title: args.title,
      description: args.description,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      color,
      allDay: args.allDay ?? false,
      isRecurring: args.isRecurring ?? false,
      recurrenceFrequency: args.recurrenceFrequency,
      recurrenceEndDate: args.recurrenceEndDate,
    });
    
    // If recurring, generate instances
    if (args.isRecurring && args.recurrenceFrequency) {
      const instances = generateRecurringInstances(
        args.startDate,
        args.endDate,
        args.recurrenceFrequency,
        args.recurrenceEndDate,
      );
      
      // Skip the first instance as it's the parent
      for (let i = 1; i < instances.length; i++) {
        const instanceStart = instances[i];
        let instanceEnd = args.endDate;
        
        // Adjust end date for this instance if it exists
        if (args.endDate && args.recurrenceFrequency === "weekly") {
          const startTime = new Date(args.startDate).getTime();
          const endTime = new Date(args.endDate).getTime();
          const duration = endTime - startTime;
          instanceEnd = new Date(new Date(instanceStart).getTime() + duration).toISOString();
        }
        
        await ctx.db.insert("events", {
          userId: identity.subject,
          title: args.title,
          description: args.description,
          type: args.type,
          startDate: instanceStart,
          endDate: instanceEnd,
          color,
          allDay: args.allDay ?? false,
          parentEventId,
        });
      }
    }
    
    return parentEventId;
  },
});

// Mutation to update an existing event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("vorlesung"), v.literal("übung"), v.literal("praktikum"), v.literal("sonstiges"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    allDay: v.optional(v.boolean()),
    isRecurring: v.optional(v.boolean()),
    recurrenceFrequency: v.optional(v.union(v.literal("weekly"))),
    recurrenceEndDate: v.optional(v.string()),
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
      updateData.color = getEventColor(updates.type as "vorlesung" | "übung" | "praktikum" | "sonstiges");
    }
    
    // If recurring properties changed, regenerate instances (delete old, create new)
    if (
      updates.isRecurring !== undefined ||
      updates.recurrenceFrequency !== undefined ||
      updates.recurrenceEndDate !== undefined
    ) {
      // Delete existing child events
      const childEvents = await ctx.db
        .query("events")
        .withIndex("by_parent", (q) => q.eq("parentEventId", eventId))
        .collect();
      
      for (const childEvent of childEvents) {
        await ctx.db.delete(childEvent._id);
      }
      
      // Generate new instances if recurring
      if (updates.isRecurring && updates.recurrenceFrequency) {
        const startDate = updates.startDate || existingEvent.startDate;
        const endDate = updates.endDate || existingEvent.endDate;
        const frequency = updates.recurrenceFrequency || existingEvent.recurrenceFrequency;
        const recEnd = updates.recurrenceEndDate || existingEvent.recurrenceEndDate;
        
        const instances = generateRecurringInstances(
          startDate,
          endDate,
          frequency as "weekly",
          recEnd,
        );
        
        for (let i = 1; i < instances.length; i++) {
          const instanceStart = instances[i];
          let instanceEnd = endDate;
          
          if (endDate && frequency === "weekly") {
            const startTime = new Date(startDate).getTime();
            const endTime = new Date(endDate).getTime();
            const duration = endTime - startTime;
            instanceEnd = new Date(new Date(instanceStart).getTime() + duration).toISOString();
          }
          
          await ctx.db.insert("events", {
            userId: existingEvent.userId,
            title: updates.title || existingEvent.title,
            description: updates.description || existingEvent.description,
            type: updates.type || existingEvent.type,
            startDate: instanceStart,
            endDate: instanceEnd,
            color: updateData.color || existingEvent.color,
            allDay: updates.allDay ?? existingEvent.allDay,
            parentEventId: eventId,
          });
        }
      }
    }
    
    await ctx.db.patch(eventId, updateData);
    return eventId;
  },
});

// Mutation to delete an event (and all its instances if recurring)
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get the existing event
    const existingEvent = await ctx.db.get(args.eventId);
    if (!existingEvent) {
      throw new Error("Event not found");
    }
    
    // If this is a parent event, delete all child events
    if (existingEvent.isRecurring) {
      const childEvents = await ctx.db
        .query("events")
        .withIndex("by_parent", (q) => q.eq("parentEventId", args.eventId))
        .collect();
      
      for (const childEvent of childEvents) {
        await ctx.db.delete(childEvent._id);
      }
    }
    
    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});
// Migration mutation to convert old event types to new ones
export const migrateOldEventTypes = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all events
    const allEvents = await ctx.db.query("events").collect();
    
    let migratedCount = 0;
    
    for (const event of allEvents) {
      // Check if event has old type values
      const eventType = (event as any).type;
      
      if (eventType === "class" || eventType === "deadline") {
        // Convert old types to new types
        const newType = eventType === "class" ? "vorlesung" : "sonstiges";
        
        await ctx.db.patch(event._id, {
          type: newType,
          color: getEventColor(newType as "vorlesung" | "übung" | "praktikum" | "sonstiges"),
        });
        
        migratedCount++;
      }
    }
    
    return { migratedCount, message: `Migrated ${migratedCount} events to new type system` };
  },
});