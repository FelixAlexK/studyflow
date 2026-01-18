import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { logError } from "@/lib/error-handler";
import { api } from "../../convex/_generated/api";

export default function ProductivityOverview() {
  const { data: completedTasks = 0, isLoading: tasksLoading, isError: tasksError } = useQuery(
    convexQuery(api.stats.getCompletedTasksCount, {}),
  );

  const { data: focusSessions = 0, isLoading: sessionsLoading, isError: sessionsError } = useQuery(
    convexQuery(api.stats.getFocusSessionsCount, {}),
  );

  const { data: totalFocusMinutes = 0, isLoading: minutesLoading, isError: minutesError } = useQuery(
    convexQuery(api.stats.getTotalFocusMinutes, {}),
  );

  if (tasksError || sessionsError || minutesError) {
    logError(tasksError || sessionsError || minutesError, "ProductivityOverview.fetch");
  }

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainingMinutes = totalFocusMinutes % 60;

  const renderCard = (
    title: string,
    description: string,
    isLoading: boolean,
    isError: boolean,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load</span>
          </div>
        ) : isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <div className="flex items-end gap-2">
            {content}
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {renderCard(
        "Completed Tasks",
        "This week",
        tasksLoading,
        tasksError,
        <CheckCircle2 className="h-5 w-5 text-green-600" />,
        <div className="text-3xl font-bold">{completedTasks}</div>
      )}

      {renderCard(
        "Focus Sessions",
        "Total completed",
        sessionsLoading,
        sessionsError,
        <BookOpen className="h-5 w-5 text-blue-600" />,
        <div className="text-3xl font-bold">{focusSessions}</div>
      )}

      {renderCard(
        "Total Focus Time",
        "Hours and minutes",
        minutesLoading,
        minutesError,
        null,
        <div className="text-3xl font-bold">
          {focusHours}h {focusRemainingMinutes}m
        </div>
      )}
    </div>
  );
}
