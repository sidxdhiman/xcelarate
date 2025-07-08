import { User } from "../database";

export class PatchService {
  /**
   * Update user details using email as identifier
   * @param email string - Email of the user to be updated
   * @param updateData object - Fields to be updated
   * @returns updated user object (excluding sensitive fields)
   */
  public async patchUserByEmail(email: string, updateData: any): Promise<any> {
    if (!email) throw new Error("Email is required for updating user");

    try {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      ).select("-password"); // Exclude password field

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error: any) {
      console.error("❌ Error updating user by email:", error.message);
      throw new Error("Failed to update user profile");
    }
  }
}

