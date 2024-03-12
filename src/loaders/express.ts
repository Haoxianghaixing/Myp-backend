import { Application } from "express"
import cors from "cors"
import express from "express"

import MapRouter from "@/api/map.js"
import UserRouter from "@/api/user.js"
import ManageRouter from "@/api/manage.js"
import ShareRouter from "@/api/share.js"
export default async function (app: Application) {
  app.use("/public", express.static("public"))
  // 设置跨域
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  )

  app.get("/api", (req, res, next) => {
    try {
      return res.send({ message: "hello" })
    } catch (error) {
      return next(error)
    }
  })

  app.use("/api/map", MapRouter)
  app.use("/api/user", UserRouter)
  app.use("/api/manage", ManageRouter)
  app.use("/api/share", ShareRouter)
}
