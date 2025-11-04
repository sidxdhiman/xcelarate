import { User, Organisation, Assessment} from "../database/index";
import { Response } from "../database/index";
import { beforeAssessment } from "../database/index";
import nodemailer from "nodemailer";

export class PostUser {
  public async postUser(userData: any): Promise<any> {
    try {
      if (!userData.email || !userData.username) {
        throw new Error("Required fields are missing");
      }
      const user = await User.create(userData);
      console.log("User posted successfully!");
      return { user };
    } catch (error) {
      console.error("Error in creating user");
      throw new Error(`Error in creating user`);
    }
  }
}

export class PostBeforeAssessment {
  public async postBefore(userData: any): Promise<any> {
    try {
      if (!userData.name || !userData.designation || !userData.email || !userData.department || !userData.phone) {
        throw new Error("All fields are required");
      }
      const user = await beforeAssessment.create(userData);
      console.log("User Data Collected");
      return{user};
    } catch (error) {
      console.error("Error in collecting data");
      throw new Error(`Error in collecting data from user`);
    }
  }
}

export class PostOrganisation {
  public async postOrganisation(orgData: any): Promise<any> {
    try {
      if (!orgData.name) {
        throw new Error("Organisation name is required");
      }

      const organisation = await Organisation.create(orgData);
      console.log("Organisation posted successfully!");
      return organisation;
    } catch (error) {
      console.error("Error in creating organisation:");
      throw new Error(`Error in creating organisation`);
    }
  }
}

export class PostQuestion {
  public async postQuestion(questionData: any): Promise<any> {
    try {
      const { title, roles, questions } = questionData;

      if (!title || !roles || !Array.isArray(questions) || questions.length === 0) {
        console.log('Invalid assessment payload:', questionData);
        throw new Error("Assessment data is incomplete");
      }

      const assessment = await Assessment.create(questionData);
      console.log("Assessment posted successfully!");
      return assessment;
    } catch (error) {
      console.error("Error in posting a question: ", error);
      throw new Error(`Error in posting question`);
    }
  }
}

export class PostResponse {
  public async postResponse(assessmentId: string, payload: {
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
    location?: {
      lat: number;
      lon: number;
    };
  }): Promise<any> {
    try {
      if (!assessmentId || typeof payload.answers !== 'object') {
        throw new Error("Missing or invalid response data");
      }

      const newResponse = await Response.create({
        assessmentId,
        answers: payload.answers,
        submittedAt: payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
        startedAt: payload.startedAt ? new Date(payload.startedAt) : undefined,
        location: payload.location,
        user: payload.user,
      });

      console.log("Response saved successfully!");
      return newResponse;
    } catch (error) {
      console.error("Error saving response:", error);
      throw new Error("Failed to save assessment response");
    }
  }
}
export class PostSendAssessment {
    public async sendAssessmentEmail(data: {
        assessmentId: string;
        filterType: "organization" | "role";
        filterValue: string;
    }): Promise<any> {
        try {
            const { assessmentId, filterType, filterValue } = data;

            if (!assessmentId || !filterType || !filterValue) {
                throw new Error("Missing required parameters");
            }

            // 1️⃣ Fetch assessment details
            const assessment = await Assessment.findById(assessmentId);
            if (!assessment) {
                throw new Error("Assessment not found");
            }

            // 2️⃣ Fetch users based on filter
            let users: any[] = [];
            if (filterType === "organization") {
                users = await User.find({ organisation: filterValue });
            } else if (filterType === "role") {
                users = await User.find({ designation: filterValue });
            }

            if (!users.length) {
                throw new Error("No users found for the selected filter");
            }

            // 3️⃣ Configure nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: "gmail", // you can switch to sendgrid/mailgun/SES later
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // 4️⃣ Build assessment link
            const assessmentLink = `https://yourapp.com/${assessmentId}/disclaimer`;

            // 5️⃣ Send emails
            const mailPromises = users.map((user) =>
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: `New Assessment Assigned: ${assessment.title}`,
                    html: `
            <div style="font-family: Arial, sans-serif; padding: 15px;">
              <h2 style="color: #800080;">New Assessment Assigned</h2>
              <p>Hi ${user.username || user.email},</p>
              <p>You have been assigned a new assessment titled <b>"${assessment.title}"</b>.</p>
              <p>
                <a href="${assessmentLink}" 
                   style="background-color:#800080; color:white; padding:10px 15px; 
                          border-radius:5px; text-decoration:none;">
                  Start Assessment
                </a>
              </p>
              <p style="font-size:12px; color:gray;">If you cannot click the button, use this link: ${assessmentLink}</p>
            </div>
          `,
                })
            );

            await Promise.all(mailPromises);
            console.log(`✅ Sent assessment "${assessment.title}" to ${users.length} users`);

            return { success: true, count: users.length, emails: users.map((u) => u.email) };
        } catch (error: any) {
            console.error("Error sending assessment emails:", error);
            throw new Error(error.message || "Failed to send assessment emails");
        }
    }
}

