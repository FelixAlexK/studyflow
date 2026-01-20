import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import AddWidgetButton from "@/components/AddWidgetButton";
import AppLayout from "@/components/AppLayout";
import CompactCalendar from "@/components/CompactCalendar";
import DraggableGrid from "@/components/DraggableGrid";
import HelpfulTips from "@/components/HelpfulTips";
import HeroStats from "@/components/HeroStats";
import LearningCheckIns from "@/components/LearningCheckIns";
import LearningProgress from "@/components/LearningProgress";
import { OnboardingFlow, useOnboarding } from "@/components/OnboardingFlow";
import OnboardingHint from "@/components/OnboardingHint";
import PriorityTasks from "@/components/PriorityTasks";
import ProductivityOverview from "@/components/ProductivityOverview";
import ProgressInsights from "@/components/ProgressInsights";
import QuickActionButtons from "@/components/QuickActionButtons";
import QuickFocusTimer from "@/components/QuickFocusTimer";
import RemovableWidget from "@/components/RemovableWidget";
import StressOverview from "@/components/StressOverview";
import TodayAtUni from "@/components/TodayAtUni";
import TodayImportant from "@/components/TodayImportant";
import WeekOverview from "@/components/WeekOverview";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";

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

	// Prepare default orders for sections (dependent on user presence)
	const defaults = {
		primary: user?.id ? ["priority" as const, "timer" as const] : ["timer" as const],
		daily: [
			"calendar" as const,
			"todayImportant" as const,
			"todayAtUni" as const,
			"stressOverview" as const,
			"weekOverview" as const,
		],
		learning: [
			"learningProgress" as const,
			"learningCheckIns" as const,
			"progressInsights" as const,
			"heroStats" as const,
			"productivityOverview" as const,
		],
	};

	const {
		primaryOrder,
		setPrimaryOrder,
		dailyOrder,
		setDailyOrder,
		learningOrder,
		setLearningOrder,
		addPrimary,
		addDaily,
		addLearning,
		removePrimary,
		removeDaily,
		removeLearning,
	} = useDashboardLayout(user?.id, defaults);

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

				{user?.id ? <OnboardingHint /> : null}
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Focus & Tasks</h3>
					<AddWidgetButton
						sectionLabel="Focus & Tasks"
						existingIds={primaryOrder}
						options={[
							{ id: "quickActions" as const, title: "Quick Actions", description: "Shortcut buttons for common tasks" },
							{ id: "helpfulTips" as const, title: "Helpful Tips", description: "Contextual productivity tips" },
						]}
						onAdd={(id) => addPrimary(id)}
					/>
				</div>
				<DraggableGrid
					items={primaryOrder}
					className="grid gap-6 md:grid-cols-3"
					getItemClassName={(id) => (id === "priority" ? "md:col-span-2" : undefined)}
					onOrderChange={setPrimaryOrder}
					renderItem={(id) => {
						const content = (() => {
							switch (id) {
								case "priority":
									return <PriorityTasks />;
								case "timer":
									return <QuickFocusTimer />;
								case "quickActions":
									return <QuickActionButtons />;
								case "helpfulTips":
									return <HelpfulTips />;
								default:
									return null;
							}
						})();
						return (
							<RemovableWidget onRemove={() => removePrimary(id)}>
								{content}
							</RemovableWidget>
						);
					}}
				/>
				{user?.id ? (
					<>
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Daily Overview</h3>
							<AddWidgetButton
								sectionLabel="Daily Overview"
								existingIds={dailyOrder}
								options={[
									{ id: "calendar" as const, title: "Calendar Preview" },
									{ id: "todayImportant" as const, title: "Today Important" },
									{ id: "todayAtUni" as const, title: "Today at Uni" },
									{ id: "stressOverview" as const, title: "Stress Overview" },
									{ id: "weekOverview" as const, title: "Week Overview" },
								]}
								onAdd={(id) => addDaily(id)}
							/>
						</div>
						<DraggableGrid
							items={dailyOrder}
							className="grid gap-6 md:grid-cols-3"
							getItemClassName={(id) =>
								id === "calendar"
									? "md:col-span-2"
									: id === "weekOverview"
									  ? "md:col-span-3"
									  : undefined
							}
							onOrderChange={setDailyOrder}
							renderItem={(id) => {
								const content = (() => {
									switch (id) {
										case "calendar":
											return <CompactCalendar userId={user.id} />;
										case "todayImportant":
											return <TodayImportant userId={user.id} />;
										case "todayAtUni":
											return <TodayAtUni userId={user.id} />;
										case "stressOverview":
											return <StressOverview />;
										case "weekOverview":
											return <WeekOverview userId={user.id} />;
										default:
											return null;
									}
								})();
								return (
									<RemovableWidget onRemove={() => removeDaily(id)}>
										{content}
									</RemovableWidget>
								);
							}}
						/>
					</>
				) : null}
				{user?.id ? (
					<>
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Learning & Insights</h3>
							<AddWidgetButton
								sectionLabel="Learning & Insights"
								existingIds={learningOrder}
								options={[
									{ id: "learningProgress" as const, title: "Learning Progress" },
									{ id: "learningCheckIns" as const, title: "Learning Check-Ins" },
									{ id: "progressInsights" as const, title: "Progress Insights" },
									{ id: "heroStats" as const, title: "Stats Card" },
									{ id: "productivityOverview" as const, title: "Productivity Overview" },
								]}
								onAdd={(id) => addLearning(id)}
							/>
						</div>
						<DraggableGrid
							items={learningOrder}
							className="grid gap-6 md:grid-cols-3"
							getItemClassName={(id) =>
								id === "heroStats" || id === "productivityOverview" ? "md:col-span-3" : undefined
							}
							onOrderChange={setLearningOrder}
							renderItem={(id) => {
								const content = (() => {
									switch (id) {
										case "learningProgress":
											return <LearningProgress />;
										case "learningCheckIns":
											return <LearningCheckIns />;
										case "progressInsights":
											return <ProgressInsights />;
										case "heroStats":
											return <HeroStats />;
										case "productivityOverview":
											return <ProductivityOverview />;
										default:
											return null;
									}
								})();
								return (
									<RemovableWidget onRemove={() => removeLearning(id)}>
										{content}
									</RemovableWidget>
								);
							}}
						/>
					</>
				) : null}

				
			</div>
		</AppLayout>
	);
}
