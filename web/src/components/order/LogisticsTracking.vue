<template>
  <div class="logistics-tracking">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在查询物流信息...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">📦</div>
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-else-if="logistics" class="logistics-content">
      <!-- 物流信息头部 -->
      <div class="logistics-header">
        <div class="tracking-info">
          <span class="label">物流单号</span>
          <span class="tracking-number">{{ logistics.trackingNumber }}</span>
        </div>
        <div class="company-info">
          <span class="label">物流公司</span>
          <span class="company-name">{{ logistics.company }}</span>
        </div>
        <div class="status-info">
          <span class="label">物流状态</span>
          <span class="status-badge" :class="getStatusClass(logistics.status)">
            {{ logistics.statusText }}
          </span>
        </div>
      </div>

      <!-- 物流轨迹时间线 -->
      <div v-if="logistics.list && logistics.list.length > 0" class="timeline">
        <div
          v-for="(item, index) in logistics.list"
          :key="index"
          class="timeline-item"
          :class="{ active: index === 0 }"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <p class="timeline-time">{{ item.time }}</p>
            <p class="timeline-desc">{{ item.status }}</p>
          </div>
        </div>
      </div>

      <div v-else class="no-tracking">
        <p>暂无物流轨迹信息</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <p>该订单暂无物流信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { orderAPI } from "@/api/order";

const props = defineProps({
  orderId: {
    type: String,
    required: true,
  },
});

const loading = ref(false);
const error = ref("");
const logistics = ref(null);

const fetchLogistics = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await orderAPI.getOrderLogistics(props.orderId);

    if (response.data.success) {
      logistics.value = response.data.data;
    } else {
      error.value = response.data.message || "暂无物流信息";
    }
  } catch (err) {
    console.error("获取物流信息失败:", err);
    error.value = err.response?.data?.message || "获取物流信息失败，请稍后重试";
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (status) => {
  const statusMap = {
    0: "status-pending",
    1: "status-collected",
    2: "status-transit",
    3: "status-delivered",
    4: "status-problem",
  };
  return statusMap[status] || "status-default";
};

onMounted(() => {
  fetchLogistics();
});
</script>

<style scoped>
.logistics-tracking {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.error-message {
  color: var(--color-error);
  margin: 0;
}

.empty-state p {
  color: var(--color-text-muted);
  margin: 0;
}

.logistics-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.logistics-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.tracking-info,
.company-info,
.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.tracking-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono, "Courier New", monospace);
}

.company-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  width: fit-content;
}

.status-pending {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-collected {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-transit {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-delivered {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-problem {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.timeline {
  position: relative;
  padding-left: var(--spacing-xl);
}

.timeline::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: var(--color-border-light);
}

.timeline-item {
  position: relative;
  padding-bottom: var(--spacing-lg);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -31px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-light);
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  width: 16px;
  height: 16px;
  left: -33px;
  top: 4px;
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
}

.timeline-content {
  padding-left: var(--spacing-md);
}

.timeline-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--spacing-xs) 0;
}

.timeline-item.active .timeline-time {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.timeline-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.timeline-item.active .timeline-desc {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.no-tracking {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}

.no-tracking p {
  margin: 0;
}

@media (max-width: 768px) {
  .logistics-header {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .timeline {
    padding-left: var(--spacing-lg);
  }

  .timeline-dot {
    left: -25px;
  }

  .timeline-item.active .timeline-dot {
    left: -27px;
  }
}
</style>
