#!/bin/bash

# 部署脚本
set -e

NAMESPACE=${NAMESPACE:-default}
IMAGE_NAME=${IMAGE_NAME:-crm-bantu-website:latest}

echo "🚀 开始部署到 Kubernetes..."

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未安装，请先安装 kubectl"
    exit 1
fi

# 应用 K8s 配置
echo "📝 应用 Deployment..."
kubectl apply -f k8s/deployment.yaml -n $NAMESPACE

echo "📝 应用 Service..."
kubectl apply -f k8s/service.yaml -n $NAMESPACE

# 检查是否使用 HTTPS
if [ "$USE_HTTPS" = "true" ]; then
    echo "📝 应用 Ingress (HTTPS)..."
    kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
else
    echo "📝 应用 Ingress (HTTP)..."
    kubectl apply -f k8s/ingress-http.yaml -n $NAMESPACE
fi

# 更新镜像（如果需要）
if [ ! -z "$IMAGE_NAME" ]; then
    echo "🔄 更新镜像为: $IMAGE_NAME"
    kubectl set image deployment/crm-bantu-website website=$IMAGE_NAME -n $NAMESPACE
fi

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl rollout status deployment/crm-bantu-website -n $NAMESPACE

echo "✅ 部署完成！"
echo ""
echo "📊 查看状态："
kubectl get pods -l app=crm-bantu-website -n $NAMESPACE
kubectl get svc crm-bantu-website -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

