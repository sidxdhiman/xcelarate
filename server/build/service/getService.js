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
exports.GetAssessment = exports.GetOrganisation = exports.GetByIdService = exports.GetService = void 0;
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
class GetOrganisation {
    getOrganisations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organisations = yield database_1.Organisation.find({});
                return organisations;
            }
            catch (error) {
                console.error("Error fetching data from database:", error);
                throw new Error('Error fetching data');
            }
        });
    }
}
exports.GetOrganisation = GetOrganisation;
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
