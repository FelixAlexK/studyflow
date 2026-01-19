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

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

interface TodayImportantProps {
  userId: string;
}

export default function TodayImportant({ userId }: TodayImportantProps) {
  const { data: events = [] } = useSuspenseQuery(
    convexQuery(api.events.listEvents, { userId }),
  );
  const { data: tasks = [] } = useSuspenseQuery(convexQuery(api.tasks.listTasks, {}));

  const todaysEvents = (events as Doc<"events">[])
    .filter((event) => isToday(event.startDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, MAX_ITEMS);

  const todaysTasks = (tasks as Doc<"tasks">[])
    .filter((task) => isToday(task.dueDate) && task.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, MAX_ITEMS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Was ist heute wichtig?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Termine heute</div>
          {todaysEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Termine heute</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Plane einen Termin, damit er in deinem Tagesplan auftaucht.
              </p>
              <Link to="/calendar" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Termin anlegen</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todaysEvents.map((event) => (
                <li
                  key={String(event._id)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium leading-tight">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.allDay ? "ganztägig" : formatTime(event.startDate)}
                    </span>
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {event.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Heute fällige Aufgaben</div>
          {todaysTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Aufgaben fällig</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Lege die erste Aufgabe an und setze eine Frist für heute.
              </p>
              <Link to="/tasks" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Aufgabe anlegen</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todaysTasks.map((task) => (
                <li
                  key={String(task._id)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium leading-tight">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
                  </div>
                  {task.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </div>
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
