<template>
  <Teleport to="body">
    <Transition name="v-toast-slide">
      <div v-if="visible" :class="toastClasses">
        <div v-if="icon" class="v-toast__icon">{{ icon }}</div>
        <div class="v-toast__content">
          <div v-if="title" class="v-toast__title">{{ title }}</div>
          <div class="v-toast__message">{{ message }}</div>
        </div>
        <div v-if="closable" class="v-toast__close" @click="close">
          <span>&times;</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "success", "warning", "error", "info"].includes(value),
  },
  duration: {
    type: Number,
    default: 3000,
  },
  position: {
    type: String,
    default: "top",
    validator: (value) => ["top", "bottom"].includes(value),
  },
  closable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

const visible = ref(false);
let timer = null;

const toastClasses = computed(() => {
  return ["v-toast", `v-toast--${props.type}`, `v-toast--${props.position}`];
});

const icon = computed(() => {
  const icons = {
    success: "✓",
    warning: "⚠",
    error: "✕",
    info: "ℹ",
  };
  return icons[props.type] || "";
});

const close = () => {
  visible.value = false;
  if (timer) {
    clearTimeout(timer);
  }
  setTimeout(() => {
    emit("close");
  }, 300);
};

onMounted(() => {
  visible.value = true;
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.v-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-notification);
  min-width: 280px;
  max-width: 90vw;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  pointer-events: auto;
}

.v-toast--top {
  top: var(--spacing-xl);
}

.v-toast--bottom {
  bottom: var(--spacing-xl);
}

.v-toast__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  border-radius: 50%;
  flex-shrink: 0;
}

.v-toast--success .v-toast__icon {
  background: var(--color-success);
  color: white;
}

.v-toast--warning .v-toast__icon {
  background: var(--color-warning);
  color: white;
}

.v-toast--error .v-toast__icon {
  background: var(--color-error);
  color: white;
}

.v-toast--info .v-toast__icon {
  background: var(--color-info);
  color: white;
}

.v-toast__content {
  flex: 1;
  min-width: 0;
}

.v-toast__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.v-toast__message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.v-toast__close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.v-toast__close:hover {
  color: var(--color-text-primary);
}

/* 动画 - 顶部 */
.v-toast-slide-enter-active,
.v-toast-slide-leave-active {
  transition: all var(--duration-base) var(--ease-in-out);
}

.v-toast--top.v-toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.v-toast--top.v-toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 动画 - 底部 */
.v-toast--bottom.v-toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

.v-toast--bottom.v-toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .v-toast {
    min-width: auto;
    max-width: calc(100vw - 2rem);
    margin: 0 var(--spacing-md);
  }

  .v-toast--top {
    top: var(--spacing-md);
  }

  .v-toast--bottom {
    bottom: var(--spacing-md);
  }
}
</style>
