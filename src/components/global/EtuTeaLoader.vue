<template>
  <!-- Режим оверлея (вкладки админки и т.п.) -->
  <Transition
    v-if="overlay"
    name="etu-tea-overlay-fade"
  >
    <div
      v-if="loading"
      class="etu-tea-loader-overlay"
    >
      <div class="etu-tea-loader-overlay__inner">
        <div class="etu-tea-loader-overlay__tea">
          <div
            class="etu-tea-loader etu-tea-loader--compact"
            v-html="teaSvg"
          />
        </div>
        <span
          v-if="label"
          class="etu-tea-loader-overlay__label"
        >
          {{ label }}
        </span>
      </div>
    </div>
  </Transition>

  <!-- Обычный режим: только анимация чашки (страницы загрузки и т.д.) -->
  <div
    v-else
    class="etu-tea-loader"
    v-html="teaSvg"
  />
</template>

<script setup lang="ts">
  import teaSvg from '@/assets/icons/tea.svg?raw';

  withDefaults(
    defineProps<{
      /** Полупрозрачный слой на весь контейнер (нужен `position: relative` у родителя) */
      overlay?: boolean;
      /** Для `overlay`: показать оверлей */
      loading?: boolean;
      /** Для `overlay`: подпись под чашкой */
      label?: string;
    }>(),
    {
      overlay: false,
      loading: false,
    }
  );
</script>

<style scoped>
  /* ── Общая анимация SVG ── */
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

  /* Компактный вид внутри оверлея */
  .etu-tea-loader--compact {
    padding: 0;
  }

  .etu-tea-loader--compact :deep(svg) {
    width: 48px;
    height: auto;
    margin-left: 0;
  }

  @keyframes etu-tea-swing {
    0% {
      transform: rotate(-6deg);
    }
    50% {
      transform: rotate(6deg);
    }
    100% {
      transform: rotate(-6deg);
    }
  }

  @keyframes etu-tea-steam {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }
    20% {
      opacity: 1;
    }
    60% {
      opacity: 0.5;
      transform: translateY(-6px);
    }
    100% {
      opacity: 0;
      transform: translateY(-12px);
    }
  }

  /* ── Оверлей ── */
  .etu-tea-loader-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(3px);
    border-radius: 14px;
    z-index: 10;
  }

  .etu-tea-loader-overlay__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .etu-tea-loader-overlay__label {
    font-size: 14px;
    color: #6b7280;
  }

  .etu-tea-overlay-fade-enter-active,
  .etu-tea-overlay-fade-leave-active {
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .etu-tea-overlay-fade-enter-from,
  .etu-tea-overlay-fade-leave-to {
    opacity: 0;
  }
</style>
