"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
const tenant_route_1 = __importDefault(require("./tenant.route"));
const router = express_1.default.Router();
exports.router = router;
const defaultRoutes = [
    {
        path: "/auth",
        route: auth_route_1.default,
    },
    {
        path: "/tenant",
        route: tenant_route_1.default,
    }
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
