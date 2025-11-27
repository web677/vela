<template>
  <div class="luxury-product-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="product" class="product-layout">
      <!-- Image Gallery -->
      <div class="product-gallery">
        <div class="gallery-main">
          <img :src="currentImage" :alt="product.name" />
        </div>
        <div
          v-if="product.images && product.images.length > 1"
          class="gallery-thumbnails"
        >
          <div
            v-for="(image, index) in product.images"
            :key="index"
            :class="[
              'gallery-thumbnail',
              { active: currentImageIndex === index },
            ]"
            @click="selectImage(index)"
          >
            <img :src="image.url" :alt="image.alt" />
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="product-header">
          <h1 class="product-title">{{ product.name }}</h1>
          <div class="product-badges">
            <VBadge v-if="product.is_featured" variant="info">推荐</VBadge>
            <VBadge v-if="hasDiscount" variant="warning">特惠</VBadge>
          </div>
        </div>

        <div class="product-price-section">
          <span class="price-current">{{ formatPrice(product.price) }}</span>
          <span v-if="product.original_price" class="price-original">
            {{ formatPrice(product.original_price) }}
          </span>
        </div>

        <div class="product-stock">
          <span v-if="product.stock > 0" class="stock-available">有货</span>
          <span v-else class="stock-out">售罄</span>
        </div>

        <div class="divider"></div>

        <p v-if="product.description" class="product-description">
          {{ product.description }}
        </p>

        <div class="product-actions">
          <div class="quantity-selector">
            <label class="quantity-label">数量</label>
            <div class="quantity-controls">
              <button
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="qty-btn"
              >
                −
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="qty-input"
              />
              <button
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
                class="qty-btn"
              >
                +
              </button>
            </div>
          </div>

          <VButton
            variant="primary"
            size="lg"
            block
            :loading="addingToCart"
            :disabled="product.stock === 0"
            @click="addToCart"
          >
            {{ product.stock === 0 ? "售罄" : "加入购物车" }}
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useCartStore } from "@/stores/cart";
import { useNotification } from "@/composables/useNotification";
import { formatPrice } from "@/utils/format";
import { VButton, VBadge } from "@/components/ui";

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();
const notification = useNotification();

const loading = ref(true);
const addingToCart = ref(false);
const currentImageIndex = ref(0);
const quantity = ref(1);

const product = computed(() => productStore.currentProduct);
const currentImage = computed(() => {
  if (product.value?.images?.[currentImageIndex.value]) {
    return product.value.images[currentImageIndex.value].url;
  }
  return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80";
});

const hasDiscount = computed(() => {
  return (
    product.value?.original_price &&
    product.value.original_price > product.value.price
  );
});

const selectImage = (index) => {
  currentImageIndex.value = index;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) quantity.value++;
};

const addToCart = async () => {
  addingToCart.value = true;
  const result = await cartStore.addToCart(product.value.id, quantity.value);
  addingToCart.value = false;

  if (result.success) {
    notification.success("已加入购物车");
    quantity.value = 1;
  } else {
    notification.error(result.message || "添加失败");
  }
};

onMounted(async () => {
  loading.value = true;
  await productStore.fetchProduct(route.params.id);
  loading.value = false;
});
</script>

<style scoped>
.luxury-product-detail {
  padding-top: 80px;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.product-layout {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-4xl) var(--container-padding);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6xl);
}

.product-gallery {
  position: sticky;
  top: 120px;
  align-self: start;
}

.gallery-main {
  width: 100%;
  aspect-ratio: 3/4;
  margin-bottom: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  overflow: hidden;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumbnails {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
}

.gallery-thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: var(--transition-base);
  overflow: hidden;
}

.gallery-thumbnail.active {
  border-color: var(--color-ebony);
}

.gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.product-title {
  font-family: var(--font-family-elegant);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0;
}

.product-badges {
  display: flex;
  gap: var(--spacing-sm);
}

.product-price-section {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.price-current {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-ebony);
}

.price-original {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.product-stock {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

.stock-available {
  color: var(--color-success);
}

.stock-out {
  color: var(--color-error);
}

.product-description {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.quantity-label {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  color: var(--color-text-secondary);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 200px;
}

.qty-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: var(--font-size-lg);
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--color-ebony);
}

.qty-btn:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
}

.qty-input {
  flex: 1;
  height: 44px;
  text-align: center;
  border: 1px solid var(--color-border-light);
  background: none;
  font-size: var(--font-size-lg);
  -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

@media (max-width: 1024px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-3xl);
  }

  .product-gallery {
    position: static;
  }
}

@media (max-width: 768px) {
  .luxury-product-detail {
    padding-top: 64px;
  }

  .product-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
