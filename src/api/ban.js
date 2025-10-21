import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, name, reason } = req.body;
  const ledgerPath = path.resolve("./graveyard-ledger.json");
  let ledger = [];

  if (fs.existsSync(ledgerPath)) {
    ledger = JSON.parse(fs.readFileSync(ledgerPath));
  }

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
  return res.status(200).json({ success: true, entry });
}
