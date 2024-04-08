import httpStatus from "http-status";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";

const createUser = async(userBody)=>{
    if(await User.isEmailTaken)
}