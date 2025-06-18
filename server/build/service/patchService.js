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
exports.PatchService = void 0;
const database_1 = require("../database");
class PatchService {
    patchUserByEmail(email, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield database_1.User.findOneAndUpdate({ email }, { $set: updateData }, { new: true });
                return updatedUser;
            }
            catch (error) {
                console.error("Error updating user by email:", error);
                throw error;
            }
        });
    }
}
exports.PatchService = PatchService;
