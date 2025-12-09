<template>
  <transition name="modal-fade">
    <div v-if="show" class="confirm-overlay" @click="onCancel">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon">
          <span class="icon-warning">⚠</span>
        </div>
        
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
        
        <div class="confirm-actions">
          <button 
            @click="onCancel" 
            class="btn btn-secondary"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="onConfirm" 
            class="btn btn-primary"
            :class="{ 'btn-danger': type === 'danger' }"
            :disabled="loading"
          >
            <span v-if="loading" class="loading"></span>
            {{ loading ? '处理中...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  },
  onConfirm: {
    type: Function,
    default: () => {}
  },
  onCancel: {
    type: Function,
    default: () => {}
  }
})

const loading = ref(false)

const handleConfirm = async () => {
  loading.value = true
  await props.onConfirm()
  loading.value = false
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.confirm-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  animation: slideInUp 0.3s ease-out;
  text-align: center;
}

.confirm-icon {
  margin-bottom: 1.5rem;
}

.icon-warning {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
  font-size: 2rem;
  font-weight: bold;
}

.confirm-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.confirm-message {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-actions .btn {
  flex: 1;
  max-width: 150px;
}

.btn-danger {
  background: linear-gradient(135deg, var(--color-error), #dc2626);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .confirm-dialog,
.modal-fade-leave-active .confirm-dialog {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from .confirm-dialog,
.modal-fade-leave-to .confirm-dialog {
  transform: translateY(30px);
  opacity: 0;
}
</style>
