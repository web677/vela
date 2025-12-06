# 环境变量配置说明

## 📋 文件说明

### 根目录文件

- **`.env`** - 🔒 **实际配置文件**（包含真实密钥，不提交到 Git）
- **`.env.example`** - 📖 **配置模板**（提交到 Git，供团队参考）

### 子目录文件（已废弃）

- `backend/.env` - ⚠️ 不再使用，所有配置统一到根目录 `.env`
- `frontend/.env` - ⚠️ 不再使用，所有配置统一到根目录 `.env`

## ✅ 推荐的配置方案（当前方案）

### 统一配置到根目录

```
vela/
├── .env              ← 真实配置（本地/服务器使用）
├── .env.example      ← 模板文件（提交到 Git）
├── .gitignore        ← 确保 .env 被忽略
├── docker-compose.yml
├── backend/
└── frontend/
```

**优点：**

- ✅ 集中管理，避免配置分散
- ✅ Docker Compose 自动读取根目录 `.env`
- ✅ 统一的环境变量命名
- ✅ 易于维护和更新

## 🚀 使用方法

### 1. 初次配置

```bash
# 进入项目根目录
cd vela

# 复制模板文件
cp .env.example .env

# 编辑 .env 填写真实配置
notepad .env  # Windows
# 或
vim .env      # Linux/Mac
```

### 2. Docker Compose 使用

Docker Compose **自动读取**根目录 `.env` 文件：

```bash
# 直接启动，无需额外配置
docker-compose up -d

# docker-compose.yml 中使用 ${VARIABLE_NAME} 引用
```

### 3. 本地开发使用

#### Backend (NestJS)

```bash
cd backend
npm run start:dev
# NestJS 自动读取父目录的 .env（通过 @nestjs/config）
```

#### Frontend (Vite)

```bash
cd frontend
npm run dev
# Vite 自动读取根目录的 .env
```

## 🔐 安全最佳实践

### ✅ 正确做法

1. **`.env` 文件不提交到 Git**

   ```gitignore
   # .gitignore
   .env
   .env.local
   ```

2. **使用 `.env.example` 作为模板**

   - 包含所有必需的环境变量名
   - 使用占位符而非真实值
   - 提交到 Git 供团队参考

3. **不同环境使用不同的值**
   - 开发环境：测试密钥
   - 生产环境：生产密钥
   - CI/CD：通过平台管理（GitHub Secrets、GitLab CI/CD Variables）

### ❌ 错误做法

1. ❌ 将 `.env` 提交到 Git

   ```bash
   # 千万不要这样做！
   git add .env
   git commit -m "add env"
   ```

   **后果：** API 密钥、数据库凭证泄露！

2. ❌ 在代码中硬编码密钥

   ```javascript
   // 错误示例
   const apiKey = "sk_live_xxxxx"; // 不要这样！

   // 正确示例
   const apiKey = process.env.PINGPP_API_KEY;
   ```

3. ❌ 在公共仓库暴露敏感信息

## 📝 环境变量分类

### Backend 环境变量

```bash
# 数据库
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 认证
JWT_SECRET=
JWT_EXPIRES_IN=

# 缓存
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# 第三方服务
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
PINGPP_API_KEY=
PINGPP_APP_ID=
```

### Frontend 环境变量

```bash
# Vite 环境变量必须以 VITE_ 开头
VITE_API_BASE_URL=
VITE_PINGPP_API_KEY=
VITE_ALIYUN_CAPTCHA_APP_ID=
```

> **注意：** Frontend 环境变量会被编译到前端代码中，因此：
>
> - ✅ 可以包含：公共 API Key（如 Ping++ 公钥）
> - ❌ 不能包含：私密密钥（如 Ping++ 私钥、数据库密码）

## 🔄 环境变量优先级

### Docker Compose

1. `docker-compose.yml` 中的 `environment` 配置
2. 根目录 `.env` 文件
3. 系统环境变量

### 本地开发

1. `.env.local`（如果存在）
2. `.env`
3. 系统环境变量

## 🛠️ 常见问题

### Q1: 为什么我的环境变量没有生效？

**检查清单：**

```bash
# 1. 确认 .env 文件位置正确（项目根目录）
ls -la .env

# 2. 确认变量名称正确（大小写敏感）
cat .env | grep SUPABASE_URL

# 3. Docker Compose 重新加载配置
docker-compose down
docker-compose up -d

# 4. 本地开发重启服务
# Ctrl+C 停止，然后重新运行
npm run start:dev
```

### Q2: 如何在不同环境使用不同配置？

**方法 1: 使用不同的 .env 文件**

```bash
# 开发环境
cp .env.development .env

# 生产环境
cp .env.production .env
```

**方法 2: 使用 docker-compose 覆盖**

```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Q3: 团队成员如何同步配置？

1. **首次克隆项目：**

   ```bash
   git clone <repo>
   cd vela
   cp .env.example .env
   # 向团队负责人索要真实配置
   ```

2. **配置更新时：**
   - 更新 `.env.example` 并提交
   - 通知团队成员更新本地 `.env`
   - 通过安全方式（如加密通讯）分享新增的密钥

### Q4: 如果不小心提交了 .env 怎么办？

```bash
# 1. 立即从 Git 历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 强制推送
git push origin --force --all

# 3. 重要！立即更换所有泄露的密钥
# - Supabase: 重置 Service Role Key
# - JWT: 生成新的 SECRET
# - Ping++: 重新生成 API Key
# - 阿里云: 禁用旧 Access Key，创建新的
```

## 📚 相关文档

- [Docker 部署指南](DOCKER_DEPLOYMENT.md)
- [项目主页](README.md)

---

**记住：环境变量是保护应用安全的第一道防线！** 🔒
