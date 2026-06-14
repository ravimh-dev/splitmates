import { Router } from "express";
import { getProfile, updateProfile } from "./users.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;
