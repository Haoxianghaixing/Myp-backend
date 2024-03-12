import { query } from "@/service/db.js"
import express from "express"
import cookieParser from "cookie-parser"
import { decodeToken } from "./user.js"
import oss from "@/service/oss.js"
import fs from "fs/promises"
import { fileBufferPath } from "@/constant/index.js"
const router = express.Router()

router.use(cookieParser())
// 获取图片列表
router.get("/getImgList", (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10
  const currentPage = Number(req.query.currentPage) || 0
  const start = pageSize * currentPage
  try {
    const { token } = req.cookies
    const userInfo = decodeToken(token)
    const userId = userInfo.id
    query(
      "SELECT img.*, l, c, name as userName FROM img JOIN user ON img.userId = user.id LEFT JOIN imgActions AS t3 ON t3.photoId = img.photoId AND t3.userId = ? LIMIT ? OFFSET ?",
      [userId, pageSize, start]
    ).then((data) => {
      res.send(
        JSON.stringify({
          code: 200,
          data,
        })
      )
    })
  } catch (e) {
    query(
      "SELECT *, name as userName FROM img JOIN user ON img.userId = user.id LIMIT ? OFFSET ?",
      [pageSize, start]
    ).then((data) => {
      res.send(
        JSON.stringify({
          code: 200,
          data,
        })
      )
    })
  }
})

router.get("/getPhotoDetail", (req, res) => {
  const { photoId } = req.query as {
    photoId: string
  }
  query(
    "SELECT *, name as userName FROM img JOIN user ON img.userId = user.id WHERE photoId = ?",
    [photoId]
  )
    .then((data) => {
      query(
        "SELECT SUM(CASE WHEN l = 1 THEN 1 ELSE 0 END) AS likes,  SUM(CASE WHEN c = 1 THEN 1 ELSE 0 END) AS collects FROM imgActions WHERE photoId = ?",
        [photoId]
      ).then((r) => {
        res.send(
          JSON.stringify({
            code: 200,
            data: Object.assign((data as any)[0], r[0]),
          })
        )
      })
    })
    .catch((e) => {
      console.log(e)
      res.send(
        JSON.stringify({
          code: 500,
          message: "获取图片详情失败",
        })
      )
    })
})

enum OperateType {
  l,
  c,
}
router.use(express.json())
router.post("/operatePhoto", (req, res) => {
  const { photoId, userId, type } = req.body as {
    photoId: string
    userId: string
    type: OperateType
  }
  const actionKey = `${userId}-${photoId}`
  query(
    `INSERT INTO imgActions (actionKey, photoId, userId, ${OperateType[type]}) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${OperateType[type]} = -${OperateType[type]}`,
    [actionKey, photoId, userId, 1]
  )
    .then((r) => {
      res.send(
        JSON.stringify({
          code: 200,
          message: "操作成功",
        })
      )
    })
    .catch((e) => {
      res.send(
        JSON.stringify({
          code: 500,
          message: "操作失败",
        })
      )
    })
})

router.get("/downloadPhoto", (req, res) => {
  const { photoId } = req.query as {
    photoId: string
  }
  query("SELECT fileName FROM img WHERE photoId = ?", [photoId])
    .then((r) => {
      const fileName = (r as any)[0].fileName
      const oriFileName = fileName.split("/")[2]
      oss
        .downloadFileFromOSS(fileName, `./public/fileBuffer/${oriFileName}`)
        .then(() => {
          res.send({
            code: 200,
            message: "下载成功",
            data: fileBufferPath + "/" + oriFileName,
          })
        })
      query("UPDATE img SET downloads = downloads + 1 WHERE photoId = ?", [
        photoId,
      ])
    })
    .catch((e) => {
      console.log(e)
      res.send(
        JSON.stringify({
          code: 500,
          message: "操作失败",
        })
      )
    })
})

export default router
