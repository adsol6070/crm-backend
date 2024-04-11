import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import initializeUserModel from "../models/user.model";
import { dbConfiguration } from "../config/databse";

// Initialize user model
const userModel = initializeUserModel(dbConfiguration);

// createUser function to handle user creation requests
const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the email is already taken
    const emailTaken = await userModel.isEmailTaken(email);
    if (emailTaken) {
      return res.status(httpStatus.BAD_REQUEST).send("Email is already taken");
    }

    // Create the user
    await userModel.createUser({ name, email, password, role });

    res.status(httpStatus.CREATED).send("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send("An error occurred while creating the user");
  }
});


export default { createUser };
