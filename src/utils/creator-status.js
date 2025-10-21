// creator-status.js — Determine Creator Status

function getCreatorStatus({ tier, unlocked, banned }) {
  const status = {
    tier,
    unlocked,
    banned,
    access: [],
    profit: 0
  };

  if (banned) {
    status.access = ["none"];
    status.profit = 0;
    return status;
  }

  switch (tier) {
    case "free":
      status.access = [];
      status.profit = 30;
      break;
    case "general":
      status.access = ["basicPublishing"];
      status.profit = 50;
      break;
    case "supporter":
      status.access = ["limitedFeatures"];
      status.profit = 85;
      break;
    case "legacy":
      status.access = ["allExceptCGI", "futureRituals"];
      status.profit = 95;
      break;
    case "standard":
      status.access = unlocked
        ? ["allFeatures", "CGI", "futureRituals"]
        : ["onboarding", "founderStatus"];
      status.profit = 100;
      break;
    case "mythic":
      status.access = ["allFeatures", "CGI", "futureRituals"];
      status.profit = 100;
      break;
  }

  return status;
}

export { getCreatorStatus };
