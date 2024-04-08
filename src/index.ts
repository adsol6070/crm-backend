import mongoose from "mongoose";
import { app } from "./app";
import logger from "./config/logger";

app.listen(app.get("port"), () => {
  logger.info(`Listening at http://localhost:${app.get("port")}`);
});
