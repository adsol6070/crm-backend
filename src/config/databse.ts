import knex from "knex"
import config from "./config"

const dbConfiguration: any = config.postgres
const db = knex(dbConfiguration)

export { db, dbConfiguration }
