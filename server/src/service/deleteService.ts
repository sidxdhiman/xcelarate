import { User } from "../database/index";

export class DeleteService {
  public async deleteUserByEmail(email: string) {
    try {
      // Check if email is valid
      if (!email || typeof email !== 'string') {
        throw new Error("Invalid email format");
      }

      // Check if the user exists
      const userExists = await User.findOne({ email });
      if (!userExists) {
        throw new Error("User not found");
      }

      // Delete the user
      const result = await User.findOneAndDelete({ email });

      // Return the result of the delete operation
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }
}
