import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ExamForm from "@/components/ExamForm";
import SubmissionForm from "@/components/SubmissionForm";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/tasks")({
  component: TasksPage,
  loader: async () => {
    const { user } = await getAuth();
    return { user };
  },
});

function TasksPage() {
  const { user } = useLoaderData({ from: "/_authed/tasks" });
  const [activeTab, setActiveTab] = useState<"tasks" | "exam" | "submission">("tasks");

  if (!user) return null;

  return (
    <AppLayout headerTitle="Tasks">
      <div className="space-y-4">
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            onClick={() => setActiveTab("tasks")}
            className="rounded-b-none"
          >
            Aufgaben
          </Button>
          <Button
            variant={activeTab === "exam" ? "default" : "ghost"}
            onClick={() => setActiveTab("exam")}
            className="rounded-b-none"
          >
            Prüfung erstellen
          </Button>
          <Button
            variant={activeTab === "submission" ? "default" : "ghost"}
            onClick={() => setActiveTab("submission")}
            className="rounded-b-none"
          >
            Abgabe erstellen
          </Button>
        </div>
        <div>
          {activeTab === "tasks" && <TaskList />}
          {activeTab === "exam" && <ExamForm />}
          {activeTab === "submission" && <SubmissionForm />}
        </div>
      </div>
    </AppLayout>
  );
}
