import express from "express"
import * as fs from "node:fs/promises"
import { AreaIdMap } from "@/constant/map.js"

const router = express.Router()
// router.use(json())

router.get("/getAreaGeoDataById", (req, res) => {
  const { areaId } = req.query as {
    areaId: string
  }

  if (AreaIdMap.has(areaId)) {
    res.setHeader("Content-Type", "application/json")
    fs.readFile(`./public/geometryProvince/${areaId}.json`, "utf-8")
      .then((data) => {
        res.send(
          JSON.stringify({
            areaName: AreaIdMap.get(areaId),
            data,
          })
        )
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    res.send(
      JSON.stringify({
        code: 400,
        message: "未找到该地区, 请检查areaId是否正确",
      })
    )
  }
})

export default router
