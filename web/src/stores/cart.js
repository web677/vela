import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartAPI } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalAmount = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  })

  // 获取购物车
  const fetchCart = async () => {
    loading.value = true
    try {
      const response = await cartAPI.getCart()
      items.value = response.data.items
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      loading.value = false
    }
  }

  // 添加到购物车
  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '添加失败',
      }
    }
  }

  // 更新购物车项
  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartAPI.updateCartItem(itemId, { quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新失败',
      }
    }
  }

  // 删除购物车项
  const removeCartItem = async (itemId) => {
    try {
      await cartAPI.removeCartItem(itemId)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除失败',
      }
    }
  }

  // 清空购物车
  const clearCart = async () => {
    try {
      await cartAPI.clearCart()
      items.value = []
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '清空失败',
      }
    }
  }

  return {
    items,
    loading,
    totalItems,
    totalAmount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  }
})
