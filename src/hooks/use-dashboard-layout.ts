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

  // Ensure defaults are arrays
  const safePrimaryDefaults = Array.isArray(defaults.primary) ? defaults.primary : [];
  const safeDailyDefaults = Array.isArray(defaults.daily) ? defaults.daily : [];
  const safeLearningDefaults = Array.isArray(defaults.learning) ? defaults.learning : [];

  // Use a single update counter to force re-renders when needed
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  // Helper to read from localStorage
  const readFromStorage = React.useCallback(<T extends string>(key: string | undefined): T[] => {
    if (!key) return [] as T[];
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : ([] as T[]);
    } catch {
      return [] as T[];
    }
  }, []);

  const enabledPrimary = readFromStorage<PrimaryId>(enabledPrimaryKey);
  const enabledDaily = readFromStorage<DailyId>(enabledDailyKey);
  const enabledLearning = readFromStorage<LearningId>(enabledLearningKey);

  const removedPrimaryKey = userId ? `dashboard:removed:primary:${userId}` : undefined;
  const removedDailyKey = userId ? `dashboard:removed:daily:${userId}` : undefined;
  const removedLearningKey = userId ? `dashboard:removed:learning:${userId}` : undefined;

  const removedPrimary = readFromStorage<PrimaryId>(removedPrimaryKey);
  const removedDaily = readFromStorage<DailyId>(removedDailyKey);
  const removedLearning = readFromStorage<LearningId>(removedLearningKey);

  const availablePrimary = React.useMemo(() => {
    const base = Array.from(new Set([...safePrimaryDefaults, ...enabledPrimary]));
    return base.filter((id) => !(removedPrimary || []).includes(id));
  }, [safePrimaryDefaults, enabledPrimary, removedPrimary]);
  const availableDaily = React.useMemo(() => {
    const base = Array.from(new Set([...safeDailyDefaults, ...enabledDaily]));
    return base.filter((id) => !(removedDaily || []).includes(id));
  }, [safeDailyDefaults, enabledDaily, removedDaily]);
  const availableLearning = React.useMemo(() => {
    const base = Array.from(new Set([...safeLearningDefaults, ...enabledLearning]));
    return base.filter((id) => !(removedLearning || []).includes(id));
  }, [safeLearningDefaults, enabledLearning, removedLearning]);

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
      forceUpdate(); // Trigger re-render
    } catch {
      // ignore
    }
  }

  function removeWidget<T extends string>(
    removedKey: string | undefined,
    orderKey: string | undefined,
    id: T,
    setOrder: (order: T[]) => void,
    order: T[]
  ) {
    // Add to removed list
    if (removedKey) {
      try {
        const raw = localStorage.getItem(removedKey);
        const current: T[] = raw ? (JSON.parse(raw) as T[]) : [];
        const next = Array.from(new Set([...current, id]));
        localStorage.setItem(removedKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    
    // Update order to remove the widget
    const updatedOrder = order.filter((item) => item !== id);
    setOrder(updatedOrder);
    
    // Also update localStorage order to persist the removal immediately
    if (orderKey) {
      try {
        localStorage.setItem(orderKey, JSON.stringify(updatedOrder));
      } catch {
        // ignore
      }
    }
    
    forceUpdate(); // Trigger re-render
  }

  function addPrimary(id: PrimaryId) {
    if (!primaryOrder.includes(id)) setPrimaryOrder([...primaryOrder, id]);
    addEnabled(enabledPrimaryKey, id);
    // Remove from removed list if it was there
    if (removedPrimaryKey) {
      try {
        const raw = localStorage.getItem(removedPrimaryKey);
        const current: PrimaryId[] = raw ? (JSON.parse(raw) as PrimaryId[]) : [];
        const next = current.filter(item => item !== id);
        localStorage.setItem(removedPrimaryKey, JSON.stringify(next));
        forceUpdate();
      } catch {
        // ignore
      }
    }
  }
  function addDaily(id: DailyId) {
    if (!dailyOrder.includes(id)) setDailyOrder([...dailyOrder, id]);
    addEnabled(enabledDailyKey, id);
    // Remove from removed list if it was there
    if (removedDailyKey) {
      try {
        const raw = localStorage.getItem(removedDailyKey);
        const current: DailyId[] = raw ? (JSON.parse(raw) as DailyId[]) : [];
        const next = current.filter(item => item !== id);
        localStorage.setItem(removedDailyKey, JSON.stringify(next));
        forceUpdate();
      } catch {
        // ignore
      }
    }
  }
  function addLearning(id: LearningId) {
    if (!learningOrder.includes(id)) setLearningOrder([...learningOrder, id]);
    addEnabled(enabledLearningKey, id);
    // Remove from removed list if it was there
    if (removedLearningKey) {
      try {
        const raw = localStorage.getItem(removedLearningKey);
        const current: LearningId[] = raw ? (JSON.parse(raw) as LearningId[]) : [];
        const next = current.filter(item => item !== id);
        localStorage.setItem(removedLearningKey, JSON.stringify(next));
        forceUpdate();
      } catch {
        // ignore
      }
    }
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
    removePrimary: (id: PrimaryId) => {
      removeWidget(removedPrimaryKey, primaryKey, id, setPrimaryOrder, primaryOrder);
    },
    removeDaily: (id: DailyId) => {
      removeWidget(removedDailyKey, dailyKey, id, setDailyOrder, dailyOrder);
    },
    removeLearning: (id: LearningId) => {
      removeWidget(removedLearningKey, learningKey, id, setLearningOrder, learningOrder);
    },
  };
}
