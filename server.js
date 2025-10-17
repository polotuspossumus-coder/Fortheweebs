
const express = require("express");
const path = require("path");
const signupRouter = require("./src/routes/signup.js").default;
const tosRouter = require("./src/routes/tos.js").default;

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const PORT = process.env.PORT || 3000;

// Set global headers for caching and CORS
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "src")));
app.use(express.static(path.join(process.cwd(), ".vscode")));
// Mount routers (signup, tos)
app.use(signupRouter);
app.use(tosRouter);

// Attempt to mount payments router if available (non-fatal)
try {
  const paymentsRouter = require('./server/payments');
  if (paymentsRouter && typeof paymentsRouter === 'function') {
    app.use(paymentsRouter);
    console.log('Payments router mounted at /api/*');
  }
} catch (err) {
  console.log('Payments router not mounted:', err.message);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), ".vscode", "index.html"));
});


app.listen(PORT, () => {
  console.log(`ForTheWeebs social platform running on port ${PORT}`);
});
