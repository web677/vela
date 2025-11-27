<template>
  <div class="order-list-page">
    <div class="page-header">
      <h1 class="page-title">我的订单</h1>
      <p class="page-subtitle">查看您的所有订单记录</p>
    </div>

    <div v-if="orderStore.loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="orderStore.orders.length > 0" class="orders-list">
      <VCard
        v-for="order in orderStore.orders"
        :key="order.id"
        class="order-card"
        hoverable
        clickable
        padding="lg"
        @click="goToOrderDetail(order.id)"
      >
        <div class="order-header">
          <div class="order-number">订单号：{{ order.order_number }}</div>
          <VBadge :variant="getStatusVariant(order.status)" size="md">
            {{ getOrderStatusText(order.status) }}
          </VBadge>
        </div>

        <div class="order-info">
          <div class="order-meta">
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              {{ formatDate(order.created_at) }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📦</span>
              {{ order.items_count }} 件商品
            </span>
          </div>
          <div class="order-total">
            <span class="total-label">总计</span>
            <span class="total-amount">{{
              formatPrice(order.total_amount)
            }}</span>
          </div>
        </div>
      </VCard>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h2 class="empty-title">暂无订单</h2>
      <p class="empty-text">您还没有任何订单记录</p>
      <VButton variant="primary" size="lg" @click="$router.push('/products')">
        去选购
      </VButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { formatPrice, formatDate, getOrderStatusText } from "@/utils/format";
import { VButton, VCard, VBadge } from "@/components/ui";

const router = useRouter();
const orderStore = useOrderStore();

onMounted(() => {
  orderStore.fetchOrders();
});

const getStatusVariant = (status) => {
  const statusMap = {
    pending: "warning",
    paid: "info",
    shipped: "info",
    delivered: "success",
    cancelled: "error",
    refunded: "error",
  };
  return statusMap[status] || "default";
};

const goToOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`);
};
</script>

<style scoped>
.order-list-page {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  min-height: 70vh;
}

.page-header {
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) 0;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-card {
  transition: var(--transition-base);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-md);
}

.order-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.meta-icon {
  font-size: var(--font-size-base);
}

.order-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.total-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.total-amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2xl) 0;
}

@media (max-width: 768px) {
  .order-list-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .order-info {
    flex-direction: column;
    align-items: stretch;
  }

  .order-total {
    align-items: flex-start;
  }
}
</style>
