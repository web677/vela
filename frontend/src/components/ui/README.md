# Vela UI 组件库使用文档

这是 Vela 项目的全局 UI 组件库，遵循清新文艺的设计风格。

## 组件列表

### VButton - 按钮

```vue
<script setup>
import { VButton } from "@/components/ui";
</script>

<template>
  <!-- 主要按钮 -->
  <VButton variant="primary">主要按钮</VButton>

  <!-- 次要按钮 -->
  <VButton variant="secondary">次要按钮</VButton>

  <!-- 幽灵按钮 -->
  <VButton variant="ghost">幽灵按钮</VButton>

  <!-- 文本按钮 -->
  <VButton variant="text">文本按钮</VButton>

  <!-- 尺寸 -->
  <VButton size="sm">小按钮</VButton>
  <VButton size="md">中按钮</VButton>
  <VButton size="lg">大按钮</VButton>

  <!-- 加载状态 -->
  <VButton :loading="true">加载中...</VButton>

  <!-- 块级按钮 -->
  <VButton block>全宽按钮</VButton>
</template>
```

### VCard - 卡片

```vue
<script setup>
import { VCard } from "@/components/ui";
</script>

<template>
  <!-- 默认卡片 -->
  <VCard>
    <h3>卡片标题</h3>
    <p>卡片内容</p>
  </VCard>

  <!-- 扁平卡片 -->
  <VCard variant="flat">无阴影卡片</VCard>

  <!-- 带边框卡片 -->
  <VCard variant="bordered">带边框卡片</VCard>

  <!-- 可点击 -->
  <VCard clickable @click="handleClick">点击我</VCard>

  <!-- 控制内边距 -->
  <VCard padding="none">无内边距</VCard>
  <VCard padding="sm">小内边距</VCard>
  <VCard padding="lg">大内边距</VCard>
</template>
```

### VInput - 输入框

```vue
<script setup>
import { VInput } from "@/components/ui";
import { ref } from "vue";

const email = ref("");
</script>

<template>
  <!-- 基础输入 -->
  <VInput v-model="email" label="邮箱" placeholder="请输入邮箱" />

  <!-- 必填 -->
  <VInput v-model="password" type="password" label="密码" required />

  <!-- 错误状态 -->
  <VInput v-model="username" label="用户名" error="用户名已存在" />

  <!-- 提示信息 -->
  <VInput v-model="name" label="姓名" hint="请输入真实姓名" />

  <!-- 尺寸 -->
  <VInput size="sm" />
  <VInput size="lg" />

  <!-- 前缀/后缀 -->
  <VInput>
    <template #prefix>￥</template>
  </VInput>

  <VInput>
    <template #suffix>.com</template>
  </VInput>
</template>
```

### VBadge - 标签

```vue
<script setup>
import { VBadge } from "@/components/ui";
</script>

<template>
  <!-- 默认 -->
  <VBadge>默认</VBadge>

  <!-- 状态 -->
  <VBadge variant="success">成功</VBadge>
  <VBadge variant="warning">警告</VBadge>
  <VBadge variant="error">错误</VBadge>
  <VBadge variant="info">信息</VBadge>

  <!-- 尺寸 -->
  <VBadge size="sm">小</VBadge>
  <VBadge size="md">中</VBadge>
  <VBadge size="lg">大</VBadge>
</template>
```

### VModal - 模态框

```vue
<script setup>
import { VModal, VButton } from "@/components/ui";
import { ref } from "vue";

const showModal = ref(false);
</script>

<template>
  <VButton @click="showModal = true">打开模态框</VButton>

  <VModal v-model="showModal" title="模态框标题">
    <p>这是模态框的内容</p>

    <template #footer>
      <VButton variant="ghost" @click="showModal = false">取消</VButton>
      <VButton @click="handleConfirm">确认</VButton>
    </template>
  </VModal>

  <!-- 尺寸 -->
  <VModal v-model="show" size="sm">小模态框</VModal>
  <VModal v-model="show" size="md">中模态框</VModal>
  <VModal v-model="show" size="lg">大模态框</VModal>
  <VModal v-model="show" size="full">全屏模态框</VModal>
</template>
```

### VToast - 提示

```vue
<script setup>
import { VToast } from "@/components/ui";
import { ref } from "vue";

const showToast = ref(false);
</script>

<template>
  <!-- 基础用法（通常通过 composable 使用）-->
  <VToast
    v-if="showToast"
    message="操作成功！"
    type="success"
    @close="showToast = false"
  />

  <!-- 不同类型 -->
  <VToast message="成功提示" type="success" />
  <VToast message="警告提示" type="warning" />
  <VToast message="错误提示" type="error" />
  <VToast message="信息提示" type="info" />

  <!-- 带标题 -->
  <VToast title="提示" message="这是一个带标题的提示" />

  <!-- 位置 -->
  <VToast position="top" message="顶部提示" />
  <VToast position="bottom" message="底部提示" />
</template>
```

## 设计系统使用

所有组件都基于 `design-tokens.css` 中定义的设计变量：

### 颜色

```css
var(--color-primary)        /* 主色 - 雾霭紫 */
var(--color-text-primary)   /* 主文本 */
var(--color-bg-primary)     /* 主背景 */
var(--color-success)        /* 成功色 */
var(--color-error)          /* 错误色 */
```

### 间距

```css
var(--spacing-xs)    /* 4px */
var(--spacing-sm)    /* 8px */
var(--spacing-md)    /* 16px */
var(--spacing-lg)    /* 24px */
var(--spacing-xl)    /* 32px */
```

### 圆角

```css
var(--radius-sm)     /* 6px */
var(--radius-md)     /* 8px */
var(--radius-lg)     /* 12px */
var(--radius-full)   /* 圆形 */
```

### 阴影

```css
var(--shadow-sm)     /* 轻柔阴影 */
var(--shadow-md)     /* 标准阴影 */
var(--shadow-hover)  /* 悬停阴影 */
```

## 移动端优化

所有组件均已针对移动端优化：

- 最小触控区域 44×44px
- 输入框字号 16px（防止 iOS 缩放）
- 响应式布局
- 触摸友好的交互

## 使用建议

1. 优先使用组件库组件，保持全站风格统一
2. 遵循设计系统的色彩、间距、圆角规范
3. 移动端优先设计，渐进增强到桌面端
4. 保持充足的留白和呼吸感
