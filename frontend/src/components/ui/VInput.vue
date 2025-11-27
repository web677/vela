<template>
  <div class="luxury-input-wrapper">
    <label v-if="label" class="luxury-input-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="luxury-input-required">*</span>
    </label>

    <div class="luxury-input-container">
      <span v-if="$slots.prefix" class="luxury-input-prefix">
        <slot name="prefix"></slot>
      </span>

      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <span v-if="$slots.suffix" class="luxury-input-suffix">
        <slot name="suffix"></slot>
      </span>
    </div>

    <p v-if="error" class="luxury-input-error">{{ error }}</p>
    <p v-else-if="hint" class="luxury-input-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  maxlength: {
    type: [String, Number],
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue", "input", "blur", "focus"]);

const inputId = ref(`luxury-input-${Math.random().toString(36).substr(2, 9)}`);
const isFocused = ref(false);

const inputValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const inputClasses = computed(() => [
  "luxury-input",
  {
    "luxury-input--error": props.error,
    "luxury-input--disabled": props.disabled,
    "luxury-input--focused": isFocused.value,
  },
]);

const handleInput = (e) => {
  emit("input", e.target.value);
};

const handleBlur = (e) => {
  isFocused.value = false;
  emit("blur", e);
};

const handleFocus = (e) => {
  isFocused.value = true;
  emit("focus", e);
};
</script>

<style scoped>
.luxury-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.luxury-input-label {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.luxury-input-required {
  color: var(--color-error);
  margin-left: 2px;
}

.luxury-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.luxury-input {
  width: 100%;
  height: var(--input-height);
  padding: 0 var(--spacing-md);
  font-family: var(--font-family-body);
  font-size: var(--input-font-size);
  font-weight: var(--font-weight-light);
  color: var(--color-text-primary);
  background-color: var(--color-bg-elevated);
  border: var(--input-border-width) solid var(--color-border-light);
  border-radius: var(--radius-none);
  outline: none;
  transition: var(--transition-base);
}

.luxury-input::placeholder {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-light);
}

.luxury-input:hover:not(:disabled) {
  border-color: var(--color-border-default);
}

.luxury-input:focus,
.luxury-input--focused {
  border-color: var(--color-ebony);
  box-shadow: 0 0 0 1px var(--color-ebony);
}

.luxury-input--error {
  border-color: var(--color-error);
}

.luxury-input--error:focus {
  box-shadow: 0 0 0 1px var(--color-error);
}

.luxury-input--disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  background-color: var(--color-bg-secondary);
}

.luxury-input-prefix,
.luxury-input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  pointer-events: none;
}

.luxury-input-prefix {
  left: var(--spacing-md);
}

.luxury-input-suffix {
  right: var(--spacing-md);
  pointer-events: all;
}

.luxury-input-container:has(.luxury-input-prefix) .luxury-input {
  padding-left: calc(var(--spacing-md) * 2 + 20px);
}

.luxury-input-container:has(.luxury-input-suffix) .luxury-input {
  padding-right: calc(var(--spacing-md) * 2 + 20px);
}

.luxury-input-error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin: 0;
}

.luxury-input-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}
</style>
