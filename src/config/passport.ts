import {
  ExtractJwt,
  Strategy as JwtStrategy,
  VerifiedCallback,
} from "passport-jwt";
import config from "./config";
import { tokenTypes } from "./tokens";
import { connectionService } from "../services";
import { commonKnex } from "./database"; 

interface JwtPayload {
  sub: string;
  tenantID: string;
  iat: number;
  exp: number;
  type: string;
}


const jwtVerify = async (payload: JwtPayload, done: VerifiedCallback) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }
    const tenant = await commonKnex("tenants")
      .where({
        tenantID: payload.tenantID,
        active: true,
      })
      .first();
    const connection = await connectionService.getTenantKnex(tenant);
    const user = await connection("users").where({ id: payload.sub }).first();
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  jwtVerify,
);

export { jwtStrategy };
