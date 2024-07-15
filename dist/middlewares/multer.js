"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        try {
            const tenantId = req.body.tenantID;
            const uploadType = req.body.uploadType || "General";
            const uploadPath = path_1.default.join(__dirname, "..", "uploads", tenantId, uploadType);
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
            callback(null, uploadPath);
        }
        catch (error) {
            callback(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Error creating upload directory"), "");
        }
    },
    filename: (req, file, callback) => {
        try {
            const filename = file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname);
            callback(null, filename);
        }
        catch (error) {
            callback(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Error generating filename"), "");
        }
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, callback) => {
        try {
            const filetypes = req.body.uploadType === "Blog"
                ? /jpeg|jpg|png|gif/
                : /jpeg|jpg|png|gif|csv|xls|xlsx|pdf|zip/;
            const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            if (mimetype && extname) {
                return callback(null, true);
            }
            else {
                callback(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid file type"));
            }
        }
        catch (error) {
            callback(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Error filtering file"));
        }
    },
});
exports.default = upload;
