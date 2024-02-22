import { AreaIdMap } from "@/constant/map.js"

export function getAreaName(areaId) {
  return AreaIdMap.get(areaId)
}
