<template>
  <div class="product-list-page">
    <h1 class="page-title">产品列表</h1>

    <!-- Filters -->
    <div class="filters">
      <select v-model="selectedCategory" @change="loadProducts" class="input filter-select">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <input 
        v-model="searchQuery" 
        @input="debounceSearch"
        type="text" 
        placeholder="搜索产品..." 
        class="input filter-search"
      />

      <select v-model="sortBy" @change="loadProducts" class="input filter-select">
        <option value="created_at">最新</option>
        <option value="price">价格</option>
        <option value="sales_count">销量</option>
      </select>

      <select v-model="sortOrder" @change="loadProducts" class="input filter-select">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
    </div>

    <!-- Products -->
    <Loading v-if="productStore.loading" text="加载中..." />
    <ProductGrid v-else :products="productStore.products" :columns="4" />

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="btn btn-secondary"
      >
        上一页
      </button>
      
      <span class="pagination-info">
        第 {{ pagination.page }} / {{ pagination.totalPages }} 页
      </span>
      
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page >= pagination.totalPages"
        class="btn btn-secondary"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductGrid from '@/components/product/ProductGrid.vue'
import Loading from '@/components/common/Loading.vue'

const route = useRoute()
const productStore = useProductStore()

const selectedCategory = ref('')
const searchQuery = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const pagination = ref(null)
const currentPage = ref(1)

let searchTimeout = null

onMounted(async () => {
  await productStore.fetchCategories()
  
  // 从 URL 参数获取分类
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  
  await loadProducts()
})

const categories = ref(productStore.categories)

const loadProducts = async () => {
  const params = {
    page: currentPage.value,
    limit: 20,
    sort: sortBy.value,
    order: sortOrder.value
  }

  if (selectedCategory.value) {
    params.category = selectedCategory.value
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  const result = await productStore.fetchProducts(params)
  if (result) {
    pagination.value = {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    }
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 500)
}

const changePage = (page) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.product-list-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 150px;
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination-info {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-select,
  .filter-search {
    width: 100%;
  }
}
</style>
