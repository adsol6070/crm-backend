import express, { request } from "express";
import { authController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
// import upload from "../middlewares/multer";

const router = express.Router();

router.post("/register", connectionRequest,/*  upload.single("profileImage"), */ authController.registerUser);

export default router;
