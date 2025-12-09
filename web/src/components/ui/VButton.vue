<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loader"></span>
    <span :class="{ 'button-content--loading': loading }">
      <slot></slot>
    </span>
  </component>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (val) => ["primary", "secondary", "ghost", "text"].includes(val),
  },
  size: {
    type: String,
    default: "md",
    validator: (val) => ["sm", "md", "lg"].includes(val),
  },
  block: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: "button",
  },
  nativeType: {
    type: String,
    default: "button",
  },
});

const emit = defineEmits(["click"]);

const buttonClasses = computed(() => [
  "luxury-button",
  `luxury-button--${props.variant}`,
  `luxury-button--${props.size}`,
  {
    "luxury-button--block": props.block,
    "luxury-button--loading": props.loading,
    "luxury-button--disabled": props.disabled,
  },
]);

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit("click", e);
  }
};
</script>

<style scoped>
.luxury-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
  font-size: var(--font-size-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-elegant);
  outline: none;
  position: relative;
  overflow: hidden;
}

.luxury-button:focus-visible {
  box-shadow: var(--shadow-focus);
}

/* ==================== Sizes ==================== */

.luxury-button--sm {
  height: 40px;
  padding: 0 var(--spacing-lg);
  font-size: var(--font-size-xs);
}

.luxury-button--md {
  height: 48px;
  padding: 0 var(--spacing-xl);
}

.luxury-button--lg {
  height: 56px;
  padding: 0 var(--spacing-2xl);
  font-size: var(--font-size-base);
}

/* ==================== Variants ==================== */

/* Primary */
.luxury-button--primary {
  background-color: var(--color-ebony);
  color: var(--color-text-inverse);
  border-color: var(--color-ebony);
}

.luxury-button--primary:hover:not(:disabled) {
  background-color: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.luxury-button--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-soft);
}

/* Secondary */
.luxury-button--secondary {
  background-color: transparent;
  color: var(--color-ebony);
  border-color: var(--color-border-default);
}

.luxury-button--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-ebony);
}

.luxury-button--secondary:active:not(:disabled) {
  background-color: var(--color-soft-grey);
}

/* Ghost */
.luxury-button--ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.luxury-button--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

.luxury-button--ghost:active:not(:disabled) {
  background-color: var(--color-soft-grey);
}

/* Text */
.luxury-button--text {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
  padding: 0;
  height: auto;
  position: relative;
}

.luxury-button--text::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-ebony);
  transition: width var(--duration-base) var(--ease-elegant);
}

.luxury-button--text:hover:not(:disabled)::after {
  width: 100%;
}

/* ==================== States ==================== */

.luxury-button--block {
  width: 100%;
}

.luxury-button--disabled,
.luxury-button:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.luxury-button--loading {
  cursor: wait;
  pointer-events: none;
}

/* ==================== Loading ==================== */

.button-loader {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.button-content--loading {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== Mobile ==================== */

@media (max-width: 768px) {
  .luxury-button {
    min-height: 44px;
  }

  .luxury-button--sm {
    height: 44px;
  }
}
</style>
