import { IntegerType } from "mongodb";
import { Organization, User, Assessment, Response } from "../database";
import mongoose from "mongoose";

// --- EXISTING SERVICES ---

export class GetService {
  public async getUsers() {
    try {
      const users = await User.find({});
      return users;
    } catch (error) {
      console.error("Error fetching users from database:", error);
      throw new Error("Error fetching users");
    }
  }
}
export class GetByIdService {
  public async getUserbyId(userId: String) {
    try {
      const result = await User.findOne({ userId: userId });
      return result;
    } catch (error) {
      console.error("Error fetching user", error);
      throw new Error("Error fetching users");
    }
  }
}
export class GetOrganization {
  public async getOrganizations() {
    try {
      const organizations = await Organization.find({});
      return organizations;
    } catch (error) {
      console.error("Error fetching data from database:", error);
      throw new Error("Error fetching data");
    }
  }
}
export class GetAssessment {
  public async getAssessment() {
    try {
      const assessments = await Assessment.find({});
      return assessments;
    } catch (error) {
      console.error("Error in fetching Assessments", error);
      throw new Error("Error in fetching data");
    }
  }
}

export class GetAssessmentById {
  public async getAssessmentbyId(Id: string) {
    try {
      const assessment = await Assessment.findById(Id);
      return assessment;
    } catch (error) {
      console.error("Error fetching the Assessment", error);
      throw new Error("Error fetching assessment");
    }
  }
}

export class GetResponseByAssessmentId {
  public async getResponseByAssessmentId(id: string) {
    try {
      console.log(`DEBUG: Fetching responses for Assessment ID: ${id}`);

      const response = await Response.find({ assessmentId: id })
        .populate("user", "name email designation organization location")
        .sort({ submittedAt: -1 });

      // 🔥 DEBUG LOGS - Check the first response in the terminal 🔥
      if (response.length > 0) {
        const firstUser = response[0].user;
        console.log(
          "DEBUG: First Response User Data found in DB:",
          JSON.stringify(firstUser, null, 2),
        );
      } else {
        console.log("DEBUG: No responses found in DB.");
      }

      return response;
    } catch (error) {
      console.log("Error fetching response:", error);
      throw new Error("Error fetching response by assessment ID");
    }
  }
}

export class GetRoles {
  public async getRoles() {
    try {
      const roles = await User.distinct("role");
      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Error fetching roles");
    }
  }
}

// --- NEW GET LOGIC FOR PROGRESS REPORTING ---

export class GetUserByEmail {
  public async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Error fetching user");
    }
  }
}

export class GetResponsesByUserEmail {
  public async getResponsesByUserEmail(
    assessmentId: string,
    userEmail: string,
  ) {
    try {
      // Finds if this user has submitted a response for the given assessment.
      const response = await Response.findOne({
        assessmentId,
        "user.email": userEmail,
        submittedAt: { $exists: true, $ne: null }, // Ensure it's completed
      });
      return response;
    } catch (error) {
      console.error("Error fetching response by user email:", error);
      throw new Error("Error fetching response");
    }
  }
}

export class GetUsersByFilter {
  public async getUsersByFilter(filterType: string, filterValues: string[]) {
    try {
      let query: any = {};
      if (filterType === "role") {
        query.role = { $in: filterValues };
      } else if (filterType === "organization") {
        query.organization = { $in: filterValues };
      } else {
        throw new Error("Invalid filter type specified");
      }

      const users = await User.find(query).lean().exec();
      return users;
    } catch (error) {
      console.error("Error fetching users by filter:", error);
      throw new Error("Error fetching users by filter");
    }
  }
}

