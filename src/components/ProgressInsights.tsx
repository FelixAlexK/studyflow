"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
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

	const trendPositive = data.trend >= 0;
	
	const chartConfig = {
		count: {
			label: "Tasks Completed",
			color: "#3b82f6",
		},
	} satisfies ChartConfig;

	return (
		<Card className="col-span-full">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Progress Insights</CardTitle>
						<CardDescription>
							Completed tasks this week vs last week
						</CardDescription>
					</div>
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
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
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
					<h3 className="text-sm font-semibold text-gray-900">
						Weekly Breakdown
					</h3>
					<ChartContainer config={chartConfig} className="h-80 w-full">
						<BarChart data={data.weeklyBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid vertical={false} stroke="#e5e7eb" />
							<XAxis
								dataKey="day"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								className="text-xs"
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								className="text-xs"
							/>
							<Bar
								dataKey="count"
								fill="var(--color-count)"
								radius={[8, 8, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				</div>

				{/* Insight Message */}
				<div className="rounded-lg bg-blue-50 p-3">
					<p className="text-sm text-blue-900">
						{trendPositive
							? `Great progress! You've completed ${Math.abs(data.trend)}% more tasks this week compared to last week.`
							: data.trend === 0
								? "You completed the same number of tasks as last week. Keep it up!"
								: `You completed ${Math.abs(data.trend)}% fewer tasks this week. Try to catch up!`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
