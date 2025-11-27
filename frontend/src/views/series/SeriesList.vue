<template>
  <div class="series-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="editorial-title">探索系列</h1>
        <p class="editorial-subtitle">精心策划的生活方式系列</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="series && series.length > 0" class="grid grid-3">
        <VCard
          v-for="item in series"
          :key="item.id"
          hoverable
          clickable
          padding="none"
          @click="goToSeries(item.slug)"
        >
          <div class="series-image">
            <img
              :src="
                item.cover_image ||
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
              "
              :alt="item.name"
            />
          </div>
          <div class="series-content">
            <h3 class="series-title">{{ item.name }}</h3>
            <p class="series-description">{{ item.description }}</p>
            <span class="elegant-link">探索系列 →</span>
          </div>
        </VCard>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>暂无系列</h2>
        <p>敬请期待更多精彩系列</p>
        <VButton variant="primary" @click="$router.push('/products')">
          浏览产品
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { VButton, VCard } from "@/components/ui";
import apiClient from "@/api/client";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(true);
const series = ref([]);

const userGender = computed(() => userStore.gender || "male");

const goToSeries = (seriesId) => {
  router.push(`/series/${seriesId}`);
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await apiClient.get("/series", {
      params: { gender: userGender.value },
    });
    series.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch series:", error);
    series.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.series-list-page {
  padding-top: 120px;
  min-height: 100vh;
  padding-bottom: var(--spacing-6xl);
}

.page-header {
  margin-bottom: var(--spacing-6xl);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-6xl) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-ebony);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.series-image {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.series-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-elegant);
}

.luxury-card:hover .series-image img {
  transform: scale(1.05);
}

.series-content {
  padding: var(--spacing-xl);
}

.series-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0 0 var(--spacing-sm) 0;
}

.series-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6xl) 0;
  text-align: center;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.3;
  margin-bottom: var(--spacing-xl);
}

.empty-state h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2xl) 0;
}

@media (max-width: 768px) {
  .series-list-page {
    padding-top: 100px;
  }
}
</style>
