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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchAssessmentService = exports.PatchService = void 0;
const database_1 = require("../database");
const database_2 = require("../database");
class PatchService {
    /**
     * Update user details using email as identifier
     * @param email string - Email of the user to be updated
     * @param updateData object - Fields to be updated
     * @returns updated user object (excluding sensitive fields)
     */
    patchUserByEmail(email, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email)
                throw new Error("Email is required for updating user");
            try {
                const updatedUser = yield database_1.User.findOneAndUpdate({ email }, { $set: updateData }, { new: true }).select("-password"); // Exclude password field
                if (!updatedUser) {
                    throw new Error("User not found");
                }
                return updatedUser;
            }
            catch (error) {
                console.error("❌ Error updating user by email:", error.message);
                throw new Error("Failed to update user profile");
            }
        });
    }
}
exports.PatchService = PatchService;
class PatchAssessmentService {
    /**
     * Update assessment using its ID
     * @param id - MongoDB ObjectId of the assessment
     * @param updateData - Object containing fields to update
     * @returns Updated assessment object
     */
    patchAssessmentById(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new Error("Assessment ID is required for update");
            try {
                const updatedAssessment = yield database_2.Assessment.findByIdAndUpdate(id, { $set: updateData }, { new: true });
                if (!updatedAssessment) {
                    throw new Error("Assessment not found");
                }
                return updatedAssessment;
            }
            catch (error) {
                console.error("❌ Error updating assessment by ID:", error.message);
                throw new Error("Failed to update assessment");
            }
        });
    }
}
exports.PatchAssessmentService = PatchAssessmentService;
