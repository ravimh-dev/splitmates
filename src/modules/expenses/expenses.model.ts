import { PoolClient } from "pg";
import { queryWithClient, query } from "../../db";

export const createExpense = async (
  client: PoolClient,
  fields: {
    group_id: string;
    paid_by: string;
    title?: string;
    description?: string;
    amount: number;
    currency?: string;
    split_type: string;
  },
) => {
  const q = `INSERT INTO expenses (id, group_id, paid_by, title, description, amount, currency, split_type, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING *`;
  const res = await queryWithClient(client, q, [
    fields.group_id,
    fields.paid_by,
    fields.title || null,
    fields.description || null,
    fields.amount,
    fields.currency || "INR",
    fields.split_type,
  ]);
  return res.rows[0];
};

export const addExpenseSplit = async (
  client: PoolClient,
  expenseId: string,
  userId: string,
  amount: number,
  percentage?: number,
  shares?: number,
) => {
  const q = `INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage, shares) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`;
  await queryWithClient(client, q, [
    expenseId,
    userId,
    amount,
    percentage ?? null,
    shares ?? null,
  ]);
};

export const findExpenseById = async (expenseId: string) => {
  const q = `SELECT * FROM expenses WHERE id = $1 AND deleted_at IS NULL`;
  const res = await query(q, [expenseId]);
  return res.rows[0];
};

export const softDeleteExpense = async (
  client: PoolClient,
  expenseId: string,
) => {
  const q = `UPDATE expenses SET deleted_at = now(), updated_at = now() WHERE id = $1 RETURNING *`;
  const res = await queryWithClient(client, q, [expenseId]);
  return res.rows[0];
};
