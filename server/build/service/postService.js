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
exports.PostOrganisation = exports.PostUser = void 0;
const index_1 = require("../database/index");
const index_2 = require("../database/index");
const encrypt_decrypt_1 = require("../security/encrypt&decrypt");
// import jwt from 'jsonwebtoken';
class PostUser {
    postUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate userData before creating
                if (!userData.email || !userData.password || !userData.name) {
                    throw new Error("Required fields are missing");
                }
                const encrypted = (0, encrypt_decrypt_1.encrypt)(userData.password);
                userData.password = encrypted.content;
                userData.iv = encrypted.iv;
                const user = yield index_1.User.create(userData);
                console.log("User posted successfully!");
                // Optionally, generate JWT Token after user creation
                // const token = jwt.sign(
                //   { email: user.email, id: user._id },
                //   process.env.JWT_SECRET as string,
                //   { expiresIn: "1h" }
                // );
                return { user };
            }
            catch (error) {
                console.error("Error in creating user");
                throw new Error(`Error in creating user`);
            }
        });
    }
}
exports.PostUser = PostUser;
class PostOrganisation {
    postOrganisation(orgData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Optional: Validate orgData before creating
                if (!orgData.name) {
                    throw new Error("Organisation name is required");
                }
                const organisation = yield index_2.Organisation.create(orgData);
                console.log("Organisation posted successfully!");
                return organisation;
            }
            catch (error) {
                console.error("Error in creating organisation:");
                throw new Error(`Error in creating organisation`);
            }
        });
    }
}
exports.PostOrganisation = PostOrganisation;
