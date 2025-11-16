#!/bin/bash

# 构建脚本
set -e

echo "🚀 开始构建 Docker 镜像..."

# 构建镜像
docker build -t crm-bantu-website:latest .

echo "✅ 构建完成！"
echo ""
echo "📦 镜像信息："
docker images | grep crm-bantu-website

echo ""
echo "🧪 测试运行（可选）："
echo "docker run -d -p 8080:80 --name crm-bantu-website-test crm-bantu-website:latest"
echo ""
echo "📝 部署到 K8s："
echo "kubectl apply -f k8s/"

