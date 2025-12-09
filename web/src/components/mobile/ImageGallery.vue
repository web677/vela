<template>
  <teleport to="body">
    <transition name="gallery-fade">
      <div v-if="show" class="image-gallery" @click="close">
        <div class="gallery-header">
          <button @click="close" class="close-btn" aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
        </div>

        <div class="gallery-content" @click.stop>
          <div 
            class="image-container"
            ref="containerRef"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <img 
              v-for="(image, index) in images"
              :key="index"
              :src="image.url || image"
              :alt="image.alt || `图片 ${index + 1}`"
              :class="['gallery-image', { active: index === currentIndex }]"
              :style="getImageStyle(index)"
              @load="handleImageLoad"
            />
          </div>

          <!-- Navigation Arrows -->
          <button 
            v-if="images.length > 1"
            @click="prev" 
            class="nav-arrow nav-prev"
            :disabled="currentIndex === 0"
            aria-label="上一张"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button 
            v-if="images.length > 1"
            @click="next" 
            class="nav-arrow nav-next"
            :disabled="currentIndex === images.length - 1"
            aria-label="下一张"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Thumbnails -->
        <div v-if="images.length > 1" class="gallery-thumbnails">
          <div class="thumbnails-track">
            <button
              v-for="(image, index) in images"
              :key="index"
              @click.stop="goToImage(index)"
              :class="['thumbnail', { active: index === currentIndex }]"
            >
              <img :src="image.url || image" :alt="`缩略图 ${index + 1}`" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'change'])

const currentIndex = ref(props.initialIndex)
const containerRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const translateX = ref(0)
const scale = ref(1)

const getImageStyle = (index) => {
  const offset = (index - currentIndex.value) * 100
  return {
    transform: `translateX(calc(${offset}% + ${translateX.value}px)) scale(${scale.value})`
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('change', currentIndex.value)
  }
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    emit('change', currentIndex.value)
  }
}

const goToImage = (index) => {
  currentIndex.value = index
  emit('change', index)
}

const close = () => {
  emit('close')
}

const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }
}

const handleTouchMove = (e) => {
  if (e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - touchStartX.value
    const deltaY = e.touches[0].clientY - touchStartY.value
    
    // 水平滑动切换图片
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      translateX.value = deltaX
    }
    // 垂直滑动关闭画廊
    else if (deltaY > 50) {
      close()
    }
  }
}

const handleTouchEnd = () => {
  if (Math.abs(translateX.value) > 50) {
    if (translateX.value > 0) {
      prev()
    } else {
      next()
    }
  }
  translateX.value = 0
}

const handleImageLoad = () => {
  // Image loaded
}

const handleKeydown = (e) => {
  if (!props.show) return
  
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Escape') close()
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    currentIndex.value = props.initialIndex
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-gallery {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  color: white;
  z-index: 2;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-base);
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.image-counter {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.gallery-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  touch-action: pan-y pinch-zoom;
}

.gallery-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  opacity: 0;
  transition: transform var(--duration-slow) var(--ease-out),
              opacity var(--duration-base);
  pointer-events: none;
}

.gallery-image.active {
  opacity: 1;
  pointer-events: auto;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base);
  z-index: 2;
}

.nav-arrow:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-arrow svg {
  width: 24px;
  height: 24px;
}

.nav-prev {
  left: var(--spacing-lg);
}

.nav-next {
  right: var(--spacing-lg);
}

.gallery-thumbnails {
  padding: var(--spacing-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.gallery-thumbnails::-webkit-scrollbar {
  display: none;
}

.thumbnails-track {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  min-width: min-content;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--duration-base);
  background: none;
  padding: 0;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity var(--duration-base);
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .nav-arrow {
    width: 40px;
    height: 40px;
  }

  .nav-prev {
    left: var(--spacing-sm);
  }

  .nav-next {
    right: var(--spacing-sm);
  }

  .gallery-image {
    max-width: 95%;
    max-height: 95%;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }
}
</style>
