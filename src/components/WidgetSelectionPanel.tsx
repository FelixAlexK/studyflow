import {
  AlarmClock,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckSquare,
  Clock,
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { DailyId, LearningId, PrimaryId } from "@/hooks/use-dashboard-layout";

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
  hasUser,
}: WidgetSelectionPanelProps) {
  const isWidgetEnabled = (widgetId: string, category: WidgetCategory): boolean => {
    switch (category) {
      case "primary":
        return enabledPrimary.includes(widgetId as PrimaryId);
      case "daily":
        return enabledDaily.includes(widgetId as DailyId);
      case "learning":
        return enabledLearning.includes(widgetId as LearningId);
      default:
        return false;
    }
  };

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

  const primaryWidgets = WIDGET_CATALOG.filter((w) => w.category === "primary");
  const dailyWidgets = WIDGET_CATALOG.filter((w) => w.category === "daily");
  const learningWidgets = WIDGET_CATALOG.filter((w) => w.category === "learning");

  const WidgetCard = ({ widget }: { widget: WidgetInfo }) => {
    const Icon = widget.icon;
    const enabled = isWidgetEnabled(widget.id, widget.category);
    const requiresAuth = widget.category !== "primary";

    return (
      <div className="group relative rounded-xl border bg-card shadow-sm p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold leading-none mb-2">{widget.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{widget.description}</p>
            </div>
          </div>
          {enabled ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRemoveWidget(widget.id, widget.category)}
              className="shrink-0"
            >
              Remove
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              disabled={requiresAuth && !hasUser}
              onClick={() => handleAddWidget(widget.id, widget.category)}
              className="shrink-0"
            >
              Add
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="px-6">
          <SheetTitle>Widget Library</SheetTitle>
          <SheetDescription>
            Customize your dashboard by adding widgets below.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6 px-6 pb-6">
            {/* Primary Widgets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Focus & Tasks</h3>
              </div>
              <div className="grid gap-3">
                {primaryWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
              </div>
            </div>

            {hasUser && (
              <>
                <Separator />

                {/* Daily Overview Widgets */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Daily Overview</h3>
                  </div>
                  <div className="grid gap-3">
                    {dailyWidgets.map((widget) => (
                      <WidgetCard key={widget.id} widget={widget} />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Learning & Insights Widgets */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Learning & Insights</h3>
                  </div>
                  <div className="grid gap-3">
                    {learningWidgets.map((widget) => (
                      <WidgetCard key={widget.id} widget={widget} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {!hasUser && (
              <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-semibold">Unlock More Widgets</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign in to access Daily Overview and Learning & Insights widgets.
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
