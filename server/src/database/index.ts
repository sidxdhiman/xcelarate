import mongoose, { Schema, Document } from 'mongoose';


const mongoDB = "mongodb+srv://xcelarate:vS6aQk4CE9FlUDUi@cluster0.2xdekrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export const connection = mongoose.connect(mongoDB, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
  });
    export interface IUser extends Document {
    email: string;
    password: string;
    accessLevel: number;
    iv: string;
    // add any other fields
  }

  
  const userSchema = new mongoose.Schema({
    userId:Number,
    username:String,
    email:String,
    password:String,
    iv: { type: String, required: false }, //TODO: has to be set true but for the time being is set to false
    contact:Number,
    organisation: String,
    designation:String,
    location:String,
    currentProject: String,
    accessLevel: {type: Number, required: true},
  });

  const organisationSchema = new mongoose.Schema({
    organisation:String,
    address:String,
    spoc:String,
    email:String,
    contact:Number
  });

  const optionSchema = new mongoose.Schema({
    text: String,
  });

  const questionSchema = new mongoose.Schema({
    text: String,
    options: [optionSchema]
  });

  const assessmentSchema = new mongoose.Schema({
    title: String,
    roles: [String],  
    questions: [questionSchema]
  });

  const userStartSchema = new mongoose.Schema({
    name: String,
    designation: String,
    email: String,
    department: String,
    phone: String
  })

  const responseSchema = new mongoose.Schema({
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    answers: {
      type: Map,
      of: new mongoose.Schema({
        option: String,
        text: String,
      }),
    },
  });

  const Assessment = mongoose.model("Assessment", assessmentSchema);
  
  const Organisation = mongoose.model("Organisations", organisationSchema);

  const Response = mongoose.model("Responses", responseSchema);

  const beforeAssessment = mongoose.model("BeforeAssessment", userStartSchema);
  // const User = mongoose.model("Users", userSchema);

export const User = mongoose.model<IUser>('User', userSchema);
export {Organisation, Assessment, Response, beforeAssessment};

