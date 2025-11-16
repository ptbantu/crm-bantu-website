# 快速部署指南

## 🚀 一键部署（推荐）

```bash
# 进入项目目录
cd /home/bantu/crm-bantu-website

# 执行快速部署脚本
./scripts/quick-deploy.sh
```

### 使用 HTTPS（需要先配置 cert-manager）

```bash
USE_HTTPS=true ./scripts/quick-deploy.sh
```

## 📋 手动部署步骤

### 1. 构建 Docker 镜像

```bash
docker build -t crm-bantu-website:latest .
```

### 2. 部署到 Kubernetes

```bash
# 应用所有配置
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress-http.yaml  # 或 ingress.yaml (HTTPS)
```

### 3. 检查部署状态

```bash
# 查看 Pod
kubectl get pods -l app=crm-bantu-website

# 查看 Service
kubectl get svc crm-bantu-website

# 查看 Ingress
kubectl get ingress
```

## 🔄 热部署/更新

### 方式1: 重新构建并部署

```bash
# 重新构建镜像
docker build -t crm-bantu-website:latest .

# 触发滚动更新
kubectl rollout restart deployment/crm-bantu-website
```

### 方式2: 更新镜像标签

```bash
# 构建新版本
docker build -t crm-bantu-website:v1.0.1 .

# 更新 Deployment
kubectl set image deployment/crm-bantu-website website=crm-bantu-website:v1.0.1

# 查看更新状态
kubectl rollout status deployment/crm-bantu-website
```

## 🔍 查看日志

```bash
# 实时查看日志
kubectl logs -f deployment/crm-bantu-website

# 查看特定 Pod 日志
kubectl logs <pod-name>
```

## 🛠️ 故障排查

### Pod 无法启动

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name>

# 查看事件
kubectl get events --sort-by='.lastTimestamp'
```

### 无法访问网站

1. 检查 Ingress 状态：
```bash
kubectl describe ingress crm-bantu-website
```

2. 检查 DNS 配置：
```bash
# 确保 www.crmbantu.space 指向 Ingress Controller 的 IP
nslookup www.crmbantu.space
```

3. 检查 Service：
```bash
kubectl get svc crm-bantu-website
kubectl describe svc crm-bantu-website
```

## ⚙️ 配置说明

### 修改域名

编辑以下文件中的 `host` 字段：
- `k8s/ingress.yaml`
- `k8s/ingress-http.yaml`

### 修改副本数

编辑 `k8s/deployment.yaml` 中的 `replicas` 字段。

### 修改资源限制

编辑 `k8s/deployment.yaml` 中的 `resources` 部分。

## 📝 注意事项

1. **首次部署建议使用 HTTP**：先使用 `ingress-http.yaml` 确保基本功能正常
2. **DNS 配置**：确保 `www.crmbantu.space` 已正确解析到 K8s 集群
3. **HTTPS 配置**：如需 HTTPS，需要先安装和配置 cert-manager
4. **镜像仓库**：如果使用私有仓库，需要配置 `imagePullSecrets`

## 🔗 相关文档

- 详细部署文档：`DEPLOY.md`
- 项目说明：`README.md`

