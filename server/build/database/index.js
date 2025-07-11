"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeAssessment = exports.Response = exports.Assessment = exports.Organisation = exports.User = exports.connection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoDB = "mongodb+srv://xcelarate:vS6aQk4CE9FlUDUi@cluster0.2xdekrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    accessLevel: { type: Number, required: true },
});
const organisationSchema = new mongoose_1.default.Schema({
    organisation: String,
    address: String,
    spoc: String,
    email: String,
    contact: Number
});
const optionSchema = new mongoose_1.default.Schema({
    text: String,
});
const questionSchema = new mongoose_1.default.Schema({
    text: String,
    options: [optionSchema]
});
const assessmentSchema = new mongoose_1.default.Schema({
    title: String,
    roles: [String],
    questions: [questionSchema]
});
const userStartSchema = new mongoose_1.default.Schema({
    name: String,
    designation: String,
    email: String,
    department: String,
    phone: String
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
const Assessment = mongoose_1.default.model("Assessment", assessmentSchema);
exports.Assessment = Assessment;
const Organisation = mongoose_1.default.model("Organisations", organisationSchema);
exports.Organisation = Organisation;
const Response = mongoose_1.default.model("Responses", responseSchema);
exports.Response = Response;
const beforeAssessment = mongoose_1.default.model("BeforeAssessment", userStartSchema);
exports.beforeAssessment = beforeAssessment;
// const User = mongoose.model("Users", userSchema);
exports.User = mongoose_1.default.model('User', userSchema);
