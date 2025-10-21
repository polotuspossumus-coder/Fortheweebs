// ritual-check.js — Tier Access Validator

const fs = require("fs");
const accessSchema = JSON.parse(fs.readFileSync("./feature-access.json"));
const userTier = process.env.USER_TIER || "free";
const unlocked = process.env.UNLOCKED === "true";

function getAccess(tier, unlocked) {
  const config = accessSchema.tiers[tier];
  if (!config) return [];

  if (tier === "standard" && unlocked) {
    return config.unlockedAccess;
  }

  return config.access;
}

const access = getAccess(userTier, unlocked);
const profit = accessSchema.tiers[userTier]?.profit || 0;
const moderation = accessSchema.tiers[userTier]?.moderation || "unknown";

console.log(`🔍 Validating access for ${userTier} (Unlocked: ${unlocked})`);
console.log("✅ Feature Access:", access);
console.log(`💰 Profit Retention: ${profit}%`);
console.log(`🛡️ Moderation Level: ${moderation}`);

if (access.length === 0) {
  console.warn("❌ No feature access. Upgrade required.");
}
