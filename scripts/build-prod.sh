#!/bin/bash
# ============================================================
# 生产环境 Docker 镜像构建脚本
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 镜像名称
IMAGE_NAME=${IMAGE_NAME:-crm-bantu-website:latest}
DOCKERFILE=${DOCKERFILE:-Dockerfile.prod}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}构建生产环境 Docker 镜像${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "镜像名称: $IMAGE_NAME"
echo "Dockerfile: $DOCKERFILE"
echo ""

# 检查 Dockerfile 是否存在
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}❌ Dockerfile 不存在: $DOCKERFILE${NC}"
    exit 1
fi

# 构建镜像
echo -e "${YELLOW}📦 正在构建镜像...${NC}"
docker build -f $DOCKERFILE -t $IMAGE_NAME . || {
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
}

echo -e "${GREEN}✅ 镜像构建完成！${NC}"
echo ""
echo -e "${GREEN}📦 镜像信息：${NC}"
docker images | grep crm-bantu-website || true

echo ""
echo -e "${YELLOW}🧪 测试运行（可选）：${NC}"
echo "docker run -d -p 8080:80 --name crm-bantu-website-test $IMAGE_NAME"
echo ""
echo -e "${YELLOW}📝 部署到 K8s：${NC}"
echo "kubectl apply -f k8s/prod/"

