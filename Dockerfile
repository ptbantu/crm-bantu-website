# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# 安装依赖（优先使用 pnpm，如果没有则使用 npm）
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm install; \
    fi

# 复制源代码
COPY . .

# 构建应用
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
    else \
      npm run build; \
    fi

# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 复制构建产物到 Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx（生产模式）
CMD ["nginx", "-g", "daemon off;"]

