import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

// Progress ring component
function ProgressRing({
	progress,
	size = 80,
	strokeWidth = 8,
	color = "text-primary",
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg
				className="transform -rotate-90"
				width={size}
				height={size}
				aria-label={`Progress: ${progress}%`}
			>
				<title>Progress: {progress}%</title>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted opacity-20"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className={`transition-all duration-500 ${color}`}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-2xl font-bold">{Math.round(progress)}%</span>
			</div>
		</div>
	);
}

// Badge component for counts
function CountBadge({
	count,
	label,
	color = "bg-primary",
}: {
	count: number;
	label: string;
	color?: string;
}) {
	return (
		<div className="flex flex-col items-center">
			<div
				className={`flex h-16 w-16 items-center justify-center rounded-full ${color} text-white shadow-lg`}
			>
				<span className="text-2xl font-bold">{count}</span>
			</div>
			<span className="mt-2 text-sm font-medium text-muted-foreground">
				{label}
			</span>
		</div>
	);
}

export default function HeroStats() {
	const {
		data: stats,
		isLoading,
		isError,
	} = useQuery(convexQuery(api.stats.getTodayStats, {}));

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={`skeleton-${i}`}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-8 w-16" />
								</div>
								<Skeleton className="h-16 w-16 rounded-full" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (isError || !stats) {
		return null;
	}

	const taskProgress =
		stats.tasksToday.total > 0
			? (stats.tasksToday.completed / stats.tasksToday.total) * 100
			: 0;

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{/* Tasks Today */}
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-green-600" />
								<h3 className="text-sm font-semibold text-muted-foreground">
									Tasks Today
								</h3>
							</div>
							<div className="space-y-1">
								<p className="text-2xl font-bold">
									{stats.tasksToday.completed}/{stats.tasksToday.total}
								</p>
								<p className="text-xs text-muted-foreground">
									{stats.tasksToday.total === 0
										? "No tasks scheduled"
										: stats.tasksToday.completed === stats.tasksToday.total
											? "All complete! 🎉"
											: `${stats.tasksToday.total - stats.tasksToday.completed} remaining`}
								</p>
							</div>
						</div>
						<ProgressRing
							progress={taskProgress}
							color="text-green-600"
							size={80}
							strokeWidth={6}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Focus Sessions Today */}
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Clock className="h-5 w-5 text-blue-600" />
								<h3 className="text-sm font-semibold text-muted-foreground">
									Focus Sessions
								</h3>
							</div>
							<div className="space-y-1">
								<p className="text-2xl font-bold">{stats.focusSessionsToday}</p>
								<p className="text-xs text-muted-foreground">
									{stats.focusSessionsToday === 0
										? "Start your first session"
										: stats.focusSessionsToday === 1
											? "Keep going!"
											: "Great focus! 💪"}
								</p>
							</div>
						</div>
						<CountBadge
							count={stats.focusSessionsToday}
							label="Today"
							color="bg-blue-600"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Upcoming Deadlines */}
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Target className="h-5 w-5 text-amber-600" />
								<h3 className="text-sm font-semibold text-muted-foreground">
									Next 7 Days
								</h3>
							</div>
							<div className="space-y-1">
								<p className="text-2xl font-bold">
									{stats.upcomingDeadlines.total}
								</p>
								<p className="text-xs text-muted-foreground">
									{stats.upcomingDeadlines.total === 0
										? "All caught up!"
										: `${stats.upcomingDeadlines.tasks} tasks, ${stats.upcomingDeadlines.exams} exams`}
								</p>
							</div>
						</div>
						<CountBadge
							count={stats.upcomingDeadlines.total}
							label="Upcoming"
							color={
								stats.upcomingDeadlines.total > 5
									? "bg-red-600"
									: stats.upcomingDeadlines.total > 2
										? "bg-amber-600"
										: "bg-green-600"
							}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
