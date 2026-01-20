"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

export default function ProgressInsights() {
	const { data, isLoading, error } = useQuery(
		convexQuery(api.stats.getProgressInsights, {})
	);

	if (isLoading) {
		return (
			<Card className="col-span-full">
				<CardHeader>
					<CardTitle>Progress Insights</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-40 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="col-span-full border-red-200 bg-red-50">
				<CardHeader>
					<CardTitle className="text-red-900">Progress Insights</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-red-700">Failed to load progress data</p>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return null;
	}

	const isEmpty =
		data.totalCompleted === 0 && data.thisWeek === 0 && data.lastWeek === 0;

	const trendPositive = data.trend >= 0;

	const chartConfig = {
		count: {
			label: "Tasks Completed",
			color: "#3b82f6",
		},
	} satisfies ChartConfig;

	return (
		<Card id="progress-insights" className="col-span-full">
			<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle>Progress Insights</CardTitle>
							<CardDescription>
								Completed tasks this week vs last week
							</CardDescription>
						</div>
						{!isEmpty && (
							<div className="flex items-center gap-2 text-sm font-medium">
								{trendPositive ? (
									<TrendingUp className="h-4 w-4 text-green-600" />
								) : (
									<TrendingDown className="h-4 w-4 text-red-600" />
								)}
								<span
									className={
										trendPositive ? "text-green-600" : "text-red-600"
									}
								>
									{trendPositive ? "+" : ""}
									{data.trend}%
								</span>
							</div>
						)}
					</div>
			</CardHeader>
			<CardContent className="space-y-6">
					{isEmpty ? (
						<div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center">
							<p className="text-sm font-semibold text-muted-foreground">
								Noch keine abgeschlossenen Aufgaben
							</p>
							<p className="text-xs text-muted-foreground">
								Erstelle deine erste Aufgabe oder starte eine Fokus-Session, dann erscheinen hier deine Insights.
							</p>
						</div>
					) : (
						<>
							{/* Stats Overview */}
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
									<p className="text-sm text-gray-600">This Week</p>
									<p className="text-2xl font-bold text-blue-600">
										{data.thisWeek}
									</p>
									<p className="text-xs text-gray-500">tasks completed</p>
								</div>
								<div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
									<p className="text-sm text-gray-600">Last Week</p>
									<p className="text-2xl font-bold text-gray-600">
										{data.lastWeek}
									</p>
									<p className="text-xs text-gray-500">tasks completed</p>
								</div>
								<div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
									<p className="text-sm text-gray-600">Total</p>
									<p className="text-2xl font-bold text-green-600">
										{data.totalCompleted}
									</p>
									<p className="text-xs text-gray-500">all time</p>
								</div>
							</div>

							{/* Weekly Breakdown Chart */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-muted-foreground">
										Weekly breakdown
									</p>
									<p className={`text-sm font-medium ${trendPositive ? "text-green-700" : "text-red-700"}`}>
										{trendPositive ? "Up" : "Down"} {Math.abs(data.trend)}% vs last week
									</p>
								</div>
								<ChartContainer
									config={chartConfig}
									className="h-72 w-full"
								>
									<BarChart data={data.weeklyBreakdown}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} />
										<XAxis
											dataKey="day"
											className="text-xs"
											tickLine={false}
											axisLine={false}
										/>
										<YAxis
											allowDecimals={false}
											className="text-xs"
											tickLine={false}
											axisLine={false}
										/>
										<Bar dataKey="count" fill={chartConfig.count.color} radius={[6, 6, 0, 0]} />
									</BarChart>
								</ChartContainer>
							</div>
						</>
					)}
			</CardContent>
		</Card>
	);
}
