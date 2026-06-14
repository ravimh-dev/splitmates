import { Request, Response } from "express";
import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../db";
import {
  createExpense,
  addExpenseSplit,
  findExpenseById,
  softDeleteExpense,
} from "./expenses.model";
import { createExpenseSchema } from "./expenses.validation";
import { generateResponseJSON } from "../../shared/utils/response";

export const createExpenseController = async (req: Request, res: Response) => {
  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(
        generateResponseJSON(400, "Validation Error", parsed.error.format()),
      );
  const data = parsed.data;
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));
  // Ensure paid_by matches authenticated user or is allowed (simple check)
  if (data.paid_by !== userId)
    return res
      .status(403)
      .json(
        generateResponseJSON(403, "paid_by must be the authenticated user"),
      );

  const tx = await startTransaction();
  const client = tx.client;
  try {
    // Validate that the paid_by user is an active member of the group
    const payerCheck = await client.query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
      [data.group_id, data.paid_by]
    );
    if ((payerCheck.rowCount ?? 0) === 0) {
      await rollbackTransaction(client);
      return res
        .status(400)
        .json(generateResponseJSON(400, "Payer is not a member of the group"));
    }

    // Validate that all participants in splits are active members of the group
    const participantIds = data.splits.map((s) => s.user_id);
    const uniqueParticipants = Array.from(new Set(participantIds));
    const participantsCheck = await client.query(
      `SELECT user_id FROM group_members WHERE group_id = $1 AND user_id = ANY($2) AND status = 'ACTIVE'`,
      [data.group_id, uniqueParticipants]
    );

    if ((participantsCheck.rowCount ?? 0) !== uniqueParticipants.length) {
      await rollbackTransaction(client);
      return res
        .status(400)
        .json(
          generateResponseJSON(
            400,
            "One or more split participants are not members of the group"
          )
        );
    }

    const expense = await createExpense(client, {
      group_id: data.group_id,
      paid_by: data.paid_by,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      split_type: data.split_type,
    });

    for (const s of data.splits) {
      const amount = s.amount ?? 0;
      await addExpenseSplit(
        client,
        expense.id,
        s.user_id,
        amount,
        s.percentage,
        s.shares,
      );
    }

    // log activity
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(client, data.group_id, userId, "expense_added", {
        expense_id: expense.id,
        title: expense.title,
        amount: expense.amount,
      });
    } catch (e) {
      // non-fatal
    }
    await commitTransaction(client);
    return res
      .status(201)
      .json(generateResponseJSON(201, "Expense created", expense));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const getExpenseController = async (req: Request, res: Response) => {
  const expenseId = req.params.expenseId;
  try {
    const expense = await findExpenseById(expenseId);
    if (!expense)
      return res.status(404).json(generateResponseJSON(404, "Not found"));
    return res.json(generateResponseJSON(200, "OK", expense));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const deleteExpenseController = async (req: Request, res: Response) => {
  const expenseId = req.params.expenseId;
  const tx = await startTransaction();
  const client = tx.client;
  try {
    // TODO: check settlements affecting balances
    const e = await softDeleteExpense(client, expenseId);
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(
        client,
        e.group_id,
        (req as any).user?.sub,
        "expense_deleted",
        { expense_id: e.id },
      );
    } catch (er) {
      // non-fatal
    }
    await commitTransaction(client);
    return res.json(generateResponseJSON(200, "Deleted", e));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
