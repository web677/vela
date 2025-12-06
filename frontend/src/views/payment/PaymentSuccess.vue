<template>
  <div class="payment-result-page">
    <div class="container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-card">
        <div class="spinner"></div>
        <h2>正在验证支付结果...</h2>
        <p>请稍候，不要关闭页面</p>
      </div>

      <!-- 支付成功 -->
      <div v-else-if="paymentStatus === 'success'" class="success-card">
        <div class="success-icon">✓</div>
        <h1>支付成功！</h1>
        <p class="success-message">
          您的订单已成功支付，我们将尽快为您安排发货
        </p>

        <div class="order-info" v-if="orderDetails">
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ orderDetails.order_number }}</span>
          </div>
          <div class="info-row">
            <span class="label">支付金额:</span>
            <span class="value amount"
              >¥{{ orderDetails.total_amount.toFixed(2) }}</span
            >
          </div>
          <div class="info-row" v-if="orderDetails.paid_at">
            <span class="label">支付时间:</span>
            <span class="value">{{ formatDate(orderDetails.paid_at) }}</span>
          </div>
        </div>

        <div class="actions">
          <VButton variant="primary" @click="goToOrderDetail">查看订单</VButton>
          <VButton variant="secondary" @click="goToHome">返回首页</VButton>
        </div>
      </div>

      <!-- 支付失败/未完成 -->
      <div v-else class="pending-card">
        <div class="pending-icon">⏳</div>
        <h1>支付未完成</h1>
        <p>{{ errorMessage || "支付尚未完成或已取消" }}</p>
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
const paymentStatus = ref("pending");
const orderDetails = ref(null);
const errorMessage = ref("");
const orderNumber = route.query.order;

let pollTimer = null;

// 轮询检查支付状态
const pollPaymentStatus = async () => {
  let attempts = 0;
  const maxAttempts = 15; // 最多轮询 15 次 (30 秒)

  const poll = async () => {
    try {
      const { data } = await paymentAPI.verifyPaymentByOrderNumber(orderNumber);

      if (data.success) {
        const { order_status, payment_status } = data.data;

        // 支付已成功
        if (order_status === "paid" || payment_status === "succeeded") {
          paymentStatus.value = "success";
          orderDetails.value = data.data;
          loading.value = false;
          return;
        }

        // 支付失败
        if (payment_status === "failed") {
          paymentStatus.value = "failed";
          errorMessage.value = "支付失败，请重试";
          loading.value = false;
          return;
        }
      }

      // 继续轮询
      attempts++;
      if (attempts < maxAttempts) {
        pollTimer = setTimeout(poll, 2000); // 2 秒后再次查询
      } else {
        // 超时
        paymentStatus.value = "timeout";
        errorMessage.value = "支付结果查询超时，请稍后在订单列表中查看";
        loading.value = false;
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
      attempts++;
      if (attempts < maxAttempts) {
        pollTimer = setTimeout(poll, 2000);
      } else {
        paymentStatus.value = "error";
        errorMessage.value = "查询支付状态失败";
        loading.value = false;
      }
    }
  };

  poll();
};

onMounted(() => {
  if (!orderNumber) {
    router.push("/orders");
    return;
  }
  pollPaymentStatus();
});

onUnmounted(() => {
  if (pollTimer) {
    clearTimeout(pollTimer);
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

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
.pending-card {
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

.pending-icon {
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
  .payment-result-page {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .loading-card,
  .success-card,
  .pending-card {
    padding: var(--spacing-2xl);
  }

  .actions {
    flex-direction: column;
  }
}
</style>
