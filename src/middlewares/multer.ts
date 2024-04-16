import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        console.log("Request data in destination:", req.body); // Logs the request body

        const tenantId = req.body.tenantID;
        const uploadPath = path.join(__dirname, "..", "uploads", tenantId);

        fs.mkdirSync(uploadPath, { recursive: true });
        callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
        console.log("Request data in filename:", req.body); // Logs the request body
        console.log("File data:", file); // Logs the file data

        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, callback) => {
        console.log("Filtering file:", file); // Logs the file being processed

        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return callback(null, true);
        } else {
            callback(new ApiError(httpStatus.BAD_REQUEST, "Images Only!"));
        }
    }
});

export default upload;
