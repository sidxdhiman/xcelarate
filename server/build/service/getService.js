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
exports.GetResponseByAssessmentId = exports.GetAssessmentById = exports.GetAssessment = exports.GetOrganization = exports.GetByIdService = exports.GetService = void 0;
const database_1 = require("../database");
class GetService {
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield database_1.User.find({});
                return users;
            }
            catch (error) {
                console.error("Error fetching users from database:", error);
                throw new Error('Error fetching users');
            }
        });
    }
}
exports.GetService = GetService;
class GetByIdService {
    getUserbyId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.User.findOne({ userId: userId });
                return result;
            }
            catch (error) {
                console.error("Error fetching user", error);
                throw new Error('Error fetching users');
            }
        });
    }
}
exports.GetByIdService = GetByIdService;
class GetOrganization {
    getOrganizations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizations = yield database_1.Organization.find({});
                return organizations;
            }
            catch (error) {
                console.error("Error fetching data from database:", error);
                throw new Error('Error fetching data');
            }
        });
    }
}
exports.GetOrganization = GetOrganization;
class GetAssessment {
    getAssessment() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessments = yield database_1.Assessment.find({});
                return assessments;
            }
            catch (error) {
                console.error("Error in fetching Assessments", error);
                throw new Error('Error in fetching data');
            }
        });
    }
}
exports.GetAssessment = GetAssessment;
class GetAssessmentById {
    getAssessmentbyId(Id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessment = yield database_1.Assessment.findById(Id);
                return assessment;
            }
            catch (error) {
                console.error("Error fetching the Assessment", error);
                throw new Error("Error fetching assessment");
            }
        });
    }
}
exports.GetAssessmentById = GetAssessmentById;
class GetResponseByAssessmentId {
    getResponseByAssessmentId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield database_1.Response.find({ assessmentId: id });
                return response;
            }
            catch (error) {
                console.log("Error fetching response:", error);
                throw new Error("Error fetching response by assessment ID");
            }
        });
    }
}
exports.GetResponseByAssessmentId = GetResponseByAssessmentId;
