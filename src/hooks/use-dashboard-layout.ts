import React from "react";

export type PrimaryId = "priority" | "timer";
export type DailyId =
  | "calendar"
  | "todayImportant"
  | "todayAtUni"
  | "stressOverview"
  | "weekOverview";
export type LearningId = "learningProgress" | "learningCheckIns" | "progressInsights";

function reconcile<T extends string>(stored: T[] | undefined, available: T[]): T[] {
  const base = Array.isArray(stored) ? stored : [];
  const filtered = base.filter((id) => available.includes(id));
  const missing = available.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

function usePersistentOrder<T extends string>(key: string | undefined, defaults: T[]): [T[], (next: T[]) => void] {
  const [order, setOrder] = React.useState<T[]>(() => {
    if (!key) return defaults;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as T[]) : undefined;
      return reconcile(parsed, defaults);
    } catch {
      return defaults;
    }
  });

  // Re-initialize when key or defaults change (e.g., user login or widgets available change)
  React.useEffect(() => {
    if (!key) {
      setOrder(defaults);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as T[]) : undefined;
      setOrder(reconcile(parsed, defaults));
    } catch {
      setOrder(defaults);
    }
  }, [key, defaults]);

  const update = React.useCallback(
    (next: T[]) => {
      setOrder(next);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore storage errors
        }
      }
    },
    [key],
  );

  return [order, update];
}

export function useDashboardLayout(
  userId: string | undefined,
  defaults: {
    primary: PrimaryId[];
    daily?: DailyId[]; // optional if section not rendered
    learning?: LearningId[]; // optional if section not rendered
  },
) {
  const primaryKey = userId ? `dashboard:primary:${userId}` : undefined;
  const dailyKey = userId ? `dashboard:daily:${userId}` : undefined;
  const learningKey = userId ? `dashboard:learning:${userId}` : undefined;

  const [primaryOrder, setPrimaryOrder] = usePersistentOrder<PrimaryId>(primaryKey, defaults.primary);
  const [dailyOrder, setDailyOrder] = usePersistentOrder<DailyId>(dailyKey, defaults.daily ?? []);
  const [learningOrder, setLearningOrder] = usePersistentOrder<LearningId>(learningKey, defaults.learning ?? []);

  return {
    primaryOrder,
    setPrimaryOrder,
    dailyOrder,
    setDailyOrder,
    learningOrder,
    setLearningOrder,
  };
}
