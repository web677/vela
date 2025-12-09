<template>
  <router-link 
    :to="`/series/${series.slug}`" 
    class="series-card"
    :style="{ '--series-color': series.theme_color }"
  >
    <div class="series-image">
      <img 
        v-if="series.hero_image_url" 
        :src="series.hero_image_url" 
        :alt="series.name"
      />
      <div v-else class="series-placeholder" :style="{ backgroundColor: series.theme_color }">
        <span class="series-name-large">{{ series.name }}</span>
      </div>
      <div class="series-overlay"></div>
    </div>

    <div class="series-content">
      <h3 class="series-name font-serif">{{ series.name }}</h3>
      <p class="series-name-en">{{ series.name_en }}</p>
      <p class="series-subtitle">{{ series.subtitle }}</p>
    </div>

    <div class="series-footer">
      <span class="explore-text">探索系列</span>
      <span class="arrow">→</span>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({
  series: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.series-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-sm);
  height: 100%;
}

.series-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.series-image {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
}

.series-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.series-card:hover .series-image img {
  transform: scale(1.05);
}

.series-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
}

.series-name-large {
  font-family: var(--font-family-serif);
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
  color: white;
  text-align: center;
  opacity: 0.8;
}

.series-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.series-card:hover .series-overlay {
  opacity: 1;
}

.series-content {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.series-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.series-name-en {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  font-style: italic;
  letter-spacing: 0.5px;
}

.series-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0 0 0;
  line-height: var(--line-height-relaxed);
}

.series-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  color: var(--series-color, var(--color-primary));
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.arrow {
  transition: transform var(--duration-base) var(--ease-out);
  font-size: var(--font-size-lg);
}

.series-card:hover .arrow {
  transform: translateX(4px);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .series-name {
    font-size: var(--font-size-lg);
  }

  .series-name-large {
    font-size: 2rem;
  }
}
</style>
