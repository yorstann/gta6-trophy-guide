// app.js — Leonida Legend's entry point: loads the trophy data, wires the
// toolbar and filters, and routes between the checklist, the roadmap, the
// missables view and each trophy's guide page. Hash routes:
//   #/  and  #/trophies?shield=on&filter=missable   the checklist
//   #/roadmap   #/missables   #/trophy/<id>

import { createStore } from './store.js';
import { createFilters, CHIP_KINDS } from './filters.js';
import { renderHeader, renderNextUp, renderList } from './render.js';
import { renderDetail } from './detail.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { exportProgress, importProgress } from './io.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const store = createStore(trophies);
const filters = createFilters();

const refs = {
  pct: document.getElementById('progress-pct'),
  text: document.getElementById('progress-text'),
  fill: document.getElementById('progress-fill'),
  grades: document.getElementById('grade-counts'),
  missableBadge: document.getElementById('missable-count'),
  shield: document.getElementById('shield'),
  chips: document.getElementById('chips'),
  gradeSelect: document.getElementById('grade-select'),
  search: document.getElementById('search'),
  nextUp: document.getElementById('next-up'),
  list: document.getElementById('list'),
  onlineEmpty: document.getElementById('online-empty'),
  noneEmpty: document.getElementById('none-empty'),
  views: {
    list: document.getElementById('view-list'),
    roadmap: document.getElementById('view-roadmap'),
    missables: document.getElementById('view-missables'),
    detail: document.getElementById('view-detail'),
  },
};

function parseHash() {
  const raw = (location.hash || '#/').slice(1);
  const [path, query] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(query ?? '') };
}

// The current route, kept so progress changes can repaint the same view.
let current = { name: 'list', trophyId: null };

function paint() {
  renderHeader(refs, trophies, store);
  refs.shield.checked = store.shield;
  for (const chip of refs.chips.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.chip === filters.chip);
  }
  refs.gradeSelect.value = filters.grade;

  for (const [name, section] of Object.entries(refs.views)) {
    section.hidden = name !== current.name;
  }
  for (const tab of document.querySelectorAll('[data-nav]')) {
    tab.classList.toggle('active', tab.dataset.nav === current.name);
  }

  if (current.name === 'list') {
    renderNextUp(refs.nextUp, trophies, store);
    const visible = renderList(refs.list, trophies, store, filters);
    refs.onlineEmpty.hidden = filters.chip !== 'online';
    refs.noneEmpty.hidden = filters.chip === 'online' || visible > 0;
  } else if (current.name === 'roadmap') {
    renderRoadmap(refs.views.roadmap, trophies, store);
  } else if (current.name === 'missables') {
    renderMissables(refs.views.missables, trophies, store);
  } else if (current.name === 'detail') {
    const trophy = trophies.find((t) => t.id === current.trophyId);
    if (trophy) renderDetail(refs.views.detail, trophy, trophies, store);
  }
}

function route() {
  const { path, params } = parseHash();
  // Deep-linkable state for screenshots and sharing: ?shield=on, ?filter=<chip>.
  if (params.get('shield') === 'on' && !store.shield) store.setShield(true);
  if (params.get('shield') === 'off' && store.shield) store.setShield(false);
  const chip = params.get('filter');
  if (chip && CHIP_KINDS.includes(chip)) filters.chip = chip;

  if (path === '/roadmap') current = { name: 'roadmap', trophyId: null };
  else if (path === '/missables') current = { name: 'missables', trophyId: null };
  else if (path.startsWith('/trophy/')) current = { name: 'detail', trophyId: Number(path.slice('/trophy/'.length)) };
  else current = { name: 'list', trophyId: null };

  paint();
  if (current.name !== 'list') window.scrollTo(0, 0);
}

// --- toolbar wiring -------------------------------------------------------
refs.shield.addEventListener('change', () => store.setShield(refs.shield.checked));
document.getElementById('export-btn').addEventListener('click', () => exportProgress(store));
document.getElementById('reset-btn').addEventListener('click', () => {
  if (window.confirm('Reset all trophy progress in this browser?')) store.reset();
});
document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    await importProgress(store, file);
  } catch {
    window.alert('That file is not a Leonida Legend progress export.');
  }
});

// --- filter wiring --------------------------------------------------------
refs.chips.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  filters.chip = chip.dataset.chip;
  paint();
});
refs.gradeSelect.addEventListener('change', () => {
  filters.grade = refs.gradeSelect.value;
  paint();
});
refs.search.addEventListener('input', () => {
  filters.query = refs.search.value;
  paint();
});

store.subscribe(paint);
window.addEventListener('hashchange', route);
route();
