import express from "express";

const router = express.Router();
import { MainController } from "../controller/mainController";
import { RequestValidator } from "../validator/RequestValidator";
import { orgController } from "../controller/orgController";
import {upload} from "../middleware/upload";

//user crud
router.get("/users/", MainController.getFunction);
router.get("/users/:userId/", MainController.getUserFunction);
router.post("/postUser/", MainController.postFunction); //TODO add request validator
router.post("/signupUser/", MainController.signUp);
router.post("/loginUser/", MainController.logIn); //TODO add request validator
router.delete("/users/:email", MainController.deleteFunction);
router.patch("/users/:email", RequestValidator.patchUser, MainController.patchFunction);
router.post("/bulkUserUpload",upload.single('file'), MainController.postBulk);

//organisation crud
router.post("/organisations/", RequestValidator.postOrganisation, orgController.postOrg);
router.get("/organisations/", orgController.getOrg);

export default router;
