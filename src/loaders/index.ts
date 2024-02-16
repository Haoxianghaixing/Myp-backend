import { Application } from "express"
import mysqlLoader from "./mysql.js"
import expressLoader from "./express.js"
export default async (expressApp: Application) => {
  const pool = await mysqlLoader()

  expressApp.set("dbConnectionPool", pool) // 将pool绑定到expressApp

  await expressLoader(expressApp)
}
