import { Request, Response, NextFunction } from "express";
import { query } from "../..//db";

export const requireGroupMember = async (
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
    const q = `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'ACTIVE'`;
    const r = await query(q, [groupId, userId]);
    if (r.rowCount === 0)
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not a group member" });
    return next();
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Internal Error" });
  }
};
