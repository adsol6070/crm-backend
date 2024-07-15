"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const controllers_1 = require("../controllers");
const connectionResolver_1 = require("../middlewares/connectionResolver");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("managePermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.createPermission)
    .get((0, auth_1.auth)("viewPermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.getAllPermissions);
router.get("/roles", (0, auth_1.auth)("viewPermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.getRoles);
router.post("/by-role", (0, auth_1.auth)("viewPermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.getPermissionByRole);
router
    .route("/:permissionId")
    .get((0, auth_1.auth)("viewPermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.getPermission)
    .patch((0, auth_1.auth)("managePermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.updatePermission)
    .delete((0, auth_1.auth)("managePermissions"), connectionResolver_1.connectionRequest, controllers_1.permissionsController.deletePermission);
exports.default = router;
