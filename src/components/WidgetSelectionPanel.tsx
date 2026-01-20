import {
	AlarmClock,
	ArrowDown,
	ArrowUp,
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	CheckSquare,
	Clock,
	GripVertical,
	Heart,
	Lightbulb,
	ListChecks,
	Sparkles,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type {
	DailyId,
	LearningId,
	PrimaryId,
} from "@/hooks/use-dashboard-layout";

type WidgetCategory = "primary" | "daily" | "learning";

type WidgetInfo = {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	category: WidgetCategory;
};

const WIDGET_CATALOG: WidgetInfo[] = [
	// Primary Widgets
	{
		id: "priority",
		title: "Priority Tasks",
		description: "Your most important tasks for today",
		icon: CheckSquare,
		category: "primary",
	},
	{
		id: "timer",
		title: "Focus Timer",
		description: "Pomodoro timer to stay focused",
		icon: Clock,
		category: "primary",
	},
	{
		id: "quickActions",
		title: "Quick Actions",
		description: "Shortcut buttons for common tasks",
		icon: Zap,
		category: "primary",
	},
	{
		id: "helpfulTips",
		title: "Helpful Tips",
		description: "Contextual productivity tips",
		icon: Lightbulb,
		category: "primary",
	},
	// Daily Overview Widgets
	{
		id: "calendar",
		title: "Calendar Preview",
		description: "Quick view of upcoming events",
		icon: Calendar,
		category: "daily",
	},
	{
		id: "todayImportant",
		title: "Today Important",
		description: "Key items requiring your attention",
		icon: Target,
		category: "daily",
	},
	{
		id: "todayAtUni",
		title: "Today at Uni",
		description: "Your university schedule and classes",
		icon: BookOpen,
		category: "daily",
	},
	{
		id: "stressOverview",
		title: "Stress Overview",
		description: "Monitor your stress levels",
		icon: Heart,
		category: "daily",
	},
	{
		id: "weekOverview",
		title: "Week Overview",
		description: "Summary of your week ahead",
		icon: ListChecks,
		category: "daily",
	},
	// Learning & Insights Widgets
	{
		id: "learningProgress",
		title: "Learning Progress",
		description: "Track your learning journey",
		icon: Brain,
		category: "learning",
	},
	{
		id: "learningCheckIns",
		title: "Learning Check-Ins",
		description: "Regular self-assessment prompts",
		icon: AlarmClock,
		category: "learning",
	},
	{
		id: "progressInsights",
		title: "Progress Insights",
		description: "Analytics on your progress",
		icon: TrendingUp,
		category: "learning",
	},
	{
		id: "heroStats",
		title: "Stats Card",
		description: "Your key performance metrics",
		icon: BarChart3,
		category: "learning",
	},
	{
		id: "productivityOverview",
		title: "Productivity Overview",
		description: "Comprehensive productivity analytics",
		icon: Sparkles,
		category: "learning",
	},
];

type WidgetSelectionPanelProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	enabledPrimary: PrimaryId[];
	enabledDaily: DailyId[];
	enabledLearning: LearningId[];
	onAddPrimary: (id: PrimaryId) => void;
	onAddDaily: (id: DailyId) => void;
	onAddLearning: (id: LearningId) => void;
	onRemovePrimary: (id: PrimaryId) => void;
	onRemoveDaily: (id: DailyId) => void;
	onRemoveLearning: (id: LearningId) => void;
	onReorderPrimary: (order: PrimaryId[]) => void;
	onReorderDaily: (order: DailyId[]) => void;
	onReorderLearning: (order: LearningId[]) => void;
	hasUser: boolean;
};

