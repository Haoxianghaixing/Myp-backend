import OSS from "ali-oss"

class OssService {
  client: OSS
  initService(client: OSS) {
    this.client = client
  }
  uploadFileToOSS = (filePath: string, fileName: string) => {
    return this.client.put(`myp/images/${fileName}`, filePath)
  }
  downloadFileFromOSS = (fileName: string, destination: string) => {
    return this.client.get(`${fileName}`, destination)
  }
  deleteFileFromOSS = (fileName: string) => {
    return this.client.delete(fileName)
  }
  listFilesFromOSS = () => {
    return this.client.list()
  }
}

const service = new OssService()

export default service

export const uploadFileToOSS = service.uploadFileToOSS
export const downloadFileFromOSS = service.downloadFileFromOSS
export const deleteFileFromOSS = service.deleteFileFromOSS
export const listFilesFromOSS = service.listFilesFromOSS
