<template>
  <Teleport to="body">
    <Transition name="tooltip-pop">
      <div
        v-if="visible"
        class="disc-tooltip"
        :style="style"
        @mouseenter="$emit('tooltipEnter')"
        @mouseleave="$emit('tooltipLeave')"
      >
        <div class="disc-tooltip__header">
          <v-icon
            size="14"
            class="disc-tooltip__ico"
          >
            mdi-book-open-variant
          </v-icon>
          <span>Дисциплины ({{ items.length }})</span>
        </div>
        <ul class="disc-tooltip__list">
          <li
            v-for="(d, i) in items"
            :key="i"
            class="disc-tooltip__item"
          >
            <span class="disc-tooltip__dot" />
            {{ d }}
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  items: string[];
  style: Record<string, string>;
}>();

defineEmits<{
  tooltipEnter: [];
  tooltipLeave: [];
}>();
</script>

<style scoped>
.disc-tooltip {
  position: fixed;
  z-index: 1900;
  background: #fff !important;
  border: 1.5px solid #e7e5e4;
  border-radius: 12px;
  padding: 14px 16px;
  min-width: 220px;
  max-width: 360px;
  max-height: 280px;
  overflow-y: auto;
  box-shadow:
    0 12px 40px rgba(28, 25, 23, 0.14),
    0 2px 6px rgba(28, 25, 23, 0.06);
  font-family: 'DM Sans', 'Nunito Sans', system-ui, sans-serif;
  pointer-events: auto;
  opacity: 1 !important;
}
.disc-tooltip__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #a8a29e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0efed;
}
.disc-tooltip__ico {
  opacity: 0.6;
}
.disc-tooltip__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.disc-tooltip__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #1c1917;
  line-height: 1.4;
}
.disc-tooltip__item + .disc-tooltip__item {
  border-top: 1px solid #f9f8f7;
}
.disc-tooltip__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4f46e5;
  opacity: 0.4;
  flex-shrink: 0;
  margin-top: 5px;
}

.tooltip-pop-enter-active {
  transition:
    opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}
.tooltip-pop-leave-active {
  transition:
    opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.tooltip-pop-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
.tooltip-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
