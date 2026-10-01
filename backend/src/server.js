import e from "express";
import "dotenv/config";
import connectDb from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = e();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middlewares
app.use(e.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
