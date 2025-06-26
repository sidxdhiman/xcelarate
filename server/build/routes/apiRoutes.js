"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const mainController_1 = require("../controller/mainController");
const RequestValidator_1 = require("../validator/RequestValidator");
const orgController_1 = require("../controller/orgController");
const questionController_1 = require("../controller/questionController");
const upload_1 = require("../middleware/upload");
//user crud
router.get("/users/", mainController_1.MainController.getFunction);
router.get("/users/:email/", mainController_1.MainController.getUserFunction);
router.post("/postUser/", mainController_1.MainController.postFunction); //TODO add request validator
router.post("/signupUser/", mainController_1.MainController.signUp);
router.post("/loginUser/", mainController_1.MainController.logIn); //TODO add request validator
router.delete("/users/:email", mainController_1.MainController.deleteFunction);
router.patch("/users/:email", RequestValidator_1.RequestValidator.patchUser, mainController_1.MainController.patchFunction);
router.post("/bulkUserUpload", upload_1.upload.single('file'), mainController_1.MainController.postBulk);
//organisation crud
router.post("/organisations/", RequestValidator_1.RequestValidator.postOrganisation, orgController_1.orgController.postOrg);
router.get("/organisations/", orgController_1.orgController.getOrg);
//question crud
router.post("/postAssessment", questionController_1.questionController.postQuestion);
router.get("/getAssessments", questionController_1.questionController.getAssessmentFunction);
exports.default = router;
