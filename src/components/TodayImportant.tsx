import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

const MAX_ITEMS = 5;
const UPCOMING_DAYS = 7;

const isToday = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const ts = date.getTime();
  return ts >= start && ts < end;
};

const isWithinDays = (isoString: string, days: number) => {
  const date = new Date(isoString).getTime();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const limit = start + days * 24 * 60 * 60 * 1000;
  return date >= start && date <= limit;
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const getUrgency = (isoString: string) => {
  const now = new Date();
  const date = new Date(isoString);
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (isToday(isoString)) {
    return { label: "Heute", color: "bg-red-100 text-red-800" };
  }
  if (diffDays < 0) {
    return { label: "Überfällig", color: "bg-red-100 text-red-800" };
  }
  if (diffDays <= 2) {
    return { label: `In ${diffDays === 0 ? 0 : diffDays} Tagen`, color: "bg-amber-100 text-amber-800" };
  }
  if (diffDays <= 7) {
    return { label: `In ${diffDays} Tagen`, color: "bg-blue-100 text-blue-800" };
  }
  return { label: "Später", color: "bg-slate-100 text-slate-700" };
};

interface TodayImportantProps {
  userId: string;
}

export default function TodayImportant({ userId }: TodayImportantProps) {
  const { data: events = [] } = useSuspenseQuery(
    convexQuery(api.events.listEvents, { userId }),
  );
  const { data: tasks = [] } = useSuspenseQuery(convexQuery(api.tasks.listTasks, {}));
  const { data: exams = [] } = useSuspenseQuery(convexQuery(api.exams.listExams, {}));
  const prioritized = [
    ...(exams as Doc<"exams">[])
      .filter((exam) => isWithinDays(exam.dateTime, UPCOMING_DAYS))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .map((exam) => ({
        kind: "exam" as const,
        id: String(exam._id),
        title: exam.subject,
        when: exam.dateTime,
        meta: exam.location,
      })),
    ...(tasks as Doc<"tasks">[])
      .filter((task) => task.status !== "done" && isWithinDays(task.dueDate, UPCOMING_DAYS))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .map((task) => ({
        kind: "task" as const,
        id: String(task._id),
        title: task.title,
        when: task.dueDate,
        meta: task.description,
      })),
    ...(events as Doc<"events">[])
      .filter((event) => isWithinDays(event.startDate, UPCOMING_DAYS))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((event) => ({
        kind: "event" as const,
        id: String(event._id),
        title: event.title,
        when: event.startDate,
        meta: event.description,
        allDay: event.allDay,
      })),
  ].slice(0, MAX_ITEMS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Was ist heute wichtig?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {prioritized.length === 0 ? (
          <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-4 text-sm">
            <div className="font-semibold text-muted-foreground">Nichts Dringendes</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lege eine Prüfung, Aufgabe oder einen Termin an, um hier Prioritäten zu sehen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/tasks"><Button size="sm" variant="outline">Aufgabe anlegen</Button></Link>
              <Link to="/calendar"><Button size="sm" variant="outline">Termin planen</Button></Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {prioritized.map((item) => {
              const urgency = getUrgency(item.when);
              const isExam = item.kind === "exam";
              const isTask = item.kind === "task";
              const isEvent = item.kind === "event";
              return (
                <li
                  key={item.id}
                  className="rounded-md border px-3 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "rounded-full px-2 py-1 text-xs font-semibold " +
                            (isExam
                              ? "bg-purple-100 text-purple-900"
                              : isTask
                                ? "bg-amber-100 text-amber-900"
                                : "bg-blue-100 text-blue-900")
                          }
                        >
                          {isExam ? "Prüfung" : isTask ? "Aufgabe" : "Termin"}
                        </span>
                        <span className="font-semibold leading-tight">{item.title}</span>
                      </div>
                      {item.meta && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.meta}</p>
                      )}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${urgency.color}`}>
                      {isEvent ? formatTime(item.when) : urgency.label}
                    </span>
                  </div>
                  {!isEvent && (
                    <p className="mt-2 text-xs text-muted-foreground">Fälligkeit: {formatDate(item.when)}</p>
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
