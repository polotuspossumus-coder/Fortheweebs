// ban-dashboard.js — Jacob's Ban Control Panel

const fs = require("fs");
const ledgerPath = "./graveyard-ledger.json";
let ledger = [];

if (fs.existsSync(ledgerPath)) {
  ledger = JSON.parse(fs.readFileSync(ledgerPath));
}

function banCreator({ id, name, reason }) {
  const entry = {
    timestamp: new Date().toISOString(),
    creatorId: id,
    creatorName: name,
    reason,
    monetized: true,
    transferredTo: "Fortheweebs",
    initiatedBy: "Jacob"
  };

  ledger.push(entry);
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  console.log(`🪦 ${name} banned. Content transferred to graveyard.`);
}

// Example usage:
banCreator({
  id: "creator_042",
  name: "ShadowWeeb",
  reason: "AI flagged sealed content violation"
});
