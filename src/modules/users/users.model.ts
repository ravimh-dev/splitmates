import { queryWithClient, query } from "../../db";
import { PoolClient } from "pg";

export const findUserById = async (id: string) => {
  const q = `SELECT id, name, email, avatar_url, created_at, updated_at FROM users WHERE id = $1 AND is_deleted = false`;
  const res = await query(q, [id]);
  return res.rows[0];
};

export const updateUser = async (
  client: PoolClient,
  id: string,
  changes: any,
) => {
  const fields = Object.keys(changes);
  const values = Object.values(changes);
  const set = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const q = `UPDATE users SET ${set}, updated_at = now() WHERE id = $${fields.length + 1} RETURNING id, name, email, avatar_url, created_at, updated_at`;
  const res = await queryWithClient(client, q, [...values, id]);
  return res.rows[0];
};
