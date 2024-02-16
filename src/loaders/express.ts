import { hello } from "@/constants/message.js"
import { Application } from "express"
import cors from "cors"
import MapRouter from "@/api/map.js"
export default async function (app: Application) {
  // 配置跨域
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
      return res.send({ message: hello })
    } catch (error) {
      return next(error)
    }
  })

  app.use("/api/map", MapRouter)
}
