import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { getAuth } from "@workos/authkit-tanstack-react-start";
import { LayoutGrid } from "lucide-react";
import React from "react";
import AppLayout from "@/components/AppLayout";
import CompactCalendar from "@/components/CompactCalendar";
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
import StressOverview from "@/components/StressOverview";
import TodayAtUni from "@/components/TodayAtUni";
import TodayImportant from "@/components/TodayImportant";
import { Button } from "@/components/ui/button";
import WeekOverview from "@/components/WeekOverview";
import WidgetSelectionPanel from "@/components/WidgetSelectionPanel";
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
	const [widgetPanelOpen, setWidgetPanelOpen] = React.useState(false);

	// Prepare default orders for sections (dependent on user presence)
	const defaults = {
		primary: user?.id
			? ["priority" as const, "timer" as const]
			: ["timer" as const],
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
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Welcome, {user?.firstName || "User"}
						</h2>
						<p className="text-muted-foreground">
							Track your productivity and manage your tasks here.
						</p>
					</div>
					<Button
						onClick={() => setWidgetPanelOpen(true)}
						variant="outline"
						size="default"
						className="gap-2"
					>
						<LayoutGrid className="h-4 w-4" />
						Widget Library
					</Button>
				</div>

				{user?.id ? <OnboardingHint /> : null}
				<h3 className="text-lg font-semibold">Focus & Tasks</h3>
				<div className="grid gap-6 md:grid-cols-3">
					{primaryOrder.map((id) => {
						const colSpan = id === "priority" ? "md:col-span-2" : "";
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
						return content ? (
<div key={id} className={colSpan}>
								{content}
							</div>
						) : null;
					})}
				</div>
				{user?.id ? (
<>
						<h3 className="text-lg font-semibold">Daily Overview</h3>
						<div className="grid gap-6 md:grid-cols-3">
							{dailyOrder.map((id) => {
								const colSpan =
									id === "calendar"
										? "md:col-span-2"
										: id === "weekOverview"
											? "md:col-span-3"
											: "";
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
								return content ? (
<div key={id} className={colSpan}>
										{content}
									</div>
								) : null;
							})}
						</div>
					</>
				) : null}
				{user?.id ? (
<>
						<h3 className="text-lg font-semibold">Learning & Insights</h3>
						<div className="grid gap-6 md:grid-cols-3">
							{learningOrder.map((id) => {
								const colSpan =
									id === "heroStats" || id === "productivityOverview"
										? "md:col-span-3"
										: "";
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
								return content ? (
<div key={id} className={colSpan}>
										{content}
									</div>
								) : null;
							})}
						</div>
					</>
				) : null}
			</div>

			<WidgetSelectionPanel
				open={widgetPanelOpen}
				onOpenChange={setWidgetPanelOpen}
				enabledPrimary={primaryOrder}
				enabledDaily={dailyOrder}
				enabledLearning={learningOrder}
				onAddPrimary={addPrimary}
				onAddDaily={addDaily}
				onAddLearning={addLearning}
				onRemovePrimary={removePrimary}
				onRemoveDaily={removeDaily}
				onRemoveLearning={removeLearning}
				onReorderPrimary={setPrimaryOrder}
				onReorderDaily={setDailyOrder}
				onReorderLearning={setLearningOrder}
				hasUser={!!user?.id}
			/>
		</AppLayout>
	);
}
