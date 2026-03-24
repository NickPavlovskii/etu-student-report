<template>
  <v-btn
    class="etu-btn"
    :variant="border ? 'outlined' : 'flat'"
    @click="$emit('click', $event)"
  >
    <template
      v-if="prependIcon && !$slots.prepend"
      #prepend
    >
      <img
        alt="icon"
        class="icon icon--prepend"
        :src="prependIcon"
      />
    </template>

    <slot>{{ title }}</slot>

    <template
      v-if="appendIcon && !$slots.append"
      #append
    >
      <img
        alt="icon"
        class="icon icon--append"
        :src="appendIcon"
      />
    </template>
  </v-btn>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title?: string;
      prependIcon?: string;
      appendIcon?: string;
      bgColor?: string;
      color?: string;
      borderColor?: string;
      width?: string | number;
      border?: boolean;
    }>(),
    {
      title: '',
      prependIcon: '',
      appendIcon: '',
      bgColor: 'white',
      color: 'black',
      borderColor: '#E7E7E7',
      width: '100%',
      border: true,
    }
  );

  defineEmits<{
    (e: 'click', ev: MouseEvent): void;
  }>();
</script>

<style scoped lang="scss">
  .etu-btn {
    text-transform: none;
    border-radius: 10px;
    font-weight: 500;

    border-color: v-bind(borderColor);
    background-color: v-bind(bgColor);
    color: v-bind(color);
    width: v-bind(width);

    .icon {
      &--prepend {
        margin-right: 8px;
      }
      &--append {
        margin-left: 8px;
      }
    }
  }
</style>
