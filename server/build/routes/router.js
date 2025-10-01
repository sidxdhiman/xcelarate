"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiRoutes_1 = __importDefault(require("./apiRoutes"));
const router = express_1.default.Router();
// ✅ Mount all API routes under /api
router.use("/", apiRoutes_1.default);
exports.default = router;
