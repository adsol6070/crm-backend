"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createBlog = (0, catchAsync_1.default)(async (req, res) => {
    const uploadedFile = req.file;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blog = await services_1.blogService.createBlog(connection, req.body, uploadedFile);
    const message = "Blog created successfully.";
    res.status(http_status_1.default.CREATED).json({ blog, message });
});
const getAllBlogs = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogs = await services_1.blogService.getAllBlogs(connection);
    res.status(http_status_1.default.OK).send(blogs);
});
const getBlogById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogId = req.params.blogId;
    const blog = await services_1.blogService.getBlogById(connection, blogId);
    if (blog) {
        res.status(http_status_1.default.OK).send(blog);
    }
    else {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Blog not found" });
    }
});
const getBlogImage = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogId = req.params.blogId;
    const imagePath = await services_1.blogService.getBlogImageById(connection, blogId);
    res.status(http_status_1.default.OK).sendFile(imagePath);
});
const updateBlogById = (0, catchAsync_1.default)(async (req, res) => {
    const uploadedFile = req.file;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogId = req.params.blogId;
    const getBlog = await services_1.blogService.getBlogById(connection, blogId);
    const blogImage = getBlog.blogImage;
    const filePath = path_1.default.join(__dirname, "..", "uploads", getBlog.tenantID, "Blog", blogImage);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    fs_1.default.unlinkSync(filePath);
    const updateData = req.body;
    const updatedBlog = await services_1.blogService.updateBlogById(connection, blogId, updateData, uploadedFile);
    const message = "Blog updated successfully.";
    res.status(http_status_1.default.OK).json({ updatedBlog, message });
});
const deleteBlogById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogId = req.params.blogId;
    const getBlog = await services_1.blogService.getBlogById(connection, blogId);
    const blogImage = getBlog.blogImage;
    const filePath = path_1.default.join(__dirname, "..", "uploads", getBlog.tenantID, "Blog", blogImage);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    fs_1.default.unlinkSync(filePath);
    const deletedCount = await services_1.blogService.deleteBlogById(connection, blogId);
    if (deletedCount) {
        res.status(http_status_1.default.NO_CONTENT).send();
    }
    else {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Blog not found" });
    }
});
const createBlogCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogCategory = await services_1.blogService.createBlogCategory(connection, req.body);
    const message = "Blog Category created successfully.";
    res.status(http_status_1.default.CREATED).json({ blogCategory, message });
});
const getBlogCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogCategory = await services_1.blogService.getAllBlogCategory(connection);
    res.status(http_status_1.default.OK).send(blogCategory);
});
const getBlogCategoryById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogCategoryId = req.params.blogCategoryId;
    const blogCategory = await services_1.blogService.getBlogCategoryById(connection, blogCategoryId);
    if (blogCategory) {
        res.status(http_status_1.default.OK).send(blogCategory);
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Blog category not found" });
    }
});
const updateBlogCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogCategoryId = req.params.blogCategoryId;
    const updateBlogCategoryData = req.body;
    const updatedBlogCategory = await services_1.blogService.updateBlogByCategory(connection, blogCategoryId, updateBlogCategoryData);
    if (updatedBlogCategory) {
        res.status(http_status_1.default.OK).send(updatedBlogCategory);
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Blog Category not found" });
    }
});
const deleteBlogByCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const blogCategoryId = req.params.blogCategoryId;
    const deletedCount = await services_1.blogService.deleteBlogCategory(connection, blogCategoryId);
    if (deletedCount) {
        res.status(http_status_1.default.NO_CONTENT).send();
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Blog Category not found" });
    }
});
exports.default = {
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
};
