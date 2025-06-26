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
exports.PostQuestion = exports.PostOrganisation = exports.PostUser = void 0;
const index_1 = require("../database/index");
const index_2 = require("../database/index");
const index_3 = require("../database/index");
class PostUser {
    postUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userData.email || !userData.username) {
                    throw new Error("Required fields are missing");
                }
                const user = yield index_1.User.create(userData);
                console.log("User posted successfully!");
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
;
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
;
class PostQuestion {
    postQuestion(questionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, roles, questions } = questionData;
                if (!title || !roles || !Array.isArray(questions) || questions.length === 0) {
                    console.log('Invalid assessment payload:', questionData);
                    throw new Error("Assessment data is incomplete");
                }
                const assessment = yield index_3.Assessment.create(questionData);
                console.log("Assessment posted successfully!");
                return assessment;
            }
            catch (error) {
                console.error("Error in posting a question: ", error);
                throw new Error(`Error in posting question`);
            }
        });
    }
}
exports.PostQuestion = PostQuestion;
