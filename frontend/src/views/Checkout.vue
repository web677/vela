<template>
  <div class="checkout-page">
    <h1 class="page-title">结算</h1>

    <div class="checkout-content">
      <form @submit.prevent="submitOrder" class="checkout-form">
        <!-- Shipping Address -->
        <div class="form-section card">
          <h3>收货地址</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label>收货人</label>
              <input v-model="form.shipping_address.name" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>联系电话</label>
              <input v-model="form.shipping_address.phone" type="tel" class="input" required />
            </div>

            <div class="form-group">
              <label>省份</label>
              <input v-model="form.shipping_address.province" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>城市</label>
              <input v-model="form.shipping_address.city" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>区县</label>
              <input v-model="form.shipping_address.district" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>邮编</label>
              <input v-model="form.shipping_address.zipcode" type="text" class="input" />
            </div>

            <div class="form-group full-width">
              <label>详细地址</label>
              <input v-model="form.shipping_address.address" type="text" class="input" required />
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="form-section card">
          <h3>联系信息</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label>联系人</label>
              <input v-model="form.contact_info.name" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>联系电话</label>
              <input v-model="form.contact_info.phone" type="tel" class="input" required />
            </div>

            <div class="form-group full-width">
              <label>电子邮箱</label>
              <input v-model="form.contact_info.email" type="email" class="input" required />
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-section card">
          <h3>支付方式</h3>
          
          <div class="payment-options">
            <label class="payment-option">
              <input v-model="form.payment_method" type="radio" value="alipay" />
              <span>支付宝</span>
            </label>
            <label class="payment-option">
              <input v-model="form.payment_method" type="radio" value="wechat" />
              <span>微信支付</span>
            </label>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-section card">
          <h3>订单备注</h3>
          <textarea v-model="form.notes" class="input" rows="3" placeholder="选填：给卖家留言..."></textarea>
        </div>
      </form>

      <!-- Order Summary -->
      <div class="order-summary card">
        <h3>订单信息</h3>

        <div class="summary-items">
          <div v-for="item in cartStore.items" :key="item.id" class="summary-item">
            <img :src="item.product.images[0]?.url || '/placeholder.jpg'" :alt="item.product.name" />
            <div class="item-details">
              <p class="item-name">{{ item.product.name }}</p>
              <p class="item-qty">x{{ item.quantity }}</p>
            </div>
            <span class="item-price">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>

        <div class="summary-total">
          <span>总计</span>
          <span class="total-amount">{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>

        <button 
          @click="submitOrder" 
          :disabled="submitting"
          class="btn btn-primary btn-lg btn-block"
        >
          {{ submitting ? '提交中...' : '提交订单' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const submitting = ref(false)

const form = ref({
  shipping_address: {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    zipcode: ''
  },
  contact_info: {
    name: '',
    phone: '',
    email: userStore.user?.email || ''
  },
  payment_method: 'alipay',
  notes: ''
})

onMounted(() => {
  cartStore.fetchCart()
  
  // 预填用户信息
  if (userStore.user) {
    form.value.contact_info.name = userStore.user.full_name || ''
    form.value.contact_info.phone = userStore.user.phone || ''
    form.value.shipping_address.name = userStore.user.full_name || ''
    form.value.shipping_address.phone = userStore.user.phone || ''
  }
})

const submitOrder = async () => {
  if (cartStore.items.length === 0) {
    alert('购物车是空的')
    return
  }

  submitting.value = true

  // 构建订单数据
  const orderData = {
    items: cartStore.items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    })),
    ...form.value
  }

  const result = await orderStore.createOrder(orderData)
  submitting.value = false

  if (result.success) {
    alert('订单创建成功！')
    router.push(`/orders/${result.data.id}`)
  } else {
    alert(result.message || '订单创建失败')
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.payment-options {
  display: flex;
  gap: 2rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.payment-option input {
  cursor: pointer;
}

.order-summary {
  position: sticky;
  top: 5rem;
}

.order-summary h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  align-items: center;
}

.summary-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.item-price {
  font-weight: 600;
  color: var(--color-text-primary);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-border);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.total-amount {
  color: var(--color-primary);
  font-size: 1.75rem;
}

.btn-block {
  width: 100%;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
