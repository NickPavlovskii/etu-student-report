<template>
  <v-list-item
    :class="{ rail }"
    :title="rail ? '' : item.title"
    :value="item.name"
    :to="item.path"
    active-class="drawer-item--active"
    @click="emit('select', item)"
  >
    <template
      v-if="item.srcIcon"
      #prepend
    >
      <img
        class="not_rail"
        alt="icon"
        draggable="false"
        :src="'/assets/' + item.srcIcon"
      />
    </template>
    <template
      v-else-if="item.mdiIcon"
      #prepend
    >
      <v-icon
        class="not_rail"
        :icon="item.mdiIcon"
        color="#c7d2fe"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import type { SideBarItem } from './model';

const route = useRoute();
const emit = defineEmits(['select']);

const props = defineProps<{
  item: SideBarItem;
  rail: boolean;
}>();

const isActive = computed(() => {
  const path = route.path;
  const itemPath = props.item.path;
  if (path === itemPath) return true;
  return path.startsWith(itemPath + '/');
});
</script>

<style scoped lang="scss">
.v-list-item img {
  width: 35px;
  height: 35px;
}

.v-list-item--density-default.v-list-item--one-line {
  margin: 4px 0;
}

:deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 500;
  color: #fff !important;
}

:deep(.v-list-item) {
  color: #fff !important;
}

:deep(.v-list-item--active),
:deep(.drawer-item--active) {
  background: rgba(255,255,255,0.2) !important;
  color: #fff !important;
}

:deep(.v-list-item--active .v-list-item-title),
:deep(.drawer-item--active .v-list-item-title) {
  color: #fff !important;
}

:deep(.v-list-item--active .v-icon),
:deep(.drawer-item--active .v-icon) {
  color: #fff !important;
}

:deep(.v-icon) {
  color: #c7d2fe !important;
}

.v-list-item.rail {
  display: flex;
  justify-content: center;
}

.v-list-item img.not_rail,
.v-list-item .v-icon.not_rail {
  margin-right: 8px;
}
</style>
