import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from "passport-jwt";
import config from "./config";
import { tokenTypes } from "./tokens";
import ApiError from "../utils/ApiError";
import { connectionService } from "../services";

interface Payload {
    type: string; // Assuming tokenTypes.ACCESS is a string, you can replace it with a more specific type if needed
    tenantID: string;
    sub: number; // Assuming this represents the user ID, adjust the type accordingly
    // Add more properties if needed
    exp: number;
    iat: number;
}

const jwtVerify = async (payload: Payload, done: VerifiedCallback) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error("Invalid token type");
        }
        const connection = await connectionService.getTenantConnection(payload.tenantID)
        const user = await connection("users").where({ id: payload.sub }).first();
        if (!user) {
            return done(null, false);
        }
        done(null, user)
    } catch (error) {
        done(error, false)
    }
};

const jwtStrategy = new JwtStrategy({
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, jwtVerify)

export {
    jwtStrategy
}