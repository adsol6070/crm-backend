"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfiguration = exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const config_1 = __importDefault(require("./config"));
const dbConfiguration = config_1.default.postgres;
exports.dbConfiguration = dbConfiguration;
const db = (0, knex_1.default)(dbConfiguration);
exports.db = db;
