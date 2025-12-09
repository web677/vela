<template>
  <div class="dashboard">
    <a-page-header title="仪表盘" sub-title="数据概览" />

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日订单"
            :value="stats.todayOrders"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ShoppingCartOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日销售额"
            :value="stats.todaySales"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="待发货"
            :value="stats.pendingShipment"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <SendOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="商品总数"
            :value="stats.totalProducts"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <AppstoreOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="content-row">
      <!-- 最近订单 -->
      <a-col :span="16">
        <a-card title="最近订单" :bordered="false">
          <a-table
            :columns="orderColumns"
            :data-source="recentOrders"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'total_amount'">
                ¥{{ record.total_amount?.toFixed(2) }}
              </template>
              <template v-if="column.key === 'action'">
                <router-link :to="`/orders/${record.id}`">查看</router-link>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 热销商品 -->
      <a-col :span="8">
        <a-card title="热销商品 Top 5" :bordered="false">
          <a-list :data-source="topProducts" size="small">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-badge
                      :count="index + 1"
                      :number-style="{ backgroundColor: getBadgeColor(index) }"
                    />
                  </template>
                  <template #title>{{ item.name }}</template>
                  <template #description>销量: {{ item.sales_count }}</template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  ShoppingCartOutlined,
  SendOutlined,
  AppstoreOutlined,
} from "@ant-design/icons-vue";
import api from "@/api/client";

const stats = ref({
  todayOrders: 0,
  todaySales: 0,
  pendingShipment: 0,
  totalProducts: 0,
});

const recentOrders = ref([]);
const topProducts = ref([]);

const orderColumns = [
  { title: "订单号", dataIndex: "order_number", key: "order_number" },
  { title: "金额", dataIndex: "total_amount", key: "total_amount" },
  { title: "状态", dataIndex: "status", key: "status" },
  { title: "创建时间", dataIndex: "created_at", key: "created_at" },
  { title: "操作", key: "action" },
];

const getStatusColor = (status) => {
  const colors = {
    pending: "orange",
    paid: "blue",
    pending_shipment: "cyan",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
    refunded: "gray",
  };
  return colors[status] || "default";
};

const getStatusText = (status) => {
  const texts = {
    pending: "待支付",
    paid: "已支付",
    pending_shipment: "待发货",
    shipped: "已发货",
    delivered: "已签收",
    cancelled: "已取消",
    refunded: "已退款",
  };
  return texts[status] || status;
};

const getBadgeColor = (index) => {
  const colors = ["#f5222d", "#fa541c", "#faad14", "#52c41a", "#1890ff"];
  return colors[index] || "#999";
};

onMounted(async () => {
  try {
    // 获取统计数据
    const [statsRes, ordersRes, productsRes] = await Promise.all([
      api.get("/admin/statistics/overview"),
      api.get("/admin/orders", { params: { limit: 5 } }),
      api.get("/admin/products", {
        params: { sort: "sales_count", order: "desc", limit: 5 },
      }),
    ]);

    stats.value = statsRes.data;
    recentOrders.value = ordersRes.data.data || [];
    topProducts.value = productsRes.data.data || [];
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
});
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.content-row {
  margin-top: 24px;
}

:deep(.ant-card) {
  border-radius: 8px;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}
</style>
