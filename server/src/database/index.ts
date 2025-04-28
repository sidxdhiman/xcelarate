import mongoose from "mongoose"

const mongoDB = "mongodb://localhost:27017/xcelarate-backend";

export const connection = mongoose.connect(mongoDB, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
  });
  
  const userSchema = new mongoose.Schema({
    userId:Number,
    name:String,
    email:String,
    password:String,
    iv: { type: String, required: false }, //TODO: has to be set true but for the time being is set to false
    contact:Number,
    organisation: String,
    designation:String,
    location:String,
    currentProject: String,
    accessLevel: Number,
  });

  const organisationSchema = new mongoose.Schema({
    organisation:String,
    address:String,
    spoc:String,
    email:String,
    contact:Number
  });
  
  const Organisation = mongoose.model("Organisations", organisationSchema);
  const User = mongoose.model("Users", userSchema);

export {User, Organisation};

