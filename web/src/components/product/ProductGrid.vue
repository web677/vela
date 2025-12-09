<template>
  <div
    v-if="products.length > 0"
    class="product-grid"
    :class="`product-grid--cols-${columns}`"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :show-stock="showStock"
    />
  </div>

  <div v-else class="empty-state">
    <div class="empty-icon">📦</div>
    <p class="empty-text">暂无产品</p>
    <p class="empty-hint">请稍后再来查看</p>
  </div>
</template>

<script setup>
import ProductCard from "./ProductCard.vue";

defineProps({
  products: {
    type: Array,
    required: true,
  },
  columns: {
    type: Number,
    default: 4,
  },
  showStock: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.product-grid {
  display: grid;
  gap: var(--spacing-xl);
  width: 100%;
}

.product-grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.product-grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.product-grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .product-grid--cols-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    gap: var(--spacing-lg);
  }

  .product-grid--cols-3,
  .product-grid--cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-grid {
    gap: var(--spacing-md);
  }

  .product-grid--cols-2,
  .product-grid--cols-3,
  .product-grid--cols-4 {
    grid-template-columns: 1fr;
  }
}
</style>
