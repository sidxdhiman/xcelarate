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
exports.RequestValidator = void 0;
const Joi = require("@hapi/joi");
const index_1 = require("../database/index");
const index_2 = require("../database/index");
class RequestValidator {
    static patchUser(req, res, next) {
        const schema = Joi.object({
            userId: Joi.number(),
            name: Joi.string(),
            password: Joi.string(),
            email: Joi.string()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        next();
    }
    static postUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = Joi.object({
                name: Joi.string().required(),
                password: Joi.string(),
                //TODO: put required in password, or make another public static for posting user differently (both signup and post user is using this)
                email: Joi.string().lowercase().pattern(/@xebia\.com$/).required(),
                contact: Joi.required(),
                organisation: Joi.string().required(),
                designation: Joi.string().required(),
                location: Joi.string(), //TODO make the location required
                currentProject: Joi.string(), //TODO maybe add required maybe not - have to confirm    
                accessLevel: Joi.required(),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            try {
                const existingUser = yield index_1.User.findOne({ email: req.body.email });
                if (existingUser) {
                    return res.status(400).send("Email already in use");
                }
            }
            catch (err) {
                return res.status(500).send("Database error while checking email");
            }
            next();
        });
    }
    static postOrganisation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = Joi.object({
                organisation: Joi.string().required(),
                address: Joi.string().required(),
                spoc: Joi.string().required(),
                email: Joi.string().lowercase().required(),
                contact: Joi.string().required()
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            try {
                const existingOrganisation = yield index_2.Organisation.findOne({ organisation: req.body.organisation });
                if (existingOrganisation) {
                    return res.status(400).send("Organisation already registered");
                }
            }
            catch (err) {
                return res.status(500).send("Database error while checking email");
            }
            next();
        });
    }
}
exports.RequestValidator = RequestValidator;
