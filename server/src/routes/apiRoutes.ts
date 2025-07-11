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

//organisation crud
router.post("/organisations/", RequestValidator.postOrganisation, orgController.postOrg);
router.get("/organisations/", orgController.getOrg);

//question crud
router.post("/postAssessment", questionController.postQuestion);
router.get("/assessments", questionController.getAssessmentFunction);
router.get("/assessments/:id", questionController.getAssessmentByIdFunction);
router.post("/assessments/:id/responses", questionController.submitResponse);
// router.get("/assessments/:assessmentId/responses", questionController.getResponseById);
router.get("/assessments/:id/responses", questionController.getResponseById);
router.patch("/assessments/:id", questionController.patchAssessmentByIdFunction);
router.delete("/assessments/:id", questionController.deleteAssessmentByIdFunction);

export default router;