// graveyard-ui.js — Visualize Banned Creators & Monetized Content

const fs = require("fs");
const ledger = JSON.parse(fs.readFileSync("./graveyard-ledger.json"));

function renderGraveyard() {
  console.log("🪦 Fortheweebs Graveyard");
  ledger.forEach(entry => {
    console.log(`- ${entry.creatorName} (ID: ${entry.creatorId})`);
    console.log(`  Reason: ${entry.reason}`);
    console.log(`  Monetized: ${entry.monetized ? "✅" : "❌"}`);
    console.log(`  Transferred To: ${entry.transferredTo}`);
    console.log(`  Banned By: ${entry.initiatedBy}`);
    console.log(`  Time: ${entry.timestamp}`);
    console.log("— — —");
  });
}

renderGraveyard();
