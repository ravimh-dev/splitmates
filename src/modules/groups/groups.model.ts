import { queryWithClient, query } from "../../db";
import { PoolClient } from "pg";

export const generateJoinCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const isJoinCodeUnique = async (code: string) => {
  const q = `SELECT id FROM groups WHERE join_code = $1`;
  const res = await query(q, [code]);
  return (res.rowCount ?? 0) === 0;
};

export const createGroup = async (
  client: PoolClient,
  name: string,
  createdBy: string,
  joinCode: string,
) => {
  const q = `INSERT INTO groups (id, name, created_by, join_code, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, now(), now()) RETURNING *`;
  const res = await queryWithClient(client, q, [name, createdBy, joinCode]);
  return res.rows[0];
};

export const addGroupMember = async (
  client: PoolClient,
  groupId: string,
  userId: string,
  role: string,
) => {
  const q = `INSERT INTO group_members (id, group_id, user_id, role, status, joined_at) VALUES (gen_random_uuid(), $1, $2, $3, 'ACTIVE', now()) RETURNING *`;
  const res = await queryWithClient(client, q, [groupId, userId, role]);
  return res.rows[0];
};

export const getUserGroups = async (userId: string) => {
  const q = `
    SELECT g.*, 
      (SELECT COUNT(*)::int FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.status = 'ACTIVE') as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = $1 AND gm.status = 'ACTIVE'
    ORDER BY g.created_at DESC
  `;
  const res = await query(q, [userId]);
  return res.rows;
};

export const findGroupById = async (groupId: string) => {
  const q = `SELECT * FROM groups WHERE id = $1`;
  const res = await query(q, [groupId]);
  return (res.rowCount ?? 0) > 0 ? res.rows[0] : null;
};

