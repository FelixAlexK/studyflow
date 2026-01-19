import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TodayImportantSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Was ist heute wichtig?</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Prüfungen Skeleton */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-7 w-28 rounded-full" />
						<Skeleton className="h-4 w-16" />
					</div>
					<div className="space-y-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<div
								key={`exam-${i}`}
								className="rounded-lg border-2 border-purple-200 bg-purple-50/80 shadow-sm p-4"
							>
								<div className="flex items-center justify-between gap-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
						))}
					</div>
				</div>
				{/* Aufgaben Skeleton */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-7 w-28 rounded-full" />
						<Skeleton className="h-4 w-20" />
					</div>
					<div className="space-y-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<div
								key={`task-${i}`}
								className="rounded-lg border-2 border-amber-200 bg-amber-50/60 shadow-sm p-3.5"
							>
								<div className="flex items-center justify-between gap-2">
									<Skeleton className="h-4 w-2/3" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>
				{/* Termine Skeleton */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-24 rounded-full" />
						<Skeleton className="h-3 w-12" />
					</div>
					<div className="space-y-2">
						{Array.from({ length: 1 }).map((_, i) => (
							<div
								key={`event-${i}`}
								className="rounded-md border border-blue-100 bg-blue-50/40 p-3"
							>
								<div className="flex items-center justify-between gap-2">
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function TodayAtUniSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Heute an der Uni</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="flex items-start justify-between rounded-lg border bg-muted/40 px-3 py-2"
						>
							<div className="flex flex-col gap-1 flex-1">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function WeekOverviewSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Diese Woche im Überblick</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-md border p-3"
						>
							<div className="flex-1 space-y-1">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-6 w-24 rounded-full" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function StressOverviewSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Stress-Level</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-10 w-10 rounded-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			</CardContent>
		</Card>
	);
}

export function TaskListSkeleton() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="flex items-start gap-3 rounded-md border p-3">
					<Skeleton className="h-5 w-5 rounded" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-3 w-3/4" />
					</div>
					<Skeleton className="h-8 w-8 rounded" />
				</div>
			))}
		</div>
	);
}

export function ProductivityOverviewSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="rounded-lg border p-6">
					<Skeleton className="mb-3 h-4 w-1/2" />
					<Skeleton className="h-8 w-1/3" />
				</div>
			))}
		</div>
	);
}

export function CalendarSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-96 w-full" />
		</div>
	);
}
