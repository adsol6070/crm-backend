import express from "express";
import { authController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.use("/register", upload.single("profileImage"));
router.use("/logout", auth());
router.use(connectionRequest);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-tokens", authController.refreshTokens);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
