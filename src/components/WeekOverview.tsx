import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { WeekOverviewSkeleton } from "@/components/SkeletonLoaders";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

const HORIZON_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const isThisWeek = (dateStr: string) => {
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).getTime();
	const horizon = startOfToday + HORIZON_DAYS * MS_PER_DAY;
	const ts = new Date(dateStr).getTime();
	return ts >= startOfToday && ts < horizon;
};

const formatDateTime = (value: string) => {
	const d = new Date(value);
	return new Intl.DateTimeFormat("de-DE", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
};

const formatDate = (value: string) => {
	const d = new Date(value);
	return new Intl.DateTimeFormat("de-DE", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
	}).format(d);
};

const typeStyles = {
	exam: "bg-amber-100 text-amber-800",
	submission: "bg-blue-100 text-blue-800",
	task: "bg-emerald-100 text-emerald-800",
} satisfies Record<string, string>;

type Item =
	| {
			kind: "exam";
			id: string;
			title: string;
			date: string;
			meta?: string;
	  }
	| {
			kind: "submission";
			id: string;
			title: string;
			date: string;
			meta?: string;
	  }
	| {
			kind: "task";
			id: string;
			title: string;
			date: string;
			meta?: string;
	  };

interface WeekOverviewProps {
	userId?: string;
}

export default function WeekOverview({ userId: _userId }: WeekOverviewProps) {
	const { data: exams = [], isLoading: examsLoading } = useQuery(
		convexQuery(api.exams.listExams, {}),
	);
	const { data: submissions = [], isLoading: submissionsLoading } = useQuery(
		convexQuery(api.submissions.listSubmissions, {}),
	);
	const { data: tasks = [], isLoading: tasksLoading } = useQuery(
		convexQuery(api.tasks.listTasks, {}),
	);

	if (examsLoading || submissionsLoading || tasksLoading) {
		return <WeekOverviewSkeleton />;
	}

	const items: Item[] = [
		...(exams as Doc<"exams">[]).map((exam) => ({
			kind: "exam" as const,
			id: String(exam._id),
			title: exam.subject,
			date: exam.dateTime,
			meta: exam.location ? `Ort: ${exam.location}` : undefined,
		})),
		...(submissions as Doc<"submissions">[])
			.filter((sub) => sub.status !== "done")
			.map((sub) => ({
				kind: "submission" as const,
				id: String(sub._id),
				title: sub.title,
				date: sub.dueDate,
				meta: `Fach: ${sub.subject}`,
			})),
		...(tasks as Doc<"tasks">[])
			.filter((task) => task.status !== "done")
			.map((task) => ({
				kind: "task" as const,
				id: String(task._id),
				title: task.title,
				date: task.dueDate,
				meta: task.description,
			})),
	]
		.filter((item) => isThisWeek(item.date))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(0, 10);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Diese Woche im Blick</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{items.length === 0 ? (
					<div className="text-sm text-muted-foreground">
						Keine offenen Deadlines in dieser Woche.
					</div>
				) : (
					<ul className="space-y-2">
						{items.map((item) => {
							const pillClass = typeStyles[item.kind];
							const dateLabel =
								item.kind === "exam"
									? formatDateTime(item.date)
									: formatDate(item.date);
							return (
								<li
									key={item.id}
									className="flex flex-col gap-1 rounded-md border px-3 py-2"
								>
									<div className="flex items-center justify-between gap-2">
										<span className="font-medium leading-tight">
											{item.title}
										</span>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${pillClass}`}
										>
											{item.kind === "exam"
												? "Prüfung"
												: item.kind === "submission"
													? "Abgabe"
													: "Aufgabe"}
										</span>
									</div>
									<div className="text-xs text-muted-foreground">
										{dateLabel}
									</div>
									{item.meta && (
										<div className="text-xs text-muted-foreground truncate">
											{item.meta}
										</div>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
