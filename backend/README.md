# Vela 电商后端

基于 NestJS + Supabase 的电商后端 API

## 功能特性

- ✅ JWT 认证（注册、登录）
- ✅ 产品管理（CRUD、分页、搜索）
- ✅ 分类管理
- ✅ 购物车管理
- ✅ 订单创建（含库存校验）
- ✅ 支付 Mock
- ✅ Row Level Security (RLS)

## 技术栈

- NestJS 10
- TypeScript
- Supabase (Postgres + Auth)
- JWT
- Class Validator

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
PORT=3000
```

### 3. 运行开发服务器

```bash
npm run start:dev
```

服务器将在 http://localhost:3000/api 启动

## API 文档

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取当前用户信息（需认证）

### 产品相关

- `GET /api/products` - 获取产品列表（支持分页、搜索、分类过滤）
- `GET /api/products/:id` - 获取产品详情
- `POST /api/products` - 创建产品
- `PATCH /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

### 分类相关

- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类

### 购物车相关

- `GET /api/cart` - 获取购物车（需认证）
- `POST /api/cart` - 添加到购物车（需认证）
- `PATCH /api/cart/:id` - 更新购物车项（需认证）
- `DELETE /api/cart/:id` - 删除购物车项（需认证）
- `DELETE /api/cart` - 清空购物车（需认证）

### 订单相关

- `POST /api/orders` - 创建订单（需认证）
- `GET /api/orders` - 获取订单列表（需认证）
- `GET /api/orders/:id` - 获取订单详情（需认证）
- `POST /api/orders/:id/cancel` - 取消订单（需认证）

### 支付相关

- `POST /api/payments/create` - 创建支付（Mock）
- `POST /api/payments/callback` - 支付回调（Mock）

## 项目结构

```
src/
├── auth/              # 认证模块
├── users/             # 用户模块
├── products/          # 产品模块
├── categories/        # 分类模块
├── cart/              # 购物车模块
├── orders/            # 订单模块
├── payments/          # 支付模块
├── database/          # 数据库模块
├── app.module.ts      # 根模块
└── main.ts            # 入口文件
```

## 开发命令

```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 代码格式化
npm run format

# 代码检查
npm run lint
```
