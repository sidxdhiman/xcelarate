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
exports.DeleteService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../database/index");
class DeleteService {
    deleteUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!email || typeof email !== 'string') {
                    throw new Error("Invalid email format");
                }
                // const userExists = await User.findOne({ email });
                // if (!userExists) {
                //   throw new Error("User not found");
                // } TODO: check if email exists
                const result = yield index_1.User.findOneAndDelete({ email });
                return result;
            }
            catch (error) {
                console.error("Error deleting user:", error);
                throw new Error("Failed to delete user");
            }
        });
    }
    deleteAssessmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new Error("Invalid assessment ID");
                }
                const deletedAssessment = yield index_1.Assessment.findByIdAndDelete(id);
                if (!deletedAssessment) {
                    throw new Error("Assessment not found");
                }
                return deletedAssessment;
            }
            catch (error) {
                console.error("Error deleting assessment:", error);
                throw new Error("Failed to delete assessment");
            }
        });
    }
}
exports.DeleteService = DeleteService;
