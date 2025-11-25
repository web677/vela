# Vela Backend - 生产部署指南

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- Supabase 项目（已配置数据库）

## 🚀 部署步骤

### 方法 1：使用部署脚本（推荐）

#### Linux/macOS

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 填入真实值

# 2. 赋予脚本执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh
```

#### Windows

```powershell
# 1. 配置环境变量
Copy-Item .env.example .env
# 编辑 .env 填入真实值

# 2. 运行部署脚本
.\deploy.ps1
```

### 方法 2：手动部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 2. 构建镜像
docker-compose build

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f vela-api
```

## 🔧 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f vela-api

# 重启服务
docker-compose restart vela-api

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v

# 重新构建并启动
docker-compose up -d --build
```

## 📊 健康检查

服务启动后会自动进行健康检查：

- **检查间隔**：30秒
- **超时时间**：3秒
- **重试次数**：3次
- **启动时间**：40秒

手动检查健康状态：

```bash
# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' vela-backend

# 测试 API 端点
curl http://localhost:3000/api/categories
```

## 🔐 环境变量配置

必需的环境变量：

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d

# 可选
FRONTEND_URL=https://your-frontend-domain.com
```

## 🌐 云部署

### 部署到 AWS ECS

1. 构建并推送镜像到 ECR
2. 创建 ECS 任务定义
3. 配置环境变量
4. 部署服务

### 部署到 Google Cloud Run

```bash
# 构建镜像
docker build -t gcr.io/YOUR_PROJECT/vela-api .

# 推送到 GCR
docker push gcr.io/YOUR_PROJECT/vela-api

# 部署
gcloud run deploy vela-api \
  --image gcr.io/YOUR_PROJECT/vela-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=xxx,JWT_SECRET=xxx"
```

### 部署到 Railway/Render

1. 连接 GitHub 仓库
2. 选择 Dockerfile 部署
3. 配置环境变量
4. 自动部署

## 📝 注意事项

### 安全

1. **永不提交 .env 文件**到版本控制
2. **使用强随机密钥**作为 JWT_SECRET
3. **限制 CORS**：生产环境设置具体域名
4. **使用 HTTPS**：生产环境必须启用 SSL

### 性能

1. **资源限制**：根据实际需求调整 docker-compose.yml 中的资源限制
2. **并发连接**：考虑使用 PM2 或增加容器副本
3. **数据库连接池**：配置合适的连接池大小

### 监控

1. **日志收集**：使用 ELK/Loki 收集日志
2. **应用监控**：集成 Sentry/DataDog
3. **性能追踪**：添加 APM 工具

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs vela-api

# 检查配置
docker-compose config

# 验证环境变量
docker-compose run vela-api env
```

### 健康检查失败

```bash
# 进入容器调试
docker-compose exec vela-api sh

# 测试端点
docker-compose exec vela-api wget -O- http://localhost:3000/api/categories
```

### 连接 Supabase 失败

1. 检查 SUPABASE_URL 是否正确
2. 验证 API Key 是否有效
3. 确认网络连接

## 📊 监控指标

建议监控以下指标：

- CPU 使用率
- 内存使用率
- HTTP 响应时间
- 错误率
- 请求量

## 🔄 零停机更新

```bash
# 1. 构建新镜像
docker-compose build

# 2. 滚动更新
docker-compose up -d --no-deps --build vela-api

# 3. 验证新版本
curl http://localhost:3000/api/categories

# 4. 如需回滚
docker-compose down
docker-compose up -d
```

## 📞 获取帮助

- [NestJS 文档](https://docs.nestjs.com)
- [Docker 文档](https://docs.docker.com)
- [Supabase 文档](https://supabase.com/docs)
