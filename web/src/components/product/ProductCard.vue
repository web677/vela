<template>
  <VCard
    class="luxury-product-card"
    hoverable
    clickable
    padding="none"
    @click="goToDetail"
  >
    <div class="product-image-container">
      <img
        :src="
          product.images[0]?.url ||
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80'
        "
        :alt="product.name"
        class="product-image"
      />
      <div
        v-if="product.is_featured || product.stock === 0 || hasDiscount"
        class="product-badges"
      >
        <VBadge v-if="product.is_featured" variant="info" size="sm"
          >推荐</VBadge
        >
        <VBadge v-if="product.stock === 0" variant="error" size="sm"
          >售罄</VBadge
        >
        <VBadge v-if="hasDiscount" variant="warning" size="sm">特惠</VBadge>
      </div>
    </div>

    <div class="product-content">
      <h3 class="product-name">{{ product.name }}</h3>
      <p v-if="product.short_description" class="product-description">
        {{ product.short_description }}
      </p>

      <div class="product-footer">
        <div class="product-price">
          <span class="price-current">{{ formatPrice(product.price) }}</span>
          <span v-if="product.original_price" class="price-original">
            {{ formatPrice(product.original_price) }}
          </span>
        </div>

        <VButton
          variant="primary"
          size="sm"
          :loading="loading"
          :disabled="product.stock === 0"
          @click.stop="addToCart"
        >
          {{ product.stock === 0 ? "售罄" : "加入" }}
        </VButton>
      </div>
    </div>
  </VCard>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useNotification } from "@/composables/useNotification";
import { formatPrice } from "@/utils/format";
import { VButton, VBadge, VCard } from "@/components/ui";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const cartStore = useCartStore();
const notification = useNotification();
const loading = ref(false);

const hasDiscount = computed(() => {
  return (
    props.product.original_price &&
    props.product.original_price > props.product.price
  );
});

const goToDetail = () => {
  router.push(`/products/${props.product.id}`);
};

const addToCart = async () => {
  loading.value = true;
  const result = await cartStore.addToCart(props.product.id);
  loading.value = false;

  if (result.success) {
    notification.success("已加入购物车");
  } else {
    notification.error(result.message || "添加失败");
  }
};
</script>

<style scoped>
.luxury-product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-elegant);
}

.luxury-product-card:hover .product-image {
  transform: scale(1.03);
}

.product-badges {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.product-content {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
}

.product-name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  margin: 0;
  min-height: 2.8em;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-current {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-ebony);
}

.price-original {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .product-content {
    padding: var(--spacing-md);
  }
}
</style>
