import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import tenantRoute from "./tenant.route";
import blogRoute from "./blog.route";
import leadRoute from "./lead.route";
import permissionsRoute from "./permissions.route";
import chatRoute from "./chat.route";
import scoreRoute from "./score.route"

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
    path: "/organization",
    route: tenantRoute,
  },
  {
    path: "/blog",
    route: blogRoute,
  },
  {
    path: "/lead",
    route: leadRoute,
  },
  
  {
    path: "/CRSScore",
    route: scoreRoute,
  },
  {
    path: "/permissions",
    route: permissionsRoute,
  },
  {
    path: "/chat",
    route: chatRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };
