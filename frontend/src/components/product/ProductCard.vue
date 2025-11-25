<template>
  <div class="product-card card hover-lift" @click="goToDetail">
    <div class="product-image">
      <img :src="product.images[0]?.url || '/placeholder.jpg'" :alt="product.name" />
      <span v-if="product.is_featured" class="badge-featured">推荐</span>
      <span v-if="product.stock === 0" class="badge-out-of-stock">售罄</span>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.short_description }}</p>

      <div class="product-footer">
        <div class="product-price">
          <span class="price-current">{{ formatPrice(product.price) }}</span>
          <span v-if="product.original_price" class="price-original">
            {{ formatPrice(product.original_price) }}
          </span>
        </div>

        <button 
          class="btn btn-primary btn-sm" 
          @click.stop="addToCart"
          :disabled="product.stock === 0 || loading"
        >
          {{ product.stock === 0 ? '售罄' : '加入购物车' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()
const loading = ref(false)

const goToDetail = () => {
  router.push(`/products/${props.product.id}`)
}

const addToCart = async () => {
  loading.value = true
  const result = await cartStore.addToCart(props.product.id)
  loading.value = false
  
  if (result.success) {
    alert('已加入购物车！')
  } else {
    alert(result.message || '添加失败')
  }
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.badge-featured {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-out-of-stock {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: var(--color-error);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-original {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
