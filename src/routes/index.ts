import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import tenantRoute from "./tenant.route";
import blogRoute from "./blog.route";
import leadRoute from "./lead.route";
import permissionsRoute from "./permissions.route";
import chatRoute from "./chat.route";
import scoreRoute from "./score.route"
import reportRoute from "./reports.route"
import checklistRoute from "./checklist.route"
import taskRoute from "./task.route"
import boardRoute from "./board.route"

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
    path: "/checklists",
    route: checklistRoute,
  },
  {
    path: "/permissions",
    route: permissionsRoute,
  },
  {
    path: "/chat",
    route: chatRoute,
  },
  {
    path: "/reports",
    route: reportRoute,
  },
  {
    path: "/task",
    route: taskRoute,
  },
  {
    path: "/taskBoard",
    route: boardRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };
