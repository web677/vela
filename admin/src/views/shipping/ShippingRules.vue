<template>
  <div class="shipping-rules">
    <a-page-header title="运费管理" sub-title="管理运费规则">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined /> 新增规则
        </a-button>
      </template>
    </a-page-header>

    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="rules"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'provinces'">
            <a-tooltip>
              <template #title>{{ record.provinces?.join("、") }}</template>
              {{ record.provinces?.slice(0, 3).join("、") }}
              <span v-if="record.provinces?.length > 3"
                >等{{ record.provinces.length }}个</span
              >
            </a-tooltip>
          </template>
          <template v-if="column.key === 'base_fee'">
            ¥{{ record.base_fee?.toFixed(2) }}
          </template>
          <template v-if="column.key === 'free_threshold'">
            {{
              record.free_threshold
                ? `满¥${record.free_threshold}包邮`
                : "不包邮"
            }}
          </template>
          <template v-if="column.key === 'is_active'">
            <a-switch
              :checked="record.is_active"
              @change="toggleActive(record)"
            />
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalVisible" title="新增运费规则" @ok="handleAdd">
      <a-form :model="form" layout="vertical">
        <a-form-item label="规则名称">
          <a-input
            v-model:value="form.name"
            placeholder="如：包邮区、偏远地区"
          />
        </a-form-item>
        <a-form-item label="适用省份">
          <a-select
            v-model:value="form.provinces"
            mode="multiple"
            placeholder="选择省份"
          >
            <a-select-option v-for="p in allProvinces" :key="p" :value="p">{{
              p
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="基础运费">
          <a-input-number
            v-model:value="form.base_fee"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="包邮门槛">
          <a-input-number
            v-model:value="form.free_threshold"
            :min="0"
            :precision="2"
            placeholder="不填则不包邮"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import api from "@/api/client";

const loading = ref(true);
const rules = ref([]);
const modalVisible = ref(false);

const form = reactive({
  name: "",
  provinces: [],
  base_fee: 10,
  free_threshold: null,
});

const allProvinces = [
  "北京",
  "上海",
  "天津",
  "重庆",
  "河北",
  "山西",
  "辽宁",
  "吉林",
  "黑龙江",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "海南",
  "四川",
  "贵州",
  "云南",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "广西",
  "西藏",
  "新疆",
  "内蒙古",
  "香港",
  "澳门",
  "台湾",
];

const columns = [
  { title: "规则名称", dataIndex: "name", key: "name" },
  { title: "适用省份", key: "provinces" },
  { title: "基础运费", key: "base_fee" },
  { title: "包邮门槛", key: "free_threshold" },
  { title: "启用", key: "is_active" },
];

const fetchRules = async () => {
  try {
    const response = await api.get("/admin/shipping/rules");
    rules.value = response.data || [];
  } finally {
    loading.value = false;
  }
};

const showAddModal = () => {
  Object.assign(form, {
    name: "",
    provinces: [],
    base_fee: 10,
    free_threshold: null,
  });
  modalVisible.value = true;
};

const handleAdd = async () => {
  try {
    await api.post("/admin/shipping/rules", form);
    message.success("添加成功");
    modalVisible.value = false;
    fetchRules();
  } catch (error) {
    message.error("添加失败");
  }
};

const toggleActive = async (record) => {
  try {
    await api.patch(`/admin/shipping/rules/${record.id}`, {
      is_active: !record.is_active,
    });
    record.is_active = !record.is_active;
  } catch (error) {
    message.error("操作失败");
  }
};

onMounted(fetchRules);
</script>
