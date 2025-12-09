import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productAPI, categoryAPI } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)

  // 获取产品列表
  const fetchProducts = async (params = {}) => {
    loading.value = true
    try {
      const response = await productAPI.getProducts(params)
      products.value = response.data.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取产品详情
  const fetchProduct = async (productId) => {
    loading.value = true
    try {
      const response = await productAPI.getProduct(productId)
      currentProduct.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories()
      categories.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  }

  return {
    products,
    categories,
    currentProduct,
    loading,
    fetchProducts,
    fetchProduct,
    fetchCategories,
  }
})
