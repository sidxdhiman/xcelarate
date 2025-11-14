import { Request, Response } from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

// --- ADDED IMPORT ---
import { Assessment } from "../database"; // Import your model

// (Your other service imports)
import { PostQuestion, PostResponse } from "../service/postService";
import { GetAssessment, GetAssessmentById, GetResponseByAssessmentId } from "../service/getService";
import { PatchAssessmentService } from "../service/patchService";
import { DeleteService } from "../service/deleteService";
import { PostSendAssessment } from "../service/postService";

export class questionController {
  
  // -------------------- CREATE ASSESSMENT --------------------
  public static async postQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;
      console.log("Incoming question data:", questionData);

      const question = await new PostQuestion().postQuestion(questionData);
      if (question) {
        res.status(200).json({ success: true, id: question._id });
      } else {
        res.status(404).json({ message: "Question not posted" });
      }
    } catch (error) {
      console.error("[postQuestion] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ALL (ACTIVE) ASSESSMENTS --------------------
  public static async getAssessmentFunction(req: Request, res: Response) {
  try {
    // This now only finds assessments that are active.
    const assessmentData = await Assessment.find({ isActive: { $ne: false } }).sort({ _id: -1 });
      
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res.status(404).json({ message: "Error in fetching assessments" });
      }
    } catch (error) {
      console.error("[getAssessmentFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ASSESSMENT BY ID --------------------
  public static async getAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const Id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(Id)) {
        return res.status(400).json({ message: "Invalid Assessment Id" });
      }

      const result = await new GetAssessmentById().getAssessmentbyId(Id);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Assessment not found" });
      }
    } catch (error) {
      console.error("[getAssessmentByIdFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- SUBMIT RESPONSE --------------------
  public static async submitResponse(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const { answers, user, startedAt, submittedAt, location } = req.body;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment Id" });
      }

      if (!answers || typeof answers !== "object" || !user || typeof user !== "object") {
        return res.status(400).json({ message: "Answers and user details are required" });
      }

      const saved = await new PostResponse().postResponse(assessmentId, {
        answers,
        user,
        startedAt,
        submittedAt,
        location,
      });

      res.status(201).json({ message: "Response submitted successfully", saved });
    } catch (error) {
      console.error("[submitResponse] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET RESPONSES BY ASSESSMENT ID --------------------
  public static async getResponseById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const responseData = await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!responseData || responseData.length === 0) {
        return res.status(404).json({ message: "No response found for this assessment" });
      }

      res.status(200).json(responseData);
    } catch (error) {
      console.error("[getResponseById] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- UPDATE ASSESSMENT --------------------
  public static async patchAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const updatedAssessment = await new PatchAssessmentService().patchAssessmentById(
          assessmentId,
          updateData
      );

      res.status(200).json({ message: "Assessment updated successfully", updatedAssessment });
    } catch (error) {
      console.error("[patchAssessmentByIdFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- DOWNLOAD PDF --------------------
  public static async getAssessmentPdf(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const assessment = await new GetAssessmentById().getAssessmentbyId(id);
      const responses = await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Create PDF
      const doc = new PDFDocument();
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

        assessment.questions.forEach((q: any, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${q.text}`);
        });
        doc.moveDown();
      }

      // Responses
      if (responses && responses.length > 0) {
        doc.fontSize(16).text("Responses:", { underline: true }).moveDown(0.5);

        responses.forEach((resp: any, idx: number) => {
          doc.fontSize(12).text(`Response ${idx + 1}:`);
          if (resp.user?.name) doc.text(`- User: ${resp.user.name}`);
          if (resp.submittedAt) doc.text(`- Submitted At: ${new Date(resp.submittedAt).toLocaleString()}`);

          if (resp.answers) {
            Object.entries(resp.answers).forEach(([qId, ans]) => {
              doc.text(`   Q${qId}: ${ans}`);
            });
          }
          doc.moveDown();
        });
      } else {
        doc.text("No responses submitted yet.");
      }

      doc.end();
    } catch (error) {
      console.error("[getAssessmentPdf] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- SEND ASSESSMENT --------------------
  // (This is your existing function - now included only once)
  public static async sendAssessment(req: Request, res: Response) {
      try {
          const { assessmentId, filterType, filterValue } = req.body;

          const sender = new PostSendAssessment();
          const result = await sender.sendAssessmentEmail({ assessmentId, filterType, filterValue });

          res.status(200).json({
              message: "Assessment emails sent successfully",
              details: result,
          });
      } catch (error: any) {
          console.error("[sendAssessment] Error:", error);
          res.status(500).json({ message: error.message || "Failed to send assessment emails" });
      }
  }

  // --- NEW & MODIFIED FUNCTIONS ---

  // -------------------- DEACTIVATE ASSESSMENT (Soft Delete) --------------------
  public static async deactivateAssessment(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const deactivated = await Assessment.findByIdAndUpdate(
        assessmentId,
        { isActive: false },
        { new: true }
      );

      if (!deactivated) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      res.status(200).json({ message: "Assessment deactivated successfully", deactivated });
    } catch (error) {
      console.error("[deactivateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET DEACTIVATED ASSESSMENTS --------------------
  public static async getDeactivatedAssessments(req: Request, res: Response) {
    try {
      const assessmentData = await Assessment.find({ isActive: false }).sort({ _id: -1 });
      
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res.status(404).json({ message: "Error in fetching deactivated assessments" });
      }
    } catch (error) {
      console.error("[getDeactivatedAssessments] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- ACTIVATE ASSESSMENT --------------------
  public static async activateAssessment(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const activated = await Assessment.findByIdAndUpdate(
        assessmentId,
        { isActive: true },
        { new: true }
      );

      if (!activated) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      res.status(200).json({ message: "Assessment activated successfully", activated });
    } catch (error) {
      console.error("[activateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}