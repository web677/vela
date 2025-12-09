<template>
  <div class="category-list">
    <a-page-header title="分类管理" sub-title="管理商品分类" />
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="categories"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'target_gender'">
            <a-tag
              :color="
                record.target_gender === 'male'
                  ? 'blue'
                  : record.target_gender === 'female'
                  ? 'pink'
                  : 'default'
              "
            >
              {{
                record.target_gender === "male"
                  ? "男士"
                  : record.target_gender === "female"
                  ? "女士"
                  : "通用"
              }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/client";

const loading = ref(true);
const categories = ref([]);
const columns = [
  { title: "名称", dataIndex: "name", key: "name" },
  { title: "别名", dataIndex: "slug", key: "slug" },
  { title: "适用性别", key: "target_gender" },
  { title: "排序", dataIndex: "sort_order", key: "sort_order" },
];

onMounted(async () => {
  try {
    const response = await api.get("/categories");
    categories.value = response.data || [];
  } finally {
    loading.value = false;
  }
});
</script>
