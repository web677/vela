<template>
  <Teleport to="body">
    <Transition name="v-modal-fade">
      <div v-if="modelValue" class="v-modal" @click.self="handleBackdropClick">
        <div class="v-modal__backdrop"></div>

        <div :class="modalClasses" role="dialog" aria-modal="true">
          <div v-if="showClose" class="v-modal__close" @click="close">
            <span>&times;</span>
          </div>

          <div v-if="title || $slots.header" class="v-modal__header">
            <slot name="header">
              <h3 class="v-modal__title">{{ title }}</h3>
            </slot>
          </div>

          <div class="v-modal__body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="v-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "full"].includes(value),
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

const modalClasses = computed(() => {
  return ["v-modal__content", `v-modal__content--${props.size}`];
});

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleBackdropClick = () => {
  if (props.closeOnClickOutside) {
    close();
  }
};

// 防止背景滚动
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<style scoped>
.v-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.v-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay);
  backdrop-filter: blur(4px);
}

.v-modal__content {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 2rem);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 尺寸 */
.v-modal__content--sm {
  max-width: 400px;
}

.v-modal__content--md {
  max-width: 600px;
}

.v-modal__content--lg {
  max-width: 900px;
}

.v-modal__content--full {
  max-width: 95vw;
  max-height: 95vh;
}

.v-modal__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-base);
  z-index: 1;
}

.v-modal__close:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.v-modal__header {
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.v-modal__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.v-modal__body {
  padding: var(--spacing-xl);
  flex: 1;
  overflow-y: auto;
  color: var(--color-text-primary);
}

.v-modal__footer {
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* 动画 */
.v-modal-fade-enter-active,
.v-modal-fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.v-modal-fade-enter-active .v-modal__content,
.v-modal-fade-leave-active .v-modal__content {
  transition: all var(--duration-base) var(--ease-spring);
}

.v-modal-fade-enter-from,
.v-modal-fade-leave-to {
  opacity: 0;
}

.v-modal-fade-enter-from .v-modal__content,
.v-modal-fade-leave-to .v-modal__content {
  transform: scale(0.95);
  opacity: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .v-modal {
    padding: 0;
    align-items: flex-end;
  }

  .v-modal__content {
    max-height: 90vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .v-modal__content--sm,
  .v-modal__content--md,
  .v-modal__content--lg {
    max-width: 100%;
  }

  .v-modal__header {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
  }

  .v-modal__body {
    padding: var(--spacing-md);
  }

  .v-modal__footer {
    padding: var(--spacing-md);
    flex-direction: column-reverse;
  }

  .v-modal__footer > * {
    width: 100%;
  }

  /* 移动端从底部滑入 */
  .v-modal-fade-enter-from .v-modal__content,
  .v-modal-fade-leave-to .v-modal__content {
    transform: translateY(100%);
  }
}
</style>
