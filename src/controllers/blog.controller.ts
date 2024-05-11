import { Request, Response } from "express";
import { blogService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getCurrentTenantKnex();
  const blog = await blogService.createBlog(connection, req.body, uploadedFile);
  res.status(httpStatus.CREATED).send(blog);
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogs = await blogService.getAllBlogs(connection);
  res.status(httpStatus.OK).send(blogs);
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogId = req.params.blogId;
  const blog = await blogService.getBlogById(connection, blogId);
  if (blog) {
    res.status(httpStatus.OK).send(blog);
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Blog not found" });
  }
});

const getBlogImage = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogId = req.params.blogId;
  const imagePath = await blogService.getBlogImageById(connection, blogId);
  res.status(httpStatus.OK).sendFile(imagePath);
});

const updateBlogById = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getCurrentTenantKnex();
  const blogId = req.params.blogId;
  const updateData = req.body;
  const updatedBlog = await blogService.updateBlogById(
    connection,
    blogId,
    updateData,
    uploadedFile,
  );
  if (updatedBlog) {
    res.status(httpStatus.OK).send(updatedBlog);
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Blog not found" });
  }
});

const deleteBlogById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogId = req.params.blogId;
  const deletedCount = await blogService.deleteBlogById(connection, blogId);
  if (deletedCount) {
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Blog not found" });
  }
});

export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogImage,
  updateBlogById,
  deleteBlogById,
};
