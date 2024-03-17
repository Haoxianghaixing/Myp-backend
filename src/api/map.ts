import express, { json } from "express"
import cookieParser from "cookie-parser"
import * as fs from "node:fs/promises"
import multer from "multer"
import { downloadFileFromOSS, uploadFileToOSS } from "@/service/oss.js"
import config from "@/config/index.js"
import { decodeToken } from "./user.js"
import { AreaDetail } from "@/types/user.js"
import { getAreaName } from "@/utils/map.js"
import { query } from "@/service/db.js"
import { randomUUID } from "node:crypto"
import { AreaList } from "@/constant/map.js"

const FILE_BUFFER_PATH = "./public/fileBuffer"

const router = express.Router()
router.use(json())
router.use(cookieParser())

router.get("/getAreaGeoDataById", (req, res) => {
  const { areaId } = req.query as {
    areaId: string
  }

  const areaName = getAreaName(areaId)
  if (areaName) {
    res.setHeader("Content-Type", "application/json")
    fs.readFile(`./public/geometryProvince/${areaId}.json`, "utf-8")
      .then((data) => {
        res.send(
          JSON.stringify({
            areaName,
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_BUFFER_PATH)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

router.post("/uploadImage", upload.single("file"), (req: any, res) => {
  const { file } = req as {
    file: multer.File
  }
  const { path: filePath, filename: originFileName } = file
  const fileType = originFileName.split(".")[1]
  const imgId = randomUUID()
  const fileName = imgId + "." + fileType

  uploadFileToOSS(filePath, fileName)
    .then((r) => {
      fs.unlink(filePath)
      res.json({
        code: 200,
        message: "上传成功",
        fileName: `myp/images/${fileName}`,
      })
    })
    .catch((err) => {
      res.json({
        code: 400,
        message: "上传失败",
        err: err,
      })
    })
})

/**
 * 根据地区 id 获取地区详情
 * @param areaId 地区 id
 * @returns 地区详情
 * */
router.get("/getAreaDetailById", (req, res) => {
  // 解析 token 获取用户 id
  const { token } = req.cookies
  const userInfo = decodeToken(token)
  const { areaId } = req.query as {
    areaId: string
  }
  query(
    "select userId, photoId, fileName, uploadDate, name, takeDate, spot from img join user on img.userId = user.id where areaId like ? order by uploadDate desc",
    [`${areaId}%`]
  )
    .then((r) => {
      const result = r as {
        userId: number
        photoId: string
        name: string
        fileName: string
        uploadDate: Date
        takeDate: Date
        spot: string
      }[]
      res.json({
        code: 200,
        message: "获取地区详情成功",
        data: {
          areaId,
          areaName: getAreaName(areaId),
          areaDesc: "test",
          areaImgList: result.slice(0, 5).map((item) => {
            return {
              fileName: item.fileName,
              photoId: item.photoId,
              areaId,
              userId: item.userId,
              userName: item.name,
              uploadDate: item.uploadDate.toLocaleDateString(),
              takeDate: item.takeDate ? item.takeDate.toLocaleDateString() : "",
              spot: item.spot,
            }
          }),
          userImgList: userInfo
            ? result
                .filter((item) => item.userId === userInfo.id)
                .map((item) => {
                  return {
                    fileName: item.fileName,
                    userId: item.userId,
                    photoId: item.photoId,
                    areaId,
                    userName: item.name,
                    uploadDate: item.uploadDate.toLocaleDateString(),
                    takeDate: item.takeDate
                      ? item.takeDate.toLocaleDateString()
                      : "",
                    spot: item.spot,
                  }
                })
            : [],
        } as AreaDetail,
      })
    })
    .catch((err) => {
      console.log(err)
      res.json({
        code: 400,
        message: "获取地区详情失败",
      })
    })
})

router.post("/addRecord", (req, res) => {
  const { areaId, fileList, takeDate, spot } = req.body as {
    areaId: string
    fileList: string[]
    takeDate?: string
    spot?: string
  }
  const { token } = req.cookies
  const { id } = decodeToken(token)
  const uploadDate = new Date().toLocaleDateString()
  query(
    "insert into img (userId, areaId, fileName, uploadDate, takeDate, spot, photoId) values ?",
    [
      fileList.map((fileName) => [
        id,
        areaId,
        fileName,
        uploadDate,
        takeDate ? takeDate : null,
        spot,
        fileName.split("/")[2]!.split(".")[0],
      ]),
    ]
  )
    .then((r) => {
      res.json({
        code: 200,
        message: "添加记录成功",
      })
    })
    .catch((err) => {
      res.json({
        code: 400,
        message: "添加记录失败",
        err,
      })
    })
})

router.get("/getAreaList", (req, res) => {
  res.json({
    code: 200,
    message: "获取地区列表成功",
    data: AreaList,
  })
})

router.get("/getUserHotMap", (req, res) => {
  const { token } = req.cookies
  const { id } = decodeToken(token)
  query(
    "select areaId, count(*) as count from img where userId = ? group by areaId order by count desc",
    [id]
  )
    .then((r) => {
      const result = r as {
        areaId: string
        count: number
      }[]
      const data: {
        [key: string]: {
          count: number
          children: {
            [key: string]: {
              count: number
            }
          }
        }
      } = {}
      result.forEach((item) => {
        if (item.areaId) {
          let provinceId = ""
          if (item.areaId.length === 2) {
            provinceId = item.areaId
            if (data[provinceId]) {
              data[provinceId]!.count += item.count
            } else {
              data[provinceId] = {
                count: item.count,
                children: {},
              }
            }
          } else {
            provinceId = item.areaId.slice(0, 2)
            if (data[provinceId]) {
              data[provinceId]!.count += item.count
            } else {
              data[provinceId] = {
                count: item.count,
                children: {},
              }
            }
            data[provinceId]!.children[item.areaId] = {
              count: item.count,
            }
          }
        }
      })
      res.json({
        code: 200,
        message: "获取用户热图成功",
        data,
      })
    })
    .catch((err) => {
      console.log(err)
      res.json({
        code: 400,
        message: "获取用户热图失败",
      })
    })
})

export default router
