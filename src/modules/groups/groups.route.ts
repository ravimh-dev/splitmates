import { Router } from "express";
import {
  createGroupController,
  getUserGroupsController,
  getGroupDetailsController,
  joinGroupController,
  exportGroupController,
} from "./groups.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, createGroupController);
router.get("/", requireAuth, getUserGroupsController);
router.post("/join", requireAuth, joinGroupController);
router.get("/:groupId", requireAuth, getGroupDetailsController);
router.get("/:groupId/export", requireAuth, exportGroupController);

export default router;
