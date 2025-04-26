import { User } from "../database/index";

export class PostBulk {
    public async postBulkUsers(userData: any[]): Promise<any> {
      try {
        const users = await User.insertMany(userData);
        console.log("Users posted Scuccessfully");
        return users;
      } catch (error) {
        console.log("Error in inserting bulk users", error);
        throw new Error("Error in uploading bulk users");
      }
    }
  }