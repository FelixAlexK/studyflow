import { Skeleton } from "@/components/ui/skeleton";

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
