import knex from "knex"
import config from "./config"

const dbConfiguration = config.postgres
const db = knex(dbConfiguration)

export { db, dbConfiguration }
