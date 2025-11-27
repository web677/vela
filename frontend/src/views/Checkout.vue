<template>
  <div class="checkout-page">
    <div class="page-header">
      <h1 class="page-title">结算</h1>
      <p class="page-subtitle">请填写订单信息</p>
    </div>

    <div class="checkout-content">
      <form @submit.prevent="submitOrder" class="checkout-form">
        <!-- 收货地址 -->
        <VCard class="form-section" padding="xl">
          <div class="section-header-row">
            <h3 class="section-title">收货地址</h3>
            <div class="privacy-badge">
              <span class="privacy-icon">🔒</span>
              <span class="privacy-text">严格保密发货，保护您的隐私</span>
            </div>
          </div>

          <div class="form-grid">
            <VInput
              v-model="form.shipping_address.name"
              label="收货人"
              placeholder="请输入收货人姓名"
              required
            />

            <VInput
              v-model="form.shipping_address.phone"
              label="联系电话"
              type="tel"
              placeholder="请输入手机号"
              required
            />

            <!-- 省市区选择 -->
            <VSelect
              v-model="form.shipping_address.province"
              :options="provinceOptions"
              label="省份"
              placeholder="请选择省份"
              required
              @change="handleProvinceChange"
            />

            <VSelect
              v-model="form.shipping_address.city"
              :options="cityOptions"
              label="城市"
              placeholder="请选择城市"
              required
              :disabled="!form.shipping_address.province"
              @change="handleCityChange"
            />

            <VSelect
              v-model="form.shipping_address.district"
              :options="districtOptions"
              label="区县"
              placeholder="请选择区县"
              required
              :disabled="!form.shipping_address.city"
            />

            <VInput
              v-model="form.shipping_address.zipcode"
              label="邮编"
              placeholder="选填"
            />

            <div class="form-group-full">
              <VInput
                v-model="form.shipping_address.address"
                label="详细地址"
                placeholder="请输入详细地址（街道、小区、楼栋号等）"
                required
              />
            </div>
          </div>
        </VCard>

        <!-- 支付方式 -->
        <VCard class="form-section" padding="xl">
          <h3 class="section-title">支付方式</h3>

          <div class="payment-options">
            <label class="payment-option">
              <input
                v-model="form.payment_method"
                type="radio"
                value="alipay"
              />
              <span class="payment-label">
                <span class="payment-icon">💳</span>
                <span>支付宝</span>
              </span>
            </label>
            <label class="payment-option">
              <input
                v-model="form.payment_method"
                type="radio"
                value="wechat"
              />
              <span class="payment-label">
                <span class="payment-icon">💚</span>
                <span>微信支付</span>
              </span>
            </label>
          </div>
        </VCard>

        <!-- 订单备注 -->
        <VCard class="form-section" padding="xl">
          <h3 class="section-title">订单备注</h3>
          <textarea
            v-model="form.notes"
            class="order-notes"
            rows="3"
            placeholder="选填：给卖家留言..."
          ></textarea>
        </VCard>
      </form>

      <!-- 订单摘要 -->
      <div class="order-sidebar">
        <VCard class="order-summary" padding="xl">
          <h3 class="summary-title">订单信息</h3>

          <div class="summary-items">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="summary-item"
            >
              <img
                :src="item.product.images[0]?.url || '/placeholder.jpg'"
                :alt="item.product.name"
              />
              <div class="item-info">
                <p class="item-name">{{ item.product.name }}</p>
                <p class="item-qty">x{{ item.quantity }}</p>
              </div>
              <span class="item-price">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span>应付总额</span>
            <span class="total-amount">{{
              formatPrice(cartStore.totalAmount)
            }}</span>
          </div>

          <VButton
            variant="primary"
            size="lg"
            block
            :loading="submitting"
            @click="submitOrder"
          >
            {{ submitting ? "提交中..." : "提交订单" }}
          </VButton>
        </VCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";
import { useNotification } from "@/composables/useNotification";
import { validateOrderForm } from "@/utils/formValidation";
import { formatPrice } from "@/utils/format";
import { VButton, VCard, VInput, VSelect } from "@/components/ui";
import { chinaAreaData } from "@/utils/china-area-data";

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const userStore = useUserStore();
const notification = useNotification();

const submitting = ref(false);

const form = ref({
  shipping_address: {
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    address: "",
    zipcode: "",
  },
  // contact_info 将在提交时自动填充
  payment_method: "alipay",
  notes: "",
});

