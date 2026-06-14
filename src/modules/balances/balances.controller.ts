import { Request, Response } from "express";
import { getGroupBalances, getMyBalances } from "./balances.model";
import { generateResponseJSON } from "../../shared/utils/response";

export const getGroupBalancesController = async (
  req: Request,
  res: Response,
) => {
  const groupId = req.params.groupId;
  try {
    const balances = await getGroupBalances(groupId);
    return res.json(generateResponseJSON(200, "OK", balances));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const getMyBalancesController = async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  if (!userId)
    return res.status(401).json(generateResponseJSON(401, "Unauthorized"));
  try {
    const balances = await getMyBalances(userId);
    return res.json(generateResponseJSON(200, "OK", balances));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
