<template>
  <a-layout class="admin-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :trigger="null"
      theme="dark"
      width="240"
    >
      <div class="logo">
        <span v-if="!collapsed">Vela 管理后台</span>
        <span v-else>V</span>
      </div>

      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="/">
          <router-link to="/">
            <DashboardOutlined />
            <span>仪表盘</span>
          </router-link>
        </a-menu-item>

        <a-sub-menu key="product-mgmt">
          <template #title>
            <ShoppingOutlined />
            <span>商品管理</span>
          </template>
          <a-menu-item key="/products">
            <router-link to="/products">商品列表</router-link>
          </a-menu-item>
          <a-menu-item key="/categories">
            <router-link to="/categories">分类管理</router-link>
          </a-menu-item>
          <a-menu-item key="/series">
            <router-link to="/series">系列管理</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="/orders">
          <router-link to="/orders">
            <OrderedListOutlined />
            <span>订单管理</span>
          </router-link>
        </a-menu-item>

        <a-menu-item key="/shipping">
          <router-link to="/shipping">
            <CarOutlined />
            <span>运费管理</span>
          </router-link>
        </a-menu-item>

        <a-menu-item key="/users">
          <router-link to="/users">
            <UserOutlined />
            <span>用户管理</span>
          </router-link>
        </a-menu-item>

        <a-menu-item key="/statistics">
          <router-link to="/statistics">
            <BarChartOutlined />
            <span>数据统计</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header class="header">
        <div class="header-left">
          <MenuFoldOutlined
            v-if="!collapsed"
            class="trigger"
            @click="collapsed = true"
          />
          <MenuUnfoldOutlined
            v-else
            class="trigger"
            @click="collapsed = false"
          />
          <a-breadcrumb>
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <a-dropdown>
            <span class="admin-info">
              <a-avatar :size="32">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="admin-name">{{
                authStore.admin?.username || "管理员"
              }}</span>
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  CarOutlined,
  UserOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const collapsed = ref(false);
const selectedKeys = ref([route.path]);

const currentRoute = computed(() => route);

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
  }
);

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.admin-name {
  color: #333;
}

.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 64px - 48px);
}

:deep(.ant-menu-item a) {
  color: inherit;
}
</style>
