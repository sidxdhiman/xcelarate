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
exports.orgController = void 0;
// import { PostService } from "../service/postService";
const { PostOrganization } = require("../service/postService");
const { GetOrganization } = require("../service/getService");
class orgController {
    static postOrg(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orgData = req.body;
                const organization = yield new PostOrganization().postOrganization(orgData);
                if (organization) {
                    res.json(organization);
                }
                else {
                    res.status(404).json({ message: "Organization not posted" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static getOrg(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizations = yield new GetOrganization().getOrganizations();
                if (organizations) {
                    res.json(organizations);
                }
                else {
                    res.status(404).json({ message: "Organizations not found!" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server error!-GET" });
            }
        });
    }
}
exports.orgController = orgController;
