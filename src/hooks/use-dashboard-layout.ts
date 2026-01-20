import React from "react";

export type PrimaryId = "priority" | "timer" | "quickActions" | "helpfulTips";
export type DailyId =
  | "calendar"
  | "todayImportant"
  | "todayAtUni"
  | "stressOverview"
  | "weekOverview";
export type LearningId =
  | "learningProgress"
  | "learningCheckIns"
  | "progressInsights"
  | "heroStats"
  | "productivityOverview";

function reconcile<T extends string>(stored: T[] | undefined, available: T[]): T[] {
  const base = Array.isArray(stored) ? stored : [];
  const filtered = base.filter((id) => available.includes(id));
  const missing = available.filter((id) => !filtered.includes(id));
  return [...filtered, ...missing];
}

function arraysEqual<T extends string>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function usePersistentOrder<T extends string>(key: string | undefined, available: T[]): [T[], (next: T[]) => void] {
  const [order, setOrder] = React.useState<T[]>(() => {
    if (!key) return available;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as T[]) : undefined;
      return reconcile(parsed, available);
    } catch {
      return available;
    }
  });

  // Re-initialize when key or defaults change (e.g., user login or widgets available change)
  React.useEffect(() => {
    const apply = (next: T[]) => {
      setOrder((prev) => (arraysEqual(prev, next) ? prev : next));
    };
    if (!key) {
      apply(available);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as T[]) : undefined;
      apply(reconcile(parsed, available));
    } catch {
      apply(available);
    }
  }, [key, available]);

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

  const enabledPrimaryKey = userId ? `dashboard:enabled:primary:${userId}` : undefined;
  const enabledDailyKey = userId ? `dashboard:enabled:daily:${userId}` : undefined;
  const enabledLearningKey = userId ? `dashboard:enabled:learning:${userId}` : undefined;


  const enabledPrimary = React.useMemo(() => {
    if (!enabledPrimaryKey) return [] as PrimaryId[];
    try {
      const raw = localStorage.getItem(enabledPrimaryKey);
      return raw ? (JSON.parse(raw) as PrimaryId[]) : ([] as PrimaryId[]);
    } catch {
      return [] as PrimaryId[];
    }
  }, [enabledPrimaryKey]);
  const enabledDaily = React.useMemo(() => {
    if (!enabledDailyKey) return [] as DailyId[];
    try {
      const raw = localStorage.getItem(enabledDailyKey);
      return raw ? (JSON.parse(raw) as DailyId[]) : ([] as DailyId[]);
    } catch {
      return [] as DailyId[];
    }
  }, [enabledDailyKey]);
  const enabledLearning = React.useMemo(() => {
    if (!enabledLearningKey) return [] as LearningId[];
    try {
      const raw = localStorage.getItem(enabledLearningKey);
      return raw ? (JSON.parse(raw) as LearningId[]) : ([] as LearningId[]);
    } catch {
      return [] as LearningId[];
    }
  }, [enabledLearningKey]);

  const availablePrimary = React.useMemo(
    () => Array.from(new Set([...(defaults.primary ?? []), ...enabledPrimary])),
    [defaults.primary, enabledPrimary],
  );
  const availableDaily = React.useMemo(
    () => Array.from(new Set([...(defaults.daily ?? []), ...enabledDaily])),
    [defaults.daily, enabledDaily],
  );
  const availableLearning = React.useMemo(
    () => Array.from(new Set([...(defaults.learning ?? []), ...enabledLearning])),
    [defaults.learning, enabledLearning],
  );

  const [primaryOrder, setPrimaryOrder] = usePersistentOrder<PrimaryId>(primaryKey, availablePrimary);
  const [dailyOrder, setDailyOrder] = usePersistentOrder<DailyId>(dailyKey, availableDaily);
  const [learningOrder, setLearningOrder] = usePersistentOrder<LearningId>(learningKey, availableLearning);

  function addEnabled<T extends string>(key: string | undefined, id: T) {
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      const current: T[] = raw ? (JSON.parse(raw) as T[]) : [];
      const next = Array.from(new Set([...current, id]));
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function addPrimary(id: PrimaryId) {
    if (!primaryOrder.includes(id)) setPrimaryOrder([...primaryOrder, id]);
    addEnabled(enabledPrimaryKey, id);
  }
  function addDaily(id: DailyId) {
    if (!dailyOrder.includes(id)) setDailyOrder([...dailyOrder, id]);
    addEnabled(enabledDailyKey, id);
  }
  function addLearning(id: LearningId) {
    if (!learningOrder.includes(id)) setLearningOrder([...learningOrder, id]);
    addEnabled(enabledLearningKey, id);
  }

  return {
    primaryOrder,
    setPrimaryOrder,
    dailyOrder,
    setDailyOrder,
    learningOrder,
    setLearningOrder,
    addPrimary,
    addDaily,
    addLearning,
  };
}
