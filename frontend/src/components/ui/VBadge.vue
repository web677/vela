<template>
  <span :class="badgeClasses">
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (val) =>
      ["default", "success", "warning", "error", "info"].includes(val),
  },
  size: {
    type: String,
    default: "md",
    validator: (val) => ["sm", "md", "lg"].includes(val),
  },
});

const badgeClasses = computed(() => [
  "luxury-badge",
  `luxury-badge--${props.variant}`,
  `luxury-badge--${props.size}`,
]);
</script>

<style scoped>
.luxury-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--letter-spacing-wider);
  text-transform: uppercase;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* ==================== Sizes ==================== */

.luxury-badge--sm {
  height: 20px;
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.luxury-badge--md {
  height: 24px;
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-xs);
}

.luxury-badge--lg {
  height: 28px;
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
}

/* ==================== Variants ==================== */

.luxury-badge--default {
  background-color: var(--color-soft-grey);
  color: var(--color-text-primary);
}

.luxury-badge--success {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
}

.luxury-badge--warning {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
}

.luxury-badge--error {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

.luxury-badge--info {
  background-color: var(--color-tiffany);
  color: var(--color-text-inverse);
}
</style>
