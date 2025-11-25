<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
    <Toast v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'
import Toast from './components/common/Toast.vue'

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
