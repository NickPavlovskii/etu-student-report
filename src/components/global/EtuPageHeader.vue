<template>
  <v-card
    elevation="0"
    :class="cardClass"
  >
    <div class="header-top">
      <div class="head-inner">
        <div
          v-if="icon"
          class="head-icon-wrap"
          :style="{ background: iconBgColor, color: iconColor }"
        >
          <v-icon
            size="40"
            :color="iconColor"
            :icon="icon"
          />
        </div>
        <div>
          <h2 class="page-title">{{ title }}</h2>
          <p
            v-if="subtitle"
            class="subtitle"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>
      <div v-if="$slots.right" class="header-right">
        <slot name="right" />
      </div>
    </div>
    <div
      v-if="$slots.default"
      class="header-extra"
    >
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    iconBgColor?: string;
    cardClass?: string;
  }>(),
  {
    cardClass: 'header-card',
    iconColor: '#2563eb',
    iconBgColor: '#eff6ff',
  }
);
</script>

<style scoped>
.header-card,
.stats-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 0;
  padding: 0 4px;
  flex-wrap: wrap;
}

.header-right {
  flex-shrink: 0;
}

.header-extra {
  margin-top: 20px;
}

.head-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.head-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #6b7280;
}
</style>
