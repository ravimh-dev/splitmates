import { Router } from "express";
import {
  createExpenseController,
  getExpenseController,
  deleteExpenseController,
} from "./expenses.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireGroupMember } from "../../shared/middleware/requireGroupMember";

const router = Router();

router.post("/", requireAuth, requireGroupMember, createExpenseController);
router.get(
  "/:expenseId",
  requireAuth,
  requireGroupMember,
  getExpenseController,
);
router.delete(
  "/:expenseId",
  requireAuth,
  requireGroupMember,
  deleteExpenseController,
);

export default router;
