import express from "express";
import router from "./apiRoutes";
const routers = express.Router();

//user routes

//get
routers.get("/users/", router);  
routers.get('/users/:userId', router);

//post
routers.post("/users/bulk", router);
routers.post("/users/", router);
routers.post("/signup/", router);
routers.post("/login/", router);

//patch
routers.patch("/users/:userId", router);

//delete
routers.delete("/users/:userId", router);


//organisation routes
routers.post("/organisations/", router);
routers.get("/organisations/", router);

export default routers;
