<template>
  <component
    v-if="variant === 'inline'"
    v-bind="attrsRest"
    :class="rootClasses"
    :style="mergedStyle"
    :disabled="disabled"
    :tabindex="clickable ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
    :aria-disabled="disabled || undefined"
    :aria-label="ariaLabel || undefined"
    :is="clickable ? 'button' : 'span'"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <v-icon
      v-if="showPrepend"
      class="etu-label-chip__icon etu-label-chip__icon--prepend"
      :icon="icons.prepend"
      :size="iconSize"
    />
    <span
      v-if="hasContent"
      class="etu-label-chip__text"
    >
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="showCounter"
      class="etu-label-chip__counter"
    >
      {{ counter }}
    </span>
    <v-icon
      v-if="showAppend"
      class="etu-label-chip__icon etu-label-chip__icon--append"
      :icon="icons.append"
      :size="iconSize"
    />
    <button
      v-if="closable && !disabled"
      class="etu-label-chip__close"
      type="button"
      tabindex="-1"
      :aria-label="closeAriaLabel"
      @click.stop="emit('close', $event)"
    >
      <v-icon
        icon="mdi-close"
        :size="closeIconSize"
      />
    </button>
  </component>
  <v-chip
    v-else
    v-bind="attrsRest"
    variant="flat"
    :size="chipSizeVuetify"
    :density="chipDensity"
    :disabled="disabled"
    :closable="closable"
    :class="rootClasses"
    :style="mergedStyle"
    :aria-label="ariaLabel || undefined"
    @click="handleClick"
    @click:close="emit('close', $event)"
  >
    <template
      v-if="showPrepend"
      #prepend
    >
      <v-icon
        class="etu-label-chip__icon etu-label-chip__icon--prepend"
        :icon="icons.prepend"
        :size="iconSize"
      />
    </template>

    <span class="etu-label-chip__inner">
      <span
        v-if="hasContent"
        class="etu-label-chip__text"
      >
        <slot>{{ label }}</slot>
      </span>
      <span
        v-if="showCounter"
        class="etu-label-chip__counter"
      >
        {{ counter }}
      </span>
    </span>

    <template
      v-if="showAppend"
      #append
    >
      <v-icon
        class="etu-label-chip__icon etu-label-chip__icon--append"
        :icon="icons.append"
        :size="iconSize"
      />
    </template>
  </v-chip>
</template>

