import { Request, Response } from "express";
import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  query,
} from "../../db";
import {
  generateJoinCode,
  isJoinCodeUnique,
  createGroup,
  addGroupMember,
  getUserGroups,
  findGroupById,
} from "./groups.model";
import { generateResponseJSON } from "../../shared/utils/response";

export const createGroupController = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));
  const tx = await startTransaction();
  const client = tx.client;
  try {
    // ensure unique join code
    let code = generateJoinCode();
    let tries = 0;
    while (!(await isJoinCodeUnique(code)) && tries < 5) {
      code = generateJoinCode();
      tries++;
    }
    const group = await createGroup(client, name, userId, code);
    await addGroupMember(client, group.id, userId, "ADMIN");
    // log activity
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(client, group.id, userId, "group_created", {
        name: group.name,
      });
    } catch (e) {
      // non-fatal
    }
    await commitTransaction(client);
    return res
      .status(201)
      .json(generateResponseJSON(201, "Group created", group));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const getUserGroupsController = async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));

  try {
    const groups = await getUserGroups(userId);
    return res.json(generateResponseJSON(200, "OK", groups));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const getGroupDetailsController = async (req: Request, res: Response) => {
  const groupId = req.params.groupId;
  console.log("groupId: ", groupId);
  const userId = (req as any).user?.sub;
  console.log("userId: ", userId);
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));

  try {
    // Check if user is a member
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
      [groupId, userId]
    );
    if ((memberCheck.rowCount ?? 0) === 0) {
      return res
        .status(403)
        .json(generateResponseJSON(403, "Forbidden: Not a group member"));
    }

    const group = await findGroupById(groupId);
    if (!group) {
      return res.status(404).json(generateResponseJSON(404, "Group not found"));
    }

    // Get members
    const membersRes = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url, gm.role, gm.joined_at
       FROM users u
       JOIN group_members gm ON gm.user_id = u.id
       WHERE gm.group_id = $1 AND gm.status = 'ACTIVE'`,
      [groupId]
    );
    group.members = membersRes.rows;

    // Get expenses
    const expensesRes = await query(
      `SELECT e.*, u.name as paid_by_name, u.email as paid_by_email, u.avatar_url as paid_by_avatar
       FROM expenses e
       JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = $1 AND e.deleted_at IS NULL
       ORDER BY e.created_at DESC`,
      [groupId]
    );
    
    // Get splits for all expenses
    const expenses = expensesRes.rows;
    if (expenses.length > 0) {
      const expenseIds = expenses.map((e: any) => e.id);
      const splitsRes = await query(
        `SELECT es.*, u.name as user_name, u.email as user_email
         FROM expense_splits es
         JOIN users u ON es.user_id = u.id
         WHERE es.expense_id = ANY($1)`,
        [expenseIds]
      );
      
      // Attach splits to expenses
      expenses.forEach((e: any) => {
        e.splits = splitsRes.rows
          .filter((s: any) => s.expense_id === e.id)
          .map((s: any) => ({
            user_id: s.user_id,
            name: s.user_name,
            amount: Number(s.amount),
            percentage: s.percentage ? Number(s.percentage) : null,
            shares: s.shares ? Number(s.shares) : null
          }));
      });
    }
    group.expenses = expenses;

    return res.json(generateResponseJSON(200, "OK", group));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const joinGroupController = async (req: Request, res: Response) => {
  const { join_code } = req.body;
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));

  if (!join_code) {
    return res.status(400).json(generateResponseJSON(400, "Join code is required"));
  }

  const tx = await startTransaction();
  const client = tx.client;
  try {
    // Find group by join code
    const groupRes = await client.query(`SELECT * FROM groups WHERE join_code = $1`, [join_code.toUpperCase().trim()]);
    if (groupRes.rowCount === 0) {
      await rollbackTransaction(client);
      return res.status(404).json(generateResponseJSON(404, "Invalid join code"));
    }
    const group = groupRes.rows[0];

    // Check if already a member
    const memberRes = await client.query(
      `SELECT id, status FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [group.id, userId]
    );
    if ((memberRes.rowCount ?? 0) > 0) {
      const member = memberRes.rows[0];
      if (member.status === 'ACTIVE') {
        await rollbackTransaction(client);
        return res.status(400).json(generateResponseJSON(400, "Already a member of this group"));
      } else {
        // Reactivate membership
        await client.query(
          `UPDATE group_members SET status = 'ACTIVE', joined_at = now(), left_at = NULL WHERE id = $1`,
          [member.id]
        );
      }
    } else {
      // Add member
      await addGroupMember(client, group.id, userId, "MEMBER");
    }

    // Log activity
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(client, group.id, userId, "group_joined", {
        name: group.name,
      });
    } catch (e) {
      // non-fatal
    }

    await commitTransaction(client);
    return res.json(generateResponseJSON(200, "Joined group successfully", group));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const exportGroupController = async (req: Request, res: Response) => {
  const groupId = req.params.groupId;
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));

  try {
    // 1. Verify that the user is an active member of the group
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
      [groupId, userId]
    );
    if ((memberCheck.rowCount ?? 0) === 0) {
      return res
        .status(403)
        .json(generateResponseJSON(403, "Forbidden: Not a group member"));
    }

    const group = await findGroupById(groupId);
    if (!group) {
      return res.status(404).json(generateResponseJSON(404, "Group not found"));
    }

    // 2. Fetch all non-deleted expenses
    const expensesRes = await query(
      `SELECT e.created_at, 'Expense' as type, e.title, e.amount, u.name as paid_by, e.split_type
       FROM expenses e
       JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = $1 AND e.deleted_at IS NULL`,
      [groupId]
    );

    // 3. Fetch all completed settlements
    const settlementsRes = await query(
      `SELECT s.created_at, 'Settlement' as type, 'Settled Debt' as title, s.amount, u1.name || ' paid ' || u2.name as paid_by, '' as split_type
       FROM settlements s
       JOIN users u1 ON s.from_user_id = u1.id
       JOIN users u2 ON s.to_user_id = u2.id
       WHERE s.group_id = $1 AND s.status = 'COMPLETED'`,
      [groupId]
    );

    // 4. Merge and sort chronologically
    const allRecords = [...expensesRes.rows, ...settlementsRes.rows];
    allRecords.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 5. Build CSV
    let csvContent = `"Date","Type","Title/Description","Amount","Paid By/Details","Split Type"\n`;
    
    for (const r of allRecords) {
      const dateStr = new Date(r.created_at).toISOString();
      const amountFormatted = (Number(r.amount) / 100).toFixed(2);
      const titleClean = (r.title || "").replace(/"/g, '""');
      const paidByClean = (r.paid_by || "").replace(/"/g, '""');
      const typeClean = r.type;
      const splitTypeClean = r.split_type || "";

      csvContent += `"${dateStr}","${typeClean}","${titleClean}","${amountFormatted}","${paidByClean}","${splitTypeClean}"\n`;
    }

    // 6. Return response stream
    const fileName = `splitmate_${group.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_statement.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

