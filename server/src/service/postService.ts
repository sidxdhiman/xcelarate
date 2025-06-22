import { User } from "../database/index";
import { Organisation } from "../database/index";
import { Assessment } from "../database/index";

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
};

export class PostOrganisation {
  public async postOrganisation(orgData: any): Promise<any> {
    try {
      // Optional: Validate orgData before creating
      if (!orgData.name) {
        throw new Error("Organisation name is required");
      }

      const organisation = await Organisation.create(orgData);
      console.log("Organisation posted successfully!");
      return organisation;
    } catch (error) {
      console.error("Error in creating organisation:" );
      throw new Error(`Error in creating organisation`);
    }
  }
};

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
