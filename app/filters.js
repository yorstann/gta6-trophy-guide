// filters.js — the checklist's filter state and the one place that decides
// whether a trophy is visible under it: kind chips, the grade select and search.

export const CHIP_KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

export function createFilters() {
  return { chip: 'all', grade: 'all', query: '' };
}

export function trophyMatches(trophy, filters) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;

  if (filters.chip === 'story' && trophy.kind !== 'story') return false;
  if (filters.chip === 'missable' && !trophy.missable) return false;
  if (filters.chip === 'collectibles' && trophy.kind !== 'collectibles') return false;
  if (filters.chip === 'activities' && trophy.kind !== 'activities') return false;
  // 'online' matches nothing on purpose: the list view shows an honest empty
  // state explaining that the PS5 list has no online trophies.
  if (filters.chip === 'online') return false;

  const q = filters.query.trim().toLowerCase();
  if (q) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind} ${trophy.grade}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}
