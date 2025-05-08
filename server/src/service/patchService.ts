import { User } from "../database";

export class PatchService {
  public async patchUserByEmail(email: string, updateData: any): Promise<any> {
    try {
      const result = await User.updateOne(
        { email: email },
        { $set: updateData },
        { new: true }
      );
      return result;
    } catch (error) {
      console.error("Error updating user by email:", error);
      throw error;
    }
  }
}
