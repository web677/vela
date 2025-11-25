<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title animate-slide-in-up">欢迎来到 VELA</h1>
        <p class="hero-subtitle animate-slide-in-up">高品质成人用品，专注您的隐私与体验</p>
        <router-link to="/products" class="btn btn-primary btn-lg animate-slide-in-up">
          立即选购
        </router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section">
      <h2 class="section-title">精选推荐</h2>
      <Loading v-if="productStore.loading" text="加载中..." />
      <ProductGrid v-else :products="featuredProducts" :columns="4" />
    </section>

    <!-- Categories -->
    <section class="section">
      <h2 class="section-title">热门分类</h2>
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card card hover-lift"
          @click="goToCategory(category)"
        >
          <div class="category-image">
            <img :src="category.image_url ||'/placeholder.jpg'" :alt="category.name" />
          </div>
          <h3>{{ category.name }}</h3>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductGrid from '@/components/product/ProductGrid.vue'
import Loading from '@/components/common/Loading.vue'

const router = useRouter()
const productStore = useProductStore()

const featuredProducts = computed(() => 
  productStore.products.filter(p => p.is_featured).slice(0, 8)
)

const categories = computed(() => productStore.categories)

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts({ limit: 20 }),
    productStore.fetchCategories()
  ])
})

const goToCategory = (category) => {
  router.push(`/products?category=${category.id}`)
}
</script>

<style scoped>
.home-page {
  width: 100%;
}

.hero {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.1),
    rgba(236, 72, 153, 0.1)
  );
  padding: 6rem 2rem;
  text-align: center;
  margin: -2rem -1rem 3rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation-delay: 0.1s;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  animation-delay: 0.2s;
}

.btn-lg {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  animation-delay: 0.3s;
}

.section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  cursor: pointer;
  text-align: center;
  padding: 1.5rem;
}

.category-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--color-bg-tertiary);
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card h3 {
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
