#!/bin/bash
# ============================================================
# 生产环境 Docker 镜像构建脚本
# 构建镜像后自动滚动更新 Kubernetes pods
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME=${IMAGE_NAME:-crm-bantu-website:latest}
DOCKERFILE=${DOCKERFILE:-Dockerfile.prod}
DEPLOYMENT_NAME=${DEPLOYMENT_NAME:-crm-bantu-website}
NAMESPACE=${NAMESPACE:-default}
CONTAINER_NAME=${CONTAINER_NAME:-website}

# 是否自动部署到 K8s（可通过环境变量控制）
AUTO_DEPLOY=${AUTO_DEPLOY:-true}

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

# 自动部署到 Kubernetes
if [ "$AUTO_DEPLOY" = "true" ]; then
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}自动部署到 Kubernetes${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # 检查 kubectl 是否可用
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl 未安装或不在 PATH 中${NC}"
        echo -e "${YELLOW}跳过自动部署，请手动运行：${NC}"
        echo "  kubectl rollout restart deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
        exit 0
    fi
    
    # 检查 deployment 是否存在
    if ! kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &> /dev/null; then
        echo -e "${YELLOW}⚠️  Deployment $DEPLOYMENT_NAME 在命名空间 $NAMESPACE 中不存在${NC}"
        echo -e "${YELLOW}正在创建 Deployment...${NC}"
        kubectl apply -f k8s/prod/deployment.yaml || {
            echo -e "${RED}❌ 部署 Deployment 失败${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Deployment 已创建${NC}"
    else
        # 触发滚动更新
        echo -e "${YELLOW}🔄 触发滚动更新...${NC}"
        echo "  Deployment: $DEPLOYMENT_NAME"
        echo "  Namespace: $NAMESPACE"
        echo "  Container: $CONTAINER_NAME"
        echo "  Image: $IMAGE_NAME"
        echo ""
        
        # 使用 kubectl rollout restart 触发滚动更新
        # 这会强制重启 pods，即使镜像标签相同也会触发更新
        kubectl rollout restart deployment/$DEPLOYMENT_NAME -n $NAMESPACE || {
            echo -e "${RED}❌ 滚动更新失败${NC}"
            exit 1
        }
        
        echo -e "${GREEN}✅ 滚动更新已触发${NC}"
        echo ""
        
        # 等待滚动更新完成
        echo -e "${YELLOW}⏳ 等待滚动更新完成...${NC}"
        kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s || {
            echo -e "${RED}❌ 滚动更新超时或失败${NC}"
            echo ""
            echo -e "${YELLOW}查看 Pod 状态：${NC}"
            kubectl get pods -l app=$DEPLOYMENT_NAME -n $NAMESPACE
            exit 1
        }
        
        echo -e "${GREEN}✅ 滚动更新完成！${NC}"
        echo ""
        
        # 显示 Pod 状态
        echo -e "${GREEN}📊 Pod 状态：${NC}"
        kubectl get pods -l app=$DEPLOYMENT_NAME -n $NAMESPACE
        echo ""
        
        # 显示 Deployment 状态
        echo -e "${GREEN}📊 Deployment 状态：${NC}"
        kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE
    fi
else
    echo ""
    echo -e "${YELLOW}📝 手动部署到 K8s：${NC}"
    echo "  kubectl rollout restart deployment/$DEPLOYMENT_NAME -n $NAMESPACE"
    echo "  kubectl apply -f k8s/prod/"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}完成！${NC}"
echo -e "${GREEN}========================================${NC}"

