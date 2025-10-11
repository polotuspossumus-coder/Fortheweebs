import express from "express";

const acceptanceLog = [];

const router = express.Router();

// POST /api/tos/accept
router.post("/api/tos/accept", (req, res) => {
  const { userId, ipAddress, version } = req.body;
  if (!userId || !ipAddress || !version) return res.status(400).json({ error: "Missing required fields" });
  acceptanceLog.push({
    userId,
    timestamp: Date.now(),
    ipAddress,
    version,
  });
  res.json({ success: true });
});

// GET /api/tos/accepted/:userId
router.get("/api/tos/accepted/:userId", (req, res) => {
  const { userId } = req.params;
  const history = acceptanceLog.filter((entry) => entry.userId === userId);
  res.json({ accepted: history.length > 0, history });
});

export default router;
