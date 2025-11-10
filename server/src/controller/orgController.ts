import {Request, Response} from "express";
import mongoose from "mongoose";
// import { PostService } from "../service/postService";
const {PostOrganisation} = require("../service/postService");
const {GetOrganisation} = require("../service/getService");


export class orgController {
    public static async postOrg(req: Request, res: Response) {
        try {
            const orgData = req.body
            const organisation = await new PostOrganisation().postOrganisation(orgData);
            if (organisation) {
                res.json(organisation);
            } else {
                res.status(404).json({message: "Organisation not posted"});
            }
        } catch (error: any) {
            console.error("Error in postOrg controller:", error);
            res.status(500).json({message: error.message || "Internal server error"});
        }
    }
    public static async getOrg(req: Request, res: Response) {
        try {
          const organisations = await new GetOrganisation().getOrganisations();
          if (organisations) {
            res.json(organisations);
          } else {
            res.status(404).json({ message: "Organisations not found!" });
          }
        } catch (error) {
          res.status(500).json({ message: "Internal Server error!-GET" });
        }
      }
    
}