# Vela 电商前端

基于 Vue 3 + Vite + Pinia 的现代电商前端应用

## 功能特性

- ✅ Vue 3 Composition API
- ✅ Vite 快速构建
- ✅ Pinia 状态管理
- ✅ Vue Router 路由管理
- ✅ Axios HTTP 客户端
- ✅ 现代暗黑主题设计
- ✅ 响应式布局
- ✅ 动画和过渡效果

## 技术栈

- Vue 3
- Vite
- Pinia
- Vue Router 4
- Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. 运行开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── api/               # API 客户端
│   ├── client.js      # Axios 配置
│   ├── auth.js        # 认证 API
│   ├── product.js     # 产品 API
│   ├── cart.js        # 购物车 API
│   └── order.js       # 订单 API
├── assets/            # 静态资源
│   └── styles/        # 样式文件
├── components/        # 组件
│   ├── common/        # 通用组件
│   ├── product/       # 产品组件
│   ├── cart/          # 购物车组件
│   └── order/         # 订单组件
├── stores/            # Pinia 状态管理
│   ├── user.js        # 用户状态
│   ├── cart.js        # 购物车状态
│   ├── order.js       # 订单状态
│   └── product.js     # 产品状态
├── views/             # 页面视图
├── router/            # 路由配置
├── utils/             # 工具函数
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 页面路由

- `/` - 首页
- `/products` - 产品列表
- `/products/:id` - 产品详情
- `/cart` - 购物车（需登录）
- `/checkout` - 结算（需登录）
- `/login` - 登录
- `/register` - 注册
- `/orders` - 订单列表（需登录）
- `/orders/:id` - 订单详情（需登录）

## 状态管理

### User Store

- 用户信息
- 认证状态
- 登录/注册/登出

### Cart Store

- 购物车商品
- 总数量和总价
- 增删改查操作

### Order Store

- 订单列表
- 订单详情
- 创建和取消订单

### Product Store

- 产品列表
- 产品详情
- 分类数据
