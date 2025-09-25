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
routers.get('/users/:email', apiRoutes_1.default);
//post
routers.post("/bulkUserUpload", apiRoutes_1.default);
routers.post("/postUser/", apiRoutes_1.default);
routers.post("/signupUser/", apiRoutes_1.default);
routers.post("/loginUser/", apiRoutes_1.default);
routers.post("postBefore", apiRoutes_1.default);
//patch
routers.patch("/users/:email", apiRoutes_1.default);
//delete
routers.delete("/users/:email", apiRoutes_1.default);
//organisation routes
routers.post("/organisations/", apiRoutes_1.default);
routers.get("/organisations/", apiRoutes_1.default);
//question routes
routers.post("/postAssessment", apiRoutes_1.default);
routers.get("/assessments", apiRoutes_1.default);
routers.get("/assessments/:id", apiRoutes_1.default);
routers.post("/assessments/:id/responses", apiRoutes_1.default);
// routers.get("/assessments/:assessmentId/responses", router);
routers.get("/assessments/:id/responses", apiRoutes_1.default);
routers.patch("/assessments/:id", apiRoutes_1.default);
routers.delete("/assessments/:id", apiRoutes_1.default);
exports.default = routers;
