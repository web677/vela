<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">
        <span class="logo-text">VELA</span>
      </router-link>

      <nav class="nav">
        <router-link to="/products" class="nav-link">产品</router-link>
        <router-link to="/cart" class="nav-link" v-if="userStore.isAuthenticated">
          购物车
          <span class="cart-badge" v-if="cartStore.totalItems > 0">
            {{ cartStore.totalItems }}
          </span>
        </router-link>
        <router-link to="/orders" class="nav-link" v-if="userStore.isAuthenticated">
          订单
        </router-link>
      </nav>

      <div class="header-actions">
        <template v-if="userStore.isAuthenticated">
          <span class="user-name">{{ userStore.user?.full_name || userStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-ghost">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-ghost">登录</router-link>
          <router-link to="/register" class="btn btn-primary">注册</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

onMounted(() => {
  if (userStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(42, 42, 42, 0.95);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  position: relative;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
}

.cart-badge {
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  min-width: 1.25rem;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}
</style>
