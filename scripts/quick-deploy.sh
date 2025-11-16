#!/bin/bash

# 快速部署脚本 - 一键部署到 K8s
set -e

NAMESPACE=${NAMESPACE:-default}
IMAGE_NAME=${IMAGE_NAME:-crm-bantu-website:latest}
USE_HTTPS=${USE_HTTPS:-false}

echo "🚀 班兔企服官网 - 快速部署脚本"
echo "=================================="
echo "域名: www.crmbantu.space"
echo "命名空间: $NAMESPACE"
echo "镜像: $IMAGE_NAME"
echo "HTTPS: $USE_HTTPS"
echo ""

# 检查必要工具
echo "🔍 检查必要工具..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl 未安装"; exit 1; }
echo "✅ 工具检查通过"
echo ""

# 步骤1: 构建镜像
echo "📦 步骤 1/4: 构建 Docker 镜像..."
docker build -t $IMAGE_NAME . || {
    echo "❌ 镜像构建失败"
    exit 1
}
echo "✅ 镜像构建完成"
echo ""

# 步骤2: 检查 K8s 连接
echo "🔗 步骤 2/4: 检查 Kubernetes 连接..."
kubectl cluster-info >/dev/null 2>&1 || {
    echo "❌ 无法连接到 Kubernetes 集群"
    echo "请确保 kubectl 已正确配置"
    exit 1
}
echo "✅ Kubernetes 连接正常"
echo ""

# 步骤3: 应用 K8s 配置
echo "📝 步骤 3/4: 应用 Kubernetes 配置..."

# 更新 deployment 中的镜像名称
if [ "$IMAGE_NAME" != "crm-bantu-website:latest" ]; then
    echo "🔄 更新镜像为: $IMAGE_NAME"
    # 临时修改 deployment.yaml
    sed "s|image: crm-bantu-website:latest|image: $IMAGE_NAME|g" k8s/deployment.yaml > /tmp/deployment-tmp.yaml
    kubectl apply -f /tmp/deployment-tmp.yaml -n $NAMESPACE
    rm /tmp/deployment-tmp.yaml
else
    kubectl apply -f k8s/deployment.yaml -n $NAMESPACE
fi

kubectl apply -f k8s/service.yaml -n $NAMESPACE

if [ "$USE_HTTPS" = "true" ]; then
    echo "🔒 使用 HTTPS Ingress..."
    kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
else
    echo "🔓 使用 HTTP Ingress..."
    kubectl apply -f k8s/ingress-http.yaml -n $NAMESPACE
fi

echo "✅ K8s 配置应用完成"
echo ""

# 步骤4: 等待部署完成
echo "⏳ 步骤 4/4: 等待部署完成..."
kubectl rollout status deployment/crm-bantu-website -n $NAMESPACE --timeout=300s || {
    echo "⚠️  部署超时，请检查 Pod 状态"
    kubectl get pods -l app=crm-bantu-website -n $NAMESPACE
    exit 1
}
echo "✅ 部署完成！"
echo ""

# 显示部署信息
echo "📊 部署信息："
echo "=================================="
echo ""
echo "Pod 状态："
kubectl get pods -l app=crm-bantu-website -n $NAMESPACE
echo ""
echo "Service："
kubectl get svc crm-bantu-website -n $NAMESPACE
echo ""
echo "Ingress："
kubectl get ingress -n $NAMESPACE | grep crm-bantu-website || echo "Ingress 未找到"
echo ""
echo "🌐 访问地址："
if [ "$USE_HTTPS" = "true" ]; then
    echo "   https://www.crmbantu.space"
else
    echo "   http://www.crmbantu.space"
fi
echo ""
echo "💡 提示："
echo "   - 查看日志: kubectl logs -f deployment/crm-bantu-website -n $NAMESPACE"
echo "   - 查看状态: kubectl get all -l app=crm-bantu-website -n $NAMESPACE"
echo "   - 回滚部署: ./scripts/rollback.sh"
echo ""

