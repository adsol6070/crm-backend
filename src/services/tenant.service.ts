import Queue from 'bull';
import { db } from '../config/databse';
import { connectionService } from './index';
import config from '../config/config';

interface Params {
  tenantName: string;
  password: string;
  uuid: string;
}

const up = async (params: Params): Promise<void> => {
  const job = new Queue(
    `setting-up-database-${new Date().getTime()}`,
    `redis://${config.redis.host}:${config.redis.port}`
  );
  job.add({ ...params });
  job.process(async (job, done) => {
    try {
      await db.raw(`CREATE ROLE ${params.tenantName} WITH LOGIN PASSWORD '${params.password}';`);
      await db.raw(`GRANT ${params.tenantName} TO admin;`);
      await db.raw(`CREATE DATABASE ${params.tenantName} WITH OWNER ${params.tenantName};`);
      await db.raw(`GRANT ALL PRIVILEGES ON DATABASE ${params.tenantName} TO ${params.tenantName};`);

      await connectionService.bootstrap();
      await connectionService.getTenantConnection(params.uuid);
      done();
    } catch (e) {
      console.error(e);
    }
  });
};

const down = async (params: Params): Promise<void> => {
  const job = new Queue(
    `deleting-database-${new Date().getTime()}`,
    `redis://127.0.0.1:6379`
  );

  job.add({ ...params });
  job.process(async (job, done) => {
    try {
      await db.raw(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
        AND datname = '${params.tenantName}';`
      );
      await db.raw(`DROP DATABASE IF EXISTS ${params.tenantName};`);
      await db.raw(`DROP ROLE IF EXISTS ${params.tenantName};`);
      await connectionService.bootstrap();
      done();
    } catch (e) {
      console.error(e);
    }
  });
};

export default { up, down };
