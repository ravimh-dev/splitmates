import { Request, Response } from "express";
import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../db";
import {
  createSettlement,
  markSettlementPaid,
  getGroupSettlements,
} from "./settlements.model";
import { generateResponseJSON } from "../../shared/utils/response";
import { simplifyGroupBalances } from "./simplify";

export const simplifyController = async (req: Request, res: Response) => {
  const groupId = req.params.groupId;
  try {
    const transfers = await simplifyGroupBalances(groupId);
    return res.json(generateResponseJSON(200, "OK", { transfers }));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const createSettlementController = async (
  req: Request,
  res: Response,
) => {
  const { group_id, from_user_id, to_user_id, amount } = req.body;
  const tx = await startTransaction();
  const client = tx.client;
  try {
    // validation omitted: e.g., cannot settle more than pending amount, no self-settlement
    const settlement = await createSettlement(
      client,
      group_id,
      from_user_id,
      to_user_id,
      amount,
    );
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(
        client,
        group_id,
        (req as any).user?.sub || from_user_id,
        "settlement_created",
        { settlement_id: settlement.id, amount: settlement.amount },
      );
    } catch (e) {
      // non-fatal
    }
    await commitTransaction(client);
    return res
      .status(201)
      .json(generateResponseJSON(201, "Settlement created", settlement));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const paySettlementController = async (req: Request, res: Response) => {
  const settlementId = req.params.settlementId;
  const tx = await startTransaction();
  const client = tx.client;
  try {
    const s = await markSettlementPaid(client, settlementId);
    try {
      const { createActivity } = await import("../activities/activities.model");
      await createActivity(
        client,
        s.group_id,
        (req as any).user?.sub,
        "settlement_completed",
        { settlement_id: s.id, amount: s.amount },
      );
    } catch (e) {
      // non-fatal
    }
    await commitTransaction(client);
    return res.json(generateResponseJSON(200, "Paid", s));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const getGroupSettlementsController = async (
  req: Request,
  res: Response,
) => {
  const groupId = req.params.groupId;
  try {
    const rows = await getGroupSettlements(groupId);
    return res.json(generateResponseJSON(200, "OK", rows));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
