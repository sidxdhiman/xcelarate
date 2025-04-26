import { User } from "../database/index";
import { Organisation } from "../database/index";
import multer from "multer";

// export const signup = async (req:Request, res:Response) => {
//   const { name, email, password } = req.body;
//   try {
//     const existinguser = await User.findOne({ email });
//     if (existinguser) {
//       return res.status(404).json({ message: "User already Exist." });
//     }

//     // const hashedPassword = await bcrypt.hash(password, 12);
//     const newUser = await User.create({
//       name,
//       email,
//       password
//     });
//     // const token = jwt.sign(
//     //   { email: newUser.email, id: newUser._id },
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: "1h" }
//     // );
//     res.status(200).json({ result: newUser });
//   } catch (error) {
//     res.status(500).json({error: error.message || "Something went worng..."});
//   }
// };

export class PostOrganisation {
  public async postOrganisation(orgData: any): Promise<any> {
    try {
      const organisation = await Organisation.create(orgData);
      console.log("Organisation posted successfully!");
      return organisation;
    } catch (error) {
      console.error("Error in creating organisation:", error);
      throw new Error(`Error in creating organisation`);
    }
  }
}


