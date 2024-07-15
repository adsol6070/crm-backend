"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const moment_1 = __importDefault(require("moment"));
const convertDate = (dateString) => {
    const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY'];
    let formattedDate;
    dateFormats.some((format) => {
        const date = (0, moment_1.default)(dateString, format, true);
        if (date.isValid()) {
            formattedDate = date.format('YYYY-MM-DD');
            return true;
        }
        return false;
    });
    return formattedDate;
};
const parseFile = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'No file uploaded');
        }
        const filePath = req.file.path;
        const extname = path_1.default.extname(filePath).toLowerCase();
        const convertDatesInRow = (row) => {
            const dateFields = ['dob', 'passportExpiry', 'followUpDates'];
            dateFields.forEach((field) => {
                if (row[field]) {
                    row[field] = convertDate(row[field]) || row[field];
                }
            });
            return row;
        };
        if (extname === '.csv') {
            const results = [];
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(convertDatesInRow(data)))
                .on('end', () => {
                req.body.parsedData = results;
                next();
            })
                .on('error', (err) => {
                next(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error parsing CSV file'));
            });
        }
        else if (extname === '.xls' || extname === '.xlsx') {
            try {
                const workbook = xlsx_1.default.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx_1.default.utils.sheet_to_json(sheet);
                const convertedData = data.map((row) => convertDatesInRow(row));
                req.body.parsedData = convertedData;
                next();
            }
            catch (err) {
                next(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error parsing Excel file'));
            }
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Unsupported file type');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.parseFile = parseFile;
