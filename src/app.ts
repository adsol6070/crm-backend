import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import compression from "compression";
import httpStatus from "http-status";
import ApiError from "./utils/ApiError";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";
import { authLimiter } from "./middlewares/rateLimiter";
import router from "./routes/auth.route";

const app: Application = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.set("port", config.port || 8000);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(compression());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}
app.use("/v1/auth", router)

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);

app.use(errorHandler);

export { app };
