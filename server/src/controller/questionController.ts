import { Request, Response } from "express";
import mongoose from "mongoose";

import { PostQuestion, PostResponse } from "../service/postService";
import { GetAssessment, GetAssessmentById } from "../service/getService";
import { GetResponseByAssessmentId } from "../service/getService";

export class questionController {
  public static async postQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;
      console.log("Incoming question data:", questionData);
      
      const question = await new PostQuestion().postQuestion(questionData);
      if (question) {
        res.status(200).json({ success: true, id: question._id });
      } else {
        res.status(404).json({ message: "Question not posted" });
      }
    } catch (error) {
      console.error("[postQuestion] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getAssessmentFunction(req: Request, res: Response) {
    try {
      const assessmentData = await new GetAssessment().getAssessment();
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res.status(404).json({ message: "Error in fetching assessments" });
      }
    } catch (error) {
      console.error("[getAssessmentFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getAssessmentByIdFunction(req: Request, res: Response) {
    try {
      const Id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(Id)) {
        return res.status(400).json({ message: "Invalid Assessment Id" });
      }

      const result = await new GetAssessmentById().getAssessmentbyId(Id);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Assessment not found" });
      }
    } catch (error) {
      console.error("[getAssessmentByIdFunction] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

 public static async submitResponse(req: Request, res: Response) {
  try {
    const assessmentId = req.params.id;
    const { answers, user, startedAt, submittedAt, location } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid Assessment Id" });
    }

    if (!answers || typeof answers !== "object" || !user || typeof user !== "object") {
      return res.status(400).json({ message: "Answers and user details are required" });
    }

    const saved = await new PostResponse().postResponse(assessmentId, {
      answers,
      user,
      startedAt,
      submittedAt,
      location,
    });

    res.status(201).json({ message: "Response submitted successfully", saved });
  } catch (error) {
    console.error("[submitResponse] Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


  public static async getResponseById(req: Request, res: Response) {
  try {
    const assessmentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: "Invalid Assessment ID" });
    }

    const responseData = await new GetResponseByAssessmentId().getResponseByAssessmentId(assessmentId);

    if (!responseData) {
      return res.status(404).json({ message: "No response found for this assessment" });
    }

    res.status(200).json(responseData);
    } catch (error) {
      console.error("[getResponseById] Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}