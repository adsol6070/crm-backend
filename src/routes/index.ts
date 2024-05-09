import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import tenantRoute from "./tenant.route";
import blogRoute from "./blog.route";
import permissionsRoute from "./permissions.route";

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
  {
    path: "/blog",
    route: blogRoute,
  },

  {
    path: "/permissions",
    route: permissionsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };
