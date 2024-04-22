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
router.post("/register", multer_1.default.single("profileImage"), connectionResolver_1.connectionRequest, controllers_1.authController.registerUser);
exports.default = router;
