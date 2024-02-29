import { query } from "@/service/db.js"
import express from "express"

const router = express.Router()

// 获取图片列表
router.get("/getImgList", (req, res) => {
  query("SELECT * FROM img", []).then((data) => {
    res.send(
      JSON.stringify({
        code: 200,
        data,
      })
    )
  })
})

export default router
