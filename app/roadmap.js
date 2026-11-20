// roadmap.js — two views built from the same stage data: the Roadmap, which lays
// the 55 trophies out in the order to earn them on the way to the platinum, and
// the Missables view, which gathers every trophy that can be locked out.

import { el, medalEl, trophyRowEl, displayName, displayDesc } from './render.js';
import { STAGE_INFO } from './stages.js';

export function renderRoadmap(container, trophies, store) {
  container.replaceChildren();

  const stats = store.stats();
  const intro = el('section', 'view-intro');
  intro.append(
    el('h2', '', 'Roadmap to the platinum'),
    el('p', '', `Seven stages, in order. The golden rule is stage 2 before the finale: finish the stranger strands before the final mission, because the endgame locks them out. You are at ${stats.earned} of ${stats.total} (${stats.pct}%). When stage 7 completes, the platinum — Vice Got a Price! — is awarded automatically.`),
  );
  container.append(intro);

  for (const stage of STAGE_INFO) {
    const members = trophies.filter((t) => t.stage === stage.n);
    const done = members.filter((t) => store.isEarned(t.id)).length;
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(
      el('span', 'stage-num', String(stage.n)),
      el('h3', '', stage.title),
      el('span', 'stage-progress', `${done} / ${members.length} earned`),
    );
    section.append(head, el('p', 'stage-blurb', stage.blurb));
    for (const trophy of members) section.append(trophyRowEl(trophy, store));
    container.append(section);
  }
}

export function renderMissables(container, trophies, store) {
  container.replaceChildren();

  container.append(
    el('div', 'big-warn', 'Read this before the final mission: every trophy below can be locked out. The six strand trophies close when the endgame begins — finish all strands in roadmap stage 2 — and Actions Speak Louder is choice-based, so keep a manual save before big story choices.'),
  );

  const missables = trophies.filter((t) => t.missable);
  const intro = el('section', 'view-intro');
  intro.append(
    el('h2', '', `Missable trophies — ${missables.length}`),
    el('p', '', `${missables.filter((t) => store.isEarned(t.id)).length} of ${missables.length} already earned. Nothing else on the list can be missed: every other trophy stays available in free roam after the credits.`),
  );
  container.append(intro);

  for (const trophy of missables) {
    const card = el('article', 'missable-card');
    const text = el('div');
    text.append(
      el('div', 'mc-name', displayName(trophy, store)),
      el('div', 'mc-note', trophy.missableNote),
      el('div', 'mc-desc', displayDesc(trophy, store)),
    );
    card.append(medalEl(trophy.grade), text);
    card.addEventListener('click', () => {
      location.hash = `#/trophy/${trophy.id}`;
    });
    container.append(card);
  }
}
