import { User } from "../database/index";
import { ObjectId } from "mongodb";

export class DeleteService {
  public async deleteUserbyId(userId: string) {
    try {
      // Check if the userId is a valid ObjectId
      if (!ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID format");
      }

      // Convert userId to ObjectId before querying MongoDB
      const objectId = new ObjectId(userId);

      // Check if the user exists
      const userExists = await User.findById(objectId);
      if (!userExists) {
        throw new Error("User not found");
      }

      // Delete the user
      const result = await User.findOneAndDelete({ _id: objectId });

      // Return the result of the delete operation
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error(`Failed to delete user`);
    }
  }
}
