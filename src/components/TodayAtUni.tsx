import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface TodayAtUniProps {
  userId: string;
}

interface CalendarEvent {
  _id: Id<"events">;
  userId: string;
  title: string;
  description?: string;
  type: "vorlesung" | "übung" | "praktikum" | "sonstiges";
  startDate: string;
  endDate?: string;
  color?: string;
  allDay?: boolean;
}

const formatTime = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const typeLabels: Record<CalendarEvent["type"], string> = {
  vorlesung: "Vorlesung",
  übung: "Übung",
  praktikum: "Praktikum",
  sonstiges: "Sonstiges",
};

const typeColors: Record<CalendarEvent["type"], string> = {
  vorlesung: "bg-blue-100 text-blue-800",
  übung: "bg-green-100 text-green-800",
  praktikum: "bg-amber-100 text-amber-800",
  sonstiges: "bg-purple-100 text-purple-800",
};

const isTodayLocal = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const TodayAtUni = ({ userId }: TodayAtUniProps) => {
  const { data: events = [] } = useSuspenseQuery(
    convexQuery(api.events.listEvents, { userId })
  );

  const todayEvents = (events as CalendarEvent[])
    .filter((event) => isTodayLocal(event.startDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heute an der Uni</CardTitle>
      </CardHeader>
      <CardContent>
        {todayEvents.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed py-6 text-sm text-muted-foreground">
            Heute frei 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {todayEvents.map((event) => {
              const type = event.type;
              const colorClass = typeColors[type];
              return (
                <div
                  key={event._id}
                  className="flex items-start justify-between rounded-lg border bg-muted/40 px-3 py-2"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.allDay
                        ? "Ganztägig"
                        : `${formatTime(event.startDate)}${event.endDate ? ` – ${formatTime(event.endDate)}` : ""}`}
                    </div>
                    {event.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}
                  >
                    {typeLabels[type]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAtUni;
