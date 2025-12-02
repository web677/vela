<template>
  <div class="order-success-page">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h1 class="success-title">支付成功！</h1>
        <p class="success-message">
          您的订单已成功支付，我们将尽快为您安排发货
        </p>

        <div class="order-info" v-if="orderDetails">
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ orderDetails.orderNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">支付金额:</span>
            <span class="value amount"
              >¥{{ (orderDetails.totalAmount / 100).toFixed(2) }}</span
            >
          </div>
          <div class="info-row">
            <span class="label">支付时间:</span>
            <span class="value">{{ formatDate(orderDetails.paidAt) }}</span>
          </div>
        </div>

        <div class="actions">
          <VButton variant="primary" @click="goToOrderDetail">
            查看订单详情
          </VButton>
          <VButton variant="secondary" @click="goToHome"> 返回首页 </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VButton } from "@/components/ui";
import { paymentAPI } from "@/api/payment";

const route = useRoute();
const router = useRouter();

const orderDetails = ref(null);
const orderId = route.params.orderId;

onMounted(async () => {
  // 验证支付状态
  if (orderId) {
    try {
      const { data } = await paymentAPI.verifyPayment(orderId);
      if (data.success) {
        orderDetails.value = data.data;
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

const goToOrderDetail = () => {
  router.push(`/orders/${orderId}`);
};

const goToHome = () => {
  router.push("/");
};
</script>

<style scoped>
.order-success-page {
  min-height: calc(100vh - 80px);
  padding: var(--spacing-6xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
}

.success-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-4xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-xl);
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
}

.success-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.success-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3xl) 0;
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
  .order-success-page {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .success-card {
    padding: var(--spacing-2xl);
  }

  .actions {
    flex-direction: column;
  }
}
</style>
