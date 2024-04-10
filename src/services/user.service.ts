import httpStatus from "http-status";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";

const createUser = async(userBody:any)=>{
    if(await (User as any).isEmailTaken(userBody.email)){
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken")
    }
    return User.create(userBody);
}

export {createUser}