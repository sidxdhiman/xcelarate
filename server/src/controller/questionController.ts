import { Request, Response } from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import * as fs from "fs";

import {
  Assessment,
  Response as AssessmentResponse,
  User,
  UserAssessment,
} from "../database";

import {
  PostQuestion,
  PostResponse,
  PostReminder,
  ParseBulkQuestions,
  PostSendAssessment,
} from "../service/postService";

import {
  GetAssessmentById,
  GetResponseByAssessmentId,
} from "../service/getService";

import { PatchAssessmentService } from "../service/patchService";

import { DeleteService } from "../service/deleteService";

// ------------------------------------------------------------
// USER SERVICE FOR PROGRESS CALCULATION
// ------------------------------------------------------------
class UserService {
  public static async getAssignedUsersForAssessment(assessmentId: string) {
    try {
      const assessment = await Assessment.findById(assessmentId, { roles: 1 });
      const roles = assessment?.roles || [];

      if (roles.length === 0) {
        return await User.find({}).lean().exec();
      }

      return await User.find({ role: { $in: roles } })
        .lean()
        .exec();
    } catch (e) {
      console.error("Error fetching assigned users:", e);
      return [];
    }
  }
}

// ------------------------------------------------------------
// CONTROLLER CLASS
// ------------------------------------------------------------
export class questionController {
  // -------------------- CREATE QUESTION --------------------
  public static async postQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;
      const question = await new PostQuestion().postQuestion(questionData);

      if (!question)
        return res.status(404).json({ message: "Question not posted" });

