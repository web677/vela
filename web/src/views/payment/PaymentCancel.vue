<template>
  <div class="payment-result-page">
    <div class="container">
      <!-- 支付回跳页面，也需要检查状态（iOS 可能会跳转到这里） -->
      <div v-if="loading" class="loading-card">
        <div class="spinner"></div>
        <h2>正在验证支付结果...</h2>
        <p>请稍候，不要关闭页面</p>
      </div>

      <div v-else-if="paymentStatus === 'success'" class="success-card">
        <div class="success-icon">✓</div>
        <h1>支付成功！</h1>
        <p>您的支付已完成</p>
        <div class="actions">
          <VButton variant="primary" @click="goToOrderDetail">查看订单</VButton>
          <VButton variant="secondary" @click="goToHome">返回首页</VButton>
        </div>
      </div>

      <div v-else class="cancel-card">
        <div class="cancel-icon">✕</div>
        <h1>支付未完成</h1>
        <p>{{ errorMessage || "您已取消支付或支付未完成" }}</p>
        <div class="actions">
          <VButton variant="primary" @click="retryPayment">重新支付</VButton>
          <VButton variant="secondary" @click="goToOrders">查看订单</VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { paymentAPI } from "@/api/payment";
import { VButton } from "@/components/ui";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const paymentStatus = ref("cancel");
const orderDetails = ref(null);
const errorMessage = ref("");
const orderNumber = route.query.order;

let pollTimer = null;

// iOS 设备可能会在支付成功后也跳转到 cancel_url，所以也需要查询状态
const checkPaymentStatus = async () => {
  let attempts = 0;
  const maxAttempts = 10;

  const poll = async () => {
    try {
      const { data } = await paymentAPI.verifyPaymentByOrderNumber(orderNumber);

      if (data.success) {
        const { order_status, payment_status } = data.data;
        orderDetails.value = data.data;

        if (order_status === "paid" || payment_status === "succeeded") {
          paymentStatus.value = "success";
          loading.value = false;
          return;
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        pollTimer = setTimeout(poll, 2000);
      } else {
        paymentStatus.value = "cancel";
        errorMessage.value = "支付未完成或已取消";
        loading.value = false;
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
      paymentStatus.value = "cancel";
      loading.value = false;
    }
  };

  poll();
};

onMounted(() => {
  if (!orderNumber) {
    router.push("/orders");
    return;
  }
  checkPaymentStatus();
});

onUnmounted(() => {
  if (pollTimer) {
    clearTimeout(pollTimer);
  }
});

const goToOrderDetail = () => {
  if (orderDetails.value?.order_id) {
    router.push(`/orders/${orderDetails.value.order_id}`);
  }
};

const goToHome = () => router.push("/");
const goToOrders = () => router.push("/orders");

const retryPayment = () => {
  if (orderDetails.value?.order_id) {
    router.push(`/orders/${orderDetails.value.order_id}`);
  } else {
    router.push("/orders");
  }
};
</script>

<style scoped>
.payment-result-page {
  min-height: calc(100vh - 80px);
  padding: var(--spacing-6xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
}

.loading-card,
.success-card,
.cancel-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-4xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-xl);
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.cancel-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-xl);
  background: var(--color-error);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
}

h1 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

h2 {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2xl) 0;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .payment-result-page {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .loading-card,
  .success-card,
  .cancel-card {
    padding: var(--spacing-2xl);
  }

  .actions {
    flex-direction: column;
  }
}
</style>
