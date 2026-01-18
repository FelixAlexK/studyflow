import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export default function LearningProgress() {
  const progress = useQuery(api.learningCheckIns.getProgress);

  if (!progress) {
    return null;
  }

  const displayPercentage = progress.percentage;
  const totalSessions = progress.totalSessions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lernfortschritt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Diese Woche</span>
            <span className="text-2xl font-bold text-blue-600">{displayPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${displayPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalSessions} Lerneinheiten absolviert
          </p>
        </div>

        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-muted-foreground">
              Ziel: {progress.weeklyGoal} Einheiten pro Woche
            </span>
          </div>
          {displayPercentage === 100 && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <span className="text-xl">✨</span>
              <span>Wochenziel erreicht!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
