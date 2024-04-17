import  express  from "express";
import { auth } from "../middlewares/auth";
import userController from "../controllers/user.controller";

const router = express.Router();

router.route("/").post(auth("manageUsers"), userController.createUser)

export default router;