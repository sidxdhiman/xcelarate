// import mongoose from "mongoose";
// import { sendMail } from "../utils/mailer";
//
// import nodemailer from "nodemailer";
// import {
//   User,
//   Organization,
//   Assessment,
//   Response,
//   beforeAssessment,
// } from "../database/index";
//
// class HttpError extends Error {
//   status: number;
//   constructor(status: number, message: string) {
//     super(message);
//     this.status = status;
//   }
// }
// const isOid = (id: string) => mongoose.isValidObjectId(id);
// const safeDate = (v?: number) =>
//   typeof v === "number" ? new Date(v) : undefined;
// const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v);
//
// function rethrow(e: any, fallbackMsg = "Server error") {
//   // Map common Mongo errors
//   if (e?.status) throw e;
//   if (e?.name === "ValidationError") throw new HttpError(400, e.message);
//   if (e?.code === 11000) throw new HttpError(409, "Duplicate resource");
//   throw new HttpError(500, e?.message || fallbackMsg);
// }
//
// export class PostUser {
//   public async postUser(userData: any) {
//     try {
//       if (!userData?.email || !userData?.username) {
//         throw new HttpError(400, "email and username are required");
//       }
//       const user = await User.create(userData);
//       return { user };
//     } catch (e) {
//       console.error("Error creating user:", e);
//       rethrow(e, "Error creating user");
//     }
//   }
// }
//
// export class PostBeforeAssessment {
//   public async postBefore(userData: any) {
//     try {
//       const required = [
//         "name",
//         "designation",
//         "email",
//         "department",
//         "phone",
//       ] as const;
//       for (const k of required) {
//         if (!userData?.[k])
//           throw new HttpError(400, `Field "${k}" is required`);
//       }
//       const user = await beforeAssessment.create(userData);
//       return { user };
//     } catch (e) {
//       console.error("Error collecting pre-assessment data:", e);
//       rethrow(e, "Error collecting pre-assessment data");
//     }
//   }
// }
//
// export class PostOrganization {
//   public async postOrganization(orgData: any) {
//     try {
//       if (!orgData?.organization)
//         throw new HttpError(400, "organization is required");
//       const organization = await Organization.create(orgData);
//       return organization;
//     } catch (e) {
//       console.error("Error creating organization:", e);
//       rethrow(e, "Error creating organization");
//     }
//   }
// }
//
// export class PostQuestion {
//   public async postQuestion(questionData: any) {
//     try {
//       const { title, roles, questions } = questionData || {};
//       if (!title) throw new HttpError(400, "title is required");
//       if (!Array.isArray(roles) || roles.length === 0) {
//         throw new HttpError(400, "roles must be a non-empty array");
//       }
//       if (!Array.isArray(questions) || questions.length === 0) {
//         throw new HttpError(400, "questions must be a non-empty array");
//       } // Optional light validation for question shape
//       for (const q of questions) {
//         if (!q?.text) throw new HttpError(400, "each question requires text");
//         if (!Array.isArray(q?.options) || q.options.length === 0) {
//           throw new HttpError(400, "each question requires options");
//         }
//       }
//       const assessment = await Assessment.create(questionData);
//       return assessment;
//     } catch (e) {
//       console.error("Error posting assessment:", e);
//       rethrow(e, "Error posting assessment");
//     }
//   }
// }
//
// export class PostResponse {
//   public async postResponse(
//     assessmentId: string,
//     payload: {
//       user: {
//         name: string;
//         email: string;
//         designation: string;
//         phone: string;
//         department: string;
//       };
//       answers: any;
//       startedAt?: number;
//       submittedAt?: number;
//       location?: { lat: number; lon: number };
//     },
//   ) {
//     try {
//       if (!assessmentId) throw new HttpError(400, "assessmentId is required");
//       if (!isOid(assessmentId))
//         throw new HttpError(400, "Invalid assessmentId");
//       if (!isObj(payload?.answers))
//         throw new HttpError(400, "answers must be an object");
//       if (!isObj(payload?.user)) throw new HttpError(400, "user is required");
//
//       const newResponse = await Response.create({
//         assessmentId,
//         answers: payload.answers,
//         submittedAt: new Date(payload.submittedAt || Date.now()),
//         startedAt: safeDate(payload.startedAt),
//         location: payload.location,
//         user: payload.user,
//       });
//
//       return newResponse;
//     } catch (e) {
//       console.error("Error saving response:", e);
//       rethrow(e, "Failed to save assessment response");
//     }
//   }
// }
//
// export class PostSendAssessment {
//   // inside PostSendAssessment class (replace the existing validation & query part)
//   public async sendAssessmentEmail(payload: any) {
//     try {
//       // original payload may contain filterValue (string) or filterValues (array)
//       const { assessmentId, filterType, filterValue, filterValues } =
//         payload || {}; // Normalize to array of strings
//
//       const values: string[] =
//         Array.isArray(filterValues) && filterValues.length
//           ? filterValues.map(String)
//           : filterValue
//             ? String(filterValue)
//                 .split(",")
//                 .map((s) => s.trim())
//                 .filter(Boolean)
//             : []; // Validate
//
//       if (!assessmentId || !filterType || values.length === 0) {
//         const err: any = new Error(
//           "assessmentId, filterType and filterValue(s) are required",
//         );
//         err.status = 400;
//         throw err;
//       } // Build Mongo query using $in so multiple values are supported
//
//       const userQuery: any = { flagged: { $ne: true } }; // keep any existing filters you had
//       if (filterType === "role") {
//         userQuery.role = { $in: values };
//       } else if (
//         filterType === "organization" ||
//         filterType === "organization"
//       ) {
//         // choose the DB field name used in your models; you used "organization" earlier
//         userQuery.organization = { $in: values };
//       } else {
//         const err: any = new Error("Unknown filterType");
//         err.status = 400;
//         throw err;
//       } // Fetch users matching ANY of the roles/organizations
//
//       const users = await User.find(userQuery).lean().exec();
//
//       if (!users || users.length === 0) {
//         const err: any = new Error("No users found for selected filter");
//         err.status = 400;
//         throw err;
//       }
//       for (const u of users) {
//         try {
//           await sendMail(
//             u.email,
//             "New Assessment Assigned",
//             `
//             const userName = (u as any).name || (u as any).fullName || (u as any).username || "User";
//             <p>You have been assigned a new assessment.</p>
//             <p>Please complete it using the link below:</p>
//             <a href="https://xcelarate-client.onrender.com/assessment/${assessmentId}">
//               Start Assessment
//             </a>
//           `,
//           );
//         } catch (mailErr) {
//           console.error("Email failed:", u.email, mailErr);
//         }
//       }
//       return {
//         success: true,
//         message: `Queued/sent to ${users.length} users`,
//         usersCount: users.length,
//       };
//     } catch (err) {
//       // preserve status if set
//       const status = (err as any)?.status || 500;
//       console.error("[sendAssessment] Error:", err); // rethrow so controller can handle it or return an object depending on your pattern
//       const e: any = new Error(
//         (err as any)?.message || "Internal server error",
//       );
//       e.status = status;
//       throw e;
//     }
//   }
// }
//
// // --- NEW POST LOGIC FOR REMINDERS ---
//
// export class PostReminder {
//   public async sendReminderToUsers(assessmentId: string, userIds: string[]) {
//     try {
//       if (!isOid(assessmentId))
//         throw new HttpError(400, "Invalid assessmentId");
//       if (!Array.isArray(userIds) || userIds.length === 0) {
//         throw new HttpError(400, "userIds array is required");
//       } // 1. Find the users by their IDs (assuming the userIds array contains User._id)
//
//       const users = await User.find({ _id: { $in: userIds } })
//         .lean()
//         .exec();
//
//       if (users.length === 0) {
//         throw new HttpError(404, "No users found for the provided IDs.");
//       } // 2. Placeholder for Email Sending Logic
//       // 🚨 You need to integrate your actual email transport setup here.
//       // The email should contain the link to the specific assessment (using assessmentId).
//       // Example Placeholder:
//       // for (const u of users) {
//       //   // await sendSpecificReminderEmail(u.email, assessmentId);
//       // }
//
//       return {
//         success: true,
//         message: `Reminder process initiated for ${users.length} users.`,
//         userCount: users.length,
//       };
//     } catch (e) {
//       console.error("Error sending reminder:", e);
//       rethrow(e, "Failed to send reminders");
//     }
//   }
// }

