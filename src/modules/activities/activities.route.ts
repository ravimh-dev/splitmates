import { Router } from "express";
import { getGroupActivitiesController } from "./activities.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.get("/groups/:groupId", requireAuth, getGroupActivitiesController);

export default router;
