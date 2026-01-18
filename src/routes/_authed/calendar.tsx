import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import AppLayout from "@/components/AppLayout";
import CalendarComponent from "@/components/CalendarComponent";

export const Route = createFileRoute("/_authed/calendar")({
	component: RouteComponent,
	loader: async () => {
		const { user } = await getAuth();

		return { user };
	},
});

function RouteComponent() {
	const { user } = useLoaderData({ from: "/_authed/calendar" });

	if (!user) {
		return null;
	}

	return (
		<AppLayout headerTitle="Calendar">
			<div className="h-[calc(100vh-8rem)]">
				<CalendarComponent userId={user.id} />
			</div>
		</AppLayout>
	);
}
