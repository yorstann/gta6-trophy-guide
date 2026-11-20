// detail.js — one trophy, full screen: its official name, description and grade,
// the guide in this app's own words with its sources named, the missable warning
// where there is one, and the counter for trophies PlayStation counts.

import { el, medalEl, isMasked, displayName, displayDesc, stepperEl, countBarEl, formatCount } from './render.js';
import { stageInfo } from './stages.js';

function factRow(label, value) {
  const row = el('div', 'fact');
  row.append(el('dt', '', label), el('dd', '', value));
  return row;
}

export function renderDetail(container, trophy, trophies, store) {
  container.replaceChildren();
  const masked = isMasked(trophy, store);
  const earned = store.isEarned(trophy.id);

  const back = el('a', 'back-link', '← Back to the checklist');
  back.href = '#/';
  container.append(back);

  if (trophy.missable && !masked) {
    container.append(el('div', 'warn', `MISSABLE — ${trophy.missableNote} It is flagged again in the Missables view.`));
  }

  const head = el('div', 'detail-head');
  const headText = el('div');
  headText.append(el('h2', masked ? 'masked-name' : '', displayName(trophy, store)), el('p', 'detail-desc', displayDesc(trophy, store)));
  head.append(medalEl(trophy.grade, true), headText);
  container.append(head);

  const grid = el('div', 'detail-grid');

  // Left: the guide itself, with its sources named underneath it.
  const guideCard = el('section', 'detail-card');
  guideCard.append(el('h3', '', 'How to earn it'));
  if (masked) {
    guideCard.append(el('p', '', 'Hidden trophy — earn it to reveal. The spoiler shield is on, so this trophy’s name, description and guide stay masked until you earn it (or turn the shield off).'));
  } else {
    guideCard.append(el('p', '', trophy.guide));
    const sources = el('p', 'sources');
    const strong = el('strong', '', 'Sources: ');
    sources.append(strong, document.createTextNode(trophy.sources.join(' · ')));
    guideCard.append(sources);
  }

  // Right: the facts a hunter needs at a glance, plus the earn toggle.
  const factsCard = el('section', 'detail-card');
  factsCard.append(el('h3', '', 'Trophy facts'));
  const facts = el('dl');
  facts.append(factRow('Grade', trophy.grade));
  facts.append(factRow('Kind', trophy.kind));
  facts.append(factRow('Roadmap', `Stage ${trophy.stage} — ${stageInfo(trophy.stage).title}`));
  facts.append(factRow('Hidden on PlayStation', trophy.hidden ? 'Yes — hidden until earned' : 'No'));
  facts.append(factRow('Missable', trophy.missable ? 'Yes — see the warning' : 'No'));
  factsCard.append(facts);
  if (trophy.count) {
    const countFact = el('div', 'fact');
    countFact.append(el('dt', '', 'Progress'), stepperEl(trophy, store));
    factsCard.append(countFact, countBarEl(trophy, store));
    factsCard.append(el('p', 'sources', `Reaching ${formatCount(trophy.count)} ticks this trophy off automatically; you can always untick it by hand.`));
  }
  const earnBtn = el('button', `earn-btn${earned ? ' earned' : ''}`, earned ? 'Earned ✓ — tap to undo' : 'Mark as earned');
  earnBtn.type = 'button';
  earnBtn.addEventListener('click', () => store.setEarned(trophy.id, !store.isEarned(trophy.id)));
  factsCard.append(earnBtn);

  grid.append(guideCard, factsCard);
  container.append(grid);

  // Previous / next along the official list.
  const nav = el('nav', 'detail-nav');
  const prev = trophies.find((t) => t.id === trophy.id - 1);
  const next = trophies.find((t) => t.id === trophy.id + 1);
  const prevLink = el('a', '', prev ? `← ${displayName(prev, store)}` : '');
  if (prev) prevLink.href = `#/trophy/${prev.id}`;
  const nextLink = el('a', '', next ? `${displayName(next, store)} →` : '');
  if (next) nextLink.href = `#/trophy/${next.id}`;
  nav.append(prevLink, nextLink);
  container.append(nav);
}
