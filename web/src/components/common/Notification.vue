<template>
  <transition-group name="notification-list" tag="div" class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification"
      :class="`notification-${notification.type}`"
      @click="removeNotification(notification.id)"
    >
      <div class="notification-icon">
        <span v-if="notification.type === 'success'">✓</span>
        <span v-else-if="notification.type === 'error'">✕</span>
        <span v-else-if="notification.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      
      <div class="notification-content">
        <p class="notification-message">{{ notification.message }}</p>
      </div>
      
      <button class="notification-close" @click.stop="removeNotification(notification.id)">
        ×
      </button>
    </div>
  </transition-group>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

const removeNotification = (id) => {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border-left: 4px solid;
  min-width: 320px;
  cursor: pointer;
  pointer-events: auto;
  animation: slideInRight 0.3s ease-out;
}

.notification-success {
  border-left-color: var(--color-success);
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1),
    var(--color-surface)
  );
}

.notification-error {
  border-left-color: var(--color-error);
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1),
    var(--color-surface)
  );
}

.notification-warning {
  border-left-color: var(--color-warning);
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.1),
    var(--color-surface)
  );
}

.notification-info {
  border-left-color: var(--color-info);
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1),
    var(--color-surface)
  );
}

.notification-icon {
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.notification-success .notification-icon {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.notification-error .notification-icon {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.notification-warning .notification-icon {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.notification-info .notification-icon {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-info);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  line-height: 1.5;
  word-break: break-word;
}

.notification-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.75rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Transition group animations */
.notification-list-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.notification-list-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.notification-list-move {
  transition: transform 0.3s ease;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .notification {
    min-width: auto;
    width: 100%;
  }
}
</style>
