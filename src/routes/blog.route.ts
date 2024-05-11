import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { blogController } from "../controllers";
import upload from "../middlewares/multer";
import { Permission } from "../config/permissions";

const router = express.Router();

router
  .route("/blogCategory")
  .get(auth("manageBlogs"), connectionRequest, blogController.getBlogCategory)
  .post(
    auth("manageBlogs"),
    connectionRequest,
    blogController.createBlogCategory,
  );

router
  .route("/blogCategory/:blogCategoryId")
  .get(
    auth("manageBlogs"),
    connectionRequest,
    blogController.getBlogCategoryById,
  )
  .patch(
    auth("manageBlogs"),
    connectionRequest,
    blogController.updateBlogCategory,
  )
  .delete(
    auth("manageBlogs"),
    connectionRequest,
    blogController.deleteBlogByCategory,
  );

router
  .route("/")
  .get(
    auth("Blogs", Permission.READ),
    connectionRequest,
    blogController.getAllBlogs,
  )
  .post(
    auth("Blogs", Permission.CREATE),
    upload.single("blogImage"),
    connectionRequest,
    blogController.createBlog,
  );
router.get(
  "/:blogId/image",
  auth("Blogs", Permission.READ),
  connectionRequest,
  blogController.getBlogImage,
);

router
  .route("/:blogId")
  .get(
    auth("Blogs", Permission.READ),
    connectionRequest,
    blogController.getBlogById,
  )
  .patch(
    auth("Blogs", Permission.UPDATE),
    upload.single("blogImage"),
    connectionRequest,
    blogController.updateBlogById,
  )
  .delete(
    auth("Blogs", Permission.DELETE),
    connectionRequest,
    blogController.deleteBlogById,
  );

export default router;
