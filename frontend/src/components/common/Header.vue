<template>
  <header
    class="luxury-header"
    :class="{ 'luxury-header--scrolled': isScrolled }"
  >
    <div class="luxury-header-container">
      <!-- Logo -->
      <router-link to="/" class="luxury-logo">
        <span class="luxury-logo-text">VELA</span>
        <span class="luxury-logo-subtitle">优雅生活</span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="luxury-nav luxury-nav--desktop">
        <router-link to="/products" class="luxury-nav-link">产品</router-link>
        <router-link to="/series" class="luxury-nav-link">系列</router-link>
      </nav>

      <!-- Actions -->
      <div class="luxury-header-actions">
        <router-link to="/cart" class="luxury-action-link">
          <span class="luxury-action-icon">🛒</span>
          <span v-if="cartStore.totalItems > 0" class="luxury-cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </router-link>

        <template v-if="userStore.isAuthenticated">
          <router-link to="/orders" class="luxury-action-link">
            <span class="luxury-action-icon">👤</span>
          </router-link>
          <button
            @click="handleLogout"
            class="luxury-action-link luxury-action-link--text"
          >
            退出
          </button>
        </template>

        <router-link
          v-else
          to="/login"
          class="luxury-action-link luxury-action-link--primary"
        >
          登录
        </router-link>

        <!-- Mobile Menu Toggle -->
        <button class="luxury-mobile-toggle" @click="toggleMobileMenu">
          <span class="luxury-mobile-toggle-line"></span>
          <span class="luxury-mobile-toggle-line"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <nav v-if="isMobileMenuOpen" class="luxury-nav luxury-nav--mobile">
        <router-link
          to="/products"
          class="luxury-nav-link"
          @click="closeMobileMenu"
          >产品</router-link
        >
        <router-link
          to="/series"
          class="luxury-nav-link"
          @click="closeMobileMenu"
          >系列</router-link
        >
        <router-link
          v-if="userStore.isLoggedIn"
          to="/orders"
          class="luxury-nav-link"
          @click="closeMobileMenu"
          >订单</router-link
        >
        <button
          v-if="userStore.isLoggedIn"
          @click="handleLogout"
          class="luxury-nav-link logout-btn"
        >
          退出
        </button>
      </nav>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  userStore.logout();
  closeMobileMenu();
  router.push("/");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.luxury-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background-color: rgba(245, 243, 239, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent;
  transition: all var(--duration-base) var(--ease-elegant);
}

.luxury-header--scrolled {
  border-bottom-color: var(--color-border-light);
  box-shadow: var(--shadow-soft);
}

.luxury-header-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.luxury-logo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
}

.luxury-logo-text {
  font-family: var(--font-family-elegant);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-regular);
  color: var(--color-ebony);
  letter-spacing: var(--letter-spacing-wider);
}

.luxury-logo-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wider);
}

/* Navigation */
.luxury-nav {
  display: flex;
  gap: var(--spacing-3xl);
}

.luxury-nav--desktop {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.luxury-nav--mobile {
  display: none;
}

.luxury-nav-link {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  position: relative;
  transition: var(--transition-base);
}

.luxury-nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-ebony);
  transition: width var(--duration-base) var(--ease-elegant);
}

.luxury-nav-link:hover::after,
.luxury-nav-link.router-link-active::after {
  width: 100%;
}

/* Actions */
.luxury-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.luxury-action-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  transition: var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-body);
}

.luxury-action-link:hover {
  color: var(--color-accent);
}

.luxury-action-link--primary {
  padding: 0 var(--spacing-lg);
  height: 36px;
  border: 1px solid var(--color-ebony);
}

.luxury-action-link--primary:hover {
  background-color: var(--color-ebony);
  color: var(--color-text-inverse);
}

.luxury-action-link--text {
  padding: 0;
  min-width: auto;
}

.luxury-action-icon {
  font-size: var(--font-size-xl);
}

.luxury-cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  background-color: var(--color-ebony);
  color: var(--color-text-inverse);
  border-radius: 50%;
  padding: 0 4px;
}

/* Mobile Toggle */
.luxury-mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.luxury-mobile-toggle-line {
  width: 100%;
  height: 2px;
  background-color: var(--color-ebony);
  transition: var(--transition-base);
}

.logout-btn {
  width: 100%;
  text-align: left;
  padding: var(--spacing-lg) var(--container-padding);
  border-bottom: 1px solid var(--color-border-light);
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .luxury-nav--desktop {
    display: none;
  }

  .luxury-mobile-toggle {
    display: flex;
  }

  .luxury-nav--mobile {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--color-bg-elevated);
    border-bottom: 1px solid var(--color-border-light);
    box-shadow: var(--shadow-elevated);
  }

  .luxury-nav--mobile .luxury-nav-link {
    padding: var(--spacing-lg) var(--container-padding);
    border-bottom: 1px solid var(--color-border-light);
  }

  .luxury-nav--mobile .luxury-nav-link:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .luxury-header-container {
    height: 64px;
    padding: 0 var(--container-padding-mobile);
  }

  .luxury-logo-text {
    font-size: var(--font-size-xl);
  }
}

/* Mobile Menu Animation */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all var(--duration-base) var(--ease-elegant);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
