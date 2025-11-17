# Let's Encrypt 证书配置状态

## 当前状态

✅ **已完成：**
1. cert-manager v1.13.3 已安装
2. ClusterIssuer `letsencrypt-prod` 已创建并配置
3. 前端 Ingress 已更新，使用 cert-manager 自动管理证书
4. DNS 配置已优化（添加了自定义 DNS 服务器）
5. 验证资源已部署（Ingress、Service、Pod 都已创建）
6. 从外部访问验证 URL 成功（HTTP 200）

⏳ **进行中：**
- 证书申请正在进行中
- cert-manager 自检遇到 DNS 解析问题（将域名解析到 IPv6 localhost），但不影响 Let's Encrypt 的外部验证

## 配置说明

### 1. ClusterIssuer 配置
文件：`k8s/letsencrypt-issuer.yaml`
- 使用 Let's Encrypt 生产环境
- 支持 traefik ingress controller
- HTTP-01 验证方式

### 2. Ingress 配置
文件：`k8s/ingress-http.yaml`
- 已添加 `cert-manager.io/cluster-issuer: "letsencrypt-prod"` 注解
- TLS 配置指向 `crm-bantu-website-tls` Secret（cert-manager 会自动创建）

### 3. cert-manager DNS 配置
已为 cert-manager deployment 配置自定义 DNS：
- DNS 服务器：153.92.14.10, 1.1.1.1, 8.8.4.4
- DNS 选项：single-request-reopen, use-vc

## 验证证书状态

```bash
# 检查证书状态
kubectl get certificate -n default

# 查看证书详细信息
kubectl describe certificate crm-bantu-website-tls -n default

# 检查 Challenge 状态
kubectl get challenge -n default

# 检查 Order 状态
kubectl get order -n default

# 检查证书 Secret（证书申请成功后会自动创建）
kubectl get secret crm-bantu-website-tls -n default
```

## 故障排查

### 问题：cert-manager 自检失败
**现象：** cert-manager 日志显示 `dial tcp [::1]:80: connect: connection refused`

**原因：** cert-manager 在 pod 内部进行自检时，DNS 解析将域名解析到 IPv6 localhost

**解决方案：**
1. 从外部访问验证 URL 是成功的，Let's Encrypt 应该能够完成验证
2. cert-manager 的自检失败不应该阻止 Let's Encrypt 的外部验证
3. 如果证书申请仍然失败，可以：
   - 等待更长时间（Let's Encrypt 可能需要几分钟来完成验证）
   - 检查 Let's Encrypt 的验证日志
   - 手动触发证书重新申请

### 手动触发证书重新申请

如果证书申请失败，可以删除相关资源让 cert-manager 重新创建：

```bash
# 删除 Challenge（cert-manager 会自动重新创建）
kubectl delete challenge -n default --all

# 删除 Order（cert-manager 会自动重新创建）
kubectl delete order -n default --all

# 删除 Certificate（cert-manager 会自动重新创建）
kubectl delete certificate crm-bantu-website-tls -n default
```

## 证书自动续期

cert-manager 会自动：
- 监控证书过期时间
- 在到期前 30 天自动续期
- 更新 Secret 中的证书
- Ingress 自动使用新证书

无需手动操作！

## 测试验证 URL

```bash
# 获取验证 Token
TOKEN=$(kubectl describe challenge -n default | grep "Token:" | head -1 | awk '{print $2}')

# 测试验证 URL（应该返回 200 和验证内容）
curl "http://www.crmbantu.space/.well-known/acme-challenge/$TOKEN"
```

## 注意事项

1. **DNS 传播时间：** 确保 `www.crmbantu.space` 正确解析到服务器 IP
2. **Let's Encrypt 速率限制：** 生产环境每周每个域名最多 50 个证书
3. **证书有效期：** Let's Encrypt 证书有效期为 90 天，cert-manager 会自动续期
4. **验证方式：** 当前使用 HTTP-01 验证，需要确保 HTTP（80 端口）可访问

