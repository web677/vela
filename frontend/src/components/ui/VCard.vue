<template>
  <div :class="cardClasses" :style="cardStyles" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (val) => ["default", "flat", "bordered"].includes(val),
  },
  padding: {
    type: String,
    default: "md",
    validator: (val) => ["none", "sm", "md", "lg", "xl"].includes(val),
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const cardClasses = computed(() => [
  "luxury-card",
  `luxury-card--${props.variant}`,
  {
    "luxury-card--hoverable": props.hoverable,
    "luxury-card--clickable": props.clickable,
  },
]);

const paddingMap = {
  none: "0",
  sm: "var(--spacing-md)",
  md: "var(--spacing-lg)",
  lg: "var(--spacing-xl)",
  xl: "var(--spacing-2xl)",
};

const cardStyles = computed(() => ({
  padding: paddingMap[props.padding],
}));

const handleClick = (e) => {
  if (props.clickable) {
    emit("click", e);
  }
};
</script>

<style scoped>
.luxury-card {
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-none);
  transition: var(--transition-slow);
  position: relative;
}

/* ==================== Variants ==================== */

.luxury-card--default {
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-soft);
}

.luxury-card--flat {
  border: none;
  box-shadow: none;
  background-color: var(--color-bg-secondary);
}

.luxury-card--bordered {
  border: 1px solid var(--color-border-default);
  box-shadow: none;
}

/* ==================== States ==================== */

.luxury-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-border-dark);
}

.luxury-card--clickable {
  cursor: pointer;
}

.luxury-card--clickable:active {
  transform: translateY(0);
  box-shadow: var(--shadow-soft);
}

/* ==================== Mobile ==================== */

@media (max-width: 768px) {
  .luxury-card--hoverable:hover {
    transform: none;
  }
}
</style>
