import { Request, Response } from "express";
import mongoose from "mongoose";
import xlsx from "xlsx";
import fs from "fs";
import { AuthService } from "../service/signUpService";
import { AuthLoginService } from "../service/logInService";
import { PostUser } from "../service/postService";
var logger = require("../util/logger");
const {encrypt, decrypt} = require('../security/encrypt&decrypt');
const { GetService } = require("../service/getService");
const { PostService } = require("../service/postService");
const { DeleteService } = require("../service/deleteService");
const { PatchService } = require("../service/patchService");
const { GetByIdService } = require("../service/getService");
const {PostBulk} = require("../service/postBulkService");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
  public static async postFunction(req: Request, res: Response) {
    try {
        const userData = req.body
        const user = await new PostUser().postUser(userData);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({message: "User not posted"});
        }
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}
  
public static async postBulk(req: Request, res: Response) {
  try {
    // Check if a file is included in the request
    const file = req.file;
    console.log('Incoming File:', file);

    // Check for missing file
    if (!file) {
      return res.status(400).json({ error: "No file uploaded or incorrect field name" });
    }

    // Ensure the file type is Excel
    const allowedMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (file.mimetype !== allowedMimeType) {
      return res.status(400).json({ error: `Invalid file type. Only Excel files (.xlsx) are allowed. Got ${file.mimetype}` });
    }

    // Path to the uploaded file
    const filePath = file.path;

    // Parse the uploaded Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Log the parsed data for debugging
    console.log('Parsed Data:', data);

    // Check if the data is empty or improperly formatted
    if (!data || data.length === 0) {
      return res.status(400).json({ error: "The Excel file is empty or improperly formatted." });
    }

    // Create an instance of the PostBulk service and insert the users
    const postBulkInstance = new PostBulk();
    const result = await postBulkInstance.postBulkUsers(data);

    // Delete the file after processing to prevent storage accumulation
    fs.unlinkSync(filePath);

    // Return success response
    return res.status(200).json({ message: "Bulk users uploaded successfully", result });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific errors (e.g., file reading issues, JSON parsing errors)
    if (error instanceof Error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }

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
      const email = req.params.email;

      // Validate email format (you can use a more sophisticated email validator if needed)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
        // logger.errorLog.info("FAILED!-INVALID-EMAIL");
      }

      // Call delete service to delete the user by email
      const result = await new DeleteService().deleteUserByEmail(email);

      // Check if a user was deleted
      if (!result) {
        return res.status(404).json({ message: "User not found" });
        // logger.errorLog.info("FAILED!-USER-NOT-FOUND");
      }

      // Successfully deleted the user
      res.status(200).json({ message: "User deleted successfully!" });
      // logger.accessLog.info("SUCCESS!-USER-DELETED");
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal Server Error - DELETE" });
      // logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
    }
  }
}
