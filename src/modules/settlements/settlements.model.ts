import { queryWithClient, query } from "../../db";
import { PoolClient } from "pg";

export const createSettlement = async (
  client: PoolClient,
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
) => {
  const q = `INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', now()) RETURNING *`;
  const res = await queryWithClient(client, q, [
    groupId,
    fromUserId,
    toUserId,
    amount,
  ]);
  return res.rows[0];
};

export const markSettlementPaid = async (
  client: PoolClient,
  settlementId: string,
) => {
  const q = `UPDATE settlements SET status = 'COMPLETED', settled_at = now() WHERE id = $1 RETURNING *`;
  const res = await queryWithClient(client, q, [settlementId]);
  return res.rows[0];
};

export const getGroupSettlements = async (groupId: string) => {
  const q = `SELECT * FROM settlements WHERE group_id = $1 ORDER BY created_at DESC`;
  const res = await query(q, [groupId]);
  return res.rows;
};
