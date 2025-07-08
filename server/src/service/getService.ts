import { IntegerType } from "mongodb";
import { Organisation, User, Assessment, Response } from "../database";
import mongoose from "mongoose";

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
export class GetAssessment {
  public async getAssessment() { 
    try {
      const assessments = await Assessment.find({});
      return assessments;
    } catch (error) {
      console.error("Error in fetching Assessments", error);
      throw new Error('Error in fetching data');
    }
  }
}

export class GetAssessmentById {
  public async getAssessmentbyId(Id: string) {
    try {
      const assessment = await Assessment.findById(Id);
      return assessment;
    } catch (error) {
      console.error("Error fetching the Assessment", error);
      throw new Error("Error fetching assessment");
    }
  }
}

export class GetResponseByAssessmentId {
  public async getResponseByAssessmentId(assessmentId: string) {
    try {
      const response = await Response.findOne({ assessmentId });
      return response;
    } catch (error) {
      console.log("Error fetching response:", error);
      throw new Error("Error fetching response by assessment ID");
    }
  }
}