<script setup lang="ts">
  import { computed, useAttrs, useSlots, type CSSProperties } from 'vue';

  defineOptions({
    name: 'EtuLabelChip',
    inheritAttrs: false,
  });

  export type EtuLabelChipPreset =
    | 'blue'
    | 'green'
    | 'orange'
    | 'red'
    | 'purple'
    | 'gray'
    | 'teal'
    | 'pink'
    | 'yellow'
    | 'indigo';

  export type EtuLabelChipSize = 'xs' | 'sm' | 'md' | 'lg';
  export type EtuLabelChipVariant = 'inline' | 'chip';
  export type EtuLabelChipShape = 'pill' | 'rounded' | 'square';

  export interface EtuLabelChipProps {
    label?: string;
    icon?: string;
    iconPosition?: 'left' | 'right' | 'none';
    prependIcon?: string;
    appendIcon?: string;
    iconSize?: string | number;
    variant?: EtuLabelChipVariant;
    preset?: EtuLabelChipPreset | '';
    size?: EtuLabelChipSize;
    shape?: EtuLabelChipShape;
    counter?: number | string;
    closable?: boolean;
    disabled?: boolean;
    clickable?: boolean;
    dot?: boolean;
    dotColor?: string;
    outlined?: boolean;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string | number;
    ariaLabel?: string;
    closeAriaLabel?: string;
    rootClass?: string | string[] | Record<string, boolean>;
  }

  const props = withDefaults(defineProps<EtuLabelChipProps>(), {
    label: '',
    icon: '',
    iconPosition: 'left',
    prependIcon: '',
    appendIcon: '',
    iconSize: undefined,
    variant: 'inline',
    preset: '',
    size: 'sm',
    shape: 'pill',
    counter: undefined,
    closable: false,
    disabled: false,
    clickable: false,
    dot: false,
    dotColor: '',
    outlined: false,
    bgColor: '',
    textColor: '',
    borderColor: '',
    borderRadius: '',
    padding: '',
    fontSize: '',
    fontWeight: '',
    ariaLabel: '',
    closeAriaLabel: 'Закрыть',
    rootClass: '',
  });

  const emit = defineEmits<{
    (e: 'click', event: MouseEvent | KeyboardEvent): void;
    (e: 'close', event: MouseEvent): void;
  }>();

  const attrs = useAttrs();
  const slots = useSlots();

  const attrsRest = computed(() => {
    const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>;
    return rest;
  });

  /** Иконки слева/справа в зависимости от `iconPosition` */
  const icons = computed(() => {
    const { iconPosition, icon, prependIcon, appendIcon } = props;
    if (iconPosition === 'none') {
      return { prepend: '', append: appendIcon || '' };
    }
    if (iconPosition === 'right') {
      return {
        prepend: prependIcon || '',
        append: appendIcon || icon || '',
      };
    }
    return {
      prepend: prependIcon || icon || '',
      append: appendIcon || '',
    };
  });

  const showPrepend = computed(() => !!icons.value.prepend.trim());
  const showAppend = computed(() => !!icons.value.append.trim());

  const SIZE = {
    xs: { icon: 10, close: 10, chip: 'x-small' as const },
    sm: { icon: 13, close: 12, chip: 'small' as const },
    md: { icon: 16, close: 14, chip: 'default' as const },
    lg: { icon: 18, close: 16, chip: 'large' as const },
  } satisfies Record<
    EtuLabelChipSize,
    { icon: number; close: number; chip: string }
  >;

  const iconSize = computed(
    () => props.iconSize ?? SIZE[props.size].icon
  );
  const closeIconSize = computed(() => SIZE[props.size].close);
  const chipSizeVuetify = computed(() => SIZE[props.size].chip);
  const chipDensity = computed<'compact' | 'comfortable'>(() =>
    props.size === 'xs' ? 'compact' : 'comfortable'
  );

  const hasContent = computed(
    () => !!slots.default || !!props.label?.trim()
  );
  const showCounter = computed(
    () => props.counter != null && props.counter !== ''
  );

  const SHAPE_RADIUS: Record<EtuLabelChipShape, string> = {
    pill: '999px',
    rounded: '6px',
    square: '2px',
  };

  const rootClasses = computed(() => [
    'etu-label-chip',
    `etu-label-chip--${props.variant}`,
    `etu-label-chip--size-${props.size}`,
    `etu-label-chip--shape-${props.shape}`,
    props.preset ? `etu-label-chip--preset-${props.preset}` : undefined,
    props.outlined ? 'etu-label-chip--outlined' : undefined,
    props.disabled ? 'etu-label-chip--disabled' : undefined,
    props.clickable ? 'etu-label-chip--clickable' : undefined,
    props.closable ? 'etu-label-chip--closable' : undefined,
    props.dot ? 'etu-label-chip--dot' : undefined,
    attrs.class,
    props.rootClass,
  ]);

  const mergedStyle = computed((): CSSProperties | undefined => {
    const p = props;
    const s: Record<string, string> = {};

    if (p.bgColor) {
      if (p.outlined) {
        s.borderColor = p.bgColor;
        s.backgroundColor = 'transparent';
      } else {
        s.backgroundColor = p.bgColor;
      }
    }
    if (p.textColor) s.color = p.textColor;
    if (p.borderColor) s.borderColor = p.borderColor;
    s.borderRadius = p.borderRadius || SHAPE_RADIUS[p.shape];
    if (p.padding) s.padding = p.padding;
    if (p.fontSize) s.fontSize = p.fontSize;
    if (p.fontWeight !== '' && p.fontWeight !== undefined) {
      s.fontWeight = String(p.fontWeight);
    }
    if (p.dot && p.dotColor) {
      s['--_etu-chip-dot'] = p.dotColor;
    }

    return Object.keys(s).length ? (s as CSSProperties) : undefined;
  });

  function handleClick(event: MouseEvent | KeyboardEvent) {
    if (!props.disabled && props.clickable) {
      emit('click', event);
    }
  }
