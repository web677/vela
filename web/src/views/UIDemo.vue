<template>
  <div class="ui-demo">
    <h1 class="demo-title">Vela UI 组件演示</h1>
    <p class="demo-subtitle">清新文艺风格的设计系统</p>

    <!-- Color Palette -->
    <section class="demo-section">
      <h2>色彩系统</h2>
      <div class="color-grid">
        <div class="color-item">
          <div
            class="color-swatch"
            style="background: var(--color-primary)"
          ></div>
          <span>主色-雾霭紫</span>
        </div>
        <div class="color-item">
          <div
            class="color-swatch"
            style="background: var(--color-accent-warm)"
          ></div>
          <span>琥珀暖色</span>
        </div>
        <div class="color-item">
          <div
            class="color-swatch"
            style="background: var(--color-accent-cool)"
          ></div>
          <span>浅青灰</span>
        </div>
        <div class="color-item">
          <div
            class="color-swatch"
            style="background: var(--color-success)"
          ></div>
          <span>成功色</span>
        </div>
      </div>
    </section>

    <!-- Buttons -->
    <section class="demo-section">
      <h2>按钮 VButton</h2>
      <div class="demo-row">
        <VButton variant="primary">主要按钮</VButton>
        <VButton variant="secondary">次要按钮</VButton>
        <VButton variant="ghost">幽灵按钮</VButton>
        <VButton variant="text">文本按钮</VButton>
      </div>
      <div class="demo-row">
        <VButton size="sm">小按钮</VButton>
        <VButton size="md">中按钮</VButton>
        <VButton size="lg">大按钮</VButton>
      </div>
      <div class="demo-row">
        <VButton :loading="true">加载中</VButton>
        <VButton disabled>禁用按钮</VButton>
      </div>
    </section>

    <!-- Cards -->
    <section class="demo-section">
      <h2>卡片 VCard</h2>
      <div class="demo-grid">
        <VCard>
          <h3>默认卡片</h3>
          <p>这是一个带轻柔阴影的卡片</p>
        </VCard>
        <VCard variant="flat">
          <h3>扁平卡片</h3>
          <p>无阴影的clean风格</p>
        </VCard>
        <VCard variant="bordered" hoverable clickable>
          <h3>可点击卡片</h3>
          <p>鼠标悬停试试</p>
        </VCard>
      </div>
    </section>

    <!-- Inputs -->
    <section class="demo-section">
      <h2>输入框 VInput</h2>
      <div class="demo-col">
        <VInput v-model="demoInput1" label="邮箱" placeholder="请输入邮箱" />
        <VInput v-model="demoInput2" label="密码" type="password" required />
        <VInput v-model="demoInput3" label="用户名" error="用户名已存在" />
        <VInput v-model="demoInput4" label="手机号" hint="请输入11位手机号" />
      </div>
    </section>

    <!-- Badges -->
    <section class="demo-section">
      <h2>标签 VBadge</h2>
      <div class="demo-row">
        <VBadge>默认</VBadge>
        <VBadge variant="success">成功</VBadge>
        <VBadge variant="warning">警告</VBadge>
        <VBadge variant="error">错误</VBadge>
        <VBadge variant="info">信息</VBadge>
      </div>
      <div class="demo-row">
        <VBadge size="sm">小</VBadge>
        <VBadge size="md">中</VBadge>
        <VBadge size="lg">大</VBadge>
      </div>
    </section>

    <!-- Modal -->
    <section class="demo-section">
      <h2>模态框 VModal</h2>
      <div class="demo-row">
        <VButton @click="showModal = true">打开模态框</VButton>
      </div>

      <VModal v-model="showModal" title="这是一个模态框">
        <p>模态框内容区域，可以放置任何内容。</p>
        <p>支持从底部滑入的移动端动画。</p>

        <template #footer>
          <VButton variant="ghost" @click="showModal = false">取消</VButton>
          <VButton @click="handleConfirm">确认</VButton>
        </template>
      </VModal>
    </section>

    <!-- Toast -->
    <section class="demo-section">
      <h2>提示 VToast</h2>
      <div class="demo-row">
        <VButton @click="showSuccessToast">成功提示</VButton>
        <VButton @click="showWarningToast">警告提示</VButton>
        <VButton @click="showErrorToast">错误提示</VButton>
        <VButton @click="showInfoToast">信息提示</VButton>
      </div>

      <VToast
        v-if="toastVisible"
        :message="toastMessage"
        :type="toastType"
        :title="toastTitle"
        @close="toastVisible = false"
      />
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  VButton,
  VCard,
  VInput,
  VBadge,
  VModal,
  VToast,
} from "@/components/ui";

const demoInput1 = ref("");
const demoInput2 = ref("");
const demoInput3 = ref("existing");
const demoInput4 = ref("");

const showModal = ref(false);
const toastVisible = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
const toastTitle = ref("");

const handleConfirm = () => {
  showModal.value = false;
  showToast("操作成功！", "success");
};

const showToast = (message, type = "success", title = "") => {
  toastMessage.value = message;
  toastType.value = type;
  toastTitle.value = title;
  toastVisible.value = true;
};

const showSuccessToast = () => showToast("操作成功！", "success", "成功");
const showWarningToast = () => showToast("请注意检查输入", "warning", "警告");
const showErrorToast = () => showToast("操作失败，请重试", "error", "错误");
const showInfoToast = () => showToast("这是一条提示信息", "info", "提示");
</script>

<style scoped>
.ui-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.demo-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-dark)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-subtitle {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-4xl);
}

.demo-section {
  margin-bottom: var(--spacing-4xl);
  padding: var(--spacing-2xl);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.demo-section h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border-light);
}

.demo-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.demo-section p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-lg);
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.color-item span {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.demo-row:last-child {
  margin-bottom: 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.demo-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 500px;
}

@media (max-width: 768px) {
  .ui-demo {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .demo-section {
    padding: var(--spacing-lg);
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
