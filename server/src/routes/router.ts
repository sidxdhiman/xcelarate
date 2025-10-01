import express from "express";
import apiRoutes from "./apiRoutes";

const router = express.Router();

// ✅ Mount all API routes under /api
router.use("/", apiRoutes);

export default router;
