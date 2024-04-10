import knex from 'knex';
import { getNamespace } from 'continuation-local-storage';
import { db, dbConfiguration } from '../config/databse';

interface Tenant {
  uuid: string;
  db_name: string;
  db_username: string;
  db_password: string;
}

interface TenantConnection {
  uuid: string;
  connection: any;
}

let tenantMapping: TenantConnection[] = [];

const getConfig = (tenant: Tenant) => {
  const { db_username: user, db_name: database, db_password: password } = tenant;
  
  return {
    ...dbConfiguration,
    connection: {
      ...dbConfiguration.connection,
      user,
      database,
      password
    }
  };
};

const getConnection = (): any | null => getNamespace('tenants')?.get('connection') || null;

const bootstrap = async () => {
  try {
    const tenants: Tenant[] = await db
      .select('uuid', 'db_name', 'db_username', 'db_password')
      .from('tenants');

    tenantMapping = tenants.map((tenant) => ({
      uuid: tenant.uuid,
      connection: knex(getConfig(tenant))
    }));
  } catch (error) {
    console.error(error);
  }
};

const getTenantConnection = (uuid: string) => {
  const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid);

  if (!tenant) return null;

  return tenant.connection;
};

export { bootstrap, getTenantConnection, getConnection };
