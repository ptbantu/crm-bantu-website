# 开发模式 - 热部署指南

## 本地开发（使用 Docker Compose）

### 启动开发服务器（支持热部署）

```bash
# 启动开发模式
docker-compose up website-dev

# 或者后台运行
docker-compose up -d website-dev
```

访问：http://localhost:5173

### 停止开发服务器

```bash
docker-compose down website-dev
```

## Kubernetes 开发部署

### 构建开发镜像

```bash
docker build -f Dockerfile.dev -t crm-bantu-website:dev .
```

### 部署到 K8s

```bash
# 部署开发版本
kubectl apply -f k8s/deployment-dev.yaml
kubectl apply -f k8s/service-dev.yaml

# 查看状态
kubectl get pods -l app=crm-bantu-website-dev
```

### 端口转发（访问开发服务器）

```bash
# 转发端口到本地
kubectl port-forward svc/crm-bantu-website-dev 5173:5173

# 然后访问 http://localhost:5173
```

## 热部署特性

- ✅ **热模块替换 (HMR)** - 代码更改立即反映，无需刷新页面
- ✅ **文件监听** - 自动检测文件变化
- ✅ **快速重载** - 保持应用状态的同时更新代码
- ✅ **开发工具** - 完整的 Vite 开发工具支持

## 注意事项

1. **开发模式使用更多资源** - 建议仅在开发环境使用
2. **文件监听** - 在 Docker 中需要启用 `CHOKIDAR_USEPOLLING=true`
3. **端口映射** - 开发模式使用 5173 端口（Vite 默认端口）
4. **生产部署** - 生产环境请使用 `Dockerfile`（Nginx 模式）

## 环境变量

- `NODE_ENV=development` - 开发模式
- `CHOKIDAR_USEPOLLING=true` - 在 Docker 中启用文件监听

