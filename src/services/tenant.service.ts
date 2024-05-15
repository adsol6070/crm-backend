import Queue from "bull";
// import { db } from "../config/databse";
import { connectionService } from "./index";
import config from "../config/config";
import slugify from "slugify";

interface Params {
  tenantName: string;
  password: string;
  uuid: string;
}
interface UpdateParams {
  tenantId?: string;
}
interface Newdata {
  uuid?: string;
  db_name: string;
  db_username: string;
  db_password: string;
}
interface GetTenant {
  uuid: string;
  db_name: string;
  db_username: string;
  db_password: string;
  created_at: string;
  updated_at: string;
}
const up = async (params: Params): Promise<void> => {
  // const job = new Queue(
  //   `setting-up-database-${new Date().getTime()}`,
  //   `redis://${config.redis.host}:${config.redis.port}`
  // );
  // job.add({ ...params });
  // job.process(async (job, done) => {
  //   try {
  //     await db.raw(`CREATE ROLE ${params.tenantName} WITH LOGIN PASSWORD '${params.password}';`);
  //     await db.raw(`GRANT ${params.tenantName} TO admin;`);
  //     await db.raw(`CREATE DATABASE ${params.tenantName} WITH OWNER ${params.tenantName};`);
  //     await db.raw(`GRANT ALL PRIVILEGES ON DATABASE ${params.tenantName} TO ${params.tenantName};`);
  //     await connectionService.bootstrap();
  //     const tenant = await connectionService.getTenantConnection(params.uuid);
  //     await migrate(tenant);
  //     done();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });
};

const down = async (params: Params): Promise<void> => {
  // const job = new Queue(
  //   `deleting-database-${new Date().getTime()}`,
  //   `redis://127.0.0.1:6379`
  // );
  // job.add({ ...params });
  // job.process(async (job, done) => {
  //   try {
  //     await db.raw(
  //       `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
  //       WHERE pid <> pg_backend_pid()
  //       AND datname = '${params.tenantName}';`
  //     );
  //     await db.raw(`DROP DATABASE IF EXISTS ${params.tenantName};`);
  //     await db.raw(`DROP ROLE IF EXISTS ${params.tenantName};`);
  //     await connectionService.bootstrap();
  //     done();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });
};
const updateTenant = async (
  params: UpdateParams,
  newData: Newdata,
  getTenant: GetTenant,
): Promise<any> => {
  // return new Promise((resolve, reject) => {
  //   const job = new Queue(
  //     `updating-tenant-${new Date().getTime()}`,
  //     `redis://${config.redis.host}:${config.redis.port}`,
  //   );

  //   job.add({ ...params, ...newData });

  //   job.process(async (job, done) => {
  //     const databaseName = slugify(newData.db_name.toLowerCase(), "_");
  //     try {
  //       await db.raw(
  //         `SELECT pg_terminate_backend(pg_stat_activity.pid)
  //         FROM pg_stat_activity
  //         WHERE pg_stat_activity.datname = '${getTenant.db_name}';`,
  //       );
  //       await db.raw(
  //         `ALTER DATABASE ${getTenant.db_name} RENAME TO ${databaseName}`,
  //       );
  //       await db.raw(
  //         `ALTER ROLE ${getTenant.db_name} RENAME TO ${databaseName}`,
  //       );
  //       // Perform the update operation
  //       const updatedTenant = await db("tenants")
  //         .where({ uuid: params.tenantId })
  //         .update(newData)
  //         .returning("*");

  //       // Resolve the promise with the updated tenant
  //       resolve(updatedTenant[0]); // Assuming returning("*") returns an array with a single element
  //       done(); // Notify Bull that the job is done
  //     } catch (error) {
  //       // Reject the promise with the error if an error occurs
  //       reject(error);
  //       console.error(error);
  //     }
  //   });
  // });
};

export default { up, down, updateTenant };
