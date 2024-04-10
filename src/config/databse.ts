import knex from "knex"

const config = {
  // client: process.env.DB_CLIENT,
  client: "pg",
  connection: {
    // user: process.env.DB_USER,
    user: 'postgres',
    // host: process.env.DB_HOST,
    host: 'localhost',
    port: process.env.DB_PORT,
    // database: process.env.DB_DATABASE,
    database: 'demo',
    // password: process.env.DB_PASSWORD
    password: 'admin'
  },
  pool: { min: 2, max: 10 }
}

const db = knex(config)

export { db, config }
