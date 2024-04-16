"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const databse_1 = require("../config/databse");
const index_1 = require("./index");
const config_1 = __importDefault(require("../config/config"));
const migrations_1 = require("../migrations");
const up = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const job = new bull_1.default(`setting-up-database-${new Date().getTime()}`, `redis://${config_1.default.redis.host}:${config_1.default.redis.port}`);
    job.add(Object.assign({}, params));
    job.process((job, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield databse_1.db.raw(`CREATE ROLE ${params.tenantName} WITH LOGIN PASSWORD '${params.password}';`);
            yield databse_1.db.raw(`GRANT ${params.tenantName} TO admin;`);
            yield databse_1.db.raw(`CREATE DATABASE ${params.tenantName} WITH OWNER ${params.tenantName};`);
            yield databse_1.db.raw(`GRANT ALL PRIVILEGES ON DATABASE ${params.tenantName} TO ${params.tenantName};`);
            yield index_1.connectionService.bootstrap();
            const tenant = yield index_1.connectionService.getTenantConnection(params.uuid);
            yield (0, migrations_1.migrate)(tenant);
            done();
        }
        catch (e) {
            console.error(e);
        }
    }));
});
const down = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const job = new bull_1.default(`deleting-database-${new Date().getTime()}`, `redis://127.0.0.1:6379`);
    job.add(Object.assign({}, params));
    job.process((job, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield databse_1.db.raw(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
        AND datname = '${params.tenantName}';`);
            yield databse_1.db.raw(`DROP DATABASE IF EXISTS ${params.tenantName};`);
            yield databse_1.db.raw(`DROP ROLE IF EXISTS ${params.tenantName};`);
            yield index_1.connectionService.bootstrap();
            done();
        }
        catch (e) {
            console.error(e);
        }
    }));
});
exports.default = { up, down };
