import express from "express";

const router = express.Router();
import { MainController } from "../controller/mainController";
import { RequestValidator } from "../validator/RequestValidator";
import { orgController } from "../controller/orgController";
import {upload} from "../middleware/upload";

//user crud
router.get("/users/", MainController.getFunction);
router.get("/users/:userId/", MainController.getUserFunction);
router.post("/users/", RequestValidator.postUser, MainController.postFunction);
router.post("/signupUser/", MainController.signUp);
router.post("/loginUser/", MainController.logIn);
router.delete("/users/:_id", MainController.deleteFunction);
router.patch("/users/:userId", RequestValidator.patchUser, MainController.patchFunction);
router.post("/users/bulk", upload.single("file"), MainController.postBulk);

//organisation crud
router.post("/organisations/", RequestValidator.postOrganisation, orgController.postOrg);
router.get("/organisations/", orgController.getOrg);

export default router;
