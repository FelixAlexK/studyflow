import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type CalendarEvent = Doc<"events">;

interface CompactCalendarProps {
	userId: string;
}

const typeColors: Record<CalendarEvent["type"], string> = {
	vorlesung: "bg-blue-500",
	übung: "bg-green-500",
	praktikum: "bg-amber-500",
	sonstiges: "bg-purple-500",
};

const typeLabels: Record<CalendarEvent["type"], string> = {
	vorlesung: "Vorlesung",
	übung: "Übung",
	praktikum: "Praktikum",
	sonstiges: "Sonstiges",
};

const getWeekDates = (startDate: Date): Date[] => {
	const dates: Date[] = [];
	const start = new Date(startDate);
	// Get Monday of the week
	const day = start.getDay();
	const diff = start.getDate() - day + (day === 0 ? -6 : 1);
	start.setDate(diff);

	for (let i = 0; i < 7; i++) {
		const date = new Date(start);
		date.setDate(start.getDate() + i);
		dates.push(date);
	}
	return dates;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
};

const formatTime = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const isEventOnDay = (event: CalendarEvent, date: Date): boolean => {
	const eventStart = new Date(event.startDate);
	return isSameDay(eventStart, date);
};

export default function CompactCalendar({ userId }: CompactCalendarProps) {
	const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
	const [selectedDay, setSelectedDay] = useState<Date | null>(null);

	const { data: events = [], isLoading } = useQuery(
		convexQuery(api.events.listEvents, { userId }),
	);

	const weekDates = getWeekDates(currentWeekStart);
	const today = new Date();

	const goToPreviousWeek = () => {
		const newDate = new Date(currentWeekStart);
		newDate.setDate(newDate.getDate() - 7);
		setCurrentWeekStart(newDate);
		setSelectedDay(null);
	};

	const goToNextWeek = () => {
		const newDate = new Date(currentWeekStart);
		newDate.setDate(newDate.getDate() + 7);
		setCurrentWeekStart(newDate);
		setSelectedDay(null);
	};

	const goToToday = () => {
		setCurrentWeekStart(new Date());
		setSelectedDay(null);
	};

	const selectedDayEvents = selectedDay
		? (events as CalendarEvent[])
				.filter((event) => isEventOnDay(event, selectedDay))
				.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
				)
		: [];

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Weekly Calendar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<div className="grid grid-cols-7 gap-2">
							{Array.from({ length: 7 }).map((_, i) => (
								<Skeleton key={`day-${i}`} className="h-24 w-full" />
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Weekly Calendar
					</CardTitle>
					<Link
						to="/calendar"
						className="text-sm font-medium text-primary hover:underline"
					>
						Full calendar →
					</Link>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Week Navigation */}
				<div className="flex items-center justify-between gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={goToPreviousWeek}
						className="gap-1"
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Previous</span>
					</Button>

					<div className="flex flex-col items-center">
						<span className="text-sm font-semibold">
							{new Intl.DateTimeFormat("de-DE", {
								month: "long",
								year: "numeric",
							}).format(weekDates[0])}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={goToToday}
							className="h-6 text-xs text-muted-foreground hover:text-primary"
						>
							Today
						</Button>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={goToNextWeek}
						className="gap-1"
					>
						<span className="hidden sm:inline">Next</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				{/* Week Grid */}
				<div className="grid grid-cols-7 gap-1 sm:gap-2">
					{weekDates.map((date) => {
						const dayEvents = (events as CalendarEvent[]).filter((event) =>
							isEventOnDay(event, date),
						);
						const isToday = isSameDay(date, today);
						const isSelected = selectedDay && isSameDay(date, selectedDay);

						return (
							<button
								key={date.toISOString()}
								type="button"
								onClick={() =>
									setSelectedDay(
										selectedDay && isSameDay(date, selectedDay) ? null : date,
									)
								}
								className={`group relative flex min-h-20 flex-col rounded-lg border p-2 text-left transition-all hover:shadow-md ${
									isSelected
										? "border-primary bg-primary/5 ring-2 ring-primary"
										: isToday
											? "border-primary/50 bg-primary/5"
											: "border-border hover:border-primary/30"
								}`}
							>
								{/* Day Label */}
								<div className="mb-1 flex items-center justify-between">
									<span
										className={`text-xs font-medium ${
											isToday
												? "text-primary font-bold"
												: "text-muted-foreground"
										}`}
									>
										{new Intl.DateTimeFormat("de-DE", {
											weekday: "short",
										}).format(date)}
									</span>
									<span
										className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
											isToday
												? "bg-primary text-primary-foreground"
												: "text-foreground"
										}`}
									>
										{date.getDate()}
									</span>
								</div>

								{/* Event Indicators */}
								<div className="flex-1 space-y-1">
									{dayEvents.slice(0, 2).map((event) => (
										<div
											key={event._id}
											className={`flex items-center gap-1 rounded px-1 py-0.5 text-xs ${typeColors[event.type]} bg-opacity-20`}
											title={event.title}
										>
											<div
												className={`h-2 w-2 rounded-full ${typeColors[event.type]}`}
											/>
											<span className="truncate text-xs font-medium">
												{event.title}
											</span>
										</div>
									))}
									{dayEvents.length > 2 && (
										<div className="text-xs text-muted-foreground">
											+{dayEvents.length - 2} more
										</div>
									)}
								</div>
							</button>
						);
					})}
				</div>

				{/* Selected Day Details */}
				{selectedDay && (
					<div className="mt-4 rounded-lg border bg-muted/30 p-4">
						<h3 className="mb-3 font-semibold">
							{new Intl.DateTimeFormat("de-DE", {
								weekday: "long",
								day: "numeric",
								month: "long",
							}).format(selectedDay)}
						</h3>

						{selectedDayEvents.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Keine Termine an diesem Tag
							</p>
						) : (
							<div className="space-y-2">
								{selectedDayEvents.map((event) => (
									<div
										key={event._id}
										className={`flex items-start gap-3 rounded-md border ${typeColors[event.type]} border-l-4 bg-background p-3`}
									>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-sm">
													{event.title}
												</span>
												<span
													className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[event.type]} bg-opacity-20`}
												>
													{typeLabels[event.type]}
												</span>
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												{event.allDay ? (
													<span>Ganztägig</span>
												) : (
													<>
														<span>{formatTime(event.startDate)}</span>
														{event.endDate && (
															<>
																<span>–</span>
																<span>{formatTime(event.endDate)}</span>
															</>
														)}
													</>
												)}
											</div>
											{event.description && (
												<p className="mt-1 text-sm text-muted-foreground">
													{event.description}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
