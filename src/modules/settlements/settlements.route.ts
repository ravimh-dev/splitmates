import { Router } from "express";
import {
  simplifyController,
  createSettlementController,
  paySettlementController,
  getGroupSettlementsController,
} from "./settlements.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.get("/:groupId/simplify", requireAuth, simplifyController);
router.post("/", requireAuth, createSettlementController);
router.patch("/:settlementId/pay", requireAuth, paySettlementController);
router.get("/groups/:groupId", requireAuth, getGroupSettlementsController);

export default router;
