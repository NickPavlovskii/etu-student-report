<template>
  <div
    v-if="rows.length"
    class="hbar-list"
  >
    <div
      v-for="r in rows"
      :key="r.key"
      class="hbar-block"
    >
      <div class="hbar-block-title hbar-block-title--clip">
        {{ r.title }}
      </div>
      <v-tooltip
        location="top"
        transition="fade-transition"
        content-class="analytics-tt-wrap"
        :close-delay="80"
      >
        <template #activator="{ props: tipProps }">
          <div
            v-bind="tipProps"
            class="hbar-pair hbar-pair--interactive"
            tabindex="0"
            role="img"
            :aria-label="ariaBar(r)"
          >
            <div class="hbar-mini">
              <span class="hbar-mini-hint">ожид.</span>
              <div class="hbar-track">
                <div
                  class="hbar-fill hbar-fill--exp"
                  :style="{ width: barPct(r.plan, chartMax) + '%' }"
                />
              </div>
            </div>
            <div class="hbar-mini">
              <span class="hbar-mini-hint">загр.</span>
              <div class="hbar-track">
                <div
                  class="hbar-fill hbar-fill--up"
                  :style="{ width: barPct(r.uploaded, chartMax) + '%' }"
                />
              </div>
            </div>
          </div>
        </template>
        <div class="analytics-tt">
          <div class="analytics-tt__title">{{ r.title }}</div>
          <div class="analytics-tt__rows">
            <div class="analytics-tt__row">
              <span class="analytics-tt__dot analytics-tt__dot--plan" />
              <span class="analytics-tt__k">Ожидается</span>
              <span class="analytics-tt__v">{{ r.plan }}</span>
            </div>
            <div class="analytics-tt__row">
              <span class="analytics-tt__dot analytics-tt__dot--up" />
              <span class="analytics-tt__k">Загружено</span>
              <span class="analytics-tt__v analytics-tt__v--emph">
                {{ r.uploaded }}
              </span>
            </div>
            <div class="analytics-tt__row">
              <span class="analytics-tt__dot analytics-tt__dot--up" />
              <span class="analytics-tt__k">Из них в Moodle</span>
              <span class="analytics-tt__v">{{ r.moodle ?? 0 }}</span>
            </div>
          </div>
          <div class="analytics-tt__foot">{{ progressLine(r) }}</div>
        </div>
      </v-tooltip>
      <div class="hbar-inline-nums">{{ r.uploaded }} из {{ r.plan }}</div>
      <div class="hbar-inline-moodle">Из них в Moodle: {{ r.moodle ?? 0 }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { HBarRow } from '../../model';
  import '../../styles/analytics-tooltip-shared.css';

  const props = defineProps<{
    rows: HBarRow[];
  }>();

  const chartMax = computed(() => {
    let m = 1;
    for (const r of props.rows) {
      m = Math.max(m, r.plan, r.uploaded);
    }
    return m;
  });

  function barPct(value: number, max: number) {
    if (max <= 0) return 0;
    return Math.min(100, (value / max) * 100);
  }

  function progressPct(uploaded: number, plan: number) {
    if (!plan || plan <= 0) return 0;
    return Math.min(100, Math.round((uploaded / plan) * 100));
  }

  function progressLine(r: HBarRow) {
    const p = progressPct(r.uploaded, r.plan);
    return `Загружено ${r.uploaded} из ${r.plan} · ${p}%`;
  }

  function ariaBar(r: HBarRow) {
    return `${r.title}: загружено ${r.uploaded} из ${r.plan}`;
  }
</script>

<style scoped>
  .hbar-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }
  .hbar-block {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    align-items: start;
  }
  .hbar-block-title {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    grid-column: 1 / -1;
  }
  .hbar-block-title--clip {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hbar-pair {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hbar-pair--interactive {
    cursor: default;
    padding: 6px 8px;
    margin: -6px -8px;
    border-radius: 10px;
    outline: none;
    transition: background 0.2s;
  }
  .hbar-pair--interactive:hover,
  .hbar-pair--interactive:focus-visible {
    background: rgba(99, 102, 241, 0.06);
  }
  .hbar-mini {
    display: grid;
    grid-template-columns: 44px 1fr;
    align-items: center;
    gap: 8px;
  }
  .hbar-mini-hint {
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .hbar-track {
    height: 10px;
    background: #f3f4f6;
    border-radius: 5px;
    overflow: hidden;
  }
  .hbar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.35s ease;
  }
  .hbar-fill--exp {
    background: #94a3b8;
  }
  .hbar-fill--up {
    background: #6366f1;
  }
  .hbar-pair--interactive:hover .hbar-fill--exp {
    filter: brightness(0.92);
  }
  .hbar-pair--interactive:hover .hbar-fill--up {
    filter: brightness(1.05);
  }
  .hbar-inline-nums {
    grid-column: 1 / -1;
    font-size: 12px;
    color: #6b7280;
    text-align: right;
  }
  .hbar-inline-moodle {
    grid-column: 1 / -1;
    font-size: 12px;
    color: #4f46e5;
    text-align: right;
    margin-top: -4px;
    font-weight: 600;
  }
</style>
