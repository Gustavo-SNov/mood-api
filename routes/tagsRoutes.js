import express from "express";
import {
  getGroupsWithTags,
} from "../controllers/tagController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getGroupsWithTags);

export default router;
