// triggerOcoya.js — Campaign Trigger Script

import axios from "axios";

console.log("📣 Triggering Ocoya PR automation...");

const payload = {
  campaign: "Fortheweebs Ritual Drop",
  tags: ["mythic", "founder", "unlock"],
  schedule: "auto",
  ledgerSync: true
};

axios.post("https://api.ocoya.com/trigger", payload)
  .then(res => console.log("✅ Ocoya triggered:", res.data))
  .catch(err => console.error("❌ Ocoya trigger failed:", err.message));
