<template>
  <div class="luxury-home">
    <!-- Hero Section -->
    <section class="luxury-hero">
      <div class="luxury-hero-content">
        <h1 class="luxury-hero-title">优雅生活，从此开始</h1>
        <p class="luxury-hero-subtitle">探索精心策划的高品质生活方式</p>
        <VButton variant="primary" size="lg" @click="$router.push('/products')">
          探索系列
        </VButton>
      </div>
      <div class="luxury-hero-image">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
          alt="Luxury Lifestyle"
        />
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="editorial-section">
      <div class="container">
        <h2 class="editorial-title">精选系列</h2>
        <p class="editorial-subtitle">为您甄选的品质生活</p>

        <div class="grid grid-3">
          <VCard
            v-for="category in categories"
            :key="category.id"
            hoverable
            clickable
            padding="none"
            @click="goToCategory(category.id)"
          >
            <div class="category-image">
              <img :src="category.image" :alt="category.name" />
            </div>
            <div class="category-content">
              <h3 class="category-title">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
              <span class="elegant-link">探索 →</span>
            </div>
          </VCard>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section
      class="editorial-section"
      style="background-color: var(--color-bg-secondary)"
    >
      <div class="container">
        <h2 class="editorial-title">本季推荐</h2>

        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
        </div>

        <ProductGrid v-else :products="featuredProducts" :columns="4" />

        <div class="text-center" style="margin-top: var(--spacing-4xl)">
          <VButton variant="secondary" @click="$router.push('/products')">
            查看全部产品
          </VButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useUserStore } from "@/stores/user";
import { VButton, VCard } from "@/components/ui";
import ProductGrid from "@/components/product/ProductGrid.vue";

const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();

const loading = ref(true);
const featuredProducts = ref([]);

const userGender = computed(() => userStore.gender || "male");

const categories = [
  {
    id: 1,
    name: "雾光森林",
    description: "自然清新，回归本真",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  },
  {
    id: 2,
    name: "月田时分",
    description: "静谧优雅，时光流转",
    image:
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=800&q=80",
  },
  {
    id: 3,
    name: "城郊余温",
    description: "温暖舒适，惬意生活",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
];

const goToCategory = (categoryId) => {
  router.push(`/series/${categoryId}`);
};

onMounted(async () => {
  loading.value = true;
  const result = await productStore.fetchProducts({
    limit: 8,
    gender: userGender.value, // 添加性别参数
  });
  if (result) {
    featuredProducts.value = productStore.products;
  }
  loading.value = false;
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
