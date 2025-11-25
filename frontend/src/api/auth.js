import apiClient from './client'

export const authAPI = {
  // 注册
  register(data) {
    return apiClient.post('/auth/register', data)
  },

  // 登录
  login(data) {
    return apiClient.post('/auth/login', data)
  },

  // 获取当前用户信息
  getProfile() {
    return apiClient.get('/auth/profile')
  },
}
