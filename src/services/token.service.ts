import jsonwebtoken from "jsonwebtoken"
import { tokenTypes } from "../config/token";

interface User {
    id: number;
    tenantID: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone: string;
    profileImage: string;
    isEmailVerified: boolean;
    role: string;
    created_at: Date;
    updated_at: Date;
  }

const generateToken = (userId: string, expires:string, type:string, secret:string)=>{
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expires,
        type
    }
}
const generateAuthToken = async (user: User)=>{
    console.log("User in token service: ", user)
    generateToken(user.id, process.env.ACCESS_TOKEN_EXPIRY tokenTypes.ACCESS)
}

export default {
    generateToken,
    generateAuthToken
}