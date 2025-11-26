import apiClient from './client'

export const authAPI = {
  // 注册
  register(data) {
    return apiClient.post('/auth/phone-login', data)
  },

  // 登录
  login(data) {
    return apiClient.post('/auth/phone-login', data)
  },

  // 手机登录（显式）
  phoneLogin(data) {
    return apiClient.post('/auth/phone-login', data)
  },

  // 获取当前用户信息
  getProfile() {
    return apiClient.get('/auth/profile')
  },
}
