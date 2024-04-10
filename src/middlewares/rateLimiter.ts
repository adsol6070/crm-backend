import rateLimit from "express-rate-limit";

const authLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 2,
  skipSuccessfulRequests: true,
};

const authLimiter = rateLimit(authLimiterOptions);

export { authLimiter };
