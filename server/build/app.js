"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./database/index");
const middleware_1 = __importDefault(require("./middleware/middleware"));
const router_1 = __importDefault(require("./routes/router"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
index_1.connection
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((error) => console.error("❌ Error connecting to MongoDB", error));
// ✅ Correct CORS setup
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:8081",
        "http://192.168.1.6:8081",
        "http://192.168.1.6:8082",
        "https://nonwoven-adan-drivingly.ngrok-free.dev"
    ],
    credentials: true,
}));
// ✅ JSON parsing
app.use(middleware_1.default.json());
// ✅ Mount all API routes under /api
app.use("/api", router_1.default);
// ✅ Health check route
app.get("/", (req, res) => {
    res.send("API is running...");
});
exports.default = app;
