import express from "express";
import cors from "cors";
import helmet from "helmet";
import accessOverride from "../api/_middleware.js";
const app = express();
// CORS for all origins
app.use(cors());
// Security headers
app.use(helmet());
// Global Polotus access override
app.use(accessOverride);
// Force HTTPS
app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});
// Healthcheck
app.get("/health", (_, res) => res.send("✅ Vanguard API is live"));
export default app;
//# sourceMappingURL=api.js.map