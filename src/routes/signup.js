
const signupLog = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { username, email } = req.body;
    if (!username || !email) return res.status(400).json({ error: "Missing required fields" });
    signupLog.push({
      username,
      email,
      timestamp: Date.now(),
    });
    return res.status(200).json({ success: true });
  }
  if (req.method === "GET") {
    const { username } = req.query;
    const history = signupLog.filter((entry) => entry.username === username);
    return res.status(200).json({ reserved: history.length > 0, history });
  }
  res.status(405).json({ error: "Method not allowed" });
}
