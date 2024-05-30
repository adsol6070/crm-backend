import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

export const parseFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded'));
  }

  const filePath = req.file.path;
  const extname = path.extname(filePath).toLowerCase();

  if (extname === '.csv') {
    const results: Array<Record<string, string>> = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        req.body.parsedData = results;
        next();
      });
  } else if (extname === '.xls' || extname === '.xlsx') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    req.body.parsedData = data;
    next();
  } else {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Unsupported file type'));
  }
};
