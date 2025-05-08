import { User } from "../database/index";
import { Organisation } from "../database/index";

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
}
