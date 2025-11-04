import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
