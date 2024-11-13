FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile;
COPY . .

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production DOMAIN=cpq.com

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# 暴露应用程序的端口（假设你的应用程序在端口 3000 上运行）
EXPOSE 3000

# 启动应用程序
CMD ["pnpm", "dev"]
