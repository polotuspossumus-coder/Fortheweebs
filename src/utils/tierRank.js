function tierRank(tier) {
  const ranks = { general: 1, supporter: 2, legacy: 3, standard: 4, mythic: 5 };
  return ranks[tier];
}

export { tierRank };
