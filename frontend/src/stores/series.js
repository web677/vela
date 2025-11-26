import { defineStore } from 'pinia'
import { ref } from 'vue'
import { seriesApi } from '@/api/series'

export const useSeriesStore = defineStore('series', () => {
  const seriesList = ref([])
  const currentSeries = ref(null)
  const seriesProducts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 获取所有系列
  const fetchSeriesList = async (includeInactive = false) => {
    loading.value = true
    error.value = null
    try {
      const response = await seriesApi.getAll(includeInactive)
      seriesList.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '获取系列列表失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // 根据 slug 获取系列详情
  const fetchSeriesBySlug = async (slug) => {
    loading.value = true
    error.value = null
    try {
      const response = await seriesApi.getBySlug(slug)
      currentSeries.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || '获取系列详情失败'
      currentSeries.value = null
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // 获取系列下的产品
  const fetchSeriesProducts = async (slug, page = 1, limit = 20) => {
    loading.value = true
    error.value = null
    try {
      const response = await seriesApi.getSeriesProducts(slug, page, limit)
      seriesProducts.value = response.data.data
      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages
      }
    } catch (err) {
      error.value = err.response?.data?.message || '获取系列产品失败'
      seriesProducts.value = []
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // 清空当前系列
  const clearCurrentSeries = () => {
    currentSeries.value = null
    seriesProducts.value = []
  }

  return {
    seriesList,
    currentSeries,
    seriesProducts,
    loading,
    error,
    fetchSeriesList,
    fetchSeriesBySlug,
    fetchSeriesProducts,
    clearCurrentSeries
  }
})
