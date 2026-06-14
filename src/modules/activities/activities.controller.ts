import { Request, Response } from "express";
import { listGroupActivities, countGroupActivities } from "./activities.model";
import { generateResponseJSON } from "../../shared/utils/response";

export const getGroupActivitiesController = async (
  req: Request,
  res: Response,
) => {
  const groupId = req.params.groupId;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const type = req.query.type as string | undefined;
  const actorId = req.query.actorId as string | undefined;

  try {
    const [activities, total] = await Promise.all([
      listGroupActivities(groupId, { limit, offset, type, actorId }),
      countGroupActivities(groupId, { type, actorId }),
    ]);

    return res.json(
      generateResponseJSON(200, "OK", {
        activities,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + activities.length < total,
        },
      }),
    );
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
