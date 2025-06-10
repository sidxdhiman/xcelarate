import { User } from "../database/index";

export class DeleteService {
  public async deleteUserByEmail(email: string) {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error("Invalid email format");
      }
      // const userExists = await User.findOne({ email });
      // if (!userExists) {
      //   throw new Error("User not found");
      // } TODO: check if email exists
      const result = await User.findOneAndDelete({ email });

      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }
}
