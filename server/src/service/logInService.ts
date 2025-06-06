import { resolve } from "path";
import {User, IUser} from "../database/index";
import { decrypt } from "../security/encrypt&decrypt";
import { log } from "console";


export class AuthLoginService {
    public static async login(userData: {
        email: string;
        password: string;
    }) : Promise<any> {
        const {
            email,
            password
        } = userData;
        
        const loginUser: IUser | null = await User.findOne({email});
        console.log('loginUser:', loginUser);
        if (!loginUser){
            throw new Error("No user with these credentials!")
        }
        // const decryptedPassword = decrypt({iv: loginUser.iv, content: loginUser.password})
        // if (decryptedPassword !== password) {
        //     throw new Error("Invalid credentials!");
        // } 
        return {
            accessLevel : loginUser.accessLevel,
            email: loginUser.email
        }
    }
}