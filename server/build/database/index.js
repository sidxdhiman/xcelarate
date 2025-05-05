"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organisation = exports.User = exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoDB = "mongodb://localhost:27017/xcelarate-backend";
exports.connection = mongoose_1.default.connect(mongoDB, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
});
const userSchema = new mongoose_1.default.Schema({
    userId: Number,
    username: String,
    email: String,
    password: String,
    iv: { type: String, required: false }, //TODO: has to be set true but for the time being is set to false
    contact: Number,
    organisation: String,
    designation: String,
    location: String,
    currentProject: String,
    accessLevel: Number,
});
const organisationSchema = new mongoose_1.default.Schema({
    organisation: String,
    address: String,
    spoc: String,
    email: String,
    contact: Number
});
const Organisation = mongoose_1.default.model("Organisations", organisationSchema);
exports.Organisation = Organisation;
const User = mongoose_1.default.model("Users", userSchema);
exports.User = User;
