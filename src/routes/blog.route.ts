import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { blogController } from "../controllers";
import upload from "../middlewares/multer";

const router = express.Router();

router
  .route("/")
  .get(auth("getBlogs"), connectionRequest, blogController.getAllBlogs)
  .post(
    auth("manageBlogs"),
    upload.single("blogImage"),
    connectionRequest,
    blogController.createBlog,
  );
  router.get(
    "/:blogId/image",
    auth("getBlogs"),
    connectionRequest,
    blogController.getBlogImage,
  );
  
router
  .route("/:blogId")
  .get(auth("getBlogs"), connectionRequest, blogController.getBlogById)
  .patch(
    auth("manageBlogs"),
    upload.single("blogImage"),
    connectionRequest,
    blogController.updateBlogById,
  )
  .delete(
    auth("manageBlogs"),
    connectionRequest,
    blogController.deleteBlogById,
  );


export default router;
