import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

// Support both DATABASE_URL and POSTGRES_URL from Railway, enable SSL in production
const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.PGHOST || "127.0.0.1",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
        database: process.env.PGDATABASE || "backend-node",
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 10,
      }
);

pool.on("connect", () => {
  console.log("Connected to the database");
});

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log("✅ DB connection test succeeded:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("❌ DB connection test failed:", err.message || err);
  }
})();

export default pool;
