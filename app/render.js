// render.js — shared building blocks for every view: tiny element helpers, the
// CSS medals, the spoiler-shield masking, counter steppers, trophy rows, the
// progress header and the "Next up" panel that wires the roadmap into the list.

import { stageInfo } from './stages.js';
import { trophyMatches } from './filters.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function medalEl(grade, big = false) {
  const medal = el('span', `medal ${grade}${big ? ' big' : ''}`);
  medal.title = `${grade} trophy`;
  return medal;
}

// The spoiler shield: a hidden trophy that is not yet earned shows neither its
// name, its description nor its guide while the shield is on.
export function isMasked(trophy, store) {
  return store.shield && trophy.hidden && !store.isEarned(trophy.id);
}
export function displayName(trophy, store) {
  return isMasked(trophy, store) ? 'Hidden trophy' : trophy.name;
}
export function displayDesc(trophy, store) {
  return isMasked(trophy, store) ? 'Hidden trophy — earn it to reveal' : trophy.description;
}

export function formatCount(n) {
  return n.toLocaleString('en-US');
}

// A − value + stepper for trophies PlayStation counts (42 challenges, $250,000…).
export function stepperEl(trophy, store) {
  const wrap = el('span', 'stepper');
  const minus = el('button', '', '−');
  minus.type = 'button';
  minus.title = 'One less';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(trophy.count);
  input.value = String(store.getCount(trophy.id));
  input.setAttribute('aria-label', `Progress for ${trophy.name}`);
  const plus = el('button', '', '+');
  plus.type = 'button';
  plus.title = 'One more';
  const of = el('span', 'of', `/ ${formatCount(trophy.count)}`);
  minus.addEventListener('click', () => store.setCount(trophy.id, store.getCount(trophy.id) - 1));
  plus.addEventListener('click', () => store.setCount(trophy.id, store.getCount(trophy.id) + 1));
  input.addEventListener('change', () => store.setCount(trophy.id, Number(input.value)));
  wrap.append(minus, input, plus, of);
  return wrap;
}

export function countBarEl(trophy, store) {
  const bar = el('div', 'count-bar');
  const fill = el('div');
  fill.style.width = `${Math.min(100, (store.getCount(trophy.id) / trophy.count) * 100)}%`;
  bar.append(fill);
  return bar;
}

function tagEl(kind, text) {
  return el('span', `tag ${kind}`, text);
}

// One checklist row: checkbox, medal, name + description, tags, grade and — for
// counted trophies — the running total. Clicking the row opens the guide.
export function trophyRowEl(trophy, store) {
  const masked = isMasked(trophy, store);
  const row = el('article', `trophy-row${store.isEarned(trophy.id) ? ' earned' : ''}`);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = store.isEarned(trophy.id);
  box.title = `Mark ${trophy.name} as earned`;
  box.setAttribute('aria-label', box.title);
  box.addEventListener('change', () => store.setEarned(trophy.id, box.checked));

  const main = el('div', 'row-main');
  const nameLine = el('div', 'row-name');
  const name = el('span', masked ? 'masked-name' : '', displayName(trophy, store));
  nameLine.append(name);
  nameLine.append(tagEl('kind', trophy.kind));
  nameLine.append(tagEl('stage', `Stage ${trophy.stage}`));
  if (trophy.missable) nameLine.append(tagEl('missable', 'Missable'));
  if (trophy.hidden) nameLine.append(tagEl('hidden-tag', 'Hidden'));
  const desc = el('div', 'row-desc', displayDesc(trophy, store));
  main.append(nameLine, desc);

  const side = el('div', 'row-side');
  const grade = el('span', 'row-grade');
  grade.append(medalEl(trophy.grade), el('span', '', trophy.grade));
  side.append(grade);
  if (trophy.count) {
    side.append(el('div', 'count-mini', `${formatCount(store.getCount(trophy.id))} / ${formatCount(trophy.count)}`));
    side.append(countBarEl(trophy, store));
  }

  row.append(box, medalEl(trophy.grade), main, side);
  row.addEventListener('click', (event) => {
    if (event.target.closest('input, button, a, select')) return;
    location.hash = `#/trophy/${trophy.id}`;
  });
  return row;
}

// The header: big percentage, earned/total and a pill per grade.
export function renderHeader(refs, trophies, store) {
  const stats = store.stats();
  refs.pct.textContent = `${stats.pct}%`;
  refs.text.textContent = `${stats.earned} of ${stats.total} earned`;
  refs.fill.style.width = `${stats.pct}%`;
  refs.grades.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const g = stats.perGrade[grade];
    if (!g) continue;
    const pill = el('span', 'grade-count');
    pill.append(medalEl(grade), el('span', '', `${grade} ${g.earned}/${g.total}`));
    refs.grades.append(pill);
  }
  const remaining = trophies.filter((t) => t.missable && !store.isEarned(t.id)).length;
  refs.missableBadge.textContent = String(remaining);
  refs.missableBadge.style.display = remaining ? '' : 'none';
}

// "Next up": the next three unearned trophies in roadmap order — stage first,
// then list order — so the tracker always points at the platinum path.
export function renderNextUp(container, trophies, store) {
  container.replaceChildren();
  container.append(el('h2', '', 'Next up — your road to the platinum'));
  const next = trophies
    .filter((t) => !store.isEarned(t.id))
    .sort((a, b) => a.stage - b.stage || a.id - b.id)
    .slice(0, 3);
  if (!next.length) {
    container.append(el('p', 'next-done', 'All 55 earned — you are a Leonida Legend.'));
    return;
  }
  const row = el('div', 'next-up-row');
  for (const t of next) {
    const card = el('a', 'next-card');
    card.href = `#/trophy/${t.id}`;
    const text = el('span', 'nc-text');
    text.append(
      el('span', 'nc-name', displayName(t, store)),
      el('span', 'nc-stage', `Stage ${t.stage} — ${stageInfo(t.stage).title}${t.missable ? ' · MISSABLE' : ''}`),
    );
    card.append(medalEl(t.grade), text);
    row.append(card);
  }
  container.append(row);
}

// The checklist itself. Returns how many trophies are visible.
export function renderList(container, trophies, store, filters) {
  container.replaceChildren();
  let visible = 0;
  for (const trophy of trophies) {
    if (!trophyMatches(trophy, filters)) continue;
    container.append(trophyRowEl(trophy, store));
    visible += 1;
  }
  return visible;
}
