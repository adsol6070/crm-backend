import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { createUser } from "../services/user";

const register = catchAsync(async (req,res)=>{
    const user = await createUser(req.body);
    res.status(httpStatus.CREATED).send({user})
})

export {register}