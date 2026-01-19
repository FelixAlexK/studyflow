import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { TodayAtUniSkeleton } from "@/components/SkeletonLoaders";
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
  const [expandedEvents, setExpandedEvents] = useState<Set<Id<"events">>>(new Set());

  const { data: events = [], isLoading } = useQuery(
    convexQuery(api.events.listEvents, { userId })
  );
  
  if (isLoading) {
    return <TodayAtUniSkeleton />;
  }

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
              const isExpanded = expandedEvents.has(event._id);
              const hasDetails = !!event.description;
              return (
                <div
                  key={event._id}
                  className="rounded-lg border bg-muted/40"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasDetails) return;
                      const newSet = new Set(expandedEvents);
                      if (isExpanded) {
                        newSet.delete(event._id);
                      } else {
                        newSet.add(event._id);
                      }
                      setExpandedEvents(newSet);
                    }}
                    className={`w-full flex items-start justify-between px-3 py-2 text-left ${
                      hasDetails ? "hover:bg-muted/60 transition-colors" : ""
                    }`}
                    disabled={!hasDetails}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.allDay
                          ? "Ganztägig"
                          : `${formatTime(event.startDate)}${event.endDate ? ` – ${formatTime(event.endDate)}` : ""}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}
                      >
                        {typeLabels[type]}
                      </span>
                      {hasDetails && (
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </button>
                  {isExpanded && event.description && (
                    <div className="px-3 pb-2 text-xs text-muted-foreground border-t pt-2">
                      {event.description}
                    </div>
                  )}
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
