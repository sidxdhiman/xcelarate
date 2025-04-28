import { User } from "../database/index";
import { Organisation } from "../database/index";
import { encrypt } from "../security/encrypt&decrypt";
// import jwt from 'jsonwebtoken';

export class PostUser {
  public async postUser(userData: any): Promise<any> {
    try {
      // Validate userData before creating
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("Required fields are missing");
      }
      const encrypted = encrypt(userData.password);
      userData.password = encrypted.content;
      userData.iv = encrypted.iv;

      const user = await User.create(userData);
      console.log("User posted successfully!");

      // Optionally, generate JWT Token after user creation
      // const token = jwt.sign(
      //   { email: user.email, id: user._id },
      //   process.env.JWT_SECRET as string,
      //   { expiresIn: "1h" }
      // );

      return { user };
    } catch (error) {
      console.error("Error in creating user");
      throw new Error(`Error in creating user`);
    }
  }
}

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
