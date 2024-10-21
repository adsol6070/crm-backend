import { Request, Response } from "express";
import { blogService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getCurrentTenantKnex();
  const blog = await blogService.createBlog(connection, req.body, uploadedFile, req.user?.tenantID);
  const message = "Blog created successfully.";
  res.status(httpStatus.CREATED).json({ blog, message });
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
  const getBlog = await blogService.getBlogById(connection, blogId);
  const blogImage = getBlog.blogImage as string;

  if (blogImage) {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      getBlog.tenantID,
      "Blog",
      blogImage,
    );

    fs.unlinkSync(filePath);
  }
  const updateData = req.body;
  const updatedBlog = await blogService.updateBlogById(
    connection,
    blogId,
    updateData,
    uploadedFile,
  );
  const message = "Blog updated successfully.";
  res.status(httpStatus.OK).json({ updatedBlog, message });
});

const deleteBlogById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogId = req.params.blogId;
  const getBlog = await blogService.getBlogById(connection, blogId);
  const blogImage = getBlog.blogImage as string;

  if (blogImage) {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      getBlog.tenantID,
      "Blog",
      blogImage,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);
  }

  const deletedCount = await blogService.deleteBlogById(connection, blogId);

  if (deletedCount) {
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Blog not found" });
  }
});

const createBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogCategory = await blogService.createBlogCategory(
    connection,
    req.body,
    req.user?.tenantID
  );
  const message = "Blog Category created successfully.";
  res.status(httpStatus.CREATED).json({ blogCategory, message });
});

const getBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogCategory = await blogService.getAllBlogCategory(connection);
  res.status(httpStatus.OK).send(blogCategory);
});

const getBlogCategoryById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogCategoryId = req.params.blogCategoryId;
  const blogCategory = await blogService.getBlogCategoryById(
    connection,
    blogCategoryId,
  );
  if (blogCategory) {
    res.status(httpStatus.OK).send(blogCategory);
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Blog category not found" });
  }
});

const updateBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogCategoryId = req.params.blogCategoryId;
  const updateBlogCategoryData = req.body;
  const updatedBlogCategory = await blogService.updateBlogByCategory(
    connection,
    blogCategoryId,
    updateBlogCategoryData,
  );
  if (updatedBlogCategory) {
    res.status(httpStatus.OK).send(updatedBlogCategory);
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Blog Category not found" });
  }
});

const deleteBlogByCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const blogCategoryId = req.params.blogCategoryId;
  const deletedCount = await blogService.deleteBlogCategory(
    connection,
    blogCategoryId,
  );

  if (deletedCount) {
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Blog Category not found" });
  }
});

const deleteSelectedBlogCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send("No Category IDs provided");
  }

  const connection = await connectionService.getCurrentTenantKnex();
  const deletedCount = await blogService.deleteCategoryByIds(connection, categoryIds);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogImage,
  updateBlogById,
  deleteBlogById,
  createBlogCategory,
  getBlogCategory,
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogByCategory,
  deleteSelectedBlogCategory,
};
