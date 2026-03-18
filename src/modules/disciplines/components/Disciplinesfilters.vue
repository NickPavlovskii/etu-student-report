<template>
  <v-card
    class="filters"
    elevation="0"
  >
    <div class="filters-row">
      <div class="search-bar-wrap">
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
      </div>
    </div>
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
  padding: 18px 22px 20px;
  margin: 0 0 20px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-bar-wrap {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 280px;
  border-radius: 10px;
  border: 1px solid #e8eaed;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.search {
  flex: 1;
  min-width: 0;
}

.search :deep(.el-input__wrapper) {
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: transparent;
}

.semester-select {
  width: 200px;
  flex-shrink: 0;
}

.semester-select :deep(.el-input__wrapper) {
  border-radius: 0;
  border: none;
  border-left: 1px solid #e5e7eb;
  box-shadow: none;
  background: transparent;
}

.semester-select :deep(.el-input__inner),
.semester-select :deep(.el-select__placeholder) {
  color: rgb(37, 99, 235);
  font-weight: 500;
}
</style>
