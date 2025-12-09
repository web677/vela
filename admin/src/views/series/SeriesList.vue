<template>
  <div class="series-list">
    <a-page-header title="系列管理" sub-title="管理产品系列" />
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="seriesList"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'theme_color'">
            <div
              :style="{
                width: '24px',
                height: '24px',
                backgroundColor: record.theme_color,
                borderRadius: '4px',
              }"
            />
          </template>
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
const seriesList = ref([]);
const columns = [
  { title: "名称", dataIndex: "name", key: "name" },
  { title: "英文名", dataIndex: "name_en", key: "name_en" },
  { title: "主题色", key: "theme_color" },
  { title: "适用性别", key: "target_gender" },
  { title: "排序", dataIndex: "sort_order", key: "sort_order" },
];

onMounted(async () => {
  try {
    const response = await api.get("/series");
    seriesList.value = response.data || [];
  } finally {
    loading.value = false;
  }
});
</script>
