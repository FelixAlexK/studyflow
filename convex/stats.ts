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

// Helper function to check if a date is today
const isToday = (isoString: string): boolean => {
  const date = new Date(isoString);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
  const timestamp = date.getTime();
  return timestamp >= startOfToday && timestamp < endOfToday;
};

// Query: get today's stats summary
export const getTodayStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all tasks for today
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const todayTasks = allTasks.filter((task) => isToday(task.dueDate));
    const completedTodayTasks = todayTasks.filter((task) => task.status === "done");

    // Get focus sessions for today
    const allSessions = await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const todaySessions = allSessions.filter((session) =>
      isToday(session.completedAt),
    );

    // Get upcoming deadlines (next 7 days)
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const weekFromNow = startOfToday + 7 * 24 * 60 * 60 * 1000;

    const upcomingTasks = allTasks.filter((task) => {
      const taskTime = new Date(task.dueDate).getTime();
      return taskTime >= startOfToday && taskTime <= weekFromNow && task.status !== "done";
    });

    // Get exams
    const allExams = await ctx.db
      .query("exams")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const upcomingExams = allExams.filter((exam) => {
      const examTime = new Date(exam.dateTime).getTime();
      return examTime >= startOfToday && examTime <= weekFromNow;
    });

    // Get submissions
    const allSubmissions = await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const upcomingSubmissions = allSubmissions.filter((submission) => {
      const submissionTime = new Date(submission.dueDate).getTime();
      return (
        submissionTime >= startOfToday &&
        submissionTime <= weekFromNow &&
        submission.status !== "done"
      );
    });

    return {
      tasksToday: {
        total: todayTasks.length,
        completed: completedTodayTasks.length,
      },
      focusSessionsToday: todaySessions.length,
      upcomingDeadlines: {
        total: upcomingTasks.length + upcomingExams.length + upcomingSubmissions.length,
        tasks: upcomingTasks.length,
        exams: upcomingExams.length,
        submissions: upcomingSubmissions.length,
      },
    };
  },
});

// Query: get completed tasks for past weeks (for progress insights)
export const getProgressInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const completedTasks = allTasks.filter((t) => t.status === "done");

    // Get current date at start of day
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = now.getDay();
    // Calculate start of current week (Monday)
    const startOfWeek = startOfToday - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 24 * 60 * 60 * 1000;
    // Start of last week
    const startOfLastWeek = startOfWeek - 7 * 24 * 60 * 60 * 1000;

    // Count completed tasks this week
    const thisWeekCompleted = completedTasks.filter((task) => {
      const taskTime = new Date(task.dueDate).getTime();
      return taskTime >= startOfWeek && taskTime < startOfToday + 24 * 60 * 60 * 1000;
    }).length;

    // Count completed tasks last week
    const lastWeekCompleted = completedTasks.filter((task) => {
      const taskTime = new Date(task.dueDate).getTime();
      return taskTime >= startOfLastWeek && taskTime < startOfWeek;
    }).length;

    // Get tasks completed by day for this week
    const dayData: Array<{ day: string; count: number; date: string }> = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const dayStart = startOfWeek + i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayDate = new Date(dayStart);
      const count = completedTasks.filter((task) => {
        const taskTime = new Date(task.dueDate).getTime();
        return taskTime >= dayStart && taskTime < dayEnd;
      }).length;
      
      dayData.push({
        day: days[i],
        count,
        date: dayDate.toISOString().split('T')[0],
      });
    }

    // Calculate trend
    const trend = lastWeekCompleted > 0 
      ? ((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted * 100).toFixed(1)
      : (thisWeekCompleted > 0 ? "100" : "0");

    return {
      thisWeek: thisWeekCompleted,
      lastWeek: lastWeekCompleted,
      trend: parseFloat(trend as string),
      weeklyBreakdown: dayData,
      totalCompleted: completedTasks.length,
    };
  },
});
