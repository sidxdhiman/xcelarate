import { Request, Response } from "express";
import mongoose from "mongoose";

const { PostQuestion } = require("../service/postService");
const { GetAssessment } = require("../service/getService");
const { GetAssessmentById } = require("../service/getService");

export class questionController {
  public static async postQuestion(req: Request, res: Response) {
    try {
      const questionData = req.body;
      const question = await new PostQuestion().postQuestion(questionData);
      console.log("Incoming question data:", req.body);
      if (question) {
        res.status(200).json({ success: true, id: question._id });
      } else {
        res.status(404).json({ message: "Question not posted" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  public static async getAssessmentFunction(req: Request, res: Response) {
    try {
      const assessmentData = await new GetAssessment().getAssessment();
      if (assessmentData) {
        res.status(200).json(assessmentData);
      } else {
        res.status(404).json({ message: "Error in Fetching Assessments" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  public static async getAssessmentByIdFunction(req: Request, res: Response) {
    try {
        const Id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(Id)) {
            return (
                res.status(400).json({ message: "Invalid Assessment Id"})
            );
        }
        const result = await new GetAssessmentById().getAssessmentbyId(Id);
        if (result) {
            res.json(result)
        } else {
            res.status(404).json({message: "Assessment not found"});
        }
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})
    }
  }
} 
