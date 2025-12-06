<template>
  <div class="order-detail-page">
    <div v-if="orderStore.loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="order" class="order-detail">
      <!-- 订单头部 -->
      <VCard class="order-header" padding="xl">
        <div class="header-content">
          <div>
            <h1 class="page-title">订单详情</h1>
            <p class="order-number">订单号：{{ order.order_number }}</p>
          </div>
          <VBadge :variant="getStatusVariant(order.status)" size="lg">
            {{ getOrderStatusText(order.status) }}
          </VBadge>
        </div>

        <div class="order-summary">
          <div class="summary-item">
            <span class="label">下单时间</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">支付方式</span>
            <span class="value">{{
              getPaymentMethod(order.payment_method)
            }}</span>
          </div>
          <div class="summary-item">
            <span class="label">订单总额</span>
            <span class="amount">{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>

        <div class="header-actions">
          <VButton
            v-if="
              order.status === 'pending' || order.status === 'pending_payment'
            "
            variant="primary"
            @click="handlePayOrder"
          >
            立即支付
          </VButton>
          <VButton
            v-if="order.status === 'pending'"
            variant="secondary"
            @click="cancelOrder"
          >
            取消订单
          </VButton>
        </div>
      </VCard>

      <!-- 订单商品 -->
      <VCard class="order-items" padding="xl">
        <h3 class="section-title">订单商品</h3>
        <div class="items-list">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img
              :src="item.product_snapshot.image || '/placeholder.jpg'"
              :alt="item.product_snapshot.name"
            />
            <div class="item-info">
              <p class="item-name">
                {{ item.product_snapshot.name }}
              </p>
              <p class="item-specs" v-if="item.product_snapshot.specifications">
                {{
                  Object.values(item.product_snapshot.specifications).join(
                    " / "
                  )
                }}
              </p>
              <p class="item-quantity">x{{ item.quantity }}</p>
            </div>
            <div class="item-price">
              <p class="unit-price">
                {{ formatPrice(item.price) }}
              </p>
              <p class="subtotal">
                {{ formatPrice(item.subtotal) }}
              </p>
            </div>
          </div>
        </div>
      </VCard>

      <!-- 收货信息 -->
      <VCard class="shipping-info" padding="xl">
        <h3 class="section-title">收货信息</h3>
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
      </VCard>

      <!-- 物流跟踪 -->
      <VCard
        v-if="order.tracking_number"
        class="logistics-tracking-section"
        padding="xl"
      >
        <h3 class="section-title">物流跟踪</h3>
        <LogisticsTracking :order-id="order.id" />
      </VCard>

      <!-- 备注 -->
      <VCard v-if="order.notes" class="order-notes" padding="xl">
        <h3 class="section-title">订单备注</h3>
        <p class="notes-content">{{ order.notes }}</p>
      </VCard>
    </div>

    <div v-else class="not-found">
      <div class="not-found-icon">🔍</div>
      <h2>订单不存在</h2>
      <p>抱歉，该订单不存在或已被删除</p>
      <VButton variant="primary" @click="$router.push('/orders')">
        返回订单列表
      </VButton>
    </div>

    <!-- 支付弹窗 -->
    <PaymentModal
      ref="paymentModalRef"
      :order="order"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { useNotification } from "@/composables/useNotification";
import { useConfirm } from "@/composables/useConfirm";
import { formatPrice, formatDate, getOrderStatusText } from "@/utils/format";
import { VButton, VCard, VBadge } from "@/components/ui";
import PaymentModal from "@/components/payment/PaymentModal.vue";
import LogisticsTracking from "@/components/order/LogisticsTracking.vue";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const notification = useNotification();
const confirm = useConfirm();

const order = computed(() => orderStore.currentOrder);
const paymentModalRef = ref(null);

onMounted(() => {
  const orderId = route.params.id;
  orderStore.fetchOrder(orderId);
});

const getStatusVariant = (status) => {
  const statusMap = {
    pending: "warning",
    paid: "info",
    pending_shipment: "info",
    shipped: "success",
    delivered: "success",
    cancelled: "error",
    refunded: "error",
  };
  return statusMap[status] || "default";
};

const getPaymentMethod = (method) => {
  const methodMap = {
    alipay: "支付宝",
    wechat: "微信支付",
    bank_card: "银行卡",
  };
  return methodMap[method] || method;
};

const cancelOrder = async () => {
  const confirmed = await confirm.show("确定要取消这个订单吗？");
  if (confirmed) {
    const result = await orderStore.cancelOrder(order.value.id);
    if (result.success) {
      notification.success("订单已取消");
      await orderStore.fetchOrder(order.value.id);
    } else {
      notification.error(result.message || "取消失败");
    }
  }
};

const handlePayOrder = () => {
  paymentModalRef.value?.open();
};

const handlePaymentSuccess = () => {
  router.push(`/orders/${order.value.id}/success`);
};
</script>

<style scoped>
.order-detail-page {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  min-height: 70vh;
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

.order-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.order-number {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.order-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: var(--spacing-lg);
  align-items: start;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.order-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
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
  gap: var(--spacing-xs);
}

.item-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.item-specs {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.item-quantity {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.item-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.unit-price {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.subtotal {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.notes-content {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-lg);
  text-align: center;
  min-height: 50vh;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.5;
}

.not-found h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.not-found p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2xl) 0;
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .order-summary {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-item {
    grid-template-columns: 80px 1fr;
  }

  .item-price {
    grid-column: 1 / -1;
    text-align: left;
    flex-direction: row;
    justify-content: space-between;
    padding-top: var(--spacing-sm);
  }
}
</style>
