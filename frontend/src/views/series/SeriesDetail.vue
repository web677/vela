<template>
  <div class="series-detail">
    <Loading v-if="loading" />

    <div v-else-if="series" class="series-container">
      <!-- Hero Section -->
      <div class="series-hero" :style="{ '--theme-color': series.theme_color }">
        <div class="hero-background">
          <img
            v-if="series.hero_image_url"
            :src="series.hero_image_url"
            :alt="series.name"
            class="hero-image"
          />
          <div class="hero-overlay"></div>
        </div>

        <div class="hero-content container">
          <h1 class="series-name font-serif">{{ series.name }}</h1>
          <p class="series-name-en">{{ series.name_en }}</p>
          <p class="series-subtitle">{{ series.subtitle }}</p>
          <p class="series-description">{{ series.description }}</p>
        </div>
      </div>

      <!-- Products Section -->
      <div class="series-products container">
        <div class="section-header">
          <h2>系列产品</h2>
          <p class="product-count" v-if="products.length">
            共 {{ totalProducts }} 件商品
          </p>
        </div>

        <div v-if="products.length" class="product-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <div v-else-if="!productsLoading" class="empty-state">
          <p>该系列暂无商品</p>
          <router-link to="/products" class="btn btn-primary"
            >浏览全部商品</router-link
          >
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="loadPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary"
          >
            上一页
          </button>

          <div class="page-numbers">
            <button
              v-for="page in paginationRange"
              :key="page"
              @click="loadPage(page)"
              :class="['page-btn', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="loadPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <div v-else class="error-state container">
      <h2>系列不存在</h2>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSeriesStore } from "@/stores/series";
import ProductCard from "@/components/product/ProductCard.vue";
import Loading from "@/components/common/Loading.vue";

const route = useRoute();
const seriesStore = useSeriesStore();

const series = ref(null);
const products = ref([]);
const loading = ref(true);
const productsLoading = ref(false);
const currentPage = ref(1);
const totalProducts = ref(0);
const totalPages = ref(1);
const limit = 20;

const paginationRange = computed(() => {
  const range = [];
  const delta = 2;
  const left = currentPage.value - delta;
  const right = currentPage.value + delta;

  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || (i >= left && i <= right)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
});

const loadPage = async (page) => {
  if (page === "..." || page < 1 || page > totalPages.value) return;

  currentPage.value = page;
  productsLoading.value = true;

  const result = await seriesStore.fetchSeriesProducts(
    series.value.id,
    page,
    limit
  );

  if (result.success) {
    products.value = result.data;
    totalProducts.value = result.total;
    totalPages.value = result.totalPages;
  }

  productsLoading.value = false;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(async () => {
  loading.value = true;

  // Fetch series details
  const seriesResult = await seriesStore.fetchSeriesBySlug(route.params.slug);

  if (seriesResult.success) {
    series.value = seriesResult.data;

    // Fetch products
    await loadPage(1);
  }

  loading.value = false;
});
</script>

<style scoped>
.series-detail {
  min-height: 100vh;
}

.series-hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: var(--spacing-3xl);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.6),
    var(--theme-color, rgba(184, 164, 212, 0.3))
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: var(--spacing-2xl);
}

.series-name {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.series-name-en {
  font-size: var(--font-size-xl);
  font-style: italic;
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
  letter-spacing: 2px;
}

.series-subtitle {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.95;
}

.series-description {
  max-width: 800px;
  margin: 0 auto;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  opacity: 0.9;
}

.series-products {
  padding: var(--spacing-2xl) 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.section-header h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
}

.product-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.page-numbers {
  display: flex;
  gap: var(--spacing-xs);
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-border-default);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-in-out);
  font-size: var(--font-size-sm);
}

.page-btn:hover:not(.active) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-primary);
}

.page-btn.active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.error-state {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
}

.error-state h2 {
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-secondary);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .series-hero {
    min-height: 50vh;
  }

  .series-name {
    font-size: var(--font-size-3xl);
  }

  .series-name-en {
    font-size: var(--font-size-lg);
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }

  .pagination {
    flex-wrap: wrap;
  }

  .page-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: var(--spacing-sm);
  }
}
</style>
