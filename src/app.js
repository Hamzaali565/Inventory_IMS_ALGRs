import express from "express";
import { routeSummary } from "./Routes/RoutesSummary/routes.summary.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

routeSummary(app);
export { app };
