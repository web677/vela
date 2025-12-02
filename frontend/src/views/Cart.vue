<template>
  <div class="luxury-cart">
    <div class="container container-wide">
      <h1 class="page-title">购物车</h1>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="cartStore.items.length > 0" class="cart-layout">
        <div class="cart-items">
          <VCard
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
            padding="lg"
          >
            <img
              :src="
                item.product.images[0]?.url ||
                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80'
              "
              :alt="item.product.name"
              class="item-image"
            />

            <div class="item-details">
              <h3 class="item-name">{{ item.product.name }}</h3>
              <p class="item-price">{{ formatPrice(item.product.price) }}</p>
            </div>

            <div class="item-actions">
              <div class="qty-controls">
                <button
                  @click="updateQty(item, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                  class="qty-btn"
                >
                  −
                </button>
                <span class="qty-display">{{ item.quantity }}</span>
                <button
                  @click="updateQty(item, item.quantity + 1)"
                  :disabled="item.quantity >= item.product.stock"
                  class="qty-btn"
                >
                  +
                </button>
              </div>

              <span class="item-subtotal">{{
                formatPrice(item.subtotal)
              }}</span>

              <button @click="removeItem(item.id)" class="remove-btn">
                删除
              </button>
            </div>
          </VCard>
        </div>

        <div class="cart-summary">
          <VCard padding="xl">
            <h3 class="summary-title">订单摘要</h3>

            <div class="summary-rows">
              <div class="summary-row">
                <span>商品数量</span>
                <span>{{ cartStore.totalItems }} 件</span>
              </div>

              <div class="divider"></div>

              <div class="summary-row summary-total">
                <span>总计</span>
                <span class="total-amount">{{
                  formatPrice(cartStore.totalAmount)
                }}</span>
              </div>
            </div>

            <VButton
              variant="primary"
              size="lg"
              block
              @click="$router.push('/checkout')"
            >
              结算
            </VButton>
          </VCard>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2>购物车是空的</h2>
        <p>还没有添加商品</p>
        <VButton variant="primary" @click="$router.push('/products')">
          去选购
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useNotification } from "@/composables/useNotification";
import { formatPrice } from "@/utils/format";
import { VButton, VCard } from "@/components/ui";

const cartStore = useCartStore();
const notification = useNotification();
const loading = ref(true);

onMounted(async () => {
  await cartStore.fetchCart();
  loading.value = false;
});

const updateQty = async (item, newQty) => {
  if (newQty < 1 || newQty > item.product.stock) return;
  await cartStore.updateCartItem(item.id, newQty);
};

const removeItem = async (itemId) => {
  const result = await cartStore.removeCartItem(itemId);
  if (result.success) {
    notification.success("已删除");
  }
};
</script>

<style scoped>
.luxury-cart {
  padding-top: 120px;
  min-height: 100vh;
  padding-bottom: var(--spacing-6xl);
}

.page-title {
  font-family: var(--font-family-elegant);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-regular);
  text-align: center;
  margin-bottom: var(--spacing-4xl);
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-3xl);
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.cart-item {
  display: block !important;
}

.cart-item :deep(.luxury-card) {
  display: grid !important;
  grid-template-columns: 120px 1fr auto;
  gap: var(--spacing-xl);
  align-items: center;
}

.item-image {
  width: 120px;
  height: 150px;
  object-fit: cover;
  background-color: var(--color-bg-secondary);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0;
}

.item-price {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: flex-end;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border-default);
  cursor: pointer;
  transition: var(--transition-base);
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--color-ebony);
}

.qty-display {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-base);
}

.item-subtotal {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-ebony);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  cursor: pointer;
  transition: var(--transition-base);
}

.remove-btn:hover {
  color: var(--color-error);
}

.cart-summary {
  position: sticky;
  top: 120px;
}

.summary-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0 0 var(--spacing-xl) 0;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.summary-total {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  font-size: var(--font-size-lg);
  color: var(--color-ebony);
}

.total-amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-ebony);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6xl) 0;
  text-align: center;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.3;
  margin-bottom: var(--spacing-xl);
}

.empty-state h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
}

@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .luxury-cart {
    padding-top: 100px;
  }

  .cart-item :deep(.luxury-card) {
    grid-template-columns: 100px 1fr;
    gap: var(--spacing-md);
  }

  .item-image {
    width: 100px;
    height: 125px;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
