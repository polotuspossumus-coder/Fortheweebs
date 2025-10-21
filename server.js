import express from "express";
const app = express();

app.get("/", (_, res) => {
  res.send("🎭 Fortheweebs is live.");
});

app.listen(3000, () => {
  console.log("Fortheweebs running on port 3000");
});
