<template>
  <div class="order-cancel-page">
    <div class="container">
      <div class="cancel-card">
        <div class="cancel-icon">!</div>
        <h1 class="cancel-title">支付未完成或已取消</h1>
        <p class="cancel-message">如已扣款，请稍后在订单详情中查看支付状态</p>

        <div class="actions">
          <VButton variant="primary" @click="goToOrderDetail">查看订单详情</VButton>
          <VButton variant="secondary" @click="goToCheckout">重新发起支付</VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { VButton } from "@/components/ui";

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId as string;

const goToOrderDetail = () => {
  router.push(`/orders/${orderId}`);
};

const goToCheckout = () => {
  router.push(`/checkout`);
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
