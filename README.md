# Vela 电商平台

完整的全栈电商解决方案，基于 Vue 3 + NestJS + Supabase。

## 📖 项目文档

- [系统架构设计](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/vela-architecture.md)
- [数据库 SQL](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/supabase-schema.sql)
- [后端实现总结](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/backend-summary.md)
- [前端骨架总结](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/frontend-skeleton-summary.md)
- [页面实现总结](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/pages-implementation-summary.md)
- **[🚀 本地运行指南](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/deployment-guide.md)** ← 从这里开始

## ✨ 功能特性

### 前台功能

- ✅ 产品浏览（列表、详情、搜索、过滤）
- ✅ 购物车管理
- ✅ 用户注册/登录
- ✅ 订单创建（支持游客和登录用户）
- ✅ 订单管理（查看、取消）

### 后台功能

- ✅ JWT 认证
- ✅ 产品 CRUD
- ✅ 库存管理
- ✅ 订单处理
- ✅ 支付 Mock

## 🛠️ 技术栈

### 前端

- Vue 3 (Composition API)
- Vite
- Pinia (状态管理)
- Vue Router 4
- Axios

### 后端

- NestJS
- TypeScript
- Passport JWT
- Class Validator

### 数据库

- Supabase (PostgreSQL)
- Supabase Auth
- Row Level Security (RLS)

## 📁 项目结构

```
vela/
├── backend/              # NestJS 后端 API
│   ├── src/
│   │   ├── auth/         # 认证模块
│   │   ├── users/        # 用户模块
│   │   ├── products/     # 产品模块
│   │   ├── categories/   # 分类模块
│   │   ├── cart/         # 购物车模块
│   │   ├── orders/       # 订单模块
│   │   ├── payments/     # 支付模块
│   │   └── database/     # 数据库模块
│   ├── .env.example
│   └── package.json
│
├── frontend/             # Vue 3 前端应用
│   ├── src/
│   │   ├── api/          # API 客户端
│   │   ├── components/   # Vue 组件
│   │   ├── views/        # 页面视图
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── router/       # 路由配置
│   │   ├── utils/        # 工具函数
│   │   └── assets/       # 静态资源
│   ├── .env.example
│   └── package.json
│
└── README.md             # 本文档
```

## 🚀 快速开始

### 前置要求

- Node.js v18+
- npm v9+
- Supabase 账号

### 安装步骤

详细步骤请查看 **[本地运行指南](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/deployment-guide.md)**

```bash
# 1. 克隆仓库（如果从 Git 获取）
git clone <repository-url>
cd vela

# 2. 设置 Supabase（见部署指南）
# - 创建项目
# - 执行 SQL 脚本

# 3. 安装后端依赖
cd backend
npm install
cp .env.example .env
# 编辑 .env 填入 Supabase 凭证
npm run start:dev

# 4. 安装前端依赖（新终端）
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api

## 📊 数据库设计

### 核心表

- `user_profiles` - 用户扩展信息
- `categories` - 产品分类
- `products` - 产品信息
- `cart_items` - 购物车项
- `orders` - 订单
- `order_items` - 订单项

## 🎨 UI 设计

- 现代暗黑主题
- 响应式布局（移动端友好）
- 流畅动画效果
- 紫色主色调 + 玻璃态设计

## 📝 开发命令

### 后端

```bash
npm run start:dev    # 开发模式
npm run build        # 构建
npm run start:prod   # 生产运行
```

### 前端

```bash
npm run dev          # 开发模式
npm run build        # 构建
npm run preview      # 预览构建
```

## 🔒 安全特性

- JWT 认证
- Supabase Row Level Security (RLS)
- 密码加密（Supabase Auth）
- CORS 配置
- 输入验证（Class Validator）

## 📖 API 文档

主要 API 端点：

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/products` - 获取产品列表
- `GET /api/products/:id` - 获取产品详情
- `POST /api/cart` - 添加到购物车
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表

完整 API 文档见 [系统架构设计](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/vela-architecture.md)

## 🐛 故障排查

常见问题请参考 [部署指南的故障排查部分](/.gemini/antigravity/brain/7f6499e6-5886-4621-b0b3-eac567ab10de/deployment-guide.md#🔧-常见问题)

## 📄 许可证

MIT

---

**开发者**: Vela Team  
**版本**: 1.0.0
