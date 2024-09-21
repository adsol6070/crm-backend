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
  uploadType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
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
  tenantID?: string
): Promise<Blog> => {
  const { uploadType, ...blogWithoutUploadType } = blog;
  const blogData: Blog = {
    ...blogWithoutUploadType,
    id: uuidv4(),
    tenantID: tenantID as string,
    ...(file && { blogImage: file.filename }),
  };

  const [insertedBlog] = await connection("blogs")
    .insert(blogData)
    .returning("*");
  return insertedBlog;
};

const getBlogImageUrl = (
  blogImage: string | undefined,
  tenantID: string | undefined,
): string => {
  if (!blogImage || !tenantID) return "";
  const baseUrl = "http://192.168.1.7:8000/uploads";
  return `${baseUrl}/${tenantID}/Blog/${blogImage}`;
};

const getAllBlogs = async (connection: Knex) => {
  const blogs = await connection("blogs").select("*");
  return blogs.map((blog) => ({
    ...blog,
    blogImageUrl: getBlogImageUrl(blog.blogImage, blog.tenantID),
  }));
};

const getBlogById = async (connection: Knex, blogId: string): Promise<Blog> => {
  const blog = await connection("blogs").where({ id: blogId }).first();
  const blogWithImageUrl = {
    ...blog,
    blogImageUrl: getBlogImageUrl(blog.blogImage, blog.tenantID),
  }

  if (!blogWithImageUrl) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return blogWithImageUrl;
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
      "Blog",
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
  const { uploadType, ...updateBlogWithoutUploadType } = updateData;
  const updatedBlogData = {
    ...updateBlogWithoutUploadType,
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
  tenantID?: string
): Promise<BlogCategory> => {
  const updatedBlogCategory = {
    ...blogCategory,
    tenantID,
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
