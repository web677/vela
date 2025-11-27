<template>
  <transition name="modal-fade">
    <div v-if="showModal" class="gender-modal-overlay">
      <div class="gender-modal">
        <div class="modal-header">
          <h2 class="modal-title">选择您的性别</h2>
          <p class="modal-subtitle">为您提供更个性化的购物体验</p>
        </div>

        <div class="gender-options">
          <button
            class="gender-option"
            :class="{ selected: selectedGender === 'male' }"
            @click="selectedGender = 'male'"
          >
            <div class="option-icon">♂</div>
            <div class="option-label">男性</div>
          </button>

          <button
            class="gender-option"
            :class="{ selected: selectedGender === 'female' }"
            @click="selectedGender = 'female'"
          >
            <div class="option-icon">♀</div>
            <div class="option-label">女性</div>
          </button>
        </div>

        <button class="confirm-btn" @click="confirmSelection">确认选择</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const showModal = ref(false);
const selectedGender = ref("male"); // 默认男性

onMounted(() => {
  // 检查是否已有性别选择
  const savedGender = localStorage.getItem("user_gender");
  if (!savedGender) {
    showModal.value = true;
  }
});

const confirmSelection = () => {
  // 保存到 localStorage 和 store
  localStorage.setItem("user_gender", selectedGender.value);
  userStore.setGender(selectedGender.value);
  showModal.value = false;
};
</script>

<style scoped>
.gender-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--spacing-lg);
}

.gender-modal {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-2xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.modal-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.gender-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.gender-option {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl) var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.gender-option:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-subtle);
  transform: translateY(-2px);
}

.gender-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.option-icon {
  font-size: 48px;
  line-height: 1;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.gender-option.selected .option-icon {
  color: var(--color-primary);
  transform: scale(1.1);
}

.option-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.confirm-btn {
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.confirm-btn:active {
  transform: translateY(0);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .gender-modal {
    padding: var(--spacing-2xl);
  }

  .gender-options {
    gap: var(--spacing-md);
  }

  .gender-option {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .option-icon {
    font-size: 36px;
  }
}
</style>