      res.status(200).json({ success: true, id: question._id });
    } catch (error) {
      console.error("[postQuestion] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- BULK UPLOAD QUESTIONS --------------------
  public static async parseBulkQuestions(req: Request, res: Response) {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      let fileBuffer: Buffer;

      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path) {
        fileBuffer = fs.readFileSync(req.file.path);
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      } else {
        throw new Error("File buffer and path missing.");
      }

      const parser = new ParseBulkQuestions();
      const result = await parser.parseExcel(fileBuffer);

      res.status(200).json(result);
    } catch (error) {
      console.error("[BulkUpload] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ACTIVE ASSESSMENTS --------------------
  public static async getAssessmentFunction(req: Request, res: Response) {
    try {
      const data = await Assessment.find({ isActive: { $ne: false } }).sort({
        _id: -1,
      });
      res.status(200).json(data);
    } catch (error) {
      console.error("[getAssessmentFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ASSESSMENT BY ID --------------------
  public static async getAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const result = await new GetAssessmentById().getAssessmentbyId(id);
      if (!result)
        return res.status(404).json({ message: "Assessment not found" });

      res.status(200).json(result);
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

      if (!mongoose.Types.ObjectId.isValid(assessmentId))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      // Save response
        const saved = await new PostResponse().postResponse(assessmentId, {
            answers,
            user: user, // <--- Saves { name, email, organization, location... }
            startedAt,
            submittedAt,
            location,
        });

      // Update user assessment progress
      const submittingUser = await User.findOne({ email: user.email });

      if (submittingUser) {
        await UserAssessment.findOneAndUpdate(
          { assessmentId, userId: submittingUser._id },
          { status: "completed", completedAt: new Date() },
          { upsert: true },
        );
      }

      return res
        .status(201)
        .json({ message: "Response submitted successfully", saved });
    } catch (error) {
      console.error("[submitResponse] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET RESPONSES --------------------
  public static async getResponseById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const data =
        await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!data || data.length === 0)
        return res.status(404).json({ message: "No responses found" });

      res.status(200).json(data);
    } catch (error) {
      console.error("[getResponseById] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- UPDATE ASSESSMENT --------------------
  public static async patchAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const updated = await new PatchAssessmentService().patchAssessmentById(
        id,
        req.body,
      );

      res.status(200).json({
        message: "Assessment updated successfully",
        updatedAssessment: updated,
      });
    } catch (error) {
      console.error("[patchAssessmentByIdFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- DOWNLOAD PDF (VERSION A) --------------------
  public static async getAssessmentPdf(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const assessment = await new GetAssessmentById().getAssessmentbyId(id);
      const responses =
        await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!assessment)
        return res.status(404).json({ message: "Assessment not found" });

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=assessment_${id}.pdf`,
      );
      doc.pipe(res);

      doc
        .fontSize(20)
        .text("Assessment Report", { align: "center" })
        .moveDown();
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
          if (resp.submittedAt)
            doc.text(
              `- Submitted At: ${new Date(resp.submittedAt).toLocaleString()}`,
            );

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

  // -------------------- SEND ASSESSMENT EMAILS --------------------
  public static async sendAssessment(req: Request, res: Response) {
    try {
      const { assessmentId, filterType, filterValue } = req.body;

      const sender = new PostSendAssessment();
      const result = await sender.sendAssessmentEmail({
        assessmentId,
        filterType,
        filterValue,
      });

      res.status(200).json({
        message: "Assessment emails sent successfully",
        details: result,
      });
    } catch (error: any) {
      console.error("[sendAssessment] Error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to send assessment emails" });
    }
  }

  // -------------------- DEACTIVATE ASSESSMENT (ORIGINAL) --------------------
  public static async deactivateAssessment(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const deactivated = await Assessment.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true },
      );

      if (!deactivated)
        return res.status(404).json({ message: "Assessment not found" });

      res
        .status(200)
        .json({ message: "Assessment deactivated successfully", deactivated });
    } catch (error) {
      console.error("[deactivateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- ACTIVATE ASSESSMENT --------------------
  public static async activateAssessment(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const activated = await Assessment.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true },
      );

      if (!activated)
        return res.status(404).json({ message: "Assessment not found" });

      res
        .status(200)
        .json({ message: "Assessment activated successfully", activated });
    } catch (error) {
      console.error("[activateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ASSESSMENT PROGRESS --------------------
  public static async getAssessmentProgress(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      const assessment = await Assessment.findById(assessmentId, {
        title: 1,
      });

      if (!assessment)
        return res.status(404).json({ message: "Assessment not found" });

      const completedResponses = await AssessmentResponse.find(
        {
          assessmentId: new mongoose.Types.ObjectId(assessmentId),
          submittedAt: { $exists: true, $ne: null },
        },
        { user: 1, submittedAt: 1 },
      );

      const completedUserEmails = new Set(
        completedResponses.map((r: any) => r.user?.email),
      );

      const completedUsers = completedResponses.map((r: any) => ({
        name: r.user?.name || "N/A",
        email: r.user?.email || "N/A",
        designation: r.user?.designation || "N/A",
        submittedAt: r.submittedAt,
      }));

      const assignedUsers =
        await UserService.getAssignedUsersForAssessment(assessmentId);

      const pendingUsers = assignedUsers
        .filter((u: any) => !completedUserEmails.has(u.email))
        .map((u: any) => ({
          _id: u._id.toString(),
          name: u.name || "N/A",
          email: u.email || "N/A",
          designation: u.designation || "N/A",
        }));

      res.status(200).json({
        _id: assessmentId,
        title: assessment.title,
        assignedCount: assignedUsers.length,
        completedCount: completedUsers.length,
        completedUsers,
        pendingUsers,
      });
    } catch (error) {
      console.error("[getAssessmentProgress] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getDeactivatedAssessments(req: Request, res: Response) {
    try {
      const assessments = await Assessment.find({ isActive: false }).sort({
        _id: -1,
      });
      res.status(200).json(assessments);
    } catch (error) {
      console.error("[getDeactivatedAssessments] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- SEND REMINDER --------------------
  public static async sendReminder(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const { userIds } = req.body;

      if (!mongoose.Types.ObjectId.isValid(assessmentId))
        return res.status(400).json({ message: "Invalid Assessment ID" });

      if (!Array.isArray(userIds) || userIds.length === 0)
        return res.status(400).json({ message: "userIds array required" });

      const reminder = new PostReminder();
      const result = await reminder.sendReminderToUsers(assessmentId, userIds);

      if (!result || typeof result.userCount !== "number") {
        return res.status(500).json({
          message: "Reminder service returned invalid data.",
        });
      }

      res.status(200).json({
        message: `Reminder queued for ${result.userCount} users.`,
        details: result,
      });
    } catch (error: any) {
      console.error("[sendReminder] Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}
