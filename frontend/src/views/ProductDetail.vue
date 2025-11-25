<template>
  <div class="product-detail-page">
    <Loading v-if="productStore.loading" text="加载中..." />
    
    <div v-else-if="product" class="product-detail">
      <!-- Product Images -->
      <div class="product-gallery">
        <div class="main-image">
          <img :src="currentImage" :alt="product.name" />
        </div>
        <div v-if="product.images && product.images.length > 1" class="thumbnail-list">
          <div 
            v-for="(image, index) in product.images" 
            :key="index"
            class="thumbnail"
            :class="{ active: currentImage === image.url }"
            @click="currentImage = image.url"
          >
            <img :src="image.url" :alt="image.alt" />
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info-section">
        <h1 class="product-title">{{ product.name }}</h1>
        
        <div class="product-meta">
          <span class="meta-item">分类：{{ product.category?.name }}</span>
          <span class="meta-item">浏览：{{ product.view_count }}</span>
          <span class="meta-item">销量：{{ product.sales_count }}</span>
        </div>

        <div class="product-price-section">
          <span class="price-current">{{ formatPrice(product.price) }}</span>
          <span v-if="product.original_price" class="price-original">
            {{ formatPrice(product.original_price) }}
          </span>
        </div>

        <div class="product-stock">
          <span v-if="product.stock > 0" class="in-stock">
            库存：{{ product.stock }} 件
          </span>
          <span v-else class="out-of-stock">已售罄</span>
        </div>

        <div class="product-actions">
          <div class="quantity-selector">
            <button @click="decreaseQuantity" :disabled="quantity <= 1" class="btn btn-secondary">-</button>
            <input v-model.number="quantity" type="number" min="1" :max="product.stock" class="quantity-input" />
            <button @click="increaseQuantity" :disabled="quantity >= product.stock" class="btn btn-secondary">+</button>
          </div>

          <button 
            @click="addToCart" 
            :disabled="product.stock === 0 || loading"
            class="btn btn-primary btn-lg add-to-cart-btn"
          >
            {{ product.stock === 0 ? '已售罄' : '加入购物车' }}
          </button>
        </div>

        <div class="product-description">
          <h3>产品详情</h3>
          <p>{{ product.description || product.short_description }}</p>
        </div>

        <div v-if="product.specifications" class="product-specs">
          <h3>产品规格</h3>
          <table>
            <tr v-for="(value, key) in product.specifications" :key="key">
              <td class="spec-label">{{ key }}</td>
              <td class="spec-value">{{ value }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>产品不存在</p>
      <router-link to="/products" class="btn btn-primary">返回产品列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import Loading from '@/components/common/Loading.vue'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()

const product = computed(() => productStore.currentProduct)
const currentImage = ref('')
const quantity = ref(1)
const loading = ref(false)

onMounted(async () => {
  const productId = route.params.id
  const result = await productStore.fetchProduct(productId)
  
  if (result && result.images && result.images.length > 0) {
    currentImage.value = result.images[0].url
  }
})

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  loading.value = true
  const result = await cartStore.addToCart(product.value.id, quantity.value)
  loading.value = false
  
  if (result.success) {
    alert('已加入购物车！')
    quantity.value = 1
  } else {
    alert(result.message || '添加失败')
  }
}
</script>

<style scoped>
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-base);
}

.thumbnail.active {
  border-color: var(--color-primary);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.product-meta {
  display: flex;
  gap: 2rem;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.product-price-section {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.price-current {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
}

.price-original {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.product-stock {
  font-size: 1rem;
}

.in-stock {
  color: var(--color-success);
}

.out-of-stock {
  color: var(--color-error);
}

.product-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  padding: 0;
}

.quantity-input {
  width: 60px;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.add-to-cart-btn {
  flex: 1;
}

.product-description h3,
.product-specs h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.product-description p {
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.product-specs table {
  width: 100%;
  border-collapse: collapse;
}

.product-specs tr {
  border-bottom: 1px solid var(--color-border);
}

.spec-label {
  padding: 0.75rem 0;
  color: var(--color-text-secondary);
  width: 30%;
}

.spec-value {
  padding: 0.75rem 0;
  color: var(--color-text-primary);
  font-weight: 500;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found p {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-direction: column;
  }

  .add-to-cart-btn {
    width: 100%;
  }
}
</style>
