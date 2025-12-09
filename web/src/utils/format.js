// 格式化价格
export const formatPrice = (price) => {
  return `¥${parseFloat(price).toFixed(2)}`
}

// 格式化日期
export const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 订单状态文本映射
export const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    pending_shipment: '待发货',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已签收',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 订单状态颜色
export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: '#f59e0b',
    paid: '#3b82f6',
    pending_shipment: '#8b5cf6',
    processing: '#8b5cf6',
    shipped: '#10b981',
    delivered: '#06b6d4',
    completed: '#06b6d4',
    cancelled: '#ef4444',
  }
  return colorMap[status] || '#6b7280'
}
