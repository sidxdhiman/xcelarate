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
exports.PostResponse = exports.PostQuestion = exports.PostOrganization = exports.PostBeforeAssessment = exports.PostUser = void 0;
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
class PostBeforeAssessment {
    postBefore(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userData.name || !userData.designation || !userData.email || !userData.department || !userData.phone) {
                    throw new Error("All fields are required");
                }
                const user = yield index_3.beforeAssessment.create(userData);
                console.log("User Data Collected");
                return { user };
            }
            catch (error) {
                console.error("Error in collecting data");
                throw new Error(`Error in collecting data from user`);
            }
        });
    }
}
exports.PostBeforeAssessment = PostBeforeAssessment;
class Postorganization {
    postorganization(orgData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!orgData.name) {
                    throw new Error("organization name is required");
                }
                const organization = yield index_1.organization.create(orgData);
                console.log("organization posted successfully!");
                return organization;
            }
            catch (error) {
                console.error("Error in creating organization:");
                throw new Error(`Error in creating organization`);
            }
        });
    }
}
exports.Postorganization = Postorganization;
class PostQuestion {
    postQuestion(questionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, roles, questions } = questionData;
                if (!title || !roles || !Array.isArray(questions) || questions.length === 0) {
                    console.log('Invalid assessment payload:', questionData);
                    throw new Error("Assessment data is incomplete");
                }
                const assessment = yield index_1.Assessment.create(questionData);
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
class PostResponse {
    postResponse(assessmentId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!assessmentId || typeof payload.answers !== 'object') {
                    throw new Error("Missing or invalid response data");
                }
                const newResponse = yield index_2.Response.create({
                    assessmentId,
                    answers: payload.answers,
                    submittedAt: payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
                    startedAt: payload.startedAt ? new Date(payload.startedAt) : undefined,
                    location: payload.location,
                    user: payload.user,
                });
                console.log("Response saved successfully!");
                return newResponse;
            }
            catch (error) {
                console.error("Error saving response:", error);
                throw new Error("Failed to save assessment response");
            }
        });
    }
}
exports.PostResponse = PostResponse;
