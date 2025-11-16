#!/bin/bash

# 回滚脚本
set -e

NAMESPACE=${NAMESPACE:-default}

echo "🔄 开始回滚部署..."

# 查看部署历史
echo "📜 部署历史："
kubectl rollout history deployment/crm-bantu-website -n $NAMESPACE

# 回滚到上一个版本
echo "⏪ 回滚到上一个版本..."
kubectl rollout undo deployment/crm-bantu-website -n $NAMESPACE

# 等待回滚完成
echo "⏳ 等待回滚完成..."
kubectl rollout status deployment/crm-bantu-website -n $NAMESPACE

echo "✅ 回滚完成！"

