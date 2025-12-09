<template>
  <teleport to="body">
    <transition name="quickview-slide">
      <div v-if="show" class="quick-view-overlay" @click="close">
        <div class="quick-view-panel" @click.stop>
          <!-- Header -->
          <div class="panel-header">
            <h3>快速预览</h3>
            <button @click="close" class="close-btn" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div v-if="product" class="panel-content">
            <!-- Product Image -->
            <div class="product-image">
              <img 
                :src="product.images?.[0]?.url || '/placeholder.jpg'" 
                :alt="product.name"
              />
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <h2 class="product-name">{{ product.name }}</h2>
              <p class="product-price">{{ formatPrice(product.price) }}</p>
              
              <div v-if="product.description" class="product-description">
                <p>{{ truncateText(product.description, 100) }}</p>
              </div>

              <!-- Quick Stats -->
              <div class="product-stats">
                <div class="stat-item" v-if="product.stock !== undefined">
                  <span class="stat-label">库存</span>
                  <span class="stat-value">{{ product.stock }}</span>
                </div>
                <div class="stat-item" v-if="product.sales_count">
                  <span class="stat-label">销量</span>
                  <span class="stat-value">{{ product.sales_count }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="panel-actions">
              <button 
                @click="addToCart" 
                :disabled="adding || product.stock === 0"
                class="btn btn-primary"
              >
                {{ adding ? '添加中...' : product.stock === 0 ? '已售罄' : '加入购物车' }}
              </button>
              <router-link 
                :to="`/products/${product.id}`" 
                class="btn btn-secondary"
                @click="close"
              >
                查看详情
              </router-link>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else class="panel-loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useNotification } from '@/composables/useNotification'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  product: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'added'])

const cartStore = useCartStore()
const notification = useNotification()
const adding = ref(false)

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const addToCart = async () => {
  if (!props.product) return
  
  adding.value = true
  const result = await cartStore.addToCart(props.product.id, 1)
  adding.value = false

  if (result.success) {
    notification.success('已加入购物车！')
    emit('added', props.product)
    
    // Auto close after success
    setTimeout(() => {
      close()
    }, 800)
  } else {
    notification.error(result.message || '添加失败')
  }
}

const close = () => {
  emit('close')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.quick-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-end;
}

.quick-view-panel {
  width: 100%;
  max-height: 75vh;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.panel-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base);
}

.close-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  -webkit-overflow-scrolling: touch;
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--color-bg-secondary);
  margin-bottom: var(--spacing-lg);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  margin-bottom: var(--spacing-xl);
}

.product-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-tight);
}

.product-price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.product-description {
  margin-bottom: var(--spacing-md);
}

.product-description p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.product-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  background-color: var(--color-bg-primary);
}

.panel-actions .btn {
  flex: 1;
  justify-content: center;
}

.panel-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.panel-loading p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Animations */
.quickview-slide-enter-active,
.quickview-slide-leave-active {
  transition: transform var(--duration-slow) var(--ease-out);
}

.quickview-slide-enter-active .quick-view-overlay,
.quickview-slide-leave-active .quick-view-overlay {
  transition: opacity var(--duration-base);
}

.quickview-slide-enter-from .quick-view-panel,
.quickview-slide-leave-to .quick-view-panel {
  transform: translateY(100%);
}

.quickview-slide-enter-from .quick-view-overlay,
.quickview-slide-leave-to .quick-view-overlay {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Desktop */
@media (min-width: 768px) {
  .quick-view-overlay {
    align-items: center;
    justify-content: center;
  }

  .quick-view-panel {
    max-width: 500px;
    max-height: 80vh;
    border-radius: var(--radius-xl);
  }
}
</style>
