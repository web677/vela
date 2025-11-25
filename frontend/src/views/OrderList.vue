<template>
  <div class="order-list-page">
    <h1 class="page-title">我的订单</h1>

    <Loading v-if="orderStore.loading" text="加载中..." />

    <div v-else-if="orderStore.orders.length > 0" class="orders-list">
      <div 
        v-for="order in orderStore.orders" 
        :key="order.id" 
        class="order-card card hover-lift"
        @click="goToOrderDetail(order.id)"
      >
        <div class="order-header">
          <div class="order-number">
            订单号：{{ order.order_number }}
          </div>
          <span 
            class="order-status badge"
            :style="{ background: getStatusColor(order.status) }"
          >
            {{ getOrderStatusText(order.status) }}
          </span>
        </div>

        <div class="order-info">
          <div class="order-meta">
            <span>下单时间：{{ formatDate(order.created_at) }}</span>
            <span>商品数量：{{ order.items_count }} 件</span>
          </div>
          <div class="order-total">
            总计：<span class="amount">{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>暂无订单</p>
      <router-link to="/products" class="btn btn-primary">去选购</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { formatPrice, formatDate, getOrderStatusText, getOrderStatusColor } from '@/utils/format'
import Loading from '@/components/common/Loading.vue'

const router = useRouter()
const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchOrders()
})

const getStatusColor = (status) => {
  return getOrderStatusColor(status)
}

const goToOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`)
}
</script>

<style scoped>
.order-list-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-primary);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  cursor: pointer;
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.order-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.order-status {
  padding: 0.375rem 1rem;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.order-total {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-left: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state p {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
