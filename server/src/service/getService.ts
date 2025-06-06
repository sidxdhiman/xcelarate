import { IntegerType } from "mongodb";
import { Organisation, User } from "../database";

export class GetService {
  public async getUsers() {
    try {
      const users = await User.find({}); 
      return users; 
    } catch (error) {
      console.error("Error fetching users from database:", error); 
      throw new Error('Error fetching users');
    }
  }
}
export class GetByIdService {
  public async getUserbyId(userId: String){
    try {
      const result = await User.findOne({userId: userId});
      return result;
    } catch (error) {
      console.error("Error fetching user", error);
      throw new Error('Error fetching users');
    }
  }
}
export class GetOrganisation {
  public async getOrganisations() {
    try {
      const organisations = await Organisation.find({}); 
      return organisations; 
    } catch (error) {
      console.error("Error fetching data from database:", error); 
      throw new Error('Error fetching data');
    }
  }
}