// 省市区数据处理
const provinceOptions = computed(() => {
  return chinaAreaData.map((p) => ({ label: p.label, value: p.value }));
});

const cityOptions = computed(() => {
  const province = chinaAreaData.find(
    (p) => p.value === form.value.shipping_address.province
  );
  if (!province) return [];
  return province.children.map((c) => ({ label: c.label, value: c.value }));
});

const districtOptions = computed(() => {
  const province = chinaAreaData.find(
    (p) => p.value === form.value.shipping_address.province
  );
  if (!province) return [];
  const city = province.children.find(
    (c) => c.value === form.value.shipping_address.city
  );
  if (!city) return [];
  return city.children.map((d) => ({ label: d.label, value: d.value }));
});

const handleProvinceChange = () => {
  form.value.shipping_address.city = "";
  form.value.shipping_address.district = "";
};

const handleCityChange = () => {
  form.value.shipping_address.district = "";
};

onMounted(() => {
  cartStore.fetchCart();

  // 预填用户信息
  if (userStore.user) {
    form.value.shipping_address.name = userStore.user.full_name || "";
    // 处理手机号，移除 +86 前缀
    let phone = userStore.user.phone || "";
    if (phone.startsWith("+86")) {
      phone = phone.replace("+86", "");
    }
    // 移除其他非数字字符
    phone = phone.replace(/\D/g, "");
    form.value.shipping_address.phone = phone;
  }
});

const submitOrder = async () => {
  // 验证购物车
  if (cartStore.items.length === 0) {
    notification.warning("购物车是空的");
    router.push("/cart");
    return;
  }

  // 自动填充联系信息
  const contactInfo = {
    name: form.value.shipping_address.name,
    phone: form.value.shipping_address.phone,
    email: userStore.user?.email || "guest@example.com", // 确保有值
  };

  // 验证表单
  // 注意：validateOrderForm 可能需要 contact_info，我们需要临时构造一个完整的对象进行验证
  const formToValidate = {
    ...form.value,
    contact_info: contactInfo,
  };

  const validation = validateOrderForm(formToValidate, cartStore.items);

  if (!validation.valid) {
    notification.error(validation.errors[0]);
    return;
  }

  submitting.value = true;

  // 构建订单数据
  const orderData = {
    items: cartStore.items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
    ...form.value,
    contact_info: contactInfo, // 显式添加联系信息
  };

  const result = await orderStore.createOrder(orderData);
  submitting.value = false;

  if (result.success) {
    notification.success("订单创建成功！");
    // 订单创建成功后，清空本地购物车状态
    // 后端已经清空了数据库中的购物车，这里只需同步前端状态
    await cartStore.fetchCart();
    router.push(`/orders/${result.data.id}`);
  } else {
    notification.error(result.message || "订单创建失败");
  }
};
</script>

<style scoped>
.checkout-page {
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

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.privacy-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 12px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.privacy-icon {
  font-size: 14px;
}

.privacy-text {
  font-weight: var(--font-weight-medium);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.form-group-full {
  grid-column: 1 / -1;
}

/* 支付方式 */
.payment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.payment-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

.payment-option:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-subtle);
}

.payment-option input[type="radio"] {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.payment-option input[type="radio"]:checked + .payment-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.payment-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: var(--transition-base);
}

.payment-icon {
  font-size: var(--font-size-xl);
}

/* 订单备注 */
.order-notes {
  width: 100%;
  padding: var(--spacing-md);
  font-family: var(--font-family-base);
  font-size: var(--input-font-size);
  color: var(--color-text-primary);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  resize: vertical;
  transition: var(--transition-base);
  outline: none;
}

.order-notes::placeholder {
  color: var(--color-text-muted);
}

.order-notes:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

/* 订单摘要 */
.order-sidebar {
  position: sticky;
  top: 100px;
}

.summary-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: var(--spacing-lg);
}

.summary-items::-webkit-scrollbar {
  width: 6px;
}

.summary-items::-webkit-scrollbar-thumb {
  background: var(--color-border-default);
  border-radius: var(--radius-xs);
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: var(--spacing-md);
  align-items: center;
}

.summary-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.item-price {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.summary-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--spacing-md) 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xl);
}

.total-amount {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* 移动端 */
@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .payment-options {
    grid-template-columns: 1fr;
  }
}
</style>
