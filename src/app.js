import express from "express";
import { routeSummary } from "./Routes/RoutesSummary/routes.summary.js";

const app = express();
app.use(express.json());

routeSummary(app);
export { app };
