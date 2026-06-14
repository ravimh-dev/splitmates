import { Router } from "express";
import {
  getGroupBalancesController,
  getMyBalancesController,
} from "./balances.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.get("/groups/:groupId", requireAuth, getGroupBalancesController);
router.get("/me", requireAuth, getMyBalancesController);

export default router;
