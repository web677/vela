import { ref } from 'vue'

const confirmState = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  type: 'warning',
  resolve: null,
})

export function useConfirm() {
  const showConfirm = (options) => {
    return new Promise((resolve) => {
      confirmState.value = {
        show: true,
        title: options.title || '确认操作',
        message: options.message || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        type: options.type || 'warning',
        resolve,
      }
    })
  }

  const confirm = async (message, title) => {
    return showConfirm({
      message,
      title: title || '确认',
      confirmText: '确定',
      cancelText: '取消',
    })
  }

  const confirmDelete = async (message) => {
    return showConfirm({
      message: message || '确定要删除吗？此操作无法撤销。',
      title: '删除确认',
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
    })
  }

  const handleConfirm = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true)
    }
    confirmState.value.show = false
  }

  const handleCancel = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(false)
    }
    confirmState.value.show = false
  }

  return {
    confirmState,
    confirm,
    confirmDelete,
    handleConfirm,
    handleCancel,
  }
}
