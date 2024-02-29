import express, { json } from "express"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import { UserInfo } from "@/types/user.js"
import { query } from "@/service/db.js"
const SECRET_KEY = "Haoxianghaixing"

const router = express.Router()

router.use(json())
router.use(cookieParser())

function generateToken(userInfo: UserInfo) {
  const { id, name, email } = userInfo
  return jwt.sign(
    {
      id,
      name,
      email,
    },
    SECRET_KEY,
    { expiresIn: "72h" }
  )
}

export function decodeToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY)
  } catch (e) {
    return null
  }
}

router.get("/getUserInfo", (req, res) => {
  const token = req.cookies.token
  if (token) {
    try {
      const userInfo = jwt.verify(token, SECRET_KEY)
      res.send(
        JSON.stringify({
          code: 200,
          data: userInfo,
        })
      )
    } catch {
      res.send(
        JSON.stringify({
          code: 400,
          message: "登录过期",
        })
      )
    }
  } else {
    res.send(
      JSON.stringify({
        code: 400,
        message: "未登录",
      })
    )
  }
})

router.post("/login", (req, res) => {
  const { email, password } = req.body
  query("SELECT * FROM user WHERE email = ?", [email]).then((r) => {
    if ((r as any[]).length === 0) {
      res.send(
        JSON.stringify({
          code: 500,
          message: "用户不存在",
        })
      )
    } else {
      if ((r as any[])[0].password === password) {
        const userInfo = (r as UserInfo[])[0]
        const token = generateToken(userInfo!)
        console.log(token)
        res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 24 * 3 })
        res.send(
          JSON.stringify({
            code: 200,
            message: "登录成功",
            data: userInfo,
          })
        )
      } else {
        res.send(
          JSON.stringify({
            code: 400,
            message: "用户名或密码错误",
          })
        )
      }
    }
  })
})

router.post("/register", (req, res) => {
  const { name, email, password } = req.body
  query("SELECT * FROM user WHERE email = ?", [email]).then((r) => {
    if ((r as any[]).length === 0) {
      query("INSERT INTO user (name, email, password) VALUES (?, ?, ?)", [
        name,
        email,
        password,
      ]).then((r) => {
        res.send(
          JSON.stringify({
            code: 200,
            message: "注册成功",
          })
        )
      })
    } else {
      res.send(
        JSON.stringify({
          code: 400,
          message: "用户已存在",
        })
      )
    }
  })
})

export default router
