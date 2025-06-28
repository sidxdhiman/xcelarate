import express from "express";
import router from "./apiRoutes";
const routers = express.Router();

//user routes

//get
routers.get("/users/", router);  
routers.get('/users/:email', router);

//post
routers.post("/bulkUserUpload", router);
routers.post("/postUser/", router);
routers.post("/signupUser/", router);
routers.post("/loginUser/", router);

//patch
routers.patch("/users/:email", router);

//delete
routers.delete("/users/:email", router);


//organisation routes
routers.post("/organisations/", router);
routers.get("/organisations/", router);

//question routes
routers.post("/postAssessment", router);
routers.get("/assessments", router);
routers.get("/assessments/:id", router);


export default routers;
