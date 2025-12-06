# Vela Docker 部署指南

本文档提供 Vela 电商平台的完整 Docker 部署方案，包括开发环境和生产环境的部署说明。

## 📋 目录

- [架构概览](#架构概览)
- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)
- [维护管理](#维护管理)

## 🏗️ 架构概览

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0

验证安装：

```bash
docker --version
docker-compose --version
```

### 云服务账号

- [Supabase](https://supabase.com) - 数据库服务
- [阿里云](https://www.aliyun.com) - 短信验证码、图形验证码
- [Ping++](https://www.pingxx.com) - 支付服务

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd vela
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填写实际的配置
notepad .env  # Windows
# 或
vim .env      # Linux/Mac
```

> [!IMPORTANT]
> 必须配置以下关键环境变量：
>
> - `SUPABASE_URL` 和密钥
> - `JWT_SECRET`
> - `REDIS_PASSWORD`（生产环境）
> - 阿里云和 Ping++ 的 API 密钥

### 3. 启动服务

````bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
### 启动开发环境

```bash
# 使用开发配置启动
docker-compose -f docker-compose.dev.yml up -d

# 查看实时日志
docker-compose -f docker-compose.dev.yml logs -f backend
````

### 开发环境特性

- ✅ **热重载** - 代码修改自动重启
- ✅ **源码挂载** - 本地修改实时同步

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Backend",
      "port": 9229,
      "restart": true,
      "sourceMaps": true
    }
  ]
}
```

## 🌐 生产环境部署

生产环境配置包含资源限制、日志管理、健康检查等企业级特性。

### 部署步骤

#### 1. 准备环境变量

```bash
# 复制生产环境变量模板
cp .env.example .env.production

# 编辑配置（使用强密码！）
vim .env.production
```

> [!WARNING] > **生产环境安全清单**：
>
> - ✅ 使用强随机密码（至少 32 字符）
> - ✅ 启用 Redis 密码认证
> - ✅ 使用 HTTPS（配置 SSL 证书）
> - ✅ 限制数据库访问 IP
> - ✅ 定期备份数据

#### 2. 配置 Nginx SSL（可选但推荐）

如果需要 HTTPS，创建 SSL 证书目录：

```bash
mkdir -p nginx/ssl
# 将 SSL 证书放入此目录
# - nginx/ssl/cert.pem
# - nginx/ssl/key.pem
```

#### 3. 构建镜像

```bash
# 构建生产镜像
docker-compose -f docker-compose.prod.yml build

# 或单独构建
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

#### 4. 启动服务

```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 验证所有服务健康
docker-compose -f docker-compose.prod.yml ps
```

#### 5. 验证部署

```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 测试 API 健康检查
curl http://localhost:3580/health

# 测试前端
curl http://localhost:8088/
```

### 生产环境特性

- ✅ **资源限制** - CPU 和内存上限
- ✅ **健康检查** - 自动重启不健康的容器
- ✅ **日志轮转** - 防止日志文件过大
- ✅ **数据持久化** - Redis 数据持久化存储
- ✅ **非 Root 用户** - 提升安全性
- ✅ **Nginx 反向代理** - 提供 SSL 终止和缓存

## 🔐 环境变量配置

### Supabase 配置

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

获取方式：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 → Settings → API
3. 复制 URL 和 Keys

### JWT 配置

```bash
JWT_SECRET=your-super-secret-random-string-at-least-32-characters
JWT_EXPIRES_IN=7d
```

生成强密钥：

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Redis 配置

```bash
REDIS_HOST=redis          # Docker 内部使用服务名
REDIS_PORT=6389
REDIS_PASSWORD=your-redis-password-here
```

> [!TIP]
> 开发环境可以不设置 `REDIS_PASSWORD`，生产环境**必须**设置强密码。

### 阿里云配置

#### 短信服务

```bash
ALIYUN_ACCESS_KEY_ID=LTAI5t...
ALIYUN_ACCESS_KEY_SECRET=xxx...
SMS_SIGN_NAME=Vela商城
SMS_TEMPLATE_CODE=SMS_123456789
```

#### 图形验证码

```bash
ALIYUN_CAPTCHA_APP_ID=xxx
ALIYUN_CAPTCHA_APP_KEY=xxx
```

获取方式：

1. [阿里云控制台](https://home.console.aliyun.com)
2. 短信服务 / 验证码服务
3. 创建应用并获取密钥

### Ping++ 支付配置

```bash
PINGPP_API_KEY=sk_live_xxx
PINGPP_APP_ID=app_xxx
```

获取方式：

1. 登录 [Ping++ Dashboard](https://dashboard.pingxx.com)
2. 应用管理 → API Keys

### 前端环境变量

```bash
VITE_API_BASE_URL=/api
VITE_PINGPP_API_KEY=pk_live_xxx  # 前端公钥，非 sk_
VITE_ALIYUN_CAPTCHA_APP_ID=xxx
```

## ❓ 常见问题

### 容器无法启动

**问题**: Backend 容器一直重启

```bash
# 查看详细日志
docker-compose logs backend

# 常见原因：
# 1. 环境变量未配置
# 2. Supabase 连接失败
# 3. Redis 连接失败
```

**解决方案**:

```bash
# 检查环境变量
docker-compose config

# 验证 Redis 连接
docker-compose exec redis redis-cli ping

# 重新构建
docker-compose build --no-cache backend
```

### 端口被占用

**问题**: `Error: Port 3580 is already allocated`

```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3580

# 杀死进程
taskkill /PID <PID> /F

# 或修改 docker-compose.yml 中的端口映射
ports:
  - "3581:3580"  # 使用 3581 代替 3580
```

### 数据持久化问题

**问题**: 容器重启后 Redis 数据丢失

```bash
# 检查 volume 是否正确创建
docker volume ls | grep redis

# 如果没有，确保 docker-compose.yml 中有 volumes 配置
volumes:
  redis-data:
    driver: local
```

### 网络连接问题

**问题**: Frontend 无法连接 Backend

```bash
# 确保所有服务在同一网络
docker network inspect vela-network

# 在 frontend 容器内测试
docker-compose exec frontend ping backend

# 检查 nginx.conf 中的 proxy_pass 配置
proxy_pass http://backend:3580;  # 使用服务名，不是 localhost
```

### 镜像构建缓慢

**优化建议**:

```bash
# 使用国内镜像源（在 Dockerfile 中添加）
RUN npm config set registry https://registry.npmmirror.com

# 使用构建缓存
docker-compose build

# 只重建特定服务
docker-compose build backend
```

## 🔧 维护管理

### 查看日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend

# 最近 100 行
docker-compose logs --tail=100 backend
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 停止并重新启动
docker-compose down
docker-compose up -d
```

### 数据备份

#### Redis 数据备份

```bash
# 创建备份
docker-compose exec redis redis-cli SAVE
docker cp vela-redis:/data/dump.rdb ./backup/redis-$(date +%Y%m%d).rdb

# 恢复备份
docker cp ./backup/redis-20231201.rdb vela-redis:/data/dump.rdb
docker-compose restart redis
```

#### 清理资源

```bash
# 停止并删除容器
docker-compose down

# 删除所有数据（包括 volumes）
docker-compose down -v

# 清理未使用的镜像
docker image prune -a

# 清理未使用的 volume
docker volume prune
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose down
docker-compose up -d

# 或使用一条命令
docker-compose up -d --build
```

### 监控服务资源

```bash
# 查看资源使用情况
docker stats

# 查看特定容器
docker stats vela-backend vela-frontend vela-redis
```

## 📝 附录

### 文件结构

```
vela/
├── backend/
│   ├── Dockerfile              # 后端 Dockerfile
│   ├── .dockerignore          # 构建忽略文件
│   └── src/                   # 源代码
├── frontend/
│   ├── Dockerfile             # 前端 Dockerfile
│   ├── nginx.conf             # Nginx 配置
│   ├── .dockerignore         # 构建忽略文件
│   └── src/                  # 源代码
├── docker-compose.yml         # 默认配置（生产）
├── docker-compose.dev.yml     # 开发环境配置
├── docker-compose.prod.yml    # 生产环境配置
├── .env.example              # 环境变量模板
└── DOCKER_DEPLOYMENT.md      # 本文档
```

### 有用的命令

```bash
# 进入容器 shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec redis redis-cli

# 查看容器内进程
docker-compose exec backend ps aux

# 检查网络连接
docker-compose exec backend ping redis
docker-compose exec backend curl http://localhost:3580/health

# 导出/导入镜像
docker save vela-backend:latest | gzip > vela-backend.tar.gz
docker load < vela-backend.tar.gz
```

---

## 📞 支持

如有问题，请：

1. 查看本文档的[常见问题](#常见问题)章节
2. 查看容器日志：`docker-compose logs -f`
3. 提交 Issue 到项目仓库

**祝部署顺利！** 🎉
