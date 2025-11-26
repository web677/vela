import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  const addNotification = (type, message, duration = 3000) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    
    const notification = {
      id,
      type,
      message,
      duration,
    }

    notifications.value.push(notification)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message, duration) => {
    return addNotification('success', message, duration)
  }

  const error = (message, duration) => {
    return addNotification('error', message, duration)
  }

  const warning = (message, duration) => {
    return addNotification('warning', message, duration)
  }

  const info = (message, duration) => {
    return addNotification('info', message, duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear,
  }
})

