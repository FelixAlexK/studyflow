import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Return the last 100 tasks in a given task list.
export const getTaskList = query({
	args: {},
	handler: async (ctx, _args) => {
		const tasks = await ctx.db.query("tasks").collect();
		return tasks;
	},
});

export const createTask = mutation({
	args: { text: v.string() },
	handler: async (ctx, args) => {
		const newTaskId = await ctx.db.insert("tasks", {
			text: args.text,
			isCompleted: false,
		});
		return newTaskId;
	},
});
