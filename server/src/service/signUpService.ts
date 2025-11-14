import { User } from "../database/index";
import { encrypt } from "../security/encrypt&decrypt";

export class AuthService {
  public static async signup(userData: {
    name: string;
    email: string;
    password: string;
    contact?: number;
    organization?: string;
    designation?: string;
    location?: string;
    currentProject?: string;
    // accessLevel?: number;
  }): Promise<any> {
    const {
      name,
      email,
      password,
      contact,
      organization,
      designation,
      location,
      currentProject,
      // accessLevel
    } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const encrypted = encrypt(password);

    const newUser = await User.create({
      name,
      email,
      password: encrypted.content,
      iv: encrypted.iv,
      contact,
      organization,
      designation,
      location,
      currentProject,
      // accessLevel
    });

    // const token = jwt.sign(
    //   { email: newUser.email, id: newUser._id },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "1h" }
    // );

    return {
      user: newUser,
      // token
    };
  }
}
