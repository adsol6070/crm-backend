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
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = express_1.default.Router();
router
    .route("/blogCategory")
    .get((0, auth_1.auth)("Blogs", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.blogController.getBlogCategory)
    .post((0, auth_1.auth)("Blogs", permissions_1.Permission.CREATE), connectionResolver_1.connectionRequest, controllers_1.blogController.createBlogCategory);
router
    .route("/blogCategory/:blogCategoryId")
    .get((0, auth_1.auth)("Blogs", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.blogController.getBlogCategoryById)
    .patch((0, auth_1.auth)("Blogs", permissions_1.Permission.UPDATE), connectionResolver_1.connectionRequest, controllers_1.blogController.updateBlogCategory)
    .delete((0, auth_1.auth)("Blogs", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.blogController.deleteBlogByCategory);
router
    .route("/")
    .get((0, auth_1.auth)("Blogs", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.blogController.getAllBlogs)
    .post((0, auth_1.auth)("Blogs", permissions_1.Permission.CREATE), multer_1.default.single("blogImage"), connectionResolver_1.connectionRequest, controllers_1.blogController.createBlog);
router.get("/:blogId/image", (0, auth_1.auth)("Blogs", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.blogController.getBlogImage);
router
    .route("/:blogId")
    .get((0, auth_1.auth)("Blogs", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.blogController.getBlogById)
    .patch((0, auth_1.auth)("Blogs", permissions_1.Permission.UPDATE), multer_1.default.single("blogImage"), connectionResolver_1.connectionRequest, controllers_1.blogController.updateBlogById)
    .delete((0, auth_1.auth)("Blogs", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.blogController.deleteBlogById);
exports.default = router;
