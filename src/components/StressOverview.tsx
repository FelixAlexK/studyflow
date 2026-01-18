import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

const HORIZON_DAYS = 30;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

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

const isRelevant = (dateStr: string) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const horizon = startOfToday + HORIZON_DAYS * MS_PER_DAY;
  const ts = new Date(dateStr).getTime();
  return ts >= startOfToday && ts <= horizon;
};

const typeStyles = {
  exam: "bg-blue-100 text-blue-800",
  submission: "bg-amber-100 text-amber-800",
} satisfies Record<string, string>;

export default function StressOverview() {
  const { data: exams = [] } = useSuspenseQuery(convexQuery(api.exams.listExams, {}));
  // Cast to any to allow compile before codegen picks up new Convex function
  const submissionsQuery = (api as any).submissions?.listSubmissions;
  const { data: submissions = [] } = useSuspenseQuery(
    convexQuery(submissionsQuery, {}),
  );

  const items = [
    ...(exams as Doc<"exams">[]).map((exam) => ({
      kind: "exam" as const,
      id: String(exam._id),
      title: exam.subject,
      date: exam.dateTime,
      meta: exam.location ? `Ort: ${exam.location}` : undefined,
    })),
    ...(submissions as Doc<"submissions">[]).map((sub) => ({
      kind: "submission" as const,
      id: String(sub._id),
      title: sub.title,
      date: sub.dueDate,
      meta: `Fach: ${sub.subject}`,
      status: sub.status,
    })),
  ]
    .filter((item) => isRelevant(item.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress-Übersicht (nächste 30 Tage)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Kein anstehender Stress – durchatmen!
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isExam = item.kind === "exam";
              const pillClass = isExam ? typeStyles.exam : typeStyles.submission;
              const dateLabel = isExam ? formatDateTime(item.date) : formatDate(item.date);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border bg-card/60 px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold leading-snug">{item.title}</div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${pillClass}`}
                    >
                      {isExam ? "Prüfung" : "Abgabe"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{dateLabel}</div>
                  {item.meta && (
                    <div className="text-xs text-muted-foreground">{item.meta}</div>
                  )}
                  {item.kind === "submission" && item.status === "done" && (
                    <div className="text-[10px] font-semibold uppercase text-green-700">Erledigt</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
