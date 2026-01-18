import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import AppLayout from "@/components/AppLayout";
import PomodoroTimer from "@/components/PomodoroTimer";

export const Route = createFileRoute("/_authed/pomodoro")({
  component: PomodoroPage,
  loader: async () => {
    const { user } = await getAuth();
    return { user };
  },
});

function PomodoroPage() {
  const { user } = useLoaderData({ from: "/_authed/pomodoro" });

  if (!user) return null;

  return (
    <AppLayout headerTitle="Focus Timer">
      <div className="flex justify-center">
        <PomodoroTimer />
      </div>
    </AppLayout>
  );
}
