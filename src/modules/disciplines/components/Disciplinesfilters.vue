<template>
  <v-card
    class="filters"
    elevation="0"
  >
    <el-input
      class="search"
      placeholder="Поиск по названию дисциплины..."
      clearable
      :model-value="search"
      :prefix-icon="Search"
      @update:model-value="$emit('update:search', $event)"
    />
    <el-select
      class="semester-select"
      multiple
      clearable
      collapse-tags
      placeholder="Все семестры"
      popper-class="custom-header"
      :model-value="semester"
      :max-collapse-tags="1"
      @update:model-value="$emit('update:semester', $event)"
    >
      <template #header>
        <el-checkbox
          :model-value="checkAll"
          :indeterminate="indeterminate"
          @change="$emit('check-all', $event)"
        >
          Все семестры
        </el-checkbox>
      </template>
      <template #tag>
        <el-tag
          v-if="isAllSelected"
          closable
          @close="$emit('clear-all')"
        >
          Все семестры
        </el-tag>
      </template>
      <el-option
        v-for="s in uniqueSemesters"
        :key="s"
        :label="`Семестр ${s}`"
        :value="s"
      />
    </el-select>
  </v-card>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';

defineProps({
  search: { type: String, default: '' },
  semester: { type: Array, default: () => [] },
  uniqueSemesters: { type: Array, default: () => [] },
  checkAll: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  isAllSelected: { type: Boolean, default: false },
});

defineEmits(['update:search', 'update:semester', 'check-all', 'clear-all']);
</script>

<style scoped>
.filters {
  display: flex;
  gap: 12px;
  padding: 18px 24px;
  margin: 0 0 18px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}
.search {
  flex: 1;
}
.semester-select {
  width: 240px;
}
</style>
