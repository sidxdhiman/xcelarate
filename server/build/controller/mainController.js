"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const signUpService_1 = require("../service/signUpService");
const logInService_1 = require("../service/logInService");
const postService_1 = require("../service/postService");
var logger = require("../util/logger");
const { encrypt, decrypt } = require('../security/encrypt&decrypt');
const { GetService } = require("../service/getService");
const { PostService } = require("../service/postService");
const { DeleteService } = require("../service/deleteService");
const { PatchService } = require("../service/patchService");
const { GetByIdService } = require("../service/getService");
const { PostBulk } = require("../service/postBulkService");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
class MainController {
    static getFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield new GetService().getUsers();
                if (users) {
                    res.json(users);
                    logger.accessLog.info("SUCCESS!-USERS-FOUND");
                }
                else {
                    res.status(404).json({ message: "Users not found!" });
                    logger.errorLog.info("FAILED!-USERS-NOT-FOUND");
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server error!-GET" });
                logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
            }
        });
    }
    static getUserFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = parseInt(req.params.email);
                if (!mongoose_1.default.Types.ObjectId.isValid(email)) {
                    return (res.status(400).json({ message: "Invalid EMail ID format" }),
                        logger.errorLog.info("FAILED!-INVALID-EMAIL-ID"));
                }
                const result = yield new GetByIdService().getUserbyId(email);
                if (result) {
                    res.json(result);
                }
                else {
                    res.status(404).json({ message: "User not found" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server error!-GET" });
            }
        });
    }
    static signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield signUpService_1.AuthService.signup(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                const message = error.message || "Something went wrong";
                const statusCode = message === "User already exists" ? 409 : 500;
                res.status(statusCode).json({ error: message });
            }
        });
    }
    static logIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield logInService_1.AuthLoginService.login(req.body);
                console.log('result:', result);
                if (!result || result.accessLevel === undefined) {
                    // Defensive fallback: return error response
                    return res.status(500).json({ error: "Login service returned invalid result" });
                }
                return res.json({
                    success: true,
                    data: {
                        accessLevel: result.accessLevel,
                        email: result.email,
                    }
                });
            }
            catch (error) {
                const message = error.message || "Something went wrong";
                const statusCode = message === "Invalid Credentials" ? 401 : 500;
                return res.status(statusCode).json({ error: message });
            }
        });
    }
    static postFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = req.body;
                const user = yield new postService_1.PostUser().postUser(userData);
                if (user) {
                    res.json(user);
                }
                else {
                    res.status(404).json({ message: "User not posted" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static postBulk(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const workbook = xlsx_1.default.readFile(filePath);
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const data = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
                // Log the parsed data for debugging
                console.log('Parsed Data:', data);
                // Check if the data is empty or improperly formatted
                if (!data || data.length === 0) {
                    return res.status(400).json({ error: "The Excel file is empty or improperly formatted." });
                }
                // Create an instance of the PostBulk service and insert the users
                const postBulkInstance = new PostBulk();
                const result = yield postBulkInstance.postBulkUsers(data);
                // Delete the file after processing to prevent storage accumulation
                fs_1.default.unlinkSync(filePath);
                // Return success response
                return res.status(200).json({ message: "Bulk users uploaded successfully", result });
            }
            catch (error) {
                console.error("Upload error:", error);
                // Handle specific errors (e.g., file reading issues, JSON parsing errors)
                if (error instanceof Error) {
                    return res.status(500).json({ error: `Internal server error: ${error.message}` });
                }
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static patchFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.params.email;
                const updateData = req.body;
                // Optional: Basic email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    logger.errorLog.info("FAILED!-INVALID-EMAIL-FORMAT");
                    return res.status(400).json({ message: "Invalid email format" });
                }
                const result = yield new PatchService().patchUserByEmail(email, updateData);
                if (!result) {
                    logger.errorLog.info("FAILED!-USER-NOT-FOUND");
                    return res
                        .status(404)
                        .json({ message: "User not found or no fields were updated" });
                }
                logger.accessLog.info("SUCCESS!-USER-UPDATED");
                return res.status(200).json({ message: "User updated successfully", data: result });
            }
            catch (error) {
                console.error("Error updating user:", error);
                logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
                return res.status(500).json({ message: "Internal Server Error - PATCH" });
            }
        });
    }
    static deleteFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.params.email;
                // Validate email format (you can use a more sophisticated email validator if needed)
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ message: "Invalid email format" });
                    // logger.errorLog.info("FAILED!-INVALID-EMAIL");
                }
                // Call delete service to delete the user by email
                const result = yield new DeleteService().deleteUserByEmail(email);
                // Check if a user was deleted
                if (!result) {
                    return res.status(404).json({ message: "User not found" });
                    // logger.errorLog.info("FAILED!-USER-NOT-FOUND");
                }
                // Successfully deleted the user
                res.status(200).json({ message: "User deleted successfully!" });
                // logger.accessLog.info("SUCCESS!-USER-DELETED");
            }
            catch (error) {
                console.error("Error deleting user:", error);
                res.status(500).json({ message: "Internal Server Error - DELETE" });
                // logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
            }
        });
    }
}
exports.MainController = MainController;
