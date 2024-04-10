import express from "express";
import authRoute from "./auth.route";
import tenantRoute from "./tenant.route";

const router = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
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
