"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeAssessment = exports.Response = exports.Assessment = exports.organization = exports.User = exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env
const mongoDB = process.env.MONGO_URI; // Get URI from .env
if (!mongoDB) {
    throw new Error("MONGO_URI is not defined in .env");
}
exports.connection = mongoose_1.default.connect(mongoDB, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
});
// ------------------ Schemas ------------------
const userSchema = new mongoose_1.default.Schema({
    userId: Number,
    username: String,
    email: String,
    password: String,
    iv: { type: String, required: false }, // TODO: make true later
    contact: Number,
    organization: String,
    designation: String,
    location: String,
    currentProject: String,
    accessLevel: { type: Number, required: true },
});
const organizationSchema = new mongoose_1.default.Schema({
    organization: String,
    address: String,
    spoc: String,
    email: String,
    contact: Number,
});
const optionSchema = new mongoose_1.default.Schema({
    text: String,
});
const questionSchema = new mongoose_1.default.Schema({
    text: String,
    options: [optionSchema],
});
const assessmentSchema = new mongoose_1.default.Schema({
    title: String,
    roles: [String],
    questions: [questionSchema],
});
const userStartSchema = new mongoose_1.default.Schema({
    name: String,
    designation: String,
    email: String,
    department: String,
    phone: String,
});
const responseSchema = new mongoose_1.default.Schema({
    assessmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    startedAt: {
        type: Date,
    },
    user: {
        name: String,
        email: String,
        phone: String,
        designation: String,
        department: String,
    },
    location: {
        lat: Number,
        lon: Number,
    },
    answers: {
        type: Map,
        of: new mongoose_1.default.Schema({
            option: String,
            text: String,
        }),
    },
});
// ------------------ Models ------------------
exports.User = mongoose_1.default.model('User', userSchema);
exports.organization = mongoose_1.default.model('organizations', organizationSchema);
exports.Assessment = mongoose_1.default.model('Assessment', assessmentSchema);
exports.Response = mongoose_1.default.model('Responses', responseSchema);
exports.beforeAssessment = mongoose_1.default.model('BeforeAssessment', userStartSchema);
