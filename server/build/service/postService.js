"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostOrganisation = void 0;
const index_1 = require("../database/index");
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
class PostOrganisation {
    postOrganisation(orgData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organisation = yield index_1.Organisation.create(orgData);
                console.log("Organisation posted successfully!");
                return organisation;
            }
            catch (error) {
                console.error("Error in creating organisation:", error);
                throw new Error(`Error in creating organisation`);
            }
        });
    }
}
exports.PostOrganisation = PostOrganisation;
