import { query } from "../../db";

export const getGroupBalances = async (groupId: string) => {
  const q = `
    WITH members AS (
      SELECT user_id 
      FROM group_members 
      WHERE group_id = $1 AND status = 'ACTIVE'
    ),
    paid_exp AS (
      SELECT paid_by as user_id, COALESCE(SUM(amount), 0) as amount
      FROM expenses
      WHERE group_id = $1 AND deleted_at IS NULL
      GROUP BY paid_by
    ),
    owed_splits AS (
      SELECT es.user_id, COALESCE(SUM(es.amount), 0) as amount
      FROM expense_splits es
      JOIN expenses e ON e.id = es.expense_id
      WHERE e.group_id = $1 AND e.deleted_at IS NULL
      GROUP BY es.user_id
    ),
    paid_set AS (
      SELECT from_user_id as user_id, COALESCE(SUM(amount), 0) as amount
      FROM settlements
      WHERE group_id = $1 AND status = 'COMPLETED'
      GROUP BY from_user_id
    ),
    recv_set AS (
      SELECT to_user_id as user_id, COALESCE(SUM(amount), 0) as amount
      FROM settlements
      WHERE group_id = $1 AND status = 'COMPLETED'
      GROUP BY to_user_id
    )
    SELECT 
      m.user_id,
      COALESCE(pe.amount, 0) as paid_expenses,
      COALESCE(os.amount, 0) as owed_splits,
      COALESCE(ps.amount, 0) as paid_settlements,
      COALESCE(rs.amount, 0) as received_settlements
    FROM members m
    LEFT JOIN paid_exp pe ON pe.user_id = m.user_id
    LEFT JOIN owed_splits os ON os.user_id = m.user_id
    LEFT JOIN paid_set ps ON ps.user_id = m.user_id
    LEFT JOIN recv_set rs ON rs.user_id = m.user_id
  `;
  const res = await query(q, [groupId]);
  return res.rows.map((r: any) => {
    const total_paid = Number(r.paid_expenses) + Number(r.paid_settlements);
    const total_owed = Number(r.owed_splits) + Number(r.received_settlements);
    return {
      user_id: r.user_id,
      total_paid,
      total_owed,
      net_balance: total_paid - total_owed,
    };
  });
};

export const getMyBalances = async (userId: string) => {
  const paidExpQ = `SELECT COALESCE(SUM(amount),0) as amount FROM expenses WHERE paid_by = $1 AND deleted_at IS NULL`;
  const paidSetQ = `SELECT COALESCE(SUM(amount),0) as amount FROM settlements WHERE from_user_id = $1 AND status = 'COMPLETED'`;
  const owedSplQ = `SELECT COALESCE(SUM(es.amount),0) as amount FROM expense_splits es JOIN expenses e ON e.id = es.expense_id WHERE es.user_id = $1 AND e.deleted_at IS NULL`;
  const recvSetQ = `SELECT COALESCE(SUM(amount),0) as amount FROM settlements WHERE to_user_id = $1 AND status = 'COMPLETED'`;

  const [paidExpRes, paidSetRes, owedSplRes, recvSetRes] = await Promise.all([
    query(paidExpQ, [userId]),
    query(paidSetQ, [userId]),
    query(owedSplQ, [userId]),
    query(recvSetQ, [userId]),
  ]);

  const paidExp = Number(paidExpRes.rows[0].amount || 0);
  const paidSet = Number(paidSetRes.rows[0].amount || 0);
  const owedSpl = Number(owedSplRes.rows[0].amount || 0);
  const recvSet = Number(recvSetRes.rows[0].amount || 0);

  const total_paid = paidExp + paidSet;
  const total_owed = owedSpl + recvSet;

  return {
    total_paid,
    total_owed,
    net_balance: total_paid - total_owed,
  };
};
