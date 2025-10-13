
const express = require("express");
const path = require("path");
const signupRouter = require("./src/routes/signup.js").default;
const tosRouter = require("./src/routes/tos.js").default;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "src")));
app.use(express.static(path.join(process.cwd(), ".vscode")));


app.use(signupRouter);
app.use(tosRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), ".vscode", "index.html"));
});


app.listen(PORT, () => {
  console.log(`ForTheWeebs social platform running on port ${PORT}`);
});
