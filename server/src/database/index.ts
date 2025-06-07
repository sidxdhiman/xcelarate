import mongoose, { Schema, Document } from 'mongoose';


const mongoDB = "mongodb://localhost:27017/xcelarate-backend";

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
    // location:String,
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

  const questionSchema = new mongoose.Schema({
    question: String,
    optOne: String,
    optTwo: String,
    optThree: String,
    optFour: String,
    optFive: String,
    role: String
  });

  const Question = mongoose.model("Questions", questionSchema);
  
  const Organisation = mongoose.model("Organisations", organisationSchema);
  // const User = mongoose.model("Users", userSchema);

export const User = mongoose.model<IUser>('User', userSchema);
export {Organisation, Question};

