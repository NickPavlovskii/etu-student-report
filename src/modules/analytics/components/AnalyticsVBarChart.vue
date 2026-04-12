<template>
  <div
    v-if="items.length"
    class="vbar-root"
  >
    <div class="vbar-legend">
      <span class="vbar-legend-item">
        <i class="dot dot--plan" />
        Ожидается
      </span>
      <span class="vbar-legend-item">
        <i class="dot dot--up" />
        Загружено
      </span>
    </div>
    <div
      class="vbar-scroll"
      :style="{ '--vbar-cols': String(items.length) }"
    >
      <div
        class="vbar-chart"
        :style="{ minHeight: chartMinHeightPx }"
      >
        <div
          v-for="(it, idx) in items"
          class="vbar-col"
          :key="idx + it.label"
        >
          <v-tooltip
            location="top"
            transition="fade-transition"
            content-class="analytics-tt-wrap"
            :close-delay="80"
          >
            <template #activator="{ props: tipProps }">
              <div
                v-bind="tipProps"
                class="vbar-col__hit"
                tabindex="0"
                role="img"
                :aria-label="ariaCol(it)"
              >
                <div
                  class="vbar-pair"
                  :style="{ height: chartHeightPx }"
                >
                  <div class="vbar-tip">
                    <div
                      class="vbar vbar--plan"
                      :style="{ height: barHeight(it.plan) }"
                    />
                    <div
                      class="vbar vbar--up"
                      :style="{ height: barHeight(it.uploaded) }"
                    />
                  </div>
                </div>
              </div>
            </template>
            <div class="analytics-tt">
              <div class="analytics-tt__title">{{ it.label }}</div>
              <div class="analytics-tt__rows">
                <div class="analytics-tt__row">
                  <span class="analytics-tt__dot analytics-tt__dot--plan" />
                  <span class="analytics-tt__k">Ожидается</span>
                  <span class="analytics-tt__v">{{ it.plan }}</span>
                </div>
                <div class="analytics-tt__row">
                  <span class="analytics-tt__dot analytics-tt__dot--up" />
                  <span class="analytics-tt__k">Загружено</span>
                  <span class="analytics-tt__v analytics-tt__v--emph">
                    {{ it.uploaded }}
                  </span>
                </div>
              </div>
              <div class="analytics-tt__foot">{{ progressLine(it) }}</div>
            </div>
          </v-tooltip>
          <div class="vbar-label-block">
            <div
              class="vbar-label"
              :title="it.label"
            >
              {{ it.shortLabel }}
            </div>
            <div
              class="vbar-ratio"
              :title="`${it.uploaded} из ${it.plan} загружено`"
            >
              {{ it.uploaded }} из {{ it.plan }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p
    v-else
    class="vbar-empty"
  >
    Нет данных
  </p>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { VBarItem } from '../model';
  import '../analyticsTooltipShared.css';

  const props = withDefaults(
    defineProps<{
      items: VBarItem[];
      chartHeight?: number;
    }>(),
    { chartHeight: 200 }
  );

  const chartHeightPx = computed(() => `${props.chartHeight}px`);
  const chartMinHeightPx = computed(() => `${props.chartHeight + 56}px`);

  const maxVal = computed(() => {
    let m = 1;
    for (const it of props.items) {
      m = Math.max(m, it.plan, it.uploaded);
    }
    return m;
  });

  function barHeight(n: number) {
    const pct = maxVal.value <= 0 ? 0 : Math.min(100, (n / maxVal.value) * 100);
    return `${(pct / 100) * props.chartHeight}px`;
  }

  function progressPct(uploaded: number, plan: number) {
    if (!plan || plan <= 0) return 0;
    return Math.min(100, Math.round((uploaded / plan) * 100));
  }

  function progressLine(it: VBarItem) {
    const p = progressPct(it.uploaded, it.plan);
    return `Загружено ${it.uploaded} из ${it.plan} · ${p}%`;
  }

  function ariaCol(it: VBarItem) {
    return `${it.label}: загружено ${it.uploaded} из ${it.plan}`;
  }
</script>

<style scoped>
  .vbar-root {
    width: 100%;
  }
  .vbar-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #6b7280;
  }
  .vbar-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .dot--plan {
    background: #d1d5db;
  }
  .dot--up {
    background: #6366f1;
  }
  .vbar-scroll {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }

  .vbar-chart {
    display: flex;
    align-items: flex-end;
    gap: clamp(4px, 1.2vw, 12px);
    width: max(100%, calc(var(--vbar-cols, 1) * 48px));
    min-width: max(100%, calc(var(--vbar-cols, 1) * 48px));
    max-width: none;
    padding: 8px 4px 6px;
    border-bottom: 2px solid #e8ecf1;
    border-radius: 0 0 4px 4px;
    box-sizing: border-box;
  }
  .vbar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1 1 48px;
    min-width: 0;
    max-width: none;
  }
  .vbar-col__hit {
    width: 100%;
    display: flex;
    justify-content: center;
    cursor: default;
    border-radius: 10px;
    padding: 4px 6px 2px;
    margin: -4px -6px 0;
    outline: none;
    transition: background 0.2s;
  }
  .vbar-col__hit:hover,
  .vbar-col__hit:focus-visible {
    background: rgba(99, 102, 241, 0.07);
  }
  .vbar-pair {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  .vbar-tip {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(3px, 0.5vw, 8px);
    height: 100%;
    width: 100%;
    max-width: min(100%, clamp(56px, 55%, 120px));
    margin: 0 auto;
    padding: 0 2px;
    box-sizing: border-box;
  }
  .vbar {
    flex: 1 1 0;
    min-width: 8px;
    max-width: none;
    min-height: 3px;
    border-radius: 5px 5px 3px 3px;
    transition:
      height 0.35s ease,
      filter 0.2s,
      transform 0.2s;
  }
  .vbar--plan {
    background: linear-gradient(180deg, #e5e7eb, #cbd5e1);
  }
  .vbar--up {
    background: linear-gradient(180deg, #818cf8, #6366f1);
    opacity: 0.96;
  }
  .vbar-col__hit:hover .vbar--plan {
    filter: brightness(0.94);
    transform: scaleX(1.06);
  }
  .vbar-col__hit:hover .vbar--up {
    filter: brightness(1.06);
    transform: scaleX(1.06);
  }
  .vbar-label-block {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .vbar-label {
    font-size: 11px;
    line-height: 1.25;
    color: #6b7280;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    word-break: break-word;
    transform: rotate(-18deg);
    transform-origin: center top;
    min-height: 2.8em;
  }
  .vbar-ratio {
    font-size: 10px;
    font-weight: 600;
    color: #4f46e5;
    font-variant-numeric: tabular-nums;
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vbar-empty {
    margin: 12px 0 0;
    color: #9ca3af;
    font-size: 14px;
  }
</style>
