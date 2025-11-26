<template>
  <div class="order-detail-page">
    <Loading v-if="orderStore.loading" text="加载中..." />

    <div v-else-if="order" class="order-detail">
      <div class="order-header card">
        <h1 class="page-title">订单详情</h1>
        
        <div class="order-summary">
          <div class="summary-item">
            <span class="label">订单号</span>
            <span class="value">{{ order.order_number }}</span>
          </div>
          <div class="summary-item">
            <span class="label">订单状态</span>
            <span 
              class="badge"
              :style="{ background: getStatusColor(order.status) }"
            >
              {{ getOrderStatusText(order.status) }}
            </span>
          </div>
          <div class="summary-item">
            <span class="label">下单时间</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">订单总额</span>
            <span class="amount">{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>

        <button 
          v-if="order.status === 'pending'"
          @click="cancelOrder"
          class="btn btn-secondary"
        >
          取消订单
        </button>
      </div>

      <!-- Order Items -->
      <div class="order-items card">
        <h3>订单商品</h3>
        <div class="items-list">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img 
              :src="item.product_snapshot.image || '/placeholder.jpg'" 
              :alt="item.product_snapshot.name" 
            />
            <div class="item-info">
              <p class="item-name">{{ item.product_snapshot.name }}</p>
              <p class="item-specs" v-if="item.product_snapshot.specifications">
                {{ Object.values(item.product_snapshot.specifications).join(' / ') }}
              </p>
            </div>
            <div class="item-price">
              <p>{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
              <p class="subtotal">{{ formatPrice(item.subtotal) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="shipping-info card">
        <h3>收货信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">收货人</span>
            <span class="value">{{ order.shipping_address.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ order.shipping_address.phone }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">收货地址</span>
            <span class="value">
              {{ order.shipping_address.province }}
              {{ order.shipping_address.city }}
              {{ order.shipping_address.district }}
              {{ order.shipping_address.address }}
            </span>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="contact-info card">
        <h3>联系信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">联系人</span>
            <span class="value">{{ order.contact_info.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ order.contact_info.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">电子邮箱</span>
            <span class="value">{{ order.contact_info.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>订单不存在</p>
      <router-link to="/orders" class="btn btn-primary">返回订单列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useNotification } from '@/composables/useNotification'
import { useConfirm } from '@/composables/useConfirm'
import { formatPrice, formatDate, getOrderStatusText, getOrderStatusColor } from '@/utils/format'
import Loading from '@/components/common/Loading.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const notification = useNotification()
const { confirm } = useConfirm()

const order = computed(() => orderStore.currentOrder)

onMounted(() => {
  const orderId = route.params.id
  orderStore.fetchOrder(orderId)
})

const getStatusColor = (status) => {
  return getOrderStatusColor(status)
}

const cancelOrder = async () => {
  const confirmed = await confirm('确定要取消这个订单吗？', '取消订单')
  if (confirmed) {
    const result = await orderStore.cancelOrder(order.value.id)
    if (result.success) {
      notification.success('订单已取消')
      await orderStore.fetchOrder(order.value.id)
    } else {
      notification.error(result.message || '取消失败')
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.order-header {
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.order-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.value {
  font-size: 1.125rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  width: fit-content;
}

.amount {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-primary);
}

.order-items h3,
.shipping-info h3,
.contact-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: center;
}

.order-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
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

.item-specs {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.item-price {
  text-align: right;
}

.item-price p {
  margin: 0;
  color: var(--color-text-secondary);
}

.subtotal {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary) !important;
  margin-top: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
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
  .order-summary,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    grid-template-columns: 80px 1fr;
  }

  .item-price {
    grid-column: 2;
    text-align: left;
    margin-top: 0.5rem;
  }
}
</style>
