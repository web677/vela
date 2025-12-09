<template>
  <div class="order-detail">
    <a-page-header title="订单详情" @back="() => $router.back()" />
    <a-spin :spinning="loading">
      <a-descriptions
        :column="2"
        bordered
        title="基本信息"
        style="margin-bottom: 24px"
      >
        <a-descriptions-item label="订单号">{{
          order.order_number
        }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(order.status)">{{
            getStatusText(order.status)
          }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单金额"
          >¥{{ order.total_amount?.toFixed(2) }}</a-descriptions-item
        >
        <a-descriptions-item label="创建时间">{{
          order.created_at
        }}</a-descriptions-item>
        <a-descriptions-item label="物流单号">{{
          order.tracking_number || "暂无"
        }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{
          order.notes || "无"
        }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        :column="1"
        bordered
        title="收货信息"
        style="margin-bottom: 24px"
      >
        <a-descriptions-item label="收货人">{{
          order.shipping_address?.name
        }}</a-descriptions-item>
        <a-descriptions-item label="电话">{{
          order.shipping_address?.phone
        }}</a-descriptions-item>
        <a-descriptions-item label="地址">
          {{ order.shipping_address?.province }}
          {{ order.shipping_address?.city }}
          {{ order.shipping_address?.district }}
          {{ order.shipping_address?.address }}
        </a-descriptions-item>
      </a-descriptions>

      <a-card title="商品信息">
        <a-table
          :columns="itemColumns"
          :data-source="order.items"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'subtotal'"
              >¥{{ record.subtotal?.toFixed(2) }}</template
            >
          </template>
        </a-table>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/client";

const route = useRoute();
const loading = ref(true);
const order = ref({});

const itemColumns = [
  { title: "商品名称", dataIndex: ["product_snapshot", "name"], key: "name" },
  { title: "单价", dataIndex: "price", key: "price" },
  { title: "数量", dataIndex: "quantity", key: "quantity" },
  { title: "小计", key: "subtotal" },
];

const getStatusColor = (status) => {
  const colors = {
    pending: "orange",
    paid: "blue",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };
  return colors[status] || "default";
};

const getStatusText = (status) => {
  const texts = {
    pending: "待支付",
    paid: "已支付",
    shipped: "已发货",
    delivered: "已签收",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

onMounted(async () => {
  try {
    const response = await api.get(`/admin/orders/${route.params.id}`);
    order.value = response.data;
  } finally {
    loading.value = false;
  }
});
</script>
