import express from "express";

const router = express.Router();
import { MainController } from "../controller/mainController";
import { RequestValidator } from "../validator/RequestValidator";
import { orgController } from "../controller/orgController";
import { questionController } from "../controller/questionController";
import {upload} from "../middleware/upload";

//user crud
router.get("/users/", MainController.getFunction);
router.get("/users/:email/", MainController.getUserFunction);
router.post("/postUser/", MainController.postFunction); //TODO add request validator
router.post("/signupUser/", MainController.signUp);
router.post("/loginUser/", MainController.logIn); //TODO add request validator
router.delete("/users/:email", MainController.deleteFunction);
router.patch("/users/:email", RequestValidator.patchUser, MainController.patchFunction);
router.post("/bulkUserUpload",upload.single('file'), MainController.postBulk);
router.post("postBefore", MainController.postBefore);
router.get("/roles", MainController.getRoles);

//organization crud
router.post("/organizations/", RequestValidator.postOrganization, orgController.postOrg);
router.get("/organizations/", orgController.getOrg);

// --- ADD THIS LINE FOR THE BULK UPLOAD ---
router.post("/organizations/bulkUpload", upload.single('file'), orgController.postOrgBulk);

//question crud
router.post("/assessments", questionController.postQuestion);
router.get("/assessments", questionController.getAssessmentFunction);
router.get("/assessments/:id", questionController.getAssessmentByIdFunction);
router.post("/assessments/:id/responses", questionController.submitResponse);
router.post("/assessments/send", questionController.sendAssessment);

// router.get("/assessments/:assessmentId/responses", questionController.getResponseById);
router.get("/assessments/:id/responses", questionController.getResponseById);
router.patch("/assessments/:id", questionController.patchAssessmentByIdFunction);
router.delete("/assessments/:id", questionController.deleteAssessmentByIdFunction);

// pdf creation route
router.get("/assessments/:id/pdf", questionController.getAssessmentPdf);

export default router;