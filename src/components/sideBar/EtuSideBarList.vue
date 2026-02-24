<template>
  <div class="etu-sidebar-list">
    <v-list nav>
      <template
        v-for="(item, index) in safeItems"
        :key="item.name || `divider-${index}`"
      >
        <v-divider
          v-if="item.divider"
          class="drawer-divider"
          :inset="true"
        />
        <v-list-group
          v-else-if="hasChildren(item) && !rail"
          :value="item.name"
        >
          <template #activator="{ props }">
            <etu-side-bar-item
              v-bind="props"
              :item="item"
              :rail="rail"
              @select="emit('select', $event)"
            />
          </template>

          <etu-side-bar-item
            v-for="child in safeChildren(item)"
            :key="child.name"
            :item="child"
            :rail="false"
            @select="emit('select', $event)"
          />
        </v-list-group>

        <etu-side-bar-item
          v-else-if="!item.divider"
          :item="item"
          :rail="rail"
          @select="emit('select', $event)"
        />
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EtuSideBarItem from './EtuSideBarItem.vue';
import type { SideBarItem } from './model';

const props = defineProps<{
  items: SideBarItem[]
}>();

const rail = defineModel<boolean>('rail', { default: false });
const emit = defineEmits<{
  (e: 'select', item: SideBarItem): void
}>();

/**
 * Защита от undefined/null/дыр в массиве items
 */
const safeItems = computed(() =>
  (props.items ?? []).filter((i): i is SideBarItem => {
    if (!i) return false;
    if (i.divider) return true;
    return !!(i.name && i.title && i.path);
  })
)

function hasChildren(item: SideBarItem) {
  return Array.isArray(item.children) && item.children.length > 0;
}

function safeChildren(item: SideBarItem) {
  return (item.children ?? []).filter(
    (c): c is SideBarItem => !!c && !!c.name && !!c.title && !!c.path,
  );
}
</script>

<style scoped lang="scss">
.etu-sidebar-list {
  flex: 1;
  padding: 12px;
  background: transparent;
}

:deep(.v-list) {
  padding: 0;
}

:deep(.v-list-item) {
  border-radius: 14px;
  margin-bottom: 6px;
  transition: background-color 0.2s ease;
  color: #111827 !important;
}

:deep(.v-list-item:hover) {
  background: #f3f4f6 !important;
}

:deep(.v-list-item--active) {
  background: #eff6ff !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: #2f70fc !important;
}

:deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 500;
  color: #111827 !important;
}

:deep(.v-icon) {
  color: #6b7280 !important;
}

:deep(.v-list-item--active .v-icon) {
  color: #2563eb !important;
}

:deep(.v-list-item--active > .v-list-item__overlay) {
  opacity: 0;
}

.drawer-divider {
  opacity: 0.6;
}

:deep(.drawer-divider.v-divider--inset:not(.v-divider--vertical)) {
  max-width: none;
  margin-inline-start: 0;
  color: #f3f4f6;
  border-color: #f3f4f6 !important;
}
</style>
