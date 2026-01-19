import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type Task = Doc<"tasks">;

interface TaskWithPriority extends Task {
	priorityScore: number;
	daysUntilDue: number;
	urgencyLevel: "critical" | "high" | "medium" | "low";
}

const calculatePriority = (task: Task): TaskWithPriority => {
	const now = new Date();
	const dueDate = new Date(task.dueDate);
	const daysUntilDue = Math.ceil(
		(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	// Priority scoring algorithm:
	// - Overdue tasks get highest priority
	// - Tasks due today get high priority
	// - In-progress tasks get bonus points
	// - Closer deadlines get higher scores

	let priorityScore = 0;

	// Days until due (inverted - closer = higher score)
	if (daysUntilDue < 0) {
		priorityScore += 1000 + Math.abs(daysUntilDue) * 10; // Overdue
	} else if (daysUntilDue === 0) {
		priorityScore += 500; // Due today
	} else if (daysUntilDue <= 3) {
		priorityScore += 300 - daysUntilDue * 50; // Due within 3 days
	} else if (daysUntilDue <= 7) {
		priorityScore += 200 - daysUntilDue * 20; // Due within a week
	} else {
		priorityScore += Math.max(0, 100 - daysUntilDue * 5); // Further out
	}

	// Status bonus
	if (task.status === "in_progress") {
		priorityScore += 100; // In-progress tasks are higher priority
	}

	// Determine urgency level
	let urgencyLevel: TaskWithPriority["urgencyLevel"];
	if (daysUntilDue < 0) {
		urgencyLevel = "critical";
	} else if (daysUntilDue === 0) {
		urgencyLevel = "critical";
	} else if (daysUntilDue <= 2) {
		urgencyLevel = "high";
	} else if (daysUntilDue <= 5) {
		urgencyLevel = "medium";
	} else {
		urgencyLevel = "low";
	}

	return {
		...task,
		priorityScore,
		daysUntilDue,
		urgencyLevel,
	};
};

const formatDueDate = (dueDate: string): string => {
	const date = new Date(dueDate);
	const now = new Date();
	const diffDays = Math.ceil(
		(date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays < 0) {
		const abs = Math.abs(diffDays);
		return `${abs} Tag${abs === 1 ? "" : "e"} überfällig`;
	}
	if (diffDays === 0) return "Heute fällig";
	if (diffDays === 1) return "Morgen fällig";
	if (diffDays <= 7) return `In ${diffDays} Tagen`;

	return new Intl.DateTimeFormat("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
};

const getUrgencyStyles = (urgencyLevel: TaskWithPriority["urgencyLevel"]) => {
	switch (urgencyLevel) {
		case "critical":
			return {
				border: "border-l-4 border-red-500",
				bg: "bg-red-50 hover:bg-red-100",
				badge: "bg-red-100 text-red-800 border-red-200",
				icon: "text-red-600",
			};
		case "high":
			return {
				border: "border-l-4 border-orange-500",
				bg: "bg-orange-50 hover:bg-orange-100",
				badge: "bg-orange-100 text-orange-800 border-orange-200",
				icon: "text-orange-600",
			};
		case "medium":
			return {
				border: "border-l-4 border-amber-500",
				bg: "bg-amber-50 hover:bg-amber-100",
				badge: "bg-amber-100 text-amber-800 border-amber-200",
				icon: "text-amber-600",
			};
		case "low":
			return {
				border: "border-l-4 border-green-500",
				bg: "bg-green-50 hover:bg-green-100",
				badge: "bg-green-100 text-green-800 border-green-200",
				icon: "text-green-600",
			};
	}
};

export default function PriorityTasks() {
	const {
		data: tasks = [],
		isLoading,
		isError,
	} = useQuery(convexQuery(api.tasks.listTasks, {}));

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Priority Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={`skeleton-${i}`}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex-1 space-y-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</div>
								<Skeleton className="h-4 w-4" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return null;
	}

	// Filter out completed tasks and calculate priority
	const incompleteTasks = (tasks as Task[])
		.filter((task) => task.status !== "done")
		.map(calculatePriority)
		.sort((a, b) => b.priorityScore - a.priorityScore)
		.slice(0, 5); // Show top 5 priority tasks

	if (incompleteTasks.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Priority Tasks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center">
						<CheckCircle2 className="mb-3 h-12 w-12 text-green-600" />
						<p className="text-sm font-semibold text-muted-foreground">
							All caught up!
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							You have no pending tasks. Great job!
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Priority Tasks</CardTitle>
					<Link
						to="/tasks"
						className="text-sm font-medium text-primary hover:underline"
					>
						View all →
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{incompleteTasks.map((task) => {
						const styles = getUrgencyStyles(task.urgencyLevel);
						return (
							<Link
								key={task._id}
								to="/tasks"
								className={`group flex items-center justify-between rounded-lg border ${styles.border} ${styles.bg} p-4 transition-all duration-200`}
							>
								<div className="flex-1 space-y-1">
									<div className="flex items-start gap-2">
										{task.urgencyLevel === "critical" && (
											<AlertCircle
												className={`mt-0.5 h-4 w-4 ${styles.icon}`}
											/>
										)}
										<div className="flex-1">
											<h4 className="text-sm font-semibold leading-tight">
												{task.title}
											</h4>
											{task.description && (
												<p className="mt-1 text-xs text-muted-foreground line-clamp-1">
													{task.description}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${styles.badge}`}
										>
											<Calendar className="h-3 w-3" />
											{formatDueDate(task.dueDate)}
										</span>
										{task.status === "in_progress" && (
											<span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
												In Progress
											</span>
										)}
									</div>
								</div>
								<ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
							</Link>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
