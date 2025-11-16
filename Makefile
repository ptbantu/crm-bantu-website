.PHONY: build deploy quick-deploy rollback logs status clean

# 默认变量
IMAGE_NAME ?= crm-bantu-website
IMAGE_TAG ?= latest
NAMESPACE ?= default
USE_HTTPS ?= false

# 构建镜像
build:
	@echo "🔨 构建 Docker 镜像..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "✅ 构建完成"

# 快速部署
quick-deploy:
	@echo "🚀 快速部署..."
	./scripts/quick-deploy.sh

# 部署到 K8s
deploy:
	@echo "📦 部署到 Kubernetes..."
	USE_HTTPS=$(USE_HTTPS) ./scripts/deploy.sh

# 回滚
rollback:
	@echo "⏪ 回滚部署..."
	./scripts/rollback.sh

# 查看日志
logs:
	@echo "📋 查看日志..."
	kubectl logs -f deployment/crm-bantu-website -n $(NAMESPACE)

# 查看状态
status:
	@echo "📊 部署状态："
	@echo ""
	@echo "Pods:"
	@kubectl get pods -l app=crm-bantu-website -n $(NAMESPACE)
	@echo ""
	@echo "Service:"
	@kubectl get svc crm-bantu-website -n $(NAMESPACE)
	@echo ""
	@echo "Ingress:"
	@kubectl get ingress -n $(NAMESPACE) | grep crm-bantu-website || echo "未找到 Ingress"

# 清理（删除所有资源）
clean:
	@echo "🧹 清理资源..."
	kubectl delete -f k8s/ || true
	@echo "✅ 清理完成"

# 本地测试
test:
	@echo "🧪 本地测试..."
	docker-compose up -d
	@echo "✅ 服务已启动，访问 http://localhost:8080"

# 停止本地测试
test-stop:
	@echo "🛑 停止本地测试..."
	docker-compose down

# 帮助信息
help:
	@echo "可用命令："
	@echo "  make build          - 构建 Docker 镜像"
	@echo "  make quick-deploy   - 快速部署（推荐）"
	@echo "  make deploy         - 部署到 K8s"
	@echo "  make rollback       - 回滚部署"
	@echo "  make logs           - 查看日志"
	@echo "  make status         - 查看部署状态"
	@echo "  make test           - 本地测试"
	@echo "  make clean          - 清理所有资源"
	@echo ""
	@echo "环境变量："
	@echo "  IMAGE_NAME          - 镜像名称（默认: crm-bantu-website）"
	@echo "  IMAGE_TAG           - 镜像标签（默认: latest）"
	@echo "  NAMESPACE           - K8s 命名空间（默认: default）"
	@echo "  USE_HTTPS           - 使用 HTTPS（默认: false）"

