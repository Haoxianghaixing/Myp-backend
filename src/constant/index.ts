import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const fileBufferPath = path
  .join(__dirname, "../public/fileBuffer")
  .replace(/\\/g, "/")
