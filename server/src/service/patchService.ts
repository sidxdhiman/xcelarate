import { User } from "../database";

export class PatchService {
  public async patchUserbyId(userId: string, updateData: any): Promise<any> {
    try {
      const result = await User.updateOne(
        { userId: userId },
        { $set: updateData },
        { new: true }
      );
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}
