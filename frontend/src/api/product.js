import apiClient from './client'

export const productAPI = {
  // 获取产品列表
  getProducts(params) {
    return apiClient.get('/products', { params })
  },

  // 获取产品详情
  getProduct(id) {
    return apiClient.get(`/products/${id}`)
  },

  // 创建产品（管理员）
  createProduct(data) {
    return apiClient.post('/products', data)
  },

  // 更新产品（管理员）
  updateProduct(id, data) {
    return apiClient.patch(`/products/${id}`, data)
  },

  // 删除产品（管理员）
  deleteProduct(id) {
    return apiClient.delete(`/products/${id}`)
  },
}

export const categoryAPI = {
  // 获取所有分类
  getCategories() {
    return apiClient.get('/categories')
  },

  // 获取分类详情
  getCategory(id) {
    return apiClient.get(`/categories/${id}`)
  },
}
