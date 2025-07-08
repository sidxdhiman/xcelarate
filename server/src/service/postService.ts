import { User, Organisation, Assessment} from "../database/index";
import { Response } from "../database/index";
import { beforeAssessment } from "../database/index";

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
  public async postResponse(assessmentId: string, answers: any): Promise<any> {
    try {
      if (!assessmentId || typeof answers !== 'object') {
        throw new Error("Missing or invalid response data");
      }

      const newResponse = await Response.create({
        assessmentId,
        answers,
        submittedAt: new Date(),
      });

      console.log("Response saved successfully!");
      return newResponse;
    } catch (error) {
      console.error("Error saving response:", error);
      throw new Error("Failed to save assessment response");
    }
  }
}
