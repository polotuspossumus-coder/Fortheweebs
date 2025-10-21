// council-log.js — API route for CouncilFeed.jsx

import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const logPath = path.resolve("./council-log.json");
  let log = [];

  if (fs.existsSync(logPath)) {
    log = JSON.parse(fs.readFileSync(logPath));
  }

  res.status(200).json(log);
}
