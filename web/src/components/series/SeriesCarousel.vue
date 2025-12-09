<template>
  <div class="series-carousel">
    <div class="carousel-header">
      <h2 class="carousel-title font-heading">探索系列</h2>
      <p class="carousel-subtitle">每个系列都有独特的故事</p>
    </div>

    <div class="carousel-container" ref="carouselRef">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * slideWidth}px)` }">
        <div 
          v-for="series in seriesList" 
          :key="series.id"
          class="carousel-slide"
        >
          <SeriesCard :series="series" />
        </div>
      </div>
    </div>

    <div class="carousel-navigation" v-if="seriesList.length > visibleSlides">
      <button 
        @click="prev" 
        :disabled="currentIndex === 0"
        class="nav-button nav-prev"
        aria-label="上一页"
      >
        ←
      </button>
      
      <div class="nav-indicators">
        <button
          v-for="(_, index) in Math.ceil(seriesList.length / visibleSlides)"
          :key="index"
          @click="goToSlide(index)"
          :class="['indicator', { active: Math.floor(currentIndex / visibleSlides) === index }]"
          :aria-label="`跳转到第 ${index + 1} 页`"
        ></button>
      </div>

      <button 
        @click="next" 
        :disabled="currentIndex >= seriesList.length - visibleSlides"
        class="nav-button nav-next"
        aria-label="下一页"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SeriesCard from './SeriesCard.vue'

const props = defineProps({
  seriesList: {
    type: Array,
    required: true
  }
})

const carouselRef = ref(null)
const currentIndex = ref(0)
const slideWidth = ref(0)
const visibleSlides = ref(3)

const updateDimensions = () => {
  if (carouselRef.value) {
    const width = carouselRef.value.clientWidth
    if (width < 640) {
      visibleSlides.value = 1
    } else if (width < 1024) {
      visibleSlides.value = 2
    } else {
      visibleSlides.value = 3
    }
    slideWidth.value = width / visibleSlides.value
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const next = () => {
  if (currentIndex.value < props.seriesList.length - visibleSlides.value) {
    currentIndex.value++
  }
}

const goToSlide = (index) => {
  currentIndex.value = index * visibleSlides.value
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})
</script>

<style scoped>
.series-carousel {
  width: 100%;
  padding: var(--spacing-2xl) 0;
}

.carousel-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.carousel-title {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.carousel-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.carousel-container {
  overflow: hidden;
  width: 100%;
}

.carousel-track {
  display: flex;
  gap: var(--spacing-lg);
  transition: transform var(--duration-slow) var(--ease-out);
}

.carousel-slide {
  flex-shrink: 0;
  width: calc((100% - var(--spacing-lg) * 2) / 3);
}

.carousel-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.nav-button {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-default);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-in-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-indicators {
  display: flex;
  gap: var(--spacing-sm);
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--color-border-default);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-in-out);
  padding: 0;
}

.indicator.active {
  background-color: var(--color-primary);
  width: 24px;
}

.indicator:hover {
  background-color: var(--color-primary-light);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .carousel-slide {
    width: calc((100% - var(--spacing-lg)) / 2);
  }
}

@media (max-width: 640px) {
  .carousel-slide {
    width: 100%;
  }

  .carousel-track {
    gap: var(--spacing-md);
  }

  .carousel-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
