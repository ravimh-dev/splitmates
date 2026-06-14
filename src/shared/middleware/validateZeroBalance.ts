import { Request, Response, NextFunction } from "express";
import { query } from "../..//db";

// Checks that the user's net balance in the group is zero.
export const validateZeroBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user?.sub;
  const groupId = req.params.groupId || req.body.group_id;
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!groupId)
    return res
      .status(400)
      .json({ success: false, message: "Missing group id" });
  try {
    // Simple balance calculation: sum of paid - sum of owed via expense_splits
    const paidQ = `SELECT COALESCE(SUM(amount),0) as total_paid FROM expenses WHERE group_id = $1 AND paid_by = $2 AND deleted_at IS NULL`;
    const owedQ = `SELECT COALESCE(SUM(es.amount),0) as total_owed FROM expense_splits es JOIN expenses e ON e.id = es.expense_id WHERE e.group_id = $1 AND es.user_id = $2 AND e.deleted_at IS NULL`;
    const paidR = await query(paidQ, [groupId, userId]);
    const owedR = await query(owedQ, [groupId, userId]);
    const paid = Number(paidR.rows[0].total_paid || 0);
    const owed = Number(owedR.rows[0].total_owed || 0);
    if (paid - owed !== 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "User balance must be zero to perform this action",
        });
    return next();
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Internal Error" });
  }
};
