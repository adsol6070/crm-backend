import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Blog {
  id?: string;
  tenantID: string;
  title: string;
  content: string;
  category: string;
  blogImage?: string;
  uploadType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UploadedFile {
  fieldname: string; // Field name specified in the form
  originalname: string; // Original file name on the user's computer
  encoding: string; // Encoding type of the file
  mimetype: string; // Mime type of the file
  destination: string; // Folder to which the file has been saved
  filename: string; // The name of the file within the destination
  path: string; // The full path to the uploaded file
  size: number; // The size of the file in bytes
}

interface BlogCategory {
  id?: string;
  tenantID: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const createBlog = async (
  connection: Knex,
  blog: Blog,
  file?: UploadedFile,
): Promise<Blog> => {
  const blogData: Blog = {
    ...blog,
    id: uuidv4(),
    ...(file && { blogImage: file.filename }),
  };

  const [insertedBlog] = await connection("blogs")
    .insert(blogData)
    .returning("*");
  return insertedBlog;
};

const getAllBlogs = async (connection: Knex): Promise<Blog[]> => {
  return await connection("blogs").select("*");
};

const getBlogById = async (connection: Knex, blogId: string): Promise<Blog> => {
  const blog = await connection("blogs").where({ id: blogId }).first();
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return blog;
};

const getBlogImageById = async (connection: Knex, id: string) => {
  const blog = await connection("blogs").where({ id }).first();
  if (!blog) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Blog not found");
  }
  const image = path.join(
    __dirname,
    "..",
    "uploads",
    blog.tenantID as string,
    "general",
    blog.blogImage,
  );
  return image;
};

const updateBlogById = async (
  connection: Knex,
  blogId: string,
  updateData: Partial<Blog>,
  file?: UploadedFile,
): Promise<Blog> => {
  const updatedBlogData = {
    ...updateData,
    ...(file && { blogImage: file.filename }),
  };
  const updatedBlogs = await connection("blogs")
    .where({ id: blogId })
    .update(updatedBlogData)
    .returning("*");
  if (updatedBlogs.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found after update");
  }
  return updatedBlogs[0];
};

const deleteBlogById = async (
  connection: Knex,
  blogId: string,
): Promise<number> => {
  const deletedCount = await connection("blogs").where({ id: blogId }).delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No blog found to delete");
  }
  return deletedCount;
};

const createBlogCategory = async (
  connection: Knex,
  blogCategory: BlogCategory,
): Promise<BlogCategory> => {
  const updatedBlogCategory = {
    ...blogCategory,
    id: uuidv4(),
  };
  const [insertedBlogCategory] = await connection("blogCategory")
    .insert(updatedBlogCategory)
    .returning("*");
  return insertedBlogCategory;
};

const getAllBlogCategory = async (
  connection: Knex,
): Promise<BlogCategory[]> => {
  return await connection("blogCategory").select("*");
};

const getBlogCategoryById = async (
  connection: Knex,
  blogCategoryId: string,
): Promise<BlogCategory> => {
  const blog = await connection("blogCategory")
    .where({ id: blogCategoryId })
    .first();
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog Category not found");
  }
  return blog;
};

const updateBlogByCategory = async (
  connection: Knex,
  blogCategoryId: string,
  updateBlogCategoryData: Partial<BlogCategory>,
): Promise<BlogCategory> => {
  const updatedBlogCategory = await connection("blogCategory")
    .where({ id: blogCategoryId })
    .update(updateBlogCategoryData)
    .returning("*");
  if (updatedBlogCategory.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Blog Category not found after update",
    );
  }
  return updatedBlogCategory[0];
};

const deleteBlogCategory = async (
  connection: Knex,
  blogCategoryId: string,
): Promise<number> => {
  const deletedCount = await connection("blogCategory")
    .where({ id: blogCategoryId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No blog category found to delete",
    );
  }
  return deletedCount;
};

export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogImageById,
  updateBlogById,
  deleteBlogById,
  createBlogCategory,
  getAllBlogCategory,
  getBlogCategoryById,
  updateBlogByCategory,
  deleteBlogCategory,
};
