import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/sync-artifact", (req, res) => {
  const { origin, artifact } = req.body;
  console.log(`🔗 Artifact sync from ${origin}:`, artifact);
  res.send({ status: "synced", timestamp: Date.now() });
});

app.post("/message", (req, res) => {
  const { from, to, payload } = req.body;
  console.log(`📨 Message from ${from} to ${to}:`, payload);
  res.send({ status: "delivered", timestamp: Date.now() });
});

app.listen(4000, () => {
  console.log("🧬 Shared API Bridge running on port 4000");
});