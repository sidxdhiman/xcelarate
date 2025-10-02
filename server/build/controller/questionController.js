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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const postService_1 = require("../service/postService");
const getService_1 = require("../service/getService");
const patchService_1 = require("../service/patchService");
const deleteService_1 = require("../service/deleteService");
class questionController {
    // -------------------- CREATE ASSESSMENT --------------------
    static postQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questionData = req.body;
                console.log("Incoming question data:", questionData);
                const question = yield new postService_1.PostQuestion().postQuestion(questionData);
                if (question) {
                    res.status(200).json({ success: true, id: question._id });
                }
                else {
                    res.status(404).json({ message: "Question not posted" });
                }
            }
            catch (error) {
                console.error("[postQuestion] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- GET ALL ASSESSMENTS --------------------
    static getAssessmentFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentData = yield new getService_1.GetAssessment().getAssessment();
                if (assessmentData) {
                    res.status(200).json(assessmentData);
                }
                else {
                    res.status(404).json({ message: "Error in fetching assessments" });
                }
            }
            catch (error) {
                console.error("[getAssessmentFunction] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- GET ASSESSMENT BY ID --------------------
    static getAssessmentByIdFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Id = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(Id)) {
                    return res.status(400).json({ message: "Invalid Assessment Id" });
                }
                const result = yield new getService_1.GetAssessmentById().getAssessmentbyId(Id);
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).json({ message: "Assessment not found" });
                }
            }
            catch (error) {
                console.error("[getAssessmentByIdFunction] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- SUBMIT RESPONSE --------------------
    static submitResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.id;
                const { answers, user, startedAt, submittedAt, location } = req.body;
                if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
                    return res.status(400).json({ message: "Invalid Assessment Id" });
                }
                if (!answers || typeof answers !== "object" || !user || typeof user !== "object") {
                    return res.status(400).json({ message: "Answers and user details are required" });
                }
                const saved = yield new postService_1.PostResponse().postResponse(assessmentId, {
                    answers,
                    user,
                    startedAt,
                    submittedAt,
                    location,
                });
                res.status(201).json({ message: "Response submitted successfully", saved });
            }
            catch (error) {
                console.error("[submitResponse] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- GET RESPONSES BY ASSESSMENT ID --------------------
    static getResponseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid Assessment ID" });
                }
                const responseData = yield new getService_1.GetResponseByAssessmentId().getResponseByAssessmentId(id);
                if (!responseData || responseData.length === 0) {
                    return res.status(404).json({ message: "No response found for this assessment" });
                }
                res.status(200).json(responseData);
            }
            catch (error) {
                console.error("[getResponseById] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- UPDATE ASSESSMENT --------------------
    static patchAssessmentByIdFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.id;
                const updateData = req.body;
                if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
                    return res.status(400).json({ message: "Invalid Assessment ID" });
                }
                const updatedAssessment = yield new patchService_1.PatchAssessmentService().patchAssessmentById(assessmentId, updateData);
                res.status(200).json({ message: "Assessment updated successfully", updatedAssessment });
            }
            catch (error) {
                console.error("[patchAssessmentByIdFunction] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- DELETE ASSESSMENT --------------------
    static deleteAssessmentByIdFunction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
                    return res.status(400).json({ message: "Invalid Assessment ID" });
                }
                const deleted = yield new deleteService_1.DeleteService().deleteAssessmentById(assessmentId);
                if (!deleted) {
                    return res.status(404).json({ message: "Assessment not found" });
                }
                res.status(200).json({ message: "Assessment deleted successfully", deleted });
            }
            catch (error) {
                console.error("[deleteAssessmentByIdFunction] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // -------------------- DOWNLOAD PDF --------------------
    static getAssessmentPdf(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ message: "Invalid Assessment ID" });
                }
                const assessment = yield new getService_1.GetAssessmentById().getAssessmentbyId(id);
                const responses = yield new getService_1.GetResponseByAssessmentId().getResponseByAssessmentId(id);
                if (!assessment) {
                    return res.status(404).json({ message: "Assessment not found" });
                }
                // Create PDF
                const doc = new pdfkit_1.default();
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=assessment_${id}.pdf`);
                doc.pipe(res);
                // Title
                doc.fontSize(20).text("Assessment Report", { align: "center" }).moveDown();
                doc.fontSize(14).text(`Assessment: ${assessment.title || "Untitled"}`);
                doc.moveDown();
                // Questions
                if (assessment.questions && assessment.questions.length > 0) {
                    doc.fontSize(16).text("Questions:", { underline: true }).moveDown(0.5);
                    assessment.questions.forEach((q, index) => {
                        doc.fontSize(12).text(`${index + 1}. ${q.text}`);
                    });
                    doc.moveDown();
                }
                // Responses
                if (responses && responses.length > 0) {
                    doc.fontSize(16).text("Responses:", { underline: true }).moveDown(0.5);
                    responses.forEach((resp, idx) => {
                        var _a;
                        doc.fontSize(12).text(`Response ${idx + 1}:`);
                        if ((_a = resp.user) === null || _a === void 0 ? void 0 : _a.name)
                            doc.text(`- User: ${resp.user.name}`);
                        if (resp.submittedAt)
                            doc.text(`- Submitted At: ${new Date(resp.submittedAt).toLocaleString()}`);
                        if (resp.answers) {
                            Object.entries(resp.answers).forEach(([qId, ans]) => {
                                doc.text(`   Q${qId}: ${ans}`);
                            });
                        }
                        doc.moveDown();
                    });
                }
                else {
                    doc.text("No responses submitted yet.");
                }
                doc.end();
            }
            catch (error) {
                console.error("[getAssessmentPdf] Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.questionController = questionController;
