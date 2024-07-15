"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const config_1 = __importDefault(require("./config"));
const tokens_1 = require("./tokens");
const services_1 = require("../services");
const database_1 = require("./database");
const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== tokens_1.tokenTypes.ACCESS) {
            throw new Error("Invalid token type");
        }
        const tenant = await (0, database_1.commonKnex)("tenants")
            .where({
            tenantID: payload.tenantID,
            active: true,
        })
            .first();
        const connection = await services_1.connectionService.getTenantKnex(tenant);
        const user = await connection("users").where({ id: payload.sub }).first();
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
};
const jwtStrategy = new passport_jwt_1.Strategy({
    secretOrKey: config_1.default.jwt.secret,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
}, jwtVerify);
exports.jwtStrategy = jwtStrategy;
