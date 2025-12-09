<template>
  <div class="order-list">
    <a-page-header title="订单管理" sub-title="管理所有订单" />

    <!-- 筛选区域 -->
    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline">
        <a-form-item label="订单号">
          <a-input
            v-model:value="filters.orderNumber"
            placeholder="订单号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending">待支付</a-select-option>
            <a-select-option value="paid">已支付</a-select-option>
            <a-select-option value="pending_shipment">待发货</a-select-option>
            <a-select-option value="shipped">已发货</a-select-option>
            <a-select-option value="delivered">已签收</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchOrders">查询</a-button>
          <a-button @click="resetFilters" style="margin-left: 8px"
            >重置</a-button
          >
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="orders"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'total_amount'">
            ¥{{ record.total_amount?.toFixed(2) }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <router-link :to="`/orders/${record.id}`">查看</router-link>
              <a v-if="record.status === 'paid'" @click="handleShip(record)"
                >发货</a
              >
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 发货弹窗 -->
    <a-modal
      v-model:open="shipModalVisible"
      title="填写物流信息"
      @ok="confirmShip"
      :confirm-loading="shipLoading"
    >
      <a-form :model="shipForm" layout="vertical">
        <a-form-item label="物流单号" required>
          <a-input
            v-model:value="shipForm.trackingNumber"
            placeholder="请输入物流单号"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import api from "@/api/client";

const loading = ref(false);
const orders = ref([]);
const shipModalVisible = ref(false);
const shipLoading = ref(false);
const currentOrder = ref(null);

const filters = reactive({
  orderNumber: "",
  status: undefined,
});

const shipForm = reactive({
  trackingNumber: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: "订单号", dataIndex: "order_number", key: "order_number" },
  { title: "金额", dataIndex: "total_amount", key: "total_amount", width: 100 },
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  { title: "创建时间", dataIndex: "created_at", key: "created_at", width: 180 },
  { title: "操作", key: "action", width: 150 },
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

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD HH:mm");

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await api.get("/admin/orders", {
      params: {
        page: pagination.current,
        limit: pagination.pageSize,
        order_number: filters.orderNumber || undefined,
        status: filters.status || undefined,
      },
    });
    orders.value = response.data.data || [];
    pagination.total = response.data.total || 0;
  } catch (error) {
    message.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.orderNumber = "";
  filters.status = undefined;
  pagination.current = 1;
  fetchOrders();
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchOrders();
};

const handleShip = (order) => {
  currentOrder.value = order;
  shipForm.trackingNumber = "";
  shipModalVisible.value = true;
};

const confirmShip = async () => {
  if (!shipForm.trackingNumber.trim()) {
    message.warning("请填写物流单号");
    return;
  }

  shipLoading.value = true;
  try {
    await api.patch(`/admin/orders/${currentOrder.value.id}/shipping`, {
      tracking_number: shipForm.trackingNumber,
    });
    message.success("发货成功");
    shipModalVisible.value = false;
    fetchOrders();
  } catch (error) {
    message.error("发货失败");
  } finally {
    shipLoading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.order-list {
  padding: 0;
}
.filter-card {
  margin-bottom: 16px;
}
</style>
