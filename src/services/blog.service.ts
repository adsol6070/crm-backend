import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";

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

const createBlog = async (
  connection: Knex,
  blog: Blog,
  file?: UploadedFile,
): Promise<Blog> => {
  const { uploadType, ...blogData } = blog;
  if (file) {
    blogData.blogImage = file.filename;
  }
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
  updateBody: Partial<Blog>,
  file?: UploadedFile,
): Promise<Blog> => {
  const updatedBlogs = await connection("blogs")
    .where({ id: blogId })
    .update(updateBody)
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

export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogImageById,
  updateBlogById,
  deleteBlogById,
};
