"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const controllers_1 = require("../controllers");
const connectionResolver_1 = require("../middlewares/connectionResolver");
const multer_1 = __importDefault(require("../middlewares/multer"));
const permissions_1 = require("../config/permissions");
const router = express_1.default.Router();
router.post("/profile", (0, auth_1.auth)(), connectionResolver_1.connectionRequest, controllers_1.userController.getUserProfile);
router.get("/profile/:userId/image", (0, auth_1.auth)(), connectionResolver_1.connectionRequest, controllers_1.userController.getUserImage);
router
    .route("/")
    .post((0, auth_1.auth)("Users", permissions_1.Permission.CREATE), multer_1.default.single("profileImage"), connectionResolver_1.connectionRequest, controllers_1.userController.createUser)
    .get((0, auth_1.auth)("Users", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.userController.getUsers);
router
    .route("/:userId")
    .get((0, auth_1.auth)("Users", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.userController.getUser)
    .patch((0, auth_1.auth)("Users", permissions_1.Permission.UPDATE), multer_1.default.single("profileImage"), connectionResolver_1.connectionRequest, controllers_1.userController.updateUser)
    .delete((0, auth_1.auth)("Users", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.userController.deleteUser);
router.get("/:userId/image", (0, auth_1.auth)("Users", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.userController.getUserImage);
exports.default = router;
