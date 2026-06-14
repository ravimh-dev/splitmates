import { Request, Response } from "express";
import { findUserById, updateUser } from "./users.model";
import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../db";
import { generateResponseJSON } from "../../shared/utils/response";

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));
  try {
    const user = await findUserById(userId);
    return res.json(generateResponseJSON(200, "OK", user));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));
  const tx = await startTransaction();
  const client = tx.client;
  try {
    const updated = await updateUser(client, userId, req.body);
    await commitTransaction(client);
    return res.json(generateResponseJSON(200, "Updated", updated));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
