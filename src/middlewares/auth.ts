// import httpStatus from 'http-status'
// import jsonwebtoken from 'jsonwebtoken'
// import passport from 'passport'
// import { NextFunction, Request, Response } from 'express';
// import ApiError from '../utils/ApiError';

// const auth = (...requiredRights) => async (req:Request, res:Response, next: NextFunction) => {
//     return new Promise((resolve, reject) => {
//       passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
//     })
//       .then(() => next())
//       .catch((err) => next(err));
//   };