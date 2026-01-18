import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

  const createTask = useConvexMutation(api.tasks.createTask);
  const updateTask = useConvexMutation(api.tasks.updateTask);
  const deleteTask = useConvexMutation(api.tasks.deleteTask);
  const updateTaskReminder = useConvexMutation(api.reminders.updateTaskReminder);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "todo" as Task["status"],
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"tasks"> | null>(null);
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "todo" as Task["status"],
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [expandedReminderId, setExpandedReminderId] = useState<Id<"tasks"> | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState<Record<string, number>>({});

  const toISODate = (value: string) => new Date(`${value}T00:00:00`).toISOString();
  const toDateInputValue = (iso: string) => new Date(iso).toISOString().slice(0, 10);

  const handleCreate = async () => {
    setFormError(null);

    if (!formValues.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formValues.dueDate) {
      setFormError("Due date is required.");
      return;
    }

    try {
      await createTask({
        title: formValues.title.trim(),
        description: formValues.description.trim() || undefined,
        dueDate: toISODate(formValues.dueDate),
        status: formValues.status,
      });
      setFormValues({ title: "", description: "", dueDate: "", status: "todo" });
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create task.");
    }
  };

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
        <div className="space-y-2 rounded-md border p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Task title"
                value={formValues.title}
                onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Description (optional)"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="w-full space-y-2 sm:w-64">
              <Input
                type="date"
                value={formValues.dueDate}
                onChange={(e) => setFormValues((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formValues.status}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, status: e.target.value as Task["status"] }))
              }
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <Button onClick={handleCreate} className="w-full">
                Add Task
              </Button>
            </div>
          </div>
          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
              {formError}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <div className="font-medium text-destructive">Failed to load tasks</div>
            <p className="mt-1 text-destructive/70">
              Something went wrong. Please refresh the page or try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-semibold text-muted-foreground">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a task above to get started tracking your work.
            </p>
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
                  <div className="flex-1 space-y-2">
                    {editingId === task._id ? (
                      <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                        <Input
                          value={editValues.title}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                        <textarea
                          className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={editValues.description}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Input
                            type="date"
                            value={editValues.dueDate}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev, dueDate: e.target.value }))
                            }
                          />
                          <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={editValues.status}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                status: e.target.value as Task["status"],
                              }))
                            }
                          >
                            <option value="todo">To do</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={async () => {
                                setEditError(null);

                                if (!editValues.title.trim()) {
                                  setEditError("Title is required.");
                                  return;
                                }

                                if (!editValues.dueDate) {
                                  setEditError("Due date is required.");
                                  return;
                                }

                                try {
                                  await updateTask({
                                    taskId: task._id,
                                    title: editValues.title.trim(),
                                    description: editValues.description.trim() || undefined,
                                    dueDate: toISODate(editValues.dueDate),
                                    status: editValues.status,
                                  });
                                  setEditingId(null);
                                  void refetch();
                                } catch (err) {
                                  setEditError(
                                    err instanceof Error ? err.message : "Failed to save task.",
                                  );
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        {editError && (
                          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                            {editError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
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
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Configure reminder"
                              onClick={() => setExpandedReminderId(expandedReminderId === task._id ? null : task._id)}
                            >
                              <Bell className={`h-4 w-4 ${task.reminderEnabled ? "fill-current text-blue-600" : ""}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Edit task"
                              onClick={() => {
                                setEditingId(task._id);
                                setEditError(null);
                                setEditValues({
                                  title: task.title,
                                  description: task.description ?? "",
                                  dueDate: toDateInputValue(task.dueDate),
                                  status: task.status,
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete task"
                              onClick={() => handleDelete(task._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-medium text-foreground">
                            <CheckCircle2 className="h-3 w-3" /> {statusLabel[task.status]}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        {expandedReminderId === task._id && (
                          <div className="mt-3 space-y-3 rounded-md border bg-muted/20 p-3">
                            <div className="flex items-center gap-2">
                              <input
                                id={`reminder-${String(task._id)}`}
                                type="checkbox"
                                checked={task.reminderEnabled ?? false}
                                onChange={async (e) => {
                                  await updateTaskReminder({
                                    taskId: task._id,
                                    reminderEnabled: e.target.checked,
                                  });
                                  void refetch();
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label htmlFor={`reminder-${String(task._id)}`} className="text-sm font-medium">Enable reminder</label>
                            </div>
                            {task.reminderEnabled && (
                              <div className="space-y-2">
                                <label htmlFor={`reminder-minutes-${String(task._id)}`} className="text-xs font-medium">Notify me:</label>
                                <select
                                  id={`reminder-minutes-${String(task._id)}`}
                                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                  value={reminderMinutes[String(task._id)] ?? task.reminderMinutesBefore ?? 1440}
                                  onChange={(e) => {
                                    const minutes = parseInt(e.target.value, 10);
                                    setReminderMinutes((prev) => ({ ...prev, [String(task._id)]: minutes }));
                                  }}
                                >
                                  <option value="60">1 hour before</option>
                                  <option value="360">6 hours before</option>
                                  <option value="1440">1 day before</option>
                                  <option value="2880">2 days before</option>
                                </select>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={async () => {
                                    const minutes = reminderMinutes[String(task._id)] ?? task.reminderMinutesBefore ?? 1440;
                                    await updateTaskReminder({
                                      taskId: task._id,
                                      reminderMinutesBefore: minutes,
                                    });
                                    void refetch();
                                    setExpandedReminderId(null);
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
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