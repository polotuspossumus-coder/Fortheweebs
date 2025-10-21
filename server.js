import appInsights from "applicationinsights";
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING).start();
if (appInsights.defaultClient) {
  appInsights.defaultClient.trackEvent({ name: "Vanguard Remix Engine Started" });
}
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vanguard Remix API",
      version: "1.0.0"
    }
  },
  apis: ["./**/*.js"]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// Application Insights integration
import appInsights from "applicationinsights";
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING).start();
if (appInsights.defaultClient) {
  appInsights.defaultClient.trackEvent({ name: "Vanguard Remix Engine Started" });
}

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import signupRouter from "./src/routes/signup.js";
import tosRouter from "./src/routes/tos.js";
import remixGraphRouter from "./src/remixGraphRouter.js";
import crownRemixRouter from "./src/crownRemixRouter.js";
import graveyardRouter from "./src/graveyardRouter.js";
import mediaIngestRouter from "./src/mediaIngestRouter.js";
import exportLedgerRouter from "./src/exportLedgerRouter.js";
import searchRouter from "./src/searchRouter.js";
import appealRouter from "./src/appealRouter.js";
import { connectToDB } from "./src/connectToDB.js";
import authRouter from "./src/authRouter.js";
import mediaServeRouter from "./src/mediaServeRouter.js";
// TODO: Implement and import governanceExportRouter, appealRouter, searchRouter

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, ".vscode")));



app.use(signupRouter);
app.use(tosRouter);
app.use(remixGraphRouter);
app.use(crownRemixRouter);
app.use(graveyardRouter);
app.use(mediaIngestRouter);
app.use(exportLedgerRouter);
app.use(searchRouter);
app.use(appealRouter);
app.use(authRouter);
app.use(mediaServeRouter);
// app.use(governanceExportRouter);
// app.use(appealRouter);
// app.use(searchRouter);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, ".vscode", "index.html"));
});



connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log("🧬 Vanguard Remix Engine running on port 3000");
  });
});
