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
exports.AuthService = void 0;
const index_1 = require("../database/index");
const encrypt_decrypt_1 = require("../security/encrypt&decrypt");
class AuthService {
    static signup(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, contact, organisation, designation, location, currentProject, accessLevel } = userData;
            const existingUser = yield index_1.User.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const encrypted = (0, encrypt_decrypt_1.encrypt)(password);
            const newUser = yield index_1.User.create({
                name,
                email,
                password: encrypted.content,
                iv: encrypted.iv,
                contact,
                organisation,
                designation,
                location,
                currentProject,
                accessLevel
            });
            // const token = jwt.sign(
            //   { email: newUser.email, id: newUser._id },
            //   process.env.JWT_SECRET as string,
            //   { expiresIn: "1h" }
            // );
            return {
                user: newUser,
                // token
            };
        });
    }
}
exports.AuthService = AuthService;
