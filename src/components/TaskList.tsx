import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type Task = Doc<"tasks">;

const statusLabel: Record<Task["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export default function TaskList() {
  const { data: tasks = [], isLoading, isError, refetch } = useQuery(
    convexQuery(api.tasks.listTasks, {}),
  );

  const updateTask = useConvexMutation(api.tasks.updateTask);
  const deleteTask = useConvexMutation(api.tasks.deleteTask);

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    await updateTask({ taskId: task._id, status: nextStatus });
    void refetch();
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    await deleteTask({ taskId });
    void refetch();
  };

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        // Sort by completion then due date then title
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        return a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title);
      }),
    [tasks],
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Track tasks, mark complete, and clear them out.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks...
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Something went wrong loading tasks. Please retry.
          </div>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No tasks yet. Add a task to get started.
          </div>
        )}

        {!isLoading && !isError && sorted.length > 0 && (
          <div className="divide-y rounded-md border">
            {sorted.map((task) => {
              const isDone = task.status === "done";
              return (
                <div
                  key={task._id}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => handleToggleComplete(task)}
                    aria-label={`Mark ${task.title} as ${isDone ? "not done" : "done"}`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className={`font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete task"
                        onClick={() => handleDelete(task._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-medium text-foreground">
                        <CheckCircle2 className="h-3 w-3" /> {statusLabel[task.status]}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}