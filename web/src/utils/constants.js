// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// 每页显示数量
export const ITEMS_PER_PAGE = 20

// 订单每页显示数量
export const ORDERS_PER_PAGE = 10

// 支付方式
export const PAYMENT_METHODS = [
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信支付' },
]

// 订单状态
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}
