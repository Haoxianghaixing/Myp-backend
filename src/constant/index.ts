import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const fileBufferPath =
  process.env.NODE_ENV === "prod"
    ? `http://${process.env.HOST}:${process.env.PORT}/fileBuffer`
    : "http://localhost:8080/public/fileBuffer"
