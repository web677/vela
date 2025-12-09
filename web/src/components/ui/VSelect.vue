<template>
  <div
    class="luxury-select-wrapper"
    :class="{ 'luxury-select--disabled': disabled }"
  >
    <label v-if="label" class="luxury-select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <div
      class="luxury-select-container"
      @click="toggleDropdown"
      ref="containerRef"
    >
      <div class="luxury-select-value" :class="{ placeholder: !modelValue }">
        {{ displayValue || placeholder }}
      </div>
      <span class="luxury-select-arrow" :class="{ 'is-open': isOpen }">▼</span>

      <transition name="dropdown">
        <div v-if="isOpen" class="luxury-select-dropdown">
          <div
            v-for="option in options"
            :key="option.value"
            class="luxury-select-option"
            :class="{ 'is-selected': modelValue === option.value }"
            @click.stop="selectOption(option)"
          >
            {{ option.label }}
          </div>
          <div v-if="options.length === 0" class="luxury-select-empty">
            暂无选项
          </div>
        </div>
      </transition>
    </div>

    <span v-if="error" class="luxury-select-error">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const containerRef = ref(null);

const displayValue = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected ? selected.label : "";
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit("update:modelValue", option.value);
  emit("change", option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.luxury-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.luxury-select-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.required-mark {
  color: var(--color-error);
  margin-left: 4px;
}

.luxury-select-container {
  position: relative;
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-elegant);
}

.luxury-select-container:hover {
  border-color: var(--color-border-dark);
}

.luxury-select-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.luxury-select-value.placeholder {
  color: var(--color-text-muted);
}

.luxury-select-arrow {
  font-size: 10px;
  color: var(--color-text-secondary);
  transition: transform var(--duration-base) var(--ease-elegant);
}

.luxury-select-arrow.is-open {
  transform: rotate(180deg);
}

.luxury-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-dropdown);
  z-index: var(--z-dropdown);
  max-height: 240px;
  overflow-y: auto;
}

.luxury-select-option {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--duration-fast);
}

.luxury-select-option:hover {
  background-color: var(--color-bg-secondary);
}

.luxury-select-option.is-selected {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.luxury-select-empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.luxury-select-error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-left: var(--spacing-xs);
}

/* Disabled State */
.luxury-select--disabled .luxury-select-container {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--duration-fast) var(--ease-elegant);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
