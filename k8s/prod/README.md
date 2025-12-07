# 前端生产环境部署配置

## 文件说明

- `deployment.yaml` - Kubernetes Deployment 配置
- `service.yaml` - Kubernetes Service 配置
- `ingress.yaml` - Kubernetes Ingress 配置（域名：oa.bantuqifu.com 和 www.oabantuqifu.com）

## 部署步骤

### 1. 构建 Docker 镜像

```bash
cd /home/bantu/crm-bantu-website
./scripts/build-prod.sh
```

或者手动构建：

```bash
docker build -f Dockerfile.prod -t crm-bantu-website:latest .
```

### 2. 部署到 Kubernetes

```bash
# 部署 Deployment 和 Service
kubectl apply -f k8s/prod/deployment.yaml
kubectl apply -f k8s/prod/service.yaml

# 部署 Ingress
kubectl apply -f k8s/prod/ingress.yaml
```

### 3. 验证部署

```bash
# 检查 Pod 状态
kubectl get pods -l app=crm-bantu-website

# 检查 Service
kubectl get svc crm-bantu-website

# 检查 Ingress
kubectl get ingress crm-bantu-website
```

## 配置说明

### API 地址配置

前端在构建时会通过 `Dockerfile.prod` 中的环境变量 `VITE_API_BASE_URL` 设置后端 API 地址：
- 生产环境：`https://www.bantuqifu.xin`

### 域名配置

- 主域名：`oa.bantuqifu.com`
- 备用域名：`www.oabantuqifu.com`

两个域名都指向同一个 Service，cert-manager 会自动为两个域名申请 SSL 证书。

## 注意事项

1. **环境变量**：Vite 的环境变量需要在构建时设置，运行时无法修改。因此 `deployment.yaml` 中的环境变量仅用于运行时配置，不会影响 API 地址。

2. **镜像构建**：确保使用 `Dockerfile.prod` 构建镜像，而不是 `Dockerfile` 或 `Dockerfile.dev`。

3. **SSL 证书**：cert-manager 会自动为域名申请 Let's Encrypt 证书，首次部署可能需要几分钟时间。

4. **资源限制**：当前配置的资源限制为：
   - 请求：128Mi 内存，100m CPU
   - 限制：256Mi 内存，200m CPU