</script>

<style scoped>
  .etu-label-chip {
    --_etu-chip-dot: currentColor;
    --_etu-chip-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .etu-label-chip--size-xs {
    --_etu-chip-font: 10px;
    --_etu-chip-pad-y: 2px;
    --_etu-chip-pad-x: 6px;
    --_etu-chip-gap: 3px;
    --_etu-chip-min-h: 18px;
  }
  .etu-label-chip--size-sm {
    --_etu-chip-font: 12px;
    --_etu-chip-pad-y: 4px;
    --_etu-chip-pad-x: 10px;
    --_etu-chip-gap: 5px;
    --_etu-chip-min-h: 24px;
  }
  .etu-label-chip--size-md {
    --_etu-chip-font: 13px;
    --_etu-chip-pad-y: 6px;
    --_etu-chip-pad-x: 14px;
    --_etu-chip-gap: 6px;
    --_etu-chip-min-h: 30px;
  }
  .etu-label-chip--size-lg {
    --_etu-chip-font: 14px;
    --_etu-chip-pad-y: 8px;
    --_etu-chip-pad-x: 18px;
    --_etu-chip-gap: 8px;
    --_etu-chip-min-h: 36px;
  }

  .etu-label-chip--inline {
    display: inline-flex;
    align-items: center;
    gap: var(--_etu-chip-gap);
    padding: var(--_etu-chip-pad-y) var(--_etu-chip-pad-x);
    font-size: var(--_etu-chip-font);
    font-weight: 600;
    white-space: nowrap;
    line-height: 1.25;
    letter-spacing: 0.01em;
    box-sizing: border-box;
    vertical-align: middle;
    border: 1px solid transparent;
    min-height: var(--_etu-chip-min-h);
    transition:
      background-color var(--_etu-chip-transition),
      color var(--_etu-chip-transition),
      box-shadow var(--_etu-chip-transition),
      opacity var(--_etu-chip-transition);
    background: none;
    cursor: default;
    font-family: inherit;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .etu-label-chip--chip {
    display: inline-flex !important;
    align-items: center !important;
    height: auto !important;
    min-height: var(--_etu-chip-min-h) !important;
    font-size: var(--_etu-chip-font) !important;
    font-weight: 600 !important;
    letter-spacing: 0.01em;
    padding: var(--_etu-chip-pad-y) var(--_etu-chip-pad-x) !important;
    transition:
      background-color var(--_etu-chip-transition),
      color var(--_etu-chip-transition),
      box-shadow var(--_etu-chip-transition);
  }

  .etu-label-chip__inner {
    display: inline-flex;
    align-items: center;
    gap: var(--_etu-chip-gap);
  }

  .etu-label-chip__text {
    line-height: 1.3;
  }

  .etu-label-chip__icon {
    color: inherit !important;
    opacity: 0.85;
    flex-shrink: 0;
    transition: opacity var(--_etu-chip-transition);
  }

  .etu-label-chip__counter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25em;
    padding: 0 0.4em;
    border-radius: 999px;
    font-size: 0.85em;
    font-weight: 700;
    line-height: 1.35;
    background: rgba(0, 0, 0, 0.12);
    color: inherit;
  }

  .etu-label-chip__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 2px;
    padding: 1px;
    border: none;
    background: transparent;
    color: inherit;
    opacity: 0.55;
    cursor: pointer;
    border-radius: 50%;
    transition:
      opacity var(--_etu-chip-transition),
      background-color var(--_etu-chip-transition);
    outline: none;
  }
  .etu-label-chip__close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.08);
  }
  .etu-label-chip__close:focus-visible {
    opacity: 1;
    box-shadow: 0 0 0 2px currentColor;
  }

  .etu-label-chip--dot .etu-label-chip__text::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--_etu-chip-dot);
    margin-right: var(--_etu-chip-gap);
    vertical-align: middle;
    flex-shrink: 0;
  }
  .etu-label-chip--size-lg.etu-label-chip--dot .etu-label-chip__text::before {
    width: 8px;
    height: 8px;
  }

  .etu-label-chip--clickable {
    cursor: pointer;
    user-select: none;
  }
  .etu-label-chip--clickable:hover {
    filter: brightness(0.96);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .etu-label-chip--clickable:active {
    filter: brightness(0.92);
    transform: scale(0.97);
  }
  .etu-label-chip--clickable:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .etu-label-chip--disabled {
    opacity: 0.45;
    pointer-events: none;
    cursor: not-allowed;
  }

  .etu-label-chip--outlined {
    background: transparent !important;
    border: 1px solid currentColor !important;
    box-shadow: none !important;
  }

  .etu-label-chip--preset-blue {
    background: #eff6ff;
    color: #1e40af;
    border-color: rgba(37, 99, 235, 0.22);
    box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
  }
  .etu-label-chip--preset-green {
    background: #f0fdf4;
    color: #166534;
    border-color: rgba(22, 101, 52, 0.22);
    box-shadow: inset 0 0 0 1px rgba(22, 101, 52, 0.08);
  }
  .etu-label-chip--preset-orange {
    background: #fff7ed;
    color: #9a3412;
    border-color: rgba(154, 52, 18, 0.22);
    box-shadow: inset 0 0 0 1px rgba(154, 52, 18, 0.08);
  }
  .etu-label-chip--preset-red {
    background: #fef2f2;
    color: #991b1b;
    border-color: rgba(153, 27, 27, 0.22);
    box-shadow: inset 0 0 0 1px rgba(153, 27, 27, 0.08);
  }
  .etu-label-chip--preset-purple {
    background: #faf5ff;
    color: #5b21b6;
    border-color: rgba(91, 33, 182, 0.22);
    box-shadow: inset 0 0 0 1px rgba(91, 33, 182, 0.08);
  }
  .etu-label-chip--preset-gray {
    background: #f9fafb;
    color: #374151;
    border-color: rgba(55, 65, 81, 0.15);
    box-shadow: inset 0 0 0 1px rgba(55, 65, 81, 0.05);
  }
  .etu-label-chip--preset-teal {
    background: #f0fdfa;
    color: #115e59;
    border-color: rgba(17, 94, 89, 0.22);
    box-shadow: inset 0 0 0 1px rgba(17, 94, 89, 0.08);
  }
  .etu-label-chip--preset-pink {
    background: #fdf2f8;
    color: #9d174d;
    border-color: rgba(157, 23, 77, 0.22);
    box-shadow: inset 0 0 0 1px rgba(157, 23, 77, 0.08);
  }
  .etu-label-chip--preset-yellow {
    background: #fefce8;
    color: #854d0e;
    border-color: rgba(133, 77, 14, 0.22);
    box-shadow: inset 0 0 0 1px rgba(133, 77, 14, 0.08);
  }
  .etu-label-chip--preset-indigo {
    background: #eef2ff;
    color: #3730a3;
    border-color: rgba(55, 48, 163, 0.22);
    box-shadow: inset 0 0 0 1px rgba(55, 48, 163, 0.08);
  }

  .etu-label-chip--shape-pill {
    border-radius: 999px !important;
  }
  .etu-label-chip--shape-rounded {
    border-radius: 6px !important;
  }
  .etu-label-chip--shape-square {
    border-radius: 2px !important;
  }
</style>
