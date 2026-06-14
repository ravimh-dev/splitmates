import { query, queryWithClient } from "../../db";
import { PoolClient } from "pg";
import { UserRow } from "./auth.types";

export const findUserByEmail = async (
  email: string,
): Promise<UserRow | undefined> => {
  const q = `SELECT * FROM users WHERE email = $1 AND is_deleted = false`;
  const res = await query<UserRow>(q, [email]);
  return res.rows[0];
};

export const createUser = async (
  client: PoolClient,
  name: string,
  email: string,
  passwordHash: string,
) => {
  const q = `INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, now(), now()) RETURNING *`;
  const res = await queryWithClient<UserRow>(client, q, [
    name,
    email,
    passwordHash,
  ]);
  console.log("res.rows[0]: ", res.rows[0]);
  return res.rows[0];
};
