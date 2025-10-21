// graveyard-transfer.js — Sovereign Ban Protocol

const fs = require("fs");
const ledgerPath = "./ledger.json";
let ledger = [];

if (fs.existsSync(ledgerPath)) {
  ledger = JSON.parse(fs.readFileSync(ledgerPath));
}

function banCreator(creatorId, reason) {
  const entry = {
    timestamp: new Date().toISOString(),
    action: "ban",
    creatorId,
    reason,
    monetized: true,
    transferredTo: "Fortheweebs",
    initiatedBy: "Jacob"
  };

  ledger.push(entry);
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  console.log(`🪦 Creator ${creatorId} banned and content transferred.`);
}

// Example usage:
banCreator("creator_042", "violation of sealed boundaries");
