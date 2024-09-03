import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      const tenantId = req.body.tenantID || req.user?.tenantID;
      const uploadType = req.body.uploadType || "General";
      const uploadPath = path.join(
        __dirname,
        "..",
        "uploads",
        tenantId,
        uploadType,
      );

      fs.mkdirSync(uploadPath, { recursive: true });
      callback(null, uploadPath);
    } catch (error) {
      callback(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Error creating upload directory",
        ),
        "",
      );
    }
  },
  filename: (req, file, callback) => {
    try {
      const filename =
        file.fieldname + "-" + Date.now() + path.extname(file.originalname);
      callback(null, filename);
    } catch (error) {
      callback(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Error generating filename",
        ),
        "",
      );
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, callback) => {
    try {
      const filetypes =
        req.body.uploadType === "Blog"
          ? /jpeg|jpg|png|gif/
          : /jpeg|jpg|png|gif|csv|xls|xlsx|pdf|zip/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      const mimetype = filetypes.test(file.mimetype);
      if (mimetype && extname) {
        return callback(null, true);
      } else {
        callback(new ApiError(httpStatus.BAD_REQUEST, "Invalid file type"));
      }
    } catch (error) {
      callback(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error filtering file"),
      );
    }
  },
});

export default upload;
