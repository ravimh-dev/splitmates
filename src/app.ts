import "dotenv/config";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { Pool } from "pg";

import { errorHandler } from "./shared/errors/errorHandler";

import authRoutes from "./modules/auth/auth.route";
import usersRoutes from "./modules/users/users.route";
import groupsRoutes from "./modules/groups/groups.route";
import expensesRoutes from "./modules/expenses/expenses.route";
import balancesRoutes from "./modules/balances/balances.route";
import settlementsRoutes from "./modules/settlements/settlements.route";
import activitiesRoutes from "./modules/activities/activities.route";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

/* -------------------- PostgreSQL -------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* -------------------- Middlewares -------------------- */
const allowedOrigins = [
  process.env.CLIENT_URL_DEV,
  process.env.CLIENT_URL_PROD,
].filter(Boolean) as string[];

app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : "http://localhost:3002",
  })
);

app.use(json());

/* -------------------- REQUEST LOGGER -------------------- */
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SplitMate API is running 🚀",
    time: new Date().toISOString(),
  });
});

/* -------------------- ROUTES -------------------- */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/groups", groupsRoutes);
app.use("/api/v1/expenses", expensesRoutes);
app.use("/api/v1/balances", balancesRoutes);
app.use("/api/v1/settlements", settlementsRoutes);
app.use("/api/v1/activities", activitiesRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use(errorHandler);

/* -------------------- START SERVER -------------------- */
const startServer = async () => {
  try {
    console.log("⏳ Connecting to PostgreSQL...");

    await pool.query("SELECT 1");

    console.log("✅ PostgreSQL connected successfully");
    console.log("📦 Database ready: splitmates");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server starting...");
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log("🔥 API is LIVE and ready");
    });
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

/* -------------------- GLOBAL ERROR HANDLERS -------------------- */
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

startServer();

export default app;