import mongoose from "mongoose";
import { sendMail } from "../utils/mailer";

import {
  User,
  Organization,
  Assessment,
  Response,
  beforeAssessment,
} from "../database/index";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const isOid = (id: string) => mongoose.isValidObjectId(id);
const safeDate = (v?: number) =>
    typeof v === "number" ? new Date(v) : undefined;
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
      const required = [
        "name",
        "designation",
        "email",
        "department",
        "phone",
      ] as const;
      for (const k of required) {
        if (!userData?.[k])
          throw new HttpError(400, `Field "${k}" is required`);
      }
      const user = await beforeAssessment.create(userData);
      return { user };
    } catch (e) {
      console.error("Error collecting pre-assessment data:", e);
      rethrow(e, "Error collecting pre-assessment data");
    }
  }
}

export class PostOrganization {
  public async postOrganization(orgData: any) {
    try {
      if (!orgData?.organization)
        throw new HttpError(400, "organization is required");
      const organization = await Organization.create(orgData);
      return organization;
    } catch (e) {
      console.error("Error creating organization:", e);
      rethrow(e, "Error creating organization");
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
      } // Optional light validation for question shape
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
      },
  ) {
    try {
      if (!assessmentId) throw new HttpError(400, "assessmentId is required");
      if (!isOid(assessmentId))
        throw new HttpError(400, "Invalid assessmentId");
      if (!isObj(payload?.answers))
        throw new HttpError(400, "answers must be an object");
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
  // inside PostSendAssessment class (replace the existing validation & query part)
  public async sendAssessmentEmail(payload: any) {
    try {
      // original payload may contain filterValue (string) or filterValues (array)
      const { assessmentId, filterType, filterValue, filterValues } =
      payload || {}; // Normalize to array of strings

      const values: string[] =
          Array.isArray(filterValues) && filterValues.length
              ? filterValues.map(String)
              : filterValue
                  ? String(filterValue)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : []; // Validate

      if (!assessmentId || !filterType || values.length === 0) {
        const err: any = new Error(
            "assessmentId, filterType and filterValue(s) are required",
        );
        err.status = 400;
        throw err;
      } // Build Mongo query using $in so multiple values are supported

      const userQuery: any = { flagged: { $ne: true } }; // keep any existing filters you had
      if (filterType === "role") {
        userQuery.role = { $in: values };
      } else if (
          filterType === "organization" ||
          filterType === "organization"
      ) {
        // choose the DB field name used in your models; you used "organization" earlier
        userQuery.organization = { $in: values };
      } else {
        const err: any = new Error("Unknown filterType");
        err.status = 400;
        throw err;
      } // Fetch users matching ANY of the roles/organizations

      const users = await User.find(userQuery).lean().exec();

      if (!users || users.length === 0) {
        const err: any = new Error("No users found for selected filter");
        err.status = 400;
        throw err;
      }

      // --- UPDATED EMAIL LOGIC ---
      // This will now use the CLIENT_URL from your Render Environment Variables
      const clientUrl = process.env.CLIENT_URL || "https://xcelarate-client.onrender.com";

      for (const u of users) {
        try {
          const userName = (u as any).name || (u as any).fullName || (u as any).username || "User";

          await sendMail(
              u.email,
              "New Assessment Assigned",
              `
            <p>Hello ${userName},</p>
            <p>You have been assigned a new assessment.</p>
            <p>Please complete it using the link below:</p>
            <a href="${clientUrl}/assessment/${assessmentId}">
              Start Assessment
            </a>
          `,
          );
        } catch (mailErr) {
          console.error("Email failed:", u.email, mailErr);
        }
      }
      return {
        success: true,
        message: `Queued/sent to ${users.length} users`,
        usersCount: users.length,
      };
    } catch (err) {
      // preserve status if set
      const status = (err as any)?.status || 500;
      console.error("[sendAssessment] Error:", err); // rethrow so controller can handle it or return an object depending on your pattern
      const e: any = new Error(
          (err as any)?.message || "Internal server error",
      );
      e.status = status;
      throw e;
    }
  }
}

// --- NEW POST LOGIC FOR REMINDERS ---

export class PostReminder {
  public async sendReminderToUsers(assessmentId: string, userIds: string[]) {
    try {
      if (!isOid(assessmentId))
        throw new HttpError(400, "Invalid assessmentId");
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new HttpError(400, "userIds array is required");
      } // 1. Find the users by their IDs (assuming the userIds array contains User._id)

      const users = await User.find({ _id: { $in: userIds } })
          .lean()
          .exec();

      if (users.length === 0) {
        throw new HttpError(404, "No users found for the provided IDs.");
      } // 2. Placeholder for Email Sending Logic
      // 🚨 You need to integrate your actual email transport setup here.
      // The email should contain the link to the specific assessment (using assessmentId).
      // Example Placeholder:
      // for (const u of users) {
      //   // await sendSpecificReminderEmail(u.email, assessmentId);
      // }

      return {
        success: true,
        message: `Reminder process initiated for ${users.length} users.`,
        userCount: users.length,
      };
    } catch (e) {
      console.error("Error sending reminder:", e);
      rethrow(e, "Failed to send reminders");
    }
  }
}