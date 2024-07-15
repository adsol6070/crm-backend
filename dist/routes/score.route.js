"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const connectionResolver_1 = require("../middlewares/connectionResolver");
const controllers_1 = require("../controllers");
const permissions_1 = require("../config/permissions");
const router = express_1.default.Router();
router
    .route("/")
    .get((0, auth_1.auth)("Scores", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.scoreController.getScores)
    .post((0, auth_1.auth)("Scores", permissions_1.Permission.CREATE), connectionResolver_1.connectionRequest, controllers_1.scoreController.createScore);
router
    .route("/:scoreId")
    .get((0, auth_1.auth)("Scores", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.scoreController.getScoreById)
    .delete((0, auth_1.auth)("Scores", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.scoreController.deleteScoreById);
router
    .route("/deleteAll/:userId")
    .delete((0, auth_1.auth)("Scores", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.scoreController.deleteAllScores);
exports.default = router;
