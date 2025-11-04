import pool from "../config/db.js";
import { apiError, apiSuccess } from "../utils/response.js";

export const createPayment = async (req, res, next) => {
  const { service_code } = req.body || {};
  if (!service_code) {
    return apiError(res, 400, 102, "Service ataus Layanan tidak ditemukan");
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Validate service
    const { rows: svcRows } = await client.query(
      `SELECT service_code, service_name, service_icon, service_tariff::numeric AS service_tariff
       FROM services WHERE service_code = $1`,
      [service_code]
    );
    if (svcRows.length === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 400, 102, "Service atau Layanan tidak ditemukan");
    }
    const svc = svcRows[0];

    // Lock user balance
    const { rows: userRows } = await client.query(
      `SELECT id, balance::numeric AS balance FROM users WHERE id = $1 FOR UPDATE`,
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
    const balance = Number(userRows[0].balance);

    if (balance < Number(svc.service_tariff)) {
      await client.query("ROLLBACK");
      return apiError(res, 400, 102, "Saldo tidak cukup");
    }

    const newBalance = balance - Number(svc.service_tariff);

    const invoice = await generateInvoice(client);
    const now = new Date();

    // Insert transaction
    await client.query(
      `INSERT INTO transactions (invoice_number, user_id, transaction_type, service_code, description, total_amount, created_on)
       VALUES ($1, $2, 'PAYMENT', $3, $4, $5, $6)`,
      [
        invoice,
        req.user.id,
        svc.service_code,
        svc.service_name,
        svc.service_tariff,
        now,
      ]
    );

    // Update balance
    await client.query(`UPDATE users SET balance = $1 WHERE id = $2`, [
      newBalance,
      req.user.id,
    ]);

    await client.query("COMMIT");

    return apiSuccess(res, "Transaksi berhasil", {
      invoice_number: invoice,
      service_code: svc.service_code,
      service_name: svc.service_name,
      transaction_type: "PAYMENT",
      total_amount: Number(svc.service_tariff),
      created_on: now.toISOString(),
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    return next(err);
  } finally {
    if (client) client.release();
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const offset = parseInt(req.query.offset || "0", 10);
    const limit = parseInt(req.query.limit || "10", 10);

    const { rows } = await pool.query(
      `SELECT invoice_number, transaction_type, description, total_amount::numeric AS total_amount, created_on
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_on DESC, id DESC
       OFFSET $2 LIMIT $3`,
      [req.user.id, offset, limit]
    );

    return apiSuccess(res, "Get History Berhasil", {
      offset,
      limit,
      records: rows.map((r) => ({
        invoice_number: r.invoice_number,
        transaction_type: r.transaction_type,
        description: r.description,
        total_amount: Number(r.total_amount),
        created_on:
          r.created_on instanceof Date
            ? r.created_on.toISOString()
            : r.created_on,
      })),
    });
  } catch (err) {
    return next(err);
  }
};

async function generateInvoice(client) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `INV${d}${m}${y}`; // INVDDMMYYYY to match sample style
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS cnt FROM transactions WHERE invoice_number LIKE $1`,
    [`${prefix}-%`]
  );
  const seq = String((rows[0]?.cnt || 0) + 1).padStart(3, "0");
  return `${prefix}-${seq}`;
}
