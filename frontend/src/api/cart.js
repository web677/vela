import apiClient from './client'

export const cartAPI = {
  // 获取购物车
  getCart() {
    return apiClient.get('/cart')
  },

  // 添加到购物车
  addToCart(data) {
    return apiClient.post('/cart', data)
  },

  // 更新购物车项
  updateCartItem(id, data) {
    return apiClient.patch(`/cart/${id}`, data)
  },

  // 删除购物车项
  removeCartItem(id) {
    return apiClient.delete(`/cart/${id}`)
  },

  // 清空购物车
  clearCart() {
    return apiClient.delete('/cart')
  },
}
