import { Application } from "express"
import mysqlLoader from "./mysql.js"
import expressLoader from "./express.js"
import ossLoader from "./oss.js"
import OssService from "@/service/oss.js"
import DBService from "@/service/db.js"
export default async (expressApp: Application) => {
  const pool = await mysqlLoader()
  expressApp.set("dbConnectionPool", pool) // 将pool绑定到expressApp
  const ossClient = await ossLoader()
  expressApp.set("ossClient", ossClient) // 将ossClient绑定到expressApp
  OssService.initService(ossClient)
  DBService.initDB(pool)
  await expressLoader(expressApp)
}
