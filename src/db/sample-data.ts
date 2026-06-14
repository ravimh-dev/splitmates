import "dotenv/config";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env variable is not set!");
    process.exit(1);
  }

  // Load the SQL file
  const filePath = path.join(__dirname, "../../sql/sample-data.sql");
  if (!fs.existsSync(filePath)) {
    console.error(`SQL file not found at: ${filePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(filePath, "utf-8");
  console.log("⏳ Seeding database with sample data...");

  const pool = new Pool({ connectionString });
  try {
    // Ensure `users` table exists before seeding
    const tbl = await pool.query("SELECT to_regclass('public.users') as r");
    if (!(tbl.rows && tbl.rows[0] && tbl.rows[0].r)) {
      console.error(
        "❗ `users` table not found. Run schema initialization first (npm run db:init).",
      );
      await pool.end();
      process.exit(1);
    }

    // Simple idempotency check: skip seeding if example user exists
    const exists = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE email=$1) as exists",
      ["alice@example.com"],
    );
    if (exists.rows && exists.rows[0] && exists.rows[0].exists) {
      console.log(
        "ℹ️  Sample data already present (alice@example.com) — skipping seeding.",
      );
      await pool.end();
      return;
    }

    await pool.query(sqlContent);
    console.log("✅ Database seeded with sample data successfully!");
  } catch (err: any) {
    console.error("❌ Error seeding database:");
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
