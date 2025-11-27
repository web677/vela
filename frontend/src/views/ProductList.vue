<template>
  <div class="product-list-page">
    <div class="page-header">
      <h1 class="page-title">产品列表</h1>
      <p class="page-subtitle">探索我们的精选产品</p>
    </div>

    <!-- 筛选器 -->
    <VCard class="filters-card" padding="lg">
      <div class="filters">
        <VInput
          v-model="searchQuery"
          @input="debounceSearch"
          type="text"
          placeholder="搜索产品..."
          class="filter-search"
        >
          <template #prefix>🔍</template>
        </VInput>

        <select
          v-model="selectedCategory"
          @change="loadProducts"
          class="filter-select"
        >
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <select v-model="sortBy" @change="loadProducts" class="filter-select">
          <option value="created_at">最新</option>
          <option value="price">价格</option>
          <option value="sales_count">销量</option>
        </select>

        <select
          v-model="sortOrder"
          @change="loadProducts"
          class="filter-select"
        >
          <option value="desc">降序</option>
          <option value="asc">升序</option>
        </select>
      </div>
    </VCard>

    <!-- 产品网格 -->
    <div v-if="productStore.loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <ProductGrid
      v-else
      :products="productStore.products"
      :columns="4"
      show-stock
    />

    <!-- 分页 -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <VButton
        variant="secondary"
        @click="changePage(pagination.page - 1)"
        :disabled="pagination.page === 1"
      >
        ← 上一页
      </VButton>

      <span class="pagination-info">
        第 {{ pagination.page }} / {{ pagination.totalPages }} 页
        <span class="pagination-total">(共 {{ pagination.total }} 个产品)</span>
      </span>

      <VButton
        variant="secondary"
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page >= pagination.totalPages"
      >
        下一页 →
      </VButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import { VButton, VCard, VInput } from "@/components/ui";
import ProductGrid from "@/components/product/ProductGrid.vue";

const route = useRoute();
const productStore = useProductStore();

const selectedCategory = ref("");
const searchQuery = ref("");
const sortBy = ref("created_at");
const sortOrder = ref("desc");
const pagination = ref(null);
const currentPage = ref(1);

let searchTimeout = null;

const categories = computed(() => productStore.categories);

onMounted(async () => {
  await productStore.fetchCategories();

  // 从 URL 参数获取分类
  if (route.query.category) {
    selectedCategory.value = route.query.category;
  }

  await loadProducts();
});

const loadProducts = async () => {
  const params = {
    page: currentPage.value,
    limit: 20,
    sort: sortBy.value,
    order: sortOrder.value,
  };

  if (selectedCategory.value) {
    params.category = selectedCategory.value;
  }

  if (searchQuery.value) {
    params.search = searchQuery.value;
  }

  const result = await productStore.fetchProducts(params);
  if (result) {
    pagination.value = {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
    };
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadProducts();
  }, 500);
};

const changePage = (page) => {
  currentPage.value = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<style scoped>
.product-list-page {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.filters-card {
  margin-bottom: var(--spacing-3xl);
}

.filters {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: var(--spacing-md);
}

.filter-search {
  grid-column: 1;
}

.filter-select {
  height: var(--input-height);
  padding: 0 var(--spacing-md);
  font-family: var(--font-family-base);
  font-size: var(--input-font-size);
  color: var(--color-text-primary);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  outline: none;
  cursor: pointer;
}

.filter-select:hover {
  border-color: var(--color-border-dark);
}

.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) 0;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-xl) 0;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.pagination-total {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-normal);
}

/* 移动端 */
@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filter-search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .product-list-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .filter-search {
    grid-column: 1;
  }

  .pagination {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .pagination-info {
    order: -1;
  }
}
</style>
