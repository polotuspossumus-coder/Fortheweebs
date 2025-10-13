import express from "express";

const signupLog = [];
const router = express.Router();

// POST /api/signup
router.post("/api/signup", (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ error: "Missing required fields" });
  // Reserve spot and log signup
  signupLog.push({
    username,
    email,
    timestamp: Date.now(),
  });
  res.json({ success: true });
});

// GET /api/signup/:username
router.get("/api/signup/:username", (req, res) => {
  const { username } = req.params;
  const history = signupLog.filter((entry) => entry.username === username);
  res.json({ reserved: history.length > 0, history });
});

export default router;
