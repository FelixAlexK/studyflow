import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import AppLayout from "@/components/AppLayout";
import TaskList from "@/components/TaskList";

export const Route = createFileRoute("/_authed/tasks")({
	component: TasksPage,
	loader: async () => {
		const { user } = await getAuth();
		return { user };
	},
});

function TasksPage() {
	const { user } = useLoaderData({ from: "/_authed/tasks" });

	if (!user) return null;

	return (
		<AppLayout headerTitle="Tasks">
			<TaskList />
		</AppLayout>
	);
}
