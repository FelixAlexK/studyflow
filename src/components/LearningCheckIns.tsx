import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

export default function LearningCheckIns() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const checkIns = useQuery(api.learningCheckIns.listCheckIns) || [];
  const hasCheckedIn = useQuery(api.learningCheckIns.hasCheckedInToday) ?? false;
  const checkInCount = useQuery(api.learningCheckIns.getCheckInCount, { daysBack: 7 }) ?? 0;

  const createCheckIn = useMutation(api.learningCheckIns.createCheckIn);

  const handleCheckIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await createCheckIn({});
      setSuccessMessage("Großartig! Du hast heute gelernt! 🎉");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Check-in konnte nicht erstellt werden.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lern-Check-ins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Diese Woche: {checkInCount} Tage
          </p>
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || hasCheckedIn}
            className="w-full"
          >
            {hasCheckedIn ? "✓ Heute bereits gelernt" : "Heute gelernt"}
          </Button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
        {successMessage && (
          <div className="text-sm text-green-600">{successMessage}</div>
        )}

        {checkIns.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">
              Letzte Check-ins
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {checkIns.slice(0, 10).map((checkIn: Doc<"learningCheckIns">) => {
                const date = new Date(checkIn.date);
                const formatted = new Intl.DateTimeFormat("de-DE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                }).format(date);
                return (
                  <div
                    key={String(checkIn._id)}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <span className="text-green-600">✓</span>
                    <span>{formatted}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
