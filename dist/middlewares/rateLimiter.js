"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authLimiterOptions = {
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
};
const authLimiter = (0, express_rate_limit_1.default)(authLimiterOptions);
exports.authLimiter = authLimiter;
