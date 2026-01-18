import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

export default function ProductivityOverview() {
  const { data: completedTasks = 0, isLoading: tasksLoading } = useQuery(
    convexQuery(api.stats.getCompletedTasksCount, {}),
  );

  const { data: focusSessions = 0, isLoading: sessionsLoading } = useQuery(
    convexQuery(api.stats.getFocusSessionsCount, {}),
  );

  const { data: totalFocusMinutes = 0, isLoading: minutesLoading } = useQuery(
    convexQuery(api.stats.getTotalFocusMinutes, {}),
  );

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainingMinutes = totalFocusMinutes % 60;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Completed Tasks Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Completed Tasks</CardTitle>
          <CardDescription>This week</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">{completedTasks}</div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Sessions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Focus Sessions</CardTitle>
          <CardDescription>Total completed</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">{focusSessions}</div>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Focus Time Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Total Focus Time</CardTitle>
          <CardDescription>Hours and minutes</CardDescription>
        </CardHeader>
        <CardContent>
          {minutesLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">
                {focusHours}h {focusRemainingMinutes}m
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
