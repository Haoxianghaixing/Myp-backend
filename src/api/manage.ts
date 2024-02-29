import { query } from "@/service/db.js"
import { deleteFileFromOSS, listFilesFromOSS } from "@/service/oss.js"
import express from "express"

const router = express.Router()

router.get("/removeRedundancyPicture", (req, res) => {
  listFilesFromOSS().then((fileList) => {
    query("SELECT fileName FROM img", []).then((data) => {
      const result = data as {
        fileName: string
      }[]

      const imgList = result.map((item) => item.fileName)
      const ossList = fileList.objects.map((item) => item.name)
      const redundancyList = ossList.filter((item) => !imgList.includes(item))
      Promise.all(redundancyList.map((item) => deleteFileFromOSS(item))).then(
        () => {
          res.json({
            code: 200,
            message: "删除冗余图片成功",
          })
        }
      )
    })
  })
})

export default router
