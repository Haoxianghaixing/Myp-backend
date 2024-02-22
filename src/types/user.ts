export interface UserInfo {
  id: number
  name: string
  email: string
  password: string
}

export interface IPicture {
  fileName: string
  areaId: string
  userName: string
  // 上传日期
  uploadDate?: Date | string
  // 拍摄日期
  takeDate?: Date | string
  // 拍摄地点
  spot?: string
}

export interface AreaDetail {
  areaId: string
  areaName: string
  areaDesc: string
  areaImgList: IPicture[]
  userImgList: IPicture[]
}
