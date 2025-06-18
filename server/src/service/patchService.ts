import { User } from "../database";

export class PatchService {
  public async patchUserByEmail(email: string, updateData: any): Promise<any> {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error("Error updating user by email:", error);
      throw error;
    }
  }
}
