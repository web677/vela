<template>
  <div class="cart-page">
    <h1 class="page-title">购物车</h1>

    <Loading v-if="cartStore.loading" text="加载中..." />

    <div v-else-if="cartStore.items.length > 0" class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item card">
          <div class="item-image">
            <img :src="item.product.images[0]?.url || '/placeholder.jpg'" :alt="item.product.name" />
          </div>

          <div class="item-info">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <p class="item-price">{{ formatPrice(item.product.price) }}</p>
          </div>

          <div class="item-quantity">
            <button @click="updateQuantity(item, item.quantity - 1)" :disabled="item.quantity <= 1" class="btn btn-secondary btn-sm">
              -
            </button>
            <span class="quantity-display">{{ item.quantity }}</span>
            <button @click="updateQuantity(item, item.quantity + 1)" :disabled="item.quantity >= item.product.stock" class="btn btn-secondary btn-sm">
              +
            </button>
          </div>

          <div class="item-subtotal">
            <span>{{ formatPrice(item.subtotal) }}</span>
          </div>

          <button @click="removeItem(item.id)" class="btn-remove" title="删除">
            <span>&times;</span>
          </button>
        </div>
      </div>

      <div class="cart-summary card">
        <h3>订单摘要</h3>
        
        <div class="summary-row">
          <span>商品总数</span>
          <span>{{ cartStore.totalItems }} 件</span>
        </div>

        <div class="summary-row summary-total">
          <span>总计</span>
          <span class="total-amount">{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>

        <button @click="goToCheckout" class="btn btn-primary btn-lg btn-block">
          去结算
        </button>

        <button @click="clearCart" class="btn btn-secondary btn-block">
          清空购物车
        </button>
      </div>
    </div>

    <div v-else class="empty-cart">
      <p>购物车是空的</p>
      <router-link to="/products" class="btn btn-primary">去选购</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import Loading from '@/components/common/Loading.vue'

const router = useRouter()
const cartStore = useCartStore()

onMounted(() => {
  cartStore.fetchCart()
})

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || newQuantity > item.product.stock) return
  
  const result = await cartStore.updateCartItem(item.id, newQuantity)
  if (!result.success) {
    alert(result.message || '更新失败')
  }
}

const removeItem = async (itemId) => {
  if (confirm('确定要删除这个商品吗？')) {
    const result = await cartStore.removeCartItem(itemId)
    if (!result.success) {
      alert(result.message || '删除失败')
    }
  }
}

const clearCart = async () => {
  if (confirm('确定要清空购物车吗？')) {
    const result = await cartStore.clearCart()
    if (!result.success) {
      alert(result.message || '清空失败')
    }
  }
}

const goToCheckout = () => {
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  position: relative;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.item-price {
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem 0.5rem;
}

.btn-sm {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.25rem;
}

.quantity-display {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text-primary);
}

.item-subtotal {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.btn-remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  transition: color var(--transition-base);
}

.btn-remove:hover {
  color: var(--color-error);
}

.cart-summary {
  position: sticky;
  top: 5rem;
}

.cart-summary h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: var(--color-text-secondary);
}

.summary-total {
  border-top: 2px solid var(--color-border);
  margin-top: 1rem;
  padding-top: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.total-amount {
  color: var(--color-primary);
  font-size: 1.75rem;
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-cart p {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }

  .item-quantity,
  .item-subtotal {
    grid-column: 2;
  }

  .btn-remove {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style>
