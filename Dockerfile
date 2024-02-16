# 1. 构建基础镜像
FROM node:20-alpine AS base
# 定义构建参数
WORKDIR /src
EXPOSE 8080

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  [ -f pnpm-lock.yaml ] && pnpm install --ignore-scripts || \
  (echo "Lockfile not found." && exit 1)

COPY . .

CMD [ "sh", "-c", "npx pnpm run dev" ]