export class GetAssessmentAnalysis {
  public async getAnalysis(assessmentId: string) {
    try {
      // 1. Fetch the Assessment to get the Questions and Title
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) throw new Error("Assessment not found");

      // 2. Fetch all COMPLETED responses for this assessment
      const responses = await Response.find({
        assessmentId: assessmentId,
        submittedAt: { $exists: true, $ne: null },
      });

      const totalResponses = responses.length;

      // 3. Initialize Data Structure for Analysis
      // We map over the original questions to create a stats container for each
      const questionStats = assessment.questions.map((q: any) => {
        const stats: any = {
          questionId: q._id.toString(),
          questionText: q.text,
          type: "single_choice", // Assuming default, logic can be added for multiple
          options: q.options.map((opt: any) => ({
            label: opt.text,
            count: 0,
            percentage: 0,
          })),
        };
        return stats;
      });

      // 4. Heavy Lifting: Iterate through every response and count votes
      responses.forEach((resp: any) => {
        if (resp.answers) {
          // answers is a Map in your schema
          // We iterate through the questions in our stats
          questionStats.forEach((qStat: any) => {
            // Check if user answered this question
            // detailed access depends on how Mongoose Map is hydrated, usually .get() or direct access
            const answerObj =
              resp.answers.get(qStat.questionId) ||
              resp.answers[qStat.questionId];

            if (answerObj && answerObj.option) {
              // Find the option in our stats and increment
              const optionIndex = qStat.options.findIndex(
                (o: any) => o.label.trim() === answerObj.option.trim(),
              );
              if (optionIndex !== -1) {
                qStat.options[optionIndex].count++;
              }
            }
          });
        }
      });

      // 5. Calculate Percentages
      questionStats.forEach((q: any) => {
        q.options.forEach((opt: any) => {
          opt.percentage =
            totalResponses > 0
              ? Math.round((opt.count / totalResponses) * 100)
              : 0;
        });
      });

      // 6. AI Summary Mock (Connect your OpenAI/Gemini API here in future)
      // For now, we generate a dynamic string based on the data
      const aiSummary =
        totalResponses > 0
          ? `Analysis based on ${totalResponses} responses. The participation indicates strong engagement. Question 1 showed varied opinions, while data suggests a consensus on later topics.`
          : "Not enough data to generate an AI summary yet.";

      return {
        title: assessment.title,
        totalParticipants: totalResponses,
        aiSummary: aiSummary,
        questions: questionStats,
      };
    } catch (error) {
      console.error("Error generating analysis:", error);
      throw new Error("Error generating analysis");
    }
  }
}

// ... existing imports

export class GetAssessmentIndividualResponses {
  public async getIndividualResponses(assessmentId: string, userId?: string) {
    try {
      // 1. Build Query
      const query: any = {
        assessmentId: assessmentId,
        submittedAt: { $exists: true, $ne: null },
      };

      if (userId) {
        query["user._id"] = userId;
      }

      // 2. Fetch Responses
      const responses = await Response.find(query)
        .populate("user", "name email designation")
        .lean();

      // 3. Fetch Assessment
      const assessment = await Assessment.findById(assessmentId).lean();
      if (!assessment) throw new Error("Assessment not found");

      // 4. Transform Data
      const formattedResponses = responses.map((resp: any) => {
        // --- FIX IS HERE: Added explicit type annotation ---
        const answersList: {
          questionId: string;
          questionText: string;
          selectedOption: string;
          answerText: string;
        }[] = [];

        if (resp.answers) {
          assessment.questions.forEach((q: any) => {
            const qId = q._id.toString();
            // Handle both Map and Object structure just in case
            const ans =
              resp.answers[qId] ||
              (resp.answers instanceof Map ? resp.answers.get(qId) : null);

            answersList.push({
              questionId: qId,
              questionText: q.text,
              selectedOption: ans ? ans.option : "Skipped",
              answerText: ans ? ans.text : "",
            });
          });
        }

        return {
          responseId: resp._id,
          user: resp.user,
          submittedAt: resp.submittedAt,
          answers: answersList,
        };
      });

      return formattedResponses;
    } catch (error) {
      console.error("Error fetching individual responses:", error);
      throw new Error("Error fetching individual responses");
    }
  }
}