export default function WidgetSelectionPanel({
	open,
	onOpenChange,
	enabledPrimary,
	enabledDaily,
	enabledLearning,
	onAddPrimary,
	onAddDaily,
	onAddLearning,
	onRemovePrimary,
	onRemoveDaily,
	onRemoveLearning,
	onReorderPrimary,
	onReorderDaily,
	onReorderLearning,
	hasUser,
}: WidgetSelectionPanelProps) {
	const handleAddWidget = (widgetId: string, category: WidgetCategory) => {
		switch (category) {
			case "primary":
				onAddPrimary(widgetId as PrimaryId);
				break;
			case "daily":
				onAddDaily(widgetId as DailyId);
				break;
			case "learning":
				onAddLearning(widgetId as LearningId);
				break;
		}
	};

	const handleRemoveWidget = (widgetId: string, category: WidgetCategory) => {
		switch (category) {
			case "primary":
				onRemovePrimary(widgetId as PrimaryId);
				break;
			case "daily":
				onRemoveDaily(widgetId as DailyId);
				break;
			case "learning":
				onRemoveLearning(widgetId as LearningId);
				break;
		}
	};

	const moveWidget = (
		widgetId: string,
		category: WidgetCategory,
		direction: "up" | "down",
	) => {
		let currentOrder: string[] = [];
		let reorderFn:
			| ((order: PrimaryId[]) => void)
			| ((order: DailyId[]) => void)
			| ((order: LearningId[]) => void) = () => {};

		switch (category) {
			case "primary":
				currentOrder = [...enabledPrimary];
				reorderFn = onReorderPrimary;
				break;
			case "daily":
				currentOrder = [...enabledDaily];
				reorderFn = onReorderDaily;
				break;
			case "learning":
				currentOrder = [...enabledLearning];
				reorderFn = onReorderLearning;
				break;
		}

		const currentIndex = currentOrder.indexOf(widgetId);
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= currentOrder.length) return;

		[currentOrder[currentIndex], currentOrder[newIndex]] = [
			currentOrder[newIndex],
			currentOrder[currentIndex],
		];

		switch (category) {
			case "primary":
				(reorderFn as (order: PrimaryId[]) => void)(
					currentOrder as PrimaryId[],
				);
				break;
			case "daily":
				(reorderFn as (order: DailyId[]) => void)(currentOrder as DailyId[]);
				break;
			case "learning":
				(reorderFn as (order: LearningId[]) => void)(
					currentOrder as LearningId[],
				);
				break;
		}
	};

	const primaryWidgets = WIDGET_CATALOG.filter((w) => w.category === "primary");
	const dailyWidgets = WIDGET_CATALOG.filter((w) => w.category === "daily");
	const learningWidgets = WIDGET_CATALOG.filter(
		(w) => w.category === "learning",
	);

	const AvailableWidgetCard = ({ widget }: { widget: WidgetInfo }) => {
		const Icon = widget.icon;
		const requiresAuth = widget.category !== "primary";

		return (
			<div className="group relative rounded-xl border bg-card shadow-sm p-6 hover:shadow-md transition-all">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4 flex-1 min-w-0">
						<div className="shrink-0">
							<Icon className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold leading-none mb-2">
								{widget.title}
							</h4>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{widget.description}
							</p>
						</div>
					</div>
					<Button
						size="sm"
						variant="default"
						disabled={requiresAuth && !hasUser}
						onClick={() => handleAddWidget(widget.id, widget.category)}
						className="shrink-0"
					>
						Add
					</Button>
				</div>
			</div>
		);
	};

	const ActiveWidgetCard = ({
		widget,
		index,
		total,
	}: { widget: WidgetInfo; index: number; total: number }) => {
		const Icon = widget.icon;

		return (
			<div className="rounded-xl border bg-card shadow-sm p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
						<Icon className="h-5 w-5 text-muted-foreground shrink-0" />
						<h4 className="font-semibold leading-none">{widget.title}</h4>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Button
							size="sm"
							variant="outline"
							disabled={index === 0}
							onClick={() => moveWidget(widget.id, widget.category, "up")}
							className="h-8 w-8 p-0"
						>
							<ArrowUp className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={index === total - 1}
							onClick={() => moveWidget(widget.id, widget.category, "down")}
							className="h-8 w-8 p-0"
						>
							<ArrowDown className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => handleRemoveWidget(widget.id, widget.category)}
							className="h-8 px-3"
						>
							Remove
						</Button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-xl">
				<SheetHeader className="px-6">
					<SheetTitle>Manage Widgets</SheetTitle>
					<SheetDescription>
						Add, remove, or reorder widgets on your dashboard
					</SheetDescription>
				</SheetHeader>

				<ScrollArea className="h-[calc(100vh-8rem)] mt-6">
					<div className="space-y-6 px-6 pb-6">
						{/* Active Primary Widgets */}
						{enabledPrimary.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Zap className="h-4 w-4 text-muted-foreground" />
									<h3 className="font-semibold">Active Focus & Tasks</h3>
								</div>
								<div className="grid gap-3">
									{enabledPrimary.map((id, index) => {
										const widget = primaryWidgets.find((w) => w.id === id);
										return widget ? (
											<ActiveWidgetCard
												key={widget.id}
												widget={widget}
												index={index}
												total={enabledPrimary.length}
											/>
										) : null;
									})}
								</div>
							</div>
						)}

						{/* Available Primary Widgets */}
						{(() => {
							const available = primaryWidgets.filter(
								(w) => !enabledPrimary.includes(w.id as PrimaryId),
							);
							return available.length > 0 ? (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-muted-foreground" />
										<h3 className="font-semibold">
											{enabledPrimary.length > 0
												? "More Focus & Tasks"
												: "Focus & Tasks"}
										</h3>
									</div>
									<div className="grid gap-3">
										{available.map((widget) => (
											<AvailableWidgetCard key={widget.id} widget={widget} />
										))}
									</div>
								</div>
							) : null;
						})()}

						{hasUser && (
							<>
								<Separator />

								{/* Active Daily Widgets */}
								{enabledDaily.length > 0 && (
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<h3 className="font-semibold">Active Daily Overview</h3>
										</div>
										<div className="grid gap-3">
											{enabledDaily.map((id, index) => {
												const widget = dailyWidgets.find((w) => w.id === id);
												return widget ? (
													<ActiveWidgetCard
														key={widget.id}
														widget={widget}
														index={index}
														total={enabledDaily.length}
													/>
												) : null;
											})}
										</div>
									</div>
								)}

								{/* Available Daily Widgets */}
								{(() => {
									const available = dailyWidgets.filter(
										(w) => !enabledDaily.includes(w.id as DailyId),
									);
									return available.length > 0 ? (
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<h3 className="font-semibold">
													{enabledDaily.length > 0
														? "More Daily Overview"
														: "Daily Overview"}
												</h3>
											</div>
											<div className="grid gap-3">
												{available.map((widget) => (
													<AvailableWidgetCard key={widget.id} widget={widget} />
												))}
											</div>
										</div>
									) : null;
								})()}

								<Separator />

								{/* Active Learning Widgets */}
								{enabledLearning.length > 0 && (
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Brain className="h-4 w-4 text-muted-foreground" />
											<h3 className="font-semibold">
												Active Learning & Insights
											</h3>
										</div>
										<div className="grid gap-3">
											{enabledLearning.map((id, index) => {
												const widget = learningWidgets.find((w) => w.id === id);
												return widget ? (
													<ActiveWidgetCard
														key={widget.id}
														widget={widget}
														index={index}
														total={enabledLearning.length}
													/>
												) : null;
											})}
										</div>
									</div>
								)}

								{/* Available Learning Widgets */}
								{(() => {
									const available = learningWidgets.filter(
										(w) => !enabledLearning.includes(w.id as LearningId),
									);
									return available.length > 0 ? (
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<Brain className="h-4 w-4 text-muted-foreground" />
												<h3 className="font-semibold">
													{enabledLearning.length > 0
														? "More Learning & Insights"
														: "Learning & Insights"}
												</h3>
											</div>
											<div className="grid gap-3">
												{available.map((widget) => (
													<AvailableWidgetCard key={widget.id} widget={widget} />
												))}
											</div>
										</div>
									) : null;
								})()}
							</>
						)}

						{!hasUser && (
							<div className="rounded-xl border border-dashed p-6 text-center space-y-3">
								<Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
								<div className="space-y-1">
									<h4 className="font-semibold">Unlock More Widgets</h4>
									<p className="text-sm text-muted-foreground">
										Sign in to access Daily Overview and Learning & Insights
										widgets.
									</p>
								</div>
								<Button size="sm" variant="outline">
									Sign In
								</Button>
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
