import express from "express";
import { authController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";

const router = express.Router();

router.post("/register", upload.single("profileImage"), connectionRequest, authController.registerUser);

export default router;
