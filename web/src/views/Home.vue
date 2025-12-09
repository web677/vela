<template>
  <div class="luxury-home">
    <!-- Hero Section -->
    <section class="luxury-hero">
      <div class="luxury-hero-content">
        <h1 class="luxury-hero-title">优雅生活，从此开始</h1>
        <p class="luxury-hero-subtitle">探索精心策划的高品质生活方式</p>
      </div>
      <div class="luxury-hero-image">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
          alt="Luxury Lifestyle"
        />
      </div>
    </section>

    <!-- Featured Series -->
    <section class="editorial-section series-section">
      <div class="container">
        <div class="section-header">
          <h2 class="editorial-title">本月精选系列</h2>
          <p class="editorial-subtitle">为您推荐的优质系列</p>
        </div>

        <div class="loading-container" v-if="loadingSeries">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="featuredSeries" class="featured-series-wrapper">
          <VCard
            hoverable
            clickable
            padding="none"
            @click="$router.push(`/series/${featuredSeries.slug}`)"
            class="featured-series-card"
          >
            <div class="series-image">
              <img
                :src="
                  featuredSeries.cover_image ||
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
                "
                :alt="featuredSeries.name"
              />
            </div>
            <div class="series-content">
              <h3 class="series-title">{{ featuredSeries.name }}</h3>
              <p class="series-description">{{ featuredSeries.description }}</p>
              <span class="elegant-link">探索系列 →</span>
            </div>
          </VCard>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="editorial-section products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="editorial-title">精选好物</h2>
          <p class="editorial-subtitle">发现品质生活</p>
        </div>

        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
        </div>

        <ProductGrid v-else :products="featuredProducts" :columns="4" />

        <div class="text-center cta-section">
          <VButton
            variant="secondary"
            size="lg"
            @click="$router.push('/products')"
          >
            浏览更多产品
          </VButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useUserStore } from "@/stores/user";
import { VButton, VCard } from "@/components/ui";
import ProductGrid from "@/components/product/ProductGrid.vue";
import apiClient from "@/api/client";

const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();

const loading = ref(true);
const loadingSeries = ref(true);
const featuredProducts = ref([]);
const featuredSeries = ref(null);

const userGender = computed(() => userStore.gender || "male");

const loadFeaturedSeries = async () => {
  loadingSeries.value = true;
  try {
    const response = await apiClient.get("/series", {
      params: { gender: userGender.value },
    });
    // 只取第一个系列作为推荐
    featuredSeries.value = response.data?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch featured series:", error);
    featuredSeries.value = null;
  } finally {
    loadingSeries.value = false;
  }
};

const loadFeaturedProducts = async () => {
  loading.value = true;
  const result = await productStore.fetchProducts({
    limit: 4, // 只显示4个推荐商品
    gender: userGender.value,
  });
  if (result) {
    featuredProducts.value = productStore.products;
  }
  loading.value = false;
};

// Watch gender changes and reload data
watch(userGender, () => {
  loadFeaturedSeries();
  loadFeaturedProducts();
});

onMounted(async () => {
  await Promise.all([loadFeaturedSeries(), loadFeaturedProducts()]);
});
</script>

<style scoped>
.luxury-home {
  padding-top: 80px;
}

/* Hero Section */
.luxury-hero {
  position: relative;
  height: calc(100vh - 80px);
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.luxury-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.luxury-hero-image::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(245, 243, 239, 0.95) 0%,
    rgba(245, 243, 239, 0.3) 100%
  );
}

.luxury-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.luxury-hero-content {
  position: relative;
  z-index: 1;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  animation: fadeInUp var(--duration-slow) var(--ease-elegant);
}

.luxury-hero-title {
  font-family: var(--font-family-elegant);
  font-size: var(--font-size-7xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
  letter-spacing: var(--letter-spacing-tight);
}

.luxury-hero-subtitle {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-light);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3xl);
  letter-spacing: var(--letter-spacing-wide);
}

/* Section Styles */
.series-section {
  background-color: var(--color-bg-primary);
  padding: var(--spacing-6xl) 0;
}

.products-section {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-6xl) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-5xl);
}

/* Featured Series Card */
.featured-series-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.featured-series-card {
  box-shadow: var(--shadow-xl);
  transition: all var(--duration-normal) var(--ease-elegant);
}

.featured-series-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-2xl);
}

.series-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4/5;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.series-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-elegant);
}

.featured-series-card:hover .series-image img {
  transform: scale(1.08);
}

.series-content {
  padding: var(--spacing-2xl);
  text-align: center;
}

.series-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ebony);
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: var(--letter-spacing-tight);
}

.series-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  line-height: var(--line-height-relaxed);
}

.cta-section {
  margin-top: var(--spacing-5xl);
}

/* Category Cards */
.category-image {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-elegant);
}

.luxury-card:hover .category-image img {
  transform: scale(1.05);
}

.category-content {
  padding: var(--spacing-xl);
}

.category-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin-bottom: var(--spacing-sm);
}

.category-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-4xl) 0;
}

/* Mobile */
@media (max-width: 768px) {
  .luxury-home {
    padding-top: 64px;
  }

  .luxury-hero {
    height: 80vh;
    min-height: 500px;
  }

  .luxury-hero-title {
    font-size: var(--font-size-4xl);
  }

  .luxury-hero-subtitle {
    font-size: var(--font-size-base);
  }

  .luxury-hero-image::after {
    background: rgba(245, 243, 239, 0.85);
  }
}
</style>
