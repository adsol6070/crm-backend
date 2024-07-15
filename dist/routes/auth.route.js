"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const connectionResolver_1 = require("../middlewares/connectionResolver");
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = express_1.default.Router();
router.use("/register", multer_1.default.single("profileImage"));
router.use(connectionResolver_1.connectionRequest);
router.post("/register", controllers_1.authController.register);
router.post("/login", controllers_1.authController.login);
router.post("/logout", controllers_1.authController.logout);
router.post("/refresh-tokens", controllers_1.authController.refreshTokens);
router.post("/forgot-password", controllers_1.authController.forgotPassword);
router.post("/reset-password", controllers_1.authController.resetPassword);
exports.default = router;
