import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const admin = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    try {
      const response = await api.post('/admin/auth/login', { username, password })
      token.value = response.data.token
      admin.value = response.data.admin
      localStorage.setItem('admin_token', token.value)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败' 
      }
    }
  }

  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem('admin_token')
  }

  async function getProfile() {
    if (!token.value) return
    try {
      const response = await api.get('/admin/auth/profile')
      admin.value = response.data
    } catch (error) {
      logout()
    }
  }

  return {
    token,
    admin,
    isAuthenticated,
    login,
    logout,
    getProfile
  }
})
