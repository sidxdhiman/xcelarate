import { Request, Response } from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

// --- ADDED IMPORT ---
import { Assessment, Response as AssessmentResponse, User } from "../database"; // Assuming User model is also available here
// (Your other service imports)
import {
  PostQuestion,
  PostResponse,
  PostReminder,
  ParseBulkQuestions,
} from "../service/postService"; // ADDED PostReminder
import {
  GetAssessment,
  GetAssessmentById,
  GetResponseByAssessmentId,
} from "../service/getService";
import { PatchAssessmentService } from "../service/patchService";
import { DeleteService } from "../service/deleteService";
import { PostSendAssessment } from "../service/postService";

// --- DUMMY USER SERVICE FOR ASSESSMENT PROGRESS CALCULATION ---
// This acts as a stand-in for the logic that determines who received the assessment link.
// It tries to find users based on the roles listed in the assessment itself, as a fallback.
class UserService {
  public static async getAssignedUsersForAssessment(assessmentId: string) {
    try {
      const assessment = await Assessment.findById(assessmentId, { roles: 1 });
      const roles = assessment?.roles || [];

      if (roles.length === 0) {
        // If no roles are set, return all users for simplicity or throw an error based on business rules
        return await User.find({}).lean().exec();
      }

      // Find users whose role matches any of the assessment's assigned roles
      const assignedUsers = await User.find({
        role: { $in: roles },
      })
        .lean()
        .exec();

      return assignedUsers;
    } catch (e) {
      console.error("Error fetching assigned users:", e);
      // Return an empty array on failure to avoid crashing the progress endpoint
      return [];
    }
  }
}
// ----------------------------------------

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

  // -------------------- BULK UPLOAD QUESTIONS (NEW) --------------------
  public static async parseBulkQuestions(req: Request, res: Response) {
    try {
      // 'file' comes from multer middleware
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const parser = new ParseBulkQuestions();
      const result = await parser.parseExcel(req.file.buffer);

      res.status(200).json(result);
    } catch (error) {
      console.error("Bulk parse error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // -------------------- GET ALL (ACTIVE) ASSESSMENTS --------------------

  public static async getAssessmentFunction(req: Request, res: Response) {
    try {
      // This now only finds assessments that are active.
      const assessmentData = await Assessment.find({
        isActive: { $ne: false },
      }).sort({ _id: -1 });
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res.status(404).json({ message: "Error in fetching assessments" });
      }
    } catch (error) {
      console.error("[getAssessmentFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- GET ASSESSMENT BY ID --------------------

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
  } // -------------------- SUBMIT RESPONSE --------------------

  public static async submitResponse(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const { answers, user, startedAt, submittedAt, location } = req.body;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment Id" });
      }

      if (
        !answers ||
        typeof answers !== "object" ||
        !user ||
        typeof user !== "object"
      ) {
        return res
          .status(400)
          .json({ message: "Answers and user details are required" });
      }

      const saved = await new PostResponse().postResponse(assessmentId, {
        answers,
        user,
        startedAt,
        submittedAt,
        location,
      });

      res
        .status(201)
        .json({ message: "Response submitted successfully", saved });
    } catch (error) {
      console.error("[submitResponse] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- GET RESPONSES BY ASSESSMENT ID --------------------

  public static async getResponseById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const responseData =
        await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!responseData || responseData.length === 0) {
        return res
          .status(404)
          .json({ message: "No response found for this assessment" });
      }

      res.status(200).json(responseData);
    } catch (error) {
      console.error("[getResponseById] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- UPDATE ASSESSMENT --------------------

  public static async patchAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const updatedAssessment =
        await new PatchAssessmentService().patchAssessmentById(
          assessmentId,
          updateData,
        );

      res.status(200).json({
        message: "Assessment updated successfully",
        updatedAssessment,
      });
    } catch (error) {
      console.error("[patchAssessmentByIdFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- DOWNLOAD PDF --------------------

  public static async getAssessmentPdf(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const assessment = await new GetAssessmentById().getAssessmentbyId(id);
      const responses =
        await new GetResponseByAssessmentId().getResponseByAssessmentId(id);

      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      } // Create PDF

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=assessment_${id}.pdf`,
      );

      doc.pipe(res); // Title

      doc
        .fontSize(20)
        .text("Assessment Report", { align: "center" })
        .moveDown();
      doc.fontSize(14).text(`Assessment: ${assessment.title || "Untitled"}`);
      doc.moveDown(); // Questions

      if (assessment.questions && assessment.questions.length > 0) {
        doc.fontSize(16).text("Questions:", { underline: true }).moveDown(0.5);

        assessment.questions.forEach((q: any, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${q.text}`);
        });
        doc.moveDown();
      } // Responses

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
              doc.text(`   Q${qId}: ${ans}`);
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
  } // -------------------- SEND ASSESSMENT --------------------
  // (This is your existing function - now included only once)
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
  } // -------------------- DEACTIVATE ASSESSMENT (Soft Delete) --------------------

  public static async deactivateAssessment(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const deactivated = await Assessment.findByIdAndUpdate(
        assessmentId,
        { isActive: false },
        { new: true },
      );

      if (!deactivated) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      res
        .status(200)
        .json({ message: "Assessment deactivated successfully", deactivated });
    } catch (error) {
      console.error("[deactivateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- GET DEACTIVATED ASSESSMENTS --------------------

  public static async getDeactivatedAssessments(req: Request, res: Response) {
    try {
      const assessmentData = await Assessment.find({ isActive: false }).sort({
        _id: -1,
      });
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res
          .status(404)
          .json({ message: "Error in fetching deactivated assessments" });
      }
    } catch (error) {
      console.error("[getDeactivatedAssessments] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- ACTIVATE ASSESSMENT --------------------

  public static async activateAssessment(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      const activated = await Assessment.findByIdAndUpdate(
        assessmentId,
        { isActive: true },
        { new: true },
      );

      if (!activated) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      res
        .status(200)
        .json({ message: "Assessment activated successfully", activated });
    } catch (error) {
      console.error("[activateAssessment] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } // -------------------- NEW: GET ASSESSMENT PROGRESS --------------------
  // Route: GET /assessments/:id/progress

  public static async getAssessmentProgress(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      } // 1. Get Assessment Title (for the frontend display)

      const assessment = await Assessment.findById(assessmentId, { title: 1 });
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      } // 2. Get all completed responses
      // Find submission records where submittedAt is set (meaning completion)

      const completedResponses: any = await AssessmentResponse.find(
        {
          assessmentId: new mongoose.Types.ObjectId(assessmentId),
          submittedAt: { $exists: true, $ne: null },
        },
        { user: 1, submittedAt: 1, _id: 1 },
      );

      const completedUsers = completedResponses.map((r: any) => ({
        _id: r._id.toString(),
        name: r.user?.name || "N/A",
        email: r.user?.email || "N/A",
        designation: r.user?.designation || "N/A",
        submittedAt: r.submittedAt,
      }));

      const completedUserEmails = new Set(
        completedResponses.map((r: any) => r.user?.email),
      ); // 3. Get all assigned users
      // 🚨 IMPORTANT: Replace UserService.getAssignedUsersForAssessment with your actual database call

      const assignedUsers: any =
        await UserService.getAssignedUsersForAssessment(assessmentId);

      const assignedCount = assignedUsers.length;
      const completedCount = completedResponses.length; // 4. Determine pending users

      const pendingUsers = assignedUsers
        .filter(
          (assignedUser: any) => !completedUserEmails.has(assignedUser.email),
        )
        .map((user: any) => ({
          _id: user._id.toString(),
          name: user.name || "N/A",
          email: user.email || "N/A",
          designation: user.designation || "N/A",
        }));

      const result = {
        _id: assessmentId,
        title: assessment.title,
        assignedCount: assignedCount,
        completedCount: completedCount,
        completedUsers: completedUsers,
        pendingUsers: pendingUsers,
      };

      res.status(200).json(result);
    } catch (error) {
      console.error("[getAssessmentProgress] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // -------------------- NEW: SEND REMINDER (For pending users) --------------------
  // Route: POST /assessments/:id/reminders
  public static async sendReminder(req: Request, res: Response) {
    try {
      const assessmentId = req.params.id;
      const { userIds } = req.body; // Array of user IDs

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        return res.status(400).json({ message: "Invalid Assessment ID" });
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json({ message: "User IDs (userIds array) required for reminder." });
      }

      // 🚨 Use the new PostReminder service class
      const reminderService = new PostReminder();
      const reminderResult = await reminderService.sendReminderToUsers(
        assessmentId,
        userIds,
      );

      // --- FIX APPLIED HERE: Check if reminderResult is truthy before accessing properties ---
      if (!reminderResult || typeof reminderResult.userCount !== "number") {
        // If the service returns a result that is not the expected object, treat it as an internal error.
        return res
          .status(500)
          .json({ message: "Reminder service returned invalid data." });
      }

      // Access properties safely after the check
      res.status(200).json({
        message: `Reminder successfully queued for ${reminderResult.userCount} users.`,
        details: reminderResult,
      });
    } catch (error: any) {
      console.error("[sendReminder] Error:", error);
      const status = error?.status || 500;
      res
        .status(status)
        .json({ message: error.message || "Failed to send reminders" });
    }
  }
}
