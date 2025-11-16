# 部署文档

## 快速部署

### 1. 构建 Docker 镜像

```bash
# 方式1: 使用构建脚本
chmod +x scripts/build.sh
./scripts/build.sh

# 方式2: 手动构建
docker build -t crm-bantu-website:latest .
```

### 2. 推送到镜像仓库（可选）

如果使用私有镜像仓库：

```bash
# 登录镜像仓库
docker login your-registry.com

# 打标签
docker tag crm-bantu-website:latest your-registry.com/crm-bantu-website:latest

# 推送
docker push your-registry.com/crm-bantu-website:latest
```

### 3. 部署到 Kubernetes

#### 方式1: 使用部署脚本（推荐）

```bash
chmod +x scripts/deploy.sh

# HTTP 部署
./scripts/deploy.sh

# HTTPS 部署（需要先配置 cert-manager）
USE_HTTPS=true ./scripts/deploy.sh
```

#### 方式2: 手动部署

```bash
# 应用所有配置
kubectl apply -f k8s/

# 或者分别应用
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml  # 或 ingress-http.yaml
```

### 4. 检查部署状态

```bash
# 查看 Pod 状态
kubectl get pods -l app=crm-bantu-website

# 查看 Service
kubectl get svc crm-bantu-website

# 查看 Ingress
kubectl get ingress

# 查看日志
kubectl logs -f deployment/crm-bantu-website
```

## 配置说明

### 域名配置

域名已配置为：`www.crmbantu.space`

如需修改，请编辑 `k8s/ingress.yaml` 和 `k8s/ingress-http.yaml` 中的 `host` 字段。

### HTTPS 配置

#### 使用 cert-manager（推荐）

1. 确保已安装 cert-manager：
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. 创建 ClusterIssuer：
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com  # 修改为你的邮箱
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

3. 使用 HTTPS Ingress：
```bash
kubectl apply -f k8s/ingress.yaml
```

#### 手动配置 SSL 证书

如果需要使用自己的 SSL 证书：

```bash
# 创建 Secret
kubectl create secret tls crm-bantu-website-tls \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key
```

### 热部署/滚动更新

K8s Deployment 已配置为滚动更新策略：

- `maxSurge: 1` - 最多允许超出期望副本数 1 个
- `maxUnavailable: 0` - 更新时不允许不可用

更新镜像触发滚动更新：

```bash
# 方式1: 更新镜像标签
kubectl set image deployment/crm-bantu-website website=crm-bantu-website:new-tag

# 方式2: 编辑 Deployment
kubectl edit deployment crm-bantu-website

# 方式3: 重新应用配置
kubectl apply -f k8s/deployment.yaml
```

查看更新状态：

```bash
kubectl rollout status deployment/crm-bantu-website
```

### 回滚

如果部署出现问题，可以快速回滚：

```bash
# 使用回滚脚本
chmod +x scripts/rollback.sh
./scripts/rollback.sh

# 或手动回滚
kubectl rollout undo deployment/crm-bantu-website

# 回滚到指定版本
kubectl rollout undo deployment/crm-bantu-website --to-revision=2
```

## 本地测试

使用 docker-compose 在本地测试：

```bash
docker-compose up -d

# 访问 http://localhost:8080
```

## 环境变量

可以通过修改 Deployment 配置添加环境变量：

```yaml
env:
- name: API_URL
  value: "https://api.example.com"
```

## 资源限制

当前配置的资源限制：

- Requests: 128Mi 内存, 100m CPU
- Limits: 256Mi 内存, 200m CPU

可根据实际需求调整 `k8s/deployment.yaml` 中的 `resources` 部分。

## 监控和日志

### 查看日志

```bash
# 实时日志
kubectl logs -f deployment/crm-bantu-website

# 查看特定 Pod 日志
kubectl logs <pod-name>
```

### 健康检查

应用提供了健康检查端点：`/health`

```bash
# 测试健康检查
curl http://www.crmbantu.space/health
```

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl describe pod <pod-name>

# 查看事件
kubectl get events --sort-by='.lastTimestamp'
```

### Ingress 无法访问

```bash
# 检查 Ingress 状态
kubectl describe ingress crm-bantu-website

# 检查 Nginx Ingress Controller
kubectl get pods -n ingress-nginx
```

### 镜像拉取失败

确保：
1. 镜像已正确构建和推送
2. K8s 节点可以访问镜像仓库
3. 如果使用私有仓库，已配置 `imagePullSecrets`

## CI/CD 集成

项目包含 GitHub Actions 工作流配置（`.github/workflows/deploy.yml`），可以配置自动部署。

需要配置的 Secrets：
- `REGISTRY_USERNAME` - 镜像仓库用户名
- `REGISTRY_PASSWORD` - 镜像仓库密码

## 注意事项

1. 首次部署建议先使用 HTTP Ingress (`ingress-http.yaml`) 测试
2. 确保 DNS 已正确配置指向 K8s Ingress Controller 的 IP
3. 生产环境建议启用 HTTPS
4. 定期备份配置和重要数据

