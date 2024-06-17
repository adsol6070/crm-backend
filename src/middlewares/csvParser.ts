import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import moment from 'moment';

const convertDate = (dateString: string) => {
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY'];
  let formattedDate;

  dateFormats.some((format) => {
    const date = moment(dateString, format, true);
    if (date.isValid()) {
      formattedDate = date.format('YYYY-MM-DD');
      return true;
    }
    return false;
  });

  return formattedDate;
};

export const parseFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded'));
  }

  const filePath = req.file.path;
  const extname = path.extname(filePath).toLowerCase();

  const convertDatesInRow = (row: Record<string, string>) => {
    const dateFields = ['dob', 'passportExpiry', 'followUpDates']; 
    dateFields.forEach((field) => {
      if (row[field]) {
        row[field] = convertDate(row[field]) || row[field];
      }
    });
    return row;
  };

  if (extname === '.csv') {
    const results: Array<Record<string, string>> = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(convertDatesInRow(data)))
      .on('end', () => {
        req.body.parsedData = results;
        next();
      });
  } else if (extname === '.xls' || extname === '.xlsx') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const convertedData = data.map((row: any) => convertDatesInRow(row));
    req.body.parsedData = convertedData;
    next();
  } else {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Unsupported file type'));
  }
};
