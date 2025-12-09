import client from './client'

export const seriesApi = {
  // 获取所有系列
  getAll: (includeInactive = false, gender = null) => {
    const params = { includeInactive: includeInactive ? 'true' : 'false' }
    if (gender) {
      params.gender = gender
    }
    return client.get('/series', { params })
  },

  // 根据 slug 获取系列详情
  getBySlug: (slug) => {
    return client.get(`/series/${slug}`)
  },

  // 获取系列下的产品
  getSeriesProducts: (slug, page = 1, limit = 20) => {
    return client.get(`/series/${slug}/products`, {
      params: { page, limit }
    })
  },

  // 创建系列（管理员）
  create: (data) => {
    return client.post('/series', data)
  },

  // 更新系列（管理员）
  update: (id, data) => {
    return client.put(`/series/${id}`, data)
  },

  // 删除系列（管理员）
  delete: (id) => {
    return client.delete(`/series/${id}`)
  }
}
