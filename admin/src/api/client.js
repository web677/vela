import axios from 'axios'
import { message } from 'ant-design-vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3580/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 如果是登录接口本身的 401，不进行跳转
          if (error.config.url.includes('/auth/login')) {
            break;
          }
          localStorage.removeItem('admin_token')
          message.error('登录已过期，请重新登录')
          window.location.href = '/login'
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)

export default api
