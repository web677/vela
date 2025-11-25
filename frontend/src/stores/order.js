import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderAPI } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)

  // 获取订单列表
  const fetchOrders = async (page = 1, limit = 10) => {
    loading.value = true
    try {
      const response = await orderAPI.getOrders({ page, limit })
      orders.value = response.data.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取订单详情
  const fetchOrder = async (orderId) => {
    loading.value = true
    try {
      const response = await orderAPI.getOrder(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch order:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 创建订单
  const createOrder = async (orderData) => {
    try {
      const response = await orderAPI.createOrder(orderData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '订单创建失败',
      }
    }
  }

  // 取消订单
  const cancelOrder = async (orderId) => {
    try {
      await orderAPI.cancelOrder(orderId)
      await fetchOrders()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '取消订单失败',
      }
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrder,
    createOrder,
    cancelOrder,
  }
})
