import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const queryWithClient = async <T extends QueryResultRow = any>(
  client: PoolClient,
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
  return client.query<T>(text, params);
};

export const startTransaction = async (): Promise<{ client: PoolClient }> => {
  const client = await pool.connect();
  await client.query("BEGIN");
  return { client };
};

export const commitTransaction = async (client: PoolClient) => {
  try {
    await client.query("COMMIT");
  } finally {
    client.release();
  }
};

export const rollbackTransaction = async (client: PoolClient) => {
  try {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
};

export default pool;
