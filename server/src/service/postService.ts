// postService.ts
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { User, Organisation, Assessment, Response, beforeAssessment } from "../database/index";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const isOid = (id: string) => mongoose.isValidObjectId(id);
const safeDate = (v?: number) => (typeof v === "number" ? new Date(v) : undefined);
const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v);

function rethrow(e: any, fallbackMsg = "Server error") {
  // Map common Mongo errors
  if (e?.status) throw e;
  if (e?.name === "ValidationError") throw new HttpError(400, e.message);
  if (e?.code === 11000) throw new HttpError(409, "Duplicate resource");
  throw new HttpError(500, e?.message || fallbackMsg);
}

export class PostUser {
  public async postUser(userData: any) {
    try {
      if (!userData?.email || !userData?.username) {
        throw new HttpError(400, "email and username are required");
      }
      const user = await User.create(userData);
      return { user };
    } catch (e) {
      console.error("Error creating user:", e);
      rethrow(e, "Error creating user");
    }
  }
}

export class PostBeforeAssessment {
  public async postBefore(userData: any) {
    try {
      const required = ["name", "designation", "email", "department", "phone"] as const;
      for (const k of required) {
        if (!userData?.[k]) throw new HttpError(400, `Field "${k}" is required`);
      }
      const user = await beforeAssessment.create(userData);
      return { user };
    } catch (e) {
      console.error("Error collecting pre-assessment data:", e);
      rethrow(e, "Error collecting pre-assessment data");
    }
  }
}

export class PostOrganisation {
  public async postOrganisation(orgData: any) {
    try {
      if (!orgData?.organisation) throw new HttpError(400, "organisation is required");
      const organisation = await Organisation.create(orgData);
      return organisation;
    } catch (e) {
      console.error("Error creating organisation:", e);
      rethrow(e, "Error creating organisation");
    }
  }
}

export class PostQuestion {
  public async postQuestion(questionData: any) {
    try {
      const { title, roles, questions } = questionData || {};
      if (!title) throw new HttpError(400, "title is required");
      if (!Array.isArray(roles) || roles.length === 0) {
        throw new HttpError(400, "roles must be a non-empty array");
      }
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new HttpError(400, "questions must be a non-empty array");
      }
      // Optional light validation for question shape
      for (const q of questions) {
        if (!q?.text) throw new HttpError(400, "each question requires text");
        if (!Array.isArray(q?.options) || q.options.length === 0) {
          throw new HttpError(400, "each question requires options");
        }
      }
      const assessment = await Assessment.create(questionData);
      return assessment;
    } catch (e) {
      console.error("Error posting assessment:", e);
      rethrow(e, "Error posting assessment");
    }
  }
}

export class PostResponse {
  public async postResponse(
    assessmentId: string,
    payload: {
      user: {
        name: string;
        email: string;
        designation: string;
        phone: string;
        department: string;
      };
      answers: any;
      startedAt?: number;
      submittedAt?: number;
      location?: { lat: number; lon: number };
    }
  ) {
    try {
      if (!assessmentId) throw new HttpError(400, "assessmentId is required");
      if (!isOid(assessmentId)) throw new HttpError(400, "Invalid assessmentId");
      if (!isObj(payload?.answers)) throw new HttpError(400, "answers must be an object");
      if (!isObj(payload?.user)) throw new HttpError(400, "user is required");

      const newResponse = await Response.create({
        assessmentId,
        answers: payload.answers,
        submittedAt: new Date(payload.submittedAt || Date.now()),
        startedAt: safeDate(payload.startedAt),
        location: payload.location,
        user: payload.user,
      });

      return newResponse;
    } catch (e) {
      console.error("Error saving response:", e);
      rethrow(e, "Failed to save assessment response");
    }
  }
}

