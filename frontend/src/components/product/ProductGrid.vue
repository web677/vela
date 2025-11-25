<template>
  <div class="product-grid grid" :class="`grid-${columns}`">
    <ProductCard 
      v-for="product in products" 
      :key="product.id" 
      :product="product" 
    />
  </div>

  <div v-if="products.length === 0" class="empty-state">
    <p>暂无产品</p>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: {
    type: Array,
    required: true
  },
  columns: {
    type: Number,
    default: 4
  }
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}
</style>
