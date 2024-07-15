"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const createBlog = async (connection, blog, file) => {
    const { uploadType, ...blogWithoutUploadType } = blog;
    const blogData = {
        ...blogWithoutUploadType,
        id: (0, uuid_1.v4)(),
        ...(file && { blogImage: file.filename }),
    };
    const [insertedBlog] = await connection("blogs")
        .insert(blogData)
        .returning("*");
    return insertedBlog;
};
const getAllBlogs = async (connection) => {
    return await connection("blogs").select("*");
};
const getBlogById = async (connection, blogId) => {
    const blog = await connection("blogs").where({ id: blogId }).first();
    if (!blog) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Blog not found");
    }
    return blog;
};
const getBlogImageById = async (connection, id) => {
    const blog = await connection("blogs").where({ id }).first();
    if (!blog) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Blog not found");
    }
    const image = path_1.default.join(__dirname, "..", "uploads", blog.tenantID, "Blog", blog.blogImage);
    return image;
};
const updateBlogById = async (connection, blogId, updateData, file) => {
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Blog not found after update");
    }
    return updatedBlogs[0];
};
const deleteBlogById = async (connection, blogId) => {
    const deletedCount = await connection("blogs").where({ id: blogId }).delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No blog found to delete");
    }
    return deletedCount;
};
const createBlogCategory = async (connection, blogCategory) => {
    const updatedBlogCategory = {
        ...blogCategory,
        id: (0, uuid_1.v4)(),
    };
    const [insertedBlogCategory] = await connection("blogCategory")
        .insert(updatedBlogCategory)
        .returning("*");
    return insertedBlogCategory;
};
const getAllBlogCategory = async (connection) => {
    return await connection("blogCategory").select("*");
};
const getBlogCategoryById = async (connection, blogCategoryId) => {
    const blog = await connection("blogCategory")
        .where({ id: blogCategoryId })
        .first();
    if (!blog) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Blog Category not found");
    }
    return blog;
};
const updateBlogByCategory = async (connection, blogCategoryId, updateBlogCategoryData) => {
    const updatedBlogCategory = await connection("blogCategory")
        .where({ id: blogCategoryId })
        .update(updateBlogCategoryData)
        .returning("*");
    if (updatedBlogCategory.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Blog Category not found after update");
    }
    return updatedBlogCategory[0];
};
const deleteBlogCategory = async (connection, blogCategoryId) => {
    const deletedCount = await connection("blogCategory")
        .where({ id: blogCategoryId })
        .delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No blog category found to delete");
    }
    return deletedCount;
};
exports.default = {
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
