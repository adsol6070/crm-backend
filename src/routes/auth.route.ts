import express, { request } from "express";
import { authController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";

const router = express.Router();

router.post("/register", connectionRequest, authController.registerUser);

export default router;
