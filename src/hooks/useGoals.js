import { useState, useCallback } from 'react';

const GOALS_KEY = 'scrollers_goals';

function localLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function localSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

export function useGoals() {
  const [goals, setGoals] = useState(() => localLoad(GOALS_KEY, {}));

  const setGoal = useCallback((yearMonth, amount) => {
    setGoals((prev) => {
      const next = { ...prev, [yearMonth]: amount };
      localSave(GOALS_KEY, next);
      return next;
    });
  }, []);

  return { goals, setGoal };
}
