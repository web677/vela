<template>
  <div class="statistics">
    <a-page-header title="数据统计" sub-title="销售数据分析" />

    <a-row :gutter="16">
      <a-col :span="24">
        <a-card title="销售趋势" :bordered="false">
          <div ref="salesChartRef" style="height: 400px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="分类销售占比" :bordered="false">
          <div ref="categoryChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="热销商品 Top 10" :bordered="false">
          <div ref="productChartRef" style="height: 300px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

const salesChartRef = ref(null);
const categoryChartRef = ref(null);
const productChartRef = ref(null);

let salesChart, categoryChart, productChart;

onMounted(() => {
  // 销售趋势图
  salesChart = echarts.init(salesChartRef.value);
  salesChart.setOption({
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value" },
    series: [
      { data: [120, 200, 150, 80, 70, 110, 130], type: "line", smooth: true },
    ],
    tooltip: { trigger: "axis" },
  });

  // 分类占比图
  categoryChart = echarts.init(categoryChartRef.value);
  categoryChart.setOption({
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 1048, name: "润滑护理" },
          { value: 735, name: "情侣互动" },
          { value: 580, name: "独享乐趣" },
        ],
      },
    ],
  });

  // 热销商品图
  productChart = echarts.init(productChartRef.value);
  productChart.setOption({
    xAxis: { type: "value" },
    yAxis: {
      type: "category",
      data: ["商品1", "商品2", "商品3", "商品4", "商品5"],
    },
    series: [{ type: "bar", data: [120, 98, 85, 72, 65] }],
    tooltip: { trigger: "axis" },
  });

  window.addEventListener("resize", handleResize);
});

const handleResize = () => {
  salesChart?.resize();
  categoryChart?.resize();
  productChart?.resize();
};

onUnmounted(() => {
  salesChart?.dispose();
  categoryChart?.dispose();
  productChart?.dispose();
  window.removeEventListener("resize", handleResize);
});
</script>