export class PostSendAssessment {
  // replace only the sendAssessmentEmail method in your PostSendAssessment class with this
public async sendAssessmentEmail(data: {
  assessmentId: string;
  filterType: "organization" | "role";
  filterValue: string;
}) {
  try {
    const { assessmentId, filterType, filterValue } = data || {};
    console.log("Incoming sendAssessmentEmail data:", data);

    // Input validation
    if (!assessmentId || !filterType || !filterValue) {
      throw new HttpError(400, "assessmentId, filterType and filterValue are required");
    }
    if (!isOid(assessmentId)) throw new HttpError(400, "Invalid assessmentId");
    if (!["organization", "role"].includes(filterType)) {
      throw new HttpError(400, `Unsupported filterType "${filterType}"`);
    }

    // Assessment
    const assessment = await Assessment.findById(assessmentId).lean();
    if (!assessment) throw new HttpError(404, "Assessment not found");

    // helper: escape regex metachars
    const escapeRegExp = (s: string) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Users by filter
    // IMPORTANT FIXES:
    // - role filter should query the 'role' field in DB (not 'designation')
    // - organization (frontend) maps to DB field 'organisation'
    const qryVal = String(filterValue).trim();
    let userQuery: any = {};

    if (filterType === "organization") {
      // frontend sends "organization" but DB field is 'organisation'
      userQuery["organisation"] = { $regex: escapeRegExp(qryVal), $options: "i" };
    } else {
      // role filter: use DB 'role' field and do case-insensitive partial match
      userQuery["role"] = { $regex: escapeRegExp(qryVal), $options: "i" };
    }

    const users = await User.find(userQuery, { email: 1, username: 1 }).lean();
    if (!users || users.length === 0) throw new HttpError(400, "No users found for the selected filter");

    const recipients = users.filter((u) => !!u?.email);
    if (!recipients.length) throw new HttpError(400, "No users with a valid email");

    // Transporter
    const { EMAIL_USER, EMAIL_PASS, APP_PUBLIC_URL } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new HttpError(500, "Email credentials are not configured on the server");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }, // Use a Gmail App Password
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });

    // Fail fast if creds/binding are wrong
    await transporter.verify().catch((e: any) => {
      throw new HttpError(502, `Email service not available: ${e?.message || "verify failed"}`);
    });

    // Link
    const base = (APP_PUBLIC_URL || "https://yourapp.com").replace(/\/+$/, "");
    const assessmentLink = `${base}/${assessmentId}/disclaimer`;

    // Batch send (to avoid provider throttling)
    const chunk = <T,>(arr: T[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const batches = chunk(recipients, 25);
    let sent = 0;
    const failed: { email: string; error: string }[] = [];

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (user) => {
          try {
            await transporter.sendMail({
              from: `"Assessments" <${EMAIL_USER}>`,
              to: user.email as string,
              subject: `New Assessment Assigned: ${assessment.title}`,
              html: `
                <div style="font-family:Arial,sans-serif;padding:15px">
                  <h2 style="color:#800080;margin:0 0 10px">New Assessment Assigned</h2>
                  <p>Hi ${user.username || user.email},</p>
                  <p>You have been assigned <b>"${assessment.title}"</b>.</p>
                  <p>
                    <a href="${assessmentLink}"
                       style="background:#800080;color:#fff;padding:10px 15px;border-radius:6px;text-decoration:none;display:inline-block">
                      Start Assessment
                    </a>
                  </p>
                  <p style="font-size:12px;color:#666">If the button doesn’t work, paste this link:<br>${assessmentLink}</p>
                </div>`,
            });
            sent++;
          } catch (e: any) {
            failed.push({ email: user.email as string, error: e?.message || "sendMail failed" });
          }
        })
      );
    }

    console.log(
      `Send assessment "${assessment.title}" → attempted:${recipients.length} sent:${sent} failed:${failed.length}`
    );

    return {
      ok: true,
      assessmentId,
      filterType,
      filterValue,
      attempted: recipients.length,
      sent,
      failed,
      link: assessmentLink,
    };
  } catch (e) {
    console.error("Error sending assessment emails:", e);
    rethrow(e, "Failed to send assessment emails");
  }
}
}
