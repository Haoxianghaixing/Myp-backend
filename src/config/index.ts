import dotenv from "dotenv"
dotenv.config()

export default {
  port: process.env.PORT,
  host: process.env.HOST,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbHost: process.env.DB_HOST,
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID,
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
}
