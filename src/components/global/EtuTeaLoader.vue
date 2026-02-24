<template>
  <div
    class="etu-tea-loader"
    v-html="teaSvg"
  />
</template>

<script setup lang="ts">
import teaSvg from '@/assets/icons/tea.svg?raw'
</script>

<style scoped>
.etu-tea-loader {
  --etu-tea-color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--etu-tea-color);
}

.etu-tea-loader :deep(svg) {
  width: 74px;
  height: 96px;
  margin-left: 12px;
  overflow: visible;
}

.etu-tea-loader :deep(#teabag) {
  fill: currentColor;
  transform-origin: 15px 17px;
  animation: etu-tea-swing 2s ease-in-out infinite;
}

.etu-tea-loader :deep(#steamL),
.etu-tea-loader :deep(#steamR) {
  stroke: currentColor;
  animation: etu-tea-steam 1.6s ease-in-out infinite;
}

.etu-tea-loader :deep(#steamR) {
  animation-delay: 0.4s;
}

@keyframes etu-tea-swing {
  0% { transform: rotate(-6deg); }
  50% { transform: rotate(6deg); }
  100% { transform: rotate(-6deg); }
}

@keyframes etu-tea-steam {
  0% { opacity: 0; transform: translateY(4px); }
  20% { opacity: 1; }
  60% { opacity: 0.5; transform: translateY(-6px); }
  100% { opacity: 0; transform: translateY(-12px); }
}
</style>
