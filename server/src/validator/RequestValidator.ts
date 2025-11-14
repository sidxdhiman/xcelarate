import { Request, Response, NextFunction } from "express";
const Joi = require("@hapi/joi");
import { User } from "../database/index";
import { Organization } from "../database/index";

export class RequestValidator {
  public static patchUser(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      username: Joi.string(),
      userId: Joi.number(),
      name: Joi.string(),
      password: Joi.string(),
      email: Joi.string(),
      location: Joi.string(),
      contact: Joi.number(),
      organization: Joi.string(),
      designation: Joi.string(),
      role: Joi.string(),
      accessLevel: Joi.number()
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    next();
  }

  public static async postUser(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      name: Joi.string().required(),
      password: Joi.string(), 
      //TODO: put required in password, or make another public static for posting user differently (both signup and post user is using this)
      email: Joi.string().lowercase().pattern(/@xebia\.com$/).required(),
      contact: Joi.required(),
      organization: Joi.string().required(),
      designation: Joi.string().required(),
      role: Joi.string(),
      location: Joi.string(), //TODO make the location required
      currentProject: Joi.string(), //TODO maybe add required maybe not - have to confirm    
      // accessLevel: Joi.required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).send("Email already in use");
      }
    } catch (err) {
      return res.status(500).send("Database error while checking email");
    }

    next();
  }
  public static async postOrganization(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      organization: Joi.string().required(),
      address: Joi.string(),
      spoc: Joi.string().required(),
      spoc_email: Joi.string().lowercase().required(),
      spoc_contact: Joi.string().required(),
      org_location: Joi.string(),
      businessUnit: Joi.string(),
      industry: Joi.string()
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    try {
      const existingOrganization = await Organization.findOne({ organization: req.body.organization });
      if (existingOrganization) {
        return res.status(400).send("Organization already registered");
      }
    } catch (err) {
      return res.status(500).send("Database error while checking email");
    }

    next();
  }
}
