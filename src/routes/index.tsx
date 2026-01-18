import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import { useAuth } from "@workos-inc/authkit-react";
import AppLayout from "@/components/AppLayout";
import ProductivityOverview from "@/components/ProductivityOverview";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: DashboardPage,
	loader: async () => {
	const { user} = await getAuth();

	return { user };
  },
});

function DashboardPage() {
	const { user } = useLoaderData({ from: "/" });

	const { data: numbers } = useSuspenseQuery(convexQuery(api.myFunctions.listNumbers, {count: 10}));

	return (
		<AppLayout  headerTitle={`Welcome, ${user?.firstName || "User"}`}>
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Welcome, {user?.firstName || "User"}
					</h2>
					<p className="text-muted-foreground">
						Track your productivity and manage your tasks here.
					</p>
				</div>

				<div>
					<h3 className="mb-4 text-lg font-semibold">Your Progress</h3>
					<ProductivityOverview />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Your Tasks</CardTitle>
						<CardDescription>
							{numbers && numbers.numbers.length > 0
								? `You have ${numbers.numbers.length} number${numbers.numbers.length !== 1 ? "s" : ""}`
								: "No numbers yet"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{numbers && numbers.numbers.length > 0 ? (
							<div className="space-y-2">
								{numbers.numbers.map((number) => (
									<div
										key={number}
										className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
									>
										<div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary" />
										<span>{number}</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No numbers yet. Start by creating your first number!
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	)
}
