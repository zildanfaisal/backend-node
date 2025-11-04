import pool from "../config/db.js";
import { apiError, apiSuccess } from "../utils/response.js";
import { getBalanceByUserId } from "../models/userModel.js";

export const getBalance = async (req, res, next) => {
  try {
    const balance = await getBalanceByUserId(req.user.id);
    return apiSuccess(res, "Get Balance Berhasil", {
      balance: Number(balance),
    });
  } catch (err) {
    return next(err);
  }
};

export const topUp = async (req, res, next) => {
  const amount = Number(req.body?.top_up_amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return apiError(
      res,
      400,
      102,
      "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0"
    );
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { rows: userRows } = await client.query(
      "SELECT id, balance FROM users WHERE id = $1 FOR UPDATE",
      [req.user.id]
    );
    if (userRows.length === 0) {
      await client.query("ROLLBACK");
      return apiError(
        res,
        401,
        108,
        "Token tidak tidak valid atau kadaluwarsa"
      );
    }

    const newBalance = Number(userRows[0].balance) + amount;

    // Insert transaction record
    const invoice = await generateInvoice(client);
    await client.query(
      `INSERT INTO transactions (invoice_number, user_id, transaction_type, description, total_amount)
       VALUES ($1, $2, 'TOPUP', $3, $4)`,
      [invoice, req.user.id, "Top Up balance", amount]
    );

    // Update balance
    await client.query("UPDATE users SET balance = $1 WHERE id = $2", [
      newBalance,
      req.user.id,
    ]);

    await client.query("COMMIT");
    return apiSuccess(res, "Top Up Balance berhasil", { balance: newBalance });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    return next(err);
  } finally {
    if (client) client.release();
  }
};

async function generateInvoice(client) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `INV${d}${m}${y}`; // INVDDMMYYYY
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM transactions WHERE invoice_number LIKE $1`,
    [`${prefix}-%`]
  );
  const seq = String((rows[0]?.cnt || 0) + 1).padStart(3, "0");
  return `${prefix}-${seq}`;
}
