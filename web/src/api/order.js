import apiClient from './client'

export const orderAPI = {
  // 创建订单
  createOrder(data) {
    return apiClient.post('/orders', data)
  },

  // 获取订单列表
  getOrders(params) {
    return apiClient.get('/orders', { params })
  },

  // 获取订单详情
  getOrder(id) {
    return apiClient.get(`/orders/${id}`)
  },

  // 取消订单
  cancelOrder(id) {
    return apiClient.post(`/orders/${id}/cancel`)
  },

  // 获取订单物流信息
  getOrderLogistics(id) {
    return apiClient.get(`/orders/${id}/logistics`)
  },
}
