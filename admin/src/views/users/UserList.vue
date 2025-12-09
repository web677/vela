<template>
  <div class="user-list">
    <a-page-header title="用户管理" sub-title="管理所有用户" />
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import api from "@/api/client";

const loading = ref(true);
const users = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const columns = [
  { title: "用户名", dataIndex: "full_name", key: "full_name" },
  { title: "手机号", dataIndex: "phone", key: "phone" },
  { title: "邮箱", dataIndex: "email", key: "email" },
  { title: "注册时间", key: "created_at" },
];

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD HH:mm");

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get("/admin/users", {
      params: { page: pagination.current, limit: pagination.pageSize },
    });
    users.value = response.data.data || [];
    pagination.total = response.data.total || 0;
  } catch (error) {
    message.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchUsers();
};

onMounted(fetchUsers);
</script>
