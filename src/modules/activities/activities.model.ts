import { PoolClient, QueryResult } from "pg";
import { queryWithClient, query } from "../../db";
import { ActivityRow } from "./activities.types";

export const createActivity = async (
  client: PoolClient,
  groupId: string,
  actorId: string,
  type: string,
  metadata: any,
) => {
  const q = `INSERT INTO activities (id, group_id, actor_id, type, metadata, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, now()) RETURNING *`;
  const res: QueryResult<ActivityRow> = await queryWithClient(client, q, [
    groupId,
    actorId,
    type,
    metadata ? JSON.stringify(metadata) : null,
  ]);
  return res.rows[0];
};

export const listGroupActivities = async (
  groupId: string,
  options: { limit: number; offset: number; type?: string; actorId?: string }
) => {
  const params: any[] = [groupId, options.limit, options.offset];
  let filterSql = "";
  let paramIdx = 4;
  
  if (options.type) {
    filterSql += ` AND type = $${paramIdx}`;
    params.push(options.type);
    paramIdx++;
  }
  
  if (options.actorId) {
    filterSql += ` AND actor_id = $${paramIdx}`;
    params.push(options.actorId);
    paramIdx++;
  }
  
  const q = `SELECT * FROM activities WHERE group_id = $1 ${filterSql} ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  const res = await query<ActivityRow>(q, params);
  return res.rows;
};

export const countGroupActivities = async (
  groupId: string,
  options: { type?: string; actorId?: string }
) => {
  const params: any[] = [groupId];
  let filterSql = "";
  let paramIdx = 2;
  
  if (options.type) {
    filterSql += ` AND type = $${paramIdx}`;
    params.push(options.type);
    paramIdx++;
  }
  
  if (options.actorId) {
    filterSql += ` AND actor_id = $${paramIdx}`;
    params.push(options.actorId);
    paramIdx++;
  }
  
  const q = `SELECT COUNT(*)::int as count FROM activities WHERE group_id = $1 ${filterSql}`;
  const res = await query<{ count: number }>(q, params);
  return res.rows[0].count;
};
