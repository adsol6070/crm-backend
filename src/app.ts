import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import compression from "compression";
import httpStatus from "http-status";
import ApiError from "./utils/ApiError";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";
import { authLimiter } from "./middlewares/rateLimiter";
import { router } from "./routes";
import logger from "./config/logger";

const app: Application = express();

const BASE_URL = `/api/${process.env.VERSION || "v1"}`;

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

if (config.env === "production") {
  app.use(`${BASE_URL}/auth`, authLimiter);
}

app.use(BASE_URL, router);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);

app.use(errorHandler);

export { app };
