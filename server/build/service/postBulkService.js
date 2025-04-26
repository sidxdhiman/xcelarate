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
exports.PostBulk = void 0;
const index_1 = require("../database/index");
class PostBulk {
    postBulkUsers(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield index_1.User.insertMany(userData);
                console.log("Users posted Scuccessfully");
                return users;
            }
            catch (error) {
                console.log("Error in inserting bulk users", error);
                throw new Error("Error in uploading bulk users");
            }
        });
    }
}
exports.PostBulk = PostBulk;
