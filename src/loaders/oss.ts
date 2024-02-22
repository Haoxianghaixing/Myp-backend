import OSS from "ali-oss"
import config from "@/config/index.js"
// 创建OSS实例

export default () => {
  const client = new OSS({
    region: "oss-cn-beijing",
    accessKeyId: config.ossAccessKeyId,
    accessKeySecret: config.ossAccessKeySecret,
    bucket: "hxhxmyp",
    authorizationV4: true,
  })

  return client
}
