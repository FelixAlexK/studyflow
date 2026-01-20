import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import AppLayout from "@/components/AppLayout";
import CompactCalendar from "@/components/CompactCalendar";
import HeroStats from "@/components/HeroStats";
import LearningCheckIns from "@/components/LearningCheckIns";
import LearningProgress from "@/components/LearningProgress";
import { OnboardingFlow, useOnboarding } from "@/components/OnboardingFlow";
import PriorityTasks from "@/components/PriorityTasks";
import ProductivityOverview from "@/components/ProductivityOverview";
import ProgressInsights from "@/components/ProgressInsights";
import QuickFocusTimer from "@/components/QuickFocusTimer";
import StressOverview from "@/components/StressOverview";
import TodayAtUni from "@/components/TodayAtUni";
import TodayImportant from "@/components/TodayImportant";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import WeekOverview from "@/components/WeekOverview";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
	component: DashboardPage,
	loader: async () => {
		const { user } = await getAuth();

		return { user };
	},
});

function DashboardPage() {
	const { user } = useLoaderData({ from: "/" });
	const { shouldShowOnboarding, markAsComplete } = useOnboarding();

	const { data: numbers } = useQuery(
		convexQuery(api.myFunctions.listNumbers, { count: 10 }),
	);

	return (
		<AppLayout headerTitle={`Welcome, ${user?.firstName || "User"}`}>
			{shouldShowOnboarding && <OnboardingFlow onComplete={markAsComplete} />}

			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Welcome, {user?.firstName || "User"}
					</h2>
					<p className="text-muted-foreground">
						Track your productivity and manage your tasks here.
					</p>
				</div>
				{user?.id ? <HeroStats /> : null}
				<div className="grid gap-6 md:grid-cols-3">
					{user?.id ? (
						<div className="md:col-span-2">
							<PriorityTasks />
						</div>
					) : null}
					<QuickFocusTimer />
				</div>
				{user?.id ? <CompactCalendar userId={user.id} /> : null}
				{user?.id ? <TodayImportant userId={user.id} /> : null}
				{user?.id ? <TodayAtUni userId={user.id} /> : null}
				{user?.id ? <StressOverview /> : null}
				{user?.id ? <WeekOverview userId={user.id} /> : null}
				{user?.id ? <LearningProgress /> : null}
				{user?.id ? <LearningCheckIns /> : null}			{user?.id ? <ProgressInsights /> : null}				<div>
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
							<div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
								<div className="mb-2 text-sm text-muted-foreground">
									You're all caught up!
								</div>
								<p className="text-xs text-muted-foreground">
									Navigate to Tasks to manage your to-do items.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
