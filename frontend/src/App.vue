<template>
  <Header />
  <main class="main-content">
    <router-view />
  </main>
  <Footer />
  <Notification />
  <ConfirmDialog
    :show="confirmState.show"
    :title="confirmState.title"
    :message="confirmState.message"
    :confirmText="confirmState.confirmText"
    :cancelText="confirmState.cancelText"
    :type="confirmState.type"
    :onConfirm="handleConfirm"
    :onCancel="handleCancel"
  />
  <GenderModal />
  <TabBar v-if="isMobile" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Header from "./components/common/Header.vue";
import Footer from "./components/common/Footer.vue";
import Notification from "./components/common/Notification.vue";
import ConfirmDialog from "./components/common/ConfirmDialog.vue";
import GenderModal from "./components/common/GenderModal.vue";
import TabBar from "./components/mobile/TabBar.vue";
import { useConfirm } from "./composables/useConfirm";

const { confirmState, handleConfirm, handleCancel } = useConfirm();

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) {
    document.body.classList.add("has-tab-bar");
  } else {
    document.body.classList.remove("has-tab-bar");
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  document.body.classList.remove("has-tab-bar");
});
</script>

<style>
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: var(--color-bg-secondary);
}
</style>
