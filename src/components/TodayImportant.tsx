import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

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
  const [expandedExams, setExpandedExams] = useState<Set<Id<"exams">>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<Id<"tasks">>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<Id<"events">>>(new Set());

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
        {/* Prüfungen heute - HÖCHSTE PRIORITÄT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">🎓 Prüfungen</span>
            <span className="text-xs text-muted-foreground font-medium">Heute</span>
          </div>
          {todayExams.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Prüfungen heute</div>
              <p className="mt-1 text-xs text-muted-foreground">Plane deine nächste Prüfung, wenn sie ansteht.</p>
              <Link to="/calendar" className="mt-2 inline-block"><Button size="sm" variant="outline">Prüfung anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayExams.map((exam) => {
                const isExpanded = expandedExams.has(exam._id);
                const hasDetails = !!exam.location;
                return (
                  <li key={String(exam._id)} className="rounded-lg border-2 border-purple-200 bg-purple-50/80 shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasDetails) return;
                        const newSet = new Set(expandedExams);
                        if (isExpanded) {
                          newSet.delete(exam._id);
                        } else {
                          newSet.add(exam._id);
                        }
                        setExpandedExams(newSet);
                      }}
                      className={`w-full px-4 py-3 text-left ${
                        hasDetails ? "hover:bg-purple-100/50 transition-colors" : ""
                      }`}
                      disabled={!hasDetails}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold leading-tight text-base text-purple-900">{exam.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-purple-700">{formatTime(exam.dateTime)}</span>
                          {hasDetails && (
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                    {isExpanded && exam.location && (
                      <div className="px-3 pb-2 text-xs text-muted-foreground border-t pt-2 mt-1">
                        <p>Ort: {exam.location}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Aufgaben heute - HOHE PRIORITÄT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white shadow-sm">⚡ Aufgaben</span>
            <span className="text-xs text-muted-foreground font-medium">Heute fällig</span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Aufgaben fällig</div>
              <p className="mt-1 text-xs text-muted-foreground">Lege eine Aufgabe für heute an, wenn nötig.</p>
              <Link to="/tasks" className="mt-2 inline-block"><Button size="sm" variant="outline">Aufgabe anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task) => {
                const isExpanded = expandedTasks.has(task._id);
                const hasDetails = !!task.description;
                return (
                  <li key={String(task._id)} className="rounded-lg border-2 border-amber-200 bg-amber-50/60 shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasDetails) return;
                        const newSet = new Set(expandedTasks);
                        if (isExpanded) {
                          newSet.delete(task._id);
                        } else {
                          newSet.add(task._id);
                        }
                        setExpandedTasks(newSet);
                      }}
                      className={`w-full px-4 py-2.5 text-left ${
                        hasDetails ? "hover:bg-amber-100/50 transition-colors" : ""
                      }`}
                      disabled={!hasDetails}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold leading-tight text-sm text-amber-900">{task.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Heute</span>
                          {hasDetails && (
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                    {isExpanded && task.description && (
                      <div className="px-3 pb-2 text-xs text-muted-foreground border-t pt-2 mt-1">
                        <p>{task.description}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Termine heute - NIEDRIGERE PRIORITÄT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">📅 Termine</span>
            <span className="text-xs text-muted-foreground">Heute</span>
          </div>
          {todayEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-3 text-sm">
              <div className="font-semibold text-muted-foreground">Keine Termine heute</div>
              <p className="mt-1 text-xs text-muted-foreground">Plane einen Termin, wenn du etwas eintragen möchtest.</p>
              <Link to="/calendar" className="mt-2 inline-block"><Button size="sm" variant="outline">Termin anlegen</Button></Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((event) => {
                const isExpanded = expandedEvents.has(event._id);
                const hasDetails = !!event.description;
                return (
                  <li key={String(event._id)} className="rounded-md border border-blue-100 bg-blue-50/40">
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
                      className={`w-full px-3 py-2 text-left ${
                        hasDetails ? "hover:bg-blue-50 transition-colors" : ""
                      }`}
                      disabled={!hasDetails}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium leading-tight text-sm text-blue-900">{event.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-700">{event.allDay ? "Ganztägig" : formatTime(event.startDate)}</span>
                          {hasDetails && (
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                    {isExpanded && event.description && (
                      <div className="px-3 pb-2 text-xs text-muted-foreground border-t pt-2 mt-1">
                        <p>{event.description}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
