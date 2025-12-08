import mongoose, { Document } from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const mongoDB = process.env.MONGO_URI; // Get URI from .env

if (!mongoDB) {
  throw new Error("MONGO_URI is not defined in .env");
}

export const connection = mongoose.connect(mongoDB, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

// ------------------ User Interface ------------------
export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  accessLevel: number;
  iv: string;
  // add any other fields
}

// ------------------ Schemas ------------------
const userSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  email: String,
  password: String,
  iv: { type: String, required: false }, // TODO: make true later
  contact: String,
  organization: String,
  designation: String,
  role: String,
  location: String,
  currentProject: String,
  accessLevel: { type: Number, required: true },
});

const organizationSchema = new mongoose.Schema({
  organization: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  spoc: String,
  spoc_email: String,
  spoc_contact: String,
  org_location: String,
  businessUnit: String,
  industry: String,
});

const optionSchema = new mongoose.Schema({
  text: String,
});

const questionSchema = new mongoose.Schema({
  text: String,
  options: [optionSchema],
});

const assessmentSchema = new mongoose.Schema(
  {
    title: String,
    roles: [String],
    questions: [questionSchema],
    isActive: { type: Boolean, default: true, index: true },
    deadline: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);

const userStartSchema = new mongoose.Schema({
  name: String,
  designation: String,
  email: String,
  department: String,
  phone: String,
    organization: String,
    location: String,
});

const responseSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  user: {
    name: String,
    email: String,
    phone: String,
    designation: String,
    department: String,
      organization: String,
      location: String,
  },
  location: {
    lat: Number,
    lon: Number,
  },
  answers: {
    type: Map,
    of: new mongoose.Schema({
      option: String,
      text: String,
    }),
  },
});

const userAssessmentSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

export const UserAssessment = mongoose.model(
  "UserAssessment",
  userAssessmentSchema,
);

// ------------------ Models ------------------
export const User = mongoose.model<IUser>("User", userSchema);
export const Organization = mongoose.model("organizations", organizationSchema);
export const Assessment = mongoose.model("Assessment", assessmentSchema);
export const Response = mongoose.model("Responses", responseSchema);
export const beforeAssessment = mongoose.model(
  "BeforeAssessment",
  userStartSchema,
);
