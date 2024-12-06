import express from "express";
import { routeSummary } from "./Routes/RoutesSummary/routes.summary.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
// app.post('/', (req, res)=>res.cookie)
routeSummary(app);
export { app };
