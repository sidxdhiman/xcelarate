"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiRoutes_1 = __importDefault(require("./apiRoutes"));
const routers = express_1.default.Router();
//user routes
//get
routers.get("/users/", apiRoutes_1.default);
routers.get('/users/:userId', apiRoutes_1.default);
//post
routers.post("/users/bulk", apiRoutes_1.default);
routers.post("/users/", apiRoutes_1.default);
routers.post("/signup/", apiRoutes_1.default);
routers.post("/login/", apiRoutes_1.default);
//patch
routers.patch("/users/:userId", apiRoutes_1.default);
//delete
routers.delete("/users/:userId", apiRoutes_1.default);
//organisation routes
routers.post("/organisations/", apiRoutes_1.default);
routers.get("/organisations/", apiRoutes_1.default);
exports.default = routers;
