<template>
  <div class="product-detail">
    <a-page-header title="商品详情" @back="() => $router.back()" />
    <a-card :loading="loading">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="商品名称">{{
          product.name
        }}</a-descriptions-item>
        <a-descriptions-item label="价格"
          >¥{{ product.price?.toFixed(2) }}</a-descriptions-item
        >
        <a-descriptions-item label="库存">{{
          product.stock
        }}</a-descriptions-item>
        <a-descriptions-item label="销量">{{
          product.sales_count
        }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{
          product.description || "暂无描述"
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/client";

const route = useRoute();
const loading = ref(true);
const product = ref({});

onMounted(async () => {
  try {
    const response = await api.get(`/admin/products/${route.params.id}`);
    product.value = response.data;
  } finally {
    loading.value = false;
  }
});
</script>
