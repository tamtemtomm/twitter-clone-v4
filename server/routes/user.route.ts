import express from "express";
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUserProfile } from "../controllers/user.controller";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUserProfile);

export default router;
