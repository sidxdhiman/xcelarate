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
exports.DeleteService = void 0;
const index_1 = require("../database/index");
class DeleteService {
    deleteUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if email is valid
                if (!email || typeof email !== 'string') {
                    throw new Error("Invalid email format");
                }
                // Check if the user exists
                const userExists = yield index_1.User.findOne({ email });
                if (!userExists) {
                    throw new Error("User not found");
                }
                // Delete the user
                const result = yield index_1.User.findOneAndDelete({ email });
                // Return the result of the delete operation
                return result;
            }
            catch (error) {
                console.error("Error deleting user:", error);
                throw new Error("Failed to delete user");
            }
        });
    }
}
exports.DeleteService = DeleteService;
