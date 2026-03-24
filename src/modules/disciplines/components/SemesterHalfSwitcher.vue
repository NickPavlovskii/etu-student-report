<template>
  <div
    class="semester-switcher"
    role="group"
    aria-label="Полугодие семестра"
  >
    <button
      type="button"
      :class="[
        'semester-switcher__option',
        { 'semester-switcher__option--active': modelValue === 'autumn' },
      ]"
      @click="$emit('update:modelValue', 'autumn')"
    >
      Осень (нечётные)
    </button>
    <button
      type="button"
      :class="[
        'semester-switcher__option',
        { 'semester-switcher__option--active': modelValue === 'spring' },
      ]"
      @click="$emit('update:modelValue', 'spring')"
    >
      Весна (чётные)
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'autumn' },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.semester-switcher {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: #f3f4f6;
  gap: 0;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.semester-switcher__option {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #4b5563;
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.semester-switcher__option:hover {
  color: #374151;
}

.semester-switcher__option--active {
  background: #fff;
  color: rgb(37, 99, 235);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
