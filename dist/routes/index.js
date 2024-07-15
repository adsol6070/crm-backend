"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const tenant_route_1 = __importDefault(require("./tenant.route"));
const blog_route_1 = __importDefault(require("./blog.route"));
const lead_route_1 = __importDefault(require("./lead.route"));
const permissions_route_1 = __importDefault(require("./permissions.route"));
const chat_route_1 = __importDefault(require("./chat.route"));
const score_route_1 = __importDefault(require("./score.route"));
const router = express_1.default.Router();
exports.router = router;
const defaultRoutes = [
    {
        path: "/auth",
        route: auth_route_1.default,
    },
    {
        path: "/users",
        route: user_route_1.default,
    },
    {
        path: "/tenant",
        route: tenant_route_1.default,
    },
    {
        path: "/blog",
        route: blog_route_1.default,
    },
    {
        path: "/lead",
        route: lead_route_1.default,
    },
    {
        path: "/CRSScore",
        route: score_route_1.default,
    },
    {
        path: "/permissions",
        route: permissions_route_1.default,
    },
    {
        path: "/chat",
        route: chat_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
