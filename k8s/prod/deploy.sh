#!/bin/bash
# ============================================================
# 前端生产环境部署脚本
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}前端生产环境部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 部署 ClusterIssuer（如果不存在）
echo -e "${YELLOW}1. 部署 Let's Encrypt ClusterIssuer...${NC}"
if kubectl get clusterissuer letsencrypt-prod >/dev/null 2>&1; then
    echo -e "${GREEN}✓ ClusterIssuer letsencrypt-prod 已存在${NC}"
else
    kubectl apply -f k8s/prod/letsencrypt-issuer.yaml
    echo -e "${GREEN}✓ ClusterIssuer 已创建${NC}"
fi

# 2. 部署 Deployment
echo -e "${YELLOW}2. 部署 Deployment...${NC}"
kubectl apply -f k8s/prod/deployment.yaml
echo -e "${GREEN}✓ Deployment 已部署${NC}"

# 3. 部署 Service
echo -e "${YELLOW}3. 部署 Service...${NC}"
kubectl apply -f k8s/prod/service.yaml
echo -e "${GREEN}✓ Service 已部署${NC}"

# 4. 部署 Ingress
echo -e "${YELLOW}4. 部署 Ingress...${NC}"
kubectl apply -f k8s/prod/ingress.yaml
echo -e "${GREEN}✓ Ingress 已部署${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 5. 等待 Pod 就绪
echo -e "${YELLOW}等待 Pod 就绪...${NC}"
kubectl wait --for=condition=ready pod \
    -l app=crm-bantu-website,environment=production \
    --timeout=300s || true

# 6. 显示状态
echo ""
echo -e "${GREEN}部署状态：${NC}"
echo ""
echo "Pods:"
kubectl get pods -l app=crm-bantu-website,environment=production
echo ""
echo "Service:"
kubectl get svc crm-bantu-website
echo ""
echo "Ingress:"
kubectl get ingress crm-bantu-website
echo ""

# 7. 检查证书状态
echo -e "${YELLOW}检查证书状态...${NC}"
if kubectl get certificate crm-bantu-website-tls >/dev/null 2>&1; then
    echo "Certificate 状态:"
    kubectl get certificate crm-bantu-website-tls
    echo ""
    echo "Certificate 详情:"
    kubectl describe certificate crm-bantu-website-tls | grep -A 5 "Status\|Events" || true
else
    echo -e "${YELLOW}⚠️  Certificate 尚未创建，cert-manager 正在处理...${NC}"
    echo "   证书申请可能需要几分钟时间"
fi

echo ""
echo -e "${GREEN}访问地址：${NC}"
echo "  - https://oa.bantuqifu.com"
echo "  - https://www.oabantuqifu.com"
echo ""
echo -e "${YELLOW}注意：${NC}"
echo "  - 首次部署，SSL 证书申请可能需要 5-10 分钟"
echo "  - 可以通过以下命令查看证书状态："
echo "    kubectl get certificate crm-bantu-website-tls"
echo "    kubectl describe certificate crm-bantu-website-tls"

