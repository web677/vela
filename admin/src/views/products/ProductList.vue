<template>
  <div class="product-list">
    <a-page-header title="商品管理" sub-title="管理所有商品">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <PlusOutlined /> 新增商品
        </a-button>
      </template>
    </a-page-header>

    <!-- 筛选区域 -->
    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline">
        <a-form-item label="搜索">
          <a-input
            v-model:value="filters.search"
            placeholder="商品名称"
            allow-clear
            @pressEnter="fetchProducts"
          />
        </a-form-item>
        <a-form-item label="分类">
          <a-select
            v-model:value="filters.category"
            placeholder="选择分类"
            style="width: 150px"
            allow-clear
          >
            <a-select-option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchProducts">查询</a-button>
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
        :data-source="products"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <a-image
              :src="record.images?.[0]?.url"
              :width="60"
              :height="60"
              style="object-fit: cover; border-radius: 4px"
            />
          </template>
          <template v-if="column.key === 'price'">
            ¥{{ record.price?.toFixed(2) }}
          </template>
          <template v-if="column.key === 'stock'">
            <a-tag
              :color="
                record.stock > 10
                  ? 'green'
                  : record.stock > 0
                  ? 'orange'
                  : 'red'
              "
            >
              {{ record.stock }}
            </a-tag>
          </template>
          <template v-if="column.key === 'is_active'">
            <a-switch
              :checked="record.is_active"
              @change="handleToggleActive(record)"
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm
                title="确定要删除这个商品吗？"
                @confirm="handleDelete(record)"
              >
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import api from "@/api/client";

const loading = ref(false);
const products = ref([]);
const categories = ref([]);

const filters = reactive({
  search: "",
  category: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: "图片", key: "image", width: 80 },
  { title: "商品名称", dataIndex: "name", key: "name" },
  { title: "价格", dataIndex: "price", key: "price", width: 100 },
  { title: "库存", dataIndex: "stock", key: "stock", width: 80 },
  { title: "销量", dataIndex: "sales_count", key: "sales_count", width: 80 },
  { title: "上架", key: "is_active", width: 80 },
  { title: "操作", key: "action", width: 120 },
];

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await api.get("/admin/products", {
      params: {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        category: filters.category || undefined,
      },
    });
    products.value = response.data.data || [];
    pagination.total = response.data.total || 0;
  } catch (error) {
    message.error("获取商品列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    categories.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch categories");
  }
};

const resetFilters = () => {
  filters.search = "";
  filters.category = undefined;
  pagination.current = 1;
  fetchProducts();
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchProducts();
};

const handleAdd = () => {
  message.info("新增商品功能开发中...");
};

const handleEdit = (record) => {
  message.info(`编辑商品: ${record.name}`);
};

const handleDelete = async (record) => {
  try {
    await api.delete(`/admin/products/${record.id}`);
    message.success("删除成功");
    fetchProducts();
  } catch (error) {
    message.error("删除失败");
  }
};

const handleToggleActive = async (record) => {
  try {
    await api.patch(`/admin/products/${record.id}`, {
      is_active: !record.is_active,
    });
    record.is_active = !record.is_active;
    message.success(record.is_active ? "已上架" : "已下架");
  } catch (error) {
    message.error("操作失败");
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<style scoped>
.product-list {
  padding: 0;
}

.filter-card {
  margin-bottom: 16px;
}
</style>
