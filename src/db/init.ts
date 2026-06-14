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
  const filePath = path.join(__dirname, "../../sql/init.sql");
  if (!fs.existsSync(filePath)) {
    console.error(`SQL file not found at: ${filePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(filePath, "utf-8");
  console.log("⏳ Initializing database schema...");
  const pool = new Pool({ connectionString });
  try {
    // Simple existence check: if core table `users` exists, assume schema is present
    const check = await pool.query("SELECT to_regclass('public.users') as r");
    if (check.rows && check.rows[0] && check.rows[0].r) {
      console.log(
        "ℹ️  `users` table already exists — skipping schema initialization.",
      );
      await pool.end();
      return;
    }

    await pool.query(sqlContent);
    console.log("✅ Database schema initialized successfully!");
  } catch (err: any) {
    console.error("❌ Error initializing database schema:");
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
