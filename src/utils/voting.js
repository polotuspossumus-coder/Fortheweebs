export const getTierPrice = (tier) => {
  const prices = {
    mythic: 200,
    standard: 200,
    legacy: 100,
    supporter: 50,
    general: 15,
  };
  return prices[tier] || 0;
};

export const getVoteWeight = (role) => {
  const weights = {
    mythic: 3,
    standard: 2,
    legacy: 1,
    supporter: 1,
    general: 1,
  };
  return weights[role] || 0;
};

export const tallyVotes = (votes) => {
  const result = { yes: 0, no: 0 };
  votes.forEach(v => {
    if (v.vote === 'yes') result.yes += v.weight;
    else if (v.vote === 'no') result.no += v.weight;
  });
  return result;
};
