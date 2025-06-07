import {Request, Response} from "express";
import mongoose from "mongoose";

const {PostQuestion} = require("../service/postService");

export class questionController {
    public static async postQuestion(req: Request, res:Response) {
        try {
            const questionData = req.body
            const question = await new PostQuestion().postQuestion(questionData);
            if(question) {
                res.json(question);
            } else {
                res.status(404).json({message: "Question not posted"});
            }
        } catch (error) {
            res.status(500).json({message: "Internal Server Error"})
        }
    }
}