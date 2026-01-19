import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

const MAX_ITEMS = 5;

const isToday = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const ts = date.getTime();
  return ts >= start && ts < end;
};


const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Calm: only show what is relevant today to avoid stress

interface TodayImportantProps {
  userId: string;
}

export default function TodayImportant({ userId }: TodayImportantProps) {
  const { data: events = [] } = useSuspenseQuery(
    convexQuery(api.events.listEvents, { userId }),
  );
  const { data: tasks = [] } = useSuspenseQuery(convexQuery(api.tasks.listTasks, {}));
  const { data: exams = [] } = useSuspenseQuery(convexQuery(api.exams.listExams, {}));
  const todayExams = (exams as Doc<"exams">[])
    .filter((exam) => isToday(exam.dateTime))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, MAX_ITEMS);

  const todayTasks = (tasks as Doc<"tasks">[])
    .filter((task) => task.status !== "done" && isToday(task.dueDate))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, MAX_ITEMS);

  const todayEvents = (events as Doc<"events">[])
    .filter((event) => isToday(event.startDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, MAX_ITEMS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Was ist heute wichtig?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prüfungen heute */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-900">Prüfungen</span>
            <span className="text-sm text-muted-foreground">Nur für heute</span>
          </div>
          {todayExams.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Prüfungen heute</div>
              <p className="mt-1 text-xs text-muted-foreground">Plane deine nächste Prüfung, wenn sie ansteht.</p>
              <Link to="/calendar" className="mt-2 inline-block"><Button size="sm" variant="outline">Prüfung anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayExams.map((exam) => (
                <li key={String(exam._id)} className="rounded-md border px-3 py-2 text-sm bg-white/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold leading-tight">{exam.subject}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(exam.dateTime)}</span>
                  </div>
                  {exam.location && (
                    <p className="text-xs text-muted-foreground mt-1">Ort: {exam.location}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Aufgaben heute */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">Aufgaben</span>
            <span className="text-sm text-muted-foreground">Nur für heute</span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Aufgaben fällig</div>
              <p className="mt-1 text-xs text-muted-foreground">Lege eine Aufgabe für heute an, wenn nötig.</p>
              <Link to="/tasks" className="mt-2 inline-block"><Button size="sm" variant="outline">Aufgabe anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <li key={String(task._id)} className="rounded-md border px-3 py-2 text-sm bg-white/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold leading-tight">{task.title}</span>
                    <span className="text-xs text-muted-foreground">Heute</span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Termine heute */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-900">Termine</span>
            <span className="text-sm text-muted-foreground">Nur für heute</span>
          </div>
          {todayEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Termine heute</div>
              <p className="mt-1 text-xs text-muted-foreground">Plane einen Termin, wenn du etwas eintragen möchtest.</p>
              <Link to="/calendar" className="mt-2 inline-block"><Button size="sm" variant="outline">Termin anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((event) => (
                <li key={String(event._id)} className="rounded-md border px-3 py-2 text-sm bg-white/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold leading-tight">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{event.allDay ? "Ganztägig" : formatTime(event.startDate)}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
