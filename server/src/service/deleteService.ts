import { User } from "../database";

export class DeleteService {
    public async deleteUserbyId(userId: string) {
      try {
        const result = await User.findOneAndDelete({ userId: userId });
        return result;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    }
  };