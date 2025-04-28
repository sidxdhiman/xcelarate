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
                const userId = parseInt(req.params.userId);
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    return (res.status(400).json({ message: "Invalid user ID format" }),
                        logger.errorLog.info("FAILED!-INVALID-USER-ID"));
                }
                const result = yield new GetByIdService().getUserbyId(userId);
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
                res.status(200).json(result);
            }
            catch (error) {
                const message = error.message || "Something went wrong";
                const statusCode = message === "Invalid Credentials" ? 401 : 500;
                res.status(statusCode).json({ error: message });
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
            var _a;
            try {
                // Ensure the field name matches 'file' used in the frontend request (Postman or React)
                const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                if (!filePath) {
                    return res.status(400).json({ error: "No file uploaded or incorrect field name" });
                }
                // Parse the uploaded Excel file
                const workbook = xlsx_1.default.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const data = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
                // Use your service to insert the users
                const postBulkInstance = new PostBulk();
                const result = yield postBulkInstance.postBulkUsers(data);
                // Delete the file after processing to prevent storage accumulation
                fs_1.default.unlinkSync(filePath);
                // Return success response
                return res.status(200).json({ message: "Bulk users uploaded successfully", result });
            }
            catch (error) {
                console.error("Upload error:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static patchFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const updateData = req.body;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    return (res.status(400).json({ message: "Invalid user ID format" }),
                        logger.errorLog.info("FAILED!-INVALID-USER-ID"));
                }
                const result = yield new PatchService().patchUserbyId(userId, updateData);
                if (result.matchedCount === 0) {
                    return (res
                        .status(404)
                        .json({ message: "User not found or no fields were updated" }),
                        logger.errorLog.info("FAILED!-USER-NOT-UPDATED"));
                }
                res.status(200).json({ message: "User updated successfully!" }),
                    logger.accessLog.info("SUCCESS!-USER-UPDATED");
            }
            catch (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ message: "Internal Server Error - PATCH" });
                logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
            }
        });
    }
    static deleteFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = req.params._id;
                if (!mongoose_1.default.Types.ObjectId.isValid(_id)) {
                    return res.status(400).json({ message: "Invalid user ID format" });
                    // logger.errorLog.info("FAILED!-INVALID-USER-ID");
                }
                const result = yield new DeleteService().deleteUserbyId(_id);
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "User not found" });
                    logger.errorLog.info("FAILED!-USER-NOT-FOUND");
                }
                res.status(200).json({ message: "User deleted successfully!" });
                logger.accessLog.info("SUCCESS!-USER-DELETED");
            }
            catch (error) {
                console.error("Error deleting user:", error);
                res.status(500).json({ message: "Internal Server Error - DELETE" });
                logger.errorLog.info("FAILED!-INTERNAL-SERVER-ERROR");
            }
        });
    }
}
exports.MainController = MainController;
