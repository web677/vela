import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import { useCartStore } from './cart'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const gender = ref(localStorage.getItem('user_gender') || 'male')

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
      const response = await authAPI.phoneLogin(credentials)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      // 同步购物车
      const cartStore = useCartStore()
      cartStore.fetchCart()

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      // 改进的错误处理
      let message = '登录失败，请稍后重试'
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = '网络连接失败，请检查网络后重试'
      } else if (error.response) {
        message = error.response.data?.message || '手机或验证码错误'
      }

      return {
        success: false,
        message
      }
    }
  }

  // 注册
  const register = async (data) => {
    try {
      const response = await authAPI.phoneLogin(data)
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      // 同步购物车
      const cartStore = useCartStore()
      cartStore.fetchCart()

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      let message = '注册失败，请稍后重试'
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = '网络连接失败，请检查网络后重试'
      } else if (error.response) {
        message = error.response.data?.message || '注册失败'
      }

      return {
        success: false,
        message
      }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 清空购物车
    const cartStore = useCartStore()
    cartStore.clearCart()
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

  // 手机号登录/注册
  const phoneLogin = async (credentials) => {
    try {
      const response = await authAPI.phoneLogin({
        ...credentials,
        gender: gender.value, // 携带性别信息
      })
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      // 同步购物车
      const cartStore = useCartStore()
      cartStore.fetchCart()

      return { success: true }
    } catch (error) {
      console.error('Phone login error:', error)
      let message = '登录失败，请稍后重试'
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message = '网络连接失败，请检查网络后重试'
      } else if (error.response) {
        message = error.response.data?.message || '验证码错误或已过期'
      }

      return {
        success: false,
        message
      }
    }
  }

  // 设置性别
  const setGender = (value) => {
    gender.value = value
    localStorage.setItem('user_gender', value)
  }

  // 初始化
  init()

  return {
    user,
    token,
    gender,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile,
    phoneLogin,
    setGender,
  }
})
