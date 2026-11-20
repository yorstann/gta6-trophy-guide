// store.js — the tracker's memory: which trophies are earned, the running total on
// every counted trophy, and the spoiler-shield setting. Everything is persisted to
// localStorage; every change notifies subscribers so the views can re-render.

const STORAGE_KEY = 'leonida-legend-progress-v1';

function blankProgress() {
  return { earned: [], counts: {}, shield: false };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankProgress();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      shield: Boolean(parsed.shield),
    };
  } catch {
    return blankProgress();
  }
}

export function createStore(trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  let state = loadProgress();
  const listeners = new Set();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function emit() {
    persist();
    for (const fn of listeners) fn();
  }

  const store = {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    isEarned(id) {
      return state.earned.includes(id);
    },

    setEarned(id, on) {
      const has = state.earned.includes(id);
      if (on && !has) state.earned = [...state.earned, id];
      if (!on && has) state.earned = state.earned.filter((n) => n !== id);
      if (on !== has) emit();
    },

    getCount(id) {
      return state.counts[id] ?? 0;
    },

    // Setting a counter clamps it to the trophy's target; reaching the target
    // ticks the trophy off (the player can always untick it by hand afterwards).
    setCount(id, value) {
      const trophy = byId.get(id);
      if (!trophy || !trophy.count) return;
      const next = Math.max(0, Math.min(trophy.count, Math.floor(Number(value) || 0)));
      if (next === store.getCount(id) && !(next >= trophy.count && !store.isEarned(id))) return;
      state.counts = { ...state.counts, [id]: next };
      if (next >= trophy.count && !state.earned.includes(id)) state.earned = [...state.earned, id];
      emit();
    },

    get shield() {
      return state.shield;
    },
    setShield(on) {
      if (state.shield === Boolean(on)) return;
      state.shield = Boolean(on);
      emit();
    },

    stats() {
      const perGrade = {};
      for (const t of trophies) {
        perGrade[t.grade] ??= { earned: 0, total: 0 };
        perGrade[t.grade].total += 1;
        if (state.earned.includes(t.id)) perGrade[t.grade].earned += 1;
      }
      const earned = state.earned.filter((id) => byId.has(id)).length;
      return { earned, total: trophies.length, pct: Math.round((earned / trophies.length) * 100), perGrade };
    },

    exportData() {
      return { app: 'leonida-legend', version: 1, earned: [...state.earned], counts: { ...state.counts }, shield: state.shield };
    },

    importData(data) {
      if (!data || !Array.isArray(data.earned)) throw new Error('not a Leonida Legend progress file');
      state = {
        earned: data.earned.filter((id) => byId.has(id)),
        counts: Object.fromEntries(
          Object.entries(data.counts ?? {}).filter(([id]) => byId.has(Number(id))),
        ),
        shield: Boolean(data.shield),
      };
      emit();
    },

    reset() {
      state = blankProgress();
      emit();
    },
  };
  return store;
}
