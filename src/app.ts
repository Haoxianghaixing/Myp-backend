import express from "express"
import loadApp from "./loaders/index.js"
import config from "./config/index.js"

async function startServer() {
  const app = express()

  await loadApp(app)

  app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`)
  })
}

startServer()
