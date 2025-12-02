<template>
  <div class="order-cancel-page">
    <div class="container">
      <div class="cancel-card">
        <div class="cancel-icon">✕</div>
        <h1 class="cancel-title">支付已取消</h1>
        <p class="cancel-message">
          您已取消本次支付，订单仍然保留，您可以稍后继续支付
        </p>

        <div class="order-info" v-if="orderDetails">
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ orderDetails.orderNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单金额:</span>
            <span class="value amount"
              >¥{{ (orderDetails.totalAmount / 100).toFixed(2) }}</span
            >
          </div>
        </div>

        <div class="actions">
          <VButton variant="primary" @click="retryPayment"> 重新支付 </VButton>
          <VButton variant="secondary" @click="goToOrders">
            查看我的订单
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VButton } from "@/components/ui";
import { orderAPI } from "@/api/order";

const route = useRoute();
const router = useRouter();

const orderDetails = ref(null);
const orderId = route.params.orderId;

onMounted(async () => {
  if (orderId) {
    try {
      const { data } = await orderAPI.getOrderDetail(orderId);
      if (data.success) {
        orderDetails.value = data.data;
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
  }
});

const retryPayment = () => {
  // 返回订单详情页重新支付
  router.push(`/orders/${orderId}`);
};

const goToOrders = () => {
  router.push("/orders");
};
</script>

<style scoped>
.order-cancel-page {
  min-height: calc(100vh - 80px);
  padding: var(--spacing-6xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
}

.cancel-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-4xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.cancel-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-xl);
  background: var(--color-warning);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
}

.cancel-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.cancel-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3xl) 0;
  line-height: var(--line-height-relaxed);
}

.order-info {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.value.amount {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.actions {
  display: flex;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .order-cancel-page {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .cancel-card {
    padding: var(--spacing-2xl);
  }

  .actions {
    flex-direction: column;
  }
}
</style>
