import express from "express";
import { authController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";

const router = express.Router();

router.use("/register", upload.single("profileImage"));
router.use(connectionRequest);

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

export default router;
