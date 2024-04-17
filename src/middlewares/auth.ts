import { NextFunction, Request, Response } from "express";
import passport from "passport";

const auth = () => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {});
};
