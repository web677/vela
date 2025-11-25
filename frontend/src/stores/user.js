import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  // 初始化用户信息
  const init = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  // 登录
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败',
      }
    }
  }

  // 注册
  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败',
      }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      logout()
    }
  }

  // 初始化
  init()

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile,
  }
})
