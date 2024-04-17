import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import tenantRoute from "./tenant.route";
import userRoute from "./user.route";

const router = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/tenant",
    route: tenantRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };
