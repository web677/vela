<template>
  <VModal v-model="visible" title="选择支付方式" :width="500">
    <div class="payment-modal">
      <div class="order-info">
        <h3 class="order-title">订单信息</h3>
        <div class="order-details">
          <div class="detail-row">
            <span class="label">订单号:</span>
            <span class="value">{{ order.order_number || order.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单金额:</span>
            <span class="value amount"
              >¥{{ order.total_amount?.toFixed(2) || "0.00" }}</span
            >
          </div>
        </div>
      </div>

      <div class="payment-methods">
        <h3 class="section-title">支付方式</h3>
        <div
          v-for="method in paymentMethods"
          :key="method.channel"
          class="payment-method"
          :class="{ active: selectedMethod === method.channel }"
          @click="selectedMethod = method.channel"
        >
          <div class="method-icon">{{ method.icon }}</div>
          <div class="method-info">
            <div class="method-name">{{ method.name }}</div>
            <div class="method-desc">{{ method.description }}</div>
          </div>
          <div class="method-radio">
            <span v-if="selectedMethod === method.channel" class="checkmark"
              >✓</span
            >
          </div>
        </div>
      </div>

      <div class="payment-actions">
        <VButton
          variant="secondary"
          @click="visible = false"
          :disabled="loading"
        >
          取消
        </VButton>
        <VButton
          variant="primary"
          @click="handlePay"
          :loading="loading"
          :disabled="!selectedMethod"
        >
          立即支付 ¥{{ order.total_amount?.toFixed(2) || "0.00" }}
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { VButton, VModal } from "@/components/ui";
import { paymentAPI } from "@/api/payment";
import { useNotification } from "@/composables/useNotification";
import pingpp from "pingpp-js";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["success", "cancel"]);

const router = useRouter();
const notification = useNotification();

const visible = ref(false);
const loading = ref(false);
const selectedMethod = ref("alipay_wap");

// 支付方式配置
const paymentMethods = ref([
  {
    channel: "alipay_wap",
    name: "支付宝",
    description: "推荐使用支付宝支付",
    icon: "💳",
  },
  {
    channel: "wx_wap",
    name: "微信支付",
    description: "使用微信支付",
    icon: "💚",
  },
]);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const handlePay = async () => {
  if (!selectedMethod.value) {
    notification.warning("请选择支付方式");
    return;
  }

  loading.value = true;

  try {
    // 1. 调用后端创建支付订单
    const { data } = await paymentAPI.createCharge({
      orderId: props.order.id,
      channel: selectedMethod.value,
    });

    if (!data.success) {
      throw new Error(data.message || "创建支付失败");
    }

    const charge = data.data.charge;

    // 2. 调用Ping++ SDK发起支付
    pingpp.createPayment(charge, (result, err) => {
      if (result === "success") {
        // 支付成功
        handlePaymentSuccess();
      } else if (result === "fail") {
        // 支付失败
        notification.error(err.msg || "支付失败，请重试");
        loading.value = false;
      } else if (result === "cancel") {
        // 用户取消支付
        notification.warning("支付已取消");
        loading.value = false;
        emit("cancel");
      }
    });

    // 对于跳转类支付，关闭弹窗
    if (
      selectedMethod.value === "alipay_wap" ||
      selectedMethod.value === "alipay_pc_direct"
    ) {
      visible.value = false;
      loading.value = false;
      notification.info("支付窗口已打开，支付完成后请返回订单列表查看");
    }
  } catch (error) {
    console.error("Payment error:", error);

    let errorMessage = "支付失败，请稍后重试";

    if (error.response?.status === 401) {
      errorMessage = "请先登录后再进行支付";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    notification.error(errorMessage);
    loading.value = false;
  }
};

const handlePaymentSuccess = () => {
  notification.success("支付成功！");
  visible.value = false;
  loading.value = false;
  emit("success");
  router.push(`/orders/${props.order.id}/success`);
};

defineExpose({ open, close });
</script>

<style scoped>
.payment-modal {
  padding: var(--spacing-md);
}

.order-info {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.order-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.value.amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.payment-methods {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.payment-method {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.payment-method:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
}

.payment-method.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.method-icon {
  font-size: var(--font-size-3xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-md);
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.method-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.method-radio {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.payment-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .payment-modal {
    padding: var(--spacing-sm);
  }

  .payment-actions {
    flex-direction: column-reverse;
  }

  .payment-actions button {
    width: 100%;
  }
}
</style>
