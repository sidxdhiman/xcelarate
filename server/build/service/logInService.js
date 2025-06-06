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
exports.AuthLoginService = void 0;
const index_1 = require("../database/index");
class AuthLoginService {
    static login(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = userData;
            const loginUser = yield index_1.User.findOne({ email });
            console.log('loginUser:', loginUser);
            if (!loginUser) {
                throw new Error("No user with these credentials!");
            }
            // const decryptedPassword = decrypt({iv: loginUser.iv, content: loginUser.password})
            // if (decryptedPassword !== password) {
            //     throw new Error("Invalid credentials!");
            // } 
            return {
                accessLevel: loginUser.accessLevel,
                email: loginUser.email
            };
        });
    }
}
exports.AuthLoginService = AuthLoginService;
