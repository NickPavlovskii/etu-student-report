<template>
  <v-navigation-drawer
    rail-width="74"
    width="320"
    class="etu-sidebar"
    :model-value="drawerValue"
    :rail="rail && !temporary"
    :temporary="temporary"
    :permanent="!temporary"
    @update:model-value="onUpdateModel"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <img
          :src="logoSrc"
          alt="Logo"
          class="drawer-logo"
        />
        <div class="drawer-header-text">
          <v-icon
            size="24"
            color="#4b5563"
          >
            mdi-file-document-outline
          </v-icon>
          <span class="drawer-title">
            {{ title }}
          </span>
        </div>
      </div>

      <v-divider class="header-divider" />
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
            <v-list-item
              v-else
              class="drawer-item"
              active-class="drawer-item--active"
              :to="item.path"
              @click="onSelect(item)"
            >
              <template #prepend>
                <v-icon
                  v-if="item.mdiIcon"
                  :color="isItemActive(item) ? '#2563eb' : '#6b7280'"
                  :icon="item.mdiIcon"
                />
                <img
                  v-else-if="item.srcIcon"
                  alt=""
                  class="item-icon"
                  :src="'/assets/' + item.srcIcon"
                >
              </template>
              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <v-divider class="footer-divider" />
      <div class="drawer-user">
        <etu-sidebar-footer />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import EtuSidebarFooter from './EtuSidebarFooter.vue';
import type { SideBarItem } from './model';

const route = useRoute();

function isItemActive(item: SideBarItem): boolean {
  const path = route.path;
  if (path === item.path) return true;
  if (item.path !== '/' && path.startsWith(item.path + '/')) return true;
  return false;
}

const props = withDefaults(
  defineProps<{
    title: string;
    items: SideBarItem[];
    logoSrc?: string;
    modelValue?: boolean;
    temporary?: boolean;
  }>(),
  {
    temporary: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', item: SideBarItem): void;
}>();

const rail = ref(false);
const drawerValue = computed(() => props.modelValue ?? true);
const logoSrc = computed(() => props.logoSrc ?? '/assets/logo.svg');

const safeItems = computed(() =>
  (props.items ?? []).filter((i): i is SideBarItem => {
    if (!i) {
      return false;
    }
    if (i.divider) {
      return true;
    }
    return !!(i.name && i.title && i.path);
  })
);

function onUpdateModel(value: boolean) {
  if (!props.temporary) {
    return;
  } 
  emit('update:modelValue', value);
}

function onSelect(item: SideBarItem) {
  if (props.temporary) {
    emit('update:modelValue', false);
  }
  emit('select', item);
}
</script>

<style scoped lang="scss">
.v-navigation-drawer.etu-sidebar {
  background: #ffffff;
  z-index: 2000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  max-height: 100vh;
  overflow: hidden;
}

.drawer-content {
  width: 100%;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
  text-align: left;
  vertical-align: middle;
  transform: translateX(-24px);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

:deep(.v-navigation-drawer--active .drawer-content) {
  transform: translateX(0);
}

.drawer-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: #fff;
}

.etu-sidebar .header-divider {
  flex-shrink: 0;
  margin: 0 16px;
  border-color: #e5e7eb;
  border-width: 1px 0 0;
  opacity: 1;
}

.drawer-logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

.drawer-header-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #111827;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.etu-sidebar .footer-divider {
  flex-shrink: 0;
  margin: 0 16px;
  border-color: #e5e7eb;
  border-width: 1px 0 0;
  opacity: 1;
}

.drawer-user {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 0 7px 10px;
  background: #fff;
}

.drawer-user .user-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-user .settings-btn {
  color: #64748b;
  transition: color 0.25s ease;
}

.drawer-user .settings-btn:hover {
  color: #1e40af;
}

.drawer-user .user-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-user .user-role {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.etu-sidebar-list {
  flex: 1;
  min-height: 0;
  padding: 12px 16px;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  border-bottom: none;
}

.etu-sidebar :deep(.v-list) {
  padding: 0;
  border: none;
  box-shadow: none;
}

.etu-sidebar :deep(.v-list-item:last-child) {
  border-bottom: none;
}

:deep(.v-list-item) {
  border-radius: 14px;
  margin-bottom: 6px;
  min-height: 44px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;
}

.etu-sidebar :deep(.v-list-item:hover) {
  background: #f3f4f6;
}

.etu-sidebar :deep(.v-list-item--active) {
  background: #eff6ff;
}

.etu-sidebar :deep(.v-list-item--active .v-list-item-title) {
  color: #2f70fc;
  font-weight: 600;
}

.etu-sidebar :deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.etu-sidebar :deep(.v-list-item .v-icon) {
  color: #6b7280;
}

.etu-sidebar :deep(.v-list-item) {
  color: #1f2937;
}

.etu-sidebar :deep(.v-list-item--active .v-icon),
.etu-sidebar :deep(.drawer-item--active .v-icon) {
  color: #2563eb;
  --v-icon-color: #2563eb;
}

:deep(.v-list-item--active > .v-list-item__overlay) {
  opacity: 0;
}

:deep(.v-list-item__prepend) {
  margin-right: 12px;
}

.drawer-divider {
  margin: 12px 0;
  opacity: 0.6;
}

.etu-sidebar :deep(.drawer-divider.v-divider--inset:not(.v-divider--vertical)) {
  max-width: none;
  margin-inline-start: 0;
  color: #f3f4f6;
  border-color: #f3f4f6;
}

.item-icon {
  width: 24px;
  height: 24px;
}

:deep(.v-navigation-drawer) {
  transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.v-navigation-drawer.etu-sidebar.v-navigation-drawer--active {
  width: 320px;
  max-width: min(320px, 100vw);
}

.v-navigation-drawer.etu-sidebar .drawer-title,
.v-navigation-drawer.etu-sidebar .drawer-header-text,
.v-navigation-drawer.etu-sidebar .drawer-header-text span {
  color: #1f2937;
}

.v-navigation-drawer.etu-sidebar .v-list-item-title,
.v-navigation-drawer.etu-sidebar .v-list-item,
.v-navigation-drawer.etu-sidebar .v-list-item__content {
  color: #1f2937;
}

.v-navigation-drawer.etu-sidebar .v-list-item .v-icon {
  color: #6b7280;
}

.v-navigation-drawer.etu-sidebar .drawer-item--active .v-icon,
.v-navigation-drawer.etu-sidebar .v-list-item--active .v-icon {
  color: #2563eb;
}

.v-navigation-drawer.etu-sidebar .drawer-user .user-name {
  color: #1f2937;
}

.v-navigation-drawer.etu-sidebar .drawer-user .user-role {
  color: #6b7280;
}

.v-navigation-drawer.etu-sidebar .drawer-item--active {
  background-color: #eff6ff;
  color: #2f70fc;
}

.v-navigation-drawer.etu-sidebar .drawer-item--active .v-list-item-title {
  color: #2f70fc;
}

.v-navigation-drawer.etu-sidebar .drawer-item--active .v-icon {
  color: #2563eb;
}

.v-navigation-drawer.etu-sidebar .v-navigation-drawer__content {
  overflow: hidden;
  max-height: 100vh;
  margin-left: 10px;
}
</style>
