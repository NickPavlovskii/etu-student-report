<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    persistent
    transition="dialog-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6 pt-4 px-4">
        Отменить действие?
      </v-card-title>
      <v-card-text class="px-4 pb-2">
        Точно хотите отменить действие?
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Нет
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="$emit('confirm')"
        >
          Да, отменить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  loading: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();
</script>
