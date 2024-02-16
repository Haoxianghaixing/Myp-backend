import * as mysql from "mysql"

export default async () => {
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  pool.on("connection", (connection) => {
    console.log("mysql connection established")
  })

  pool.on("release", (connection) => {
    console.log("mysql connection released")
  })

  return pool
}
