<template>
  <transition name="fade">
    <div v-if="show" class="toast" :class="`toast-${type}`">
      <div class="toast-content">
        <span class="toast-icon">{{ icon }}</span>
        <p class="toast-message">{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const show = ref(true)

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[props.type]
})

watch(() => props.message, () => {
  show.value = true
  setTimeout(() => {
    show.value = false
  }, props.duration)
})

setTimeout(() => {
  show.value = false
}, props.duration)
</script>

<style scoped>
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  min-width: 300px;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: var(--color-success);
}

.toast-error {
  border-left-color: var(--color-error);
}

.toast-warning {
  border-left-color: var(--color-warning);
}

.toast-info {
  border-left-color: var(--color-info);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toast-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error .toast-icon {
  color: var(--color-error);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
}

.toast-info .toast-icon {
  color: var(--color-info);
}

.toast-message {
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}
</style>
