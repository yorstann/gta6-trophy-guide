// stages.js — the platinum roadmap: seven stages in the order the guide recommends
// playing them, built from the official trophy descriptions. Each trophy in
// data/trophies.json carries the number of the stage it belongs to.

export const STAGE_INFO = [
  {
    n: 1,
    title: 'Story first',
    blurb:
      'Play the chapters and missions in order — Gone Fishing through Operation Savage Glory — and enjoy Leonida. Before any big story choice, keep a backup save: Actions Speak Louder is choice-based.',
  },
  {
    n: 2,
    title: 'Strangers & strands',
    blurb:
      'Finish every strand finale — Andy, Kenton, Billy, Randy and Tyrone — and reach 8 completed strands BEFORE starting the final mission. The endgame locks the strands out, which is what makes them missable.',
  },
  {
    n: 3,
    title: 'Activities sweep',
    blurb:
      'Gold all 42 Shooting Range challenges, complete 250 stunts and 50 challenges, win 20 races and a drone race at every location, beat Cal at fishing, finish an arcade game, meditate at every spot, hunt for Bret — and try every activity type once.',
  },
  {
    n: 4,
    title: 'Collectibles & exploration',
    blurb:
      'Complete 3 collectible card sets, WAiNK It at 100 locations, discover 100 vehicles, explore every corner of Leonida and register 10 vehicles on the Scooter Bros app.',
  },
  {
    n: 5,
    title: 'Crime & money',
    blurb:
      'Rob 5 bank vaults, an armored truck and a jewelry store without being seen, hit one illegal operation belonging to each gang, launder $250,000 of Marked Bills, spend $100,000 across the shops and buy every garage property.',
  },
  {
    n: 6,
    title: 'Partner & one-offs',
    blurb:
      'The partner trophies — escaping the heat together and the back-to-back shop robberies — then the one-off moments: five takedowns in one Combat Focus, the unscheduled VCIA departure, the Rhino, the Ocean Beach cocktail, the showroom smash, bowling and whatever the hell just happened out there.',
  },
  {
    n: 7,
    title: '100% & platinum',
    blurb:
      'Push the in-game completion checklist to 100% for A Long Road (gold). The moment all 54 other trophies are earned, Vice Got a Price! — the platinum — is awarded automatically.',
  },
];

export function stageInfo(n) {
  return STAGE_INFO.find((s) => s.n === n) ?? STAGE_INFO[0];
}
