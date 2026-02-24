<template>
  <div class="loading-page">
    <div class="loading-content">
      <etu-tea-loader />
      <span class="loading-text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: 'Загрузка' },
});
</script>

<style scoped>
.loading-page {
  position: fixed;
  inset: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.loading-text {
  font-size: 14px;
  color: #6b7280;
}
</style>
