import { Request, Response } from "express";
import mongoose from "mongoose";
import xlsx from "xlsx";
import fs from "fs";
import { AuthService } from "../service/signUpService";
import { AuthLoginService } from "../service/logInService";
var logger = require("../util/logger");
const {encrypt, decrypt} = require('../security/encrypt&decrypt');
const { GetService } = require("../service/getService");
const { PostService } = require("../service/postService");
const { DeleteService } = require("../service/deleteService");
const { PatchService } = require("../service/patchService");
const { GetByIdService } = require("../service/getService");
const {PostBulk} = require("../service/postBulkService");

export class MainController {
  public static async getFunction(req: Request, res: Response) {
    try {
      const users = await new GetService().getUsers();
      if (users) {
        res.json(users);
        logger.accessLog.info("SUCCESS!-USERS-FOUND");
      } else {
        res.status(404).json({ message: "Users not found!" });
        logger.errorLog.info("FAILED!-USERS-NOT-FOUND");
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server error!-GET" });
      logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
    }
  }
  public static async getUserFunction(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return (
          res.status(400).json({ message: "Invalid user ID format" }),
          logger.errorLog.info("FAILED!-INVALID-USER-ID")
        );
      }
      const result = await new GetByIdService().getUserbyId(userId);
      if (result) {
        res.json(result)
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server error!-GET" });
    }
  
  }
  public static async signUp(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      const message = error.message || "Something went wrong";
      const statusCode = message === "User already exists" ? 409 : 500;
      res.status(statusCode).json({ error: message });
    }
  }  
  public static async logIn(req: Request, res:Response) {
    try {
      const result = await AuthLoginService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      const message = error.message || "Something went wrong";
      const statusCode = message === "Invalid Credentials" ? 401 : 500;
      res.status(statusCode).json({error: message})
    }
  }
  
public static async postBulk(req: Request, res: Response) {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const postBulkInstance = new PostBulk();
    const result = await postBulkInstance.postBulkUsers(data);

    fs.unlinkSync(filePath);

    return res.status(200).json({ message: "Bulk Users uploaded successfully", result });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
  public static async patchFunction(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return (
          res.status(400).json({ message: "Invalid user ID format" }),
          logger.errorLog.info("FAILED!-INVALID-USER-ID")
        );
      }

      const result = await new PatchService().patchUserbyId(userId, updateData);

      if (result.matchedCount === 0) {
        return (
          res
            .status(404)
            .json({ message: "User not found or no fields were updated" }),
          logger.errorLog.info("FAILED!-USER-NOT-UPDATED")
        );
      }

      res.status(200).json({ message: "User updated successfully!" }),
        logger.accessLog.info("SUCCESS!-USER-UPDATED");
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error - PATCH" });
      logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
    }
  }

  public static async deleteFunction(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" }),
        logger.errorLog.info("FAILED!-INVALID-USER-ID");
      }

      const result = await new DeleteService().deleteUserbyId(userId);

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "User not found" }),
        logger.errorLog.info("FAILED!-USER-NOT-FOUND");
      }

      res.status(200).json({ message: "User deleted successfully!" })
      logger.accessLog.info("SUCCESS!-USER-DELETED");
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error - DELETE" }),
      logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
    }
  }
}
